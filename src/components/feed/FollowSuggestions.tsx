'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslation } from '@/hooks/useTranslation'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { UserPlus, X } from 'lucide-react'
import { logError, logDebug } from '@/lib/logger'
import type { Profile } from '@/types'

interface FollowSuggestionsProps {
  /** Maximum number of suggestions to show */
  limit?: number
  /** Callback when user follows someone */
  onFollow?: (userId: string) => void
}

/**
 * Component to suggest users to follow when following feed is empty
 */
export function FollowSuggestions({ limit = 5, onFollow }: FollowSuggestionsProps) {
  const { t } = useTranslation()
  const [suggestions, setSuggestions] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [following, setFollowing] = useState<Set<string>>(new Set())

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/follow/suggestions?limit=${limit}`)
        if (!response.ok) {
          throw new Error('Failed to fetch suggestions')
        }
        const data = await response.json()
        setSuggestions(data.suggestions || [])
        logDebug('Fetched follow suggestions', { count: data.suggestions?.length || 0 })
      } catch (err) {
        logError('Error fetching follow suggestions', err)
      } finally {
        setLoading(false)
      }
    }

    fetchSuggestions()
  }, [limit])

  const handleFollow = async (userId: string) => {
    try {
      const response = await fetch(`/api/follow/${userId}`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to follow user')
      }

      setFollowing((prev) => new Set([...prev, userId]))
      onFollow?.(userId)
      logDebug('User followed', { userId })
    } catch (err) {
      logError('Error following user', err)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Spinner size="md" />
      </div>
    )
  }

  if (suggestions.length === 0) {
    return null
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <UserPlus className="w-5 h-5" />
          {t('feed.following.suggestions.title') || 'Follow More Users'}
        </h3>
      </div>
      <p className="text-gray-400 text-sm mb-4">
        {t('feed.following.suggestions.description') || 'Follow these users to see their stories in your feed'}
      </p>
      <div className="space-y-3">
        {suggestions.map((user) => (
          <div
            key={user.id}
            className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors"
          >
            <Link
              href={`/profile/${user.id}`}
              className="flex items-center gap-3 flex-1"
            >
              {user.avatar_url ? (
                <Image
                  src={user.avatar_url}
                  alt={user.username || ''}
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 font-semibold">
                  {user.username?.[0]?.toUpperCase() || '?'}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">{user.username}</p>
                {user.bio && (
                  <p className="text-gray-400 text-sm truncate">{user.bio}</p>
                )}
              </div>
            </Link>
            <Button
              onClick={(e) => {
                e.preventDefault()
                handleFollow(user.id)
              }}
              disabled={following.has(user.id)}
              variant={following.has(user.id) ? 'outline' : 'primary'}
              size="sm"
              className="ml-3"
            >
              {following.has(user.id) ? (
                <>
                  <X className="w-4 h-4 mr-1" />
                  {t('feed.following.suggestions.following') || 'Following'}
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-1" />
                  {t('feed.following.suggestions.follow') || 'Follow'}
                </>
              )}
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}

