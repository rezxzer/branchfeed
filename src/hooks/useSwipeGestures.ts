/**
 * useSwipeGestures Hook
 * 
 * Detects swipe gestures (up, down, left, right) for navigation
 * Optimized for mobile touch events
 */

import { useRef, useCallback, useEffect } from 'react'
import { logDebug } from '@/lib/logger'

export type SwipeDirection = 'up' | 'down' | 'left' | 'right'

export interface SwipeEvent {
  /** Swipe direction */
  direction: SwipeDirection
  
  /** Distance swiped in pixels */
  distance: number
  
  /** Swipe velocity (pixels per second) */
  velocity: number
  
  /** Duration of swipe in milliseconds */
  duration: number
}

export interface UseSwipeGesturesOptions {
  /** Minimum distance to trigger swipe (px, default: 50) */
  minDistance?: number
  
  /** Minimum velocity to trigger swipe (px/s, default: 300) */
  minVelocity?: number
  
  /** Maximum swipe duration (ms, default: 500) */
  maxDuration?: number
  
  /** Whether swipe is enabled (default: true) */
  enabled?: boolean
  
  /** Callback when swipe up is detected */
  onSwipeUp?: (event: SwipeEvent) => void
  
  /** Callback when swipe down is detected */
  onSwipeDown?: (event: SwipeEvent) => void
  
  /** Callback when swipe left is detected */
  onSwipeLeft?: (event: SwipeEvent) => void
  
  /** Callback when swipe right is detected */
  onSwipeRight?: (event: SwipeEvent) => void
  
  /** Callback for any swipe */
  onSwipe?: (event: SwipeEvent) => void
  
  /** Prevent default touch behavior (default: true) */
  preventDefault?: boolean
}

export interface UseSwipeGesturesReturn {
  /** Touch start handler */
  onTouchStart: (e: React.TouchEvent) => void
  
  /** Touch move handler */
  onTouchMove: (e: React.TouchEvent) => void
  
  /** Touch end handler */
  onTouchEnd: (e: React.TouchEvent) => void
  
  /** Mouse down handler (for desktop testing) */
  onMouseDown: (e: React.MouseEvent) => void
  
  /** Mouse move handler (for desktop testing) */
  onMouseMove: (e: React.MouseEvent) => void
  
  /** Mouse up handler (for desktop testing) */
  onMouseUp: (e: React.MouseEvent) => void
  
  /** Reset swipe state */
  reset: () => void
}

/**
 * Hook to detect swipe gestures for navigation
 * 
 * @param options - Swipe configuration
 * @returns Object with touch/mouse event handlers
 * 
 * @example
 * ```tsx
 * const { onTouchStart, onTouchMove, onTouchEnd } = useSwipeGestures({
 *   onSwipeUp: () => navigateToNextVideo(),
 *   onSwipeDown: () => navigateToPreviousVideo(),
 *   minDistance: 50,
 * })
 * 
 * return (
 *   <div
 *     onTouchStart={onTouchStart}
 *     onTouchMove={onTouchMove}
 *     onTouchEnd={onTouchEnd}
 *   >
 *     Video content
 *   </div>
 * )
 * ```
 */
