/**
 * Admin Dashboard Page
 * 
 * Protected route - only accessible to admin users.
 * Shows platform statistics and admin tools.
 */

import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/admin';
import { AdminDashboardClient } from '@/components/admin/AdminDashboardClient';

export const revalidate = 0
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export default async function AdminDashboardPage() {
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

  // Fetch admin statistics
  let stats = {
    totalUsers: 0,
    activeUsers: 0,
    totalStories: 0,
    totalPosts: 0,
    totalLikes: 0,
    totalViews: 0,
  };

  try {
    // Use absolute URL for server-side fetch
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/admin/stats`, {
      cache: 'no-store',
    });

    if (response.ok) {
      stats = await response.json();
    }
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    // Continue with default stats if fetch fails
  }

  return <AdminDashboardClient stats={stats} />;
}

