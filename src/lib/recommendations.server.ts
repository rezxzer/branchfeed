/**
 * Recommendations Library - Server-Side Functions
 * 
 * This module provides server-side functions for story recommendations.
 * Recommendations are based on:
 * - User interests (liked stories, bookmarked stories)
 * - Viewing history (stories user has viewed)
 * - Similar stories (stories from same authors, similar engagement metrics)
 */

import { createServerSupabaseClient } from './supabase/server'
import type { Story } from '@/types'

/**
 * Get recommended stories for a user
 * @param userId - User ID (optional, if not provided, returns popular stories)
 * @param limit - Number of stories to return (default: 10)
 * @param excludeStoryId - Story ID to exclude from recommendations (optional)
 * @returns Array of recommended stories
 */
export async function getRecommendedStories(
  userId?: string,
  limit: number = 10,
  excludeStoryId?: string
): Promise<Story[]> {
  const supabase = await createServerSupabaseClient()

  if (!supabase) {
    console.error('Supabase client is null. Check environment variables.')
    return []
  }

  // If no user, return popular stories
  if (!userId) {
    return getPopularStories(supabase, limit, excludeStoryId)
  }

  // Get user's liked stories
  const { data: likedStories } = await supabase
    .from('story_likes')
    .select('story_id')
    .eq('user_id', userId)

  // Get user's bookmarked stories
  const { data: bookmarkedStories } = await supabase
    .from('bookmarks')
    .select('story_id')
    .eq('user_id', userId)

  // Get user's viewed stories (from user_story_progress)
  const { data: viewedStories } = await supabase
    .from('user_story_progress')
    .select('story_id')
    .eq('user_id', userId)

  // Get user's followed authors
  const { data: following } = await supabase
    .from('followers')
    .select('following_id')
    .eq('follower_id', userId)

  const likedStoryIds = new Set(likedStories?.map((l) => l.story_id) || [])
  const bookmarkedStoryIds = new Set(bookmarkedStories?.map((b) => b.story_id) || [])
  const viewedStoryIds = new Set(viewedStories?.map((v) => v.story_id) || [])
  const followingIds = new Set(following?.map((f) => f.following_id) || [])

  // Combine all user-interacted story IDs
  const userInteractedStoryIds = new Set([
    ...likedStoryIds,
    ...bookmarkedStoryIds,
    ...viewedStoryIds,
  ])

  // If user has no interactions, return popular stories
  if (userInteractedStoryIds.size === 0 && followingIds.size === 0) {
    return getPopularStories(supabase, limit, excludeStoryId)
  }

  // Get stories from authors the user follows
  let followingStories: Story[] = []
  if (followingIds.size > 0) {
    const { data: storiesFromFollowing } = await supabase
      .from('stories')
      .select(
        `
        *,
        author:profiles(
          id,
          username,
          avatar_url
        )
      `
      )
      .eq('is_root', true)
      .in('author_id', Array.from(followingIds))
      .limit(limit * 2) // Get more to filter later

    // Filter out already interacted stories
    if (storiesFromFollowing) {
      let filteredStories = storiesFromFollowing
      if (userInteractedStoryIds.size > 0) {
        filteredStories = storiesFromFollowing.filter(
          (story: any) => !userInteractedStoryIds.has(story.id)
        )
      }
      followingStories = filteredStories as Story[]
    }
  }

  // Get stories from authors of liked/bookmarked stories
  const { data: interactedStories } = await supabase
    .from('stories')
    .select('author_id')
    .in('id', Array.from(userInteractedStoryIds))
    .limit(100)

  const authorIds = new Set(
    interactedStories?.map((s) => s.author_id).filter((id) => id) || []
  )

  // Get similar stories (from same authors, but not already interacted with)
  let similarStories: Story[] = []
  if (authorIds.size > 0) {
    const { data: storiesFromSameAuthors } = await supabase
      .from('stories')
      .select(
        `
        *,
        author:profiles(
          id,
          username,
          avatar_url
        )
      `
      )
      .eq('is_root', true)
      .in('author_id', Array.from(authorIds))
      .limit(limit * 2)

    // Filter out already interacted stories
    if (storiesFromSameAuthors) {
      let filteredStories = storiesFromSameAuthors
      if (userInteractedStoryIds.size > 0) {
        filteredStories = storiesFromSameAuthors.filter(
          (story: any) => !userInteractedStoryIds.has(story.id)
        )
      }
      similarStories = filteredStories as Story[]
    }
  }

  // Get popular stories (as fallback)
  const popularStories = await getPopularStories(
    supabase,
    limit * 2,
    excludeStoryId
  )

  // Combine and score stories
  const allCandidates = new Map<string, Story & { score: number }>()

  // Score following stories (highest priority)
  followingStories.forEach((story) => {
    if (excludeStoryId && story.id === excludeStoryId) return
    allCandidates.set(story.id, {
      ...story,
      score: 100, // High score for following authors
    })
  })

  // Score similar stories (medium priority)
  similarStories.forEach((story) => {
    if (excludeStoryId && story.id === excludeStoryId) return
    if (allCandidates.has(story.id)) return // Don't override following stories

    const score = 50 + (story.likes_count || 0) * 0.1 + (story.views_count || 0) * 0.01
    allCandidates.set(story.id, {
      ...story,
      score,
    })
  })

  // Score popular stories (lower priority, but still included)
  popularStories.forEach((story) => {
    if (excludeStoryId && story.id === excludeStoryId) return
    if (allCandidates.has(story.id)) return // Don't override higher priority stories

    const score = (story.likes_count || 0) * 0.2 + (story.views_count || 0) * 0.02
    allCandidates.set(story.id, {
      ...story,
      score,
    })
  })

  // Sort by score and take top N
  const sortedStories = Array.from(allCandidates.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)

  // Remove score from final result
  const finalStories = sortedStories.map(({ score, ...story }) => story)

  // Count branches for each story
  const storiesWithBranches = await Promise.all(
    finalStories.map(async (story) => {
      const { count: branchesCount } = await supabase
        .from('story_nodes')
        .select('*', { count: 'exact', head: true })
        .eq('story_id', story.id)

      return {
        ...story,
        branches_count: branchesCount || 0,
      } as Story
    })
  )

  return storiesWithBranches
}

/**
 * Get popular stories (fallback when no user data)
 */
async function getPopularStories(
  supabase: any,
  limit: number,
  excludeStoryId?: string
): Promise<Story[]> {
  let query = supabase
    .from('stories')
    .select(
      `
      *,
      author:profiles(
        id,
        username,
        avatar_url
      )
    `
    )
    .eq('is_root', true)
    .order('likes_count', { ascending: false })
    .order('views_count', { ascending: false })
    .limit(limit * 2) // Get more to filter

  if (excludeStoryId) {
    query = query.neq('id', excludeStoryId)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching popular stories:', error)
    return []
  }

  // Count branches for each story
  const storiesWithBranches = await Promise.all(
    (data || []).map(async (story: any) => {
      const { count: branchesCount } = await supabase
        .from('story_nodes')
        .select('*', { count: 'exact', head: true })
        .eq('story_id', story.id)

      return {
        ...story,
        branches_count: branchesCount || 0,
      } as Story
    })
  )

  return storiesWithBranches.slice(0, limit)
}

