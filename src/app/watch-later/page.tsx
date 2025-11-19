import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { WatchLaterPageClient } from '@/components/watch-later/WatchLaterPageClient'

export default async function WatchLaterPage() {
  const supabase = await createServerSupabaseClient()
  if (!supabase) {
    redirect('/')
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/signin')
  }

  return <WatchLaterPageClient />
}

