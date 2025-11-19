'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useTranslation } from '@/hooks/useTranslation'
import { useAuth } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'
import { useBookmarks } from '@/hooks/useBookmarks'
import { logError, logWarn } from '@/lib/logger'
import { useInViewport } from '@/hooks/useInViewport'
import { useScrollSpeed } from '@/hooks/useScrollSpeed'
import { useBatterySaver } from '@/hooks/useBatterySaver'
import { useSwipeGestures } from '@/hooks/useSwipeGestures'
import { Card } from '@/components/ui/Card'
import { MediaDisplay } from '@/components/MediaDisplay'
import { ShareStoryButton } from '@/components/story/ShareStoryButton'
import { WatchLaterButton } from '@/components/story/WatchLaterButton'
import { StoryTags } from '@/components/story/StoryTags'
import { LinkRenderer } from '@/components/ui/LinkRenderer'
import { Button } from '@/components/ui/Button'
import { StoryPreviewTooltip } from './StoryPreviewTooltip'
import type { Story } from '@/types'
import Link from 'next/link'

interface StoryCardProps {
  story: Story
  /** Whether this is one of the first cards (above the fold) - for priority loading */
  isAboveFold?: boolean
  /** Callback when swipe up is detected (navigate to next video) */
  onSwipeUp?: () => void
  /** Callback when swipe down is detected (navigate to previous video) */
  onSwipeDown?: () => void
  /** Callback when video ends (for playlist mode) */
  onVideoEnd?: () => void
}

