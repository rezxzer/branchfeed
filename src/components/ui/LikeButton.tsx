'use client'

import { cn } from '@/lib/utils'
import { useLike } from '@/hooks/useLike'

export interface LikeButtonProps {
  storyId: string
  initialLikesCount?: number
  className?: string
  showCount?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function LikeButton({
  storyId,
  initialLikesCount = 0,
  className,
  showCount = true,
  size = 'md',
}: LikeButtonProps) {
  const { isLiked, likesCount, loading, toggleLike } = useLike(
    storyId,
    initialLikesCount
  )

  const sizeClasses = {
    sm: 'text-sm px-2 py-1',
    md: 'text-base px-3 py-1.5',
    lg: 'text-lg px-4 py-2',
  }

  return (
    <button
      onClick={toggleLike}
      disabled={loading}
      className={cn(
        'flex items-center gap-2',
        'transition-all ease-smooth',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        sizeClasses[size],
        isLiked
          ? 'text-red-500 hover:text-red-400'
          : 'text-gray-300 hover:text-red-400',
        className
      )}
      aria-label={isLiked ? 'Unlike story' : 'Like story'}
      aria-pressed={isLiked}
    >
      <span
        className={cn(
          'transition-all ease-bounce-soft',
          isLiked && 'scale-110 filter drop-shadow-sm',
          loading && 'opacity-50'
        )}
      >
        {isLiked ? '❤️' : '🤍'}
      </span>
      {showCount && (
        <span className="font-medium">{likesCount}</span>
      )}
    </button>
  )
}

