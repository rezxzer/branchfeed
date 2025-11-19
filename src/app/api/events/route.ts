/**
 * Events API Route
 * 
 * POST: Record platform events (page views, feature usage, errors, performance metrics)
 * GET: Fetch events (admin only, with filtering)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/admin'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

interface EventData {
  event_type: 'page_view' | 'feature_used' | 'error' | 'performance' | 'user_action' | 'api_call' | 'database_query'
  event_name: string
  user_id?: string | null
  session_id?: string
  metadata?: Record<string, any>
  severity?: 'info' | 'warning' | 'error' | 'critical'
  duration_ms?: number
  status_code?: number
  error_message?: string
  error_stack?: string
}

/**
 * POST /api/events
 * Record a platform event
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    
    if (!supabase) {
      return NextResponse.json(
        { error: 'Service unavailable' },
        { status: 503 }
      )
    }

    const body: EventData = await request.json()

    // Validate required fields
    if (!body.event_type || !body.event_name) {
      return NextResponse.json(
        { error: 'event_type and event_name are required' },
        { status: 400 }
      )
    }

    // Get current user (if authenticated)
    const { data: { user } } = await supabase.auth.getUser()
    const userId = user?.id || body.user_id || null

    // Insert event
    const { data, error } = await supabase
      .from('platform_events')
      .insert({
        event_type: body.event_type,
        event_name: body.event_name,
        user_id: userId,
        session_id: body.session_id || null,
        metadata: body.metadata || {},
        severity: body.severity || 'info',
        duration_ms: body.duration_ms || null,
        status_code: body.status_code || null,
        error_message: body.error_message || null,
        error_stack: body.error_stack || null,
      })
      .select()
      .single()

    if (error) {
      console.error('Error recording event:', error)
      // Don't fail the request if event recording fails
      return NextResponse.json(
        { success: true, message: 'Event recorded (with errors)' },
        { status: 200 }
      )
    }

    return NextResponse.json({
      success: true,
      event: data,
    })
  } catch (error: any) {
    console.error('Error in POST /api/events:', error)
    // Don't fail the request if event recording fails
    return NextResponse.json(
      { success: true, message: 'Event recording failed silently' },
      { status: 200 }
    )
  }
}

/**
 * GET /api/events
 * Fetch events (admin only)
 */
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
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const userIsAdmin = await isAdmin(user.id)
    if (!userIsAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const eventType = searchParams.get('event_type')
    const eventName = searchParams.get('event_name')
    const severity = searchParams.get('severity')
    const userId = searchParams.get('user_id')
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build query
    let query = supabase
      .from('platform_events')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (eventType) {
      query = query.eq('event_type', eventType)
    }

    if (eventName) {
      query = query.eq('event_name', eventName)
    }

    if (severity) {
      query = query.eq('severity', severity)
    }

    if (userId) {
      query = query.eq('user_id', userId)
    }

    if (startDate) {
      query = query.gte('created_at', startDate)
    }

    if (endDate) {
      query = query.lte('created_at', endDate)
    }

    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching events:', error)
      return NextResponse.json(
        { error: 'Failed to fetch events' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      events: data || [],
      total: count || 0,
      limit,
      offset,
    })
  } catch (error: any) {
    console.error('Error in GET /api/events:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

