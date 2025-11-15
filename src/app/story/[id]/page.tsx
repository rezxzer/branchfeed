import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { StoryDetailPageClient } from '@/components/story/StoryDetailPageClient'

interface StoryDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function StoryDetailPage({
  params,
}: StoryDetailPageProps) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/signin')
  }

  const { id } = await params

  return <StoryDetailPageClient storyId={id} />
}

