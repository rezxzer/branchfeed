'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { getRootStoriesClient } from '@/lib/stories'
import { logDebug } from '@/lib/logger'
import type { Story } from '@/types'

export type SortType = 'recent' | 'popular' | 'trending'
export type FeedType = 'all' | 'following'
export type TimeRange = '24h' | '7d' | '30d' | 'all'

const STORIES_PER_PAGE = 10
const LOAD_MORE_DEBOUNCE_MS = 500

export function useFeed(feedType: FeedType = 'all', tagId?: string) {
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState<SortType>('recent')
  const [timeRange, setTimeRange] = useState<TimeRange>('7d')
  const lastLoadMoreRef = useRef<number>(0)
  const prefetchedDataRef = useRef<Story[] | null>(null)
  const prefetchingRef = useRef<boolean>(false)

  const loadFeed = useCallback(
    async (pageNum: number, sort: SortType, type: FeedType, range: TimeRange, tag?: string) => {
      try {
        setLoading(true)
        setError(null)

        let storiesData: Story[] = []
        let totalPages = 0

        if (type === 'following') {
          // Fetch from following feed API
          const url = new URL('/api/feed/following', window.location.origin)
          url.searchParams.set('page', pageNum.toString())
          url.searchParams.set('limit', STORIES_PER_PAGE.toString())
          if (tag) {
            url.searchParams.set('tagId', tag)
          }
          const response = await fetch(url.toString())
          if (!response.ok) {
            throw new Error('Failed to fetch following feed')
          }
          const data = await response.json()
          storiesData = data.stories || []
          totalPages = data.pagination?.totalPages || 0
        } else if (sort === 'trending') {
          // Fetch from trending API
          const url = new URL('/api/feed/trending', window.location.origin)
          url.searchParams.set('page', pageNum.toString())
          url.searchParams.set('limit', STORIES_PER_PAGE.toString())
          url.searchParams.set('timeRange', range)
          if (tag) {
            url.searchParams.set('tagId', tag)
          }
          const response = await fetch(url.toString())
          if (!response.ok) {
            throw new Error('Failed to fetch trending stories')
          }
          const data = await response.json()
          storiesData = data.stories || []
          totalPages = data.pagination?.totalPages || 0
        } else {
          // Fetch from all stories
          const offset = (pageNum - 1) * STORIES_PER_PAGE
          storiesData = await getRootStoriesClient(STORIES_PER_PAGE, offset, sort, tag)
        }

        if (pageNum === 1) {
          setStories(storiesData)
        } else {
          setStories((prev) => [...prev, ...storiesData])
        }

        setHasMore(
          type === 'following' || sort === 'trending' 
            ? pageNum < totalPages 
            : storiesData.length === STORIES_PER_PAGE
        )
      } catch (err) {
        console.error('Error loading feed:', err)
        // Create proper Error object if err is not already an Error
        const error = err instanceof Error 
          ? err 
          : new Error(err ? String(err) : 'Unknown error occurred while loading feed')
        setError(error)
      } finally {
        setLoading(false)
      }
    },
    []
  )

  useEffect(() => {
    setPage(1)
    prefetchedDataRef.current = null // Clear prefetched data when filters change
    prefetchingRef.current = false // Reset prefetching flag
    loadFeed(1, sortBy, feedType, timeRange, tagId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy, feedType, timeRange, tagId])

  // Prefetch next page data in background (doesn't update UI)
  const prefetchNextPage = useCallback(async () => {
    if (prefetchingRef.current || !hasMore || loading) {
      return
    }

    const nextPage = page + 1
    prefetchingRef.current = true

    try {
      let storiesData: Story[] = []
      
      if (feedType === 'following') {
        const url = new URL('/api/feed/following', window.location.origin)
        url.searchParams.set('page', nextPage.toString())
        url.searchParams.set('limit', STORIES_PER_PAGE.toString())
        if (tagId) {
          url.searchParams.set('tagId', tagId)
        }
        const response = await fetch(url.toString())
        if (response.ok) {
          const data = await response.json()
          storiesData = data.stories || []
        }
      } else if (sortBy === 'trending') {
        const url = new URL('/api/feed/trending', window.location.origin)
        url.searchParams.set('page', nextPage.toString())
        url.searchParams.set('limit', STORIES_PER_PAGE.toString())
        url.searchParams.set('timeRange', timeRange)
        if (tagId) {
          url.searchParams.set('tagId', tagId)
        }
        const response = await fetch(url.toString())
        if (response.ok) {
          const data = await response.json()
          storiesData = data.stories || []
        }
      } else {
        const offset = (nextPage - 1) * STORIES_PER_PAGE
        storiesData = await getRootStoriesClient(STORIES_PER_PAGE, offset, sortBy, tagId)
      }

      // Store prefetched data
      if (storiesData.length > 0) {
        prefetchedDataRef.current = storiesData
      }
    } catch (err) {
      // Silently fail prefetch - it's optional
      logDebug('Prefetch failed (non-critical)', { error: err })
    } finally {
      prefetchingRef.current = false
    }
  }, [hasMore, loading, page, sortBy, feedType, timeRange, tagId])

  const loadMore = useCallback(() => {
    const now = Date.now()
    if (now - lastLoadMoreRef.current < LOAD_MORE_DEBOUNCE_MS) return
    lastLoadMoreRef.current = now

    if (!loading && hasMore) {
      // Check if we have prefetched data
      const prefetchedData = prefetchedDataRef.current
      if (prefetchedData && prefetchedData.length > 0) {
        // Use prefetched data immediately (instant load!)
        setStories((prev) => [...prev, ...prefetchedData])
        prefetchedDataRef.current = null
        
        const nextPage = page + 1
        setPage(nextPage)
        
        // Update hasMore based on prefetched data length
        setHasMore(
          feedType === 'following' || sortBy === 'trending'
            ? true // Will be updated by next fetch
            : prefetchedData.length === STORIES_PER_PAGE
        )
        
        // Note: Prefetch for next page will be triggered by IntersectionObserver
        // when user scrolls near the new "Load More" button
      } else {
        // Normal load (no prefetched data)
        const nextPage = page + 1
        loadFeed(nextPage, sortBy, feedType, timeRange, tagId)
        setPage(nextPage)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, hasMore, page, sortBy, feedType, timeRange, tagId, loadFeed])

  return {
    stories,
    loading,
    error,
    hasMore,
    loadMore,
    prefetchNextPage,
    sortBy,
    setSortBy,
    timeRange,
    setTimeRange,
  }
}

