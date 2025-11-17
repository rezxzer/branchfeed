import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { FollowingListClient } from '@/components/profile/FollowingListClient'

interface FollowingPageProps {
  params: Promise<{
    id: string
  }>
}

async function getProfile(userId: string) {
  const supabase = await createServerSupabaseClient()

  if (!supabase) {
    return null
  }

  const { data } = await supabase
    .from('profiles')
    .select('id, username, avatar_url')
    .eq('id', userId)
    .single()

  return data
}

export default async function FollowingPage({ params }: FollowingPageProps) {
  const { id } = await params
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    redirect('/signin')
  }

  const profile = await getProfile(id)

  if (!profile) {
    redirect('/feed')
  }

  return <FollowingListClient userId={id} profileUsername={profile.username || 'User'} />
}

