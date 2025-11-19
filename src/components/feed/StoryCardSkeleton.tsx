'use client'

import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'

interface StoryCardSkeletonProps {
  /** Show shimmer animation (default: true) */
  shimmer?: boolean
  /** Delay before showing skeleton (ms, for staggered animations) */
  delay?: number
}

export function StoryCardSkeleton({ shimmer = true, delay = 0 }: StoryCardSkeletonProps) {
  return (
    <Card
      variant="default"
      className={`bg-gray-800/50 backdrop-blur-sm border-gray-700/50 ${
        shimmer ? 'animate-pulse' : ''
      }`}
      style={delay > 0 ? { animationDelay: `${delay}ms` } : undefined}
    >
      {/* Thumbnail Skeleton */}
      <div className="relative aspect-[9/16] w-full rounded-lg overflow-hidden mb-4 bg-gray-700/50">
        <Skeleton className="w-full h-full" shimmer={shimmer} />
      </div>

      {/* Content Skeleton */}
      <div className="space-y-3">
        {/* Title Skeleton */}
        <Skeleton variant="text" className="w-3/4 h-6" shimmer={shimmer} />

        {/* Description Skeleton */}
        <div className="space-y-2">
          <Skeleton variant="text" className="w-full h-4" shimmer={shimmer} />
          <Skeleton variant="text" className="w-5/6 h-4" shimmer={shimmer} />
        </div>

        {/* Author & Stats Skeleton */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-700/50">
          <div className="flex items-center gap-2">
            <Skeleton variant="circular" width={24} height={24} shimmer={shimmer} />
            <Skeleton variant="text" className="w-20 h-4" shimmer={shimmer} />
          </div>
          <div className="flex items-center gap-4">
            <Skeleton variant="text" className="w-12 h-3" shimmer={shimmer} />
            <Skeleton variant="text" className="w-12 h-3" shimmer={shimmer} />
            <Skeleton variant="text" className="w-12 h-3" shimmer={shimmer} />
          </div>
        </div>
      </div>
    </Card>
  )
}

