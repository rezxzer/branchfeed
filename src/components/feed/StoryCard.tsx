'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useTranslation } from '@/hooks/useTranslation'
import { Card } from '@/components/ui/Card'
import { MediaDisplay } from '@/components/MediaDisplay'
import { ShareStoryButton } from '@/components/story/ShareStoryButton'
import type { Story } from '@/types'
import Link from 'next/link'

interface StoryCardProps {
  story: Story
}

export function StoryCard({ story }: StoryCardProps) {
  const router = useRouter()
  const { t } = useTranslation()

  const handleClick = () => {
    router.push(`/story/${story.id}`)
  }

  // Verify navigation works correctly
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
  }

  return (
    <Card
      variant="default"
      hoverable
      clickable
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`View story: ${story.title}`}
      className="bg-gray-800/50 backdrop-blur-sm border-gray-700/50 hover:border-brand-cyan/50 hover:shadow-level-2 transition-all ease-smooth cursor-pointer touch-manipulation active:scale-[0.98]"
    >
      {/* Thumbnail */}
      <div className="relative mb-4">
        {story.media_url && story.media_type ? (
          <MediaDisplay
            mediaUrl={story.media_url}
            mediaType={story.media_type}
            alt={story.title}
            lazy={true}
            maxWidth="w-full"
            className="mb-0"
          />
        ) : (
          <div className="relative aspect-[9/16] w-full rounded-lg overflow-hidden bg-gray-700 flex items-center justify-center">
            <span className="text-4xl text-gray-400">📖</span>
          </div>
        )}
        
        {/* Type Badge */}
        {story.is_root && (
          <div className="absolute top-2 left-2 px-2 py-1 bg-brand-iris/80 backdrop-blur-sm rounded-lg text-xs font-semibold text-white z-10">
            {t('feed.storyType.branching')}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="space-y-3">
        {/* Title */}
        <h3 className="text-lg font-semibold text-white line-clamp-2">
          {story.title}
        </h3>

        {/* Description */}
        {story.description && (
          <p className="text-sm text-gray-300 line-clamp-2">
            {story.description}
          </p>
        )}

        {/* Author & Stats */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-700/50">
          <Link
            href={`/profile/${story.author_id}`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-2 hover:text-brand-cyan transition-colors ease-smooth"
          >
            {story.author?.avatar_url ? (
              <Image
                src={story.author.avatar_url}
                alt={story.author.username || 'User avatar'}
                width={24}
                height={24}
                className="rounded-full object-cover"
                unoptimized
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-gradient-brand flex items-center justify-center text-white text-xs font-semibold">
                {story.author?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
            <span className="text-sm text-gray-300 font-medium">
              {story.author?.username || 'Unknown'}
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-400">
              {story.branches_count !== undefined && (
                <span>{story.branches_count} {t('feed.stats.paths')}</span>
              )}
              <span>{story.likes_count} {t('feed.stats.likes')}</span>
              <span>{story.views_count} {t('feed.stats.views')}</span>
            </div>
            <div onClick={(e) => e.stopPropagation()}>
              <ShareStoryButton storyId={story.id} className="scale-90 sm:scale-100" />
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

