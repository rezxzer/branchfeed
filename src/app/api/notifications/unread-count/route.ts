/**
 * Unread Notifications Count API Route
 * 
 * GET: Get count of unread notifications for current user
 * Requires authentication
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    
    if (!supabase) {
      return NextResponse.json(
        { error: 'Service unavailable' },
        { status: 503 }
      )
    }

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { count: 0 },
        { status: 200 }
      )
    }

    // Get unread count
    const { count, error: countError } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_read', false)

    if (countError) {
      console.error('Error fetching unread count:', countError)
      return NextResponse.json(
        { count: 0 },
        { status: 200 }
      )
    }

    return NextResponse.json({ count: count || 0 })
  } catch (error: any) {
    console.error('Error in GET /api/notifications/unread-count:', error)
    return NextResponse.json(
      { count: 0 },
      { status: 200 }
    )
  }
}

