/**
 * Admin Stats API Route
 * 
 * Returns platform statistics for admin dashboard.
 * Requires admin authentication.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/admin';
import type { AdminStats } from '@/types/admin';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    
    if (!supabase) {
      return NextResponse.json(
        { error: 'Service unavailable' },
        { status: 503 }
      );
    }
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const userIsAdmin = await isAdmin(user.id);
    if (!userIsAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // Fetch platform statistics
    const stats: AdminStats = {
      totalUsers: 0,
      activeUsers: 0,
      totalStories: 0,
      totalPosts: 0,
      totalLikes: 0,
      totalViews: 0,
    };

    // Get total users count
    const { count: usersCount, error: usersError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    if (!usersError && usersCount !== null) {
      stats.totalUsers = usersCount;
    }

    // Get active users (last 24 hours) - users who have logged in
    const yesterday = new Date();
    yesterday.setHours(yesterday.getHours() - 24);
    
    const { count: activeUsersCount, error: activeUsersError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('updated_at', yesterday.toISOString());

    if (!activeUsersError && activeUsersCount !== null) {
      stats.activeUsers = activeUsersCount;
    }

    // Get total stories count
    const { count: storiesCount, error: storiesError } = await supabase
      .from('stories')
      .select('*', { count: 'exact', head: true });

    if (!storiesError && storiesCount !== null) {
      stats.totalStories = storiesCount;
    }

    // Get total posts count (stories are posts in our system)
    stats.totalPosts = stats.totalStories;

    // Get total likes count (sum of all stories.likes_count)
    const { data: likesData, error: likesError } = await supabase
      .from('stories')
      .select('likes_count');

    if (!likesError && likesData) {
      stats.totalLikes = likesData.reduce((sum, story) => {
        return sum + (story.likes_count || 0);
      }, 0);
    }

    // Get total views count (sum of all stories.views_count)
    const { data: viewsData, error: viewsError } = await supabase
      .from('stories')
      .select('views_count');

    if (!viewsError && viewsData) {
      stats.totalViews = viewsData.reduce((sum, story) => {
        return sum + (story.views_count || 0);
      }, 0);
    }

    return NextResponse.json(stats, { status: 200 });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

