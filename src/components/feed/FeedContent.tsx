'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from '@/hooks/useTranslation'
import { StoryCard } from './StoryCard'
import { AnimateOnScroll } from '@/components/ui/AnimateOnScroll'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Spinner } from '@/components/ui/Spinner'
import { Button } from '@/components/ui/Button'
import { StoryCardSkeleton } from './StoryCardSkeleton'
import { usePreloadNext } from '@/hooks/usePreloadNext'
import { usePlaylistMode } from '@/hooks/usePlaylistMode'
import { logDebug } from '@/lib/logger'
import type { Story } from '@/types'

interface FeedContentProps {
  stories: Story[]
  loading: boolean
  error: Error | null
  hasMore: boolean
  onLoadMore: () => void
  onPrefetch?: () => void
  /** Feed type (for empty state customization) */
  feedType?: 'all' | 'following'
}

export function FeedContent({
  stories,
  loading,
  error,
  hasMore,
  onLoadMore,
  onPrefetch,
  feedType = 'all',
}: FeedContentProps) {
  const router = useRouter()
  const { t } = useTranslation()
  const loadMoreButtonRef = useRef<HTMLDivElement>(null)
  const [visibleIndex, setVisibleIndex] = useState<number>(0)
  const [playlistModeEnabled, setPlaylistModeEnabled] = useState<boolean>(false)
  
  // Preload next video in feed
  const { preloadNext, preloadVideo } = usePreloadNext({
    stories,
    currentIndex: visibleIndex,
    preloadAhead: 1,
    preloadDistance: 500,
    enabled: true,
    onPreload: (target) => {
      // Optional: Log preload success
    },
  })
  
  // Track visible story index for preloading
  useEffect(() => {
    if (stories.length === 0) {
      return
    }

    const storyCards = document.querySelectorAll('[data-story-card]')
    if (storyCards.length === 0) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the most visible story card
        let maxIntersection = 0
        let mostVisibleIndex = 0

        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > maxIntersection) {
            maxIntersection = entry.intersectionRatio
            const index = Array.from(storyCards).indexOf(entry.target as Element)
            if (index !== -1) {
              mostVisibleIndex = index
            }
          }
        })

        if (maxIntersection > 0 && mostVisibleIndex !== visibleIndex) {
          setVisibleIndex(mostVisibleIndex)
          
          // Preload next video when a new video becomes visible
          const currentStory = stories[mostVisibleIndex]
          if (currentStory?.media_type === 'video') {
            preloadNext()
          }
        }
      },
      {
        threshold: [0, 0.25, 0.5, 0.75, 1.0],
        rootMargin: '200px', // Start detecting 200px before viewport
      }
    )

    storyCards.forEach((card) => {
      observer.observe(card)
    })

    return () => {
      observer.disconnect()
    }
  }, [stories, visibleIndex, preloadNext])

  // Infinite scroll: Auto-load more when user scrolls near bottom
  // Replaces "Load More" button with automatic loading
  useEffect(() => {
    if (!hasMore || loading || !loadMoreButtonRef.current) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        // Load more when sentinel element is visible (300px before viewport)
        if (entry.isIntersecting && !loading) {
          logDebug('Infinite scroll: Loading more stories')
          onLoadMore()
        }
      },
      {
        rootMargin: '300px', // Start loading 300px before sentinel is visible
        threshold: 0,
      }
    )

    observer.observe(loadMoreButtonRef.current)

    return () => {
      observer.disconnect()
    }
  }, [hasMore, loading, onLoadMore])

  // Playlist mode for auto-advance (must be called before early returns)
  const { handleVideoEnd: handlePlaylistVideoEnd } = usePlaylistMode({
    enabled: playlistModeEnabled,
    advanceDelay: 500,
    videosOnly: true,
    onAdvance: (currentIndex, nextIndex) => {
      // Will be defined below
    },
    onPlaylistEnd: () => {
      logDebug('Playlist ended - no more videos')
    },
  })

  // Navigate to next/previous video story
  const navigateToNextVideo = useCallback(() => {
    if (stories.length === 0) {
      return
    }

    // Find next video story starting from visibleIndex + 1
    for (let i = visibleIndex + 1; i < stories.length; i++) {
      if (stories[i].media_type === 'video') {
        const storyCard = document.querySelector(`[data-story-id="${stories[i].id}"]`) as HTMLElement
        if (storyCard) {
          storyCard.scrollIntoView({ behavior: 'smooth', block: 'center' })
          setVisibleIndex(i)
          return
        }
      }
    }
    
    // If no more videos found, try to load more
    if (hasMore && !loading) {
      onLoadMore()
    }
  }, [stories, visibleIndex, hasMore, loading, onLoadMore])

  const navigateToPreviousVideo = useCallback(() => {
    if (stories.length === 0) {
      return
    }

    // Find previous video story starting from visibleIndex - 1
    for (let i = visibleIndex - 1; i >= 0; i--) {
      if (stories[i].media_type === 'video') {
        const storyCard = document.querySelector(`[data-story-id="${stories[i].id}"]`) as HTMLElement
        if (storyCard) {
          storyCard.scrollIntoView({ behavior: 'smooth', block: 'center' })
          setVisibleIndex(i)
          return
        }
      }
    }
  }, [stories, visibleIndex])

  // Update playlist mode onAdvance callback
  useEffect(() => {
    if (playlistModeEnabled) {
      // This will be handled by the navigateToNextVideo callback
    }
  }, [playlistModeEnabled, navigateToNextVideo])

  if (error) {
    return (
      <ErrorState
        title={t('feed.errors.loadFailed')}
        message={t('feed.errors.tryAgain')}
        onRetry={onLoadMore}
      />
    )
  }

  if (loading && stories.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <StoryCardSkeleton key={index} />
        ))}
      </div>
    )
  }

  if (stories.length === 0) {
    // Custom empty state for following feed
    if (feedType === 'following') {
      return (
        <EmptyState
          icon="👥"
          title={t('feed.following.empty.title') || 'No stories from followed users'}
          description={t('feed.following.empty.description') || 'Start following users to see their stories here!'}
          actionLabel={t('feed.following.empty.action') || 'Discover Users'}
          onAction={() => router.push('/search?type=users')}
        />
      )
    }
    
    // Default empty state for all feed
    return (
      <EmptyState
        icon="📖"
        title={t('feed.empty.title')}
        description={t('feed.empty.description')}
        actionLabel={t('feed.empty.action')}
        onAction={() => router.push('/create')}
      />
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
        {stories.map((story, index) => (
          <AnimateOnScroll
            key={story.id}
            animation="fadeIn"
            delay={index * 50}
            duration={500}
            once={true}
          >
            <StoryCard
              story={story}
              isAboveFold={index < 3}
              onSwipeUp={navigateToNextVideo}
              onSwipeDown={navigateToPreviousVideo}
              onVideoEnd={() => {
                // Handle video end for playlist mode
                if (playlistModeEnabled && handlePlaylistVideoEnd) {
                  handlePlaylistVideoEnd(index)
                }
              }}
            />
          </AnimateOnScroll>
        ))}
      </div>

      {/* Infinite Scroll Sentinel - invisible element that triggers load more */}
      {hasMore && (
        <>
          <div
            ref={loadMoreButtonRef}
            className="h-1"
            aria-label="Loading more stories"
          />
          {/* Show skeleton loaders while loading more */}
          {loading && (
            <div className="mt-8 sm:mt-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
                {Array.from({ length: 3 }).map((_, index) => (
                  <StoryCardSkeleton key={`skeleton-${index}`} shimmer={true} delay={index * 100} />
                ))}
              </div>
              {/* Loading indicator */}
              <div className="flex items-center justify-center gap-2 text-gray-400 mt-4">
                <Spinner size="sm" />
                <span className="text-sm">{t('feed.loading') || 'Loading more stories...'}</span>
              </div>
            </div>
          )}
        </>
      )}
    </>
  )
}

