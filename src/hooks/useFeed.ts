'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { getRootStoriesClient } from '@/lib/stories'
import type { Story } from '@/types'

export type SortType = 'recent' | 'popular' | 'trending'
export type FeedType = 'all' | 'following'

const STORIES_PER_PAGE = 10
const LOAD_MORE_DEBOUNCE_MS = 500

export function useFeed(feedType: FeedType = 'all') {
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState<SortType>('recent')
  const lastLoadMoreRef = useRef<number>(0)

  const loadFeed = useCallback(
    async (pageNum: number, sort: SortType, type: FeedType) => {
      try {
        setLoading(true)
        setError(null)

        let storiesData: Story[] = []
        let totalPages = 0

        if (type === 'following') {
          // Fetch from following feed API
          const response = await fetch(`/api/feed/following?page=${pageNum}&limit=${STORIES_PER_PAGE}`)
          if (!response.ok) {
            throw new Error('Failed to fetch following feed')
          }
          const data = await response.json()
          storiesData = data.stories || []
          totalPages = data.pagination?.totalPages || 0
        } else {
          // Fetch from all stories
          const offset = (pageNum - 1) * STORIES_PER_PAGE
          storiesData = await getRootStoriesClient(STORIES_PER_PAGE, offset, sort)
        }

        if (pageNum === 1) {
          setStories(storiesData)
        } else {
          setStories((prev) => [...prev, ...storiesData])
        }

        setHasMore(type === 'following' ? pageNum < totalPages : storiesData.length === STORIES_PER_PAGE)
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
    loadFeed(1, sortBy, feedType)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy, feedType])

  const loadMore = useCallback(() => {
    const now = Date.now()
    if (now - lastLoadMoreRef.current < LOAD_MORE_DEBOUNCE_MS) return
    lastLoadMoreRef.current = now

    if (!loading && hasMore) {
      const nextPage = page + 1
      loadFeed(nextPage, sortBy, feedType)
      setPage(nextPage)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, hasMore, page, sortBy, feedType])

  return {
    stories,
    loading,
    error,
    hasMore,
    loadMore,
    sortBy,
    setSortBy,
  }
}

