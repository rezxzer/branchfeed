import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'
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
    // If profile doesn't exist (PGRST116 = no rows returned), try to create it
    if (error.code === 'PGRST116') {
      console.warn(`Profile not found for user ID: ${userId}, attempting to create...`)
      
      // Use admin client to create profile (bypasses RLS)
      const adminClient = createAdminSupabaseClient()
      
      if (!adminClient) {
        console.error('Admin client not available, cannot create profile')
        return null
      }
      
      // Try to get user from auth.users to create profile
      const { data: authUser, error: authError } = await adminClient.auth.admin.getUserById(userId)
      
      let email = ''
      let defaultUsername = `user_${userId.substring(0, 8)}`
      
      if (!authError && authUser?.user) {
        email = authUser.user.email || ''
        if (email) {
          defaultUsername = email.split('@')[0]
        }
      }
      
      // Check if username already exists and make it unique
      let finalUsername = defaultUsername
      let counter = 0
      let usernameExists = true
      
      while (usernameExists && counter < 100) {
        const { data: existingProfile } = await adminClient
          .from('profiles')
          .select('id')
          .eq('username', finalUsername)
          .single()
        
        if (!existingProfile) {
          usernameExists = false
        } else {
          counter++
          finalUsername = `${defaultUsername}${counter}`
        }
      }
      
      // Create profile
      const { data: newProfile, error: createError } = await adminClient
        .from('profiles')
        .insert({
          id: userId,
          username: finalUsername,
          email: email || null,
          language_preference: 'en',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as never)
        .select()
        .single()
      
      if (createError) {
        console.error('Error creating profile:', createError)
        return null
      }
      
      return newProfile as Profile
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

