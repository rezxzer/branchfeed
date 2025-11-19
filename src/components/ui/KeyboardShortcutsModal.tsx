'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { Button } from './Button'
import { cn } from '@/lib/utils'

interface KeyboardShortcut {
  keys: string[]
  description: string
}

interface KeyboardShortcutsModalProps {
  isOpen: boolean
  onClose: () => void
}

const shortcuts: KeyboardShortcut[] = [
  { keys: ['/'], description: 'Focus search or navigate to search page' },
  { keys: ['?'], description: 'Show keyboard shortcuts' },
  { keys: ['j'], description: 'Navigate to next story (feed page)' },
  { keys: ['k'], description: 'Navigate to previous story (feed page)' },
  { keys: ['Esc'], description: 'Close modals, lightboxes, and dialogs' },
  { keys: ['Enter'], description: 'Activate focused element' },
  { keys: ['Space'], description: 'Activate focused element' },
  { keys: ['Tab'], description: 'Navigate between interactive elements' },
]

export function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      document.body.style.overflow = 'hidden'
    } else {
      setIsVisible(false)
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Listen for ? key to toggle
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const target = e.target as HTMLElement
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA' && !target.isContentEditable) {
          if (isOpen) {
            onClose()
          } else {
            // This will be handled by useKeyboardShortcuts
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm transition-opacity',
        isVisible ? 'opacity-100' : 'opacity-0'
      )}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard shortcuts"
    >
      <div
        className="relative bg-gray-800 rounded-xl border border-gray-700 p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full bg-gray-700/50 p-2 text-gray-300 hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-cyan"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Keyboard Shortcuts</h2>
          <p className="text-gray-400 text-sm">Use these shortcuts to navigate faster</p>
        </div>

        {/* Shortcuts list */}
        <div className="space-y-3">
          {shortcuts.map((shortcut, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-3 px-4 bg-gray-700/30 rounded-lg border border-gray-700/50"
            >
              <span className="text-gray-300 text-sm">{shortcut.description}</span>
              <div className="flex items-center gap-1.5">
                {shortcut.keys.map((key, keyIndex) => (
                  <span key={keyIndex}>
                    <kbd className="px-2.5 py-1 bg-gray-900 border border-gray-600 rounded text-xs font-mono text-white shadow-sm">
                      {key}
                    </kbd>
                    {keyIndex < shortcut.keys.length - 1 && (
                      <span className="text-gray-500 mx-1">+</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-700">
          <p className="text-gray-400 text-xs text-center">
            Press <kbd className="px-1.5 py-0.5 bg-gray-900 border border-gray-600 rounded text-xs font-mono">Esc</kbd> or click outside to close
          </p>
        </div>
      </div>
    </div>
  )
}

