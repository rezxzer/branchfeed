'use client'

import { cn } from '@/lib/utils'

export type SpinnerSize = 'sm' | 'md' | 'lg'
export type SpinnerColor = 'primary' | 'white' | 'gray'

export interface SpinnerProps {
  size?: SpinnerSize
  color?: SpinnerColor
  className?: string
}

export const Spinner = ({
  size = 'md',
  color = 'primary',
  className,
}: SpinnerProps) => {
  return (
    <div
      className={cn(
        'inline-block border-2 rounded-full animate-spin',
        // Sizes
        size === 'sm' && 'w-4 h-4 border-2',
        size === 'md' && 'w-6 h-6 border-2',
        size === 'lg' && 'w-8 h-8 border-[3px]',
        // Colors
        color === 'primary' && 'border-gray-200 border-t-primary-500',
        color === 'white' && 'border-gray-300 border-t-white',
        color === 'gray' && 'border-gray-200 border-t-gray-600',
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  )
}

