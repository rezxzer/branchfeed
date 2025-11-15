'use client'

import { useState, useEffect, useCallback } from 'react'
import { addComment, deleteComment, getComments, type Comment } from '@/lib/comments'
import { useAuth } from '@/hooks/useAuth'

interface UseCommentsResult {
  comments: Comment[]
  loading: boolean
  error: Error | null
  addComment: (content: string) => Promise<void>
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
      const commentsData = await getComments(storyId)
      setComments(commentsData)
    } catch (err) {
      console.error('Error loading comments:', err)
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [storyId])

  useEffect(() => {
    if (storyId) {
      loadComments()
    }
  }, [storyId, loadComments])

  const handleAddComment = useCallback(
    async (content: string) => {
      if (!isAuthenticated) {
        throw new Error('User not authenticated')
      }

      try {
        setError(null)
        const newComment = await addComment(storyId, content)
        // Optimistic update - add comment to list
        setComments((prev) => [newComment, ...prev])
      } catch (err) {
        console.error('Error adding comment:', err)
        setError(err as Error)
        throw err
      }
    },
    [storyId, isAuthenticated]
  )

  const handleDeleteComment = useCallback(
    async (commentId: string) => {
      if (!isAuthenticated) {
        throw new Error('User not authenticated')
      }

      try {
        setError(null)
        await deleteComment(commentId)
        // Optimistic update - remove comment from list
        setComments((prev) => prev.filter((c) => c.id !== commentId))
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
    removeComment: handleDeleteComment,
    refreshComments: loadComments,
  }
}

