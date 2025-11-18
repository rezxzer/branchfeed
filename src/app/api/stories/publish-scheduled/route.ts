import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'

export const fetchCache = 'force-no-store'
export const dynamic = 'force-dynamic'

/**
 * API route to publish scheduled stories
 * This should be called by a cron job or scheduled task
 * 
 * Security: This endpoint should be protected (e.g., with a secret token)
 * For production, consider using Vercel Cron or similar service
 */
export async function POST(request: NextRequest) {
  try {
    // Optional: Check for authorization token
    const authHeader = request.headers.get('authorization')
    const expectedToken = process.env.CRON_SECRET
    
    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = createAdminSupabaseClient()
    
    if (!supabase) {
      return NextResponse.json(
        { error: 'Service unavailable' },
        { status: 503 }
      )
    }

    // Call the database function to publish scheduled stories
    const { data, error } = await supabase.rpc('publish_scheduled_stories')

    if (error) {
      console.error('Error publishing scheduled stories:', error)
      return NextResponse.json(
        { error: 'Failed to publish scheduled stories', details: error.message },
        { status: 500 }
      )
    }

    const publishedCount = data || 0

    return NextResponse.json({
      success: true,
      publishedCount,
      message: `Published ${publishedCount} scheduled story/stories`,
    })
  } catch (error: any) {
    console.error('Error in POST /api/stories/publish-scheduled:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * GET endpoint for manual testing/debugging
 * Note: In production, you might want to remove this or add proper auth
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminSupabaseClient()
    
    if (!supabase) {
      return NextResponse.json(
        { error: 'Service unavailable' },
        { status: 503 }
      )
    }

    // Get scheduled stories that should be published
    const now = new Date().toISOString()
    const { data: scheduledStories, error } = await supabase
      .from('stories')
      .select('id, title, scheduled_publish_at, status')
      .eq('status', 'draft')
      .not('scheduled_publish_at', 'is', null)
      .lte('scheduled_publish_at', now)
      .order('scheduled_publish_at', { ascending: true })
      .limit(10)

    if (error) {
      console.error('Error fetching scheduled stories:', error)
      return NextResponse.json(
        { error: 'Failed to fetch scheduled stories', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      scheduledStories: scheduledStories || [],
      count: scheduledStories?.length || 0,
      currentTime: now,
    })
  } catch (error: any) {
    console.error('Error in GET /api/stories/publish-scheduled:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

