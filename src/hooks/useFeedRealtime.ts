'use client'

import { useEffect, useRef, useCallback } from 'react'
import { createClientClient } from '@/lib/supabase/client'
import { logDebug, logWarn, logError } from '@/lib/logger'
import type { Story } from '@/types'

export interface UseFeedRealtimeOptions {
  /** Whether real-time updates are enabled (default: true) */
  enabled?: boolean
  
  /** Callback when a new story is inserted */
  onStoryInserted?: (story: Story) => void
  
  /** Callback when a story is updated */
  onStoryUpdated?: (story: Story) => void
  
  /** Callback when a story is deleted */
  onStoryDeleted?: (storyId: string) => void
  
  /** Filter: only listen to stories from specific author (optional) */
  authorId?: string
  
  /** Filter: only listen to stories from specific authors (for following feed) */
  authorIds?: string[]
  
  /** Filter: only listen to root stories (default: true) */
  rootStoriesOnly?: boolean
}

export interface UseFeedRealtimeReturn {
  /** Whether real-time subscription is active */
  isSubscribed: boolean
  
  /** Manually disconnect the subscription */
  disconnect: () => void
}

/**
 * Hook to subscribe to real-time updates for feed stories
 * 
 * @param options - Real-time subscription configuration
 * @returns Object with subscription status and disconnect function
 * 
 * @example
 * ```tsx
 * const { isSubscribed } = useFeedRealtime({
 *   enabled: true,
 *   onStoryInserted: (story) => {
 *     // Add new story to feed
 *     setStories((prev) => [story, ...prev])
 *   },
 *   onStoryUpdated: (story) => {
 *     // Update story in feed
 *     setStories((prev) => 
 *       prev.map((s) => s.id === story.id ? story : s)
 *     )
 *   },
 *   onStoryDeleted: (storyId) => {
 *     // Remove story from feed
 *     setStories((prev) => prev.filter((s) => s.id !== storyId))
 *   },
 * })
 * ```
 */
export function useFeedRealtime(
  options: UseFeedRealtimeOptions = {}
): UseFeedRealtimeReturn {
  const {
    enabled = true,
    onStoryInserted,
    onStoryUpdated,
    onStoryDeleted,
    authorId,
    authorIds,
    rootStoriesOnly = true,
  } = options

  const channelRef = useRef<ReturnType<typeof createClientClient>['channel'] | null>(null)
  const isSubscribedRef = useRef<boolean>(false)

  const disconnect = useCallback(() => {
    if (channelRef.current) {
      channelRef.current.unsubscribe()
      channelRef.current = null
      isSubscribedRef.current = false
      logDebug('Feed real-time subscription disconnected')
    }
  }, [])

  useEffect(() => {
    if (!enabled) {
      disconnect()
      return
    }

    const supabase = createClientClient()
    if (!supabase) {
      logWarn('Supabase client not available for real-time subscription')
      return
    }

    // Create channel for stories table
    const channelName = `feed:stories${authorId ? `:${authorId}` : ''}`
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'stories',
          filter: rootStoriesOnly ? 'is_root=eq.true' : undefined,
        },
        async (payload: { new: { id: string; [key: string]: any }; old: { id: string; [key: string]: any } }) => {
          logDebug('New story inserted (real-time)', { storyId: payload.new.id })
          
          // Fetch full story data (with author, tags, etc.)
          const { data: story, error } = await supabase
            .from('stories')
            .select(`
              *,
              profiles!stories_author_id_fkey (
                id,
                username,
                avatar_url
              )
            `)
            .eq('id', payload.new.id)
            .single()

          if (error) {
            logError('Error fetching new story for real-time update', error)
            return
          }

                 // Filter by author if specified
                 const matchesAuthorFilter = 
                   (!authorId && !authorIds) ||
                   (authorId && story.author_id === authorId) ||
                   (Array.isArray(authorIds) && authorIds.length > 0 && authorIds.includes(story.author_id))
                 
                 if (story && matchesAuthorFilter) {
                   // Transform to Story type
                   const storyData = {
                     ...story,
                     author: story.profiles,
                     branches_count: 0,
                     isBookmarked: false,
                     userHasProgress: false,
                     tags: [],
                   } as Story

                   onStoryInserted?.(storyData)
                 }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'stories',
          filter: rootStoriesOnly ? 'is_root=eq.true' : undefined,
        },
        async (payload: { new: { id: string; [key: string]: any }; old: { id: string; [key: string]: any } }) => {
          logDebug('Story updated (real-time)', { storyId: payload.new.id })
          
          // Fetch updated story data
          const { data: story, error } = await supabase
            .from('stories')
            .select(`
              *,
              profiles!stories_author_id_fkey (
                id,
                username,
                avatar_url
              )
            `)
            .eq('id', payload.new.id)
            .single()

          if (error) {
            logError('Error fetching updated story for real-time update', error)
            return
          }

                 // Filter by author if specified
                 const matchesAuthorFilter = 
                   (!authorId && !authorIds) ||
                   (authorId && story.author_id === authorId) ||
                   (Array.isArray(authorIds) && authorIds.length > 0 && authorIds.includes(story.author_id))
                 
                 if (story && matchesAuthorFilter) {
                   const storyData = {
                     ...story,
                     author: story.profiles,
                     branches_count: 0,
                     isBookmarked: false,
                     userHasProgress: false,
                     tags: [],
                   } as Story

                   onStoryUpdated?.(storyData)
                 }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'stories',
        },
        (payload: { new: { id: string; [key: string]: any } | null; old: { id: string; [key: string]: any } }) => {
          logDebug('Story deleted (real-time)', { storyId: payload.old.id })
          onStoryDeleted?.(payload.old.id)
        }
      )
      .subscribe((status: 'SUBSCRIBED' | 'TIMED_OUT' | 'CLOSED' | 'CHANNEL_ERROR') => {
        if (status === 'SUBSCRIBED') {
          isSubscribedRef.current = true
          logDebug('Feed real-time subscription active', { channelName })
        } else if (status === 'CHANNEL_ERROR') {
          logWarn('Feed real-time subscription error', { channelName, status })
          isSubscribedRef.current = false
        } else if (status === 'TIMED_OUT') {
          logWarn('Feed real-time subscription timed out', { channelName })
          isSubscribedRef.current = false
        } else if (status === 'CLOSED') {
          isSubscribedRef.current = false
          logDebug('Feed real-time subscription closed', { channelName })
        }
      })

    channelRef.current = channel

    // Cleanup on unmount
    return () => {
      disconnect()
    }
  }, [enabled, authorId, authorIds, rootStoriesOnly, onStoryInserted, onStoryUpdated, onStoryDeleted, disconnect])

  return {
    isSubscribed: isSubscribedRef.current,
    disconnect,
  }
}

