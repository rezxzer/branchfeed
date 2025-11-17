/**
 * Follow Suggestions Library - Server-Side Functions
 * 
 * This module provides server-side functions for user follow suggestions.
 * Suggestions are based on:
 * - Mutual connections (users who follow users you follow)
 * - Popular creators (users with most followers/stories)
 * - Authors of stories you've liked/bookmarked
 * - Similar interests
 */

import { createServerSupabaseClient } from './supabase/server'
import type { Profile } from '@/types'

interface SuggestedUser extends Profile {
  suggestionReason?: string
  followersCount?: number
  storiesCount?: number
}

/**
 * Get suggested users to follow
 * @param userId - User ID
 * @param limit - Number of suggestions to return (default: 10)
 * @returns Array of suggested users with reasons
 */
export async function getFollowSuggestions(
  userId: string,
  limit: number = 10
): Promise<SuggestedUser[]> {
  const supabase = await createServerSupabaseClient()

  if (!supabase) {
    console.error('Supabase client is null. Check environment variables.')
    return []
  }

  // Get user's following list
  const { data: following } = await supabase
    .from('followers')
    .select('following_id')
    .eq('follower_id', userId)

  const followingIds = new Set(following?.map((f) => f.following_id) || [])

  // Get user's liked/bookmarked stories to find authors
  const { data: likedStories } = await supabase
    .from('story_likes')
    .select('story_id')
    .eq('user_id', userId)

  const { data: bookmarkedStories } = await supabase
    .from('bookmarks')
    .select('story_id')
    .eq('user_id', userId)

  const interactedStoryIds = new Set([
    ...(likedStories?.map((l) => l.story_id) || []),
    ...(bookmarkedStories?.map((b) => b.story_id) || []),
  ])

  // Get authors of interacted stories
  let authorIds = new Set<string>()
  if (interactedStoryIds.size > 0) {
    const { data: stories } = await supabase
      .from('stories')
      .select('author_id')
      .in('id', Array.from(interactedStoryIds))
      .limit(100)

    authorIds = new Set(stories?.map((s) => s.author_id).filter((id) => id) || [])
  }

  // Get mutual connections (users who follow users you follow)
  let mutualConnections: Map<string, number> = new Map()
  if (followingIds.size > 0) {
    const { data: mutualFollows } = await supabase
      .from('followers')
      .select('follower_id, following_id')
      .in('following_id', Array.from(followingIds))
      .neq('follower_id', userId) // Exclude self

    if (mutualFollows) {
      mutualFollows.forEach((follow) => {
        if (!followingIds.has(follow.follower_id)) {
          // This user follows someone you follow
          const count = mutualConnections.get(follow.follower_id) || 0
          mutualConnections.set(follow.follower_id, count + 1)
        }
      })
    }
  }

  // Get all candidate users
  const allCandidates = new Map<string, SuggestedUser & { score: number; reason: string }>()

  // Score mutual connections (highest priority)
  for (const [candidateUserId, mutualCount] of mutualConnections.entries()) {
    if (candidateUserId === userId) continue // Skip self

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', candidateUserId)
      .single()

    if (profile) {
      allCandidates.set(candidateUserId, {
        ...profile,
        score: 100 + mutualCount * 10, // Higher score for more mutual connections
        suggestionReason: `${mutualCount} mutual ${mutualCount === 1 ? 'connection' : 'connections'}`,
      })
    }
  }

  // Score authors of interacted stories (medium priority)
  for (const authorId of authorIds) {
    if (authorId === userId || followingIds.has(authorId) || allCandidates.has(authorId)) {
      continue
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authorId)
      .single()

    if (profile) {
      allCandidates.set(authorId, {
        ...profile,
        score: 50,
        suggestionReason: 'Author of stories you liked',
      })
    }
  }

  // Get popular creators (users with most followers/stories) as fallback
  const { data: popularUsers } = await supabase
    .from('profiles')
    .select('*')
    .neq('id', userId)
    .limit(limit * 3)

  if (popularUsers) {
    // Get follower counts for popular users
    const popularUserIds = popularUsers.map((u) => u.id)
    const { data: followerCounts } = await supabase
      .from('followers')
      .select('following_id')
      .in('following_id', popularUserIds)

    // Get story counts
    const { data: storyCounts } = await supabase
      .from('stories')
      .select('author_id')
      .in('author_id', popularUserIds)
      .eq('is_root', true)

    const followersMap = new Map<string, number>()
    const storiesMap = new Map<string, number>()

    followerCounts?.forEach((f) => {
      followersMap.set(f.following_id, (followersMap.get(f.following_id) || 0) + 1)
    })

    storyCounts?.forEach((s) => {
      storiesMap.set(s.author_id, (storiesMap.get(s.author_id) || 0) + 1)
    })

    popularUsers.forEach((user) => {
      if (followingIds.has(user.id) || allCandidates.has(user.id)) {
        return
      }

      const followersCount = followersMap.get(user.id) || 0
      const storiesCount = storiesMap.get(user.id) || 0
      const score = followersCount * 2 + storiesCount * 5

      allCandidates.set(user.id, {
        ...user,
        score,
        suggestionReason: 'Popular creator',
        followersCount,
        storiesCount,
      })
    })
  }

  // Sort by score and take top N
  const sortedSuggestions = Array.from(allCandidates.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)

  // Remove score from final result
  return sortedSuggestions.map(({ score, ...user }) => user)
}

