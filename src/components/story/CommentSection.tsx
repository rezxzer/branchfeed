'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useComments } from '@/hooks/useComments'
import { useTranslation } from '@/hooks/useTranslation'
import { useToast } from '@/components/ui/toast'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { Spinner } from '@/components/ui/Spinner'
import { Comment } from './Comment'
import { CommentSkeleton } from './CommentSkeleton'

interface CommentSectionProps {
  storyId: string
}

const MAX_COMMENT_LENGTH = 500

export function CommentSection({ storyId }: CommentSectionProps) {
  const { t } = useTranslation()
  const { showToast } = useToast()
  const { isAuthenticated } = useAuth()
  const { comments, loading, error, addComment, removeComment } = useComments(storyId)
  const [commentText, setCommentText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isAuthenticated) {
      showToast('Please sign in to comment', 'warning')
      return
    }

    const trimmed = commentText.trim()
    if (!trimmed) {
      return
    }

    if (trimmed.length > MAX_COMMENT_LENGTH) {
      showToast(`Comment cannot exceed ${MAX_COMMENT_LENGTH} characters`, 'error')
      return
    }

    try {
      setIsSubmitting(true)
      await addComment(trimmed)
      setCommentText('')
      showToast('Comment added successfully!', 'success')
    } catch (err) {
      console.error('Error submitting comment:', err)
      showToast('Failed to add comment. Please try again.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const remainingChars = MAX_COMMENT_LENGTH - commentText.length
  const isOverLimit = remainingChars < 0

  return (
    <div id={`comments-${storyId}`} className="mt-8 space-y-4">
      <h3 className="text-lg font-semibold text-white">
        Comments ({comments.length})
      </h3>

      {/* Comment Form */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="space-y-2">
          <Textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Write a comment..."
            rows={3}
            maxLength={MAX_COMMENT_LENGTH}
            className={`bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-400 ${
              isOverLimit ? 'border-red-500' : ''
            }`}
          />
          <div className="flex items-center justify-between">
            <span
              className={`text-xs sm:text-sm ${
                isOverLimit
                  ? 'text-red-400'
                  : remainingChars < 50
                    ? 'text-yellow-400'
                    : 'text-gray-400'
              }`}
            >
              {remainingChars} characters remaining
            </span>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={!commentText.trim() || isSubmitting || isOverLimit}
            >
              {isSubmitting ? <Spinner size="sm" /> : 'Post Comment'}
            </Button>
          </div>
        </form>
      ) : (
        <div className="p-4 sm:p-5 bg-gray-800/30 rounded-lg border border-gray-700/30 text-center text-sm sm:text-base text-gray-400">
          Please sign in to comment
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <CommentSkeleton key={index} />
          ))}
        </div>
      ) : error ? (
        <div className="p-4 bg-red-900/20 rounded-lg border border-red-700/30 text-red-400 text-sm">
          Error loading comments: {error.message}
        </div>
      ) : comments.length === 0 ? (
        <div className="p-4 sm:p-5 bg-gray-800/30 rounded-lg border border-gray-700/30 text-center text-sm sm:text-base text-gray-400">
          No comments yet. Be the first to comment!
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <Comment
              key={comment.id}
              comment={comment}
              onDelete={removeComment}
            />
          ))}
        </div>
      )}
    </div>
  )
}

