/**
 * Duplicate Story API Route
 * 
 * POST: Duplicate an existing story (creates a copy as draft)
 * Requires authentication and ownership (or admin)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'
import { isAdmin } from '@/lib/admin'

export const dynamic = 'force-dynamic'
export const dynamicParams = true
export const revalidate = 0
export const fetchCache = 'force-no-store'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sourceStoryId } = await params
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

    // Get source story
    const { data: sourceStory, error: storyError } = await supabase
      .from('stories')
      .select('*')
      .eq('id', sourceStoryId)
      .single()

    if (storyError || !sourceStory) {
      return NextResponse.json(
        { error: 'Story not found' },
        { status: 404 }
      )
    }

    // Check permissions (user must own the story or be admin)
    const userIsAdmin = await isAdmin(user.id)
    if (sourceStory.author_id !== user.id && !userIsAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - You can only duplicate your own stories' },
        { status: 403 }
      )
    }

    // Use admin client for operations that might need elevated permissions
    const adminSupabase = createAdminSupabaseClient()

    // Get source story nodes
    const { data: sourceNodes, error: nodesError } = await supabase
      .from('story_nodes')
      .select('*')
      .eq('story_id', sourceStoryId)
      .order('depth', { ascending: true })

    if (nodesError) {
      console.error('Error fetching story nodes:', nodesError)
      return NextResponse.json(
        { error: 'Failed to fetch story nodes' },
        { status: 500 }
      )
    }

    // Get source story tags
    const { data: sourceTags, error: tagsError } = await supabase
      .from('story_tags')
      .select('tag_id')
      .eq('story_id', sourceStoryId)

    if (tagsError) {
      console.error('Error fetching story tags:', tagsError)
      // Don't fail if tags can't be fetched, just log
    }

    // Create new story (as draft)
    const { data: newStory, error: createError } = await supabase
      .from('stories')
      .insert({
        author_id: user.id,
        title: `${sourceStory.title} (Copy)`,
        description: sourceStory.description,
        media_url: sourceStory.media_url, // Reuse same media URL
        media_type: sourceStory.media_type,
        is_root: sourceStory.is_root,
        max_depth: sourceStory.max_depth || 5,
        branches_count: sourceStory.branches_count || 0,
        status: 'draft', // Always create duplicate as draft
        scheduled_publish_at: null, // Don't copy scheduled time
      })
      .select('id')
      .single()

    if (createError || !newStory) {
      console.error('Error creating duplicate story:', createError)
      return NextResponse.json(
        { error: 'Failed to create duplicate story' },
        { status: 500 }
      )
    }

    const newStoryId = newStory.id

    // Duplicate nodes
    if (sourceNodes && sourceNodes.length > 0) {
      // Build a map of old node IDs to new node IDs for parent relationships
      const nodeIdMap = new Map<string, string>()
      
      // First pass: create all nodes and build ID map
      const nodesToInsert = sourceNodes.map((node) => {
        const newNodeId = crypto.randomUUID()
        nodeIdMap.set(node.id, newNodeId)
        
        return {
          id: newNodeId,
          story_id: newStoryId,
          parent_node_id: null as string | null, // Will update in second pass
          choice_label: node.choice_label,
          content: node.content,
          media_url: node.media_url, // Reuse same media URL
          media_type: node.media_type,
          depth: node.depth,
          choice_a_label: node.choice_a_label,
          choice_a_content: node.choice_a_content,
          choice_b_label: node.choice_b_label,
          choice_b_content: node.choice_b_content,
        }
      })

      // Second pass: update parent_node_id references
      sourceNodes.forEach((sourceNode, index) => {
        if (sourceNode.parent_node_id) {
          const newParentId = nodeIdMap.get(sourceNode.parent_node_id)
          if (newParentId) {
            nodesToInsert[index].parent_node_id = newParentId
          }
        }
      })

      const { error: insertNodesError } = await supabase
        .from('story_nodes')
        .insert(nodesToInsert)

      if (insertNodesError) {
        console.error('Error duplicating nodes:', insertNodesError)
        // Try to delete the new story if nodes duplication failed
        await supabase.from('stories').delete().eq('id', newStoryId)
        return NextResponse.json(
          { error: 'Failed to duplicate story nodes' },
          { status: 500 }
        )
      }
    }

    // Duplicate tags
    if (sourceTags && sourceTags.length > 0) {
      const storyTags = sourceTags.map((st) => ({
        story_id: newStoryId,
        tag_id: st.tag_id,
      }))

      const { error: insertTagsError } = await supabase
        .from('story_tags')
        .insert(storyTags)

      if (insertTagsError) {
        console.error('Error duplicating tags:', insertTagsError)
        // Don't fail if tags can't be duplicated, just log
      }
    }

    return NextResponse.json(
      { 
        storyId: newStoryId,
        message: 'Story duplicated successfully'
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Error in POST /api/stories/[id]/duplicate:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

