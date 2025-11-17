/**
 * Admin System Settings Page
 * 
 * Protected route - only accessible to admin users with settings permission.
 * Shows platform configuration and feature flags.
 */

import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { isAdmin, hasAdminPermission } from '@/lib/admin';
import { SystemSettingsClient } from '@/components/admin/SystemSettingsClient';

export const revalidate = 0
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export default async function AdminSettingsPage() {
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

  // Check if user can access settings
  const canAccessSettings = await hasAdminPermission(user.id, 'canAccessSettings');
  if (!canAccessSettings) {
    redirect('/admin');
  }

  return <SystemSettingsClient />;
}

