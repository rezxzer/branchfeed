'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import type { Collection } from '@/types'

interface CollectionCardProps {
  collection: Collection
  onDelete?: (collectionId: string) => void
}

export function CollectionCard({ collection, onDelete }: CollectionCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleDelete = async () => {
    if (!onDelete) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/collections/${collection.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete collection')
      }

      onDelete(collection.id)
    } catch (error) {
      console.error('Error deleting collection:', error)
      alert('Failed to delete collection')
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-750 transition-colors ease-smooth">
      <Link href={`/collections/${collection.id}`}>
        <div className="relative aspect-video bg-gray-700">
          {collection.cover_image_url ? (
            <Image
              src={collection.cover_image_url}
              alt={collection.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-4xl">📚</div>
            </div>
          )}
          {!collection.is_public && (
            <div className="absolute top-2 right-2 bg-gray-900/80 px-2 py-1 rounded text-xs text-gray-300">
              Private
            </div>
          )}
        </div>
      </Link>
      
      <div className="p-4">
        <Link href={`/collections/${collection.id}`}>
          <h3 className="text-lg font-semibold text-white mb-1 hover:text-blue-400 transition-colors">
            {collection.name}
          </h3>
        </Link>
        
        {collection.description && (
          <p className="text-sm text-gray-400 mb-2 line-clamp-2">
            {collection.description}
          </p>
        )}

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">
            {collection.stories_count} {collection.stories_count === 1 ? 'story' : 'stories'}
          </span>
          
          {onDelete && (
            <div className="relative">
              {showDeleteConfirm ? (
                <div className="flex gap-2">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={handleDelete}
                    disabled={isDeleting}
                  >
                    {isDeleting ? <Spinner size="sm" /> : 'Confirm'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isDeleting}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  Delete
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

