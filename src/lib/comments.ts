'use client'

import { createClientClient } from '@/lib/supabase/client'

export interface Comment {
  id: string
  story_id: string | null
  node_id: string | null
  user_id: string
  content: string
  created_at: string
  updated_at: string
  author: {
    id: string
    username: string
    avatar_url: string | null
  }
}

const MAX_COMMENT_LENGTH = 500

/**
 * Add a comment to a story
 */
export async function addComment(
  storyId: string,
  content: string
): Promise<Comment> {
  const supabase = createClientClient()

  if (!supabase) {
    throw new Error('Supabase client is null. Check environment variables.')
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('User not authenticated')
  }

  // Validate content
  const trimmedContent = content.trim()
  if (!trimmedContent) {
    throw new Error('Comment cannot be empty')
  }
  if (trimmedContent.length > MAX_COMMENT_LENGTH) {
    throw new Error(`Comment cannot exceed ${MAX_COMMENT_LENGTH} characters`)
  }

  const { data: comment, error } = await supabase
    .from('comments')
    .insert({
      story_id: storyId,
      node_id: null,
      user_id: user.id,
      content: trimmedContent,
    })
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
    .single()

  if (error) {
    // If table doesn't exist, throw error
    if (
      error.code === 'PGRST116' ||
      error.code === '42P01' || // PostgreSQL: relation does not exist
      error.message?.includes('relation') ||
      error.message?.includes('does not exist') ||
      error.message?.includes('table')
    ) {
      console.warn('Comments table not found. Database setup may be needed.')
      throw new Error('Comments table not found. Please check database setup.')
    }
    throw new Error(`Add comment failed: ${error.message}`)
  }

  return comment as Comment
}

/**
 * Delete a comment
 */
export async function deleteComment(commentId: string): Promise<void> {
  const supabase = createClientClient()

  if (!supabase) {
    throw new Error('Supabase client is null. Check environment variables.')
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('User not authenticated')
  }

  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId)
    .eq('user_id', user.id) // Only allow deleting own comments

  if (error) {
    // If table doesn't exist, throw error
    if (
      error.code === 'PGRST116' ||
      error.code === '42P01' ||
      error.message?.includes('relation') ||
      error.message?.includes('does not exist') ||
      error.message?.includes('table')
    ) {
      console.warn('Comments table not found. Database setup may be needed.')
      throw new Error('Comments table not found. Please check database setup.')
    }
    throw new Error(`Delete comment failed: ${error.message}`)
  }
}

/**
 * Get comments for a story
 */
export async function getComments(storyId: string): Promise<Comment[]> {
  const supabase = createClientClient()

  if (!supabase) {
    console.error('Supabase client is null. Check environment variables.')
    return []
  }

  const { data, error } = await supabase
    .from('comments')
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
    .eq('story_id', storyId)
    .order('created_at', { ascending: false })

  if (error) {
    // If table doesn't exist, return empty array gracefully
    if (
      error.code === 'PGRST116' ||
      error.code === '42P01' ||
      error.message?.includes('relation') ||
      error.message?.includes('does not exist') ||
      error.message?.includes('table')
    ) {
      console.warn('Comments table not found. Database setup may be needed.')
      return []
    }
    console.error('Error fetching comments:', error)
    return []
  }

  return (data || []) as Comment[]
}

