'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'post' | 'story'
  hoverable?: boolean
  clickable?: boolean
  padding?: 'sm' | 'md' | 'lg'
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant = 'default',
      hoverable = true,
      clickable = false,
      padding = 'md',
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Base styles
          'bg-white border border-gray-200 rounded-2xl',
          'transition-all duration-200',
          // Padding
          padding === 'sm' && 'p-4',
          padding === 'md' && 'p-6',
          padding === 'lg' && 'p-8',
          // Variants
          variant === 'default' && 'shadow-sm',
          variant === 'post' && 'shadow-sm',
          variant === 'story' && 'shadow-sm',
          // Hover effects
          hoverable && 'hover:shadow-md hover:border-gray-300',
          variant === 'post' && hoverable && 'hover:-translate-y-0.5',
          // Clickable
          clickable && 'cursor-pointer',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

