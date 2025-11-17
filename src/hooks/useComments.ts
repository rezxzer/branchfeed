'use client'

import { useState, useEffect, useCallback } from 'react'
import { addComment, deleteComment, editComment, getComments, type Comment } from '@/lib/comments'
import { useAuth } from '@/hooks/useAuth'
import { createClientClient } from '@/lib/supabase/client'

interface UseCommentsResult {
  comments: Comment[]
  loading: boolean
  error: Error | null
  addComment: (content: string, parentCommentId?: string) => Promise<void>
  editComment: (commentId: string, content: string) => Promise<void>
  removeComment: (commentId: string) => Promise<void>
  refreshComments: () => Promise<void>
}

/**
 * Hook for managing comments for a story
 */
export function useComments(storyId: string): UseCommentsResult {
  const { isAuthenticated } = useAuth()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const loadComments = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      let userId: string | undefined
      if (isAuthenticated) {
        const supabase = createClientClient()
        if (supabase) {
          const { data: { user } } = await supabase.auth.getUser()
          userId = user?.id
        }
      }
      
      const commentsData = await getComments(storyId, userId)
      setComments(commentsData)
    } catch (err) {
      console.error('Error loading comments:', err)
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [storyId, isAuthenticated])

  useEffect(() => {
    if (storyId) {
      loadComments()
    }
  }, [storyId, loadComments])

  const handleAddComment = useCallback(
    async (content: string, parentCommentId?: string) => {
      if (!isAuthenticated) {
        throw new Error('User not authenticated')
      }

      try {
        setError(null)
        const newComment = await addComment(storyId, content, parentCommentId)
        
        if (parentCommentId) {
          // Add reply to parent comment
          setComments((prev) => {
            const updateCommentWithReply = (comments: Comment[]): Comment[] => {
              return comments.map(comment => {
                if (comment.id === parentCommentId) {
                  return {
                    ...comment,
                    replies: [...(comment.replies || []), newComment],
                  }
                }
                if (comment.replies && comment.replies.length > 0) {
                  return {
                    ...comment,
                    replies: updateCommentWithReply(comment.replies),
                  }
                }
                return comment
              })
            }
            return updateCommentWithReply(prev)
          })
        } else {
          // Add top-level comment
          setComments((prev) => [newComment, ...prev])
        }
      } catch (err) {
        console.error('Error adding comment:', err)
        setError(err as Error)
        throw err
      }
    },
    [storyId, isAuthenticated]
  )

  const handleEditComment = useCallback(
    async (commentId: string, content: string) => {
      if (!isAuthenticated) {
        throw new Error('User not authenticated')
      }

      try {
        setError(null)
        const updatedComment = await editComment(commentId, content)
        
        // Update comment in tree
        setComments((prev) => {
          const updateComment = (comments: Comment[]): Comment[] => {
            return comments.map(comment => {
              if (comment.id === commentId) {
                return updatedComment
              }
              if (comment.replies && comment.replies.length > 0) {
                return {
                  ...comment,
                  replies: updateComment(comment.replies),
                }
              }
              return comment
            })
          }
          return updateComment(prev)
        })
      } catch (err) {
        console.error('Error editing comment:', err)
        setError(err as Error)
        throw err
      }
    },
    [isAuthenticated]
  )

  const handleDeleteComment = useCallback(
    async (commentId: string) => {
      if (!isAuthenticated) {
        throw new Error('User not authenticated')
      }

      try {
        setError(null)
        await deleteComment(commentId)
        
        // Remove comment from tree (including replies)
        setComments((prev) => {
          const removeComment = (comments: Comment[]): Comment[] => {
            return comments
              .filter((c) => c.id !== commentId)
              .map(comment => {
                if (comment.replies && comment.replies.length > 0) {
                  return {
                    ...comment,
                    replies: removeComment(comment.replies),
                  }
                }
                return comment
              })
          }
          return removeComment(prev)
        })
      } catch (err) {
        console.error('Error deleting comment:', err)
        setError(err as Error)
        throw err
      }
    },
    [isAuthenticated]
  )

  return {
    comments,
    loading,
    error,
    addComment: handleAddComment,
    editComment: handleEditComment,
    removeComment: handleDeleteComment,
    refreshComments: loadComments,
  }
}

