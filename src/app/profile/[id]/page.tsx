import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { ProfilePageClient } from '@/components/profile/ProfilePageClient'
import type { Profile } from '@/types'

interface ProfilePageProps {
  params: Promise<{
    id: string
  }>
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
    console.error('Error fetching profile:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
      userId,
    })
    
    // If profile doesn't exist (PGRST116 = no rows returned)
    if (error.code === 'PGRST116') {
      console.warn(`Profile not found for user ID: ${userId}`)
      return null
    }
    
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
    console.error('Error fetching profile stories:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
      userId,
    })
    return []
  }

  return data || []
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

  const isOwnProfile = currentUser.id === id

  return (
    <ProfilePageClient
      profile={profile}
      stories={stories}
      isOwnProfile={isOwnProfile}
    />
  )
}

