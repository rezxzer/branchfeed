/**
 * Admin Analytics API Route
 * 
 * Returns platform analytics and metrics.
 * Requires admin authentication with canViewAnalytics permission.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { isAdmin, hasAdminPermission } from '@/lib/admin';

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

    // Check if user can view analytics
    const canViewAnalytics = await hasAdminPermission(user.id, 'canViewAnalytics');
    if (!canViewAnalytics) {
      return NextResponse.json(
        { error: 'Forbidden - Analytics access required' },
        { status: 403 }
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || '7d'; // 7d, 30d, 90d, all

    // Calculate date range
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(0); // All time
    }

    // Platform Growth Metrics
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    const { count: newUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate.toISOString());

    // Active Users (users who have interacted in last 24h, 7d, 30d)
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Active users based on recent activity (likes, comments, views, story creation)
    const { data: active24hUsers } = await supabase
      .from('profiles')
      .select('id')
      .or(`updated_at.gte.${last24h.toISOString()},created_at.gte.${last24h.toISOString()}`)
      .limit(10000);

    const { data: active7dUsers } = await supabase
      .from('profiles')
      .select('id')
      .or(`updated_at.gte.${last7d.toISOString()},created_at.gte.${last7d.toISOString()}`)
      .limit(10000);

    const { data: active30dUsers } = await supabase
      .from('profiles')
      .select('id')
      .or(`updated_at.gte.${last30d.toISOString()},created_at.gte.${last30d.toISOString()}`)
      .limit(10000);

    // More accurate: users who have liked, commented, or created stories recently
    const { data: recentLikes } = await supabase
      .from('likes')
      .select('user_id')
      .gte('created_at', last24h.toISOString());

    const { data: recentComments } = await supabase
      .from('comments')
      .select('user_id')
      .gte('created_at', last24h.toISOString());

    const { data: recentStories } = await supabase
      .from('stories')
      .select('author_id')
      .gte('created_at', last24h.toISOString());

    // Combine unique active users from all activities
    const active24hUserIds = new Set([
      ...(recentLikes?.map(l => l.user_id) || []),
      ...(recentComments?.map(c => c.user_id) || []),
      ...(recentStories?.map(s => s.author_id) || []),
    ]);
    const active24hCount = active24hUserIds.size;

    // User Retention (users who signed up in period and are still active)
    const { data: periodUsers } = await supabase
      .from('profiles')
      .select('id, created_at')
      .gte('created_at', startDate.toISOString());

    const periodUserIds = new Set(periodUsers?.map(u => u.id) || []);
    const retainedUsers = Array.from(active24hUserIds).filter(id => periodUserIds.has(id)).length;
    const retentionRate = periodUsers && periodUsers.length > 0 
      ? (retainedUsers / periodUsers.length) * 100 
      : 0;

    const { count: totalStories } = await supabase
      .from('stories')
      .select('*', { count: 'exact', head: true });

    const { count: newStories } = await supabase
      .from('stories')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate.toISOString());

    // User Engagement
    const { count: totalLikes } = await supabase
      .from('likes')
      .select('*', { count: 'exact', head: true });

    // Total comments (using comments_count from stories table for performance)
    const { data: storiesWithComments } = await supabase
      .from('stories')
      .select('comments_count');
    
    const totalComments = storiesWithComments?.reduce((sum, story) => sum + (story.comments_count || 0), 0) || 0;

    // Use RPC for total views sum
    const { data: viewsRpc, error: viewsErr } = await supabase.rpc('total_story_views');
    const totalViewsCount = viewsErr ? 0 : Number(viewsRpc || 0);

    // Popular Stories (top 10 by views)
    const { data: popularStories } = await supabase
      .from('stories')
      .select(`
        id,
        title,
        author_id,
        views_count,
        likes_count,
        created_at,
        author:profiles!stories_author_id_fkey(id, username)
      `)
      .order('views_count', { ascending: false })
      .limit(10);

    // Story Completion Rates
    const { data: progressData } = await supabase
      .from('user_story_progress')
      .select('story_id, completed');

    const totalProgress = progressData?.length || 0;
    const completedProgress = progressData?.filter(p => p.completed).length || 0;
    const completionRate = totalProgress > 0 ? (completedProgress / totalProgress) * 100 : 0;

    // Path Popularity (most common paths)
    const { data: allProgress } = await supabase
      .from('user_story_progress')
      .select('path, story_id');

    // Count path occurrences
    const pathCounts: Record<string, number> = {};
    allProgress?.forEach(progress => {
      if (progress.path && progress.path.length > 0) {
        const pathKey = progress.path.join('→');
        pathCounts[pathKey] = (pathCounts[pathKey] || 0) + 1;
      }
    });

    // Get top 10 paths
    const topPaths = Object.entries(pathCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([path, count]) => ({ path, count }));

    // Drop-off Analysis (average depth reached)
    const { data: depthData } = await supabase
      .from('user_story_progress')
      .select('current_depth, completed');

    const totalDepth = (depthData || []).reduce((sum, d) => sum + (d.current_depth || 0), 0);
    const avgDepth = depthData && depthData.length > 0 ? totalDepth / depthData.length : 0;

    // Daily Growth (last 7 days)
    const dailyGrowth = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));

      const { count: users } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', dayStart.toISOString())
        .lte('created_at', dayEnd.toISOString());

      const { count: stories } = await supabase
        .from('stories')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', dayStart.toISOString())
        .lte('created_at', dayEnd.toISOString());

      dailyGrowth.push({
        date: dayStart.toISOString().split('T')[0],
        users: users || 0,
        stories: stories || 0,
      });
    }

    return NextResponse.json({
      platform: {
        totalUsers: totalUsers || 0,
        newUsers: newUsers || 0,
        totalStories: totalStories || 0,
        newStories: newStories || 0,
        activeUsers24h: active24hCount,
        activeUsers7d: active7dUsers?.length || 0,
        activeUsers30d: active30dUsers?.length || 0,
        retentionRate: Math.round(retentionRate * 100) / 100,
      },
      engagement: {
        totalLikes: totalLikes || 0,
        totalViews: totalViewsCount,
        totalComments: totalComments,
        avgViewsPerStory: totalStories ? Math.round((totalViewsCount / totalStories) * 100) / 100 : 0,
        avgLikesPerStory: totalStories ? Math.round(((totalLikes || 0) / totalStories) * 100) / 100 : 0,
        avgCommentsPerStory: totalStories ? Math.round((totalComments / totalStories) * 100) / 100 : 0,
      },
      branching: {
        completionRate: Math.round(completionRate * 100) / 100,
        avgDepth: Math.round(avgDepth * 100) / 100,
        totalProgress: totalProgress,
        completedProgress: completedProgress,
        topPaths: topPaths,
      },
      popularStories: popularStories || [],
      dailyGrowth: dailyGrowth,
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

