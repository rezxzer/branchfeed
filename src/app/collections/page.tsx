import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { CollectionsPageClient } from '@/components/collections/CollectionsPageClient'

export default async function CollectionsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/signin')
  }

  return <CollectionsPageClient />
}

