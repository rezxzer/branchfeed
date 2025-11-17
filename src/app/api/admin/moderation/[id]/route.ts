/**
 * Admin Report Status Update API Route
 * 
 * Updates the status of a content report.
 * Requires admin authentication with canModerateContent permission.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { isAdmin, hasAdminPermission } from '@/lib/admin';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

export async function PATCH(
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

    // Check if user can moderate content
    const canModerate = await hasAdminPermission(user.id, 'canModerateContent');
    if (!canModerate) {
      return NextResponse.json(
        { error: 'Forbidden - Content moderation permission required' },
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

    // Get request body
    const body = await request.json();
    const { status } = body;

    // Validate status
    const validStatuses = ['pending', 'reviewed', 'resolved', 'dismissed'];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be one of: pending, reviewed, resolved, dismissed' },
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

    // Update report status
    const updateData: {
      status: string;
      admin_id: string;
      resolved_at?: string;
    } = {
      status,
      admin_id: user.id,
    };

    // Set resolved_at if status is resolved or dismissed
    if (status === 'resolved' || status === 'dismissed') {
      updateData.resolved_at = new Date().toISOString();
    }

    const { data: updatedReport, error: updateError } = await adminClient
      .from('content_reports')
      .update(updateData as never)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating report:', updateError);
      return NextResponse.json(
        { error: 'Failed to update report' },
        { status: 500 }
      );
    }

    // Log admin action
    const previousStatus = updatedReport && 'status' in updatedReport 
      ? (updatedReport as { status: string }).status 
      : null;
    await adminClient.rpc('log_admin_action', {
      p_admin_id: user.id,
      p_action: 'report_status_updated',
      p_target_type: 'content_report',
      p_target_id: id,
      p_details: { status, previous_status: previousStatus },
    } as never);

    return NextResponse.json({
      success: true,
      report: updatedReport,
    }, { status: 200 });
  } catch (error) {
    console.error('Error updating report:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

