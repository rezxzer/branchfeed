'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { FollowButton } from '@/components/profile/FollowButton'
import { Spinner } from '@/components/ui/Spinner'
import { Card } from '@/components/ui/Card'
import type { Profile } from '@/types'

interface SuggestedUser extends Profile {
  suggestionReason?: string
  followersCount?: number
  storiesCount?: number
}

interface FollowSuggestionsProps {
  limit?: number
  title?: string
  showOnEmpty?: boolean
}

export function FollowSuggestions({
  limit = 5,
  title,
  showOnEmpty = false,
}: FollowSuggestionsProps) {
  const router = useRouter()
  const [suggestions, setSuggestions] = useState<SuggestedUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/follow/suggestions?limit=${limit}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch suggestions')
        }

        const data = await response.json()
        setSuggestions(data.suggestions || [])
      } catch (err) {
        console.error('Error fetching follow suggestions:', err)
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchSuggestions()
  }, [limit])

  if (loading) {
    return (
      <div className="mb-6">
        <h2 className="text-lg font-bold text-white mb-4">
          {title || 'Who to follow'}
        </h2>
        <div className="flex justify-center py-4">
          <Spinner size="md" />
        </div>
      </div>
    )
  }

  if (error || (suggestions.length === 0 && !showOnEmpty)) {
    return null
  }

  if (suggestions.length === 0) {
    return (
      <Card variant="default" className="bg-gray-800/50 border-gray-700/50 p-6">
        <h2 className="text-lg font-bold text-white mb-2">
          {title || 'Who to follow'}
        </h2>
        <p className="text-gray-400 text-sm">
          No suggestions available at the moment.
        </p>
      </Card>
    )
  }

  return (
    <Card variant="default" className="bg-gray-800/50 border-gray-700/50 p-6">
      <h2 className="text-lg font-bold text-white mb-4">
        {title || 'Who to follow'}
      </h2>
      <div className="space-y-4">
        {suggestions.map((user) => (
          <div
            key={user.id}
            className="flex items-center justify-between gap-3 p-3 rounded-lg hover:bg-gray-700/30 transition-colors"
          >
            <Link
              href={`/profile/${user.id}`}
              className="flex items-center gap-3 flex-1 min-w-0"
            >
              {user.avatar_url ? (
                <Image
                  src={user.avatar_url}
                  alt={user.username || 'User avatar'}
                  width={40}
                  height={40}
                  className="rounded-full object-cover flex-shrink-0"
                  unoptimized
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-brand flex items-center justify-center text-white font-semibold flex-shrink-0">
                  {user.username?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-white truncate">
                  {user.username}
                </div>
                {user.suggestionReason && (
                  <div className="text-xs text-gray-400 truncate">
                    {user.suggestionReason}
                  </div>
                )}
                {(user.followersCount !== undefined || user.storiesCount !== undefined) && (
                  <div className="text-xs text-gray-500 mt-1">
                    {user.followersCount !== undefined && `${user.followersCount} followers`}
                    {user.followersCount !== undefined && user.storiesCount !== undefined && ' • '}
                    {user.storiesCount !== undefined && `${user.storiesCount} stories`}
                  </div>
                )}
              </div>
            </Link>
            <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
              <FollowButton userId={user.id} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

