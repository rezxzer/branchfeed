'use client'

import { useState, useEffect, useCallback } from 'react'
import { likeStory, unlikeStory, getLikeStatus, type LikeStatus } from '@/lib/likes'
import { useAuth } from '@/hooks/useAuth'

interface UseLikeResult {
  isLiked: boolean
  likesCount: number
  loading: boolean
  error: Error | null
  toggleLike: () => Promise<void>
}

/**
 * Hook for managing like/unlike functionality with optimistic updates
 */
export function useLike(storyId: string, initialLikesCount: number = 0): UseLikeResult {
  const { isAuthenticated } = useAuth()
  const [status, setStatus] = useState<LikeStatus>({
    isLiked: false,
    likesCount: initialLikesCount,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [isToggling, setIsToggling] = useState(false)

  // Load initial like status
  useEffect(() => {
    const loadStatus = async () => {
      if (!isAuthenticated || !storyId) {
        setStatus({
          isLiked: false,
          likesCount: initialLikesCount,
        })
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        const likeStatus = await getLikeStatus(storyId)
        setStatus(likeStatus)
      } catch (err) {
        console.error('Error loading like status:', err)
        setError(err as Error)
        // Fallback to initial count
        setStatus({
          isLiked: false,
          likesCount: initialLikesCount,
        })
      } finally {
        setLoading(false)
      }
    }

    loadStatus()
  }, [storyId, isAuthenticated, initialLikesCount])

  const toggleLike = useCallback(async () => {
    if (!isAuthenticated || isToggling) {
      return
    }

    // Optimistic update
    const previousStatus = { ...status }
    const newIsLiked = !status.isLiked
    const newLikesCount = newIsLiked
      ? status.likesCount + 1
      : Math.max(status.likesCount - 1, 0)

    setStatus({
      isLiked: newIsLiked,
      likesCount: newLikesCount,
    })
    setIsToggling(true)
    setError(null)

    try {
      if (newIsLiked) {
        await likeStory(storyId)
      } else {
        await unlikeStory(storyId)
      }

      // Refresh status from server to ensure consistency
      const updatedStatus = await getLikeStatus(storyId)
      setStatus(updatedStatus)
    } catch (err) {
      console.error('Error toggling like:', err)
      // Rollback optimistic update
      setStatus(previousStatus)
      setError(err as Error)
    } finally {
      setIsToggling(false)
    }
  }, [storyId, isAuthenticated, status, isToggling])

  return {
    isLiked: status.isLiked,
    likesCount: status.likesCount,
    loading: loading || isToggling,
    error,
    toggleLike,
  }
}

