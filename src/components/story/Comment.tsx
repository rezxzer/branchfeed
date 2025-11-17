'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/components/ui/toast'
import { Button } from '@/components/ui/Button'
import { ReportButton } from '@/components/report/ReportButton'
import type { Comment as CommentType } from '@/lib/comments'
import { formatDistanceToNow } from 'date-fns'

interface CommentProps {
  comment: CommentType
  onDelete: (commentId: string) => Promise<void>
}

export function Comment({ comment, onDelete }: CommentProps) {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [isDeleting, setIsDeleting] = useState(false)
  const isOwnComment = user?.id === comment.user_id

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

  const formatTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true })
    } catch {
      return ''
    }
  }

  return (
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
          </span>
        </div>
        <p className="text-gray-300 text-sm whitespace-pre-wrap break-words">
          {comment.content}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {isOwnComment && (
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
        )}
        {!isOwnComment && (
          <ReportButton
            contentType="comment"
            contentId={comment.id}
            variant="icon"
            className="text-gray-300"
          />
        )}
      </div>
    </div>
  )
}

