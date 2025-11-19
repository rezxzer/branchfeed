/**
 * Admin Monitoring Dashboard Page
 * 
 * Protected route - only accessible to admin users with analytics permission.
 * Shows real-time monitoring data.
 */

import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { isAdmin, hasAdminPermission } from '@/lib/admin'
import { MonitoringDashboardClient } from '@/components/admin/MonitoringDashboardClient'

export default async function AdminMonitoringPage() {
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

  // Check if user can view analytics
  const canViewAnalytics = await hasAdminPermission(user.id, 'canViewAnalytics')
  if (!canViewAnalytics) {
    redirect('/admin')
  }

  return <MonitoringDashboardClient />
}

