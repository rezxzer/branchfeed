import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

/**
 * POST /api/stories/[id]/share
 * 
 * Share a story (track share).
 * Uses authenticated client for RLS-protected story_shares operations.
 * Trigger automatically updates stories.shares_count.
 * 
 * @param request - Next.js request object
 * @param params - Route parameters containing story id
 * @returns JSON response with updated sharesCount and shared status
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

    // Create authenticated Supabase client
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

    // Check if story exists
    const { data: existingStory, error: storyError } = await supabase
      .from('stories')
      .select('id, author_id')
      .eq('id', id)
      .single()

    if (storyError || !existingStory) {
      console.error('Error fetching story:', storyError)
      return NextResponse.json(
        { error: 'Story not found' },
        { status: 404 }
      )
    }

    // Check if user already shared this story
    const { data: existingShare, error: shareCheckError } = await supabase
      .from('story_shares')
      .select('id')
      .eq('story_id', id)
      .eq('user_id', user.id)
      .single()

    if (shareCheckError && shareCheckError.code !== 'PGRST116') {
      // PGRST116 is "not found" which is expected if share doesn't exist
      console.error('Error checking existing share:', shareCheckError)
      return NextResponse.json(
        { error: 'Failed to check share status' },
        { status: 500 }
      )
    }

    if (existingShare) {
      // User already shared, return current status
      const { data: story } = await supabase
        .from('stories')
        .select('shares_count')
        .eq('id', id)
        .single()

      return NextResponse.json({
        sharesCount: story?.shares_count || 0,
        shared: true,
      })
    }

    // Insert share record (trigger will update shares_count)
    const { error: insertError } = await supabase
      .from('story_shares')
      .insert({
        story_id: id,
        user_id: user.id,
      })

    if (insertError) {
      console.error('Error inserting share:', insertError)
      return NextResponse.json(
        { error: 'Failed to share story' },
        { status: 500 }
      )
    }

    // Get updated shares count
    const { data: updatedStory, error: fetchError } = await supabase
      .from('stories')
      .select('shares_count')
      .eq('id', id)
      .single()

    if (fetchError) {
      console.error('Error fetching updated story:', fetchError)
      // Share was successful, but couldn't fetch count
      return NextResponse.json({
        sharesCount: 0,
        shared: true,
      })
    }

    return NextResponse.json({
      sharesCount: updatedStory?.shares_count || 0,
      shared: true,
    })
  } catch (error: any) {
    console.error('Error in POST /api/stories/[id]/share:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/stories/[id]/share
 * 
 * Unshare a story (remove share tracking).
 * Uses authenticated client for RLS-protected story_shares operations.
 * Trigger automatically updates stories.shares_count.
 * 
 * @param request - Next.js request object
 * @param params - Route parameters containing story id
 * @returns JSON response with updated sharesCount and shared status
 */
export async function DELETE(
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

    // Create authenticated Supabase client
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

    // Delete share record (trigger will update shares_count)
    const { error: deleteError } = await supabase
      .from('story_shares')
      .delete()
      .eq('story_id', id)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('Error deleting share:', deleteError)
      return NextResponse.json(
        { error: 'Failed to unshare story' },
        { status: 500 }
      )
    }

    // Get updated shares count
    const { data: updatedStory, error: fetchError } = await supabase
      .from('stories')
      .select('shares_count')
      .eq('id', id)
      .single()

    if (fetchError) {
      console.error('Error fetching updated story:', fetchError)
      // Unshare was successful, but couldn't fetch count
      return NextResponse.json({
        sharesCount: 0,
        shared: false,
      })
    }

    return NextResponse.json({
      sharesCount: updatedStory?.shares_count || 0,
      shared: false,
    })
  } catch (error: any) {
    console.error('Error in DELETE /api/stories/[id]/share:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

