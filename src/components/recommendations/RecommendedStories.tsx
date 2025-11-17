'use client'

import { useState, useEffect } from 'react'
import { StoryCard } from '@/components/feed/StoryCard'
import { StoryCardSkeleton } from '@/components/feed/StoryCardSkeleton'
import { useTranslation } from '@/hooks/useTranslation'
import type { Story } from '@/types'

interface RecommendedStoriesProps {
  excludeStoryId?: string
  limit?: number
  title?: string
}

export function RecommendedStories({
  excludeStoryId,
  limit = 6,
  title,
}: RecommendedStoriesProps) {
  const { t } = useTranslation()
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true)
        setError(null)

        const params = new URLSearchParams()
        params.set('limit', limit.toString())
        if (excludeStoryId) {
          params.set('excludeStoryId', excludeStoryId)
        }

        const response = await fetch(`/api/recommendations?${params.toString()}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch recommendations')
        }

        const data = await response.json()
        setStories(data.stories || [])
      } catch (err) {
        console.error('Error fetching recommendations:', err)
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchRecommendations()
  }, [excludeStoryId, limit])

  if (loading) {
    return (
      <div className="mb-8">
        <h2 className="text-xl font-bold text-white mb-4">
          {title || t('recommendations.title') || 'You might like'}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {Array.from({ length: limit }).map((_, index) => (
            <StoryCardSkeleton key={index} />
          ))}
        </div>
      </div>
    )
  }

  if (error || stories.length === 0) {
    return null // Don't show error, just don't render recommendations
  }

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-white mb-4">
        {title || t('recommendations.title') || 'You might like'}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {stories.map((story) => (
          <StoryCard key={story.id} story={story} />
        ))}
      </div>
    </div>
  )
}

