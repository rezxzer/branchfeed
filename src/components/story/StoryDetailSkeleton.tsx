'use client'

import { Skeleton } from '@/components/ui/Skeleton'

export function StoryDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Media Skeleton */}
      <div className="relative aspect-[9/16] w-full max-w-md mx-auto rounded-lg overflow-hidden bg-gray-700/50">
        <Skeleton className="w-full h-full" />
      </div>

      {/* Title & Author Skeleton */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Skeleton variant="text" className="w-3/4 h-8 mx-auto" />
          <Skeleton variant="text" className="w-1/2 h-6 mx-auto" />
        </div>

        <div className="flex items-center justify-center gap-3">
          <Skeleton variant="circular" width={40} height={40} />
          <Skeleton variant="text" className="w-24 h-5" />
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="space-y-3 max-w-2xl mx-auto">
        <Skeleton variant="text" className="w-full h-4" />
        <Skeleton variant="text" className="w-full h-4" />
        <Skeleton variant="text" className="w-5/6 h-4" />
      </div>

      {/* Interaction Buttons Skeleton */}
      <div className="flex items-center justify-center gap-4">
        <Skeleton variant="text" className="w-20 h-10 rounded-lg" />
        <Skeleton variant="text" className="w-20 h-10 rounded-lg" />
        <Skeleton variant="text" className="w-20 h-10 rounded-lg" />
      </div>

      {/* Choices Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
        <Skeleton className="w-full h-16 rounded-lg" />
        <Skeleton className="w-full h-16 rounded-lg" />
      </div>
    </div>
  )
}

