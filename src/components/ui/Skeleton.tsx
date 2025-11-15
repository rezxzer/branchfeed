'use client'

import { cn } from '@/lib/utils'

export interface SkeletonProps {
  className?: string
  variant?: 'default' | 'circular' | 'text'
  width?: string | number
  height?: string | number
}

export function Skeleton({
  className,
  variant = 'default',
  width,
  height,
  ...props
}: SkeletonProps & React.HTMLAttributes<HTMLDivElement>) {
  const baseClasses = 'animate-pulse bg-gray-700/50 rounded'
  
  const variantClasses = {
    default: 'rounded',
    circular: 'rounded-full',
    text: 'rounded h-4',
  }

  const style: React.CSSProperties = {}
  if (width) style.width = typeof width === 'number' ? `${width}px` : width
  if (height) style.height = typeof height === 'number' ? `${height}px` : height

  return (
    <div
      className={cn(baseClasses, variantClasses[variant], className)}
      style={Object.keys(style).length > 0 ? style : undefined}
      {...props}
    />
  )
}

