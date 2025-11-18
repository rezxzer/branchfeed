/**
 * Export Story API Route
 * 
 * GET: Export a story as JSON (for backup or import to other platforms)
 * Requires authentication and ownership (or admin)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/admin'

export const dynamic = 'force-dynamic'
export const dynamicParams = true
export const revalidate = 0
export const fetchCache = 'force-no-store'

interface ExportedStory {
  version: string
  exportedAt: string
  story: {
    title: string
    description: string | null
    media_url: string | null
    media_type: 'image' | 'video' | null
    max_depth: number
  }
  nodes: Array<{
    parent_node_id: string | null
    choice_label: 'A' | 'B' | null
    content: string | null
    media_url: string | null
    media_type: 'image' | 'video' | null
    depth: number
    choice_a_label: string | null
    choice_a_content: string | null
    choice_b_label: string | null
    choice_b_content: string | null
  }>
  tags?: Array<{
    name: string
    slug: string
  }>
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: storyId } = await params
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

    // Get story
    const { data: story, error: storyError } = await supabase
      .from('stories')
      .select('*')
      .eq('id', storyId)
      .single()

    if (storyError || !story) {
      return NextResponse.json(
        { error: 'Story not found' },
        { status: 404 }
      )
    }

    // Check permissions (user must own the story or be admin)
    const userIsAdmin = await isAdmin(user.id)
    if (story.author_id !== user.id && !userIsAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - You can only export your own stories' },
        { status: 403 }
      )
    }

    // Get story nodes
    const { data: nodes, error: nodesError } = await supabase
      .from('story_nodes')
      .select('*')
      .eq('story_id', storyId)
      .order('depth', { ascending: true })

    if (nodesError) {
      console.error('Error fetching story nodes:', nodesError)
      return NextResponse.json(
        { error: 'Failed to fetch story nodes' },
        { status: 500 }
      )
    }

    // Get story tags
    const { data: storyTags, error: tagsError } = await supabase
      .from('story_tags')
      .select('tag:tags(name, slug)')
      .eq('story_id', storyId)

    if (tagsError) {
      console.error('Error fetching story tags:', tagsError)
      // Don't fail if tags can't be fetched
    }

    // Build export data structure
    const exportedData: ExportedStory = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      story: {
        title: story.title,
        description: story.description,
        media_url: story.media_url,
        media_type: story.media_type,
        max_depth: story.max_depth || 5,
      },
      nodes: (nodes || []).map((node) => ({
        parent_node_id: node.parent_node_id,
        choice_label: node.choice_label,
        content: node.content,
        media_url: node.media_url,
        media_type: node.media_type,
        depth: node.depth,
        choice_a_label: node.choice_a_label,
        choice_a_content: node.choice_a_content,
        choice_b_label: node.choice_b_label,
        choice_b_content: node.choice_b_content,
      })),
    }

    // Add tags if available
    if (storyTags && storyTags.length > 0) {
      exportedData.tags = storyTags
        .map((st: any) => st.tag)
        .filter(Boolean)
        .map((tag: any) => ({
          name: tag.name,
          slug: tag.slug,
        }))
    }

    // Return as JSON with proper headers for download
    const jsonString = JSON.stringify(exportedData, null, 2)
    const filename = `${story.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${storyId.substring(0, 8)}.json`

    return new NextResponse(jsonString, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error: any) {
    console.error('Error in GET /api/stories/[id]/export:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

