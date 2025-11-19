'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface AnimateOnScrollProps {
  children: React.ReactNode
  /** Animation type */
  animation?: 'fadeIn' | 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight' | 'scale'
  /** Delay in milliseconds */
  delay?: number
  /** Duration in milliseconds */
  duration?: number
  /** Threshold for intersection observer (0-1) */
  threshold?: number
  /** Custom className */
  className?: string
  /** Whether to animate only once */
  once?: boolean
}

/**
 * AnimateOnScroll component - animates children when they enter viewport
 */
export function AnimateOnScroll({
  children,
  animation = 'fadeIn',
  delay = 0,
  duration = 500,
  threshold = 0.1,
  className,
  once = true,
}: AnimateOnScrollProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [hasAnimated, setHasAnimated] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
            if (once && !hasAnimated) {
              setHasAnimated(true)
            }
          } else if (!once) {
            setIsVisible(false)
          }
        })
      },
      { threshold }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [threshold, once, hasAnimated])

  const animationClasses = {
    fadeIn: isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4',
    slideUp: isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8',
    slideDown: isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8',
    slideLeft: isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8',
    slideRight: isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8',
    scale: isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95',
  }

  return (
    <div
      ref={ref}
      className={cn(
        'transition-all ease-smooth',
        animationClasses[animation],
        className
      )}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}

