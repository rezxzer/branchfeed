/**
 * Admin Monitoring API Route
 * 
 * GET: Get real-time monitoring data (events, errors, performance metrics)
 * Requires admin authentication with canViewAnalytics permission.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { isAdmin, hasAdminPermission } from '@/lib/admin'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

/**
 * GET /api/admin/monitoring
 * Get monitoring data
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

    // Check if user can view analytics
    const canViewAnalytics = await hasAdminPermission(user.id, 'canViewAnalytics')
    if (!canViewAnalytics) {
      return NextResponse.json(
        { error: 'Forbidden - Analytics access required' },
        { status: 403 }
      )
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const period = searchParams.get('period') || '24h' // 1h, 24h, 7d, 30d

    // Calculate date range
    const now = new Date()
    let startDate: Date
    
    switch (period) {
      case '1h':
        startDate = new Date(now.getTime() - 60 * 60 * 1000)
        break
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        break
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    }

    const startDateISO = startDate.toISOString()

    // Check if platform_events table exists by trying a simple query
    const { error: tableCheckError } = await supabase
      .from('platform_events')
      .select('id')
      .limit(1)

    // If table doesn't exist, return empty data
    if (tableCheckError && tableCheckError.code === '42P01') {
      return NextResponse.json({
        period,
        startDate: startDateISO,
        endDate: now.toISOString(),
        summary: {
          totalEvents: 0,
          errorCount: 0,
          errorRate: 0,
          eventCountsByType: {},
        },
        eventStats: [],
        errorEvents: [],
        performanceMetrics: {},
        recentEvents: [],
      })
    }

    // Get event statistics (try RPC, fallback to empty array if function doesn't exist)
    let eventStats: any[] = []
    const { data: eventStatsData, error: statsError } = await supabase
      .rpc('get_event_stats', {
        p_event_type: null,
        p_start_date: startDateISO,
        p_end_date: now.toISOString(),
      })

    if (statsError) {
      // If function doesn't exist, just use empty array
      if (statsError.code !== '42883') {
        console.error('Error fetching event stats:', statsError)
      }
    } else {
      eventStats = eventStatsData || []
    }

    // Get error events
    const { data: errorEvents, error: errorEventsError } = await supabase
      .from('platform_events')
      .select('*')
      .in('severity', ['error', 'critical'])
      .gte('created_at', startDateISO)
      .order('created_at', { ascending: false })
      .limit(50)

    if (errorEventsError) {
      console.error('Error fetching error events:', errorEventsError)
    }

    // Get event counts by type
    const { data: eventCounts, error: countsError } = await supabase
      .from('platform_events')
      .select('event_type')
      .gte('created_at', startDateISO)

    if (countsError) {
      console.error('Error fetching event counts:', countsError)
    }

    // Calculate event counts by type
    const eventCountsByType: Record<string, number> = {}
    if (eventCounts) {
      eventCounts.forEach((event) => {
        eventCountsByType[event.event_type] = (eventCountsByType[event.event_type] || 0) + 1
      })
    }

    // Get performance metrics (average duration by event type)
    const { data: performanceData, error: perfError } = await supabase
      .from('platform_events')
      .select('event_type, duration_ms')
      .eq('event_type', 'performance')
      .gte('created_at', startDateISO)
      .not('duration_ms', 'is', null)

    if (perfError) {
      console.error('Error fetching performance data:', perfError)
    }

    // Calculate average performance metrics
    const performanceMetrics: Record<string, { count: number; avgDuration: number }> = {}
    if (performanceData) {
      const grouped = performanceData.reduce((acc, event) => {
        if (!acc[event.event_type]) {
          acc[event.event_type] = []
        }
        if (event.duration_ms) {
          acc[event.event_type].push(event.duration_ms)
        }
        return acc
      }, {} as Record<string, number[]>)

      Object.keys(grouped).forEach((type) => {
        const durations = grouped[type]
        const avg = durations.reduce((sum, d) => sum + d, 0) / durations.length
        performanceMetrics[type] = {
          count: durations.length,
          avgDuration: Math.round(avg),
        }
      })
    }

    // Get recent events (last 100)
    const { data: recentEvents, error: recentError } = await supabase
      .from('platform_events')
      .select('*')
      .gte('created_at', startDateISO)
      .order('created_at', { ascending: false })
      .limit(100)

    if (recentError) {
      console.error('Error fetching recent events:', recentError)
    }

    // Calculate error rate
    const totalEvents = eventCounts?.length || 0
    const errorCount = errorEvents?.length || 0
    const errorRate = totalEvents > 0 ? (errorCount / totalEvents) * 100 : 0

    return NextResponse.json({
      period,
      startDate: startDateISO,
      endDate: now.toISOString(),
      summary: {
        totalEvents: totalEvents,
        errorCount: errorCount,
        errorRate: Math.round(errorRate * 100) / 100,
        eventCountsByType: eventCountsByType,
      },
      eventStats: eventStats,
      errorEvents: errorEvents || [],
      performanceMetrics: performanceMetrics,
      recentEvents: recentEvents || [],
    })
  } catch (error: any) {
    console.error('Error in GET /api/admin/monitoring:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

