/**
 * useVideoAnalytics Hook
 * 
 * Tracks video view duration and playback events
 * Sends analytics data to the server
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { logDebug, logWarn, logError } from '@/lib/logger'

export interface VideoAnalyticsEvent {
  /** Event type */
  type: 'play' | 'pause' | 'ended' | 'seek' | 'buffering' | 'error'
  
  /** Timestamp of the event */
  timestamp: number
  
  /** Current playback time in seconds */
  currentTime: number
  
  /** Video duration in seconds */
  duration: number
  
  /** Additional event data */
  data?: Record<string, unknown>
}

export interface VideoViewSession {
  /** Video URL or ID */
  videoId: string
  
  /** Session start timestamp */
  startTime: number
  
  /** Session end timestamp */
  endTime?: number
  
  /** Total view duration in seconds */
  totalDuration: number
  
  /** Events during this session */
  events: VideoAnalyticsEvent[]
  
  /** Whether video was completed */
  completed: boolean
  
  /** Percentage watched (0-100) */
  watchPercentage: number
}

export interface UseVideoAnalyticsOptions {
  /** Video ID or URL */
  videoId: string
  
  /** Whether analytics is enabled (default: true) */
  enabled?: boolean
  
  /** Minimum duration to track (seconds, default: 1) */
  minDuration?: number
  
  /** Send analytics to server (default: true) */
  sendToServer?: boolean
  
  /** Callback when session ends */
  onSessionEnd?: (session: VideoViewSession) => void
}

export interface UseVideoAnalyticsReturn {
  /** Current session */
  session: VideoViewSession | null
  
  /** Total view duration in seconds */
  totalDuration: number
  
  /** Whether video is currently being watched */
  isWatching: boolean
  
  /** Start tracking */
  startTracking: () => void
  
  /** Stop tracking */
  stopTracking: () => void
  
  /** Record event */
  recordEvent: (type: VideoAnalyticsEvent['type'], data?: Record<string, unknown>) => void
  
  /** Get watch percentage */
  getWatchPercentage: () => number
  
  /** Set video element ref for analytics */
  setVideoRef: (video: HTMLVideoElement | null) => void
}

/**
 * Hook to track video view duration and playback events
 * 
 * @param options - Analytics configuration
 * @returns Object with analytics state and control functions
 * 
 * @example
 * ```tsx
 * const videoRef = useRef<HTMLVideoElement>(null)
 * const { startTracking, stopTracking, recordEvent } = useVideoAnalytics({
 *   videoId: story.id,
 *   enabled: true,
 *   onSessionEnd: (session) => {
 *     console.log('Session ended:', session)
 *   }
 * })
 * 
 * useEffect(() => {
 *   const video = videoRef.current
 *   if (!video) return
 *   
 *   video.addEventListener('play', () => {
 *     startTracking()
 *     recordEvent('play')
 *   })
 *   
 *   video.addEventListener('pause', () => {
 *     recordEvent('pause')
 *   })
 *   
 *   video.addEventListener('ended', () => {
 *     recordEvent('ended')
 *     stopTracking()
 *   })
 * }, [startTracking, stopTracking, recordEvent])
 * ```
 */
