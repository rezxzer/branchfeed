/**
 * Admin Check API Route
 * 
 * Returns whether the current user is an admin.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/admin';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    
    if (!supabase) {
      return NextResponse.json({ isAdmin: false }, { status: 200 });
    }
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ isAdmin: false }, { status: 200 });
    }

    // Check if user is admin
    const userIsAdmin = await isAdmin(user.id);

    return NextResponse.json({ isAdmin: userIsAdmin }, { status: 200 });
  } catch (error) {
    console.error('Error checking admin status:', error);
    return NextResponse.json({ isAdmin: false }, { status: 200 });
  }
}

