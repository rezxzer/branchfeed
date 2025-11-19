'use client'

import { Moon, Sun, Monitor } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { Button } from './Button'
import { cn } from '@/lib/utils'

interface ThemeToggleProps {
  /** Variant: 'button' | 'icon' */
  variant?: 'button' | 'icon'
  /** Size for icon variant */
  size?: 'sm' | 'md' | 'lg'
  /** Custom className */
  className?: string
}

export function ThemeToggle({ variant = 'icon', size = 'md', className }: ThemeToggleProps) {
  const { theme, resolvedTheme, toggleTheme } = useTheme()

  const getIcon = () => {
    if (theme === 'system') {
      return <Monitor className="h-4 w-4" />
    }
    return resolvedTheme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />
  }

  const getLabel = () => {
    if (theme === 'dark') return 'Dark mode'
    if (theme === 'light') return 'Light mode'
    return 'System theme'
  }

  if (variant === 'button') {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleTheme}
        className={cn('gap-2', className)}
        aria-label={getLabel()}
        title={getLabel()}
      >
        {getIcon()}
        <span className="hidden sm:inline">
          {theme === 'dark' ? 'Dark' : theme === 'light' ? 'Light' : 'System'}
        </span>
      </Button>
    )
  }

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        'rounded-full p-2 text-gray-300 hover:text-white hover:bg-gray-700/50 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-cyan focus:ring-offset-2 focus:ring-offset-gray-800',
        size === 'sm' && 'p-1.5',
        size === 'lg' && 'p-2.5',
        className
      )}
      aria-label={getLabel()}
      title={getLabel()}
    >
      {getIcon()}
    </button>
  )
}

