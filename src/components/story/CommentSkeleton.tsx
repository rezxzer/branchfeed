'use client'

import { Skeleton } from '@/components/ui/Skeleton'

export function CommentSkeleton() {
  return (
    <div className="flex gap-3 p-4 bg-gray-800/30 rounded-lg border border-gray-700/30">
      {/* Avatar Skeleton */}
      <Skeleton variant="circular" width={40} height={40} className="flex-shrink-0" />

      {/* Content Skeleton */}
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton variant="text" className="w-24 h-4" />
          <Skeleton variant="text" className="w-16 h-3" />
        </div>
        <div className="space-y-1">
          <Skeleton variant="text" className="w-full h-4" />
          <Skeleton variant="text" className="w-5/6 h-4" />
        </div>
      </div>
    </div>
  )
}

