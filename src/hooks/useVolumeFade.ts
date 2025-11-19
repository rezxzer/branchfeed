/**
 * useVolumeFade Hook
 * 
 * Provides smooth volume fade in/out transitions for video unmute/mute
 */

import { useRef, useCallback, useEffect, useMemo } from 'react'
import { logDebug } from '@/lib/logger'

export interface UseVolumeFadeOptions {
  /** Video element ref */
  videoRef: React.RefObject<HTMLVideoElement>
  
  /** Target volume (0.0 to 1.0) */
  targetVolume: number
  
  /** Whether fade is enabled (default: true) */
  enabled?: boolean
  
  /** Fade duration in milliseconds (default: 300) */
  duration?: number
  
  /** Fade steps (number of intermediate volume changes, default: 30) */
  steps?: number
  
  /** Easing function (default: 'easeInOut') */
  easing?: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut'
  
  /** Callback when fade starts */
  onFadeStart?: () => void
  
  /** Callback when fade completes */
  onFadeComplete?: () => void
}

export interface UseVolumeFadeReturn {
  /** Fade volume to target value */
  fadeTo: (targetVolume: number) => void
  
  /** Fade in (unmute) */
  fadeIn: () => void
  
  /** Fade out (mute) */
  fadeOut: () => void
  
  /** Whether fade is currently in progress */
  isFading: boolean
  
  /** Cancel current fade */
  cancelFade: () => void
}

/**
 * Hook to provide smooth volume fade transitions
 * 
 * @param options - Fade configuration
 * @returns Object with fade control functions
 * 
 * @example
 * ```tsx
 * const videoRef = useRef<HTMLVideoElement>(null)
 * const { fadeIn, fadeOut, isFading } = useVolumeFade({
 *   videoRef,
 *   targetVolume: 1.0,
 *   duration: 300,
 * })
 * 
 * // Fade in when unmuting
 * const handleUnmute = () => {
 *   fadeIn()
 * }
 * 
 * // Fade out when muting
 * const handleMute = () => {
 *   fadeOut()
 * }
 * ```
 */
export function useVolumeFade(
  options: UseVolumeFadeOptions
): UseVolumeFadeReturn {
  const {
    videoRef,
    targetVolume,
    enabled = true,
    duration = 300,
    steps = 30,
    easing = 'easeInOut',
    onFadeStart,
    onFadeComplete,
  } = options

  const fadeAnimationRef = useRef<number | null>(null)
  const isFadingRef = useRef<boolean>(false)
  const startVolumeRef = useRef<number>(0)
  const targetVolumeRef = useRef<number>(targetVolume)
  const startTimeRef = useRef<number>(0)

  // Easing functions (constant, no need to memoize)
  const easingFunctions = useMemo(() => ({
    linear: (t: number) => t,
    easeIn: (t: number) => t * t,
    easeOut: (t: number) => t * (2 - t),
    easeInOut: (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  }), [])

  // Cancel current fade
  const cancelFade = useCallback(() => {
    if (fadeAnimationRef.current !== null) {
      cancelAnimationFrame(fadeAnimationRef.current)
      fadeAnimationRef.current = null
    }
    isFadingRef.current = false
  }, [])

  // Fade volume to target value
  const fadeTo = useCallback(
    (target: number) => {
      if (!enabled || !videoRef.current) {
        return
      }

      // Cancel any existing fade
      cancelFade()

      const video = videoRef.current
      const startVolume = video.volume
      const targetVol = Math.max(0, Math.min(1, target)) // Clamp to [0, 1]

      // If already at target, no fade needed
      if (Math.abs(startVolume - targetVol) < 0.01) {
        video.volume = targetVol
        return
      }

      startVolumeRef.current = startVolume
      targetVolumeRef.current = targetVol
      startTimeRef.current = Date.now()
      isFadingRef.current = true

      onFadeStart?.()

      logDebug('Volume fade started', {
        startVolume,
        targetVolume: targetVol,
        duration,
      })

      // Animation frame function
      const animate = () => {
        const video = videoRef.current
        if (!video) {
          cancelFade()
          return
        }

        const elapsed = Date.now() - startTimeRef.current
        const progress = Math.min(elapsed / duration, 1) // Clamp to [0, 1]

        // Apply easing
        const easedProgress = easingFunctions[easing](progress)

        // Calculate current volume
        const volumeDelta = targetVolumeRef.current - startVolumeRef.current
        const currentVolume = startVolumeRef.current + volumeDelta * easedProgress

        // Update video volume
        video.volume = Math.max(0, Math.min(1, currentVolume))

        // Continue animation if not complete
        if (progress < 1) {
          fadeAnimationRef.current = requestAnimationFrame(animate)
        } else {
          // Fade complete
          video.volume = targetVolumeRef.current
          isFadingRef.current = false
          fadeAnimationRef.current = null
          onFadeComplete?.()

          logDebug('Volume fade completed', {
            finalVolume: targetVolumeRef.current,
            duration: elapsed,
          })
        }
      }

      // Start animation
      fadeAnimationRef.current = requestAnimationFrame(animate)
    },
    [enabled, videoRef, duration, easing, easingFunctions, onFadeStart, onFadeComplete, cancelFade]
  )

  // Fade in (unmute) - fade from 0 to target volume
  const fadeIn = useCallback(() => {
    if (!enabled || !videoRef.current) {
      return
    }

    const targetVol = targetVolume > 0 ? targetVolume : 1.0
    fadeTo(targetVol)
  }, [enabled, videoRef, targetVolume, fadeTo])

  // Fade out (mute) - fade from current volume to 0
  const fadeOut = useCallback(() => {
    if (!enabled || !videoRef.current) {
      return
    }

    fadeTo(0)
  }, [enabled, videoRef, fadeTo])

  // Update target volume when prop changes
  useEffect(() => {
    if (!isFadingRef.current && videoRef.current) {
      // Only update if not currently fading
      const currentVolume = videoRef.current.volume
      if (Math.abs(currentVolume - targetVolume) > 0.01) {
        // Small threshold to avoid unnecessary updates
        videoRef.current.volume = targetVolume
      }
    }
  }, [videoRef, targetVolume])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelFade()
    }
  }, [cancelFade])

  return {
    fadeTo,
    fadeIn,
    fadeOut,
    isFading: isFadingRef.current,
    cancelFade,
  }
}

