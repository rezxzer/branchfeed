'use client'

import { useState, useCallback } from 'react'
import { useAuth } from './useAuth'
import { useToast } from '@/components/ui/toast'

interface UseSharesResult {
  isShared: boolean
  sharesCount: number
  loading: boolean
  toggleShare: (storyId: string) => Promise<void>
}

export function useShares(
  storyId: string,
  initialShared: boolean = false,
  initialSharesCount: number = 0
): UseSharesResult {
  const { isAuthenticated } = useAuth()
  const { showToast } = useToast()
  const [isShared, setIsShared] = useState(initialShared)
  const [sharesCount, setSharesCount] = useState(initialSharesCount)
  const [loading, setLoading] = useState(false)

  const toggleShare = useCallback(
    async (storyId: string) => {
      if (!isAuthenticated) {
        showToast('Please sign in to share stories', 'info')
        return
      }

      setLoading(true)
      const previousShared = isShared
      const previousCount = sharesCount

      // Optimistic update
      setIsShared(!previousShared)
      setSharesCount(previousShared ? previousCount - 1 : previousCount + 1)

      try {
        const method = previousShared ? 'DELETE' : 'POST'
        const response = await fetch(`/api/stories/${storyId}/share`, {
          method,
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Failed to update share status')
        }

        const data = await response.json()
        setIsShared(data.shared)
        setSharesCount(data.sharesCount || 0)
      } catch (error: any) {
        // Rollback optimistic update
        setIsShared(previousShared)
        setSharesCount(previousCount)
        console.error('Error toggling share:', error)
        showToast(error.message || 'Failed to share story', 'error')
      } finally {
        setLoading(false)
      }
    },
    [isAuthenticated, isShared, sharesCount, showToast]
  )

  return {
    isShared,
    sharesCount,
    loading,
    toggleShare,
  }
}

