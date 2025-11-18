/**
 * Import Story API Route
 * 
 * POST: Import a story from JSON format
 * Requires authentication
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createStory } from '@/lib/stories'
import type { CreateStoryData, RootStoryData, BranchNodeData } from '@/types/create'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

interface ImportedStory {
  version?: string
  exportedAt?: string
  story: {
    title: string
    description?: string | null
    media_url?: string | null
    media_type?: 'image' | 'video' | null
    max_depth?: number
  }
  nodes: Array<{
    parent_node_id?: string | null
    choice_label?: 'A' | 'B' | null
    content?: string | null
    media_url?: string | null
    media_type?: 'image' | 'video' | null
    depth: number
    choice_a_label?: string | null
    choice_a_content?: string | null
    choice_b_label?: string | null
    choice_b_content?: string | null
  }>
  tags?: Array<{
    name?: string
    slug?: string
    id?: string
  }>
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
    const importedData: ImportedStory = body

    // Validate imported data structure
    if (!importedData.story || !importedData.story.title) {
      return NextResponse.json(
        { error: 'Invalid story data: title is required' },
        { status: 400 }
      )
    }

    if (!Array.isArray(importedData.nodes)) {
      return NextResponse.json(
        { error: 'Invalid story data: nodes must be an array' },
        { status: 400 }
      )
    }

    // Build root story data
    const rootData: RootStoryData = {
      title: importedData.story.title,
      description: importedData.story.description || undefined,
      mediaUrl: importedData.story.media_url || undefined,
      mediaType: importedData.story.media_type || undefined,
      media: null, // Media files are not included in import
    }

    // Build nodes data
    // Group nodes by depth and parent to reconstruct branch structure
    type NodeType = ImportedStory['nodes'][number]
    const nodesByDepth = new Map<number, NodeType[]>()
    const nodesByParent = new Map<string | null, NodeType[]>()

    importedData.nodes.forEach((node) => {
      const depth = node.depth || 0
      if (!nodesByDepth.has(depth)) {
        nodesByDepth.set(depth, [])
      }
      nodesByDepth.get(depth)!.push(node)

      const parentId = node.parent_node_id || null
      if (!nodesByParent.has(parentId)) {
        nodesByParent.set(parentId, [])
      }
      nodesByParent.get(parentId)!.push(node)
    })

    // Convert nodes to BranchNodeData format
    // Each "branch node" in our system represents a choice point with A and B options
    // We need to group nodes by parent and depth to create branch nodes
    const branchNodes: BranchNodeData[] = []

    // Process nodes by depth (starting from depth 0)
    const depths = Array.from(nodesByDepth.keys()).sort((a, b) => a - b)

    for (const depth of depths) {
      const nodesAtDepth = nodesByDepth.get(depth) || []

      // Group nodes by parent to create branch nodes
      const nodesByParentAtDepth = new Map<string | null, NodeType[]>()
      nodesAtDepth.forEach((node) => {
        const parentId = node.parent_node_id || null
        if (!nodesByParentAtDepth.has(parentId)) {
          nodesByParentAtDepth.set(parentId, [])
        }
        nodesByParentAtDepth.get(parentId)!.push(node)
      })

      // For each parent group, create a branch node with A and B choices
      for (const [parentId, nodes] of nodesByParentAtDepth.entries()) {
        // Find A and B choice nodes
        const choiceA = nodes.find((n) => n.choice_label === 'A' || n.choice_a_label)
        const choiceB = nodes.find((n) => n.choice_label === 'B' || n.choice_b_label)

        if (choiceA && choiceB) {
          branchNodes.push({
            id: crypto.randomUUID(), // Temporary ID for UI
            parentNodeId: parentId,
            depth: depth,
            choiceA: {
              label: choiceA.choice_a_label || 'A',
              content: choiceA.choice_a_content || choiceA.content || undefined,
              mediaUrl: choiceA.media_url || undefined,
              mediaType: choiceA.media_type || undefined,
            },
            choiceB: {
              label: choiceB.choice_b_label || 'B',
              content: choiceB.choice_b_content || choiceB.content || undefined,
              mediaUrl: choiceB.media_url || undefined,
              mediaType: choiceB.media_type || undefined,
            },
          })
        } else if (nodes.length === 2) {
          // If we have exactly 2 nodes, treat them as A and B
          const first = nodes[0]
          const second = nodes[1]
          if (first && second) {
            branchNodes.push({
              id: crypto.randomUUID(), // Temporary ID for UI
              parentNodeId: parentId,
              depth: depth,
              choiceA: {
                label: first.choice_a_label || 'A',
                content: first.choice_a_content || first.content || undefined,
                mediaUrl: first.media_url || undefined,
                mediaType: first.media_type || undefined,
              },
              choiceB: {
                label: second.choice_b_label || 'B',
                content: second.choice_b_content || second.content || undefined,
                mediaUrl: second.media_url || undefined,
                mediaType: second.media_type || undefined,
              },
            })
          }
        }
      }
    }

    // Get tag IDs if tags are provided
    let tagIds: string[] | undefined
    if (importedData.tags && importedData.tags.length > 0) {
      // Try to find tags by name or slug
      const tagNames = importedData.tags
        .map((t) => t.name || t.slug)
        .filter(Boolean) as string[]

      if (tagNames.length > 0) {
        const { data: existingTags } = await supabase
          .from('tags')
          .select('id')
          .in('name', tagNames)

        tagIds = existingTags?.map((t) => t.id) || []
      }
    }

    // Create story using existing createStory function
    const createStoryData: CreateStoryData = {
      root: rootData,
      nodes: branchNodes,
      status: 'draft', // Always import as draft
      tagIds: tagIds,
    }

    const newStoryId = await createStory(createStoryData)

    return NextResponse.json(
      {
        storyId: newStoryId,
        message: 'Story imported successfully',
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Error in POST /api/stories/import:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

