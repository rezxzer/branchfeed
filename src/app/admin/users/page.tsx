/**
 * Admin Users Management Page
 * 
 * Protected route - only accessible to admin users.
 * Shows user list with search, filter, and management actions.
 */

import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/admin';
import { UserManagementClient } from '@/components/admin/UserManagementClient';

export const revalidate = 0
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export default async function AdminUsersPage() {
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

  return <UserManagementClient />;
}

