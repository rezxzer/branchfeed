'use client'

import { useRouter } from 'next/navigation'
import { useTranslation } from '@/hooks/useTranslation'
import { StoryCard } from './StoryCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Spinner } from '@/components/ui/Spinner'
import { Button } from '@/components/ui/Button'
import { StoryCardSkeleton } from './StoryCardSkeleton'
import type { Story } from '@/types'

interface FeedContentProps {
  stories: Story[]
  loading: boolean
  error: Error | null
  hasMore: boolean
  onLoadMore: () => void
}

export function FeedContent({
  stories,
  loading,
  error,
  hasMore,
  onLoadMore,
}: FeedContentProps) {
  const router = useRouter()
  const { t } = useTranslation()

  if (error) {
    return (
      <ErrorState
        title={t('feed.errors.loadFailed')}
        message={t('feed.errors.tryAgain')}
        onRetry={onLoadMore}
      />
    )
  }

  if (loading && stories.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <StoryCardSkeleton key={index} />
        ))}
      </div>
    )
  }

  if (stories.length === 0) {
    return (
      <EmptyState
        icon="📖"
        title={t('feed.empty.title')}
        description={t('feed.empty.description')}
        actionLabel={t('feed.empty.action')}
        onAction={() => router.push('/create')}
      />
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
        {stories.map((story) => (
          <StoryCard key={story.id} story={story} />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center mt-8 sm:mt-10">
          <Button
            onClick={onLoadMore}
            disabled={loading}
            variant="outline"
            size="lg"
          >
            {loading ? <Spinner size="sm" /> : t('feed.loadMore')}
          </Button>
        </div>
      )}
    </>
  )
}

