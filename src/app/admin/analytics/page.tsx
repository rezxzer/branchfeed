/**
 * Admin Analytics Dashboard Page
 * 
 * Protected route - only accessible to admin users with analytics permission.
 * Shows platform analytics and metrics.
 */

import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { isAdmin, hasAdminPermission } from '@/lib/admin';
import { AnalyticsDashboardClient } from '@/components/admin/AnalyticsDashboardClient';

export default async function AdminAnalyticsPage() {
  const supabase = await createServerSupabaseClient();
  
  if (!supabase) {
    redirect('/signin');
  }
  
  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    redirect('/signin');
  }

  // Check if user is admin
  const userIsAdmin = await isAdmin(user.id);
  if (!userIsAdmin) {
    redirect('/');
  }

  // Check if user can view analytics
  const canViewAnalytics = await hasAdminPermission(user.id, 'canViewAnalytics');
  if (!canViewAnalytics) {
    redirect('/admin');
  }

  return <AnalyticsDashboardClient />;
}

