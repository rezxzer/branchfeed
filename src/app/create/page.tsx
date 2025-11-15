import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { CreateStoryPageClient } from '@/components/create/CreateStoryPageClient'

export default async function CreateStoryPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/signin')
  }

  return <CreateStoryPageClient />
}

