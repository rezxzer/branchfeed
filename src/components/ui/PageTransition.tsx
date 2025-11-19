'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface PageTransitionProps {
  children: React.ReactNode
  /** Animation duration in milliseconds */
  duration?: number
}

/**
 * PageTransition component - provides smooth page transitions
 */
export function PageTransition({ children, duration = 300 }: PageTransitionProps) {
  const pathname = usePathname()
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [displayChildren, setDisplayChildren] = useState(children)

  useEffect(() => {
    setIsTransitioning(true)
    const timer = setTimeout(() => {
      setDisplayChildren(children)
      setIsTransitioning(false)
    }, duration / 2)

    return () => clearTimeout(timer)
  }, [pathname, children, duration])

  return (
    <div
      className={cn(
        'transition-opacity ease-smooth',
        isTransitioning ? 'opacity-0' : 'opacity-100'
      )}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {displayChildren}
    </div>
  )
}

