/**
 * usePreloadNext Hook
 * 
 * Preloads the next video in the feed for smoother playback
 * Uses Intersection Observer to detect when to preload
 */

import { useEffect, useRef, useCallback } from 'react'
import { logDebug, logWarn } from '@/lib/logger'

export interface PreloadTarget {
  /** Video URL to preload */
  url: string
  
  /** Story ID */
  storyId: string
  
  /** Index in the feed */
  index: number
}

export interface UsePreloadNextOptions {
  /** Array of stories with video media */
  stories: Array<{
    id: string
    media_url?: string | null
    media_type?: string | null
  }>
  
  /** Current visible story index */
  currentIndex?: number
  
  /** Number of videos ahead to preload (default: 1) */
  preloadAhead?: number
  
  /** Distance from viewport to start preloading (px, default: 500) */
  preloadDistance?: number
  
  /** Whether preloading is enabled (default: true) */
  enabled?: boolean
  
  /** Callback when video is preloaded */
  onPreload?: (target: PreloadTarget) => void
}

export interface UsePreloadNextReturn {
  /** Preload a specific video by index */
  preloadVideo: (index: number) => void
  
  /** Preload next video */
  preloadNext: () => void
  
  /** Clear all preloaded videos */
  clearPreloads: () => void
}

/**
 * Hook to preload next video in feed for smoother playback
 * 
 * @param options - Preload configuration
 * @returns Object with preload control functions
 * 
 * @example
 * ```tsx
 * const { preloadNext, preloadVideo } = usePreloadNext({
 *   stories: feedStories,
 *   currentIndex: visibleIndex,
 *   preloadAhead: 1,
 *   onPreload: (target) => {
 *     console.log('Preloading:', target.url)
 *   }
 * })
 * 
 * // Preload next video when current video is playing
 * useEffect(() => {
 *   if (isPlaying) {
 *     preloadNext()
 *   }
 * }, [isPlaying, preloadNext])
 * ```
 */
export function usePreloadNext(
  options: UsePreloadNextOptions
): UsePreloadNextReturn {
  const {
    stories,
    currentIndex = 0,
    preloadAhead = 1,
    preloadDistance = 500,
    enabled = true,
    onPreload,
  } = options

  const preloadedRef = useRef<Set<string>>(new Set())
  const preloadElementsRef = useRef<Map<string, HTMLVideoElement>>(new Map())

  // Get next video stories
  const getNextVideoStories = useCallback((): PreloadTarget[] => {
    if (!enabled || stories.length === 0) {
      return []
    }

    const targets: PreloadTarget[] = []
    let foundCount = 0

    // Start from current index + 1
    for (let i = currentIndex + 1; i < stories.length && foundCount < preloadAhead; i++) {
      const story = stories[i]
      
      if (
        story.media_type === 'video' &&
        story.media_url &&
        story.media_url.trim() !== '' &&
        !preloadedRef.current.has(story.id)
      ) {
        targets.push({
          url: story.media_url,
          storyId: story.id,
          index: i,
        })
        foundCount++
      }
    }

    return targets
  }, [stories, currentIndex, preloadAhead, enabled])

  // Cleanup preloaded video
  const cleanupPreload = useCallback((storyId: string): void => {
    const video = preloadElementsRef.current.get(storyId)
    if (video) {
      video.src = ''
      video.load()
      if (video.parentNode) {
        video.parentNode.removeChild(video)
      }
      preloadElementsRef.current.delete(storyId)
    }
    preloadedRef.current.delete(storyId)
  }, [])

  // Preload a video URL
  const preloadVideoUrl = useCallback((url: string, storyId: string): void => {
    if (!enabled || preloadedRef.current.has(storyId)) {
      return
    }

    try {
      // Create a hidden video element for preloading
      const video = document.createElement('video')
      video.preload = 'metadata' // Preload metadata only (lightweight)
      video.src = url
      video.muted = true
      video.playsInline = true
      video.style.display = 'none'
      video.style.position = 'absolute'
      video.style.width = '1px'
      video.style.height = '1px'
      video.style.opacity = '0'
      video.style.pointerEvents = 'none'

      // Add to DOM (hidden)
      document.body.appendChild(video)

      // Store reference
      preloadElementsRef.current.set(storyId, video)
      preloadedRef.current.add(storyId)

      // Handle load events
      video.addEventListener('loadedmetadata', () => {
        logDebug('Video preloaded (metadata)', {
          storyId,
          url: url.substring(0, 50) + '...',
        })
        onPreload?.({
          url,
          storyId,
          index: stories.findIndex((s) => s.id === storyId),
        })
      })

      video.addEventListener('error', (e) => {
        logWarn('Video preload failed', {
          storyId,
          url: url.substring(0, 50) + '...',
          error: e,
        })
        // Clean up on error
        cleanupPreload(storyId)
      })

      // Start loading
      video.load()

      logDebug('Video preload started', {
        storyId,
        url: url.substring(0, 50) + '...',
      })
    } catch (error) {
      logWarn('Failed to preload video', {
        storyId,
        url: url.substring(0, 50) + '...',
        error,
      })
    }
  }, [enabled, stories, onPreload, cleanupPreload])

  // Preload a specific video by index
  const preloadVideo = useCallback(
    (index: number): void => {
      if (!enabled || index < 0 || index >= stories.length) {
        return
      }

      const story = stories[index]
      if (
        story.media_type === 'video' &&
        story.media_url &&
        story.media_url.trim() !== '' &&
        !preloadedRef.current.has(story.id)
      ) {
        preloadVideoUrl(story.media_url, story.id)
      }
    },
    [enabled, stories, preloadVideoUrl]
  )

  // Preload next video(s)
  const preloadNext = useCallback((): void => {
    if (!enabled) {
      return
    }

    const targets = getNextVideoStories()
    targets.forEach((target) => {
      preloadVideoUrl(target.url, target.storyId)
    })
  }, [enabled, getNextVideoStories, preloadVideoUrl])

  // Clear all preloaded videos
  const clearPreloads = useCallback((): void => {
    preloadedRef.current.forEach((storyId) => {
      cleanupPreload(storyId)
    })
    preloadedRef.current.clear()
    preloadElementsRef.current.clear()
    logDebug('All video preloads cleared')
  }, [cleanupPreload])

  // Auto-preload next video when current index changes
  useEffect(() => {
    if (!enabled) {
      return
    }

    // Small delay to avoid preloading too aggressively
    const timeoutId = setTimeout(() => {
      preloadNext()
    }, 500)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [enabled, currentIndex, preloadNext])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearPreloads()
    }
  }, [clearPreloads])

  return {
    preloadVideo,
    preloadNext,
    clearPreloads,
  }
}

