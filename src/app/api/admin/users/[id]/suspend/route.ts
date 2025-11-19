/**
 * Admin User Suspend API Route
 * 
 * Suspend or unsuspend a user (temporary ban).
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

    // Prevent self-suspend
    if (id === user.id) {
      return NextResponse.json(
        { error: 'Cannot suspend yourself' },
        { status: 400 }
      );
    }

    // Get request body
    const body = await request.json();
    const { durationDays, reason } = body;

    // Validate duration
    if (!durationDays || typeof durationDays !== 'number' || durationDays <= 0) {
      return NextResponse.json(
        { error: 'Invalid duration. Must be a positive number of days.' },
        { status: 400 }
      );
    }

    // Calculate suspension end date
    const suspendedUntil = new Date();
    suspendedUntil.setDate(suspendedUntil.getDate() + durationDays);

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
      .select('id')
      .eq('id', id)
      .single();

    if (userError || !targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Suspend user (set suspended_until)
    const { data: updatedUser, error: updateError } = await adminClient
      .from('profiles')
      .update({
        suspended_until: suspendedUntil.toISOString(),
        ban_reason: reason?.trim() || null,
      } as never)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error suspending user:', updateError);
      return NextResponse.json(
        { error: 'Failed to suspend user' },
        { status: 500 }
      );
    }

    // Log admin action
    await adminClient.rpc('log_admin_action', {
      p_admin_id: user.id,
      p_action: 'user_suspended',
      p_target_type: 'user',
      p_target_id: id,
      p_details: { 
        durationDays,
        suspendedUntil: suspendedUntil.toISOString(),
        reason: reason?.trim() || null,
      },
    } as never);

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: `User suspended for ${durationDays} day(s)`,
    }, { status: 200 });
  } catch (error) {
    console.error('Error suspending user:', error);
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

    // Unsuspend user (clear suspended_until)
    const { data: updatedUser, error: updateError } = await adminClient
      .from('profiles')
      .update({
        suspended_until: null,
        ban_reason: null,
      } as never)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error unsuspending user:', updateError);
      return NextResponse.json(
        { error: 'Failed to unsuspend user' },
        { status: 500 }
      );
    }

    // Log admin action
    await adminClient.rpc('log_admin_action', {
      p_admin_id: user.id,
      p_action: 'user_unsuspended',
      p_target_type: 'user',
      p_target_id: id,
      p_details: {},
    } as never);

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: 'User unsuspended successfully',
    }, { status: 200 });
  } catch (error) {
    console.error('Error unsuspending user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

