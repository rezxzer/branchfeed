/**
 * Recommendations API Route
 * 
 * GET: Get recommended stories for the current user
 * Requires authentication (optional - returns popular stories if not authenticated)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getRecommendedStories } from '@/lib/recommendations.server'

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

    // Get current user (optional)
    const { data: { user } } = await supabase.auth.getUser()

    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '10', 10)
    const excludeStoryId = searchParams.get('excludeStoryId') || undefined

    // Get recommended stories
    const stories = await getRecommendedStories(
      user?.id,
      limit,
      excludeStoryId
    )

    return NextResponse.json({ stories })
  } catch (error: any) {
    console.error('Error in GET /api/recommendations:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

