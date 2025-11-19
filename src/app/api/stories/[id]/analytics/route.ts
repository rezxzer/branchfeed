/**
 * Story Analytics API Route
 * 
 * GET: Get analytics for a specific story
 * Requires authentication and story ownership
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export async function GET(
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

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id: storyId } = await params

    // Get story and verify ownership
    const { data: story, error: storyError } = await supabase
      .from('stories')
      .select('id, author_id, title, views_count, likes_count, shares_count, comments_count, created_at')
      .eq('id', storyId)
      .single()

    if (storyError || !story) {
      return NextResponse.json(
        { error: 'Story not found' },
        { status: 404 }
      )
    }

    // Check if user is the author
    if (story.author_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden - You can only view analytics for your own stories' },
        { status: 403 }
      )
    }

    // Get path analytics
    const { data: progressData, error: progressError } = await supabase
      .from('user_story_progress')
      .select('path, current_depth, completed, created_at')
      .eq('story_id', storyId)

    if (progressError) {
      console.error('Error fetching progress data:', progressError)
    }

    // Calculate path popularity
    const pathCounts: Record<string, number> = {}
    const pathCompletion: Record<string, { total: number; completed: number }> = {}
    
    progressData?.forEach((progress) => {
      if (progress.path && progress.path.length > 0) {
        const pathKey = progress.path.join('→')
        pathCounts[pathKey] = (pathCounts[pathKey] || 0) + 1
        
        if (!pathCompletion[pathKey]) {
          pathCompletion[pathKey] = { total: 0, completed: 0 }
        }
        pathCompletion[pathKey].total++
        if (progress.completed) {
          pathCompletion[pathKey].completed++
        }
      }
    })

    // Get top paths
    const topPaths = Object.entries(pathCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([path, count]) => ({
        path,
        count,
        completionRate: pathCompletion[path]
          ? (pathCompletion[path].completed / pathCompletion[path].total) * 100
          : 0,
      }))

    // Calculate completion rate
    const totalProgress = progressData?.length || 0
    const completedProgress = progressData?.filter((p) => p.completed).length || 0
    const completionRate = totalProgress > 0 ? (completedProgress / totalProgress) * 100 : 0

    // Calculate average depth
    const totalDepth = progressData?.reduce((sum, p) => sum + (p.current_depth || 0), 0) || 0
    const avgDepth = totalProgress > 0 ? totalDepth / totalProgress : 0

    // Get views over time (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    // Note: We don't have time-based view tracking, so we'll use story creation date
    // In a future enhancement, we could add a story_views table with timestamps
    const viewsOverTime = [
      {
        date: new Date(story.created_at).toISOString().split('T')[0],
        views: story.views_count || 0,
      },
    ]

    // Engagement metrics
    const engagementRate =
      story.views_count > 0
        ? ((story.likes_count || 0) + (story.comments_count || 0) + (story.shares_count || 0)) / story.views_count * 100
        : 0

    return NextResponse.json({
      story: {
        id: story.id,
        title: story.title,
        created_at: story.created_at,
      },
      views: {
        total: story.views_count || 0,
        overTime: viewsOverTime,
      },
      engagement: {
        likes: story.likes_count || 0,
        comments: story.comments_count || 0,
        shares: story.shares_count || 0,
        engagementRate: Math.round(engagementRate * 100) / 100,
      },
      paths: {
        total: totalProgress,
        completed: completedProgress,
        completionRate: Math.round(completionRate * 100) / 100,
        avgDepth: Math.round(avgDepth * 100) / 100,
        topPaths,
      },
    })
  } catch (error: any) {
    console.error('Error in GET /api/stories/[id]/analytics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/stories/[id]/analytics
 * 
 * Record video view analytics (duration, events, etc.)
 * Requires authentication
 */
export async function POST(
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

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id: storyId } = await params
    const body = await request.json()

    const {
      videoId,
      startTime,
      endTime,
      totalDuration,
      watchPercentage,
      completed,
      events,
    } = body

    // Validate required fields
    if (!videoId || !startTime || !totalDuration) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify story exists
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

    // Store analytics in database (if video_analytics table exists)
    // For now, we'll log it and can add database storage later
    console.log('Video analytics received:', {
      storyId,
      userId: user.id,
      videoId,
      startTime,
      endTime,
      totalDuration,
      watchPercentage,
      completed,
      eventsCount: events?.length || 0,
    })

    // TODO: Store in video_analytics table when schema is ready
    // const { error: insertError } = await supabase
    //   .from('video_analytics')
    //   .insert({
    //     story_id: storyId,
    //     user_id: user.id,
    //     video_id: videoId,
    //     start_time: new Date(startTime).toISOString(),
    //     end_time: endTime ? new Date(endTime).toISOString() : null,
    //     total_duration: totalDuration,
    //     watch_percentage: watchPercentage,
    //     completed,
    //     events: events || [],
    //   })

    return NextResponse.json({
      success: true,
      message: 'Analytics recorded',
    })
  } catch (error: any) {
    console.error('Error in POST /api/stories/[id]/analytics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

