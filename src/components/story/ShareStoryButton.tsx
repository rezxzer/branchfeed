'use client'

import { useState } from 'react'
import { useToast } from '@/components/ui/toast'
import { useShares } from '@/hooks/useShares'
import { cn } from '@/lib/utils'
import { encodePath } from '@/lib/pathSharing'

interface ShareStoryButtonProps {
  storyId: string
  path?: ('A' | 'B')[]
  className?: string
  initialShared?: boolean
  initialSharesCount?: number
  showCount?: boolean
}

export function ShareStoryButton({ 
  storyId, 
  path, 
  className,
  initialShared = false,
  initialSharesCount = 0,
  showCount = false,
}: ShareStoryButtonProps) {
  const { showToast } = useToast()
  const { isShared, sharesCount, loading, toggleShare } = useShares(
    storyId,
    initialShared,
    initialSharesCount
  )
  const [isCopying, setIsCopying] = useState(false)

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation()
    
    try {
      setIsCopying(true)

      // Build base URL
      let shareUrl = `${window.location.origin}/story/${storyId}`
      
      // Add path parameter if path exists and is not empty
      if (path && path.length > 0) {
        const encodedPath = encodePath(path)
        if (encodedPath) {
          shareUrl += `?path=${encodedPath}`
        }
      }

      // Track share in database (if not already shared)
      if (!isShared) {
        await toggleShare(storyId)
      }

      // Try to copy to clipboard
      if (typeof navigator !== 'undefined' && 'clipboard' in navigator) {
        const clipboard = (navigator as Navigator & { clipboard?: Clipboard }).clipboard
        if (clipboard) {
          await clipboard.writeText(shareUrl)
          showToast('Link copied to clipboard!', 'success')
          return
        }
      }

      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = shareUrl
      textArea.style.position = 'fixed'
      textArea.style.opacity = '0'
      document.body.appendChild(textArea)
      textArea.select()
      const success = document.execCommand('copy')
      document.body.removeChild(textArea)

      if (success) {
        showToast('Link copied to clipboard!', 'success')
      } else {
        // Final fallback: show prompt
        prompt('Copy this link:', shareUrl)
        showToast('Link ready to copy', 'info')
      }
    } catch (err) {
      console.error('Error sharing:', err)
      // Fallback: show prompt
      let fallbackUrl = `${window.location.origin}/story/${storyId}`
      if (path && path.length > 0) {
        const encodedPath = encodePath(path)
        if (encodedPath) {
          fallbackUrl += `?path=${encodedPath}`
        }
      }
      prompt('Copy this link:', fallbackUrl)
      showToast('Link ready to copy', 'info')
    } finally {
      setIsCopying(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      e.stopPropagation()
      if (!loading && !isCopying) {
        handleShare(e as any)
      }
    }
  }

  return (
    <button
      onClick={handleShare}
      onKeyDown={handleKeyDown}
      disabled={loading || isCopying}
      tabIndex={0}
      className={cn(
        'inline-flex items-center gap-2 rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-100 hover:bg-slate-800 transition-colors ease-smooth',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'focus:outline-none focus:ring-2 focus:ring-brand-cyan focus:ring-offset-2 focus:ring-offset-gray-900',
        isShared && 'border-brand-cyan/50 bg-brand-cyan/10',
        className
      )}
      aria-label="Share story link"
      title="Copy story link to clipboard"
    >
      <span>🔗</span>
      <span className="hidden sm:inline">Share</span>
      {showCount && sharesCount > 0 && (
        <span className="text-xs text-gray-400">({sharesCount})</span>
      )}
    </button>
  )
}

