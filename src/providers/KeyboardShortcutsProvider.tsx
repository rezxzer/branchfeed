'use client'

import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { KeyboardShortcutsModal } from '@/components/ui/KeyboardShortcutsModal'
import { useState, useEffect } from 'react'

export function KeyboardShortcutsProvider({ children }: { children: React.ReactNode }) {
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false)

  // Listen for help modal toggle event
  useEffect(() => {
    const handleToggleHelp = () => {
      setIsHelpModalOpen((prev) => !prev)
    }

    window.addEventListener('toggle-help', handleToggleHelp)
    return () => window.removeEventListener('toggle-help', handleToggleHelp)
  }, [])

  // Enable keyboard shortcuts globally
  useKeyboardShortcuts({
    enabled: true,
  })

  return (
    <>
      {children}
      <KeyboardShortcutsModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />
    </>
  )
}

