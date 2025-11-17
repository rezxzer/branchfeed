'use client'

import { cn } from '@/lib/utils'
import { useLike } from '@/hooks/useLike'

export interface LikeButtonProps {
  storyId: string
  initialLikesCount?: number
  className?: string
  showCount?: boolean
  size?: 'sm' | 'md' | 'lg'
  onLikeClick?: () => void
  controlledLikesCount?: number // Use this when onLikeClick is provided
  isLiked?: boolean // Use this when onLikeClick is provided
  isLoading?: boolean // Use this when onLikeClick is provided
}

export function LikeButton({
  storyId,
  initialLikesCount = 0,
  className,
  showCount = true,
  size = 'md',
  onLikeClick,
  controlledLikesCount,
  isLiked: controlledIsLiked,
  isLoading: controlledIsLoading,
}: LikeButtonProps) {
  // If external handler is provided, use it and don't use the hook
  // Otherwise, use the hook for backward compatibility
  const hookResult = useLike(storyId, initialLikesCount)
  const { isLiked: hookIsLiked, likesCount: hookLikesCount, loading: hookLoading, toggleLike } = hookResult

  // Use external handler if provided, otherwise use internal hook
  const handleClick = onLikeClick || toggleLike
  const isLiked = onLikeClick 
    ? (controlledIsLiked ?? false) // If using external handler, use controlled value
    : hookIsLiked // Otherwise use hook value
  const likesCount = onLikeClick 
    ? (controlledLikesCount ?? initialLikesCount) // If using external handler, use controlled value
    : hookLikesCount // Otherwise use hook value
  const loading = onLikeClick 
    ? (controlledIsLoading ?? false) // If using external handler, use controlled loading state
    : hookLoading // Otherwise use hook loading state

  const sizeClasses = {
    sm: 'text-sm px-2 py-1',
    md: 'text-base px-3 py-1.5',
    lg: 'text-lg px-4 py-2',
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={cn(
        'flex items-center gap-2',
        'transition-all ease-smooth',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        sizeClasses[size],
        isLiked
          ? 'text-red-500 hover:text-red-400'
          : 'text-gray-300 hover:text-red-400',
        loading && 'opacity-60',
        className
      )}
      aria-label={isLiked ? 'Unlike story' : 'Like story'}
      aria-pressed={isLiked}
      aria-busy={loading}
    >
      <span
        className={cn(
          'transition-all ease-bounce-soft',
          isLiked && 'scale-110 filter drop-shadow-sm',
          loading && 'opacity-70'
        )}
      >
        {loading ? '⏳' : isLiked ? '❤️' : '🤍'}
      </span>
      {showCount && (
        <span className="font-medium">{likesCount}</span>
      )}
    </button>
  )
}

