/**
 * Admin User Ban API Route
 * 
 * Ban or unban a user (permanent ban).
 * Requires admin authentication with canBanUsers permission.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { isAdmin, hasAdminPermission } from '@/lib/admin';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;
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
      // Check which variables are missing
      const missingVars = []
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL) missingVars.push('NEXT_PUBLIC_SUPABASE_URL')
      if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) missingVars.push('NEXT_PUBLIC_SUPABASE_ANON_KEY')
      
      return NextResponse.json(
        { 
          error: 'Service unavailable',
          details: missingVars.length > 0 
            ? `Missing environment variables: ${missingVars.join(', ')}. Please check your .env.local file and restart the dev server.`
            : 'Supabase client initialization failed. Please check your .env.local file and restart the dev server.'
        },
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

    // Check if user can ban users
    const canBanUsers = await hasAdminPermission(user.id, 'canBanUsers');
    if (!canBanUsers) {
      return NextResponse.json(
        { error: 'Forbidden - Ban users permission required' },
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

    // Prevent self-ban
    if (id === user.id) {
      return NextResponse.json(
        { error: 'Cannot ban yourself' },
        { status: 400 }
      );
    }

    // Get request body
    const body = await request.json();
    const { reason } = body;

    // Use admin client to bypass RLS
    const adminClient = createAdminSupabaseClient();
    if (!adminClient) {
      // Check which variables are missing
      const missingVars = []
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL) missingVars.push('NEXT_PUBLIC_SUPABASE_URL')
      if (!process.env.SUPABASE_SERVICE_ROLE_KEY) missingVars.push('SUPABASE_SERVICE_ROLE_KEY')
      
      return NextResponse.json(
        { 
          error: 'Service unavailable',
          details: missingVars.length > 0 
            ? `Missing admin environment variables: ${missingVars.join(', ')}. Please check your .env.local file and restart the dev server.`
            : 'Admin Supabase client initialization failed. Please check your .env.local file and restart the dev server.'
        },
        { status: 503 }
      );
    }

    // Check if target user exists
    const { data: targetUser, error: userError } = await adminClient
      .from('profiles')
      .select('id, banned_at')
      .eq('id', id)
      .single();

    if (userError || !targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Ban user (set banned_at to current timestamp)
    const { data: updatedUser, error: updateError } = await adminClient
      .from('profiles')
      .update({
        banned_at: new Date().toISOString(),
        ban_reason: reason?.trim() || null,
        suspended_until: null, // Clear suspension if exists
      } as never)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error banning user:', updateError);
      return NextResponse.json(
        { error: 'Failed to ban user' },
        { status: 500 }
      );
    }

    // Log admin action
    await adminClient.rpc('log_admin_action', {
      p_admin_id: user.id,
      p_action: 'user_banned',
      p_target_type: 'user',
      p_target_id: id,
      p_details: { reason: reason?.trim() || null },
    } as never);

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: 'User banned successfully',
    }, { status: 200 });
  } catch (error) {
    console.error('Error banning user:', error);
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
      // Check which variables are missing
      const missingVars = []
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL) missingVars.push('NEXT_PUBLIC_SUPABASE_URL')
      if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) missingVars.push('NEXT_PUBLIC_SUPABASE_ANON_KEY')
      
      return NextResponse.json(
        { 
          error: 'Service unavailable',
          details: missingVars.length > 0 
            ? `Missing environment variables: ${missingVars.join(', ')}. Please check your .env.local file and restart the dev server.`
            : 'Supabase client initialization failed. Please check your .env.local file and restart the dev server.'
        },
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

    // Check if user can ban users
    const canBanUsers = await hasAdminPermission(user.id, 'canBanUsers');
    if (!canBanUsers) {
      return NextResponse.json(
        { error: 'Forbidden - Ban users permission required' },
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

    // Use admin client to bypass RLS
    const adminClient = createAdminSupabaseClient();
    if (!adminClient) {
      // Check which variables are missing
      const missingVars = []
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL) missingVars.push('NEXT_PUBLIC_SUPABASE_URL')
      if (!process.env.SUPABASE_SERVICE_ROLE_KEY) missingVars.push('SUPABASE_SERVICE_ROLE_KEY')
      
      return NextResponse.json(
        { 
          error: 'Service unavailable',
          details: missingVars.length > 0 
            ? `Missing admin environment variables: ${missingVars.join(', ')}. Please check your .env.local file and restart the dev server.`
            : 'Admin Supabase client initialization failed. Please check your .env.local file and restart the dev server.'
        },
        { status: 503 }
      );
    }

    // Unban user (clear banned_at)
    const { data: updatedUser, error: updateError } = await adminClient
      .from('profiles')
      .update({
        banned_at: null,
        ban_reason: null,
      } as never)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error unbanning user:', updateError);
      return NextResponse.json(
        { error: 'Failed to unban user' },
        { status: 500 }
      );
    }

    // Log admin action
    await adminClient.rpc('log_admin_action', {
      p_admin_id: user.id,
      p_action: 'user_unbanned',
      p_target_type: 'user',
      p_target_id: id,
      p_details: {},
    } as never);

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: 'User unbanned successfully',
    }, { status: 200 });
  } catch (error) {
    console.error('Error unbanning user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

