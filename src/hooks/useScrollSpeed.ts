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
      
      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      
      if (timeDelta > 0 && timeDelta < 1) { // Only calculate if less than 1 second passed
        const speed = scrollDelta / timeDelta // pixels per second
        setScrollSpeed(speed)
        const isFast = speed > fastScrollThreshold
        setIsFastScrolling(isFast)
        
        // If not fast scrolling, reset immediately
        if (!isFast) {
          timeoutRef.current = setTimeout(() => {
            setIsFastScrolling(false)
            setScrollSpeed(0)
          }, debounceMs)
        } else {
          // If fast scrolling, reset after scroll stops
          timeoutRef.current = setTimeout(() => {
            setIsFastScrolling(false)
            setScrollSpeed(0)
          }, debounceMs * 2) // Longer timeout for fast scrolling
        }
      } else {
        // Reset if too much time passed (user stopped scrolling)
        setIsFastScrolling(false)
        setScrollSpeed(0)
      }

      lastScrollY.current = currentScrollY
      lastScrollTime.current = currentTime
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

