import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { CollectionDetailPageClient } from '@/components/collections/CollectionDetailPageClient'

interface CollectionPageProps {
  params: Promise<{ id: string }>
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { id } = await params
  const user = await getCurrentUser()

  // Allow viewing public collections without auth, but require auth for private ones
  // We'll check this in the client component

  return <CollectionDetailPageClient collectionId={id} currentUserId={user?.id} />
}

