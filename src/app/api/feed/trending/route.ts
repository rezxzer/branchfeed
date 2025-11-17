/**
 * Trending Stories API Route
 * 
 * GET: Get trending stories based on views, likes, comments, and time decay
 * Requires authentication (optional - public can view trending)
 */

import { NextRequest, NextResponse } from 'next/server'
import { getTrendingStories } from '@/lib/stories.server'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const timeRange = (searchParams.get('timeRange') || '7d') as '24h' | '7d' | '30d' | 'all'
    
    const offset = (page - 1) * limit

    // Validate timeRange
    if (!['24h', '7d', '30d', 'all'].includes(timeRange)) {
      return NextResponse.json(
        { error: 'Invalid timeRange. Must be one of: 24h, 7d, 30d, all' },
        { status: 400 }
      )
    }

    // Get trending stories
    const stories = await getTrendingStories(limit, offset, timeRange)

    return NextResponse.json({
      stories,
      pagination: {
        page,
        limit,
        total: stories.length, // Note: This is approximate, actual total would require full calculation
        totalPages: Math.ceil(stories.length / limit),
      },
      timeRange,
    })
  } catch (error: any) {
    console.error('Error in GET /api/feed/trending:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

