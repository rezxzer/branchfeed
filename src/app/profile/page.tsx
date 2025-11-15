import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'

export default async function ProfilePage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/signin')
  }

  // Redirect to current user's profile page
  redirect(`/profile/${user.id}`)
}

