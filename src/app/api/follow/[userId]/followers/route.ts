/**
 * Followers API Route
 * 
 * GET: Get list of users following a specific user
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

    // Get followers (users who follow this user)
    const { data: followers, error: followersError, count } = await supabase
      .from('followers')
      .select(
        `
        follower_id,
        created_at,
        follower:profiles!follower_id(
          id,
          username,
          avatar_url,
          bio
        )
      `,
        { count: 'exact' }
      )
      .eq('following_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (followersError) {
      console.error('Error fetching followers:', followersError)
      return NextResponse.json(
        { error: 'Failed to fetch followers' },
        { status: 500 }
      )
    }

    // Transform data
    const followersList = (followers || []).map((f: any) => ({
      id: f.follower.id,
      username: f.follower.username,
      avatar_url: f.follower.avatar_url,
      bio: f.follower.bio,
      followed_at: f.created_at,
    }))

    return NextResponse.json({
      followers: followersList,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error: any) {
    console.error('Error in GET /api/follow/[userId]/followers:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

