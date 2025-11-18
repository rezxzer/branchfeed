'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useTranslation } from '@/hooks/useTranslation'
import { useAuth } from '@/hooks/useAuth'
import { useBookmarks } from '@/hooks/useBookmarks'
import { useInViewport } from '@/hooks/useInViewport'
import { useScrollSpeed } from '@/hooks/useScrollSpeed'
import { Card } from '@/components/ui/Card'
import { MediaDisplay } from '@/components/MediaDisplay'
import { ShareStoryButton } from '@/components/story/ShareStoryButton'
import { StoryTags } from '@/components/story/StoryTags'
import { Button } from '@/components/ui/Button'
import type { Story } from '@/types'
import Link from 'next/link'

interface StoryCardProps {
  story: Story
}

export function StoryCard({ story }: StoryCardProps) {
  const router = useRouter()
  const { t } = useTranslation()
  const { isAuthenticated } = useAuth()
  const { isBookmarked, loading: bookmarkLoading, toggleBookmark } = useBookmarks(
    story.id,
    story.isBookmarked || false
  )
  
  // Viewport detection for video autoplay
  const { ref: viewportRef, isInViewport } = useInViewport({
    threshold: 0.5, // 50% of video must be visible
    rootMargin: '0px',
  })

  // Fast scroll detection to pause videos
  const { isFastScrolling } = useScrollSpeed({
    fastScrollThreshold: 1000, // pixels per second
    debounceMs: 100,
  })

  const handleClick = () => {
    router.push(`/story/${story.id}`)
  }

  const handleBookmark = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await toggleBookmark(story.id)
    } catch (err) {
      console.error('Error toggling bookmark:', err)
    }
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
      ref={viewportRef}
      variant="default"
      hoverable
      clickable
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`View story: ${story.title}`}
      className="bg-gray-800/50 backdrop-blur-sm border-gray-700/50 hover:border-brand-cyan/50 hover:shadow-level-2 transition-all ease-smooth cursor-pointer touch-manipulation active:scale-[0.98]"
      data-autoplay={story.media_type === 'video' ? isInViewport : undefined}
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
            // Video autoplay settings for feed
            // Pause if scrolling fast or not in viewport
            autoPlay={story.media_type === 'video' ? (isInViewport && !isFastScrolling) : false}
            loop={story.media_type === 'video'}
            muted={story.media_type === 'video'}
            controls={true}
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
        
        {/* Bookmark Button */}
        {isAuthenticated && (
          <div className="absolute top-2 right-2 z-10" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBookmark}
              disabled={bookmarkLoading}
              className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
                isBookmarked 
                  ? 'bg-brand-cyan/80 text-white' 
                  : 'bg-gray-800/80 text-gray-300 hover:bg-gray-700/80'
              }`}
              aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark story'}
            >
              {isBookmarked ? '🔖' : '📑'}
            </Button>
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

        {/* Tags */}
        {story.tags && story.tags.length > 0 && (
          <StoryTags tags={story.tags} maxTags={3} />
        )}

        {/* Footer: Author & Stats */}
        <div className="mt-3 flex items-center justify-between gap-3 text-xs text-slate-400 pt-2 border-t border-gray-700/50">
          {/* Author - Left */}
          <Link
            href={`/profile/${story.author_id}`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-2 hover:text-brand-cyan transition-colors ease-smooth flex-shrink-0"
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
            <span className="text-slate-200 font-medium">
              {story.author?.username || 'Unknown'}
            </span>
          </Link>

          {/* Stats & Share - Right */}
          <div className="flex flex-wrap items-center justify-end gap-x-4 gap-y-1 flex-1 sm:flex-nowrap">
            {/* Paths */}
            <div className="flex items-center gap-1">
              <span className="font-semibold text-slate-50">{story.paths_count ?? 0}</span>
              <span className="text-[10px] uppercase tracking-wide">paths</span>
            </div>
            
            {/* Likes */}
            <div className="flex items-center gap-1">
              <span className="font-semibold text-slate-50">{story.likes_count ?? 0}</span>
              <span className="text-[10px] uppercase tracking-wide">likes</span>
            </div>
            
            {/* Views */}
            <div className="flex items-center gap-1">
              <span className="font-semibold text-slate-50">{story.views_count ?? 0}</span>
              <span className="text-[10px] uppercase tracking-wide">views</span>
            </div>
            
            {/* Shares */}
            {story.shares_count !== undefined && story.shares_count > 0 && (
              <div className="flex items-center gap-1">
                <span className="font-semibold text-slate-50">{story.shares_count}</span>
                <span className="text-[10px] uppercase tracking-wide">shares</span>
              </div>
            )}
            
            {/* Share Button */}
            <div onClick={(e) => e.stopPropagation()} className="flex-shrink-0">
              <ShareStoryButton 
                storyId={story.id} 
                className="scale-90 sm:scale-100"
                initialShared={story.userHasShared}
                initialSharesCount={story.shares_count || 0}
              />
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

