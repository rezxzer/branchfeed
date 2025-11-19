/**
 * useVolumePersistence Hook
 * 
 * Persists user's video volume preference across sessions
 * Stores volume in localStorage and optionally in user profile
 */

import { useState, useEffect, useCallback, useRef } from 'react'

const VOLUME_STORAGE_KEY = 'branchfeed-video-volume'
const DEFAULT_VOLUME = 1.0 // 100% volume

export interface UseVolumePersistenceOptions {
  /** Whether to persist volume to localStorage (default: true) */
  persistToStorage?: boolean
  
  /** Whether to persist volume to user profile (default: false) */
  persistToProfile?: boolean
  
  /** Default volume if no saved preference (default: 1.0) */
  defaultVolume?: number
  
  /** Minimum volume value (default: 0) */
  minVolume?: number
  
  /** Maximum volume value (default: 1.0) */
  maxVolume?: number
}

export interface UseVolumePersistenceReturn {
  /** Current volume (0.0 to 1.0) */
  volume: number
  
  /** Set volume and persist it */
  setVolume: (volume: number) => void
  
  /** Whether volume is muted (volume === 0) */
  isMuted: boolean
  
  /** Toggle mute state */
  toggleMute: () => void
  
  /** Reset volume to default */
  resetVolume: () => void
}

/**
 * Hook to persist and restore video volume preference
 * 
 * @param options - Volume persistence options
 * @returns Object with volume state and controls
 * 
 * @example
 * ```tsx
 * const { volume, setVolume, isMuted, toggleMute } = useVolumePersistence()
 * 
 * <video
 *   volume={volume}
 *   onVolumeChange={(e) => setVolume(e.target.volume)}
 * />
 * ```
 */
export function useVolumePersistence(
  options: UseVolumePersistenceOptions = {}
): UseVolumePersistenceReturn {
  const {
    persistToStorage = true,
    persistToProfile = false,
    defaultVolume = DEFAULT_VOLUME,
    minVolume = 0,
    maxVolume = 1.0,
  } = options

  // Load initial volume from localStorage
  const loadStoredVolume = useCallback((): number => {
    if (!persistToStorage || typeof window === 'undefined') {
      return defaultVolume
    }

    try {
      const stored = localStorage.getItem(VOLUME_STORAGE_KEY)
      if (stored) {
        const volume = parseFloat(stored)
        // Validate volume range
        if (!isNaN(volume) && volume >= minVolume && volume <= maxVolume) {
          return volume
        }
      }
    } catch (error) {
      console.warn('Failed to load volume from localStorage:', error)
    }

    return defaultVolume
  }, [persistToStorage, defaultVolume, minVolume, maxVolume])

  const [volume, setVolumeState] = useState<number>(loadStoredVolume)
  const isInitialMount = useRef(true)

  // Load volume on mount
  useEffect(() => {
    if (isInitialMount.current) {
      const storedVolume = loadStoredVolume()
      setVolumeState(storedVolume)
      isInitialMount.current = false
    }
  }, [loadStoredVolume])

  // Persist volume to localStorage when it changes
  useEffect(() => {
    if (!persistToStorage || typeof window === 'undefined' || isInitialMount.current) {
      return
    }

    try {
      localStorage.setItem(VOLUME_STORAGE_KEY, volume.toString())
    } catch (error) {
      console.warn('Failed to save volume to localStorage:', error)
    }
  }, [volume, persistToStorage])

  // Set volume with validation
  const setVolume = useCallback(
    (newVolume: number) => {
      // Clamp volume to valid range
      const clampedVolume = Math.max(minVolume, Math.min(maxVolume, newVolume))
      setVolumeState(clampedVolume)
    },
    [minVolume, maxVolume]
  )

  // Toggle mute (0 <-> previous volume)
  const previousVolumeRef = useRef<number>(defaultVolume)
  const toggleMute = useCallback(() => {
    if (volume > 0) {
      // Mute: save current volume and set to 0
      previousVolumeRef.current = volume
      setVolumeState(0)
    } else {
      // Unmute: restore previous volume
      setVolumeState(previousVolumeRef.current > 0 ? previousVolumeRef.current : defaultVolume)
    }
  }, [volume, defaultVolume])

  // Reset to default volume
  const resetVolume = useCallback(() => {
    setVolumeState(defaultVolume)
    previousVolumeRef.current = defaultVolume
  }, [defaultVolume])

  const isMuted = volume === 0

  return {
    volume,
    setVolume,
    isMuted,
    toggleMute,
    resetVolume,
  }
}

