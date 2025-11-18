/**
 * useInViewport Hook
 * 
 * Detects when an element is visible in the viewport using Intersection Observer API
 * Useful for autoplay videos, lazy loading, animations, etc.
 */

import { useEffect, useRef, useState } from 'react'

export interface UseInViewportOptions {
  /** Threshold for intersection (0.0 to 1.0). 0.5 = 50% visible */
  threshold?: number | number[]
  /** Root margin for intersection calculation */
  rootMargin?: string
  /** Root element for intersection (default: viewport) */
  root?: Element | null
  /** Trigger only once (unobserve after first intersection) */
  triggerOnce?: boolean
}

export interface UseInViewportReturn {
  /** Ref to attach to the element */
  ref: React.RefObject<HTMLDivElement>
  /** Whether the element is currently in viewport */
  isInViewport: boolean
  /** Intersection ratio (0.0 to 1.0) */
  intersectionRatio: number
}

/**
 * Hook to detect when an element is visible in the viewport
 * 
 * @param options - Intersection Observer options
 * @returns Object with ref, isInViewport, and intersectionRatio
 * 
 * @example
 * ```tsx
 * const { ref, isInViewport } = useInViewport({ threshold: 0.5 })
 * 
 * return (
 *   <div ref={ref}>
 *     {isInViewport && <Video autoplay />}
 *   </div>
 * )
 * ```
 */
export function useInViewport(
  options: UseInViewportOptions = {}
): UseInViewportReturn {
  const {
    threshold = 0.5,
    rootMargin = '0px',
    root = null,
    triggerOnce = false,
  } = options

  const ref = useRef<HTMLDivElement>(null)
  const [isInViewport, setIsInViewport] = useState(false)
  const [intersectionRatio, setIntersectionRatio] = useState(0)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (!entry) return

        const isIntersecting = entry.isIntersecting
        const ratio = entry.intersectionRatio

        setIsInViewport(isIntersecting)
        setIntersectionRatio(ratio)

        // Unobserve if triggerOnce is true and element is in viewport
        if (triggerOnce && isIntersecting) {
          observer.unobserve(element)
        }
      },
      {
        threshold,
        rootMargin,
        root,
      }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [threshold, rootMargin, root, triggerOnce])

  return { ref, isInViewport, intersectionRatio }
}

