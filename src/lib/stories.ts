/**
 * Stories Library - BranchFeed
 * 
 * This module provides functions for:
 * - Creating stories (root story + branch nodes)
 * - Fetching stories and nodes
 * - Path navigation
 * - Media upload to Supabase Storage
 */

import { createClientClient } from './supabase/client'
import type { Story, StoryNode } from '@/types'
import type { CreateStoryData, RootStoryData, BranchNodeData } from '@/types/create'

// ============================================
// Media Upload Functions
// ============================================

/**
 * Upload media file to Supabase Storage
 * @param file - File to upload
 * @param bucket - Storage bucket name (default: 'stories')
 * @param folder - Folder path in bucket (optional)
 * @returns Public URL of uploaded file
 */
export async function uploadMedia(
  file: File,
  bucket: string = 'stories',
  folder?: string
): Promise<string> {
  const supabase = createClientClient()

  // Generate unique filename
  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
  const filePath = folder ? `${folder}/${fileName}` : fileName

  // Upload file
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    console.error('Error uploading media:', error)
    
    // Provide helpful error message for common issues
    if (error.message?.includes('Bucket not found') || error.message?.includes('not found')) {
      throw new Error(
        `Storage bucket '${bucket}' not found. Please create the bucket in Supabase Dashboard:\n\n` +
        `1. Go to Supabase Dashboard → Storage\n` +
        `2. Click "New bucket"\n` +
        `3. Name: "${bucket}"\n` +
        `4. Make it Public\n` +
        `5. See docs/STORAGE_SETUP_INSTRUCTIONS.md for detailed steps`
      )
    }
    
    // Friendly error message for upload failures
    if (error.message?.includes('File size') || error.message?.includes('size')) {
      throw new Error('File is too large. Please upload a file smaller than 10MB.')
    }
    
    if (error.message?.includes('permission') || error.message?.includes('unauthorized')) {
      throw new Error('Permission denied. Please check your storage bucket permissions in Supabase Dashboard.')
    }
    
    throw new Error(`Failed to upload media: ${error.message || 'Unknown error occurred'}`)
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(filePath)

  return publicUrl
}

/**
 * Upload multiple media files
 * @param files - Array of files to upload
 * @param bucket - Storage bucket name
 * @param folder - Folder path in bucket
 * @returns Array of public URLs
 */
export async function uploadMultipleMedia(
  files: File[],
  bucket: string = 'stories',
  folder?: string
): Promise<string[]> {
  const uploadPromises = files.map((file) => uploadMedia(file, bucket, folder))
  return Promise.all(uploadPromises)
}

// ============================================
// Story Creation Functions
// ============================================

/**
 * Create a root story with branch nodes
 * @param data - Story creation data (root + nodes)
 * @returns Story ID
 */
