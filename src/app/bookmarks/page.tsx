import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { BookmarksPageClient } from '@/components/bookmarks/BookmarksPageClient'

export default async function BookmarksPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/signin')
  }

  return <BookmarksPageClient />
}

