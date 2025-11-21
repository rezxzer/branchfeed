'use client'

import { useRef } from 'react'
import { MediaDisplay } from '@/components/MediaDisplay'
import { Spinner } from '@/components/ui/Spinner'
import { useSwipe } from '@/hooks/useSwipe'

interface StoryPlayerProps {
  mediaUrl: string | null
  mediaType: 'image' | 'video' | null
  posterUrl?: string | null
  loading?: boolean
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onVideoEnd?: () => void
}

/**
 * Story Player with improved video support
 * 
 * Features:
 * - Image and video display
 * - Swipe gestures (left/right)
 * - Loading states
 * - Auto-play for videos
 * - Video controls
 * 
 * Usage:
 * ```tsx
 * <StoryPlayer 
 *   mediaUrl={url}
 *   mediaType="video"
 *   posterUrl={thumbnailUrl}
 *   onVideoEnd={() => console.log('ended')}
 * />
 * ```
 */
export function StoryPlayer({
  mediaUrl,
  mediaType,
  posterUrl,
  loading = false,
  onSwipeLeft,
  onSwipeRight,
  onVideoEnd,
}: StoryPlayerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const { touchHandlers } = useSwipe({
    onSwipeLeft,
    onSwipeRight,
  }, {
    threshold: 50,
    velocity: 0.3,
  })

  if (loading) {
    return (
      <div className="relative aspect-[9/16] w-full max-w-md mx-auto rounded-lg overflow-hidden bg-gray-800 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!mediaUrl || !mediaType) {
    return (
      <div className="relative aspect-[9/16] w-full max-w-md mx-auto rounded-lg overflow-hidden bg-gray-800 flex items-center justify-center">
        <span className="text-4xl text-gray-400">📖</span>
        <p className="text-gray-400 text-sm mt-2">No media</p>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-xs sm:max-w-sm md:max-w-md mx-auto touch-none select-none"
      {...touchHandlers}
    >
      <MediaDisplay
        mediaUrl={mediaUrl}
        mediaType={mediaType}
        alt="Story media"
        controls={true}
        autoPlay={mediaType === 'video'}
        loop={false}
        muted={mediaType === 'video'} // Auto-mute videos for autoplay
        poster={posterUrl ?? undefined}
        lazy={false}
        maxWidth="w-full"
        aspectRatio="9/16"
        onEnded={onVideoEnd}
        className="shadow-level-2 border border-gray-700/50"
      />
    </div>
  )
}
