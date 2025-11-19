/**
 * Admin Feedback Page
 * 
 * Protected route - only accessible to admin users.
 * Shows user feedback submissions and management tools.
 */

import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/admin'
import { FeedbackManagementClient } from '@/components/admin/FeedbackManagementClient'

export const revalidate = 0
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export default async function AdminFeedbackPage() {
  const supabase = await createServerSupabaseClient()
  
  if (!supabase) {
    redirect('/signin')
  }
  
  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    redirect('/signin')
  }

  // Check if user is admin
  const userIsAdmin = await isAdmin(user.id)
  if (!userIsAdmin) {
    redirect('/')
  }

  return <FeedbackManagementClient />
}

