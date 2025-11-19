'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Spinner } from '@/components/ui/Spinner'
import type { Story } from '@/types'

interface AddStoryToCollectionModalProps {
  collectionId: string
  existingStoryIds: string[]
  onClose: () => void
  onAdded: () => void
}

export function AddStoryToCollectionModal({
  collectionId,
  existingStoryIds,
  onClose,
  onAdded,
}: AddStoryToCollectionModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(false)
  const [addingStoryId, setAddingStoryId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const searchStories = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&type=stories&limit=20`)
      
      if (!response.ok) {
        throw new Error('Failed to search stories')
      }

      const data = await response.json()
      // Filter out stories that are already in the collection
      const filteredStories = (data.stories || []).filter(
        (story: Story) => !existingStoryIds.includes(story.id)
      )
      setStories(filteredStories)
    } catch (err) {
      console.error('Error searching stories:', err)
      setError(err instanceof Error ? err.message : 'Failed to search stories')
    } finally {
      setLoading(false)
    }
  }, [searchQuery, existingStoryIds])

  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      searchStories()
    } else {
      setStories([])
    }
  }, [searchQuery, searchStories])

  const handleAddStory = async (storyId: string) => {
    setAddingStoryId(storyId)
    try {
      const response = await fetch(`/api/collections/${collectionId}/stories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ storyId }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to add story')
      }

      // Remove added story from list
      setStories((prev) => prev.filter((s) => s.id !== storyId))
      onAdded()
    } catch (err) {
      console.error('Error adding story:', err)
      alert(err instanceof Error ? err.message : 'Failed to add story')
    } finally {
      setAddingStoryId(null)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[80vh] flex flex-col">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-2">Add Stories to Collection</h2>
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search stories by title..."
            className="w-full"
          />
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Spinner size="lg" />
            </div>
          ) : error ? (
            <div className="bg-red-900/20 border border-red-500/50 rounded p-3 text-sm text-red-400">
              {error}
            </div>
          ) : stories.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              {searchQuery.trim().length < 2
                ? 'Type at least 2 characters to search'
                : 'No stories found'}
            </div>
          ) : (
            <div className="space-y-3">
              {stories.map((story) => (
                <div
                  key={story.id}
                  className="flex items-center gap-4 p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="text-white font-medium mb-1">{story.title}</h3>
                    {story.description && (
                      <p className="text-sm text-gray-400 line-clamp-1">{story.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                      <span>{story.views_count} views</span>
                      <span>{story.likes_count} likes</span>
                      {story.author && (
                        <span>by {story.author.username}</span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleAddStory(story.id)}
                    disabled={addingStoryId === story.id}
                  >
                    {addingStoryId === story.id ? <Spinner size="sm" /> : 'Add'}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-700">
          <Button variant="ghost" onClick={onClose} className="w-full">
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}

