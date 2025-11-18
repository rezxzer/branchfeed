/**
 * useScrollSpeed Hook
 * 
 * Detects scroll speed to pause videos on fast scrolling
 * Useful for preventing unwanted autoplay during fast scrolling
 */

import { useEffect, useRef, useState } from 'react'

export interface UseScrollSpeedOptions {
  /** Threshold for fast scroll (pixels per second) */
  fastScrollThreshold?: number
  /** Debounce time in milliseconds */
  debounceMs?: number
}

export interface UseScrollSpeedReturn {
  /** Whether user is scrolling fast */
  isFastScrolling: boolean
  /** Current scroll speed (pixels per second) */
  scrollSpeed: number
}

/**
 * Hook to detect scroll speed
 * 
 * @param options - Scroll speed detection options
 * @returns Object with isFastScrolling and scrollSpeed
 * 
 * @example
 * ```tsx
 * const { isFastScrolling } = useScrollSpeed({ fastScrollThreshold: 1000 })
 * 
 * // Pause videos if scrolling fast
 * <Video autoplay={!isFastScrolling && isInViewport} />
 * ```
 */
export function useScrollSpeed(
  options: UseScrollSpeedOptions = {}
): UseScrollSpeedReturn {
  const {
    fastScrollThreshold = 1000, // pixels per second
    debounceMs = 100,
  } = options

  const [isFastScrolling, setIsFastScrolling] = useState(false)
  const [scrollSpeed, setScrollSpeed] = useState(0)
  const lastScrollY = useRef(0)
  const lastScrollTime = useRef(Date.now())
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const currentTime = Date.now()
      const timeDelta = (currentTime - lastScrollTime.current) / 1000 // seconds
      const scrollDelta = Math.abs(currentScrollY - lastScrollY.current)
      
      if (timeDelta > 0) {
        const speed = scrollDelta / timeDelta // pixels per second
        setScrollSpeed(speed)
        setIsFastScrolling(speed > fastScrollThreshold)
      }

      lastScrollY.current = currentScrollY
      lastScrollTime.current = currentTime

      // Debounce: reset fast scrolling after scroll stops
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = setTimeout(() => {
        setIsFastScrolling(false)
        setScrollSpeed(0)
      }, debounceMs)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [fastScrollThreshold, debounceMs])

  return { isFastScrolling, scrollSpeed }
}

