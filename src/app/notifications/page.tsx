import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { NotificationsPageClient } from '@/components/notifications/NotificationsPageClient'

export default async function NotificationsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/signin')
  }

  return <NotificationsPageClient />
}