export async function createStory(data: CreateStoryData): Promise<string> {
  const supabase = createClientClient()

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error('User not authenticated')
  }

  try {
    // 1. Upload root story media
    let rootMediaUrl: string | null = null
    if (data.root.media) {
      rootMediaUrl = await uploadMedia(data.root.media, 'stories', 'root')
    } else if (data.root.mediaUrl) {
      rootMediaUrl = data.root.mediaUrl
    }

    // 2. Create root story
    // If scheduled_publish_at is set, status must be 'draft'
    const finalStatus = data.scheduled_publish_at 
      ? 'draft' 
      : (data.status || 'published')
    
    const { data: storyData, error: storyError } = await supabase
      .from('stories')
      .insert({
        author_id: user.id,
        title: data.root.title,
        description: data.root.description || null,
        media_url: rootMediaUrl,
        media_type: data.root.mediaType || (data.root.media ? (data.root.media.type.startsWith('image/') ? 'image' : 'video') : null),
        is_root: true,
        max_depth: 5, // Default max depth
        branches_count: data.nodes.length,
        status: finalStatus,
        scheduled_publish_at: data.scheduled_publish_at || null,
      })
      .select('id')
      .single()

    if (storyError) {
      console.error('Error creating story:', storyError)
      throw new Error(`Failed to create story: ${storyError.message}`)
    }

    const storyId = storyData.id

    // 3. Create branch nodes
    if (data.nodes.length > 0) {
      const nodesToInsert: any[] = []

      for (const node of data.nodes) {
        // Upload media for choice A
        let choiceAMediaUrl: string | null = null
        if (node.choiceA.media) {
          choiceAMediaUrl = await uploadMedia(
            node.choiceA.media,
            'stories',
            `nodes/${storyId}`
          )
        } else if (node.choiceA.mediaUrl) {
          choiceAMediaUrl = node.choiceA.mediaUrl
        }

        // Upload media for choice B
        let choiceBMediaUrl: string | null = null
        if (node.choiceB.media) {
          choiceBMediaUrl = await uploadMedia(
            node.choiceB.media,
            'stories',
            `nodes/${storyId}`
          )
        } else if (node.choiceB.mediaUrl) {
          choiceBMediaUrl = node.choiceB.mediaUrl
        }

        // Create node for choice A
        nodesToInsert.push({
          story_id: storyId,
          parent_node_id: node.parentNodeId || null,
          choice_label: 'A',
          content: node.choiceA.content || null,
          media_url: choiceAMediaUrl,
          media_type: node.choiceA.mediaType || (node.choiceA.media ? (node.choiceA.media.type.startsWith('image/') ? 'image' : 'video') : null),
          depth: node.depth,
          choice_a_label: node.choiceA.label || 'A',
          choice_a_content: node.choiceA.content || null,
          choice_b_label: node.choiceB.label || 'B',
          choice_b_content: node.choiceB.content || null,
        })

        // Create node for choice B
        nodesToInsert.push({
          story_id: storyId,
          parent_node_id: node.parentNodeId || null,
          choice_label: 'B',
          content: node.choiceB.content || null,
          media_url: choiceBMediaUrl,
          media_type: node.choiceB.mediaType || (node.choiceB.media ? (node.choiceB.media.type.startsWith('image/') ? 'image' : 'video') : null),
          depth: node.depth,
          choice_a_label: node.choiceA.label || 'A',
          choice_a_content: node.choiceA.content || null,
          choice_b_label: node.choiceB.label || 'B',
          choice_b_content: node.choiceB.content || null,
        })
      }

      // Insert all nodes
      const { error: nodesError } = await supabase
        .from('story_nodes')
        .insert(nodesToInsert)

      if (nodesError) {
        console.error('Error creating nodes:', nodesError)
        // Try to delete the story if nodes creation failed
        await supabase.from('stories').delete().eq('id', storyId)
        throw new Error(`Failed to create branch nodes: ${nodesError.message}`)
      }
    }

    // 4. Associate tags with story (if provided)
    if (data.tagIds && data.tagIds.length > 0) {
      const storyTags = data.tagIds.map((tagId) => ({
        story_id: storyId,
        tag_id: tagId,
      }))

      const { error: tagsError } = await supabase
        .from('story_tags')
        .insert(storyTags)

      if (tagsError) {
        console.error('Error associating tags with story:', tagsError)
        // Don't fail story creation if tags fail, just log the error
        // Tags can be added later
      }
    }

    return storyId
  } catch (error) {
    console.error('Error in createStory:', error)
    throw error
  }
}

// ============================================
// Story Fetching Functions
// ============================================

// Note: Server-side functions (getStoryById, getRootStories) moved to stories.server.ts
// to avoid importing 'next/headers' in client-side code

/**
 * Get story by ID (client-side)
 * @param storyId - Story ID
 * @returns Story with author profile
 */
export async function getStoryByIdClient(storyId: string): Promise<Story | null> {
  const supabase = createClientClient()

  if (!supabase) {
    console.error('Supabase client is null. Check environment variables.')
    return null
  }

  const { data, error } = await supabase
    .from('stories')
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
    .eq('id', storyId)
    .single()

  if (error) {
    console.error('Error fetching story:', error)
    // If table doesn't exist yet, return null gracefully
    if (
      error.code === 'PGRST116' ||
      error.code === '42P01' || // PostgreSQL: relation does not exist
      error.message?.includes('relation') ||
      error.message?.includes('does not exist') ||
      error.message?.includes('table')
    ) {
      console.warn('Stories table not found. Database setup may be needed.')
      return null
    }
    return null
  }

  return data as Story
}

// Note: Server-side functions moved to stories.server.ts

/**
 * Get root stories for feed (client-side)
 * @param limit - Number of stories to fetch (default: 20)
 * @param offset - Offset for pagination (default: 0)
 * @param sortBy - Sort type: 'recent' | 'popular' | 'trending' (default: 'recent')
 * @param tagId - Optional tag ID to filter stories by tag
 * @returns Array of root stories
 */
