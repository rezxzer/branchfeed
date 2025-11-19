import { createServerSupabaseClient } from '@/lib/supabase/server'
import { FeedbackPageClient } from '@/components/feedback/FeedbackPageClient'

export default async function FeedbackPage() {
  const supabase = await createServerSupabaseClient()
  
  // Check authentication (optional - anonymous feedback allowed)
  const { data: { user } } = await supabase?.auth.getUser() || { data: { user: null } }

  return <FeedbackPageClient userId={user?.id || null} />
}

