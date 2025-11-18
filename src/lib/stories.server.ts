/**
 * Stories Library - Server-Side Functions
 * 
 * This module provides server-side functions for stories.
 * These functions use 'next/headers' and can only be used in Server Components.
 */

import { createServerSupabaseClient } from './supabase/server'
import type { Story } from '@/types'

// ============================================
// Story Fetching Functions (Server-Side)
// ============================================

/**
 * Get story by ID (server-side)
 * Use this in Server Components and Server Actions
 * @param storyId - Story ID
 * @returns Story with author profile and userHasLiked status
 */
export async function getStoryById(storyId: string): Promise<Story | null> {
  const supabase = await createServerSupabaseClient()

  if (!supabase) {
    console.error('Supabase client is null. Check environment variables.')
    return null
  }

  // Get current user to check like status
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('stories')
    .select(
      `
      *,
      author:profiles(
        id,
        username,
        avatar_url
      ),
      story_tags(
        tag:tags(
          id,
          name,
          slug,
          description,
          color,
          created_at,
          updated_at
        )
      )
    `
    )
    .eq('id', storyId)
    .single()

  if (error) {
    console.error('Error fetching story:', error)
    return null
  }

  if (!data) {
    return null
  }

  // Check if user has liked/bookmarked/shared this story
  let userHasLiked = false
  let isBookmarked = false
  let userHasShared = false
  if (user) {
    const { data: likeData } = await supabase
      .from('story_likes')
      .select('id')
      .eq('story_id', storyId)
      .eq('user_id', user.id)
      .maybeSingle()

    userHasLiked = !!likeData

    // Check if user has bookmarked this story
    const { data: bookmarkData } = await supabase
      .from('bookmarks')
      .select('id')
      .eq('story_id', storyId)
      .eq('user_id', user.id)
      .maybeSingle()

    isBookmarked = !!bookmarkData

    // Check if user has shared this story
    const { data: shareData } = await supabase
      .from('story_shares')
      .select('id')
      .eq('story_id', storyId)
      .eq('user_id', user.id)
      .maybeSingle()

    userHasShared = !!shareData
  }

  // Count branches
  const { count: branchesCount } = await supabase
    .from('story_nodes')
    .select('*', { count: 'exact', head: true })
    .eq('story_id', storyId)

  // Extract tags from nested structure
  const tags = (data.story_tags as any[])?.map((st: any) => st.tag).filter(Boolean) || []

  return {
    ...data,
    userHasLiked,
    userHasShared,
    isBookmarked,
    branches_count: branchesCount || 0,
    tags,
  } as Story
}

/**
 * Get trending stories (server-side)
 * Calculates trending score based on views, likes, comments, and time decay
 * @param limit - Number of stories to return (default: 20)
 * @param offset - Offset for pagination (default: 0)
 * @param timeRange - Time range: '24h' | '7d' | '30d' | 'all' (default: '7d')
 * @returns Array of trending stories
 */
