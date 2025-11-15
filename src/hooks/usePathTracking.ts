'use client'

import { useState, useEffect, useCallback } from 'react'
import { updateUserProgress, getUserProgress } from '@/lib/stories'
import { useAuth } from '@/hooks/useAuth'

interface UsePathTrackingResult {
  currentPath: ('A' | 'B')[]
  currentDepth: number
  makeChoice: (choice: 'A' | 'B') => Promise<void>
  loadExistingPath: () => Promise<void>
  setPathFromUrl: (path: ('A' | 'B')[]) => void
}

export function usePathTracking(
  storyId: string
): UsePathTrackingResult {
  const { user } = useAuth()
  const [currentPath, setCurrentPath] = useState<('A' | 'B')[]>([])
  const [currentDepth, setCurrentDepth] = useState(0)

  const makeChoice = useCallback(
    async (choice: 'A' | 'B') => {
      const newPath = [...currentPath, choice]
      
      // Update local state immediately
      setCurrentPath(newPath)
      setCurrentDepth(newPath.length)

      // Save to database if user is authenticated
      if (user?.id) {
        try {
          await updateUserProgress(user.id, storyId, newPath)
        } catch (err) {
          console.error('Error saving progress to database:', err)
          // Fallback to localStorage if database fails
          if (typeof window !== 'undefined') {
            const key = `story-path-${storyId}`
            localStorage.setItem(key, JSON.stringify(newPath))
          }
        }
      } else {
        // Fallback to localStorage if not authenticated
        if (typeof window !== 'undefined') {
          const key = `story-path-${storyId}`
          localStorage.setItem(key, JSON.stringify(newPath))
        }
      }
    },
    [storyId, currentPath, user]
  )

  const loadExistingPath = useCallback(async () => {
    // Try to load from database if user is authenticated
    if (user?.id) {
      try {
        const progress = await getUserProgress(user.id, storyId)
        if (progress) {
          setCurrentPath(progress.path)
          setCurrentDepth(progress.current_depth)
          return
        }
      } catch (err) {
        console.error('Error loading progress from database:', err)
        // Fallback to localStorage
      }
    }

    // Fallback to localStorage
    if (typeof window !== 'undefined') {
      const key = `story-path-${storyId}`
      const savedPath = localStorage.getItem(key)
      if (savedPath) {
        try {
          const path = JSON.parse(savedPath) as ('A' | 'B')[]
          setCurrentPath(path)
          setCurrentDepth(path.length)
        } catch (err) {
          console.error('Error loading saved path:', err)
        }
      }
    }
  }, [storyId, user])

  /**
   * Set path from URL (used when restoring path from shared link)
   * This overrides database/localStorage path
   */
  const setPathFromUrl = useCallback((path: ('A' | 'B')[]) => {
    setCurrentPath(path)
    setCurrentDepth(path.length)
    
    // Optionally save to database/localStorage for future visits
    if (user?.id) {
      updateUserProgress(user.id, storyId, path).catch((err) => {
        console.error('Error saving path from URL:', err)
      })
    } else if (typeof window !== 'undefined') {
      const key = `story-path-${storyId}`
      localStorage.setItem(key, JSON.stringify(path))
    }
  }, [storyId, user])

  return {
    currentPath,
    currentDepth,
    makeChoice,
    loadExistingPath,
    setPathFromUrl,
  }
}

