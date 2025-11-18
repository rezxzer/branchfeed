/**
 * Collection Stories API Route
 * 
 * POST: Add a story to a collection
 * DELETE: Remove a story from a collection
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const dynamicParams = true
export const revalidate = 0
export const fetchCache = 'force-no-store'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: collectionId } = await params
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

    // Check if collection exists and user owns it
    const { data: collection, error: fetchError } = await supabase
      .from('collections')
      .select('user_id')
      .eq('id', collectionId)
      .single()

    if (fetchError || !collection) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      )
    }

    if (collection.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden - You can only add stories to your own collections' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { storyId, position } = body

    if (!storyId || typeof storyId !== 'string') {
      return NextResponse.json(
        { error: 'Story ID is required' },
        { status: 400 }
      )
    }

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

    // Get max position if position not provided
    let storyPosition = position
    if (storyPosition === undefined) {
      const { data: maxPosition } = await supabase
        .from('collection_stories')
        .select('position')
        .eq('collection_id', collectionId)
        .order('position', { ascending: false })
        .limit(1)
        .single()
      
      storyPosition = maxPosition ? (maxPosition.position + 1) : 0
    }

    // Add story to collection
    const { data: collectionStory, error } = await supabase
      .from('collection_stories')
      .insert({
        collection_id: collectionId,
        story_id: storyId,
        position: storyPosition || 0,
      })
      .select()
      .single()

    if (error) {
      // Check if it's a duplicate
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Story is already in this collection' },
          { status: 409 }
        )
      }
      console.error('Error adding story to collection:', error)
      return NextResponse.json(
        { error: 'Failed to add story to collection' },
        { status: 500 }
      )
    }

    return NextResponse.json({ collectionStory }, { status: 201 })
  } catch (error: any) {
    console.error('Error in POST /api/collections/[id]/stories:', error)
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
    const { id: collectionId } = await params
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

    // Check if collection exists and user owns it
    const { data: collection, error: fetchError } = await supabase
      .from('collections')
      .select('user_id')
      .eq('id', collectionId)
      .single()

    if (fetchError || !collection) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      )
    }

    if (collection.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden - You can only remove stories from your own collections' },
        { status: 403 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const storyId = searchParams.get('storyId')

    if (!storyId) {
      return NextResponse.json(
        { error: 'Story ID is required' },
        { status: 400 }
      )
    }

    // Remove story from collection
    const { error } = await supabase
      .from('collection_stories')
      .delete()
      .eq('collection_id', collectionId)
      .eq('story_id', storyId)

    if (error) {
      console.error('Error removing story from collection:', error)
      return NextResponse.json(
        { error: 'Failed to remove story from collection' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error in DELETE /api/collections/[id]/stories:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

