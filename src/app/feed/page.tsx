import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { FeedPageClient } from '@/components/feed/FeedPageClient'

export default async function FeedPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/signin')
  }

  return <FeedPageClient />
}

