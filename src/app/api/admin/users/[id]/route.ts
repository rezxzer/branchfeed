/**
 * Admin User Details API Route
 * 
 * Returns detailed information about a specific user.
 * Requires admin authentication.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/admin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // Validate user ID
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get admin role
    const { data: adminRole } = await supabase
      .from('admin_roles')
      .select('role, permissions, created_at')
      .eq('user_id', id)
      .single();

    // Get user stories count
    const { count: storiesCount } = await supabase
      .from('stories')
      .select('*', { count: 'exact', head: true })
      .eq('author_id', id);

    // Get user likes count (stories they liked)
    const { count: likesCount } = await supabase
      .from('story_likes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', id);

    // Get user comments count
    const { count: commentsCount } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', id);

    // Get recent stories (last 5)
    const { data: recentStories } = await supabase
      .from('stories')
      .select('id, title, created_at, views_count, likes_count')
      .eq('author_id', id)
      .order('created_at', { ascending: false })
      .limit(5);

    return NextResponse.json({
      profile: {
        ...profile,
        banned_at: profile.banned_at || null,
        suspended_until: profile.suspended_until || null,
        ban_reason: profile.ban_reason || null,
      },
      adminRole: adminRole || null,
      stats: {
        storiesCount: storiesCount || 0,
        likesCount: likesCount || 0,
        commentsCount: commentsCount || 0,
      },
      recentStories: recentStories || [],
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching user details:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

