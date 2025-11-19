'use client'

import { useState } from 'react'
import { useWatchLater } from '@/hooks/useWatchLater'
import { useAuth } from '@/hooks/useAuth'
import { useTranslation } from '@/hooks/useTranslation'
import { Clock, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { logError } from '@/lib/logger'

interface WatchLaterButtonProps {
  storyId: string
  /** Initial watch later status */
  initialInWatchLater?: boolean
  /** Custom className */
  className?: string
  /** Show count of watch later saves (default: false) */
  showCount?: boolean
  /** Variant of button (default: 'ghost') */
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger'
  /** Size of button (default: 'sm') */
  size?: 'sm' | 'md' | 'lg'
}

export function WatchLaterButton({
  storyId,
  initialInWatchLater = false,
  className = '',
  showCount = false,
  variant = 'ghost',
  size = 'sm',
}: WatchLaterButtonProps) {
  const { t } = useTranslation()
  const { isAuthenticated } = useAuth()
  const { isInWatchLater, loading, toggleWatchLater } = useWatchLater(
    storyId,
    initialInWatchLater
  )

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation()

    if (!isAuthenticated) {
      // Could show a toast or redirect to login
      return
    }

    try {
      await toggleWatchLater(storyId)
    } catch (error) {
      logError('Error toggling watch later', error)
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={loading || !isAuthenticated}
      className={className}
      aria-label={
        isInWatchLater
          ? t('watchLater.remove') || 'Remove from watch later'
          : t('watchLater.add') || 'Add to watch later'
      }
      title={
        isInWatchLater
          ? t('watchLater.remove') || 'Remove from watch later'
          : t('watchLater.add') || 'Add to watch later'
      }
    >
      {isInWatchLater ? (
        <X className="w-4 h-4 text-brand-cyan" />
      ) : (
        <Clock className="w-4 h-4 text-gray-400" />
      )}
      {showCount && (
        <span className="ml-1 text-xs">
          {t('watchLater.count') || '0'}
        </span>
      )}
    </Button>
  )
}