export function useVideoAnalytics(
  options: UseVideoAnalyticsOptions
): UseVideoAnalyticsReturn {
  const {
    videoId,
    enabled = true,
    minDuration = 1,
    sendToServer = true,
    onSessionEnd,
  } = options

  const [session, setSession] = useState<VideoViewSession | null>(null)
  const [isWatching, setIsWatching] = useState(false)
  const [totalDuration, setTotalDuration] = useState(0)

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number | null>(null)
  const lastUpdateRef = useRef<number>(Date.now())

  // Update duration periodically
  const updateDuration = useCallback(() => {
    if (!isWatching || !videoRef.current || !startTimeRef.current) {
      return
    }

    const now = Date.now()
    const elapsed = (now - startTimeRef.current) / 1000 // seconds
    const currentTime = videoRef.current.currentTime || 0
    const duration = videoRef.current.duration || 0

    setTotalDuration(elapsed)
    lastUpdateRef.current = now

    // Update session
    setSession((prev) => {
      if (!prev) return null

      const watchPercentage = duration > 0 ? (currentTime / duration) * 100 : 0

      return {
        ...prev,
        totalDuration: elapsed,
        watchPercentage: Math.min(100, Math.max(0, watchPercentage)),
      }
    })
  }, [isWatching])

  // Start tracking
  const startTracking = useCallback(() => {
    if (!enabled || isWatching) {
      return
    }

    const video = videoRef.current
    if (!video) {
      logWarn('Cannot start tracking: video element not found')
      return
    }

    const startTime = Date.now()
    startTimeRef.current = startTime
    setIsWatching(true)

    const newSession: VideoViewSession = {
      videoId,
      startTime,
      totalDuration: 0,
      events: [],
      completed: false,
      watchPercentage: 0,
    }

    setSession(newSession)
    logDebug('Video analytics tracking started', { videoId, startTime })

    // Update duration every second
    intervalRef.current = setInterval(updateDuration, 1000)
  }, [enabled, isWatching, videoId, updateDuration])

  // Stop tracking
  const stopTracking = useCallback(() => {
    if (!isWatching) {
      return
    }

    const video = videoRef.current
    const now = Date.now()

    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    setIsWatching(false)

    setSession((prev) => {
      if (!prev || !startTimeRef.current) {
        return null
      }

      const finalDuration = (now - startTimeRef.current) / 1000
      const currentTime = video?.currentTime || 0
      const duration = video?.duration || 0
      const watchPercentage = duration > 0 ? (currentTime / duration) * 100 : 0
      const completed = video?.ended || false

      const finalSession: VideoViewSession = {
        ...prev,
        endTime: now,
        totalDuration: finalDuration,
        watchPercentage: Math.min(100, Math.max(0, watchPercentage)),
        completed,
      }

      // Only send if duration meets minimum threshold
      if (finalDuration >= minDuration) {
        if (sendToServer) {
          sendAnalytics(finalSession).catch((error) => {
            logError('Failed to send video analytics', error)
          })
        }
        onSessionEnd?.(finalSession)
      } else {
        logDebug('Video analytics session too short, not sending', {
          duration: finalDuration,
          minDuration,
        })
      }

      return null
    })

    startTimeRef.current = null
    logDebug('Video analytics tracking stopped', { videoId, totalDuration })
  }, [isWatching, videoId, totalDuration, minDuration, sendToServer, onSessionEnd])

  // Record event
  const recordEvent = useCallback(
    (type: VideoAnalyticsEvent['type'], data?: Record<string, unknown>) => {
      if (!enabled || !isWatching) {
        return
      }

      const video = videoRef.current
      if (!video) {
        return
      }

      const event: VideoAnalyticsEvent = {
        type,
        timestamp: Date.now(),
        currentTime: video.currentTime || 0,
        duration: video.duration || 0,
        data,
      }

      setSession((prev) => {
        if (!prev) return null

        return {
          ...prev,
          events: [...prev.events, event],
        }
      })

      logDebug('Video analytics event recorded', { videoId, type, event })
    },
    [enabled, isWatching, videoId]
  )

  // Get watch percentage
  const getWatchPercentage = useCallback((): number => {
    if (!session) return 0
    return session.watchPercentage
  }, [session])

  // Set video ref
  const setVideoRef = useCallback((video: HTMLVideoElement | null) => {
    videoRef.current = video
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      if (isWatching) {
        stopTracking()
      }
    }
  }, [isWatching, stopTracking])

  return {
    session,
    totalDuration,
    isWatching,
    startTracking,
    stopTracking,
    recordEvent,
    getWatchPercentage,
    // Expose setVideoRef for external use
    setVideoRef,
  } as UseVideoAnalyticsReturn & { setVideoRef: (video: HTMLVideoElement | null) => void }
}

/**
 * Send analytics data to server
 */
async function sendAnalytics(session: VideoViewSession): Promise<void> {
  try {
    // Extract story ID from videoId (could be story ID or URL)
    const storyId = session.videoId.includes('http') 
      ? extractStoryIdFromUrl(session.videoId)
      : session.videoId

    if (!storyId) {
      logWarn('Cannot send analytics: no story ID found', { videoId: session.videoId })
      return
    }

    const response = await fetch(`/api/stories/${storyId}/analytics`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        videoId: session.videoId,
        startTime: session.startTime,
        endTime: session.endTime,
        totalDuration: session.totalDuration,
        watchPercentage: session.watchPercentage,
        completed: session.completed,
        events: session.events,
      }),
    })

    if (!response.ok) {
      throw new Error(`Analytics API error: ${response.status}`)
    }

    logDebug('Video analytics sent successfully', { videoId: session.videoId, storyId })
  } catch (error) {
    logError('Failed to send video analytics', error)
    throw error
  }
}

/**
 * Extract story ID from URL (if videoId is a URL)
 */
function extractStoryIdFromUrl(url: string): string | null {
  // Try to extract story ID from Supabase Storage URL
  // Example: https://xxx.supabase.co/storage/v1/object/public/stories/root/xxx.mp4
  const match = url.match(/stories\/([^\/]+)\//)
  if (match && match[1]) {
    return match[1]
  }
  return null
}

