'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useNotifications, type Notification } from '@/hooks/useNotifications'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

export function NotificationsPageClient() {
  const router = useRouter()
  const {
    notifications,
    loading,
    markAsRead,
    markAllAsRead,
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
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Notifications</h1>
          {notifications.some((n) => !n.is_read) && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={markingAll}
            >
              {markingAll ? 'Marking...' : 'Mark all as read'}
            </Button>
          )}
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Spinner size="lg" />
          </div>
        ) : notifications.length === 0 ? (
          <EmptyState
            icon="🔔"
            title="No notifications"
            description="You're all caught up! Check back later for updates."
          />
        ) : (
          <div className="space-y-2">
            {notifications.map((notification) => (
              <button
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={cn(
                  'w-full p-4 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50',
                  'hover:border-brand-cyan/50 transition-colors text-left',
                  !notification.is_read && 'bg-gray-700/30 border-brand-cyan/30'
                )}
              >
                <div className="flex items-start gap-3">
                  {/* Actor Avatar */}
                  {notification.actor.avatar_url ? (
                    <Image
                      src={notification.actor.avatar_url}
                      alt={notification.actor.username || 'User'}
                      width={48}
                      height={48}
                      className="rounded-full object-cover flex-shrink-0"
                      unoptimized
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-brand flex items-center justify-center text-white font-semibold flex-shrink-0">
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
    </div>
  )
}

