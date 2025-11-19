/**
 * Feedback API Route
 * 
 * Submit user feedback (bug reports, feature requests, improvements, general feedback)
 * Public route - authentication optional (anonymous feedback allowed)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { logError, logInfo } from '@/lib/logger'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

const MAX_TITLE_LENGTH = 200
const MAX_DESCRIPTION_LENGTH = 2000
const MAX_CATEGORY_LENGTH = 50

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    
    if (!supabase) {
      return NextResponse.json(
        { error: 'Service unavailable' },
        { status: 503 }
      )
    }

    // Get current user (optional - anonymous feedback allowed)
    const { data: { user } } = await supabase.auth.getUser()
    const userId = user?.id || null

    // Parse request body
    const body = await request.json()
    const {
      feedbackType,
      category,
      title,
      description,
      rating,
    } = body as {
      feedbackType: 'bug' | 'feature' | 'improvement' | 'general' | 'other'
      category?: string
      title: string
      description: string
      rating?: number
    }

    // Validation
    if (!feedbackType || !title || !description) {
      return NextResponse.json(
        { error: 'Missing required fields: feedbackType, title, description' },
        { status: 400 }
      )
    }

    // Validate feedback type
    const validTypes = ['bug', 'feature', 'improvement', 'general', 'other']
    if (!validTypes.includes(feedbackType)) {
      return NextResponse.json(
        { error: `Invalid feedbackType. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate title length
    const trimmedTitle = title.trim()
    if (!trimmedTitle || trimmedTitle.length > MAX_TITLE_LENGTH) {
      return NextResponse.json(
        { error: `Title must be between 1 and ${MAX_TITLE_LENGTH} characters` },
        { status: 400 }
      )
    }

    // Validate description length
    const trimmedDescription = description.trim()
    if (!trimmedDescription || trimmedDescription.length > MAX_DESCRIPTION_LENGTH) {
      return NextResponse.json(
        { error: `Description must be between 1 and ${MAX_DESCRIPTION_LENGTH} characters` },
        { status: 400 }
      )
    }

    // Validate rating if provided
    if (rating !== undefined && (rating < 1 || rating > 5)) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    // Validate category length if provided
    if (category && category.trim().length > MAX_CATEGORY_LENGTH) {
      return NextResponse.json(
        { error: `Category must be at most ${MAX_CATEGORY_LENGTH} characters` },
        { status: 400 }
      )
    }

    // Insert feedback
    const { data, error } = await supabase
      .from('user_feedback')
      .insert({
        user_id: userId,
        feedback_type: feedbackType,
        category: category?.trim() || null,
        title: trimmedTitle,
        description: trimmedDescription,
        rating: rating || null,
        status: 'pending',
        priority: 'medium',
      })
      .select()
      .single()

    if (error) {
      logError('Error creating feedback', error)
      return NextResponse.json(
        { error: 'Failed to submit feedback' },
        { status: 500 }
      )
    }

    logInfo('Feedback submitted', {
      id: data.id,
      type: feedbackType,
      userId: userId || 'anonymous',
    })

    return NextResponse.json({
      success: true,
      id: data.id,
      message: 'Feedback submitted successfully',
    })
  } catch (error: any) {
    logError('Error in feedback API', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/feedback
 * 
 * Get user's own feedback (authenticated users only)
 * Admins can get all feedback
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
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isAdmin = profile?.role === 'admin'

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const feedbackType = searchParams.get('type')
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    // Build query
    let query = supabase
      .from('user_feedback')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })

    // Apply filters based on user role
    if (isAdmin) {
      // Admins can see all feedback
      if (status) {
        query = query.eq('status', status)
      }
      if (feedbackType) {
        query = query.eq('feedback_type', feedbackType)
      }
    } else {
      // Regular users can only see their own feedback
      query = query.eq('user_id', user.id)
      if (status) {
        query = query.eq('status', status)
      }
      if (feedbackType) {
        query = query.eq('feedback_type', feedbackType)
      }
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      logError('Error fetching feedback', error)
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
    logError('Error in feedback GET API', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

