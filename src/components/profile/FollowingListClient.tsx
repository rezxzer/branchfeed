'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Button } from '@/components/ui/Button'

interface FollowingListClientProps {
  userId: string
  profileUsername: string
}

interface Following {
  id: string
  username: string
  avatar_url: string | null
  bio: string | null
  followed_at: string
}

export function FollowingListClient({ userId, profileUsername }: FollowingListClientProps) {
  const router = useRouter()
  const [following, setFollowing] = useState<Following[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const fetchFollowing = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/follow/${userId}/following?page=${page}&limit=20`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch following')
      }

      const data = await response.json()
      setFollowing((prev) => page === 1 ? data.following : [...prev, ...data.following])
      setHasMore(page < data.pagination.totalPages)
    } catch (err: any) {
      console.error('Error fetching following:', err)
      setError(err.message || 'Failed to load following')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFollowing()
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
            {profileUsername}&apos;s Following
          </h1>
        </div>

        {/* Following List */}
        {loading && page === 1 ? (
          <div className="flex justify-center items-center py-12">
            <Spinner size="lg" />
          </div>
        ) : error ? (
          <ErrorState
            title="Error loading following"
            message={error}
            onRetry={fetchFollowing}
          />
        ) : following.length === 0 ? (
          <EmptyState
            icon="👥"
            title="Not following anyone"
            description="This user is not following anyone yet."
          />
        ) : (
          <>
            <div className="space-y-3">
              {following.map((user) => (
                <Link
                  key={user.id}
                  href={`/profile/${user.id}`}
                  className="flex items-center gap-4 p-4 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 hover:border-brand-cyan transition-colors"
                >
                  {user.avatar_url ? (
                    <Image
                      src={user.avatar_url}
                      alt={user.username || 'User'}
                      width={48}
                      height={48}
                      className="rounded-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-brand flex items-center justify-center text-white font-semibold">
                      {user.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white truncate">
                      {user.username || 'Unknown'}
                    </h3>
                    {user.bio && (
                      <p className="text-sm text-gray-400 line-clamp-1">
                        {user.bio}
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

