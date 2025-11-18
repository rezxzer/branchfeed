/**
 * Collection Details API Route
 * 
 * GET: Get a specific collection by ID
 * PUT: Update a collection
 * DELETE: Delete a collection
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const dynamicParams = true
export const revalidate = 0
export const fetchCache = 'force-no-store'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createServerSupabaseClient()
    
    if (!supabase) {
      return NextResponse.json(
        { error: 'Service unavailable' },
        { status: 503 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const includeStories = searchParams.get('includeStories') === 'true'

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()

    // Fetch collection
    let query = supabase
      .from('collections')
      .select(
        `
        *,
        author:profiles(
          id,
          username,
          avatar_url
        )
        ${includeStories ? `,
        collection_stories(
          position,
          story:stories(
            id,
            title,
            description,
            media_url,
            media_type,
            views_count,
            likes_count,
            shares_count,
            author:profiles(
              id,
              username,
              avatar_url
            )
          )
        )` : ''}
      `
      )
      .eq('id', id)
      .single()

    const { data: collection, error } = await query

    if (error || !collection) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      )
    }

    // Check access permissions
    const collectionData = collection as any
    if (!collectionData.is_public && (!user || user.id !== collectionData.user_id)) {
      return NextResponse.json(
        { error: 'Forbidden - Collection is private' },
        { status: 403 }
      )
    }

    // Transform data if stories are included
    let transformedCollection: any = { ...collectionData }
    if (includeStories && collectionData.collection_stories) {
      const stories = collectionData.collection_stories
        .sort((a: any, b: any) => a.position - b.position)
        .map((cs: any) => cs.story)
        .filter(Boolean)
      transformedCollection = {
        ...collectionData,
        stories,
      }
    }

    return NextResponse.json({ collection: transformedCollection })
  } catch (error: any) {
    console.error('Error in GET /api/collections/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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
    const { data: existingCollection, error: fetchError } = await supabase
      .from('collections')
      .select('user_id')
      .eq('id', id)
      .single()

    if (fetchError || !existingCollection) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      )
    }

    if (existingCollection.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden - You can only update your own collections' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, description, is_public, cover_image_url } = body

    // Build update object
    const updates: any = {}
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        return NextResponse.json(
          { error: 'Collection name cannot be empty' },
          { status: 400 }
        )
      }
      updates.name = name.trim()
    }
    if (description !== undefined) {
      updates.description = description?.trim() || null
    }
    if (is_public !== undefined) {
      updates.is_public = is_public === true
    }
    if (cover_image_url !== undefined) {
      updates.cover_image_url = cover_image_url || null
    }

    // Update collection
    const { data: collection, error } = await supabase
      .from('collections')
      .update(updates)
      .eq('id', id)
      .select(
        `
        *,
        author:profiles(
          id,
          username,
          avatar_url
        )
      `
      )
      .single()

    if (error) {
      console.error('Error updating collection:', error)
      return NextResponse.json(
        { error: 'Failed to update collection' },
        { status: 500 }
      )
    }

    return NextResponse.json({ collection })
  } catch (error: any) {
    console.error('Error in PUT /api/collections/[id]:', error)
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
    const { id } = await params
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
    const { data: existingCollection, error: fetchError } = await supabase
      .from('collections')
      .select('user_id')
      .eq('id', id)
      .single()

    if (fetchError || !existingCollection) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      )
    }

    if (existingCollection.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden - You can only delete your own collections' },
        { status: 403 }
      )
    }

    // Delete collection (cascade will delete collection_stories)
    const { error } = await supabase
      .from('collections')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting collection:', error)
      return NextResponse.json(
        { error: 'Failed to delete collection' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error in DELETE /api/collections/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

