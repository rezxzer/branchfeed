/**
 * Follow API Route
 * 
 * POST: Follow a user
 * DELETE: Unfollow a user
 * GET: Check if current user follows this user
 * Requires authentication
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export async function POST(
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

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Cannot follow yourself
    if (user.id === userId) {
      return NextResponse.json(
        { error: 'Cannot follow yourself' },
        { status: 400 }
      )
    }

    // Verify target user exists
    const { data: targetUser, error: targetError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single()

    if (targetError || !targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if already following
    const { data: existingFollow, error: checkError } = await supabase
      .from('followers')
      .select('id')
      .eq('follower_id', user.id)
      .eq('following_id', userId)
      .maybeSingle()

    if (checkError) {
      console.error('Error checking follow status:', checkError)
      return NextResponse.json(
        { error: 'Failed to check follow status' },
        { status: 500 }
      )
    }

    if (existingFollow) {
      return NextResponse.json(
        { error: 'Already following this user' },
        { status: 400 }
      )
    }

    // Create follow relationship
    const { data: follow, error: followError } = await supabase
      .from('followers')
      .insert({
        follower_id: user.id,
        following_id: userId,
      })
      .select()
      .single()

    if (followError) {
      console.error('Error creating follow:', followError)
      return NextResponse.json(
        { error: 'Failed to follow user' },
        { status: 500 }
      )
    }

    return NextResponse.json({ follow, isFollowing: true }, { status: 201 })
  } catch (error: any) {
    console.error('Error in POST /api/follow/[userId]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Delete follow relationship
    const { error: deleteError } = await supabase
      .from('followers')
      .delete()
      .eq('follower_id', user.id)
      .eq('following_id', userId)

    if (deleteError) {
      console.error('Error deleting follow:', deleteError)
      return NextResponse.json(
        { error: 'Failed to unfollow user' },
        { status: 500 }
      )
    }

    return NextResponse.json({ isFollowing: false })
  } catch (error: any) {
    console.error('Error in DELETE /api/follow/[userId]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

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

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { isFollowing: false },
        { status: 200 }
      )
    }

    // Check if following
    const { data: follow, error: checkError } = await supabase
      .from('followers')
      .select('id')
      .eq('follower_id', user.id)
      .eq('following_id', userId)
      .maybeSingle()

    if (checkError) {
      console.error('Error checking follow status:', checkError)
      return NextResponse.json(
        { isFollowing: false },
        { status: 200 }
      )
    }

    return NextResponse.json({ isFollowing: !!follow })
  } catch (error: any) {
    console.error('Error in GET /api/follow/[userId]:', error)
    return NextResponse.json(
      { isFollowing: false },
      { status: 200 }
    )
  }
}

