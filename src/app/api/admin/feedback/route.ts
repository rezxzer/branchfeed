/**
 * Admin Feedback API Route
 * 
 * GET: Fetch all feedback with filters and pagination
 * PUT: Update feedback status, priority, or admin notes
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { isAdmin, hasAdminPermission } from '@/lib/admin'
import { logError, logInfo } from '@/lib/logger'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

/**
 * GET /api/admin/feedback
 * 
 * Get all feedback with filters and pagination
 * Requires admin permission
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
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const feedbackType = searchParams.get('type')
    const priority = searchParams.get('priority')
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // Build query
    let query = supabase
      .from('user_feedback')
      .select(`
        *,
        profiles:user_id (
          id,
          username,
          avatar_url
        )
      `, { count: 'exact' })

    // Apply filters
    if (status) {
      query = query.eq('status', status)
    }
    if (feedbackType) {
      query = query.eq('feedback_type', feedbackType)
    }
    if (priority) {
      query = query.eq('priority', priority)
    }
    if (category) {
      query = query.eq('category', category)
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' })

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      logError('Error fetching admin feedback', error)
      return NextResponse.json(
        { error: 'Failed to fetch feedback' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      feedback: data || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error: any) {
    logError('Error in admin feedback GET API', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/admin/feedback
 * 
 * Update feedback status, priority, or admin notes
 * Requires admin permission
 */
export async function PUT(request: NextRequest) {
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

    // Parse request body
    const body = await request.json()
    const {
      id,
      status,
      priority,
      adminNotes,
    } = body as {
      id: string
      status?: 'pending' | 'reviewed' | 'in_progress' | 'resolved' | 'dismissed'
      priority?: 'low' | 'medium' | 'high' | 'critical'
      adminNotes?: string
    }

    if (!id) {
      return NextResponse.json(
        { error: 'Missing required field: id' },
        { status: 400 }
      )
    }

    // Build update object
    const updates: any = {}
    if (status !== undefined) {
      updates.status = status
      if (status === 'resolved') {
        updates.resolved_at = new Date().toISOString()
      } else {
        updates.resolved_at = null
      }
    }
    if (priority !== undefined) {
      updates.priority = priority
    }
    if (adminNotes !== undefined) {
      updates.admin_notes = adminNotes
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      )
    }

    // Update feedback
    const { data, error } = await supabase
      .from('user_feedback')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      logError('Error updating feedback', error)
      return NextResponse.json(
        { error: 'Failed to update feedback' },
        { status: 500 }
      )
    }

    logInfo('Feedback updated', {
      id,
      updatedBy: user.id,
      updates,
    })

    return NextResponse.json({
      success: true,
      feedback: data,
    })
  } catch (error: any) {
    logError('Error in admin feedback PUT API', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

