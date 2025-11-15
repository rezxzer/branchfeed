'use client'

import { useState, useEffect } from 'react'
import { getStoryByIdClient, getNodeByPath } from '@/lib/stories'
import type { Story } from '@/types'
import type { StoryNode } from '@/types'

interface CurrentNode extends StoryNode {
  choiceA?: {
    label: 'A' | 'B' | string
    content?: string
  }
  choiceB?: {
    label: 'A' | 'B' | string
    content?: string
  }
}

interface UseStoryResult {
  story: Story | null
  currentNode: CurrentNode | null
  loading: boolean
  error: Error | null
}

export function useStory(
  storyId: string,
  path: ('A' | 'B')[]
): UseStoryResult {
  const [story, setStory] = useState<Story | null>(null)
  const [currentNode, setCurrentNode] = useState<CurrentNode | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const loadStory = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch root story using centralized function
        const storyData = await getStoryByIdClient(storyId)

        if (!storyData) {
          throw new Error('Story not found')
        }

        setStory(storyData)

        // If no path, show root story (currentNode = null means show root)
        if (path.length === 0) {
          setCurrentNode(null)
          setLoading(false)
          return
        }

        // Fetch current node based on path
        const node = await getNodeByPath(storyId, path)
        
        if (node) {
          // Transform node to include choiceA and choiceB
          const currentNode: CurrentNode = {
            ...node,
            choiceA: {
              label: node.choice_a_label || 'A',
              content: node.choice_a_content || undefined,
            },
            choiceB: {
              label: node.choice_b_label || 'B',
              content: node.choice_b_content || undefined,
            },
          }
          setCurrentNode(currentNode)
        } else {
          // Invalid path - show root story
          setCurrentNode(null)
        }
      } catch (err: any) {
        console.error('Error loading story:', err)
        const errorMessage = err?.message || (typeof err === 'string' ? err : String(err))
        setError(err instanceof Error ? err : new Error(errorMessage || 'Unknown error loading story'))
      } finally {
        setLoading(false)
      }
    }

    if (storyId) {
      loadStory()
    }
  }, [storyId, path])

  return {
    story,
    currentNode,
    loading,
    error,
  }
}

