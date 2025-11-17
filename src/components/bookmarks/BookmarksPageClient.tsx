'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { StoryCard } from '@/components/feed/StoryCard'
import { StoryCardSkeleton } from '@/components/feed/StoryCardSkeleton'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import type { Story } from '@/types'

export function BookmarksPageClient() {
  const router = useRouter()
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const loadBookmarks = useCallback(async (pageNum: number) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/bookmarks?page=${pageNum}&limit=20`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch bookmarks')
      }

      const data = await response.json()
      const newStories = data.stories || []

      if (pageNum === 1) {
        setStories(newStories)
      } else {
        setStories((prev) => [...prev, ...newStories])
      }

      setHasMore(pageNum < (data.pagination?.totalPages || 0))
    } catch (err) {
      console.error('Error loading bookmarks:', err)
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadBookmarks(1)
  }, [loadBookmarks])

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1
      loadBookmarks(nextPage)
      setPage(nextPage)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6">
          Bookmarked Stories
        </h1>

        {loading && page === 1 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <StoryCardSkeleton key={index} />
            ))}
          </div>
        ) : error ? (
          <div className="p-4 bg-red-900/20 rounded-lg border border-red-700/30 text-red-300 text-sm">
            Error loading bookmarks: {error.message}
          </div>
        ) : stories.length === 0 ? (
          <EmptyState
            icon="📑"
            title="No bookmarks yet"
            description="Start bookmarking stories to save them for later!"
            actionLabel="Browse Stories"
            onAction={() => router.push('/feed')}
          />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {stories.map((story) => (
                <StoryCard key={story.id} story={story} />
              ))}
            </div>

            {hasMore && (
              <div className="flex justify-center mt-8">
                <Button
                  variant="outline"
                  onClick={handleLoadMore}
                  disabled={loading}
                >
                  {loading ? <Spinner size="sm" /> : 'Load More'}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

