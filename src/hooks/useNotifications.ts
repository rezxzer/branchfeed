'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'

export type NotificationType = 'follow' | 'like' | 'comment' | 'reply' | 'story_new'

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  actor_id: string
  target_id: string | null
  target_type: string | null
  content: string | null
  is_read: boolean
  created_at: string
  actor: {
    id: string
    username: string
    avatar_url: string | null
  }
}

interface UseNotificationsResult {
  notifications: Notification[]
  unreadCount: number
  loading: boolean
  error: Error | null
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  refreshNotifications: () => Promise<void>
  refreshUnreadCount: () => Promise<void>
}

/**
 * Hook for managing notifications
 */
export function useNotifications(): UseNotificationsResult {
  const { isAuthenticated } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/notifications?limit=20')
      
      if (!response.ok) {
        throw new Error('Failed to fetch notifications')
      }

      const data = await response.json()
      setNotifications(data.notifications || [])
    } catch (err) {
      console.error('Error fetching notifications:', err)
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated])

  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) {
      setUnreadCount(0)
      return
    }

    try {
      const response = await fetch('/api/notifications/unread-count')
      
      if (!response.ok) {
        // If service unavailable or other error, set count to 0 silently
        setUnreadCount(0)
        return
      }

      const data = await response.json()
      setUnreadCount(data.count || 0)
    } catch (err) {
      // Silently handle errors - set count to 0
      setUnreadCount(0)
    }
  }, [isAuthenticated])

  useEffect(() => {
    fetchNotifications()
    fetchUnreadCount()
  }, [fetchNotifications, fetchUnreadCount])

  const markAsRead = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}/read`, {
        method: 'PATCH',
      })

      if (!response.ok) {
        // Silently handle errors - don't update state if request failed
        return
      }

      // Update local state
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (err) {
      // Silently handle errors
    }
  }, [])

  const markAllAsRead = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'PATCH',
      })

      if (!response.ok) {
        // Silently handle errors - don't update state if request failed
        return
      }

      // Update local state
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
      setUnreadCount(0)
    } catch (err) {
      // Silently handle errors
    }
  }, [])

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    refreshNotifications: fetchNotifications,
    refreshUnreadCount: fetchUnreadCount,
  }
}

