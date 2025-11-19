import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { logError, logDebug } from '@/lib/logger'

/**
 * GET /api/watch-later
 * Get user's watch later queue
 */
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    // Get watch later items with story details
    const { data: watchLaterItems, error: fetchError } = await supabase
      .from('watch_later')
      .select(`
        id,
        story_id,
        created_at,
        updated_at,
        stories (
          id,
          title,
          description,
          media_url,
          media_type,
          author_id,
          created_at,
          views_count,
          likes_count,
          profiles!stories_author_id_fkey (
            id,
            username,
            avatar_url
          )
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (fetchError) {
      logError('Error fetching watch later queue', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch watch later queue' },
        { status: 500 }
      )
    }

    // Filter out null stories (in case story was deleted)
    const validItems = (watchLaterItems || []).filter(
      (item: any) => item.stories !== null
    )

    logDebug('Watch later queue fetched', {
      userId: user.id,
      count: validItems.length,
    })

    return NextResponse.json({
      items: validItems,
      count: validItems.length,
    })
  } catch (error) {
    logError('Unexpected error in watch later GET', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

