'use client'

import { useState } from 'react'
import { useToast } from '@/components/ui/toast'
import { cn } from '@/lib/utils'

interface ShareStoryButtonProps {
  storyId: string
  className?: string
}

export function ShareStoryButton({ storyId, className }: ShareStoryButtonProps) {
  const { showToast } = useToast()
  const [isSharing, setIsSharing] = useState(false)

  const handleShare = async () => {
    try {
      setIsSharing(true)

      // Create share URL using current origin
      const shareUrl = `${window.location.origin}/story/${storyId}`

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
      console.error('Error copying link:', err)
      // Fallback: show prompt
      const shareUrl = `${window.location.origin}/story/${storyId}`
      prompt('Copy this link:', shareUrl)
      showToast('Link ready to copy', 'info')
    } finally {
      setIsSharing(false)
    }
  }

  return (
    <button
      onClick={handleShare}
      disabled={isSharing}
      className={cn(
        'inline-flex items-center gap-2 rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-100 hover:bg-slate-800 transition-colors ease-smooth',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'focus:outline-none focus:ring-2 focus:ring-brand-cyan focus:ring-offset-2 focus:ring-offset-gray-900',
        className
      )}
      aria-label="Share story link"
      title="Copy story link to clipboard"
    >
      <span>🔗</span>
      <span className="hidden sm:inline">Share</span>
    </button>
  )
}

