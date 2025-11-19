/**
 * usePlaybackSpeed Hook
 * 
 * Manages video playback speed preference with persistence
 * Stores playback speed in localStorage
 */

import { useState, useEffect, useCallback, useRef } from 'react'

const PLAYBACK_SPEED_STORAGE_KEY = 'branchfeed-video-playback-speed'
const DEFAULT_PLAYBACK_SPEED = 1.0 // Normal speed

export const PLAYBACK_SPEED_OPTIONS = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0] as const
export type PlaybackSpeed = typeof PLAYBACK_SPEED_OPTIONS[number]

export interface UsePlaybackSpeedOptions {
  /** Whether to persist playback speed to localStorage (default: true) */
  persistToStorage?: boolean
  
  /** Default playback speed if no saved preference (default: 1.0) */
  defaultSpeed?: PlaybackSpeed
  
  /** Minimum playback speed (default: 0.25) */
  minSpeed?: number
  
  /** Maximum playback speed (default: 4.0) */
  maxSpeed?: number
}

export interface UsePlaybackSpeedReturn {
  /** Current playback speed (0.5 to 2.0) */
  playbackSpeed: PlaybackSpeed
  
  /** Set playback speed */
  setPlaybackSpeed: (speed: PlaybackSpeed) => void
  
  /** Increase playback speed to next option */
  increaseSpeed: () => void
  
  /** Decrease playback speed to previous option */
  decreaseSpeed: () => void
  
  /** Reset playback speed to default (1.0) */
  resetSpeed: () => void
  
  /** Get formatted speed label (e.g., "1.5x") */
  getSpeedLabel: (speed?: PlaybackSpeed) => string
}

/**
 * Hook to manage video playback speed with persistence
 * 
 * @param options - Playback speed options
 * @returns Object with playback speed state and controls
 * 
 * @example
 * ```tsx
 * const { playbackSpeed, setPlaybackSpeed, increaseSpeed } = usePlaybackSpeed()
 * 
 * <video
 *   playbackRate={playbackSpeed}
 *   onRateChange={(e) => setPlaybackSpeed(e.target.playbackRate)}
 * />
 * ```
 */
export function usePlaybackSpeed(
  options: UsePlaybackSpeedOptions = {}
): UsePlaybackSpeedReturn {
  const {
    persistToStorage = true,
    defaultSpeed = DEFAULT_PLAYBACK_SPEED,
    minSpeed = 0.25,
    maxSpeed = 4.0,
  } = options

  // Load initial playback speed from localStorage
  const loadStoredSpeed = useCallback((): PlaybackSpeed => {
    if (!persistToStorage || typeof window === 'undefined') {
      return defaultSpeed
    }

    try {
      const stored = localStorage.getItem(PLAYBACK_SPEED_STORAGE_KEY)
      if (stored) {
        const speed = parseFloat(stored)
        // Validate speed is in allowed options
        if (!isNaN(speed) && PLAYBACK_SPEED_OPTIONS.includes(speed as PlaybackSpeed)) {
          return speed as PlaybackSpeed
        }
      }
    } catch (error) {
      console.warn('Failed to load playback speed from localStorage:', error)
    }

    return defaultSpeed
  }, [persistToStorage, defaultSpeed])

  const [playbackSpeed, setPlaybackSpeedState] = useState<PlaybackSpeed>(loadStoredSpeed)
  const isInitialMount = useRef(true)

  // Load playback speed on mount
  useEffect(() => {
    if (isInitialMount.current) {
      const storedSpeed = loadStoredSpeed()
      setPlaybackSpeedState(storedSpeed)
      isInitialMount.current = false
    }
  }, [loadStoredSpeed])

  // Persist playback speed to localStorage when it changes
  useEffect(() => {
    if (!persistToStorage || typeof window === 'undefined' || isInitialMount.current) {
      return
    }

    try {
      localStorage.setItem(PLAYBACK_SPEED_STORAGE_KEY, playbackSpeed.toString())
    } catch (error) {
      console.warn('Failed to save playback speed to localStorage:', error)
    }
  }, [playbackSpeed, persistToStorage])

  // Set playback speed with validation
  const setPlaybackSpeed = useCallback((newSpeed: PlaybackSpeed) => {
    // Validate speed is in allowed options
    if (PLAYBACK_SPEED_OPTIONS.includes(newSpeed)) {
      setPlaybackSpeedState(newSpeed)
    } else {
      // Clamp to nearest valid option
      const clampedSpeed = PLAYBACK_SPEED_OPTIONS.reduce((prev, curr) => {
        return Math.abs(curr - newSpeed) < Math.abs(prev - newSpeed) ? curr : prev
      }, defaultSpeed)
      setPlaybackSpeedState(clampedSpeed)
    }
  }, [defaultSpeed])

  // Increase to next speed option
  const increaseSpeed = useCallback(() => {
    const currentIndex = PLAYBACK_SPEED_OPTIONS.indexOf(playbackSpeed)
    if (currentIndex < PLAYBACK_SPEED_OPTIONS.length - 1) {
      setPlaybackSpeedState(PLAYBACK_SPEED_OPTIONS[currentIndex + 1])
    }
  }, [playbackSpeed])

  // Decrease to previous speed option
  const decreaseSpeed = useCallback(() => {
    const currentIndex = PLAYBACK_SPEED_OPTIONS.indexOf(playbackSpeed)
    if (currentIndex > 0) {
      setPlaybackSpeedState(PLAYBACK_SPEED_OPTIONS[currentIndex - 1])
    }
  }, [playbackSpeed])

  // Reset to default speed
  const resetSpeed = useCallback(() => {
    setPlaybackSpeedState(defaultSpeed)
  }, [defaultSpeed])

  // Get formatted speed label
  const getSpeedLabel = useCallback((speed?: PlaybackSpeed): string => {
    const speedToFormat = speed ?? playbackSpeed
    return `${speedToFormat}x`
  }, [playbackSpeed])

  return {
    playbackSpeed,
    setPlaybackSpeed,
    increaseSpeed,
    decreaseSpeed,
    resetSpeed,
    getSpeedLabel,
  }
}

