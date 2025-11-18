'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { StoryCard } from '@/components/feed/StoryCard'
import { StoryCardSkeleton } from '@/components/feed/StoryCardSkeleton'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { createClientClient } from '@/lib/supabase/client'
import type { Story } from '@/types'

export function DraftsPageClient() {
  const router = useRouter()
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const loadDrafts = useCallback(async (pageNum: number) => {
    try {
      setLoading(true)
      setError(null)

      const supabase = createClientClient()
      if (!supabase) {
        throw new Error('Supabase client not available')
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      const limit = 20
      const offset = (pageNum - 1) * limit

      const { data, error: fetchError, count } = await supabase
        .from('stories')
        .select(
          `
          *,
          author:profiles(
            id,
            username,
            avatar_url
          )
        `,
          { count: 'exact' }
        )
        .eq('author_id', user.id)
        .eq('status', 'draft')
        .eq('is_root', true)
        .order('updated_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (fetchError) {
        throw fetchError
      }

      // Count branches for each story
      const storiesWithBranches = await Promise.all(
        (data || []).map(async (story: any) => {
          const { count: branchesCount } = await supabase
            .from('story_nodes')
            .select('*', { count: 'exact', head: true })
            .eq('story_id', story.id)

          return {
            ...story,
            branches_count: branchesCount || 0,
            paths_count: branchesCount || 0,
          } as Story
        })
      )

      if (pageNum === 1) {
        setStories(storiesWithBranches)
      } else {
        setStories((prev) => [...prev, ...storiesWithBranches])
      }

      setHasMore(pageNum < Math.ceil((count || 0) / limit))
    } catch (err) {
      console.error('Error loading drafts:', err)
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDrafts(1)
  }, [loadDrafts])

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1
      loadDrafts(nextPage)
      setPage(nextPage)
    }
  }

  const handlePublish = async (storyId: string) => {
    try {
      const response = await fetch(`/api/stories/${storyId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'published' }),
      })

      if (!response.ok) {
        throw new Error('Failed to publish story')
      }

      // Remove from drafts list
      setStories((prev) => prev.filter((s) => s.id !== storyId))
    } catch (err) {
      console.error('Error publishing story:', err)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Draft Stories
          </h1>
          <Button
            variant="primary"
            onClick={() => router.push('/create')}
          >
            Create New Story
          </Button>
        </div>

        {loading && page === 1 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <StoryCardSkeleton key={index} />
            ))}
          </div>
        ) : error ? (
          <div className="p-4 bg-red-900/20 rounded-lg border border-red-700/30 text-red-300 text-sm">
            Error loading drafts: {error.message}
          </div>
        ) : stories.length === 0 ? (
          <EmptyState
            icon="📝"
            title="No drafts yet"
            description="Start creating a story and save it as a draft to see it here!"
            actionLabel="Create Story"
            onAction={() => router.push('/create')}
          />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {stories.map((story) => {
                const isScheduled = story.scheduled_publish_at && new Date(story.scheduled_publish_at) > new Date()
                const scheduledDate = story.scheduled_publish_at 
                  ? new Date(story.scheduled_publish_at).toLocaleString()
                  : null

                return (
                  <div key={story.id} className="relative">
                    <StoryCard story={story} />
                    <div className="absolute top-2 left-2 flex gap-2 z-10">
                      <div className="px-2 py-1 bg-yellow-600/80 backdrop-blur-sm rounded-lg text-xs font-semibold text-white">
                        Draft
                      </div>
                      {isScheduled && (
                        <div className="px-2 py-1 bg-blue-600/80 backdrop-blur-sm rounded-lg text-xs font-semibold text-white">
                          Scheduled
                        </div>
                      )}
                    </div>
                    {isScheduled && scheduledDate && (
                      <div className="mt-2 mb-2 px-3 py-2 bg-blue-900/30 rounded-lg border border-blue-700/50">
                        <p className="text-xs text-blue-300">
                          Scheduled for: <span className="font-semibold">{scheduledDate}</span>
                        </p>
                      </div>
                    )}
                    <div className="mt-2 flex gap-2">
                      {!isScheduled && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handlePublish(story.id)}
                          className="flex-1"
                        >
                          Publish
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/story/${story.id}`)}
                        className={isScheduled ? "flex-1" : "flex-1"}
                      >
                        Edit
                      </Button>
                    </div>
                  </div>
                )
              })}
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

