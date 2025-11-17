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
}

export function StoryPlayer({
  mediaUrl,
  mediaType,
  posterUrl,
  loading = false,
  onSwipeLeft,
  onSwipeRight,
}: StoryPlayerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const { touchHandlers } = useSwipe({
    onSwipeLeft,
    onSwipeRight,
  }, {
    threshold: 50,
    velocity: 0.3,
  })

  const enterFullscreen = () => {
    const el = containerRef.current
    const req = (el as any)?.requestFullscreen || (el as any)?.webkitRequestFullscreen || (el as any)?.msRequestFullscreen
    if (typeof req === 'function') {
      req.call(el)
    }
  }

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
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-xs sm:max-w-sm md:max-w-md mx-auto touch-none select-none"
      {...touchHandlers}
    >
      {/* Fullscreen button (video only) */}
      {mediaType === 'video' && (
        <button
          type="button"
          onClick={enterFullscreen}
          aria-label="Enter fullscreen"
          className="absolute top-2 right-2 z-20 rounded-md bg-black/40 text-white px-2 py-1 text-xs hover:bg-black/60"
        >
          ⤢
        </button>
      )}
      <MediaDisplay
        mediaUrl={mediaUrl}
        mediaType={mediaType}
        alt="Story media"
        controls={mediaType === 'video'}
        autoPlay={mediaType === 'video'}
        muted={mediaType === 'video'}
        loop={mediaType === 'video'}
        poster={posterUrl ?? undefined}
        lazy={false}
        maxWidth="w-full"
        className="shadow-level-2 border border-gray-700/50"
      />
    </div>
  )
}

