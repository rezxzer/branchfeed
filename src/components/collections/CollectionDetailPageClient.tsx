'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { StoryCard } from '@/components/feed/StoryCard'
import { AddStoryToCollectionModal } from './AddStoryToCollectionModal'
import type { Collection, Story } from '@/types'

interface CollectionDetailPageClientProps {
  collectionId: string
  currentUserId?: string
}

export function CollectionDetailPageClient({ collectionId, currentUserId }: CollectionDetailPageClientProps) {
  const router = useRouter()
  const [collection, setCollection] = useState<Collection | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)

  const loadCollection = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/collections/${collectionId}?includeStories=true`)
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Collection not found')
        }
        if (response.status === 403) {
          throw new Error('This collection is private')
        }
        throw new Error('Failed to fetch collection')
      }

      const data = await response.json()
      setCollection(data.collection)
    } catch (err) {
      console.error('Error loading collection:', err)
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [collectionId])

  useEffect(() => {
    loadCollection()
  }, [loadCollection])

  const handleStoryAdded = () => {
    loadCollection()
    setShowAddModal(false)
  }

  const handleStoryRemoved = async (storyId: string) => {
    try {
      const response = await fetch(`/api/collections/${collectionId}/stories?storyId=${storyId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to remove story')
      }

      loadCollection()
    } catch (err) {
      console.error('Error removing story:', err)
      alert('Failed to remove story from collection')
    }
  }

  const isOwner = currentUserId && collection && collection.user_id === currentUserId

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center min-h-[400px]">
            <Spinner size="lg" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !collection) {
    return (
      <div className="min-h-screen bg-gray-900 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <EmptyState
            title={error?.message || 'Collection not found'}
            description="The collection you're looking for doesn't exist or is private"
            actionLabel="Go Back"
            onAction={() => router.push('/collections')}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Link href="/collections" className="text-blue-400 hover:text-blue-300 mb-4 inline-block">
            ← Back to Collections
          </Link>

          <div className="flex items-start gap-6">
            <div className="relative w-32 h-32 rounded-lg overflow-hidden bg-gray-700 flex-shrink-0">
              {collection.cover_image_url ? (
                <Image
                  src={collection.cover_image_url}
                  alt={collection.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-5xl">📚</div>
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">{collection.name}</h1>
                  {collection.description && (
                    <p className="text-gray-400 mb-4">{collection.description}</p>
                  )}
                </div>
                {!collection.is_public && (
                  <span className="bg-gray-700 px-3 py-1 rounded text-sm text-gray-300">
                    Private
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                <span>
                  {collection.stories_count} {collection.stories_count === 1 ? 'story' : 'stories'}
                </span>
                {collection.author && (
                  <Link href={`/profile/${collection.author.id}`} className="hover:text-blue-400">
                    by {collection.author.username}
                  </Link>
                )}
              </div>

              {isOwner && (
                <div className="flex gap-3">
                  <Button
                    onClick={() => setShowAddModal(true)}
                    variant="primary"
                  >
                    + Add Stories
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {collection.stories && collection.stories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {collection.stories.map((story) => (
              <div key={story.id} className="relative">
                <StoryCard story={story} />
                {isOwner && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleStoryRemoved(story.id)}
                    className="absolute top-2 right-2 bg-gray-900/80 hover:bg-gray-800"
                  >
                    Remove
                  </Button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No stories yet"
            description={isOwner ? "Add stories to this collection to get started" : "This collection is empty"}
            actionLabel={isOwner ? "Add Stories" : undefined}
            onAction={isOwner ? () => setShowAddModal(true) : undefined}
          />
        )}

        {showAddModal && isOwner && (
          <AddStoryToCollectionModal
            collectionId={collectionId}
            existingStoryIds={collection.stories?.map(s => s.id) || []}
            onClose={() => setShowAddModal(false)}
            onAdded={handleStoryAdded}
          />
        )}
      </div>
    </div>
  )
}

