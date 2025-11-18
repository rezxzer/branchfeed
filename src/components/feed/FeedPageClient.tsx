'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import { FeedControls } from './FeedControls'
import { FeedContent } from './FeedContent'
import { useFeed } from '@/hooks/useFeed'
import { useTranslation } from '@/hooks/useTranslation'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { getTags } from '@/lib/tags'
import type { Tag } from '@/types'

const RecommendedStories = dynamic(() => import('../recommendations/RecommendedStories').then(mod => ({ default: mod.RecommendedStories })), {
  ssr: false,
})

type FeedType = 'all' | 'following'

interface FeedPageClientProps {
  tagSlug?: string
}

export function FeedPageClient({ tagSlug }: FeedPageClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t } = useTranslation()
  const [feedType, setFeedType] = useState<FeedType>('all')
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null)
  const [tagLoading, setTagLoading] = useState(false)
  
  // Get tag from URL parameter
  const tagParam = tagSlug || searchParams.get('tag')
  
  useEffect(() => {
    if (tagParam) {
      setTagLoading(true)
      getTags()
        .then((tags) => {
          const tag = tags.find((t) => t.slug === tagParam)
          setSelectedTag(tag || null)
        })
        .catch((err) => {
          console.error('Error fetching tag:', err)
        })
        .finally(() => {
          setTagLoading(false)
        })
    } else {
      setSelectedTag(null)
    }
  }, [tagParam])
  
  const {
    stories,
    loading,
    error,
    hasMore,
    loadMore,
    sortBy,
    setSortBy,
    timeRange,
    setTimeRange,
  } = useFeed(feedType, selectedTag?.id)
  
  const handleClearTag = () => {
    router.push('/feed')
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6">
            {t('feed.title')}
          </h1>
          
          {/* Tag Filter */}
          {selectedTag && (
            <div className="mb-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Filtered by:</span>
                <span
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                  style={
                    selectedTag.color
                      ? {
                          backgroundColor: `${selectedTag.color}20`,
                          borderColor: `${selectedTag.color}50`,
                          color: selectedTag.color,
                          border: '1px solid',
                        }
                      : {
                          backgroundColor: '#374151',
                          color: '#fff',
                        }
                  }
                >
                  {selectedTag.name}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearTag}
                className="text-gray-400 hover:text-white"
              >
                Clear filter
              </Button>
            </div>
          )}
          
          {/* Feed Type Tabs */}
          <div className="flex gap-2 mb-4 sm:mb-6">
            <Button
              variant={feedType === 'all' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFeedType('all')}
              className={cn(
                feedType === 'all' ? '' : 'text-gray-300'
              )}
            >
              All
            </Button>
            <Button
              variant={feedType === 'following' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFeedType('following')}
              className={cn(
                feedType === 'following' ? '' : 'text-gray-300'
              )}
            >
              Following
            </Button>
          </div>
          
          {/* Recommended Stories (only for "All" feed) */}
          {feedType === 'all' && (
            <RecommendedStories limit={6} />
          )}

          <FeedControls 
            sortBy={sortBy} 
            onSortChange={setSortBy}
            timeRange={timeRange}
            onTimeRangeChange={setTimeRange}
          />

          <FeedContent
            stories={stories}
            loading={loading}
            error={error}
            hasMore={hasMore}
            onLoadMore={loadMore}
          />
        </div>
      </div>
    </ErrorBoundary>
  )
}

