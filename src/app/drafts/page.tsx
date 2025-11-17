import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { DraftsPageClient } from '@/components/drafts/DraftsPageClient'

export default async function DraftsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/signin')
  }

  return <DraftsPageClient />
}

