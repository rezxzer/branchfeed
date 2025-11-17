'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { LikeButton } from '@/components/ui/LikeButton'
import { ReportButton } from '@/components/report/ReportButton'
import { useTranslation } from '@/hooks/useTranslation'
import { useToast } from '@/components/ui/toast'
import { copyStoryLink, shareNative } from '@/lib/share'

interface InteractionButtonsProps {
  storyId: string
  likesCount: number
  viewsCount: number
  commentsCount?: number
  currentPath?: ('A' | 'B')[]
  storyTitle?: string
  onLikeClick?: () => void
  isLiked?: boolean
  isLiking?: boolean
}

export function InteractionButtons({
  storyId,
  likesCount,
  viewsCount,
  commentsCount = 0,
  currentPath = [],
  storyTitle,
  onLikeClick,
  isLiked = false,
  isLiking = false,
}: InteractionButtonsProps) {
  const { t } = useTranslation()
  const { showToast } = useToast()
  const [isSharing, setIsSharing] = useState(false)

  const handleComment = () => {
    // Scroll to comment section
    const commentSection = document.getElementById(`comments-${storyId}`)
    if (commentSection) {
      commentSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const handleShare = async () => {
    try {
      setIsSharing(true)
      
      // Try native share first (mobile devices)
      if (typeof navigator !== 'undefined' && 'share' in navigator) {
        await shareNative(storyId, currentPath, storyTitle)
      } else {
        // Fallback to copy link
        await copyStoryLink(storyId, currentPath)
        showToast('Link copied to clipboard!', 'success')
      }
    } catch (err) {
      console.error('Error sharing:', err)
      // Try fallback to copy link
      try {
        await copyStoryLink(storyId, currentPath)
        showToast('Link copied to clipboard!', 'success')
      } catch (copyErr) {
        console.error('Error copying link:', copyErr)
        showToast('Failed to share. Please try again.', 'error')
      }
    } finally {
      setIsSharing(false)
    }
  }

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 bg-gray-800/50 backdrop-blur-sm rounded-lg p-3 sm:p-4 border border-gray-700/50">
      <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
        <LikeButton
          storyId={storyId}
          initialLikesCount={likesCount}
          size="sm"
          onLikeClick={onLikeClick}
          controlledLikesCount={onLikeClick ? likesCount : undefined}
          isLiked={onLikeClick ? isLiked : undefined}
          isLoading={onLikeClick ? isLiking : undefined}
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={handleComment}
          className="text-gray-300 hover:text-brand-cyan text-xs sm:text-sm"
        >
          💬 <span className="hidden sm:inline">{t('story.interactions.comment')}</span> {commentsCount > 0 && `(${commentsCount})`}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleShare}
          disabled={isSharing}
          className="text-gray-300 hover:text-brand-cyan disabled:opacity-50 text-xs sm:text-sm"
        >
          🔗 <span className="hidden sm:inline">{t('story.interactions.share')}</span>
        </Button>
        <ReportButton
          contentType="story"
          contentId={storyId}
          variant="icon"
          className="ml-auto sm:ml-0"
        />
      </div>

      <div className="text-xs sm:text-sm text-gray-400 text-center sm:text-right">
        👁️ {viewsCount}
      </div>
    </div>
  )
}

