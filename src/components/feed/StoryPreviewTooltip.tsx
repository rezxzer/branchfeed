'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { useTranslation } from '@/hooks/useTranslation'
import type { Story } from '@/types'
import { Clock, Eye, Heart, GitBranch } from 'lucide-react'

// Format number with locale
const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US', {
    notation: num >= 1000 ? 'compact' : 'standard',
    maximumFractionDigits: 1,
  }).format(num)
}

interface StoryPreviewTooltipProps {
  story: Story
  /** Whether tooltip is visible */
  visible: boolean
  /** Position of tooltip (top, bottom, left, right) */
  position?: 'top' | 'bottom' | 'left' | 'right'
  /** Reference element for positioning */
  anchorRef: React.RefObject<HTMLElement>
}

/**
 * Story preview tooltip that appears on hover
 * Shows story thumbnail, title, description, author, and stats
 */
export function StoryPreviewTooltip({
  story,
  visible,
  position = 'top',
  anchorRef,
}: StoryPreviewTooltipProps) {
  const { t } = useTranslation()
  const tooltipRef = useRef<HTMLDivElement>(null)
  const [tooltipPosition, setTooltipPosition] = useState<{
    top: number
    left: number
  } | null>(null)

  // Calculate tooltip position based on anchor element
  useEffect(() => {
    if (!visible || !anchorRef.current || !tooltipRef.current) {
      setTooltipPosition(null)
      return
    }

    const anchorRect = anchorRef.current.getBoundingClientRect()
    const tooltipRect = tooltipRef.current.getBoundingClientRect()
    const scrollY = window.scrollY
    const scrollX = window.scrollX
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const margin = 12 // Margin from anchor element

    let top = 0
    let left = 0

    switch (position) {
      case 'top':
        top = anchorRect.top + scrollY - tooltipRect.height - margin
        left = anchorRect.left + scrollX + (anchorRect.width - tooltipRect.width) / 2
        // Adjust if tooltip goes off screen
        if (left < scrollX + margin) {
          left = scrollX + margin
        } else if (left + tooltipRect.width > scrollX + viewportWidth - margin) {
          left = scrollX + viewportWidth - tooltipRect.width - margin
        }
        // If tooltip doesn't fit above, show below instead
        if (top < scrollY + margin) {
          top = anchorRect.bottom + scrollY + margin
        }
        break
      case 'bottom':
        top = anchorRect.bottom + scrollY + margin
        left = anchorRect.left + scrollX + (anchorRect.width - tooltipRect.width) / 2
        // Adjust if tooltip goes off screen
        if (left < scrollX + margin) {
          left = scrollX + margin
        } else if (left + tooltipRect.width > scrollX + viewportWidth - margin) {
          left = scrollX + viewportWidth - tooltipRect.width - margin
        }
        // If tooltip doesn't fit below, show above instead
        if (top + tooltipRect.height > scrollY + viewportHeight - margin) {
          top = anchorRect.top + scrollY - tooltipRect.height - margin
        }
        break
      case 'left':
        top = anchorRect.top + scrollY + (anchorRect.height - tooltipRect.height) / 2
        left = anchorRect.left + scrollX - tooltipRect.width - margin
        // Adjust if tooltip goes off screen
        if (top < scrollY + margin) {
          top = scrollY + margin
        } else if (top + tooltipRect.height > scrollY + viewportHeight - margin) {
          top = scrollY + viewportHeight - tooltipRect.height - margin
        }
        // If tooltip doesn't fit on left, show on right instead
        if (left < scrollX + margin) {
          left = anchorRect.right + scrollX + margin
        }
        break
      case 'right':
        top = anchorRect.top + scrollY + (anchorRect.height - tooltipRect.height) / 2
        left = anchorRect.right + scrollX + margin
        // Adjust if tooltip goes off screen
        if (top < scrollY + margin) {
          top = scrollY + margin
        } else if (top + tooltipRect.height > scrollY + viewportHeight - margin) {
          top = scrollY + viewportHeight - tooltipRect.height - margin
        }
        // If tooltip doesn't fit on right, show on left instead
        if (left + tooltipRect.width > scrollX + viewportWidth - margin) {
          left = anchorRect.left + scrollX - tooltipRect.width - margin
        }
        break
    }

    setTooltipPosition({ top, left })
  }, [visible, position, anchorRef])

  if (!visible || !tooltipPosition) {
    return null
  }

  return (
    <div
      ref={tooltipRef}
      className="fixed z-50 w-80 bg-gray-900/95 backdrop-blur-md rounded-xl border border-gray-700/50 shadow-level-3 p-4 pointer-events-none transition-opacity duration-200"
      style={{
        top: `${tooltipPosition.top}px`,
        left: `${tooltipPosition.left}px`,
        opacity: visible ? 1 : 0,
      }}
    >
      {/* Thumbnail */}
      {story.media_url && (
        <div className="relative w-full h-48 mb-3 rounded-lg overflow-hidden bg-gray-800">
          {story.media_type === 'image' ? (
            <Image
              src={story.media_url}
              alt={story.title}
              fill
              className="object-cover"
              sizes="(max-width: 320px) 100vw, 320px"
            />
          ) : (
            <video
              src={story.media_url}
              className="w-full h-full object-cover"
              muted
              playsInline
              preload="metadata"
            />
          )}
        </div>
      )}

      {/* Title */}
      <h3 className="text-white font-semibold text-base mb-2 line-clamp-2">
        {story.title}
      </h3>

      {/* Description */}
      {story.description && (
        <p className="text-gray-400 text-sm mb-3 line-clamp-2">
          {story.description}
        </p>
      )}

      {/* Author */}
      {story.author && (
        <div className="flex items-center gap-2 mb-3">
          {story.author.avatar_url ? (
            <Image
              src={story.author.avatar_url}
              alt={story.author.username || 'Author'}
              width={24}
              height={24}
              className="rounded-full"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-xs text-gray-400">
              {story.author.username?.[0]?.toUpperCase() || '?'}
            </div>
          )}
          <span className="text-gray-300 text-sm">
            {story.author.username || 'Unknown'}
          </span>
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center gap-4 text-xs text-gray-400">
        <div className="flex items-center gap-1">
          <Heart className="w-4 h-4" />
          <span>{formatNumber(story.likes_count || 0)}</span>
        </div>
        <div className="flex items-center gap-1">
          <Eye className="w-4 h-4" />
          <span>{formatNumber(story.views_count || 0)}</span>
        </div>
        <div className="flex items-center gap-1">
          <GitBranch className="w-4 h-4" />
          <span>{formatNumber(story.paths_count || 0)}</span>
        </div>
        {story.media_type === 'video' && (
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{t('feed.storyType.branching') || 'Video'}</span>
          </div>
        )}
      </div>

      {/* Tags */}
      {story.tags && story.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {story.tags.slice(0, 3).map((tag) => (
            <span
              key={tag.id}
              className="px-2 py-1 text-xs rounded-full bg-gray-800 text-gray-300"
            >
              #{tag.name}
            </span>
          ))}
          {story.tags.length > 3 && (
            <span className="px-2 py-1 text-xs rounded-full bg-gray-800 text-gray-400">
              +{story.tags.length - 3}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

