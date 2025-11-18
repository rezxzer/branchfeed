/**
 * Collections API Route
 * 
 * GET: Get collections (user's own or public collections)
 * POST: Create a new collection
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    
    if (!supabase) {
      return NextResponse.json(
        { error: 'Service unavailable' },
        { status: 503 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')
    const publicOnly = searchParams.get('publicOnly') === 'true'
    const includeStories = searchParams.get('includeStories') === 'true'

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    // If userId is provided, fetch that user's collections
    // If not provided and user is authenticated, fetch their own collections
    // If not provided and user is not authenticated, fetch only public collections
    const targetUserId = userId || (user ? user.id : null)

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

    if (targetUserId) {
      // Fetch specific user's collections
      if (publicOnly) {
        query = query.eq('user_id', targetUserId).eq('is_public', true)
      } else if (user && user.id === targetUserId) {
        // User can see their own collections (public and private)
        query = query.eq('user_id', targetUserId)
      } else {
        // Other users can only see public collections
        query = query.eq('user_id', targetUserId).eq('is_public', true)
      }
    } else {
      // No userId provided - fetch only public collections
      query = query.eq('is_public', true)
    }

    query = query.order('created_at', { ascending: false })

    const { data: collections, error } = await query

    if (error) {
      console.error('Error fetching collections:', error)
      return NextResponse.json(
        { error: 'Failed to fetch collections' },
        { status: 500 }
      )
    }

    // Transform data if stories are included
    let transformedCollections = collections || []
    if (includeStories && collections) {
      transformedCollections = collections.map((collection: any) => {
        const stories = collection.collection_stories
          ?.sort((a: any, b: any) => a.position - b.position)
          .map((cs: any) => cs.story)
          .filter(Boolean) || []
        return {
          ...collection,
          stories,
        }
      })
    }

    return NextResponse.json({ collections: transformedCollections })
  } catch (error: any) {
    console.error('Error in GET /api/collections:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { name, description, is_public, cover_image_url } = body

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Collection name is required' },
        { status: 400 }
      )
    }

    // Create collection
    const { data: collection, error } = await supabase
      .from('collections')
      .insert({
        user_id: user.id,
        name: name.trim(),
        description: description?.trim() || null,
        is_public: is_public === true,
        cover_image_url: cover_image_url || null,
      })
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
      console.error('Error creating collection:', error)
      return NextResponse.json(
        { error: 'Failed to create collection' },
        { status: 500 }
      )
    }

    return NextResponse.json({ collection }, { status: 201 })
  } catch (error: any) {
    console.error('Error in POST /api/collections:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

