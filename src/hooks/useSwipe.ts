'use client'

import { useState, useRef, useCallback } from 'react'

export interface SwipeHandlers {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
}

export interface UseSwipeOptions {
  threshold?: number // Minimum distance in pixels to trigger swipe (default: 50)
  velocity?: number // Minimum velocity in pixels/ms to trigger swipe (default: 0.3)
  preventDefault?: boolean // Prevent default touch behavior (default: true)
}

export interface UseSwipeResult {
  touchHandlers: {
    onTouchStart: (e: React.TouchEvent) => void
    onTouchMove: (e: React.TouchEvent) => void
    onTouchEnd: (e: React.TouchEvent) => void
  }
  isSwiping: boolean
  swipeDirection: 'left' | 'right' | 'up' | 'down' | null
}

/**
 * Hook for detecting swipe gestures on touch devices
 * @param handlers - Callback functions for swipe directions
 * @param options - Configuration options
 * @returns Touch event handlers and swipe state
 */
export function useSwipe(
  handlers: SwipeHandlers,
  options: UseSwipeOptions = {}
): UseSwipeResult {
  const { threshold = 50, velocity = 0.3, preventDefault = true } = options

  const [isSwiping, setIsSwiping] = useState(false)
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | 'up' | 'down' | null>(null)

  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null)
  const touchMoveRef = useRef<{ x: number; y: number; time: number } | null>(null)

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (preventDefault) {
        e.preventDefault()
      }

      const touch = e.touches[0]
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      }
      touchMoveRef.current = null
      setIsSwiping(true)
      setSwipeDirection(null)
    },
    [preventDefault]
  )

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStartRef.current) return

      if (preventDefault) {
        e.preventDefault()
      }

      const touch = e.touches[0]
      touchMoveRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      }
    },
    [preventDefault]
  )

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStartRef.current) {
        setIsSwiping(false)
        return
      }

      const touchEnd = touchMoveRef.current || touchStartRef.current
      const start = touchStartRef.current

      const deltaX = touchEnd.x - start.x
      const deltaY = touchEnd.y - start.y
      const deltaTime = touchEnd.time - start.time

      const distanceX = Math.abs(deltaX)
      const distanceY = Math.abs(deltaY)
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

      const velocityX = distanceX / deltaTime
      const velocityY = distanceY / deltaTime
      const overallVelocity = distance / deltaTime

      // Determine swipe direction based on primary axis
      const isHorizontal = distanceX > distanceY
      const isVertical = distanceY > distanceX

      // Check if swipe meets threshold and velocity requirements
      if (distance >= threshold && overallVelocity >= velocity) {
        if (isHorizontal) {
          if (deltaX > 0) {
            // Swipe right
            setSwipeDirection('right')
            handlers.onSwipeRight?.()
          } else {
            // Swipe left
            setSwipeDirection('left')
            handlers.onSwipeLeft?.()
          }
        } else if (isVertical) {
          if (deltaY > 0) {
            // Swipe down
            setSwipeDirection('down')
            handlers.onSwipeDown?.()
          } else {
            // Swipe up
            setSwipeDirection('up')
            handlers.onSwipeUp?.()
          }
        }
      }

      // Reset state
      touchStartRef.current = null
      touchMoveRef.current = null
      setIsSwiping(false)

      // Clear direction after animation
      setTimeout(() => {
        setSwipeDirection(null)
      }, 300)
    },
    [handlers, threshold, velocity]
  )

  return {
    touchHandlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
    isSwiping,
    swipeDirection,
  }
}

