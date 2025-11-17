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
  parent_comment_id?: string | null
  likes_count?: number
  liked?: boolean
  author: {
    id: string
    username: string
    avatar_url: string | null
  }
  replies?: Comment[]
}

const MAX_COMMENT_LENGTH = Number(process.env.NEXT_PUBLIC_MAX_COMMENT_LENGTH || 500)

/**
 * Add a comment to a story (or reply to a comment)
 */
export async function addComment(
  storyId: string,
  content: string,
  parentCommentId?: string
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
      body: JSON.stringify({ storyId, content, parentCommentId }),
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
 * Edit a comment
 */
export async function editComment(
  commentId: string,
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

  try {
    const response = await fetch(`/api/comments/${commentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update comment');
    }

    const { comment } = await response.json();
    return comment as Comment;
  } catch (error: any) {
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

  try {
    const response = await fetch(`/api/comments/${commentId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete comment');
    }
  } catch (error: any) {
    throw error;
  }
}

/**
 * Get comments for a story (with replies)
 */
export async function getComments(storyId: string, userId?: string): Promise<Comment[]> {
  const supabase = createClientClient()

  if (!supabase) {
    console.error('Supabase client is null. Check environment variables.')
    return []
  }

  // Get all comments for the story with likes_count
  const { data: allComments, error } = await supabase
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

  if (!allComments || allComments.length === 0) {
    return []
  }

  // Organize comments into tree structure
  const commentsMap = new Map<string, Comment>()
  const topLevelComments: Comment[] = []

  // Get user's liked comments if authenticated
  let userLikedComments: Set<string> = new Set()
  if (userId) {
    const { data: userLikes } = await supabase
      .from('comment_likes')
      .select('comment_id')
      .eq('user_id', userId)
    
    if (userLikes) {
      userLikedComments = new Set(userLikes.map((like: { comment_id: string }) => like.comment_id))
    }
  }

  // First pass: create map of all comments
  allComments.forEach((comment: any) => {
    commentsMap.set(comment.id, {
      ...comment,
      likes_count: comment.likes_count || 0,
      liked: userId ? userLikedComments.has(comment.id) : false,
      replies: [],
    } as Comment)
  })

  // Second pass: build tree structure
  allComments.forEach((comment: any) => {
    const commentWithReplies = commentsMap.get(comment.id)!
    
    if (!comment.parent_comment_id) {
      // Top-level comment
      topLevelComments.push(commentWithReplies)
    } else {
      // Reply - add to parent's replies
      const parent = commentsMap.get(comment.parent_comment_id)
      if (parent) {
        if (!parent.replies) {
          parent.replies = []
        }
        parent.replies.push(commentWithReplies)
      }
    }
  })

  // Sort replies by created_at
  const sortReplies = (comments: Comment[]) => {
    comments.forEach(comment => {
      if (comment.replies && comment.replies.length > 0) {
        comment.replies.sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        )
        sortReplies(comment.replies)
      }
    })
  }

  sortReplies(topLevelComments)

  return topLevelComments
}

/**
 * Get replies for a comment
 */
export async function getCommentReplies(commentId: string): Promise<Comment[]> {
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
    .eq('parent_comment_id', commentId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching replies:', error)
    return []
  }

  return (data || []) as Comment[]
}

