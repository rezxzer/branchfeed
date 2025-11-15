'use client'

import { createClientClient } from '@/lib/supabase/client'

export interface LikeStatus {
  isLiked: boolean
  likesCount: number
}

/**
 * Like a story
 */
export async function likeStory(storyId: string): Promise<void> {
  const supabase = createClientClient()

  if (!supabase) {
    throw new Error('Supabase client is null. Check environment variables.')
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('User not authenticated')
  }

  const { error } = await supabase
    .from('likes')
    .insert({
      story_id: storyId,
      user_id: user.id,
    })

  if (error) {
    // If already liked, ignore error (idempotent)
    if (error.code === '23505') {
      // Unique constraint violation - already liked
      return
    }
    
    // If table doesn't exist, ignore error gracefully
    if (
      error.code === 'PGRST116' ||
      error.code === '42P01' || // PostgreSQL: relation does not exist
      error.message?.includes('relation') ||
      error.message?.includes('does not exist') ||
      error.message?.includes('table') ||
      error.message?.includes('schema cache')
    ) {
      console.warn('Likes table not found. Database setup may be needed.')
      return
    }
    
    throw new Error(`Like failed: ${error.message}`)
  }
}

/**
 * Unlike a story
 */
export async function unlikeStory(storyId: string): Promise<void> {
  const supabase = createClientClient()

  if (!supabase) {
    throw new Error('Supabase client is null. Check environment variables.')
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('User not authenticated')
  }

  const { error } = await supabase
    .from('likes')
    .delete()
    .eq('story_id', storyId)
    .eq('user_id', user.id)

  if (error) {
    // If table doesn't exist, ignore error gracefully
    if (
      error.code === 'PGRST116' ||
      error.code === '42P01' || // PostgreSQL: relation does not exist
      error.message?.includes('relation') ||
      error.message?.includes('does not exist') ||
      error.message?.includes('table') ||
      error.message?.includes('schema cache')
    ) {
      console.warn('Likes table not found. Database setup may be needed.')
      return
    }
    throw new Error(`Unlike failed: ${error.message}`)
  }
}

/**
 * Get like status for a story
 */
export async function getLikeStatus(storyId: string): Promise<LikeStatus> {
  const supabase = createClientClient()

  if (!supabase) {
    console.error('Supabase client is null. Check environment variables.')
    return {
      isLiked: false,
      likesCount: 0,
    }
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  // If not authenticated, return default with likes_count from stories table
  if (authError || !user) {
    try {
      const { data: story } = await supabase
        .from('stories')
        .select('likes_count')
        .eq('id', storyId)
        .single()

      return {
        isLiked: false,
        likesCount: story?.likes_count || 0,
      }
    } catch (err) {
      // If table doesn't exist, return default
      return {
        isLiked: false,
        likesCount: 0,
      }
    }
  }

  try {
    // Get like count from stories table (cached)
    const { data: story, error: storyError } = await supabase
      .from('stories')
      .select('likes_count')
      .eq('id', storyId)
      .single()

    // If story not found or table doesn't exist, return default
    if (storyError) {
      if (
        storyError.code === 'PGRST116' ||
        storyError.code === '42P01' ||
        storyError.message?.includes('relation') ||
        storyError.message?.includes('does not exist') ||
        storyError.message?.includes('table')
      ) {
        console.warn('Stories table not found. Database setup may be needed.')
        return {
          isLiked: false,
          likesCount: 0,
        }
      }
    }

    // Check if user has liked
    const { data: like, error: likeError } = await supabase
      .from('likes')
      .select('id')
      .eq('story_id', storyId)
      .eq('user_id', user.id)
      .maybeSingle()

    // If likes table doesn't exist, return default with story likes_count
    if (likeError) {
      if (
        likeError.code === 'PGRST116' ||
        likeError.code === '42P01' ||
        likeError.message?.includes('relation') ||
        likeError.message?.includes('does not exist') ||
        likeError.message?.includes('table')
      ) {
        console.warn('Likes table not found. Database setup may be needed.')
        return {
          isLiked: false,
          likesCount: story?.likes_count || 0,
        }
      }
    }

    return {
      isLiked: !!like,
      likesCount: story?.likes_count || 0,
    }
  } catch (error: any) {
    console.error('Error getting like status:', error)
    // Return default on any error
    return {
      isLiked: false,
      likesCount: 0,
    }
  }
}

