/**
 * Search API Route
 * 
 * Search stories and users by query string.
 * Public route - no authentication required.
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
    const query = searchParams.get('q') || ''
    const type = searchParams.get('type') || 'all' // 'all', 'stories', 'users'
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const sortBy = searchParams.get('sortBy') || 'relevance' // 'relevance', 'date', 'popularity'

    if (!query.trim()) {
      return NextResponse.json({
        stories: [],
        users: [],
        pagination: {
          page: 1,
          limit,
          total: 0,
          totalPages: 0,
        },
      })
    }

    const offset = (page - 1) * limit
    const searchQuery = `%${query.trim()}%`

    const results: {
      stories: any[]
      users: any[]
      pagination: {
        page: number
        limit: number
        total: number
        totalPages: number
      }
    } = {
      stories: [],
      users: [],
      pagination: {
        page,
        limit,
        total: 0,
        totalPages: 0,
      },
    }

    let totalStories = 0
    let totalUsers = 0

    // Search stories
    if (type === 'all' || type === 'stories') {
      let storiesQuery = supabase
        .from('stories')
        .select(
          `
          *,
          author:profiles(
            id,
            username,
            avatar_url
          )
        `,
          { count: 'exact' }
        )
        .eq('is_root', true)
        .or(`title.ilike.${searchQuery},description.ilike.${searchQuery}`)

      // Apply sorting
      if (sortBy === 'date') {
        storiesQuery = storiesQuery.order('created_at', { ascending: false })
      } else if (sortBy === 'popularity') {
        storiesQuery = storiesQuery.order('likes_count', { ascending: false })
      } else {
        // Relevance: order by created_at as default
        storiesQuery = storiesQuery.order('created_at', { ascending: false })
      }

      storiesQuery = storiesQuery.range(offset, offset + limit - 1)

      const { data: storiesData, error: storiesError, count: storiesCount } = await storiesQuery

      if (storiesError) {
        console.error('Error searching stories:', storiesError)
      } else {
        results.stories = (storiesData || []).map((story: any) => ({
          ...story,
          type: 'story',
        }))
        totalStories = storiesCount || 0
      }
    }

    // Search users
    if (type === 'all' || type === 'users') {
      let usersQuery = supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .or(`username.ilike.${searchQuery},bio.ilike.${searchQuery}`)

      // Apply sorting
      if (sortBy === 'date') {
        usersQuery = usersQuery.order('created_at', { ascending: false })
      } else {
        // Relevance: order by created_at as default
        usersQuery = usersQuery.order('created_at', { ascending: false })
      }

      usersQuery = usersQuery.range(offset, offset + limit - 1)

      const { data: usersData, error: usersError, count: usersCount } = await usersQuery

      if (usersError) {
        console.error('Error searching users:', usersError)
      } else {
        results.users = (usersData || []).map((user: any) => ({
          ...user,
          type: 'user',
        }))
        totalUsers = usersCount || 0
      }
    }

    // Calculate pagination
    const total = totalStories + totalUsers
    const totalPages = Math.ceil(total / limit)

    results.pagination = {
      page,
      limit,
      total,
      totalPages,
    }

    return NextResponse.json(results)
  } catch (error: any) {
    console.error('Error in search API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

