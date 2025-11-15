'use client'

import { MediaDisplay } from '@/components/MediaDisplay'
import { Spinner } from '@/components/ui/Spinner'
import { useSwipe } from '@/hooks/useSwipe'

interface StoryPlayerProps {
  mediaUrl: string | null
  mediaType: 'image' | 'video' | null
  loading?: boolean
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
}

export function StoryPlayer({
  mediaUrl,
  mediaType,
  loading = false,
  onSwipeLeft,
  onSwipeRight,
}: StoryPlayerProps) {
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
      </div>
    )
  }

  return (
    <div
      className="relative w-full max-w-xs sm:max-w-sm md:max-w-md mx-auto touch-none select-none"
      {...touchHandlers}
    >
      <MediaDisplay
        mediaUrl={mediaUrl}
        mediaType={mediaType}
        alt="Story media"
        controls={mediaType === 'video'}
        autoPlay={mediaType === 'video'}
        muted={mediaType === 'video'}
        loop={mediaType === 'video'}
        lazy={false}
        maxWidth="w-full"
        className="shadow-level-2 border border-gray-700/50"
      />
    </div>
  )
}

