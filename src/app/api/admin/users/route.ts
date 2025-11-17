/**
 * Admin Users API Route
 * 
 * Returns list of users with pagination, search, and filtering.
 * Requires admin authentication.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/admin';

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

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from('profiles')
      .select('*', { count: 'exact' });

    // Apply search filter
    if (search) {
      query = query.or(`username.ilike.%${search}%,email.ilike.%${search}%`);
    }

    // Apply sorting
    const validSortBy = ['created_at', 'updated_at', 'username', 'email'];
    const validSortOrder = ['asc', 'desc'];
    
    const sortColumn = validSortBy.includes(sortBy) ? sortBy : 'created_at';
    const sortDirection = validSortOrder.includes(sortOrder.toLowerCase()) 
      ? sortOrder.toLowerCase() 
      : 'desc';

    query = query.order(sortColumn, { ascending: sortDirection === 'asc' });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    // Execute query
    const { data: users, error: usersError, count } = await query;

    if (usersError) {
      console.error('Error fetching users:', usersError);
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      );
    }

    // Get admin roles for users
    const userIds = users?.map(u => u.id) || [];
    let adminRolesMap: Record<string, { role: string }> = {};

    if (userIds.length > 0) {
      const { data: adminRoles, error: adminRolesError } = await supabase
        .from('admin_roles')
        .select('user_id, role')
        .in('user_id', userIds);

      if (!adminRolesError && adminRoles) {
        adminRolesMap = adminRoles.reduce((acc, ar) => {
          acc[ar.user_id] = { role: ar.role };
          return acc;
        }, {} as Record<string, { role: string }>);
      }
    }

    // Get story counts for users
    let storyCountsMap: Record<string, number> = {};

    if (userIds.length > 0) {
      const { data: storyCounts, error: storyCountsError } = await supabase
        .from('stories')
        .select('author_id')
        .in('author_id', userIds);

      if (!storyCountsError && storyCounts) {
        storyCountsMap = storyCounts.reduce((acc, story) => {
          acc[story.author_id] = (acc[story.author_id] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
      }
    }

    // Combine user data with admin roles and story counts
    const usersWithMetadata = (users || []).map(user => ({
      ...user,
      adminRole: adminRolesMap[user.id]?.role || null,
      storiesCount: storyCountsMap[user.id] || 0,
    }));

    return NextResponse.json({
      users: usersWithMetadata,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

