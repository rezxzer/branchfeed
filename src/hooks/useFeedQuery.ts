'use client'

import { useState, useCallback, useRef } from 'react'
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { getRootStoriesClient } from '@/lib/stories'
import { queryKeys } from '@/lib/queryKeys'
import type { Story } from '@/types'

export type SortType = 'recent' | 'popular' | 'trending'
export type FeedType = 'all' | 'following'
export type TimeRange = '24h' | '7d' | '30d' | 'all'

const STORIES_PER_PAGE = 10

interface FeedQueryParams {
  feedType: FeedType
  sortBy: SortType
  timeRange: TimeRange
  tagId?: string
  authorId?: string
  dateRange?: {
    type: 'all' | '24h' | '7d' | '30d' | 'custom'
    startDate?: string
    endDate?: string
  }
  tagIds?: string[]
}

/**
 * Fetch feed data for a specific page
 */
async function fetchFeedPage({
  pageParam = 1,
  feedType,
  sortBy,
  timeRange,
  tagId,
  authorId,
  dateRange,
  tagIds,
}: FeedQueryParams & { pageParam?: number }): Promise<{
  stories: Story[]
  nextPage: number | null
  hasMore: boolean
}> {
  const pageNum = pageParam

  let storiesData: Story[] = []
  let totalPages = 0

  if (feedType === 'following') {
    // Fetch from following feed API
    const url = new URL('/api/feed/following', window.location.origin)
    url.searchParams.set('page', pageNum.toString())
    url.searchParams.set('limit', STORIES_PER_PAGE.toString())
    if (tagId) {
      url.searchParams.set('tagId', tagId)
    }
    const response = await fetch(url.toString())
    if (!response.ok) {
      throw new Error('Failed to fetch following feed')
    }
    const data = await response.json()
    storiesData = data.stories || []
    totalPages = data.pagination?.totalPages || 0
  } else if (sortBy === 'trending') {
    // Fetch from trending API
    const url = new URL('/api/feed/trending', window.location.origin)
    url.searchParams.set('page', pageNum.toString())
    url.searchParams.set('limit', STORIES_PER_PAGE.toString())
    url.searchParams.set('timeRange', timeRange)
    if (tagId) {
      url.searchParams.set('tagId', tagId)
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
    storiesData = await getRootStoriesClient(
      STORIES_PER_PAGE,
      offset,
      sortBy,
      tagId,
      authorId,
      dateRange,
      tagIds
    )
  }

  const hasMore =
    feedType === 'following' || sortBy === 'trending'
      ? pageNum < totalPages
      : storiesData.length === STORIES_PER_PAGE

  return {
    stories: storiesData,
    nextPage: hasMore ? pageNum + 1 : null,
    hasMore,
  }
}

/**
 * React Query-based feed hook with caching and background refetch
 * Maintains backward compatibility with original useFeed API
 */
export function useFeedQuery(
  feedType: FeedType = 'all',
  tagId?: string,
  advancedFilters?: {
    authorId?: string
    dateRange?: {
      type: 'all' | '24h' | '7d' | '30d' | 'custom'
      startDate?: string
      endDate?: string
    }
    tagIds?: string[]
  }
) {
  const queryClient = useQueryClient()
  const [sortBy, setSortBy] = useState<SortType>('recent')
  const [timeRange, setTimeRange] = useState<TimeRange>('7d')

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: queryKeys.feed.list(feedType, sortBy, timeRange, tagId, advancedFilters?.authorId, advancedFilters?.dateRange?.type, advancedFilters?.tagIds?.join(',')),
    queryFn: ({ pageParam = 1 }) =>
      fetchFeedPage({
        pageParam: pageParam as number,
        feedType,
        sortBy,
        timeRange,
        tagId,
        authorId: advancedFilters?.authorId,
        dateRange: advancedFilters?.dateRange,
        tagIds: advancedFilters?.tagIds,
      }),
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  })

  // Flatten all pages into a single stories array
  const stories = data?.pages.flatMap((page) => page.stories) ?? []

  // Prefetch next page
  const prefetchNextPage = useCallback(async () => {
    if (hasNextPage && !isFetchingNextPage) {
      await queryClient.prefetchInfiniteQuery({
        queryKey: queryKeys.feed.list(feedType, sortBy, timeRange, tagId, advancedFilters?.authorId, advancedFilters?.dateRange?.type, advancedFilters?.tagIds?.join(',')),
        queryFn: ({ pageParam = 1 }) =>
        fetchFeedPage({
          pageParam: pageParam as number,
          feedType,
          sortBy,
          timeRange,
          tagId,
          authorId: advancedFilters?.authorId,
          dateRange: advancedFilters?.dateRange,
          tagIds: advancedFilters?.tagIds,
        }),
        getNextPageParam: (lastPage: { stories: Story[]; nextPage: number | null; hasMore: boolean }) => lastPage.nextPage,
        initialPageParam: 1,
      })
    }
  }, [hasNextPage, isFetchingNextPage, feedType, sortBy, timeRange, tagId, advancedFilters, queryClient])

  // Load more with debounce
  const lastLoadMoreRef = useRef<number>(0)
  const LOAD_MORE_DEBOUNCE_MS = 500

  const loadMore = useCallback(() => {
    const now = Date.now()
    if (now - lastLoadMoreRef.current < LOAD_MORE_DEBOUNCE_MS) return
    lastLoadMoreRef.current = now

    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  return {
    stories,
    loading: isLoading || isFetching,
    error: error as Error | null,
    hasMore: hasNextPage ?? false,
    loadMore,
    prefetchNextPage,
    sortBy,
    setSortBy,
    timeRange,
    setTimeRange,
  }
}

