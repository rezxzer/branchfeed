'use client'

import { useState } from 'react'
import { createStory as createStoryFunction } from '@/lib/stories'
import type { CreateStoryData } from '@/types/create'

export interface CreateStoryProgress {
  stage: 'uploading' | 'creating' | 'complete'
  progress: number // 0-100
  message: string
}

export function useCreateStory() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [uploadProgress, setUploadProgress] = useState<CreateStoryProgress | null>(null)

  const createStory = async (data: CreateStoryData): Promise<string> => {
    setLoading(true)
    setError(null)
    setUploadProgress({ stage: 'uploading', progress: 0, message: 'Uploading media...' })

    try {
      // Simulate progress for better UX
      const totalFiles = 1 + (data.root.media ? 1 : 0) + data.nodes.reduce((sum, node) => {
        return sum + (node.choiceA.media ? 1 : 0) + (node.choiceB.media ? 1 : 0)
      }, 0)

      let uploadedFiles = 0
      const updateProgress = () => {
        uploadedFiles++
        const progress = Math.min((uploadedFiles / totalFiles) * 80, 80) // 80% for uploads
        setUploadProgress({
          stage: 'uploading',
          progress,
          message: `Uploading media... (${uploadedFiles}/${totalFiles})`,
        })
      }

      // Use real story creation function from stories library
      setUploadProgress({ stage: 'creating', progress: 80, message: 'Creating story...' })
      const storyId = await createStoryFunction(data)
      
      setUploadProgress({ stage: 'complete', progress: 100, message: 'Story created!' })
      
      // Clear progress after a short delay
      setTimeout(() => {
        setUploadProgress(null)
      }, 1000)

      return storyId
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create story')
      setError(error)
      setUploadProgress(null)
      throw error
    } finally {
      setLoading(false)
    }
  }

  return {
    createStory,
    loading,
    error,
    uploadProgress,
  }
}

