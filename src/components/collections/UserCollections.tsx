'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { CollectionCard } from './CollectionCard'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import type { Collection } from '@/types'

interface UserCollectionsProps {
  userId: string
  isOwnProfile?: boolean
}

export function UserCollections({ userId, isOwnProfile = false }: UserCollectionsProps) {
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const loadCollections = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/collections?userId=${userId}&publicOnly=${!isOwnProfile}`)
      
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
  }, [userId, isOwnProfile])

  useEffect(() => {
    loadCollections()
  }, [loadCollections])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8 text-gray-400">
        Failed to load collections
      </div>
    )
  }

  if (collections.length === 0) {
    return (
      <EmptyState
        title="No collections yet"
        description={isOwnProfile ? "Create your first collection to organize your favorite stories" : "This user hasn't created any public collections"}
      />
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {collections.map((collection) => (
        <CollectionCard
          key={collection.id}
          collection={collection}
          onDelete={isOwnProfile ? (id) => {
            setCollections((prev) => prev.filter((c) => c.id !== id))
          } : undefined}
        />
      ))}
    </div>
  )
}

