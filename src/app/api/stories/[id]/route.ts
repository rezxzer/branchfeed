/**
 * Story API Route - Edit and Delete
 * 
 * PATCH: Update story (title, description, media)
 * DELETE: Delete story and all related data
 * Requires authentication and ownership (or admin)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/admin'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient()
    
    if (!supabase) {
      return NextResponse.json(
        { error: 'Service unavailable' },
        { status: 503 }
      )
    }

    const { id } = await params

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get story to check ownership
    const { data: story, error: storyError } = await supabase
      .from('stories')
      .select('author_id, is_root')
      .eq('id', id)
      .single()

    if (storyError || !story) {
      return NextResponse.json(
        { error: 'Story not found' },
        { status: 404 }
      )
    }

    // Check ownership or admin
    const userIsAdmin = await isAdmin(user.id)
    if (story.author_id !== user.id && !userIsAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - You can only edit your own stories' },
        { status: 403 }
      )
    }

    // Only allow editing root stories
    if (!story.is_root) {
      return NextResponse.json(
        { error: 'Can only edit root stories' },
        { status: 400 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { title, description } = body as {
      title?: string
      description?: string
    }

    // Validate
    if (title !== undefined && (!title || title.trim().length === 0)) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }

    // Build update object
    const updateData: {
      title?: string
      description?: string | null
      updated_at?: string
    } = {
      updated_at: new Date().toISOString(),
    }

    if (title !== undefined) {
      updateData.title = title.trim()
    }

    if (description !== undefined) {
      updateData.description = description?.trim() || null
    }

    // Update story
    const { data: updatedStory, error: updateError } = await supabase
      .from('stories')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating story:', updateError)
      return NextResponse.json(
        { error: 'Failed to update story' },
        { status: 500 }
      )
    }

    return NextResponse.json({ story: updatedStory })
  } catch (error: any) {
    console.error('Error in PATCH /api/stories/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient()
    
    if (!supabase) {
      return NextResponse.json(
        { error: 'Service unavailable' },
        { status: 503 }
      )
    }

    const { id } = await params

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get story to check ownership
    const { data: story, error: storyError } = await supabase
      .from('stories')
      .select('author_id, media_url')
      .eq('id', id)
      .single()

    if (storyError || !story) {
      return NextResponse.json(
        { error: 'Story not found' },
        { status: 404 }
      )
    }

    // Check ownership or admin
    const userIsAdmin = await isAdmin(user.id)
    if (story.author_id !== user.id && !userIsAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - You can only delete your own stories' },
        { status: 403 }
      )
    }

    // Delete story (cascade will delete related data: nodes, likes, comments, progress)
    // Note: Media files are not deleted automatically - consider cleanup job
    const { error: deleteError } = await supabase
      .from('stories')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Error deleting story:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete story' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error in DELETE /api/stories/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

