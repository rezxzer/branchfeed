/**
 * Bookmarks API Route
 * 
 * GET: Get user's bookmarked stories (with pagination)
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
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const offset = (page - 1) * limit

    // Get bookmarked stories
    const { data: bookmarks, error: bookmarksError, count } = await supabase
      .from('bookmarks')
      .select(
        `
        *,
        story:stories(
          *,
          author:profiles(
            id,
            username,
            avatar_url
          )
        )
      `,
        { count: 'exact' }
      )
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (bookmarksError) {
      console.error('Error fetching bookmarks:', bookmarksError)
      return NextResponse.json(
        { error: 'Failed to fetch bookmarks' },
        { status: 500 }
      )
    }

    // Transform bookmarks to stories format and add isBookmarked flag
    const stories = (bookmarks || [])
      .map((bookmark: any) => {
        if (!bookmark.story) return null
        return {
          ...bookmark.story,
          isBookmarked: true, // All stories in bookmarks are bookmarked
        }
      })
      .filter((story: any) => story !== null)

    return NextResponse.json({
      stories,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error: any) {
    console.error('Error in GET /api/bookmarks:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

