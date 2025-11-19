/**
 * usePlaylistMode Hook
 * 
 * Provides auto-advance functionality for video playlists
 * Automatically advances to next video when current video ends
 */

import { useRef, useCallback, useEffect } from 'react'
import { logDebug, logWarn } from '@/lib/logger'

export interface UsePlaylistModeOptions {
  /** Whether playlist mode is enabled (default: false) */
  enabled?: boolean
  
  /** Delay before advancing to next video (ms, default: 500) */
  advanceDelay?: number
  
  /** Whether to only advance for videos (skip images, default: true) */
  videosOnly?: boolean
  
  /** Callback when advancing to next video */
  onAdvance?: (currentIndex: number, nextIndex: number) => void
  
  /** Callback when playlist ends (no more videos) */
  onPlaylistEnd?: () => void
}

export interface UsePlaylistModeReturn {
  /** Handle video end event */
  handleVideoEnd: (currentIndex: number) => void
  
  /** Enable playlist mode */
  enable: () => void
  
  /** Disable playlist mode */
  disable: () => void
  
  /** Whether playlist mode is currently enabled */
  isEnabled: boolean
}

/**
 * Hook to provide auto-advance functionality for video playlists
 * 
 * @param options - Playlist mode configuration
 * @returns Object with playlist control functions
 * 
 * @example
 * ```tsx
 * const { handleVideoEnd, isEnabled } = usePlaylistMode({
 *   enabled: true,
 *   advanceDelay: 500,
 *   videosOnly: true,
 *   onAdvance: (currentIndex, nextIndex) => {
 *     navigateToNextVideo(nextIndex)
 *   },
 *   onPlaylistEnd: () => {
 *     console.log('Playlist ended')
 *   },
 * })
 * 
 * <video
 *   onEnded={() => handleVideoEnd(currentIndex)}
 * />
 * ```
 */
export function usePlaylistMode(
  options: UsePlaylistModeOptions = {}
): UsePlaylistModeReturn {
  const {
    enabled: initialEnabled = false,
    advanceDelay = 500,
    videosOnly = true,
    onAdvance,
    onPlaylistEnd,
  } = options

  const enabledRef = useRef<boolean>(initialEnabled)
  const advanceTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Enable playlist mode
  const enable = useCallback(() => {
    enabledRef.current = true
    logDebug('Playlist mode enabled')
  }, [])

  // Disable playlist mode
  const disable = useCallback(() => {
    enabledRef.current = false
    // Cancel any pending advance
    if (advanceTimeoutRef.current) {
      clearTimeout(advanceTimeoutRef.current)
      advanceTimeoutRef.current = null
    }
    logDebug('Playlist mode disabled')
  }, [])

  // Handle video end event
  const handleVideoEnd = useCallback(
    (currentIndex: number) => {
      if (!enabledRef.current) {
        return
      }

      logDebug('Video ended in playlist mode', { currentIndex })

      // Clear any existing timeout
      if (advanceTimeoutRef.current) {
        clearTimeout(advanceTimeoutRef.current)
        advanceTimeoutRef.current = null
      }

      // Schedule advance after delay
      advanceTimeoutRef.current = setTimeout(() => {
        // Find next video index
        // This will be handled by the parent component
        // We just notify that we should advance
        onAdvance?.(currentIndex, currentIndex + 1)
      }, advanceDelay)
    },
    [advanceDelay, onAdvance]
  )

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (advanceTimeoutRef.current) {
        clearTimeout(advanceTimeoutRef.current)
        advanceTimeoutRef.current = null
      }
    }
  }, [])

  return {
    handleVideoEnd,
    enable,
    disable,
    isEnabled: enabledRef.current,
  }
}

