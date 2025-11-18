'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { useToast } from '@/components/ui/toast'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import type { Profile } from '@/types'

interface NotificationSettingsProps {
  profile: Profile
  onUpdate: (updates: Partial<Profile>) => Promise<void>
}

type NotificationType = 'follow' | 'like' | 'comment' | 'reply' | 'story_new'

interface NotificationPreferences {
  follow: boolean
  like: boolean
  comment: boolean
  reply: boolean
  story_new: boolean
}

const defaultPreferences: NotificationPreferences = {
  follow: true,
  like: true,
  comment: true,
  reply: true,
  story_new: true,
}

export function NotificationSettings({
  profile,
  onUpdate,
}: NotificationSettingsProps) {
  const { t } = useTranslation()
  const { showToast } = useToast()
  const [preferences, setPreferences] = useState<NotificationPreferences>(
    (profile.notification_preferences as NotificationPreferences) || defaultPreferences
  )
  const [loading, setLoading] = useState(false)

  // Update preferences when profile changes
  useEffect(() => {
    if (profile.notification_preferences) {
      setPreferences({
        ...defaultPreferences,
        ...(profile.notification_preferences as NotificationPreferences),
      })
    }
  }, [profile.notification_preferences])

  const handleToggle = (type: NotificationType) => {
    setPreferences((prev) => ({
      ...prev,
      [type]: !prev[type],
    }))
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      await onUpdate({
        notification_preferences: preferences,
      })
      showToast('Notification preferences updated successfully!', 'success')
    } catch (err) {
      console.error('Error updating notification preferences:', err)
      showToast('Failed to update notification preferences. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const notificationLabels: Record<NotificationType, string> = {
    follow: 'New followers',
    like: 'Story likes',
    comment: 'Story comments',
    reply: 'Comment replies',
    story_new: 'New stories from followed users',
  }

  return (
    <div className="space-y-6">
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-level-2 border border-gray-700/50 p-6">
        <h2 className="text-xl font-semibold text-white mb-6">
          Notification Preferences
        </h2>

        <p className="text-gray-400 mb-6 text-sm">
          Choose which types of notifications you want to receive.
        </p>

        <div className="space-y-4">
          {(Object.keys(notificationLabels) as NotificationType[]).map((type) => (
            <div
              key={type}
              className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-700/50"
            >
              <div className="flex-1">
                <h3 className="text-white font-medium mb-1">
                  {notificationLabels[type]}
                </h3>
                <p className="text-gray-400 text-sm">
                  {type === 'follow' && 'Get notified when someone follows you'}
                  {type === 'like' && 'Get notified when someone likes your story'}
                  {type === 'comment' && 'Get notified when someone comments on your story'}
                  {type === 'reply' && 'Get notified when someone replies to your comment'}
                  {type === 'story_new' && 'Get notified when a user you follow publishes a new story'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle(type)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ease-smooth ${
                  preferences[type]
                    ? 'bg-brand-cyan'
                    : 'bg-gray-600'
                }`}
                role="switch"
                aria-checked={preferences[type]}
                aria-label={`Toggle ${notificationLabels[type]}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ease-smooth ${
                    preferences[type] ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <Button
            type="button"
            variant="primary"
            size="lg"
            fullWidth
            disabled={loading}
            onClick={handleSave}
            isLoading={loading}
          >
            {loading ? (
              <>
                <Spinner size="sm" />
                Saving...
              </>
            ) : (
              'Save Preferences'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

