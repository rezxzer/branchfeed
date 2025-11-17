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

const MAX_COMMENT_LENGTH = Number(process.env.NEXT_PUBLIC_MAX_COMMENT_LENGTH || 500)

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

  // Check subscription limit via API route (server-side check)
  try {
    const response = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ storyId, content }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create comment');
    }

    const { comment } = await response.json();
    return comment as Comment;
  } catch (error: any) {
    // If API route fails, throw the error (don't fall back to direct insert)
    // This ensures subscription limits are always enforced
    throw error;
  }
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

