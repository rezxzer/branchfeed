/**
 * Stories Library - Server-Side Functions
 * 
 * This module provides server-side functions for stories.
 * These functions use 'next/headers' and can only be used in Server Components.
 */

import { createServerSupabaseClient } from './supabase/server'
import type { Story } from '@/types'

// ============================================
// Story Fetching Functions (Server-Side)
// ============================================

/**
 * Get story by ID (server-side)
 * Use this in Server Components and Server Actions
 * @param storyId - Story ID
 * @returns Story with author profile
 */
export async function getStoryById(storyId: string): Promise<Story | null> {
  const supabase = await createServerSupabaseClient()

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
    return null
  }

  return data as Story
}

/**
 * Get root stories for feed (server-side)
 * Use this in Server Components and Server Actions
 * @param limit - Number of stories to fetch (default: 20)
 * @param offset - Offset for pagination (default: 0)
 * @returns Array of root stories
 */
export async function getRootStories(
  limit: number = 20,
  offset: number = 0
): Promise<Story[]> {
  const supabase = await createServerSupabaseClient()

  if (!supabase) {
    console.error('Supabase client is null. Check environment variables.')
    return []
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
    .eq('is_root', true)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('Error fetching root stories:', error)
    return []
  }

  return (data || []) as Story[]
}

