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
      // Search stories by title, description, and tags
      // First, get stories matching title/description
      let storiesQuery = supabase
        .from('stories')
        .select(
          `
          *,
          author:profiles(
            id,
            username,
            avatar_url
          ),
          story_tags(
            tag:tags(
              id,
              name,
              slug
            )
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
        let stories = storiesData || []
        
        // Also search by tags if query matches tag names
        const { data: matchingTags } = await supabase
          .from('tags')
          .select('id')
          .ilike('name', searchQuery)
        
        if (matchingTags && matchingTags.length > 0) {
          const tagIds = matchingTags.map((t: any) => t.id)
          
          // Get story IDs that have matching tags
          const { data: storyTagsData } = await supabase
            .from('story_tags')
            .select('story_id')
            .in('tag_id', tagIds)
          
          if (storyTagsData && storyTagsData.length > 0) {
            const storyIds = [...new Set(storyTagsData.map((st: any) => st.story_id))]
            
            // Fetch stories by tag IDs
            const { data: storiesByTags } = await supabase
              .from('stories')
              .select(
                `
                *,
                author:profiles(
                  id,
                  username,
                  avatar_url
                ),
                story_tags(
                  tag:tags(
                    id,
                    name,
                    slug
                  )
                )
              `
              )
              .eq('is_root', true)
              .in('id', storyIds)
            
            if (storiesByTags) {
              // Merge and deduplicate stories
              const existingIds = new Set(stories.map((s: any) => s.id))
              const newStories = storiesByTags.filter((s: any) => !existingIds.has(s.id))
              stories = [...stories, ...newStories]
            }
          }
        }
        
        // Extract tags and calculate relevance score
        results.stories = stories.map((story: any) => {
          const tags = story.story_tags?.map((st: any) => st.tag).filter(Boolean) || []
          
          // Calculate relevance score
          const queryLower = query.trim().toLowerCase()
          let relevanceScore = 0
          
          // Title match (highest weight)
          if (story.title?.toLowerCase().includes(queryLower)) {
            relevanceScore += 10
            if (story.title?.toLowerCase().startsWith(queryLower)) {
              relevanceScore += 5 // Bonus for starting with query
            }
          }
          
          // Description match
          if (story.description?.toLowerCase().includes(queryLower)) {
            relevanceScore += 5
          }
          
          // Tag match
          const matchingTags = tags.filter((tag: any) => 
            tag.name?.toLowerCase().includes(queryLower)
          )
          relevanceScore += matchingTags.length * 3
          
          return {
            ...story,
            tags,
            type: 'story',
            relevanceScore,
          }
        })
        
        // Sort by relevance if sortBy is 'relevance'
        if (sortBy === 'relevance') {
          results.stories.sort((a: any, b: any) => b.relevanceScore - a.relevanceScore)
        }
        
        // Apply pagination after sorting
        const startIndex = offset
        const endIndex = offset + limit
        results.stories = results.stories.slice(startIndex, endIndex)
        
        totalStories = storiesCount || results.stories.length
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

