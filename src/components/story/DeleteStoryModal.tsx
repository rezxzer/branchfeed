'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/toast'
import { Button } from '@/components/ui/Button'

interface DeleteStoryModalProps {
  isOpen: boolean
  onClose: () => void
  storyId: string
  storyTitle: string
}

export function DeleteStoryModal({
  isOpen,
  onClose,
  storyId,
  storyTitle,
}: DeleteStoryModalProps) {
  const router = useRouter()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleDelete = async () => {
    try {
      setLoading(true)

      const response = await fetch(`/api/stories/${storyId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete story')
      }

      showToast('Story deleted successfully', 'success')
      router.push('/feed')
    } catch (error: any) {
      console.error('Error deleting story:', error)
      showToast(error.message || 'Failed to delete story', 'error')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-gray-800 rounded-2xl border border-gray-700/50 shadow-level-3 w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Delete Story</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close"
            disabled={loading}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-gray-300">
            Are you sure you want to delete &quot;{storyTitle}&quot;? This action cannot be undone.
          </p>
          <p className="text-sm text-gray-400">
            This will delete the story and all related data (branches, likes, comments, etc.).
          </p>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? 'Deleting...' : 'Delete Story'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

