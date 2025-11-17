/**
 * Admin User Role Management API Route
 * 
 * Assign or remove admin roles for users.
 * Requires admin authentication with canManageAdmins permission.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { isAdmin, hasAdminPermission } from '@/lib/admin';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

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

    // Check if user can manage admins
    const canManageAdmins = await hasAdminPermission(user.id, 'canManageAdmins');
    if (!canManageAdmins) {
      return NextResponse.json(
        { error: 'Forbidden - Admin management permission required' },
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

    // Get request body
    const body = await request.json();
    const { role } = body;

    // Validate role
    const validRoles = ['super_admin', 'admin', 'moderator', 'support'];
    if (!role || !validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be one of: super_admin, admin, moderator, support' },
        { status: 400 }
      );
    }

    // Check if target user exists
    const { data: targetUser, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', id)
      .single();

    if (userError || !targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Use admin client to bypass RLS for admin_roles table
    const adminClient = createAdminSupabaseClient();
    if (!adminClient) {
      return NextResponse.json(
        { error: 'Service unavailable' },
        { status: 503 }
      );
    }

    // Insert or update admin role
    const { data: adminRole, error: roleError } = await adminClient
      .from('admin_roles')
      .upsert({
        user_id: id,
        role: role,
        permissions: null,
        updated_at: new Date().toISOString(),
      } as never, {
        onConflict: 'user_id',
      })
      .select()
      .single();

    if (roleError) {
      console.error('Error assigning admin role:', roleError);
      return NextResponse.json(
        { error: 'Failed to assign admin role' },
        { status: 500 }
      );
    }

    // Log admin action (using admin client)
    await adminClient.rpc('log_admin_action', {
      p_admin_id: user.id,
      p_action: 'role_assigned',
      p_target_type: 'user',
      p_target_id: id,
      p_details: { role: role },
    } as never);

    return NextResponse.json({
      success: true,
      adminRole: adminRole,
    }, { status: 200 });
  } catch (error) {
    console.error('Error assigning admin role:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Check if user can manage admins
    const canManageAdmins = await hasAdminPermission(user.id, 'canManageAdmins');
    if (!canManageAdmins) {
      return NextResponse.json(
        { error: 'Forbidden - Admin management permission required' },
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

    // Prevent self-removal
    if (id === user.id) {
      return NextResponse.json(
        { error: 'Cannot remove your own admin role' },
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

    // Get role before deletion for logging
    const { data: existingRole } = await adminClient
      .from('admin_roles')
      .select('role')
      .eq('user_id', id)
      .single();

    // Delete admin role
    const { error: deleteError } = await adminClient
      .from('admin_roles')
      .delete()
      .eq('user_id', id);

    if (deleteError) {
      console.error('Error removing admin role:', deleteError);
      return NextResponse.json(
        { error: 'Failed to remove admin role' },
        { status: 500 }
      );
    }

    // Log admin action
    if (existingRole && 'role' in existingRole) {
      await adminClient.rpc('log_admin_action', {
        p_admin_id: user.id,
        p_action: 'role_removed',
        p_target_type: 'user',
        p_target_id: id,
        p_details: { role: (existingRole as { role: string }).role },
      } as never);
    }

    return NextResponse.json({
      success: true,
    }, { status: 200 });
  } catch (error) {
    console.error('Error removing admin role:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

