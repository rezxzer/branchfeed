/**
 * Bookmarks API Route
 * 
 * POST: Bookmark a story
 * DELETE: Unbookmark a story
 * Requires authentication
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ storyId: string }> }
) {
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

    const { storyId } = await params

    // Check if story exists
    const { data: story, error: storyError } = await supabase
      .from('stories')
      .select('id')
      .eq('id', storyId)
      .single()

    if (storyError || !story) {
      return NextResponse.json(
        { error: 'Story not found' },
        { status: 404 }
      )
    }

    // Check if already bookmarked
    const { data: existingBookmark, error: bookmarkCheckError } = await supabase
      .from('bookmarks')
      .select('id')
      .eq('story_id', storyId)
      .eq('user_id', user.id)
      .single()

    if (existingBookmark) {
      return NextResponse.json(
        { error: 'Story already bookmarked' },
        { status: 400 }
      )
    }

    // Insert bookmark
    const { data: bookmark, error: bookmarkError } = await supabase
      .from('bookmarks')
      .insert({
        story_id: storyId,
        user_id: user.id,
      })
      .select()
      .single()

    if (bookmarkError) {
      console.error('Error bookmarking story:', bookmarkError)
      return NextResponse.json(
        { error: 'Failed to bookmark story' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, bookmark })
  } catch (error: any) {
    console.error('Error in POST /api/bookmarks/[storyId]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ storyId: string }> }
) {
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

    const { storyId } = await params

    // Delete bookmark
    const { error: deleteError } = await supabase
      .from('bookmarks')
      .delete()
      .eq('story_id', storyId)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('Error unbookmarking story:', deleteError)
      return NextResponse.json(
        { error: 'Failed to unbookmark story' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error in DELETE /api/bookmarks/[storyId]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