export async function getRootStoriesClient(
  limit: number = 20,
  offset: number = 0,
  sortBy: 'recent' | 'popular' | 'trending' = 'recent',
  tagId?: string
): Promise<Story[]> {
  const supabase = createClientClient()

  if (!supabase) {
    console.error('Supabase client is null. Check environment variables.')
    return []
  }

  // Get current user for bookmark status
  const { data: { user } } = await supabase.auth.getUser()

  // Determine sort order based on sortBy
  let orderBy = 'created_at'
  let ascending = false

  if (sortBy === 'popular') {
    orderBy = 'likes_count'
  } else if (sortBy === 'trending') {
    orderBy = 'views_count'
  }

  // Build query
  let query = supabase
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
          slug,
          description,
          color,
          created_at,
          updated_at
        )
      )
    `
    )
    .eq('is_root', true)

  const { data, error } = await query
    .order(orderBy, { ascending })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('Error fetching root stories:', error)
    // If table doesn't exist yet, return empty array gracefully
    if (
      error.code === 'PGRST116' ||
      error.code === '42P01' || // PostgreSQL: relation does not exist
      error.message?.includes('relation') ||
      error.message?.includes('does not exist') ||
      error.message?.includes('table')
    ) {
      console.warn('Stories table not found. Database setup may be needed.')
      return []
    }
    return []
  }

  // Filter by tag after fetching if tagId is provided
  // Note: Supabase PostgREST doesn't support direct filtering on nested relations
  let storiesData = data
  if (tagId && storiesData) {
    storiesData = storiesData.filter((story: any) => {
      const tags = story.story_tags?.map((st: any) => st.tag).filter(Boolean) || []
      return tags.some((tag: any) => tag.id === tagId)
    })
  }

  // Get user's bookmarked stories if authenticated
  let userBookmarkedStories: Set<string> = new Set()
  if (user) {
    const { data: userBookmarks } = await supabase
      .from('bookmarks')
      .select('story_id')
      .eq('user_id', user.id)
    
    if (userBookmarks) {
      userBookmarkedStories = new Set(userBookmarks.map((bookmark: { story_id: string }) => bookmark.story_id))
    }
  }

  // Count branches for each story and add bookmark status
  const storiesWithBranches = await Promise.all(
    (storiesData || []).map(async (story: any) => {
      try {
        const { count, error: countError } = await supabase
          .from('story_nodes')
          .select('*', { count: 'exact', head: true })
          .eq('story_id', story.id)

        // If table doesn't exist, return 0 branches
        if (countError && (countError.code === 'PGRST116' || countError.message?.includes('relation'))) {
          return {
            ...story,
            branches_count: 0,
            isBookmarked: user ? userBookmarkedStories.has(story.id) : false,
          } as Story
        }

        // Extract tags from nested structure
        const tags = story.story_tags?.map((st: any) => st.tag).filter(Boolean) || []

        return {
          ...story,
          branches_count: count || 0,
          isBookmarked: user ? userBookmarkedStories.has(story.id) : false,
          tags,
        } as Story
      } catch (err) {
        // If there's any error counting branches, default to 0
        console.warn(`Error counting branches for story ${story.id}:`, err)
        return {
          ...story,
          branches_count: 0,
          isBookmarked: user ? userBookmarkedStories.has(story.id) : false,
        } as Story
      }
    })
  )

  return storiesWithBranches
}

// ============================================
// Node Fetching Functions
// ============================================

/**
 * Get all nodes for a story
 * @param storyId - Story ID
 * @returns Array of story nodes
 */
export async function getStoryNodes(storyId: string): Promise<StoryNode[]> {
  const supabase = createClientClient()

  if (!supabase) {
    console.error('Supabase client is null. Check environment variables.')
    return []
  }

  const { data, error } = await supabase
    .from('story_nodes')
    .select('*')
    .eq('story_id', storyId)
    .order('depth', { ascending: true })
    .order('choice_label', { ascending: true })

  if (error) {
    console.error('Error fetching story nodes:', error)
    // If table doesn't exist yet, return empty array gracefully
    if (
      error.code === 'PGRST116' ||
      error.code === '42P01' || // PostgreSQL: relation does not exist
      error.message?.includes('relation') ||
      error.message?.includes('does not exist') ||
      error.message?.includes('table')
    ) {
      console.warn('Story nodes table not found. Database setup may be needed.')
      return []
    }
    return []
  }

  return (data || []) as StoryNode[]
}

/**
 * Get node by path (navigate through branching story)
 * @param storyId - Story ID
 * @param path - Array of choices ('A' | 'B')
 * @returns Current node or null if path is invalid
 */
export async function getNodeByPath(
  storyId: string,
  path: ('A' | 'B')[]
): Promise<StoryNode | null> {
  if (path.length === 0) {
    return null // Root story, no node
  }

  // Get all nodes for this story
  const nodes = await getStoryNodes(storyId)

  if (!nodes || nodes.length === 0) {
    return null
  }

  // Navigate through path
  let currentNode: StoryNode | null = null
  let currentDepth = 0

  for (const choice of path) {
    // Find node at current depth with matching choice label
    const nextNode = nodes.find(
      (node) =>
        node &&
        node.depth === currentDepth &&
        node.choice_label === choice &&
        (currentNode === null
          ? node.parent_node_id === null
          : node.parent_node_id === currentNode.id)
    )

    if (!nextNode) {
      return null // Invalid path
    }

    currentNode = nextNode
    currentDepth++
  }

  return currentNode
}

/**
 * Get child nodes for a given parent node
 * @param parentNodeId - Parent node ID
 * @returns Array of child nodes (A and B)
 */
export async function getChildNodes(
  parentNodeId: string
): Promise<StoryNode[]> {
  const supabase = createClientClient()

  const { data, error } = await supabase
    .from('story_nodes')
    .select('*')
    .eq('parent_node_id', parentNodeId)
    .order('choice_label', { ascending: true })

  if (error) {
    console.error('Error fetching child nodes:', error)
    return []
  }

  return (data || []) as StoryNode[]
}

// ============================================
// Path Tracking Functions
// ============================================

/**
 * Update user's progress through a story
 * @param userId - User ID
 * @param storyId - Story ID
 * @param path - Current path (array of 'A' | 'B')
 * @param currentNodeId - Current node ID (optional)
 */
export async function updateUserProgress(
  userId: string,
  storyId: string,
  path: ('A' | 'B')[],
  currentNodeId?: string | null
): Promise<void> {
  const supabase = createClientClient()

  const { error } = await supabase
    .from('user_story_progress')
    .upsert(
      {
        user_id: userId,
        story_id: storyId,
        path: path,
        current_depth: path.length,
        last_node_id: currentNodeId || null,
        completed: false,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'user_id,story_id',
      }
    )

  if (error) {
    console.error('Error updating user progress:', error)
    throw new Error(`Failed to update progress: ${error.message}`)
  }
}

/**
 * Get user's progress for a story
 * @param userId - User ID
 * @param storyId - Story ID
 * @returns User progress or null
 */
export async function getUserProgress(
  userId: string,
  storyId: string
): Promise<{
  path: ('A' | 'B')[]
  current_depth: number
  last_node_id: string | null
  completed: boolean
} | null> {
  const supabase = createClientClient()

  const { data, error } = await supabase
    .from('user_story_progress')
    .select('path, current_depth, last_node_id, completed')
    .eq('user_id', userId)
    .eq('story_id', storyId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // No progress found
      return null
    }
    console.error('Error fetching user progress:', error)
    return null
  }

  return {
    path: (data.path || []) as ('A' | 'B')[],
    current_depth: data.current_depth || 0,
    last_node_id: data.last_node_id || null,
    completed: data.completed || false,
  }
}

// ============================================
// Story Tree Functions
// ============================================

/**
 * Tree node structure for visualization
 */
export interface TreeNode {
  id: string
  storyId: string
  parentId: string | null
  choiceLabel: 'A' | 'B' | null
  content: string | null
  mediaUrl: string | null
  mediaType: 'image' | 'video' | null
  depth: number
  choiceALabel: string | null
  choiceAContent: string | null
  choiceBLabel: string | null
  choiceBContent: string | null
  children: TreeNode[]
  createdAt: string
}

/**
 * Get story tree structure for visualization
 * @param storyId - Story ID
 * @returns Tree structure with all nodes organized hierarchically
 */
export async function getStoryTree(storyId: string): Promise<TreeNode[]> {
  const supabase = createClientClient()

  if (!supabase) {
    console.error('Supabase client is null. Check environment variables.')
    return []
  }

  // Get all nodes for this story
  const nodes = await getStoryNodes(storyId)

  if (!nodes || nodes.length === 0) {
    return []
  }

  // Build tree structure
  const nodeMap = new Map<string, TreeNode>()
  const rootNodes: TreeNode[] = []

  // First pass: create all tree nodes
  for (const node of nodes) {
    const treeNode: TreeNode = {
      id: node.id,
      storyId: node.story_id,
      parentId: node.parent_node_id,
      choiceLabel: node.choice_label,
      content: node.content,
      mediaUrl: node.media_url,
      mediaType: node.media_type,
      depth: node.depth,
      choiceALabel: node.choice_a_label,
      choiceAContent: node.choice_a_content,
      choiceBLabel: node.choice_b_label,
      choiceBContent: node.choice_b_content,
      children: [],
      createdAt: node.created_at,
    }
    nodeMap.set(node.id, treeNode)
  }

  // Second pass: build parent-child relationships
  for (const treeNode of nodeMap.values()) {
    if (treeNode.parentId) {
      const parent = nodeMap.get(treeNode.parentId)
      if (parent) {
        parent.children.push(treeNode)
      }
    } else {
      // Root level nodes (depth 0)
      rootNodes.push(treeNode)
    }
  }

  // Sort children by choice label (A before B)
  const sortChildren = (node: TreeNode) => {
    node.children.sort((a, b) => {
      if (a.choiceLabel === 'A' && b.choiceLabel === 'B') return -1
      if (a.choiceLabel === 'B' && b.choiceLabel === 'A') return 1
      return 0
    })
    node.children.forEach(sortChildren)
  }

  rootNodes.forEach(sortChildren)

  return rootNodes
}

// ============================================
// Path Viewer Functions
// ============================================

/**
 * Path information with statistics
 */
export interface PathInfo {
  path: ('A' | 'B')[]
  pathString: string // e.g., "A → B → A"
  userCount: number // How many users took this path
  percentage: number // Percentage of total users
}

/**
 * Get all possible paths in a story and their statistics
 * @param storyId - Story ID
 * @returns Array of path information with statistics
 */
export async function getAllPaths(storyId: string): Promise<PathInfo[]> {
  const supabase = createClientClient()

  if (!supabase) {
    console.error('Supabase client is null. Check environment variables.')
    return []
  }

  // Get tree structure
  const tree = await getStoryTree(storyId)

  if (!tree || tree.length === 0) {
    return []
  }

  // Generate all possible paths from tree
  const allPaths: ('A' | 'B')[][] = []

  const generatePaths = (nodes: TreeNode[], currentPath: ('A' | 'B')[] = []) => {
    for (const node of nodes) {
      const newPath = node.choiceLabel
        ? [...currentPath, node.choiceLabel]
        : currentPath

      if (node.children.length > 0) {
        generatePaths(node.children, newPath)
      } else {
        // Leaf node - this is a complete path
        if (newPath.length > 0) {
          allPaths.push(newPath)
        }
      }
    }
  }

  generatePaths(tree)

  // Get user statistics for each path
  const { data: progressData, error } = await supabase
    .from('user_story_progress')
    .select('path')
    .eq('story_id', storyId)

  if (error) {
    // If table doesn't exist, return paths without statistics
    if (
      error.code === 'PGRST116' ||
      error.code === '42P01' ||
      error.message?.includes('relation') ||
      error.message?.includes('does not exist')
    ) {
      console.warn('User story progress table not found. Returning paths without statistics.')
      return allPaths.map((path) => ({
        path,
        pathString: path.join(' → '),
        userCount: 0,
        percentage: 0,
      }))
    }
    console.error('Error fetching path statistics:', error)
    return allPaths.map((path) => ({
      path,
      pathString: path.join(' → '),
      userCount: 0,
      percentage: 0,
    }))
  }

  // Count users for each path
  const pathCounts = new Map<string, number>()
  const totalUsers = progressData?.length || 0

  progressData?.forEach((progress: { path: string[] | null }) => {
    if (progress.path && Array.isArray(progress.path) && progress.path.length > 0) {
      const pathString = progress.path.join(' → ')
      pathCounts.set(pathString, (pathCounts.get(pathString) || 0) + 1)
    }
  })

  // Build path info array
  const pathInfos: PathInfo[] = allPaths.map((path) => {
    const pathString = path.join(' → ')
    const userCount = pathCounts.get(pathString) || 0
    const percentage = totalUsers > 0 ? (userCount / totalUsers) * 100 : 0

    return {
      path,
      pathString,
      userCount,
      percentage,
    }
  })

  // Sort by user count (most popular first)
  pathInfos.sort((a, b) => b.userCount - a.userCount)

  return pathInfos
}

// ============================================
// View Count Functions
// ============================================

/**
 * Increment view count for a story (atomic operation)
 * @param storyId - Story ID
 */
export async function incrementStoryViews(storyId: string): Promise<void> {
  const supabase = createClientClient()

  if (!supabase) {
    console.error('Supabase client is null. Check environment variables.')
    return
  }

  const { error } = await supabase.rpc('increment_story_views', {
    story_id: storyId,
  })

  if (error) {
    // If function doesn't exist, log warning but don't throw
    if (
      error.code === '42883' || // Function does not exist
      error.code === 'PGRST116' ||
      error.message?.includes('function') ||
      error.message?.includes('does not exist')
    ) {
      console.warn('View count increment function not found. Database setup may be needed.')
      return
    }
    console.error('Error incrementing view count:', error)
  }
}

