import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { logError, logDebug } from '@/lib/logger'

/**
 * POST /api/watch-later/[id]
 * Add video to watch later queue
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: storyId } = await params
  try {
    const supabase = await createServerSupabaseClient()
    if (!supabase) {
      return NextResponse.json(
        { error: 'Service unavailable' },
        { status: 503 }
      )
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify story exists and is a video
    const { data: story, error: storyError } = await supabase
      .from('stories')
      .select('id, media_type')
      .eq('id', storyId)
      .single()

    if (storyError || !story) {
      return NextResponse.json(
        { error: 'Story not found' },
        { status: 404 }
      )
    }

    // Only allow videos to be saved
    if (story.media_type !== 'video') {
      return NextResponse.json(
        { error: 'Only videos can be saved to watch later' },
        { status: 400 }
      )
    }

    // Check if already in watch later
    const { data: existing } = await supabase
      .from('watch_later')
      .select('id')
      .eq('user_id', user.id)
      .eq('story_id', storyId)
      .maybeSingle()

    if (existing) {
      return NextResponse.json(
        { error: 'Video already in watch later queue' },
        { status: 409 }
      )
    }

    // Add to watch later
    const { error: insertError } = await supabase
      .from('watch_later')
      .insert({
        user_id: user.id,
        story_id: storyId,
      })

    if (insertError) {
      logError('Error adding to watch later', insertError)
      return NextResponse.json(
        { error: 'Failed to add to watch later' },
        { status: 500 }
      )
    }

    logDebug('Video added to watch later', { userId: user.id, storyId })
    return NextResponse.json({ success: true })
  } catch (error) {
    logError('Unexpected error in watch later POST', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/watch-later/[id]
 * Remove video from watch later queue
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: storyId } = await params
  try {
    const supabase = await createServerSupabaseClient()
    if (!supabase) {
      return NextResponse.json(
        { error: 'Service unavailable' },
        { status: 503 }
      )
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Remove from watch later
    const { error: deleteError } = await supabase
      .from('watch_later')
      .delete()
      .eq('user_id', user.id)
      .eq('story_id', storyId)

    if (deleteError) {
      logError('Error removing from watch later', deleteError)
      return NextResponse.json(
        { error: 'Failed to remove from watch later' },
        { status: 500 }
      )
    }

    logDebug('Video removed from watch later', { userId: user.id, storyId })
    return NextResponse.json({ success: true })
  } catch (error) {
    logError('Unexpected error in watch later DELETE', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

