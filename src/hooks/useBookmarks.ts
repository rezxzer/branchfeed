'use client'

import { useState, useCallback } from 'react'
import { useAuth } from './useAuth'

interface UseBookmarksResult {
  isBookmarked: boolean
  loading: boolean
  error: Error | null
  toggleBookmark: (storyId: string) => Promise<void>
}

/**
 * Hook for managing story bookmarks
 */
export function useBookmarks(
  storyId: string,
  initialBookmarked: boolean = false
): UseBookmarksResult {
  const { isAuthenticated } = useAuth()
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const toggleBookmark = useCallback(async (id: string) => {
    if (!isAuthenticated) {
      setError(new Error('You must be logged in to bookmark stories'))
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Optimistic update
      const previousBookmarked = isBookmarked
      setIsBookmarked(!previousBookmarked)

      // Make API call
      const method = previousBookmarked ? 'DELETE' : 'POST'
      const response = await fetch(`/api/bookmarks/${id}`, {
        method,
      })

      if (!response.ok) {
        // Rollback optimistic update
        setIsBookmarked(previousBookmarked)

        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to toggle bookmark')
      }
    } catch (err) {
      console.error('Error toggling bookmark:', err)
      setError(err as Error)
      throw err
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, isBookmarked])

  return {
    isBookmarked,
    loading,
    error,
    toggleBookmark,
  }
}

