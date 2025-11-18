'use client'

import { useState, useEffect, useCallback } from 'react'
import { getTags } from '@/lib/tags'
import type { Tag } from '@/types'
import { Spinner } from '@/components/ui/Spinner'

interface TagSelectorProps {
  selectedTagIds: string[]
  onSelectionChange: (tagIds: string[]) => void
  maxTags?: number
}

export function TagSelector({
  selectedTagIds,
  onSelectionChange,
  maxTags = 5,
}: TagSelectorProps) {
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchTags = async () => {
      try {
        setLoading(true)
        const fetchedTags = await getTags(searchQuery, 50)
        setTags(fetchedTags)
      } catch (error) {
        console.error('Error fetching tags:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTags()
  }, [searchQuery])

  const handleTagToggle = useCallback(
    (tagId: string) => {
      if (selectedTagIds.includes(tagId)) {
        // Remove tag
        onSelectionChange(selectedTagIds.filter((id) => id !== tagId))
      } else {
        // Add tag (if under max limit)
        if (selectedTagIds.length < maxTags) {
          onSelectionChange([...selectedTagIds, tagId])
        }
      }
    },
    [selectedTagIds, onSelectionChange, maxTags]
  )

  const selectedTags = tags.filter((tag) => selectedTagIds.includes(tag.id))
  const availableTags = tags.filter((tag) => !selectedTagIds.includes(tag.id))

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Tags ({selectedTagIds.length}/{maxTags})
        </label>
        <p className="text-xs text-gray-400 mb-3">
          Add tags to help others discover your story
        </p>
        
        {/* Search input */}
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search tags..."
          className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-cyan focus:border-transparent"
        />
      </div>

      {/* Selected tags */}
      {selectedTags.length > 0 && (
        <div>
          <p className="text-xs text-gray-400 mb-2">Selected:</p>
          <div className="flex flex-wrap gap-2">
            {selectedTags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => handleTagToggle(tag.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-white bg-brand-cyan/20 border border-brand-cyan/50 hover:bg-brand-cyan/30 transition-colors"
                style={
                  tag.color
                    ? {
                        backgroundColor: `${tag.color}20`,
                        borderColor: `${tag.color}50`,
                      }
                    : undefined
                }
              >
                <span>{tag.name}</span>
                <span className="text-brand-cyan">×</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Available tags */}
      {loading ? (
        <div className="flex justify-center py-4">
          <Spinner size="sm" />
        </div>
      ) : (
        <div>
          <p className="text-xs text-gray-400 mb-2">Available tags:</p>
          <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
            {availableTags.length === 0 ? (
              <p className="text-sm text-gray-500">No tags found</p>
            ) : (
              availableTags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => handleTagToggle(tag.id)}
                  disabled={selectedTagIds.length >= maxTags}
                  className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium text-gray-300 bg-gray-800/50 border border-gray-700/50 hover:bg-gray-700/50 hover:border-gray-600/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style={
                    tag.color
                      ? {
                          borderColor: `${tag.color}30`,
                        }
                      : undefined
                  }
                >
                  {tag.name}
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {selectedTagIds.length >= maxTags && (
        <p className="text-xs text-yellow-400">
          Maximum {maxTags} tags allowed
        </p>
      )}
    </div>
  )
}

