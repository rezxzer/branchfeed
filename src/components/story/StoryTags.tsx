'use client'

import Link from 'next/link'
import type { Tag } from '@/types'

interface StoryTagsProps {
  tags: Tag[]
  className?: string
  maxTags?: number
}

export function StoryTags({ tags, className = '', maxTags }: StoryTagsProps) {
  if (!tags || tags.length === 0) {
    return null
  }

  const displayTags = maxTags ? tags.slice(0, maxTags) : tags
  const remainingCount = maxTags && tags.length > maxTags ? tags.length - maxTags : 0

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {displayTags.map((tag) => (
        <Link
          key={tag.id}
          href={`/feed?tag=${tag.slug}`}
          onClick={(e) => e.stopPropagation()}
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
            tag.color
              ? 'text-white border'
              : 'text-gray-300 bg-gray-800/50 border-gray-700/50 hover:bg-gray-700/50'
          }`}
          style={
            tag.color
              ? {
                  backgroundColor: `${tag.color}20`,
                  borderColor: `${tag.color}50`,
                  color: tag.color,
                }
              : undefined
          }
        >
          {tag.name}
        </Link>
      ))}
      {remainingCount > 0 && (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium text-gray-400 bg-gray-800/50 border border-gray-700/50">
          +{remainingCount}
        </span>
      )}
    </div>
  )
}

