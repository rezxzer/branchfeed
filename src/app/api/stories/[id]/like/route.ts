import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'
import { checkSubscriptionLimit } from '@/lib/subscription-checks'

/**
 * POST /api/stories/[id]/like
 * 
 * Toggle like status for a story (like/unlike).
 * Uses authenticated client for RLS-protected story_likes operations.
 * Uses admin client to update stories.likes_count aggregate.
 * 
 * @param request - Next.js request object
 * @param params - Route parameters containing story id
 * @returns JSON response with updated likesCount and liked status
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Validate id parameter
    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      return NextResponse.json(
        { error: 'Invalid story ID' },
        { status: 400 }
      )
    }

    // Create authenticated Supabase client (for RLS-protected operations)
    const supabase = await createServerSupabaseClient()

    if (!supabase) {
      console.error('Failed to create Supabase client')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    // Get current authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error('Error getting user:', userError)
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify user has a profile (required for story_likes foreign key)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      console.error('Error fetching profile or profile does not exist:', profileError)
      return NextResponse.json(
        { error: 'Profile not found. Please complete your profile setup.' },
        { status: 400 }
      )
    }

    // Check if story exists
    const { data: story, error: storyError } = await supabase
      .from('stories')
      .select('id')
      .eq('id', id)
      .single()

    if (storyError || !story) {
      console.error('Error fetching story:', storyError)
      return NextResponse.json(
        { error: 'Story not found' },
        { status: 404 }
      )
    }

    // Check if user has already liked this story
    // Use profile.id (which should match user.id, but ensures foreign key constraint)
    const { data: existingLike, error: checkError } = await supabase
      .from('story_likes')
      .select('id')
      .eq('story_id', id)
      .eq('user_id', profile.id)
      .maybeSingle()

    // Check subscription limit for likes (only when adding a like, not removing)
    if (!existingLike) {
      const limitCheck = await checkSubscriptionLimit(profile.id, 'like')
      if (!limitCheck.allowed) {
        return NextResponse.json(
          { 
            error: limitCheck.reason || 'Daily like limit reached',
            limitExceeded: true,
            remaining: limitCheck.remaining,
          },
          { status: 403 }
        )
      }
    }

    if (checkError) {
      console.error('Error checking existing like:', {
        error: checkError,
        storyId: id,
        userId: profile.id,
        message: checkError.message,
        code: checkError.code,
        details: checkError.details,
        hint: checkError.hint,
      })
      return NextResponse.json(
        { error: 'Failed to check like status' },
        { status: 500 }
      )
    }

    let liked: boolean

    // Toggle like: delete if exists, insert if not
    // Use profile.id to ensure foreign key constraint is satisfied
    if (existingLike) {
      // Unlike: delete the like record
      const { error } = await supabase
        .from('story_likes')
        .delete()
        .eq('story_id', id)
        .eq('user_id', profile.id)

      if (error) {
        console.error('Error deleting like:', {
          error,
          storyId: id,
          userId: profile.id,
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        })
        return NextResponse.json(
          { error: 'Failed to unlike story' },
          { status: 500 }
        )
      }

      liked = false
    } else {
      // Like: insert new like record
      const { error } = await supabase
        .from('story_likes')
        .insert({
          story_id: id,
          user_id: profile.id,
        })

      if (error) {
        console.error('Error inserting like:', {
          error,
          storyId: id,
          userId: profile.id,
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        })
        return NextResponse.json(
          { error: 'Failed to like story' },
          { status: 500 }
        )
      }

      liked = true
    }

    // Count total likes and update aggregate count using admin client (bypasses RLS)
    // If admin client is not available, we still return success but skip aggregate update
    const adminSupabase = createAdminSupabaseClient()

    let likesCount = 0

    if (adminSupabase) {
      try {
        const { count, error: countError } = await adminSupabase
          .from('story_likes')
          .select('*', { count: 'exact', head: true })
          .eq('story_id', id)

        if (countError) {
          console.error('Error counting likes:', countError)
          // Try to get count from authenticated client as fallback
          const { count: fallbackCount } = await supabase
            .from('story_likes')
            .select('*', { count: 'exact', head: true })
            .eq('story_id', id)
          likesCount = fallbackCount ?? 0
        } else {
          likesCount = count ?? 0
        }

        // Update stories.likes_count using admin client
        const { error: updateError } = await adminSupabase
          .from('stories')
          .update({ likes_count: likesCount } as never)
          .eq('id', id)

        if (updateError) {
          console.error('Error updating stories.likes_count:', updateError)
          // Don't fail the request - the like was already toggled
          // Just log the error
        }
      } catch (adminError) {
        console.error('Error in admin client operations:', adminError)
        // Fallback: try to get count from authenticated client
        try {
          const { count: fallbackCount } = await supabase
            .from('story_likes')
            .select('*', { count: 'exact', head: true })
            .eq('story_id', id)
          likesCount = fallbackCount ?? 0
        } catch (fallbackError) {
          console.error('Error in fallback count query:', fallbackError)
          // If all else fails, use a simple estimate based on current state
          // If we just liked, increment by 1; if we unliked, decrement by 1
          // But we don't have the previous count, so we'll return 0 as fallback
          likesCount = 0
        }
      }
    } else {
      // Admin client not available - use authenticated client to count
      // This might not work if RLS prevents counting, but we try anyway
      console.warn(
        'Admin Supabase client not available. Using authenticated client for like count. Make sure SUPABASE_SERVICE_ROLE_KEY is set in environment variables.'
      )
      try {
        const { count, error: countError } = await supabase
          .from('story_likes')
          .select('*', { count: 'exact', head: true })
          .eq('story_id', id)

        if (countError) {
          console.error('Error counting likes with authenticated client:', countError)
          likesCount = 0
        } else {
          likesCount = count ?? 0
        }

        // Note: We can't update stories.likes_count without admin client
        // This is a limitation, but the like toggle still works
        console.warn(
          'Cannot update stories.likes_count aggregate without admin client. Like toggle succeeded, but aggregate count may be out of sync.'
        )
      } catch (error) {
        console.error('Error in authenticated client count query:', error)
        likesCount = 0
      }
    }

    return NextResponse.json(
      { likesCount, liked },
      { status: 200 }
    )
  } catch (error) {
    console.error('Unexpected error in like toggle route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

