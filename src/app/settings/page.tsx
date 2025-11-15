import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { SettingsPageClient } from '@/components/settings/SettingsPageClient'

export default async function SettingsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/signin')
  }

  return <SettingsPageClient userId={user.id} />
}

