'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { ErrorState } from '@/components/ui/ErrorState'
import { Card } from '@/components/ui/Card'

interface StoryAnalytics {
  story: {
    id: string
    title: string
    created_at: string
  }
  views: {
    total: number
    overTime: Array<{ date: string; views: number }>
  }
  engagement: {
    likes: number
    comments: number
    shares: number
    engagementRate: number
  }
  paths: {
    total: number
    completed: number
    completionRate: number
    avgDepth: number
    topPaths: Array<{ path: string; count: number; completionRate: number }>
  }
}

interface StoryAnalyticsClientProps {
  storyId: string
}

export function StoryAnalyticsClient({ storyId }: StoryAnalyticsClientProps) {
  const router = useRouter()
  const [analytics, setAnalytics] = useState<StoryAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/stories/${storyId}/analytics`)
        
        if (!response.ok) {
          if (response.status === 403) {
            throw new Error('You can only view analytics for your own stories')
          }
          throw new Error('Failed to fetch analytics')
        }

        const data = await response.json()
        setAnalytics(data)
      } catch (err) {
        console.error('Error fetching analytics:', err)
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    if (storyId) {
      fetchAnalytics()
    }
  }, [storyId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <div className="flex justify-center items-center py-12">
            <Spinner size="lg" />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <ErrorState
            title="Failed to load analytics"
            message={error.message}
            retryLabel="Go Back"
            onRetry={() => router.back()}
          />
        </div>
      </div>
    )
  }

  if (!analytics) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Story Analytics
            </h1>
            <p className="text-gray-400">{analytics.story.title}</p>
          </div>
          <Button
            variant="outline"
            onClick={() => router.push(`/story/${storyId}`)}
          >
            View Story
          </Button>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 mb-6">
          <Card variant="default" className="bg-gray-800/50 border-gray-700/50">
            <div className="p-4">
              <div className="text-sm text-gray-400 mb-1">Total Views</div>
              <div className="text-2xl font-bold text-white">
                {analytics.views.total.toLocaleString()}
              </div>
            </div>
          </Card>

          <Card variant="default" className="bg-gray-800/50 border-gray-700/50">
            <div className="p-4">
              <div className="text-sm text-gray-400 mb-1">Likes</div>
              <div className="text-2xl font-bold text-white">
                {analytics.engagement.likes.toLocaleString()}
              </div>
            </div>
          </Card>

          <Card variant="default" className="bg-gray-800/50 border-gray-700/50">
            <div className="p-4">
              <div className="text-sm text-gray-400 mb-1">Comments</div>
              <div className="text-2xl font-bold text-white">
                {analytics.engagement.comments.toLocaleString()}
              </div>
            </div>
          </Card>

          <Card variant="default" className="bg-gray-800/50 border-gray-700/50">
            <div className="p-4">
              <div className="text-sm text-gray-400 mb-1">Shares</div>
              <div className="text-2xl font-bold text-white">
                {analytics.engagement.shares.toLocaleString()}
              </div>
            </div>
          </Card>

          <Card variant="default" className="bg-gray-800/50 border-gray-700/50">
            <div className="p-4">
              <div className="text-sm text-gray-400 mb-1">Engagement Rate</div>
              <div className="text-2xl font-bold text-white">
                {analytics.engagement.engagementRate.toFixed(1)}%
              </div>
            </div>
          </Card>
        </div>

        {/* Path Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card variant="default" className="bg-gray-800/50 border-gray-700/50">
            <div className="p-6">
              <h2 className="text-xl font-bold text-white mb-4">Path Analytics</h2>
              
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-400 mb-1">Total Paths</div>
                  <div className="text-2xl font-bold text-white">
                    {analytics.paths.total}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-400 mb-1">Completed</div>
                  <div className="text-2xl font-bold text-white">
                    {analytics.paths.completed} ({analytics.paths.completionRate.toFixed(1)}%)
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-400 mb-1">Average Depth</div>
                  <div className="text-2xl font-bold text-white">
                    {analytics.paths.avgDepth.toFixed(1)}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card variant="default" className="bg-gray-800/50 border-gray-700/50">
            <div className="p-6">
              <h2 className="text-xl font-bold text-white mb-4">Top Paths</h2>
              
              {analytics.paths.topPaths.length === 0 ? (
                <p className="text-gray-400">No path data yet</p>
              ) : (
                <div className="space-y-3">
                  {analytics.paths.topPaths.map((pathData, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white truncate">
                          {pathData.path || 'Root'}
                        </div>
                        <div className="text-xs text-gray-400">
                          {pathData.completionRate.toFixed(1)}% completion
                        </div>
                      </div>
                      <div className="text-lg font-bold text-brand-cyan ml-4">
                        {pathData.count}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

