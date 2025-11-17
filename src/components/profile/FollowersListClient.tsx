'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Button } from '@/components/ui/Button'

interface FollowersListClientProps {
  userId: string
  profileUsername: string
}

interface Follower {
  id: string
  username: string
  avatar_url: string | null
  bio: string | null
  followed_at: string
}

export function FollowersListClient({ userId, profileUsername }: FollowersListClientProps) {
  const router = useRouter()
  const [followers, setFollowers] = useState<Follower[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const fetchFollowers = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/follow/${userId}/followers?page=${page}&limit=20`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch followers')
      }

      const data = await response.json()
      setFollowers((prev) => page === 1 ? data.followers : [...prev, ...data.followers])
      setHasMore(page < data.pagination.totalPages)
    } catch (err: any) {
      console.error('Error fetching followers:', err)
      setError(err.message || 'Failed to load followers')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFollowers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="mb-4"
          >
            ← Back
          </Button>
          <h1 className="text-2xl font-bold text-white">
            {profileUsername}&apos;s Followers
          </h1>
        </div>

        {/* Followers List */}
        {loading && page === 1 ? (
          <div className="flex justify-center items-center py-12">
            <Spinner size="lg" />
          </div>
        ) : error ? (
          <ErrorState
            title="Error loading followers"
            message={error}
            onRetry={fetchFollowers}
          />
        ) : followers.length === 0 ? (
          <EmptyState
            icon="👥"
            title="No followers yet"
            description="This user doesn't have any followers yet."
          />
        ) : (
          <>
            <div className="space-y-3">
              {followers.map((follower) => (
                <Link
                  key={follower.id}
                  href={`/profile/${follower.id}`}
                  className="flex items-center gap-4 p-4 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 hover:border-brand-cyan transition-colors"
                >
                  {follower.avatar_url ? (
                    <Image
                      src={follower.avatar_url}
                      alt={follower.username || 'User'}
                      width={48}
                      height={48}
                      className="rounded-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-brand flex items-center justify-center text-white font-semibold">
                      {follower.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white truncate">
                      {follower.username || 'Unknown'}
                    </h3>
                    {follower.bio && (
                      <p className="text-sm text-gray-400 line-clamp-1">
                        {follower.bio}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="flex justify-center mt-6">
                <Button
                  variant="outline"
                  onClick={() => setPage((prev) => prev + 1)}
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Load More'}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

