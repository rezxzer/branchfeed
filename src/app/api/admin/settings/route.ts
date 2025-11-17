/**
 * Admin Settings API Route
 * 
 * Get and update platform settings.
 * Requires admin authentication with canAccessSettings permission.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { isAdmin, hasAdminPermission } from '@/lib/admin';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

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

    // Check if user can access settings
    const canAccessSettings = await hasAdminPermission(user.id, 'canAccessSettings');
    if (!canAccessSettings) {
      return NextResponse.json(
        { error: 'Forbidden - Settings access required' },
        { status: 403 }
      );
    }

    // Fetch all settings
    const { data: settings, error: settingsError } = await supabase
      .from('platform_settings')
      .select('*')
      .order('key');

    if (settingsError) {
      console.error('Error fetching settings:', settingsError);
      return NextResponse.json(
        { error: 'Failed to fetch settings' },
        { status: 500 }
      );
    }

    // Transform to key-value object
    const settingsMap: Record<string, {
      value: unknown;
      description: string | null;
      updated_at: string;
    }> = {};

    settings?.forEach(setting => {
      settingsMap[setting.key] = {
        value: setting.value,
        description: setting.description,
        updated_at: setting.updated_at,
      };
    });

    return NextResponse.json({
      settings: settingsMap,
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
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

    // Check if user can access settings
    const canAccessSettings = await hasAdminPermission(user.id, 'canAccessSettings');
    if (!canAccessSettings) {
      return NextResponse.json(
        { error: 'Forbidden - Settings access required' },
        { status: 403 }
      );
    }

    // Get request body
    const body = await request.json();
    const { key, value } = body;

    if (!key || typeof key !== 'string') {
      return NextResponse.json(
        { error: 'Invalid setting key' },
        { status: 400 }
      );
    }

    if (value === undefined) {
      return NextResponse.json(
        { error: 'Setting value is required' },
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

    // Update setting
    const { data: updatedSetting, error: updateError } = await adminClient
      .from('platform_settings')
      .update({
        value: value,
        updated_by: user.id,
        updated_at: new Date().toISOString(),
      } as never)
      .eq('key', key)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating setting:', updateError);
      return NextResponse.json(
        { error: 'Failed to update setting' },
        { status: 500 }
      );
    }

    // Log admin action
    const settingId = updatedSetting && 'id' in updatedSetting 
      ? (updatedSetting as { id: string }).id 
      : null;
    await adminClient.rpc('log_admin_action', {
      p_admin_id: user.id,
      p_action: 'setting_updated',
      p_target_type: 'platform_setting',
      p_target_id: settingId,
      p_details: { key, value },
    } as never);

    return NextResponse.json({
      success: true,
      setting: updatedSetting,
    }, { status: 200 });
  } catch (error) {
    console.error('Error updating setting:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

