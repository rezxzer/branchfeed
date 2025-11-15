'use client'

import { FeedControls } from './FeedControls'
import { FeedContent } from './FeedContent'
import { useFeed } from '@/hooks/useFeed'
import { useTranslation } from '@/hooks/useTranslation'
import { ErrorBoundary } from '@/components/ErrorBoundary'

export function FeedPageClient() {
  const { t } = useTranslation()
  const {
    stories,
    loading,
    error,
    hasMore,
    loadMore,
    sortBy,
    setSortBy,
  } = useFeed()

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6">
            {t('feed.title')}
          </h1>
          
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

