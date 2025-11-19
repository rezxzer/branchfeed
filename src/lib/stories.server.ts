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
  timeRange: '24h' | '7d' | '30d' | 'all' = '7d',
  tagId?: string
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

  // Filter by tag after fetching if tagId is provided
  // Note: Supabase PostgREST doesn't support direct filtering on nested relations
  let filteredStories = stories
  if (tagId) {
    filteredStories = stories.filter((story: any) => {
      const tags = story.story_tags?.map((st: any) => st.tag).filter(Boolean) || []
      return tags.some((tag: any) => tag.id === tagId)
    })
  }

  if (filteredStories.length === 0) {
    return []
  }

  // Get recent engagement data for velocity calculation (last 24 hours)
  // This helps identify stories that are gaining traction quickly
  const recentEngagementMap = new Map<string, { likes: number; comments: number }>()
  
  // Fetch recent likes (last 24h) - all users, not just current user
  const { data: recentLikes } = await supabase
    .from('story_likes')
    .select('story_id')
    .gte('created_at', new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString())
  
  // Fetch recent comments (last 24h)
  const { data: recentComments } = await supabase
    .from('comments')
    .select('story_id')
    .gte('created_at', new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString())
  
  // Build engagement map
  if (recentLikes) {
    recentLikes.forEach((like: { story_id: string }) => {
      const current = recentEngagementMap.get(like.story_id) || { likes: 0, comments: 0 }
      recentEngagementMap.set(like.story_id, { ...current, likes: current.likes + 1 })
    })
  }
  
  if (recentComments) {
    recentComments.forEach((comment: { story_id: string }) => {
      const current = recentEngagementMap.get(comment.story_id) || { likes: 0, comments: 0 }
      recentEngagementMap.set(comment.story_id, { ...current, comments: current.comments + 1 })
    })
  }
  
  // Get completion rates (users who completed the story) - all users
  const completionRateMap = new Map<string, number>()
  const { data: progressData } = await supabase
    .from('user_story_progress')
    .select('story_id')
    .eq('completed', true)
  
  if (progressData) {
    progressData.forEach((progress: { story_id: string }) => {
      const current = completionRateMap.get(progress.story_id) || 0
      completionRateMap.set(progress.story_id, current + 1)
    })
  }
  
  // Get branches count for all stories (needed for branches factor)
  const branchesCountMap = new Map<string, number>()
  for (const story of filteredStories) {
    const { count } = await supabase
      .from('story_nodes')
      .select('*', { count: 'exact', head: true })
      .eq('story_id', story.id)
    branchesCountMap.set(story.id, count || 0)
  }

  // Calculate trending score for each story
  const storiesWithScore = filteredStories.map((story: any) => {
    const views = story.views_count || 0
    const likes = story.likes_count || 0
    const comments = story.comments_count || 0
    const shares = story.shares_count || 0
    const branches = branchesCountMap.get(story.id) || 0
    
    // Get recent engagement (velocity factor)
    const recentEngagement = recentEngagementMap.get(story.id) || { likes: 0, comments: 0 }
    const recentLikesCount = recentEngagement.likes
    const recentCommentsCount = recentEngagement.comments
    
    // Velocity factor: recent engagement vs total engagement
    // Stories with high recent engagement get boost (trending up)
    const recentEngagementTotal = recentLikesCount + recentCommentsCount
    const totalEngagement = likes + comments
    const velocityFactor = totalEngagement > 0 
      ? 1 + (recentEngagementTotal / Math.max(totalEngagement, 1)) * 0.5
      : 1
    
    // Engagement rate: quality over quantity
    // Higher likes/views ratio = better content
    const engagementRate = views > 0 
      ? Math.min(likes / views, 1) // Cap at 1.0 (100% like rate)
      : 0
    const engagementRateBoost = 1 + engagementRate * 0.3 // Up to 30% boost
    
    // Branches factor: branching stories get boost (core feature of BranchFeed)
    // Stories with more branches are more interactive and engaging
    const branchesFactor = 1 + Math.min(branches / 10, 0.2) // Up to 20% boost for stories with many branches
    
    // Completion rate factor: stories that users complete are more engaging
    const completions = completionRateMap.get(story.id) || 0
    const completionRate = views > 0 
      ? Math.min(completions / Math.max(views, 1), 1)
      : 0
    const completionBoost = 1 + completionRate * 0.2 // Up to 20% boost
    
    // Time decay factor (exponential decay - more sophisticated than linear)
    const storyAge = now.getTime() - new Date(story.created_at).getTime()
    const hoursSinceCreation = storyAge / (1000 * 60 * 60)
    const daysSinceCreation = hoursSinceCreation / 24
    
    // Exponential decay: e^(-λt) where λ controls decay rate
    // For 24h: ~0.6, for 7d: ~0.3, for 30d: ~0.1
    // This gives newer stories a natural boost while still allowing older viral content to rank
    const decayRate = 0.1 // Adjustable: lower = slower decay, higher = faster decay
    const timeDecay = Math.exp(-decayRate * daysSinceCreation)
    
    // Base score with weights
    // Weights: views (1x), likes (4x), comments (3x), shares (3x)
    // Increased like weight from 3x to 4x for better quality signal
    const baseScore = views * 1 + likes * 4 + comments * 3 + shares * 3
    
    // Apply all factors multiplicatively
    const trendingScore = baseScore 
      * velocityFactor           // Recent engagement boost (trending up)
      * engagementRateBoost      // Quality boost (high like rate)
      * branchesFactor           // Branching stories boost (core feature)
      * completionBoost          // Completion rate boost (engaging content)
      * (1 + timeDecay * 0.5)    // Time decay multiplier (newer = better)
    
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

  // Add share status and finalize story data
  // Branches count already fetched above, so we can reuse it
  const storiesWithBranches = paginatedStories.map((story: any) => {
    // Get branches count from pre-calculated map
    const branchesCount = branchesCountMap.get(story.id) || 0

    // Extract tags from nested structure
    const tags = story.story_tags?.map((st: any) => st.tag).filter(Boolean) || []

    return {
      ...story,
      branches_count: branchesCount,
      // Remove trendingScore from final result (internal calculation only)
      trendingScore: undefined,
      isBookmarked: story.isBookmarked || false,
      userHasShared: user ? userSharedStories.has(story.id) : false,
      tags,
    } as Story
  })

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
