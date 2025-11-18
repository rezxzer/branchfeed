'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { CollectionCard } from './CollectionCard'
import { CreateCollectionModal } from './CreateCollectionModal'
import type { Collection } from '@/types'

export function CollectionsPageClient() {
  const router = useRouter()
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)

  const loadCollections = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/collections')
      
      if (!response.ok) {
        throw new Error('Failed to fetch collections')
      }

      const data = await response.json()
      setCollections(data.collections || [])
    } catch (err) {
      console.error('Error loading collections:', err)
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCollections()
  }, [loadCollections])

  const handleCollectionCreated = (collection: Collection) => {
    setCollections((prev) => [collection, ...prev])
    setShowCreateModal(false)
  }

  const handleCollectionDeleted = (collectionId: string) => {
    setCollections((prev) => prev.filter((c) => c.id !== collectionId))
  }

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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <EmptyState
            title="Error loading collections"
            description={error.message}
            actionLabel="Retry"
            onAction={loadCollections}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">My Collections</h1>
            <p className="text-gray-400">
              Organize your favorite stories into collections
            </p>
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            variant="primary"
          >
            + Create Collection
          </Button>
        </div>

        {collections.length === 0 ? (
          <EmptyState
            title="No collections yet"
            description="Create your first collection to organize your favorite stories"
            actionLabel="Create Collection"
            onAction={() => setShowCreateModal(true)}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {collections.map((collection) => (
              <CollectionCard
                key={collection.id}
                collection={collection}
                onDelete={handleCollectionDeleted}
              />
            ))}
          </div>
        )}

        {showCreateModal && (
          <CreateCollectionModal
            onClose={() => setShowCreateModal(false)}
            onCreated={handleCollectionCreated}
          />
        )}
      </div>
    </div>
  )
}

