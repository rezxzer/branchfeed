'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from '@/hooks/useTranslation'
import { useAuth } from '@/hooks/useAuth'
import { StoryCard } from '@/components/feed/StoryCard'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { logError, logDebug } from '@/lib/logger'
import type { Story } from '@/types'

interface WatchLaterItem {
  id: string
  story_id: string
  created_at: string
  updated_at: string
  stories: Story | null
}

export function WatchLaterPageClient() {
  const router = useRouter()
  const { t } = useTranslation()
  const { isAuthenticated } = useAuth()
  const [items, setItems] = useState<WatchLaterItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/signin')
      return
    }

    fetchWatchLater()
  }, [isAuthenticated, router])

  const fetchWatchLater = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/watch-later?limit=50&offset=0')
      if (!response.ok) {
        throw new Error('Failed to fetch watch later queue')
      }

      const data = await response.json()
      setItems(data.items || [])
      logDebug('Watch later queue fetched', { count: data.items?.length || 0 })
    } catch (err) {
      logError('Error fetching watch later queue', err)
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (storyId: string) => {
    try {
      const response = await fetch(`/api/watch-later/${storyId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to remove from watch later')
      }

      // Remove from local state
      setItems((prev) => prev.filter((item) => item.story_id !== storyId))
      logDebug('Video removed from watch later', { storyId })
    } catch (err) {
      logError('Error removing from watch later', err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ErrorState
            title={t('watchLater.empty.title') || 'Failed to load watch later'}
            message={error.message}
            onRetry={fetchWatchLater}
          />
        </div>
      </div>
    )
  }

  // Filter out items with null stories (deleted stories)
  const validStories = items
    .filter((item) => item.stories !== null)
    .map((item) => item.stories as Story)

  if (validStories.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6">
            {t('watchLater.title') || 'Watch Later'}
          </h1>
          <EmptyState
            icon="📺"
            title={t('watchLater.empty.title') || 'No videos saved yet'}
            description={t('watchLater.empty.description') || 'Add videos to your watch later queue from the feed.'}
            actionLabel={t('feed.title') || 'Go to Feed'}
            onAction={() => router.push('/feed')}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6">
          {t('watchLater.title') || 'Watch Later'}
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
          {validStories.map((story) => (
            <StoryCard
              key={story.id}
              story={story}
              isAboveFold={false}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

