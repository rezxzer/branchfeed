/**
 * Following Feed API Route
 * 
 * GET: Get stories from users that the current user follows
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
    const tagId = searchParams.get('tagId') || undefined
    const offset = (page - 1) * limit

    // Get list of users that current user follows
    const { data: following, error: followingError } = await supabase
      .from('followers')
      .select('following_id')
      .eq('follower_id', user.id)

    if (followingError) {
      console.error('Error fetching following list:', followingError)
      return NextResponse.json(
        { error: 'Failed to fetch following list' },
        { status: 500 }
      )
    }

    if (!following || following.length === 0) {
      return NextResponse.json({
        stories: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
        },
      })
    }

    const followingIds = following.map((f) => f.following_id)

    // Get stories from followed users
    let query = supabase
      .from('stories')
      .select(
        `
        *,
        author:profiles(
          id,
          username,
          avatar_url
        ),
        story_tags(
          tag:tags(
            id,
            name,
            slug,
            description,
            color,
            created_at,
            updated_at
          )
        )
      `,
        { count: 'exact' }
      )
      .eq('is_root', true)
      .eq('status', 'published') // Only show published stories
      .in('author_id', followingIds)

    // Filter by tag if provided
    if (tagId) {
      query = query.eq('story_tags.tag_id', tagId)
    }

    const { data: stories, error: storiesError, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (storiesError) {
      console.error('Error fetching following stories:', storiesError)
      return NextResponse.json(
        { error: 'Failed to fetch stories' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      stories: stories || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error: any) {
    console.error('Error in GET /api/feed/following:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

