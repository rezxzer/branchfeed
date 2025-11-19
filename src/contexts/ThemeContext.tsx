'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextType {
  theme: Theme
  resolvedTheme: 'light' | 'dark'
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const THEME_STORAGE_KEY = 'branchfeed-theme'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark')
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark')
  const [mounted, setMounted] = useState(false)

  // Get system theme preference
  const getSystemTheme = useCallback((): 'light' | 'dark' => {
    if (typeof window === 'undefined') return 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }, [])

  // Resolve theme (system -> light/dark)
  const resolveTheme = useCallback(
    (currentTheme: Theme): 'light' | 'dark' => {
      if (currentTheme === 'system') {
        return getSystemTheme()
      }
      return currentTheme
    },
    [getSystemTheme]
  )

  // Apply theme to document
  const applyTheme = useCallback((resolved: 'light' | 'dark') => {
    const root = document.documentElement
    if (resolved === 'dark') {
      root.classList.add('dark')
      root.classList.remove('light')
    } else {
      root.classList.add('light')
      root.classList.remove('dark')
    }
  }, [])

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    if (typeof window === 'undefined') return

    const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null
    const initialTheme = stored || 'dark'
    setThemeState(initialTheme)
    
    const resolved = resolveTheme(initialTheme)
    setResolvedTheme(resolved)
    applyTheme(resolved)
    
    // Mark as mounted after initial setup
    setMounted(true)
  }, [resolveTheme, applyTheme])

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window === 'undefined' || theme !== 'system') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      const resolved = resolveTheme('system')
      setResolvedTheme(resolved)
      applyTheme(resolved)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme, resolveTheme, applyTheme])

  // Update resolved theme when theme changes
  useEffect(() => {
    if (!mounted) return
    const resolved = resolveTheme(theme)
    setResolvedTheme(resolved)
    applyTheme(resolved)
  }, [theme, mounted, resolveTheme, applyTheme])

  const setTheme = useCallback(
    (newTheme: Theme) => {
      setThemeState(newTheme)
      if (typeof window !== 'undefined') {
        localStorage.setItem(THEME_STORAGE_KEY, newTheme)
      }
      const resolved = resolveTheme(newTheme)
      setResolvedTheme(resolved)
      applyTheme(resolved)
    },
    [resolveTheme, applyTheme]
  )

  const toggleTheme = useCallback(() => {
    if (theme === 'dark') {
      setTheme('light')
    } else if (theme === 'light') {
      setTheme('system')
    } else {
      setTheme('dark')
    }
  }, [theme, setTheme])

  // Always provide context, even before mount (prevents hydration errors)
  // The theme will be applied once mounted
  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

