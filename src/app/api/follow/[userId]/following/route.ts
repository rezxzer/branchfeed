/**
 * Following API Route
 * 
 * GET: Get list of users that a specific user is following
 * Requires authentication
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient()
    
    if (!supabase) {
      return NextResponse.json(
        { error: 'Service unavailable' },
        { status: 503 }
      )
    }

    const { userId } = await params
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const offset = (page - 1) * limit

    // Get following (users that this user follows)
    const { data: following, error: followingError, count } = await supabase
      .from('followers')
      .select(
        `
        following_id,
        created_at,
        following:profiles!following_id(
          id,
          username,
          avatar_url,
          bio
        )
      `,
        { count: 'exact' }
      )
      .eq('follower_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (followingError) {
      console.error('Error fetching following:', followingError)
      return NextResponse.json(
        { error: 'Failed to fetch following' },
        { status: 500 }
      )
    }

    // Transform data
    const followingList = (following || []).map((f: any) => ({
      id: f.following.id,
      username: f.following.username,
      avatar_url: f.following.avatar_url,
      bio: f.following.bio,
      followed_at: f.created_at,
    }))

    return NextResponse.json({
      following: followingList,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error: any) {
    console.error('Error in GET /api/follow/[userId]/following:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

