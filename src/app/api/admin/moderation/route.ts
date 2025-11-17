/**
 * Admin Content Moderation API Route
 * 
 * Returns list of content reports with filtering and status.
 * Requires admin authentication with canModerateContent permission.
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

    // Check if user can moderate content
    const canModerate = await hasAdminPermission(user.id, 'canModerateContent');
    if (!canModerate) {
      return NextResponse.json(
        { error: 'Forbidden - Content moderation permission required' },
        { status: 403 }
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const status = searchParams.get('status') || 'all'; // all, pending, reviewed, resolved, dismissed
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const offset = (page - 1) * limit;

    // Build query - fetch reports first, then join profiles separately
    let query = supabase
      .from('content_reports')
      .select('*', { count: 'exact' });

    // Apply status filter
    if (status !== 'all') {
      query = query.eq('status', status);
    }

    // Apply sorting
    const validSortBy = ['created_at', 'resolved_at', 'status'];
    const validSortOrder = ['asc', 'desc'];
    
    const sortColumn = validSortBy.includes(sortBy) ? sortBy : 'created_at';
    const sortDirection = validSortOrder.includes(sortOrder.toLowerCase()) 
      ? sortOrder.toLowerCase() 
      : 'desc';

    query = query.order(sortColumn, { ascending: sortDirection === 'asc' });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    // Execute query
    const { data: reports, error: reportsError, count } = await query;

    if (reportsError) {
      console.error('Error fetching reports:', {
        message: reportsError.message,
        code: reportsError.code,
        details: reportsError.details,
        hint: reportsError.hint,
      });
      return NextResponse.json(
        { 
          error: 'Failed to fetch reports',
          details: reportsError.message || 'Unknown error',
        },
        { status: 500 }
      );
    }

    // Fetch reporter and admin profiles separately
    const reportsWithProfiles = await Promise.all(
      (reports || []).map(async (report) => {
        // Fetch reporter profile
        const { data: reporterProfile } = await supabase
          .from('profiles')
          .select('id, username, email, avatar_url')
          .eq('id', report.reporter_id)
          .single();

        // Fetch admin profile if exists
        let adminProfile = null;
        if (report.admin_id) {
          const { data: admin } = await supabase
            .from('profiles')
            .select('id, username, email')
            .eq('id', report.admin_id)
            .single();
          adminProfile = admin;
        }

        return {
          ...report,
          reporter: reporterProfile || {
            id: report.reporter_id,
            username: 'Unknown',
            email: null,
            avatar_url: null,
          },
          admin: adminProfile,
        };
      })
    );

    console.log('Reports fetched:', {
      count: reportsWithProfiles.length,
      total: count || 0,
      firstReport: reportsWithProfiles[0] ? {
        id: reportsWithProfiles[0].id,
        content_type: reportsWithProfiles[0].content_type,
        status: reportsWithProfiles[0].status,
        hasReporter: !!reportsWithProfiles[0].reporter,
        hasAdmin: !!reportsWithProfiles[0].admin,
      } : null,
    });

    return NextResponse.json({
      reports: reportsWithProfiles,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

