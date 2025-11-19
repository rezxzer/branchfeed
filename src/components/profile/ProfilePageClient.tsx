'use client'

import Image from 'next/image'
import dynamic from 'next/dynamic'
import { useTranslation } from '@/hooks/useTranslation'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { SubscriptionBadge } from '@/components/ui/SubscriptionBadge'
import { LinkRenderer } from '@/components/ui/LinkRenderer'
import { FollowButton } from './FollowButton'
import { UserCollections } from '@/components/collections/UserCollections'
import type { Profile, Story } from '@/types'

const FollowSuggestions = dynamic(() => import('../follow/FollowSuggestions').then(mod => ({ default: mod.FollowSuggestions })), {
  ssr: false,
})

interface ProfilePageClientProps {
  profile: Profile
  stories: Story[]
  isOwnProfile: boolean
  followersCount?: number
  followingCount?: number
}

export function ProfilePageClient({
  profile,
  stories,
  isOwnProfile,
  followersCount = 0,
  followingCount = 0,
}: ProfilePageClientProps) {
  const { t } = useTranslation()
  const router = useRouter()
  const num = new Intl.NumberFormat()

  const totalLikes = stories.reduce((sum, story) => sum + (story.likes_count ?? 0), 0)
  const totalViews = stories.reduce((sum, story) => sum + (story.views_count ?? 0), 0)

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Profile Header */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-level-2 border border-gray-700/50 p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
              {/* Avatar */}
              {profile.avatar_url ? (
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden flex-shrink-0 border-2 border-gray-700">
                  <Image
                    src={profile.avatar_url}
                    alt={profile.username || 'User avatar'}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                    style={{ width: 'auto', height: 'auto' }}
                    unoptimized
                  />
                </div>
              ) : (
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-brand flex items-center justify-center text-white text-xl sm:text-2xl font-semibold flex-shrink-0">
                  {profile.username?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-xl sm:text-2xl font-bold text-white break-words">
                    {profile.username || 'User'}
                  </h1>
                  {isOwnProfile && (
                    <SubscriptionBadge variant="compact" showLabel={false} />
                  )}
                </div>
                {profile.bio && (
                  <p className="text-gray-300 text-xs sm:text-sm break-words">
                    <LinkRenderer text={profile.bio} showExternalIcon={true} />
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            {isOwnProfile ? (
              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/settings')}
                  className="flex-1 sm:flex-none"
                >
                  {t('header.settings')}
                </Button>
              </div>
            ) : (
              <FollowButton userId={profile.id} />
            )}
          </div>
        </div>

        {/* Profile Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-700/50">
            <div className="text-xl sm:text-2xl font-bold text-brand-cyan mb-1">
              {num.format(stories.length)}
            </div>
            <div className="text-xs sm:text-sm text-gray-400">Stories</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-700/50">
            <div className="text-xl sm:text-2xl font-bold text-brand-plum mb-1">
              {num.format(totalLikes)}
            </div>
            <div className="text-xs sm:text-sm text-gray-400">Total Likes</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-700/50">
            <div className="text-xl sm:text-2xl font-bold text-brand-iris mb-1">
              {num.format(totalViews)}
            </div>
            <div className="text-xs sm:text-sm text-gray-400">Total Views</div>
          </div>
          <div 
            className="bg-gray-800/50 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-700/50 cursor-pointer hover:border-brand-cyan transition-colors"
            onClick={() => router.push(`/profile/${profile.id}/followers`)}
          >
            <div className="text-xl sm:text-2xl font-bold text-brand-cyan mb-1">
              {num.format(followersCount)}
            </div>
            <div className="text-xs sm:text-sm text-gray-400">Followers</div>
          </div>
          <div 
            className="bg-gray-800/50 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-700/50 cursor-pointer hover:border-brand-cyan transition-colors"
            onClick={() => router.push(`/profile/${profile.id}/following`)}
          >
            <div className="text-xl sm:text-2xl font-bold text-brand-cyan mb-1">
              {num.format(followingCount)}
            </div>
            <div className="text-xs sm:text-sm text-gray-400">Following</div>
          </div>
        </div>

        {/* Stories Section */}
        <div className="mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">
            {isOwnProfile ? 'Your Stories' : 'Stories'}
          </h2>

          {stories.length === 0 ? (
            <EmptyState
              icon="📖"
              title={isOwnProfile ? 'No stories yet' : 'No stories'}
              description={
                isOwnProfile
                  ? 'Create your first branching story!'
                  : 'This user has not created any stories yet.'
              }
              actionLabel={isOwnProfile ? 'Create Story' : undefined}
              onAction={
                isOwnProfile ? () => router.push('/create') : undefined
              }
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {stories.map((story) => (
                <div
                  key={story.id}
                  className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-5 border border-gray-700/50 hover:border-brand-cyan/50 hover:shadow-level-1 transition-all ease-smooth cursor-pointer touch-manipulation active:scale-[0.98]"
                  onClick={() => router.push(`/story/${story.id}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      router.push(`/story/${story.id}`)
                    }
                  }}
                  aria-label={`View story: ${story.title}`}
                >
                  <h3 className="text-white font-semibold mb-2 line-clamp-2">
                    {story.title}
                  </h3>
                  {story.description && (
                    <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                      {story.description}
                    </p>
                  )}
                  <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-400">
                    <span>{num.format(story.likes_count || 0)} likes</span>
                    <span>{num.format(story.views_count || 0)} views</span>
                    <span>{num.format(story.paths_count ?? 0)} paths</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Collections Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-white">
              {isOwnProfile ? 'Your Collections' : 'Collections'}
            </h2>
            {isOwnProfile && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/collections')}
              >
                View All
              </Button>
            )}
          </div>
          <UserCollections userId={profile.id} isOwnProfile={isOwnProfile} />
        </div>

        {/* Follow Suggestions (only for own profile) */}
        {isOwnProfile && (
          <div className="mt-6">
            <FollowSuggestions limit={5} />
          </div>
        )}
      </div>
    </div>
  )
}