export function StoryCard({ story, isAboveFold = false, onSwipeUp, onSwipeDown, onVideoEnd }: StoryCardProps) {
  const router = useRouter()
  const { t } = useTranslation()
  const { isAuthenticated, user } = useAuth()
  const { profile } = useProfile(user?.id || '')
  const { isBookmarked, loading: bookmarkLoading, toggleBookmark } = useBookmarks(
    story.id,
    story.isBookmarked || false
  )
  
  // Viewport detection for video autoplay
  const cardRef = useRef<HTMLDivElement>(null)
  const { ref: viewportRef, isInViewport } = useInViewport({
    threshold: 0.5, // 50% of video must be visible
    rootMargin: '0px',
  })
  
  // Sync viewportRef with cardRef for preview tooltip
  useEffect(() => {
    if (viewportRef.current && cardRef.current !== viewportRef.current) {
      // Use viewportRef directly for cardRef
      (cardRef as React.MutableRefObject<HTMLDivElement | null>).current = viewportRef.current as HTMLDivElement
    }
  }, [viewportRef])

  // Fast scroll detection to pause videos
  const { isFastScrolling } = useScrollSpeed({
    fastScrollThreshold: 1000, // pixels per second
    debounceMs: 100,
  })

  // Battery saver mode detection
  const { shouldDisableAutoplay: batterySaverDisabled } = useBatterySaver({
    batteryThreshold: 0.2, // 20% battery
    slowConnectionTypes: ['slow-2g', '2g'],
    respectSaveData: true,
  })

  // Swipe gestures for video navigation (only for videos)
  const swipeHandlers = useSwipeGestures({
    enabled: story.media_type === 'video',
    minDistance: 50,
    minVelocity: 300,
    onSwipeUp: () => {
      if (story.media_type === 'video') {
        onSwipeUp?.()
      }
    },
    onSwipeDown: () => {
      if (story.media_type === 'video') {
        onSwipeDown?.()
      }
    },
    preventDefault: true,
  })

  // ARIA live region for autoplay announcements
  const [autoplayAnnouncement, setAutoplayAnnouncement] = useState('')
  const [isLiked, setIsLiked] = useState(story.userHasLiked || false)
  const [likesCount, setLikesCount] = useState(story.likes_count || 0)
  const [isLiking, setIsLiking] = useState(false)
  
  // Hover preview state
  const [showPreview, setShowPreview] = useState(false)
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleClick = () => {
    router.push(`/story/${story.id}`)
  }

  const handleLikeClick = async (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent navigation when clicking like button
    
    if (!isAuthenticated || isLiking) {
      return
    }

    setIsLiking(true)
    const previousIsLiked = isLiked
    const previousLikesCount = likesCount

    // Optimistic update
    setIsLiked(!previousIsLiked)
    setLikesCount(previousIsLiked ? Math.max(previousLikesCount - 1, 0) : previousLikesCount + 1)

    try {
      const response = await fetch(`/api/stories/${story.id}/like`, {
        method: 'POST',
      })

      if (!response.ok) {
        // Rollback on error
        setIsLiked(previousIsLiked)
        setLikesCount(previousLikesCount)
        
        if (response.status === 401) {
          // User not authenticated - already handled by isAuthenticated check
        } else if (response.status === 403) {
          // Subscription limit exceeded
          const errorData = await response.json().catch(() => ({}))
          const errorMessage = errorData.error || 'Daily like limit reached'
          // Show toast if available
          logWarn(errorMessage)
        }
      } else {
        // Update from server response
        const data = await response.json()
        if (data.likesCount !== undefined) {
          setLikesCount(data.likesCount)
        }
        if (data.liked !== undefined) {
          setIsLiked(data.liked)
        }
      }
    } catch (error) {
      // Rollback on error
      setIsLiked(previousIsLiked)
      setLikesCount(previousLikesCount)
      logError('Error toggling like', error)
    } finally {
      setIsLiking(false)
    }
  }

  const handleVideoPlay = () => {
    // Announce autoplay to screen readers
    if (story.media_type === 'video' && isInViewport) {
      const announcementTemplate = t('feed.video.autoplayAnnouncement') || `Video "{title}" is now playing`
      const announcement = announcementTemplate.replace('{title}', story.title)
      setAutoplayAnnouncement(announcement)
      // Clear announcement after a short delay to allow screen reader to read it
      setTimeout(() => setAutoplayAnnouncement(''), 1000)
    }
  }

  const handleBookmark = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await toggleBookmark(story.id)
    } catch (err) {
      logError('Error toggling bookmark', err)
    }
  }

  // Verify navigation works correctly
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
  }

  // Hover preview handlers
  const handleMouseEnter = () => {
    // Show preview after 500ms delay (to avoid showing on accidental hover)
    hoverTimeoutRef.current = setTimeout(() => {
      setShowPreview(true)
    }, 500)
  }

  const handleMouseLeave = () => {
    // Clear timeout if user leaves before delay
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
      hoverTimeoutRef.current = null
    }
    setShowPreview(false)
  }

  return (
    <>
      <Card
        ref={viewportRef}
        variant="default"
        hoverable
        clickable
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={swipeHandlers.onTouchStart}
        onTouchMove={swipeHandlers.onTouchMove}
        onTouchEnd={swipeHandlers.onTouchEnd}
        onMouseDown={swipeHandlers.onMouseDown}
        onMouseMove={swipeHandlers.onMouseMove}
        onMouseUp={swipeHandlers.onMouseUp}
        tabIndex={0}
        role="button"
        aria-label={`View story: ${story.title}`}
        className="bg-gray-800/50 backdrop-blur-sm border-gray-700/50 hover:border-brand-cyan/50 hover:shadow-level-2 transition-all ease-smooth cursor-pointer touch-manipulation active:scale-[0.98]"
        data-autoplay={story.media_type === 'video' ? isInViewport : undefined}
        data-story-card
        data-story-id={story.id}
      >
      {/* Thumbnail */}
      <div className="relative mb-4">
        {story.media_url && story.media_url.trim() !== '' && story.media_type ? (
          <MediaDisplay
            mediaUrl={story.media_url}
            mediaType={story.media_type}
            alt={story.title}
            lazy={!isAboveFold}
            maxWidth="w-full"
            className="mb-0"
            storyId={story.id}
            // Video autoplay settings for feed
            // Pause if scrolling fast, not in viewport, battery saver mode, or user disabled autoplay
            autoPlay={
              story.media_type === 'video' 
                ? (isInViewport && !isFastScrolling && !batterySaverDisabled && (profile?.video_preferences?.autoplay_enabled !== false)) 
                : false
            }
            loop={story.media_type === 'video'}
            muted={story.media_type === 'video'}
            controls={true}
            onPlay={handleVideoPlay}
            onEnded={() => {
              // Video ended - trigger playlist mode advance
              if (story.media_type === 'video') {
                onVideoEnd?.()
              }
            }}
          />
        ) : (
          <div className="relative aspect-[9/16] w-full rounded-lg overflow-hidden bg-gray-700 flex items-center justify-center">
            <span className="text-4xl text-gray-400">📖</span>
          </div>
        )}
        
        {/* Type Badge */}
        {story.is_root && (
          <div className="absolute top-2 left-2 px-2 py-1 bg-brand-iris/80 backdrop-blur-sm rounded-lg text-xs font-semibold text-white z-10">
            {t('feed.storyType.branching')}
          </div>
        )}
        
        {/* Continue Badge - Show if user has progress (below type badge) */}
        {story.userHasProgress && (
          <div className="absolute top-10 left-2 px-2 py-1 bg-brand-cyan/80 backdrop-blur-sm rounded-lg text-xs font-semibold text-white z-10">
            {t('feed.continue.label') || 'Continue'}
          </div>
        )}
        
        {/* Bookmark Button */}
        {isAuthenticated && (
          <div className="absolute top-2 right-2 z-10" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBookmark}
              disabled={bookmarkLoading}
              className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
                isBookmarked 
                  ? 'bg-brand-cyan/80 text-white' 
                  : 'bg-gray-800/80 text-gray-300 hover:bg-gray-700/80'
              }`}
              aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark story'}
            >
              {isBookmarked ? '🔖' : '📑'}
            </Button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="space-y-3">
        {/* Title */}
        <h3 className="text-lg font-semibold text-white line-clamp-2">
          {story.title}
        </h3>

        {/* Description */}
        {story.description && (
          <p className="text-sm text-gray-300 line-clamp-2">
            <LinkRenderer text={story.description} showExternalIcon={true} />
          </p>
        )}

        {/* Tags */}
        {story.tags && story.tags.length > 0 && (
          <StoryTags tags={story.tags} maxTags={3} />
        )}

        {/* Footer: Author & Stats */}
        <div className="mt-3 flex items-center justify-between gap-3 text-xs text-slate-400 pt-2 border-t border-gray-700/50">
          {/* Author - Left */}
          <Link
            href={`/profile/${story.author_id}`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-2 hover:text-brand-cyan transition-colors ease-smooth flex-shrink-0"
          >
            {story.author?.avatar_url ? (
              <Image
                src={story.author.avatar_url}
                alt={story.author.username || 'User avatar'}
                width={24}
                height={24}
                className="rounded-full object-cover"
                unoptimized
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-gradient-brand flex items-center justify-center text-white text-xs font-semibold">
                {story.author?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
            <span className="text-slate-200 font-medium">
              {story.author?.username || 'Unknown'}
            </span>
          </Link>

          {/* Stats & Share - Right */}
          <div className="flex flex-wrap items-center justify-end gap-x-4 gap-y-1 flex-1 sm:flex-nowrap">
            {/* Endings/Paths */}
            <div className="flex items-center gap-1" title={t('feed.stats.endings') || `${story.paths_count ?? 0} endings`}>
              <span className="font-semibold text-slate-50">{story.paths_count ?? 0}</span>
              <span className="text-[10px] uppercase tracking-wide">{t('feed.stats.endings') || 'endings'}</span>
            </div>
            
            {/* Likes with Quick Like Button */}
            <div className="flex items-center gap-1">
              <button
                onClick={handleLikeClick}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    e.stopPropagation()
                    if (isAuthenticated && !isLiking) {
                      handleLikeClick(e as any)
                    }
                  }
                }}
                disabled={!isAuthenticated || isLiking}
                tabIndex={isAuthenticated ? 0 : -1}
                className={`flex items-center gap-1 transition-colors ease-smooth focus:outline-none focus:ring-2 focus:ring-brand-cyan focus:ring-offset-2 focus:ring-offset-gray-800 rounded ${
                  isLiked 
                    ? 'text-brand-cyan hover:text-brand-cyan/80' 
                    : 'text-slate-50 hover:text-brand-cyan'
                } ${!isAuthenticated ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                aria-label={isLiked ? 'Unlike story' : 'Like story'}
                title={isLiked ? 'Unlike story' : 'Like story'}
              >
                <span className="text-base">{isLiked ? '❤️' : '🤍'}</span>
                <span className="font-semibold">{likesCount}</span>
              </button>
              <span className="text-[10px] uppercase tracking-wide">likes</span>
            </div>
            
            {/* Views */}
            <div className="flex items-center gap-1">
              <span className="font-semibold text-slate-50">{story.views_count ?? 0}</span>
              <span className="text-[10px] uppercase tracking-wide">views</span>
            </div>
            
            {/* Shares */}
            {story.shares_count !== undefined && story.shares_count > 0 && (
              <div className="flex items-center gap-1">
                <span className="font-semibold text-slate-50">{story.shares_count}</span>
                <span className="text-[10px] uppercase tracking-wide">shares</span>
              </div>
            )}
            
            {/* Share Button */}
            <div onClick={(e) => e.stopPropagation()} className="flex-shrink-0">
              <div className="flex items-center gap-2">
                {story.media_type === 'video' && (
                  <WatchLaterButton
                    storyId={story.id}
                    variant="ghost"
                    size="sm"
                    className="scale-90 sm:scale-100 text-gray-400 hover:text-brand-cyan transition-colors"
                  />
                )}
                <ShareStoryButton 
                  storyId={story.id} 
                  className="scale-90 sm:scale-100"
                  initialShared={story.userHasShared}
                  initialSharesCount={story.shares_count || 0}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ARIA Live Region for autoplay announcements */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        role="status"
      >
        {autoplayAnnouncement}
      </div>
    </Card>
    
    {/* Story Preview Tooltip */}
    {viewportRef.current && (
      <StoryPreviewTooltip
        story={story}
        visible={showPreview}
        position="top"
        anchorRef={viewportRef as React.RefObject<HTMLElement>}
      />
    )}
    </>
  )
}

