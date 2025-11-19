'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import { FeedControls } from './FeedControls'
import { FeedContent } from './FeedContent'
import { AdvancedFilters, type AdvancedFiltersState } from './AdvancedFilters'
import { FollowSuggestions } from './FollowSuggestions'
import { useFeedQuery } from '@/hooks/useFeedQuery'
import { useFeedRealtime } from '@/hooks/useFeedRealtime'
import { useTranslation } from '@/hooks/useTranslation'
import { useAuth } from '@/hooks/useAuth'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Button } from '@/components/ui/Button'
import { useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'
import { cn } from '@/lib/utils'
import { getTags } from '@/lib/tags'
import { logDebug } from '@/lib/logger'
import { createClientClient } from '@/lib/supabase/client'
import type { Tag, Story } from '@/types'

const RecommendedStories = dynamic(() => import('../recommendations/RecommendedStories').then(mod => ({ default: mod.RecommendedStories })), {
  ssr: false,
})

type FeedType = 'all' | 'following'

interface FeedPageClientProps {
  tagSlug?: string
}

export function FeedPageClient({ tagSlug }: FeedPageClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t } = useTranslation()
  const { user } = useAuth()
  const [feedType, setFeedType] = useState<FeedType>('all')
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null)
  const [tagLoading, setTagLoading] = useState(false)
  const [availableTags, setAvailableTags] = useState<Tag[]>([])
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [followingIds, setFollowingIds] = useState<string[]>([])
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFiltersState>({
    dateRange: { type: 'all' },
    tagIds: [],
    tagNames: [],
  })
  
  // Get tag from URL parameter
  const tagParam = tagSlug || searchParams.get('tag')
  
  // Load available tags for filters
  useEffect(() => {
    getTags()
      .then((tags) => {
        setAvailableTags(tags)
        // Also handle URL tag parameter
        if (tagParam) {
          const tag = tags.find((t) => t.slug === tagParam)
          setSelectedTag(tag || null)
        }
      })
      .catch((err) => {
        console.error('Error fetching tags:', err)
      })
  }, [tagParam])
  
  useEffect(() => {
    if (tagParam) {
      setTagLoading(true)
      getTags()
        .then((tags) => {
          const tag = tags.find((t) => t.slug === tagParam)
          setSelectedTag(tag || null)
        })
        .catch((err) => {
          console.error('Error fetching tag:', err)
        })
        .finally(() => {
          setTagLoading(false)
        })
    } else {
      setSelectedTag(null)
    }
  }, [tagParam])
  
  // Fetch following IDs for real-time updates
  useEffect(() => {
    if (feedType === 'following' && user) {
      const fetchFollowingIds = async () => {
        const supabase = createClientClient()
        if (!supabase) return

        const { data, error } = await supabase
          .from('followers')
          .select('following_id')
          .eq('follower_id', user.id)

        if (!error && data) {
          setFollowingIds(data.map((f: { following_id: string }) => f.following_id))
        }
      }

      fetchFollowingIds()
    } else {
      setFollowingIds([])
    }
  }, [feedType, user])
  
  // Use React Query-based feed hook for better caching
  const {
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
  } = useFeedQuery(feedType, selectedTag?.id, {
    authorId: advancedFilters.authorId,
    dateRange: advancedFilters.dateRange,
    tagIds: advancedFilters.tagIds.length > 0 ? advancedFilters.tagIds : undefined,
  })
  
  const queryClient = useQueryClient()
  
  const handleClearTag = () => {
    router.push('/feed')
  }

  // Real-time updates: Subscribe to new stories
  const handleStoryInserted = useCallback(
    (newStory: Story) => {
      logDebug('New story received via real-time', { storyId: newStory.id })
      
      // Only add if it matches current filters (sortBy, tag, etc.)
      // For now, add to top of feed (most recent)
      if (sortBy === 'recent' && !selectedTag) {
        // Invalidate and refetch to get updated list
        queryClient.invalidateQueries({
          queryKey: queryKeys.feed.list(feedType, sortBy, timeRange, undefined),
        })
      }
    },
    [sortBy, selectedTag, feedType, timeRange, queryClient]
  )

  const handleStoryUpdated = useCallback(
    (updatedStory: Story) => {
      logDebug('Story updated via real-time', { storyId: updatedStory.id })
      
      // Update story in React Query cache
      const tagId = selectedTag ? selectedTag.id : undefined
      queryClient.setQueryData<{ pages: Array<{ stories: Story[]; nextPage: number | null; hasMore: boolean }> }>(
        queryKeys.feed.list(feedType, sortBy, timeRange, tagId),
        (oldData) => {
          if (!oldData) return oldData
          
          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              stories: page.stories.map((story) =>
                story.id === updatedStory.id ? updatedStory : story
              ),
            })),
          }
        }
      )
    },
    [feedType, sortBy, timeRange, selectedTag, queryClient]
  )

  const handleStoryDeleted = useCallback(
    (storyId: string) => {
      logDebug('Story deleted via real-time', { storyId })
      
      // Remove story from React Query cache
      const tagId = selectedTag ? selectedTag.id : undefined
      queryClient.setQueryData<{ pages: Array<{ stories: Story[]; nextPage: number | null; hasMore: boolean }> }>(
        queryKeys.feed.list(feedType, sortBy, timeRange, tagId),
        (oldData) => {
          if (!oldData) return oldData
          
          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              stories: page.stories.filter((story) => story.id !== storyId),
            })),
          }
        }
      )
    },
    [feedType, sortBy, timeRange, selectedTag, queryClient]
  )

  // Subscribe to real-time updates
  // For 'all' feed: all recent stories
  // For 'following' feed: only stories from followed users
  const { isSubscribed } = useFeedRealtime({
    enabled: (feedType === 'all' && sortBy === 'recent') || (feedType === 'following' && sortBy === 'recent'),
    authorIds: feedType === 'following' && followingIds.length > 0 ? followingIds : undefined,
    onStoryInserted: handleStoryInserted,
    onStoryUpdated: handleStoryUpdated,
    onStoryDeleted: handleStoryDeleted,
    rootStoriesOnly: true,
  })

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6">
            {t('feed.title')}
          </h1>
          
          {/* Tag Filter */}
          {selectedTag && (
            <div className="mb-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Filtered by:</span>
                <span
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                  style={
                    selectedTag.color
                      ? {
                          backgroundColor: `${selectedTag.color}20`,
                          borderColor: `${selectedTag.color}50`,
                          color: selectedTag.color,
                          border: '1px solid',
                        }
                      : {
                          backgroundColor: '#374151',
                          color: '#fff',
                        }
                  }
                >
                  {selectedTag.name}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearTag}
                className="text-gray-400 hover:text-white"
              >
                Clear filter
              </Button>
            </div>
          )}
          
          {/* Feed Type Tabs */}
          <div className="flex gap-2 mb-4 sm:mb-6">
            <Button
              variant={feedType === 'all' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFeedType('all')}
              className={cn(
                feedType === 'all' ? '' : 'text-gray-300'
              )}
            >
              All
            </Button>
            <Button
              variant={feedType === 'following' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFeedType('following')}
              className={cn(
                feedType === 'following' ? '' : 'text-gray-300'
              )}
            >
              Following
            </Button>
          </div>
          
          {/* Recommended Stories (only for "All" feed) */}
          {feedType === 'all' && (
            <RecommendedStories limit={6} />
          )}

          {/* Follow Suggestions (only for "Following" feed when empty) */}
          {feedType === 'following' && stories.length === 0 && !loading && (
            <FollowSuggestions
              limit={5}
              onFollow={(userId: string) => {
                // Invalidate feed query to refresh following feed
                queryClient.invalidateQueries({
                  queryKey: queryKeys.feed.list(feedType, sortBy, timeRange, undefined),
                })
              }}
            />
          )}

          <FeedControls 
            sortBy={sortBy} 
            onSortChange={setSortBy}
            timeRange={timeRange}
            onTimeRangeChange={setTimeRange}
          />
          
          {/* Advanced Filters */}
          <AdvancedFilters
            filters={advancedFilters}
            onFiltersChange={setAdvancedFilters}
            availableTags={availableTags}
            isOpen={filtersOpen}
            onToggle={() => setFiltersOpen(!filtersOpen)}
          />

          <FeedContent
            stories={stories}
            loading={loading}
            error={error}
            hasMore={hasMore}
            onLoadMore={loadMore}
            onPrefetch={prefetchNextPage}
          />
        </div>
      </div>
    </ErrorBoundary>
  )
}

