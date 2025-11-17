'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useAuth } from '@/hooks/useAuth'
import { useCommentLikes } from '@/hooks/useCommentLikes'
import { useToast } from '@/components/ui/toast'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { ReportButton } from '@/components/report/ReportButton'
import type { Comment as CommentType } from '@/lib/comments'
import { formatDistanceToNow } from 'date-fns'

interface CommentProps {
  comment: CommentType
  storyId: string
  onDelete: (commentId: string) => Promise<void>
  onEdit: (commentId: string, content: string) => Promise<void>
  onReply: (parentCommentId: string, content: string) => Promise<void>
  isReply?: boolean
}

const MAX_COMMENT_LENGTH = Number(process.env.NEXT_PUBLIC_MAX_COMMENT_LENGTH || 500)

export function Comment({ 
  comment, 
  storyId, 
  onDelete, 
  onEdit, 
  onReply,
  isReply = false 
}: CommentProps) {
  const { user, isAuthenticated } = useAuth()
  const { showToast } = useToast()
  const [isDeleting, setIsDeleting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isReplying, setIsReplying] = useState(false)
  const [editContent, setEditContent] = useState(comment.content)
  const [replyContent, setReplyContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const isOwnComment = user?.id === comment.user_id
  const isEdited = comment.updated_at !== comment.created_at

  // Comment likes hook
  const { liked, likesCount, loading: likeLoading, toggleLike } = useCommentLikes(
    comment.id,
    comment.liked || false,
    comment.likes_count || 0
  )

  const handleLike = async () => {
    try {
      await toggleLike(comment.id)
    } catch (err) {
      console.error('Error toggling like:', err)
      showToast('Failed to like comment. Please try again.', 'error')
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this comment?')) {
      return
    }

    try {
      setIsDeleting(true)
      await onDelete(comment.id)
      showToast('Comment deleted successfully', 'success')
    } catch (err) {
      console.error('Error deleting comment:', err)
      showToast('Failed to delete comment. Please try again.', 'error')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleEdit = async () => {
    const trimmed = editContent.trim()
    if (!trimmed) {
      showToast('Comment cannot be empty', 'error')
      return
    }

    if (trimmed.length > MAX_COMMENT_LENGTH) {
      showToast(`Comment too long (${trimmed.length}/${MAX_COMMENT_LENGTH} characters)`, 'error')
      return
    }

    try {
      setIsSubmitting(true)
      await onEdit(comment.id, trimmed)
      setIsEditing(false)
      showToast('Comment updated successfully', 'success')
    } catch (err) {
      console.error('Error editing comment:', err)
      showToast('Failed to update comment. Please try again.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReply = async () => {
    const trimmed = replyContent.trim()
    if (!trimmed) {
      return
    }

    if (trimmed.length > MAX_COMMENT_LENGTH) {
      showToast(`Comment too long (${trimmed.length}/${MAX_COMMENT_LENGTH} characters)`, 'error')
      return
    }

    try {
      setIsSubmitting(true)
      await onReply(comment.id, trimmed)
      setReplyContent('')
      setIsReplying(false)
      showToast('Reply added successfully', 'success')
    } catch (err) {
      console.error('Error replying to comment:', err)
      showToast('Failed to add reply. Please try again.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true })
    } catch {
      return ''
    }
  }

  return (
    <div className={`${isReply ? 'ml-8 mt-3' : ''}`}>
      <div className="flex gap-3 p-4 bg-gray-800/30 rounded-lg border border-gray-700/30">
        {/* Avatar */}
        {comment.author.avatar_url ? (
          <Image
            src={comment.author.avatar_url}
            alt={comment.author.username || 'User avatar'}
            width={40}
            height={40}
            className="rounded-full object-cover flex-shrink-0"
            unoptimized
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-brand flex items-center justify-center text-white font-semibold flex-shrink-0">
            {comment.author.username?.charAt(0).toUpperCase() || 'U'}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-white text-sm">
              {comment.author.username}
            </span>
            <span className="text-xs text-gray-300">
              {formatTime(comment.created_at)}
              {isEdited && (
                <span className="ml-1 text-gray-500">(edited)</span>
              )}
            </span>
          </div>
          
          {isEditing ? (
            <div className="space-y-2">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={3}
                maxLength={MAX_COMMENT_LENGTH}
                className="bg-gray-800/50 border-gray-700/50 text-white"
              />
              <div className="flex gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleEdit}
                  disabled={isSubmitting || !editContent.trim()}
                >
                  {isSubmitting ? 'Saving...' : 'Save'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsEditing(false)
                    setEditContent(comment.content)
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-gray-300 text-sm whitespace-pre-wrap break-words">
              {comment.content}
            </p>
          )}

          {/* Reply Form */}
          {isReplying && (
            <div className="mt-3 space-y-2">
              <Textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write a reply..."
                rows={2}
                maxLength={MAX_COMMENT_LENGTH}
                className="bg-gray-800/50 border-gray-700/50 text-white"
              />
              <div className="flex gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleReply}
                  disabled={isSubmitting || !replyContent.trim()}
                >
                  {isSubmitting ? 'Posting...' : 'Reply'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsReplying(false)
                    setReplyContent('')
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {isAuthenticated && !isEditing && !isReplying && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                disabled={likeLoading}
                className={`text-gray-300 hover:text-brand-cyan ${liked ? 'text-brand-cyan' : ''}`}
                aria-label={liked ? 'Unlike comment' : 'Like comment'}
              >
                {liked ? '❤️' : '🤍'} {likesCount > 0 && likesCount}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsReplying(!isReplying)}
                className="text-gray-300 hover:text-brand-cyan"
                aria-label="Reply to comment"
              >
                💬 Reply
              </Button>
            </>
          )}
          {isOwnComment && !isEditing && !isReplying && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="text-gray-300 hover:text-brand-cyan"
                aria-label="Edit comment"
              >
                ✏️ Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-gray-300 hover:text-red-300"
                aria-label="Delete comment"
              >
                {isDeleting ? '...' : '🗑️'}
              </Button>
            </>
          )}
          {!isOwnComment && !isEditing && !isReplying && (
            <ReportButton
              contentType="comment"
              contentId={comment.id}
              variant="icon"
              className="text-gray-300"
            />
          )}
        </div>
      </div>

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-2 space-y-2">
          {comment.replies.map((reply) => (
            <Comment
              key={reply.id}
              comment={reply}
              storyId={storyId}
              onDelete={onDelete}
              onEdit={onEdit}
              onReply={onReply}
              isReply={true}
            />
          ))}
        </div>
      )}
    </div>
  )
}
