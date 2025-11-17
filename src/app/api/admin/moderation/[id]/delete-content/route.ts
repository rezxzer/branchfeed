/**
 * Admin Delete Content API Route
 * 
 * Deletes reported content (story, post, or comment).
 * Requires admin authentication with canDeleteContent permission.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { isAdmin, hasAdminPermission } from '@/lib/admin';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

export async function POST(
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

    // Check if user can delete content
    const canDelete = await hasAdminPermission(user.id, 'canDeleteContent');
    if (!canDelete) {
      return NextResponse.json(
        { error: 'Forbidden - Content deletion permission required' },
        { status: 403 }
      );
    }

    // Validate report ID
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: 'Invalid report ID' },
        { status: 400 }
      );
    }

    // Use admin client to bypass RLS
    const adminClient = createAdminSupabaseClient();
    if (!adminClient) {
      return NextResponse.json(
        { error: 'Service unavailable' },
        { status: 503 }
      );
    }

    // Get report details
    const { data: report, error: reportError } = await adminClient
      .from('content_reports')
      .select('content_type, content_id')
      .eq('id', id)
      .single();

    if (reportError || !report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }

    const reportData = report as { content_type: string; content_id: string };

    // Delete content based on type
    let deleteError = null;

    if (reportData.content_type === 'story') {
      const { error } = await adminClient
        .from('stories')
        .delete()
        .eq('id', reportData.content_id);
      deleteError = error;
    } else if (reportData.content_type === 'comment') {
      const { error } = await adminClient
        .from('comments')
        .delete()
        .eq('id', reportData.content_id);
      deleteError = error;
    } else {
      // For posts, we treat them as stories in our system
      const { error } = await adminClient
        .from('stories')
        .delete()
        .eq('id', reportData.content_id);
      deleteError = error;
    }

    if (deleteError) {
      console.error('Error deleting content:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete content' },
        { status: 500 }
      );
    }

    // Log admin action
    await adminClient.rpc('log_admin_action', {
      p_admin_id: user.id,
      p_action: 'content_deleted',
      p_target_type: reportData.content_type,
      p_target_id: reportData.content_id,
      p_details: { report_id: id, reason: 'Reported content' },
    } as never);

    return NextResponse.json({
      success: true,
      message: 'Content deleted successfully',
    }, { status: 200 });
  } catch (error) {
    console.error('Error deleting content:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

