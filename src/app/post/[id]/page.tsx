import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { PostDetailPageClient } from '@/components/post/PostDetailPageClient'

interface PostDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function PostDetailPage({
  params,
}: PostDetailPageProps) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/signin')
  }

  const { id } = await params

  return <PostDetailPageClient postId={id} />
}

