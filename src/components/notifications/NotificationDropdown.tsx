'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useNotifications, type Notification } from '@/hooks/useNotifications'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

interface NotificationDropdownProps {
  onClose: () => void
}

export function NotificationDropdown({ onClose }: NotificationDropdownProps) {
  const router = useRouter()
  const {
    notifications,
    loading,
    markAsRead,
    markAllAsRead,
    refreshNotifications,
  } = useNotifications()
  const [markingAll, setMarkingAll] = useState(false)

  const handleMarkAllAsRead = async () => {
    try {
      setMarkingAll(true)
      await markAllAsRead()
    } catch (error) {
      console.error('Error marking all as read:', error)
    } finally {
      setMarkingAll(false)
    }
  }

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read
    if (!notification.is_read) {
      try {
        await markAsRead(notification.id)
      } catch (error) {
        console.error('Error marking notification as read:', error)
      }
    }

    // Navigate based on notification type
    if (notification.target_id && notification.target_type) {
      if (notification.target_type === 'story') {
        router.push(`/story/${notification.target_id}`)
      } else if (notification.target_type === 'comment') {
        router.push(`/story/${notification.target_id}`)
      }
    } else if (notification.type === 'follow') {
      router.push(`/profile/${notification.actor_id}`)
    }

    onClose()
  }

  const formatTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true })
    } catch {
      return ''
    }
  }

  const getNotificationMessage = (notification: Notification): string => {
    const actorName = notification.actor.username || 'Someone'
    
    switch (notification.type) {
      case 'follow':
        return `${actorName} started following you`
      case 'like':
        return `${actorName} liked your story`
      case 'comment':
        return `${actorName} commented on your story`
      case 'reply':
        return `${actorName} replied to your comment`
      case 'story_new':
        return `${actorName} published a new story`
      default:
        return notification.content || 'New notification'
    }
  }

  return (
    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-gray-800 rounded-xl border border-gray-700/50 shadow-level-3 z-50 max-h-[500px] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700/50">
        <h3 className="text-lg font-semibold text-white">Notifications</h3>
        {notifications.some((n) => !n.is_read) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAllAsRead}
            disabled={markingAll}
            className="text-xs"
          >
            {markingAll ? 'Marking...' : 'Mark all read'}
          </Button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Spinner size="md" />
          </div>
        ) : notifications.length === 0 ? (
          <EmptyState
            icon="🔔"
            title="No notifications"
            description="You're all caught up!"
            className="py-8"
          />
        ) : (
          <div className="divide-y divide-gray-700/50">
            {notifications.map((notification) => (
              <button
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={cn(
                  'w-full p-4 text-left hover:bg-gray-700/30 transition-colors',
                  !notification.is_read && 'bg-gray-700/20'
                )}
              >
                <div className="flex items-start gap-3">
                  {/* Actor Avatar */}
                  {notification.actor.avatar_url ? (
                    <Image
                      src={notification.actor.avatar_url}
                      alt={notification.actor.username || 'User'}
                      width={40}
                      height={40}
                      className="rounded-full object-cover flex-shrink-0"
                      unoptimized
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-brand flex items-center justify-center text-white font-semibold flex-shrink-0">
                      {notification.actor.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        'text-sm',
                        notification.is_read ? 'text-gray-300' : 'text-white font-medium'
                      )}
                    >
                      {getNotificationMessage(notification)}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatTime(notification.created_at)}
                    </p>
                  </div>

                  {/* Unread Indicator */}
                  {!notification.is_read && (
                    <div className="w-2 h-2 rounded-full bg-brand-cyan flex-shrink-0 mt-2" />
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-3 border-t border-gray-700/50">
          <Link
            href="/notifications"
            onClick={onClose}
            className="block text-center text-sm text-brand-cyan hover:text-brand-cyan/80 transition-colors"
          >
            View all notifications
          </Link>
        </div>
      )}
    </div>
  )
}

