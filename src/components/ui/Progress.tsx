'use client'

import { cn } from '@/lib/utils'

interface ProgressProps {
  value: number // 0-100
  max?: number // Default: 100
  showLabel?: boolean // Show percentage label
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'success' | 'warning' | 'error'
  className?: string
  label?: string // Custom label text
}

export function Progress({
  value,
  max = 100,
  showLabel = true,
  size = 'md',
  variant = 'default',
  className,
  label,
}: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  }

  const variantClasses = {
    default: 'bg-gradient-brand',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
  }

  return (
    <div className={cn('w-full', className)}>
      {/* Label */}
      {(showLabel || label) && (
        <div className="flex items-center justify-between mb-2">
          {label && (
            <span className="text-xs sm:text-sm font-medium text-gray-300">
              {label}
            </span>
          )}
          {showLabel && (
            <span className="text-xs sm:text-sm font-medium text-gray-400">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}

      {/* Progress Bar */}
      <div
        className={cn(
          'w-full bg-gray-700 rounded-full overflow-hidden',
          sizeClasses[size]
        )}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label || `Progress: ${Math.round(percentage)}%`}
      >
        <div
          className={cn(
            'h-full transition-all duration-300 ease-out',
            variantClasses[variant]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

