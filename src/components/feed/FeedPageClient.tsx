'use client'

import { useState } from 'react'
import { FeedControls } from './FeedControls'
import { FeedContent } from './FeedContent'
import { useFeed } from '@/hooks/useFeed'
import { useTranslation } from '@/hooks/useTranslation'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

type FeedType = 'all' | 'following'

export function FeedPageClient() {
  const { t } = useTranslation()
  const [feedType, setFeedType] = useState<FeedType>('all')
  const {
    stories,
    loading,
    error,
    hasMore,
    loadMore,
    sortBy,
    setSortBy,
  } = useFeed(feedType)

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6">
            {t('feed.title')}
          </h1>
          
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
          
          <FeedControls sortBy={sortBy} onSortChange={setSortBy} />

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

