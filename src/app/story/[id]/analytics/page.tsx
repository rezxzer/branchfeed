import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { StoryAnalyticsClient } from '@/components/story/StoryAnalyticsClient'

interface StoryAnalyticsPageProps {
  params: Promise<{ id: string }>
}

export default async function StoryAnalyticsPage({ params }: StoryAnalyticsPageProps) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/signin')
  }

  const { id: storyId } = await params

  // Verify story exists and user is the author
  const supabase = await createServerSupabaseClient()
  if (supabase) {
    const { data: story } = await supabase
      .from('stories')
      .select('id, author_id')
      .eq('id', storyId)
      .single()

    if (!story || story.author_id !== user.id) {
      redirect('/feed')
    }
  }

  return <StoryAnalyticsClient storyId={storyId} />
}

