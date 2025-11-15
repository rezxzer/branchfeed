'use client'

import { cn } from '@/lib/utils'
import { Button } from './Button'

export interface ErrorStateProps {
  title: string
  message?: string
  retryLabel?: string
  onRetry?: () => void
  className?: string
}

export const ErrorState = ({
  title,
  message,
  retryLabel = 'Try Again',
  onRetry,
  className,
}: ErrorStateProps) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center',
        'py-12 px-6 text-center',
        'bg-gray-800/60 backdrop-blur-sm rounded-2xl',
        'border border-red-500/40 shadow-level-2',
        'hover:border-red-400/50 transition-all ease-smooth',
        className
      )}
    >
      <div className="text-5xl mb-4 opacity-90 filter drop-shadow-sm">⚠️</div>
      <h3 className="text-xl font-semibold text-red-400 mb-2 drop-shadow-sm">{title}</h3>
      {message && (
        <p className="text-base text-gray-300/90 max-w-md mb-6 leading-relaxed">{message}</p>
      )}
      {onRetry && (
        <Button variant="danger" onClick={onRetry} size="lg">
          {retryLabel}
        </Button>
      )}
    </div>
  )
}

