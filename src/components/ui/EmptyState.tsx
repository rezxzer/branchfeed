'use client'

import { cn } from '@/lib/utils'
import { Button } from './Button'

export interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}

export const EmptyState = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center',
        'py-12 px-6 text-center',
        'bg-gray-800/60 backdrop-blur-sm rounded-2xl',
        'border border-brand-iris/20 shadow-level-2',
        'hover:border-brand-cyan/30 transition-all ease-smooth',
        className
      )}
    >
      {icon && (
        <div className="text-5xl mb-4 opacity-80 bg-gradient-brand bg-clip-text text-transparent">
          {icon}
        </div>
      )}
      <h3 className="text-xl font-semibold text-white mb-2 drop-shadow-sm">{title}</h3>
      {description && (
        <p className="text-base text-gray-300/90 max-w-md mb-6 leading-relaxed">{description}</p>
      )}
      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction} size="lg">
          {actionLabel}
        </Button>
      )}
    </div>
  )
}

