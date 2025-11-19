'use client'

import { useEffect, useCallback, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'

interface KeyboardShortcut {
  key: string
  ctrlKey?: boolean
  shiftKey?: boolean
  altKey?: boolean
  metaKey?: boolean
  action: () => void
  description: string
  enabled?: boolean
}

interface UseKeyboardShortcutsOptions {
  /** Whether shortcuts are enabled (default: true) */
  enabled?: boolean
  /** Custom shortcuts to add */
  shortcuts?: KeyboardShortcut[]
  /** Whether to prevent default behavior (default: true) */
  preventDefault?: boolean
}

/**
 * Global keyboard shortcuts hook
 * Provides common shortcuts like / for search, ? for help, j/k for navigation
 */
export function useKeyboardShortcuts(options: UseKeyboardShortcutsOptions = {}) {
  const { enabled = true, shortcuts = [], preventDefault = true } = options
  const router = useRouter()
  const pathname = usePathname()
  const shortcutsRef = useRef<KeyboardShortcut[]>([])

  // Default shortcuts
  const defaultShortcuts: KeyboardShortcut[] = [
    {
      key: '/',
      action: () => {
        // Focus search bar or navigate to search
        const searchInput = document.querySelector('input[type="search"], input[placeholder*="Search"]') as HTMLInputElement
        if (searchInput) {
          searchInput.focus()
          searchInput.select()
        } else {
          router.push('/search')
        }
      },
      description: 'Focus search',
    },
    {
      key: '?',
      action: () => {
        // Toggle help modal (will be implemented)
        const event = new CustomEvent('toggle-help')
        window.dispatchEvent(event)
      },
      description: 'Show keyboard shortcuts',
    },
    {
      key: 'j',
      action: () => {
        // Navigate to next story in feed (if on feed page)
        if (pathname === '/feed') {
          const cards = document.querySelectorAll('[data-story-card]')
          const currentFocused = document.activeElement
          let nextIndex = 0
          
          if (currentFocused && currentFocused.closest('[data-story-card]')) {
            cards.forEach((card, index) => {
              if (card.contains(currentFocused)) {
                nextIndex = (index + 1) % cards.length
              }
            })
          }
          
          const nextCard = cards[nextIndex] as HTMLElement
          if (nextCard) {
            const link = nextCard.querySelector('a, [role="button"]') as HTMLElement
            link?.focus()
            nextCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
          }
        }
      },
      description: 'Next story',
    },
    {
      key: 'k',
      action: () => {
        // Navigate to previous story in feed (if on feed page)
        if (pathname === '/feed') {
          const cards = document.querySelectorAll('[data-story-card]')
          const currentFocused = document.activeElement
          let prevIndex = 0
          
          if (currentFocused && currentFocused.closest('[data-story-card]')) {
            cards.forEach((card, index) => {
              if (card.contains(currentFocused)) {
                prevIndex = index > 0 ? index - 1 : cards.length - 1
              }
            })
          }
          
          const prevCard = cards[prevIndex] as HTMLElement
          if (prevCard) {
            const link = prevCard.querySelector('a, [role="button"]') as HTMLElement
            link?.focus()
            prevCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
          }
        }
      },
      description: 'Previous story',
    },
    {
      key: 'Escape',
      action: () => {
        // Close modals, lightboxes, etc.
        const event = new CustomEvent('close-modals')
        window.dispatchEvent(event)
      },
      description: 'Close modals',
    },
  ]

  // Combine default and custom shortcuts
  shortcutsRef.current = [...defaultShortcuts, ...shortcuts].filter(s => s.enabled !== false)

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in input/textarea
      const target = e.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable ||
        target.closest('[contenteditable="true"]')
      ) {
        // Allow / and ? even in inputs (but not when Ctrl/Cmd is pressed)
        if (e.key === '/' || e.key === '?') {
          if (e.ctrlKey || e.metaKey || e.altKey) {
            return
          }
        } else {
          return
        }
      }

      // Find matching shortcut
      const shortcut = shortcutsRef.current.find((s) => {
        return (
          s.key.toLowerCase() === e.key.toLowerCase() &&
          (s.ctrlKey === undefined || s.ctrlKey === (e.ctrlKey || e.metaKey)) &&
          (s.shiftKey === undefined || s.shiftKey === e.shiftKey) &&
          (s.altKey === undefined || s.altKey === e.altKey) &&
          (s.metaKey === undefined || s.metaKey === e.metaKey)
        )
      })

      if (shortcut) {
        if (preventDefault) {
          e.preventDefault()
          e.stopPropagation()
        }
        shortcut.action()
      }
    },
    [preventDefault]
  )

  useEffect(() => {
    if (!enabled) return

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [enabled, handleKeyDown])

  return {
    shortcuts: shortcutsRef.current,
  }
}

