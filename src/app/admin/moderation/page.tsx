/**
 * Admin Content Moderation Page
 * 
 * Protected route - only accessible to admin users with moderation permission.
 * Shows content reports and moderation tools.
 */

import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { isAdmin, hasAdminPermission } from '@/lib/admin';
import { ContentModerationClient } from '@/components/admin/ContentModerationClient';

export const revalidate = 0
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export default async function AdminModerationPage() {
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

  // Check if user can moderate content
  const canModerate = await hasAdminPermission(user.id, 'canModerateContent');
  if (!canModerate) {
    redirect('/admin');
  }

  return <ContentModerationClient />;
}