export function useSwipeGestures(
  options: UseSwipeGesturesOptions = {}
): UseSwipeGesturesReturn {
  const {
    minDistance = 50,
    minVelocity = 300,
    maxDuration = 500,
    enabled = true,
    onSwipeUp,
    onSwipeDown,
    onSwipeLeft,
    onSwipeRight,
    onSwipe,
    preventDefault = true,
  } = options

  const touchStartRef = useRef<{
    x: number
    y: number
    time: number
  } | null>(null)
  const isSwipeRef = useRef<boolean>(false)

  // Calculate swipe direction and distance
  const calculateSwipe = useCallback(
    (startX: number, startY: number, endX: number, endY: number, duration: number): SwipeEvent | null => {
      const deltaX = endX - startX
      const deltaY = endY - startY
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
      const velocity = distance / (duration / 1000) // pixels per second

      // Check if swipe meets minimum requirements
      if (distance < minDistance || velocity < minVelocity || duration > maxDuration) {
        return null
      }

      // Determine primary direction (horizontal or vertical)
      const absDeltaX = Math.abs(deltaX)
      const absDeltaY = Math.abs(deltaY)

      let direction: SwipeDirection

      if (absDeltaY > absDeltaX) {
        // Vertical swipe
        direction = deltaY > 0 ? 'down' : 'up'
      } else {
        // Horizontal swipe
        direction = deltaX > 0 ? 'right' : 'left'
      }

      return {
        direction,
        distance,
        velocity,
        duration,
      }
    },
    [minDistance, minVelocity, maxDuration]
  )

  // Handle swipe event
  const handleSwipe = useCallback(
    (event: SwipeEvent): void => {
      if (!enabled) {
        return
      }

      logDebug('Swipe detected', {
        direction: event.direction,
        distance: Math.round(event.distance),
        velocity: Math.round(event.velocity),
      })

      // Call specific direction callback
      switch (event.direction) {
        case 'up':
          onSwipeUp?.(event)
          break
        case 'down':
          onSwipeDown?.(event)
          break
        case 'left':
          onSwipeLeft?.(event)
          break
        case 'right':
          onSwipeRight?.(event)
          break
      }

      // Call general swipe callback
      onSwipe?.(event)
    },
    [enabled, onSwipeUp, onSwipeDown, onSwipeLeft, onSwipeRight, onSwipe]
  )

  // Touch start handler
  const onTouchStart = useCallback(
    (e: React.TouchEvent): void => {
      if (!enabled) {
        return
      }

      const touch = e.touches[0]
      if (!touch) {
        return
      }

      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      }
      isSwipeRef.current = false

      if (preventDefault) {
        e.preventDefault()
      }
    },
    [enabled, preventDefault]
  )

  // Touch move handler
  const onTouchMove = useCallback(
    (e: React.TouchEvent): void => {
      if (!enabled || !touchStartRef.current) {
        return
      }

      const touch = e.touches[0]
      if (!touch) {
        return
      }

      const deltaX = Math.abs(touch.clientX - touchStartRef.current.x)
      const deltaY = Math.abs(touch.clientY - touchStartRef.current.y)

      // Detect if this is a swipe (movement in one direction)
      if (deltaX > 10 || deltaY > 10) {
        isSwipeRef.current = true
      }

      if (preventDefault && isSwipeRef.current) {
        e.preventDefault()
      }
    },
    [enabled, preventDefault]
  )

  // Touch end handler
  const onTouchEnd = useCallback(
    (e: React.TouchEvent): void => {
      if (!enabled || !touchStartRef.current) {
        return
      }

      const touch = e.changedTouches[0]
      if (!touch) {
        touchStartRef.current = null
        return
      }

      const start = touchStartRef.current
      const endX = touch.clientX
      const endY = touch.clientY
      const duration = Date.now() - start.time

      // Only process if this was a swipe
      if (isSwipeRef.current) {
        const swipeEvent = calculateSwipe(start.x, start.y, endX, endY, duration)
        if (swipeEvent) {
          handleSwipe(swipeEvent)
        }
      }

      touchStartRef.current = null
      isSwipeRef.current = false
    },
    [enabled, calculateSwipe, handleSwipe]
  )

  // Mouse handlers for desktop testing
  const mouseStartRef = useRef<{
    x: number
    y: number
    time: number
  } | null>(null)
  const isMouseSwipeRef = useRef<boolean>(false)

  const onMouseDown = useCallback(
    (e: React.MouseEvent): void => {
      if (!enabled) {
        return
      }

      mouseStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        time: Date.now(),
      }
      isMouseSwipeRef.current = false
    },
    [enabled]
  )

  const onMouseMove = useCallback(
    (e: React.MouseEvent): void => {
      if (!enabled || !mouseStartRef.current) {
        return
      }

      const deltaX = Math.abs(e.clientX - mouseStartRef.current.x)
      const deltaY = Math.abs(e.clientY - mouseStartRef.current.y)

      if (deltaX > 10 || deltaY > 10) {
        isMouseSwipeRef.current = true
      }
    },
    [enabled]
  )

  const onMouseUp = useCallback(
    (e: React.MouseEvent): void => {
      if (!enabled || !mouseStartRef.current) {
        return
      }

      const start = mouseStartRef.current
      const endX = e.clientX
      const endY = e.clientY
      const duration = Date.now() - start.time

      if (isMouseSwipeRef.current) {
        const swipeEvent = calculateSwipe(start.x, start.y, endX, endY, duration)
        if (swipeEvent) {
          handleSwipe(swipeEvent)
        }
      }

      mouseStartRef.current = null
      isMouseSwipeRef.current = false
    },
    [enabled, calculateSwipe, handleSwipe]
  )

  // Reset function
  const reset = useCallback((): void => {
    touchStartRef.current = null
    mouseStartRef.current = null
    isSwipeRef.current = false
    isMouseSwipeRef.current = false
  }, [])

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    reset,
  }
}

