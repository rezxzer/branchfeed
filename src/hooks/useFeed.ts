'use client'

import { useState, useEffect, useCallback } from 'react'
import { getRootStoriesClient } from '@/lib/stories'
import type { Story } from '@/types'

export type SortType = 'recent' | 'popular' | 'trending'

const STORIES_PER_PAGE = 10

export function useFeed() {
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState<SortType>('recent')

  const loadFeed = useCallback(
    async (pageNum: number, sort: SortType) => {
      try {
        setLoading(true)
        setError(null)

        const offset = (pageNum - 1) * STORIES_PER_PAGE
        const storiesData = await getRootStoriesClient(STORIES_PER_PAGE, offset, sort)

        if (pageNum === 1) {
          setStories(storiesData)
        } else {
          setStories((prev) => [...prev, ...storiesData])
        }

        setHasMore(storiesData.length === STORIES_PER_PAGE)
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
    loadFeed(1, sortBy)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy])

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = page + 1
      loadFeed(nextPage, sortBy)
      setPage(nextPage)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, hasMore, page, sortBy])

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

