import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { getCurrentUser } from '@/lib/auth'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { ProfilePageClient } from '@/components/profile/ProfilePageClient'
import { siteConfig } from '@/config/site'
import type { Profile } from '@/types'

interface ProfilePageProps {
  params: Promise<{
    id: string
  }>
}

export async function generateMetadata({
  params,
}: ProfilePageProps): Promise<Metadata> {
  const { id } = await params
  
  try {
    const profile = await getProfile(id)
    
    if (!profile) {
      return {
        title: 'Profile Not Found',
        description: 'The profile you are looking for does not exist.',
      }
    }

    const title = `${profile.username} | BranchFeed`
    const description = profile.bio || `View ${profile.username}'s profile on BranchFeed.`
    const profileUrl = `${siteConfig.url}/profile/${id}`
    
    const ogImage = profile.avatar_url || siteConfig.ogImage

    return {
      title,
      description,
      openGraph: {
        type: 'profile',
        title,
        description,
        url: profileUrl,
        siteName: siteConfig.name,
        images: [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: `${profile.username}'s profile`,
          },
        ],
      },
      twitter: {
        card: 'summary',
        title,
        description,
        images: [ogImage],
      },
    }
  } catch (error) {
    return {
      title: 'Profile | BranchFeed',
      description: 'View user profile on BranchFeed.',
    }
  }
}

async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = await createServerSupabaseClient()

  if (!supabase) {
    console.error('Supabase client is null. Check environment variables.')
    return null
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    // If profile doesn't exist (PGRST116 = no rows returned)
    // Profile should be created automatically by database trigger on signup
    // If profile doesn't exist, try to create it via API (fallback)
    if (error.code === 'PGRST116') {
      console.warn(`Profile not found for user ID: ${userId}. Profile should be created automatically on signup.`)
      
      // Try to create profile manually (only if this is the current user's profile)
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user && user.id === userId) {
          // This is the current user's profile, try to create it
          const defaultUsername = user.email?.split('@')[0] || `user_${user.id.substring(0, 8)}`
          
          // Try to create profile with regular client
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              username: defaultUsername,
              email: user.email || null,
              language_preference: 'en',
            })
            .select()
            .single()
          
          if (!createError && newProfile) {
            return newProfile as Profile
          }
        }
      } catch (createError) {
        console.error('Error creating profile:', createError)
      }
      
      return null
    }
    
    // Log error with all available information
    const errorInfo: Record<string, unknown> = {
      userId,
      error: error,
    }
    
    if (error.message) errorInfo.message = error.message
    if (error.code) errorInfo.code = error.code
    if (error.details) errorInfo.details = error.details
    if (error.hint) errorInfo.hint = error.hint
    
    console.error('Error fetching profile:', errorInfo)
    return null
  }

  if (!data) {
    console.warn(`No profile data returned for user ID: ${userId}`)
    return null
  }

  return data as Profile
}

async function getProfileStories(userId: string) {
  const supabase = await createServerSupabaseClient()

  if (!supabase) {
    console.error('Supabase client is null. Check environment variables.')
    return []
  }

  const { data, error } = await supabase
    .from('stories')
    .select(
      `
      *,
      author:profiles(
        id,
        username,
        avatar_url
      )
    `
    )
    .eq('author_id', userId)
    .eq('is_root', true)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) {
    // Log error with all available information
    const errorInfo: Record<string, unknown> = {
      userId,
      error: error,
    }
    
    if (error.message) errorInfo.message = error.message
    if (error.code) errorInfo.code = error.code
    if (error.details) errorInfo.details = error.details
    if (error.hint) errorInfo.hint = error.hint
    
    console.error('Error fetching profile stories:', errorInfo)
    return []
  }

  return data || []
}

async function getFollowCounts(userId: string) {
  const supabase = await createServerSupabaseClient()

  if (!supabase) {
    return { followersCount: 0, followingCount: 0 }
  }

  // Get followers count
  const { count: followersCount } = await supabase
    .from('followers')
    .select('*', { count: 'exact', head: true })
    .eq('following_id', userId)

  // Get following count
  const { count: followingCount } = await supabase
    .from('followers')
    .select('*', { count: 'exact', head: true })
    .eq('follower_id', userId)

  return {
    followersCount: followersCount || 0,
    followingCount: followingCount || 0,
  }
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { id } = await params
  const currentUser = await getCurrentUser()

  // If not authenticated, redirect to signin
  if (!currentUser) {
    redirect('/signin')
  }

  // Fetch profile data
  const profile = await getProfile(id)

  // If profile doesn't exist, show 404
  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">404</h1>
          <p className="text-gray-400 mb-8">This page could not be found.</p>
          <a
            href="/feed"
            className="text-brand-cyan hover:underline"
          >
            Go back to Feed
          </a>
        </div>
      </div>
    )
  }

  // Fetch user's stories
  const stories = await getProfileStories(id)

  // Fetch follow counts
  const { followersCount, followingCount } = await getFollowCounts(id)

  const isOwnProfile = currentUser.id === id

  // Revalidate profile pages every 60 seconds (for public profiles)
  // Note: This is a page-level revalidation, not route segment config
  // For route segment config, we'd need to export revalidate constant

  return (
    <ProfilePageClient
      profile={profile}
      stories={stories}
      isOwnProfile={isOwnProfile}
      followersCount={followersCount}
      followingCount={followingCount}
    />
  )
}

