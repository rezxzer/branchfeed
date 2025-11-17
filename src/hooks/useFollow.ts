'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'

interface UseFollowResult {
  isFollowing: boolean
  isLoading: boolean
  error: Error | null
  follow: () => Promise<void>
  unfollow: () => Promise<void>
  checkFollowStatus: () => Promise<void>
}

/**
 * Hook for managing follow/unfollow functionality
 */
export function useFollow(userId: string): UseFollowResult {
  const { isAuthenticated } = useAuth()
  const [isFollowing, setIsFollowing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const checkFollowStatus = useCallback(async () => {
    if (!isAuthenticated || !userId) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/follow/${userId}`)
      
      if (!response.ok) {
        throw new Error('Failed to check follow status')
      }

      const data = await response.json()
      setIsFollowing(data.isFollowing || false)
    } catch (err) {
      console.error('Error checking follow status:', err)
      setError(err as Error)
      setIsFollowing(false)
    } finally {
      setIsLoading(false)
    }
  }, [userId, isAuthenticated])

  useEffect(() => {
    checkFollowStatus()
  }, [checkFollowStatus])

  const follow = useCallback(async () => {
    if (!isAuthenticated) {
      throw new Error('User not authenticated')
    }

    try {
      setError(null)
      setIsLoading(true)

      const response = await fetch(`/api/follow/${userId}`, {
        method: 'POST',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to follow user')
      }

      setIsFollowing(true)
    } catch (err) {
      console.error('Error following user:', err)
      setError(err as Error)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [userId, isAuthenticated])

  const unfollow = useCallback(async () => {
    if (!isAuthenticated) {
      throw new Error('User not authenticated')
    }

    try {
      setError(null)
      setIsLoading(true)

      const response = await fetch(`/api/follow/${userId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to unfollow user')
      }

      setIsFollowing(false)
    } catch (err) {
      console.error('Error unfollowing user:', err)
      setError(err as Error)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [userId, isAuthenticated])

  return {
    isFollowing,
    isLoading,
    error,
    follow,
    unfollow,
    checkFollowStatus,
  }
}

