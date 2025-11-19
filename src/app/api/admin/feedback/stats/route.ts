/**
 * Admin Feedback Stats API Route
 * 
 * GET: Get feedback statistics (counts by type, status, priority, etc.)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/admin'
import { logError } from '@/lib/logger'

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
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const userIsAdmin = await isAdmin(user.id)
    if (!userIsAdmin) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Get total count
    const { count: totalCount } = await supabase
      .from('user_feedback')
      .select('*', { count: 'exact', head: true })

    // Get counts by status
    const { data: statusCounts } = await supabase
      .from('user_feedback')
      .select('status')
    
    const statusStats = {
      pending: 0,
      reviewed: 0,
      in_progress: 0,
      resolved: 0,
      dismissed: 0,
    }
    
    statusCounts?.forEach((item) => {
      if (item.status in statusStats) {
        statusStats[item.status as keyof typeof statusStats]++
      }
    })

    // Get counts by type
    const { data: typeCounts } = await supabase
      .from('user_feedback')
      .select('feedback_type')
    
    const typeStats = {
      bug: 0,
      feature: 0,
      improvement: 0,
      general: 0,
      other: 0,
    }
    
    typeCounts?.forEach((item) => {
      if (item.feedback_type in typeStats) {
        typeStats[item.feedback_type as keyof typeof typeStats]++
      }
    })

    // Get counts by priority
    const { data: priorityCounts } = await supabase
      .from('user_feedback')
      .select('priority')
    
    const priorityStats = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
    }
    
    priorityCounts?.forEach((item) => {
      if (item.priority in priorityStats) {
        priorityStats[item.priority as keyof typeof priorityStats]++
      }
    })

    // Get average rating
    const { data: ratings } = await supabase
      .from('user_feedback')
      .select('rating')
      .not('rating', 'is', null)
    
    const avgRating = ratings && ratings.length > 0
      ? ratings.reduce((sum, item) => sum + (item.rating || 0), 0) / ratings.length
      : null

    // Get pending count (for badge)
    const pendingCount = statusStats.pending

    return NextResponse.json({
      total: totalCount || 0,
      pending: pendingCount,
      status: statusStats,
      type: typeStats,
      priority: priorityStats,
      averageRating: avgRating ? Math.round(avgRating * 10) / 10 : null,
    })
  } catch (error: any) {
    logError('Error in admin feedback stats API', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