export async function getTrendingStories(
  limit: number = 20,
  offset: number = 0,
  timeRange: '24h' | '7d' | '30d' | 'all' = '7d'
): Promise<Story[]> {
  const supabase = await createServerSupabaseClient()

  if (!supabase) {
    console.error('Supabase client is null. Check environment variables.')
    return []
  }
  
  // Get current user to check share status
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Calculate time threshold based on timeRange
  const now = new Date()
  let timeThreshold: Date | null = null

  if (timeRange === '24h') {
    timeThreshold = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  } else if (timeRange === '7d') {
    timeThreshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  } else if (timeRange === '30d') {
    timeThreshold = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  }

  // Build query
  let query = supabase
    .from('stories')
    .select(
      `
      *,
      author:profiles(
        id,
        username,
        avatar_url
      ),
      story_tags(
        tag:tags(
          id,
          name,
          slug,
          description,
          color,
          created_at,
          updated_at
        )
      )
    `
    )
    .eq('is_root', true)
    .eq('status', 'published') // Only show published stories

  // Filter by time range if specified
  if (timeThreshold) {
    query = query.gte('created_at', timeThreshold.toISOString())
  }

  const { data: stories, error } = await query

  if (error) {
    console.error('Error fetching trending stories:', error)
    return []
  }

  if (!stories || stories.length === 0) {
    return []
  }

  // Calculate trending score for each story
  const storiesWithScore = stories.map((story: any) => {
    const views = story.views_count || 0
    const likes = story.likes_count || 0
    const comments = story.comments_count || 0
    const shares = story.shares_count || 0
    
    // Time decay factor (newer stories get boost)
    const storyAge = now.getTime() - new Date(story.created_at).getTime()
    const hoursSinceCreation = storyAge / (1000 * 60 * 60)
    
    // Decay factor: stories get less boost as they age
    // Formula: 1 / (1 + hours/24) - gives 1.0 for new stories, ~0.5 after 24h, ~0.33 after 48h
    const timeDecay = 1 / (1 + hoursSinceCreation / 24)
    
    // Trending score calculation
    // Weights: views (1x), likes (3x), comments (2x), shares (2x), time decay multiplier
    const trendingScore = (views * 1 + likes * 3 + comments * 2 + shares * 2) * (1 + timeDecay * 0.5)
    
    return {
      ...story,
      trendingScore,
    }
  })

  // Sort by trending score (descending)
  storiesWithScore.sort((a, b) => b.trendingScore - a.trendingScore)

  // Apply pagination
  const paginatedStories = storiesWithScore.slice(offset, offset + limit)

  // Get user's shared stories if authenticated
  let userSharedStories: Set<string> = new Set()
  if (user) {
    const { data: userShares } = await supabase
      .from('story_shares')
      .select('story_id')
      .eq('user_id', user.id)
    
    if (userShares) {
      userSharedStories = new Set(userShares.map((share: { story_id: string }) => share.story_id))
    }
  }

  // Count branches for each story and add share status
  const storiesWithBranches = await Promise.all(
    paginatedStories.map(async (story: any) => {
      const { count: branchesCount } = await supabase
        .from('story_nodes')
        .select('*', { count: 'exact', head: true })
        .eq('story_id', story.id)

      // Extract tags from nested structure
      const tags = story.story_tags?.map((st: any) => st.tag).filter(Boolean) || []

      return {
        ...story,
        branches_count: branchesCount || 0,
        // Remove trendingScore from final result (internal calculation only)
        trendingScore: undefined,
        isBookmarked: story.isBookmarked || false,
        userHasShared: user ? userSharedStories.has(story.id) : false,
        tags,
      } as Story
    })
  )

  return storiesWithBranches
}

/**
 * Get stories from followed users (server-side)
 * @param userId - User ID
 * @param limit - Number of stories to return (default: 20)
 * @param offset - Offset for pagination (default: 0)
 * @returns Array of stories from followed users
 */
export async function getFollowingStories(
  userId: string,
  limit: number = 20,
  offset: number = 0
): Promise<Story[]> {
  const supabase = await createServerSupabaseClient()

  if (!supabase) {
    console.error('Supabase client is null. Check environment variables.')
    return []
  }

  // Get list of followed user IDs
  const { data: following, error: followingError } = await supabase
    .from('followers')
    .select('following_id')
    .eq('follower_id', userId)

  if (followingError) {
    console.error('Error fetching following list:', followingError)
    return []
  }

  if (!following || following.length === 0) {
    return []
  }

  const followingIds = following.map((f) => f.following_id)

  // Get stories from followed users
  const { data: stories, error: storiesError } = await supabase
    .from('stories')
    .select(
      `
      *,
      author:profiles(
        id,
        username,
        avatar_url
      ),
      story_tags(
        tag:tags(
          id,
          name,
          slug,
          description,
          color,
          created_at,
          updated_at
        )
      )
    `
    )
    .eq('is_root', true)
    .eq('status', 'published') // Only show published stories
    .in('author_id', followingIds)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (storiesError) {
    console.error('Error fetching following stories:', storiesError)
    return []
  }

  if (!stories || stories.length === 0) {
    return []
  }

  // Count branches for each story
  const storiesWithBranches = await Promise.all(
    (stories || []).map(async (story: any) => {
      const { count: branchesCount } = await supabase
        .from('story_nodes')
        .select('*', { count: 'exact', head: true })
        .eq('story_id', story.id)

      // Get user's bookmarked and shared stories if authenticated
      let isBookmarked = false
      let userHasShared = false
      if (userId) {
        const { data: bookmarkData } = await supabase
          .from('bookmarks')
          .select('id')
          .eq('story_id', story.id)
          .eq('user_id', userId)
          .maybeSingle()
        
        isBookmarked = !!bookmarkData

        const { data: shareData } = await supabase
          .from('story_shares')
          .select('id')
          .eq('story_id', story.id)
          .eq('user_id', userId)
          .maybeSingle()
        
        userHasShared = !!shareData
      }

      // Extract tags from nested structure
      const tags = story.story_tags?.map((st: any) => st.tag).filter(Boolean) || []

      return {
        ...story,
        branches_count: branchesCount || 0,
        isBookmarked,
        userHasShared,
        tags,
      } as Story
    })
  )

  return storiesWithBranches
}
