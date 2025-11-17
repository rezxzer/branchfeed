'use client'

import { useState, useCallback } from 'react'
import { useAuth } from './useAuth'

interface UseCommentLikesResult {
  liked: boolean
  likesCount: number
  loading: boolean
  error: Error | null
  toggleLike: (commentId: string) => Promise<void>
}

/**
 * Hook for managing comment likes
 */
export function useCommentLikes(
  commentId: string,
  initialLiked: boolean = false,
  initialLikesCount: number = 0
): UseCommentLikesResult {
  const { isAuthenticated } = useAuth()
  const [liked, setLiked] = useState(initialLiked)
  const [likesCount, setLikesCount] = useState(initialLikesCount)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const toggleLike = useCallback(async (id: string) => {
    if (!isAuthenticated) {
      setError(new Error('You must be logged in to like comments'))
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Optimistic update
      const previousLiked = liked
      const previousCount = likesCount

      setLiked(!previousLiked)
      setLikesCount(previousLiked ? previousCount - 1 : previousCount + 1)

      // Make API call
      const method = previousLiked ? 'DELETE' : 'POST'
      const response = await fetch(`/api/comments/${id}/like`, {
        method,
      })

      if (!response.ok) {
        // Rollback optimistic update
        setLiked(previousLiked)
        setLikesCount(previousCount)

        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to toggle like')
      }

      // Update with actual data from server
      const data = await response.json()
      if (data.likesCount !== undefined) {
        setLikesCount(data.likesCount)
      }
      if (data.liked !== undefined) {
        setLiked(data.liked)
      }
    } catch (err) {
      console.error('Error toggling comment like:', err)
      setError(err as Error)
      throw err
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, liked, likesCount])

  return {
    liked,
    likesCount,
    loading,
    error,
    toggleLike,
  }
}

