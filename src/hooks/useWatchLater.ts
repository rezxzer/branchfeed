'use client'

import { useState, useCallback } from 'react'
import { useAuth } from './useAuth'

interface UseWatchLaterResult {
  isInWatchLater: boolean
  loading: boolean
  error: Error | null
  toggleWatchLater: (storyId: string) => Promise<void>
}

/**
 * Hook for managing watch later queue (videos only)
 */
export function useWatchLater(
  storyId: string,
  initialInWatchLater: boolean = false
): UseWatchLaterResult {
  const { isAuthenticated } = useAuth()
  const [isInWatchLater, setIsInWatchLater] = useState(initialInWatchLater)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const toggleWatchLater = useCallback(async (id: string) => {
    if (!isAuthenticated) {
      setError(new Error('You must be logged in to save videos for later'))
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Optimistic update
      const previousInWatchLater = isInWatchLater
      setIsInWatchLater(!previousInWatchLater)

      // Make API call
      const method = previousInWatchLater ? 'DELETE' : 'POST'
      const response = await fetch(`/api/watch-later/${id}`, {
        method,
      })

      if (!response.ok) {
        // Rollback optimistic update
        setIsInWatchLater(previousInWatchLater)

        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to toggle watch later')
      }
    } catch (err) {
      console.error('Error toggling watch later:', err)
      setError(err as Error)
      throw err
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, isInWatchLater])

  return {
    isInWatchLater,
    loading,
    error,
    toggleWatchLater,
  }
}

