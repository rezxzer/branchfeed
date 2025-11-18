/**
 * Tags Library
 * 
 * This module provides functions for working with tags.
 */

import { createClientClient } from './supabase/client'
import type { Tag } from '@/types'

/**
 * Get all tags
 * @param search - Optional search query
 * @param limit - Maximum number of tags to return
 * @returns Array of tags
 */
export async function getTags(search?: string, limit: number = 50): Promise<Tag[]> {
  const supabase = createClientClient()

  if (!supabase) {
    console.error('Supabase client is null. Check environment variables.')
    return []
  }

  let query = supabase
    .from('tags')
    .select('*')
    .order('name', { ascending: true })
    .limit(limit)

  if (search) {
    query = query.ilike('name', `%${search}%`)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching tags:', error)
    return []
  }

  return (data || []) as Tag[]
}

/**
 * Get tags for a story
 * @param storyId - Story ID
 * @returns Array of tags
 */
export async function getStoryTags(storyId: string): Promise<Tag[]> {
  const supabase = createClientClient()

  if (!supabase) {
    console.error('Supabase client is null. Check environment variables.')
    return []
  }

  const { data, error } = await supabase
    .from('story_tags')
    .select(`
      tag:tags(
        id,
        name,
        slug,
        description,
        color,
        created_at,
        updated_at
      )
    `)
    .eq('story_id', storyId)

  if (error) {
    console.error('Error fetching story tags:', error)
    return []
  }

  // Extract tags from the nested structure
  return (data || []).map((item: any) => item.tag).filter(Boolean) as Tag[]
}

/**
 * Create a new tag (admin only)
 * @param name - Tag name
 * @param description - Optional tag description
 * @param color - Optional tag color (hex code)
 * @returns Created tag
 */
export async function createTag(
  name: string,
  description?: string,
  color?: string
): Promise<Tag | null> {
  const supabase = createClientClient()

  if (!supabase) {
    console.error('Supabase client is null. Check environment variables.')
    return null
  }

  const { data, error } = await supabase
    .from('tags')
    .insert({
      name: name.trim(),
      description: description?.trim() || null,
      color: color || null,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating tag:', error)
    return null
  }

  return data as Tag
}

