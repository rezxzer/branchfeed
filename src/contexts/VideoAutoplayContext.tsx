/**
 * VideoAutoplayContext
 * 
 * Manages concurrent video playback limits for feed autoplay
 * Ensures only 2-3 videos play simultaneously for performance
 */

'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

interface VideoAutoplayContextType {
  /** Register a video and check if it can autoplay */
  requestAutoplay: (videoId: string) => boolean
  /** Release a video slot when video stops */
  releaseAutoplay: (videoId: string) => void
  /** Check if a video can autoplay */
  canAutoplay: (videoId: string) => boolean
  /** Get current playing videos count */
  getPlayingCount: () => number
}

const VideoAutoplayContext = createContext<VideoAutoplayContextType | undefined>(undefined)

const MAX_CONCURRENT_VIDEOS = 3 // Maximum videos playing simultaneously

export function VideoAutoplayProvider({ children }: { children: ReactNode }) {
  const [playingVideos, setPlayingVideos] = useState<Set<string>>(new Set())

  const requestAutoplay = useCallback((videoId: string): boolean => {
    let granted = false
    
    setPlayingVideos((prev) => {
      // If already playing, allow it
      if (prev.has(videoId)) {
        granted = true
        return prev
      }

      // If at max capacity, deny
      if (prev.size >= MAX_CONCURRENT_VIDEOS) {
        granted = false
        return prev
      }

      // Allow and add to set
      granted = true
      const next = new Set(prev)
      next.add(videoId)
      return next
    })

    return granted
  }, [])

  const releaseAutoplay = useCallback((videoId: string) => {
    setPlayingVideos((prev) => {
      // Only update if videoId is actually in the set (avoid unnecessary re-renders)
      if (!prev.has(videoId)) {
        return prev
      }
      const next = new Set(prev)
      next.delete(videoId)
      return next
    })
  }, [])

  const canAutoplay = useCallback((videoId: string): boolean => {
    return playingVideos.size < MAX_CONCURRENT_VIDEOS || playingVideos.has(videoId)
  }, [playingVideos])

  const getPlayingCount = useCallback((): number => {
    return playingVideos.size
  }, [playingVideos])

  return (
    <VideoAutoplayContext.Provider
      value={{
        requestAutoplay,
        releaseAutoplay,
        canAutoplay,
        getPlayingCount,
      }}
    >
      {children}
    </VideoAutoplayContext.Provider>
  )
}

export function useVideoAutoplay() {
  const context = useContext(VideoAutoplayContext)
  if (context === undefined) {
    throw new Error('useVideoAutoplay must be used within VideoAutoplayProvider')
  }
  return context
}

/**
 * Optional hook that returns null if provider doesn't exist
 * Use this when context might not be available
 */
export function useVideoAutoplayOptional() {
  const context = useContext(VideoAutoplayContext)
  return context ?? null
}

