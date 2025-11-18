'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useTranslation } from '@/hooks/useTranslation'
import { useToast } from '@/components/ui/toast'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import type { BranchNodeData } from '@/types/create'

interface BranchNodesFormProps {
  onSubmit: (nodes: BranchNodeData[]) => void
  initialNodes?: BranchNodeData[]
  maxDepth: number
  onBack: () => void
}

export function BranchNodesForm({
  onSubmit,
  initialNodes = [],
  maxDepth,
  onBack,
}: BranchNodesFormProps) {
  const { t } = useTranslation()
  const { showToast } = useToast()
  const [nodes, setNodes] = useState<BranchNodeData[]>(initialNodes)

  const addNode = () => {
    const newNode: BranchNodeData = {
      id: `node-${Date.now()}`,
      parentNodeId: null,
      depth: 0,
      choiceA: { label: 'A' },
      choiceB: { label: 'B' },
    }
    setNodes([...nodes, newNode])
  }

  const removeNode = (nodeId: string) => {
    setNodes(nodes.filter((n) => n.id !== nodeId))
  }

  const updateNode = (nodeId: string, updates: Partial<BranchNodeData>) => {
    setNodes(
      nodes.map((n) => (n.id === nodeId ? { ...n, ...updates } : n))
    )
  }

  const updateChoice = (
    nodeId: string,
    choice: 'choiceA' | 'choiceB',
    updates: Partial<BranchNodeData['choiceA']>
  ) => {
    setNodes(
      nodes.map((n) =>
        n.id === nodeId
          ? { ...n, [choice]: { ...n[choice], ...updates } }
          : n
      )
    )
  }

  const handleFileChange = (
    nodeId: string,
    choice: 'choiceA' | 'choiceB',
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Basic validation
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      showToast(
        `File size must be less than 10MB. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
        'error',
        5000
      )
      return
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm']
    if (!validTypes.includes(file.type)) {
      showToast(
        'Please upload an image (JPEG, PNG, WebP) or video (MP4, WebM) file.',
        'error',
        5000
      )
      return
    }

    // Create preview URL
    const previewUrl = URL.createObjectURL(file)
    const mediaType = file.type.startsWith('image/') ? 'image' : 'video'

    // Update choice with media
    updateChoice(nodeId, choice, {
      media: file,
      mediaUrl: previewUrl,
      mediaType: mediaType,
    })
  }

  const handleRemoveMedia = (
    nodeId: string,
    choice: 'choiceA' | 'choiceB'
  ) => {
    const node = nodes.find((n) => n.id === nodeId)
    if (!node) return

    // Revoke object URL if it's a blob URL
    const mediaUrl = choice === 'choiceA' ? node.choiceA.mediaUrl : node.choiceB.mediaUrl
    if (mediaUrl && mediaUrl.startsWith('blob:')) {
      URL.revokeObjectURL(mediaUrl)
    }

    // Clear media
    updateChoice(nodeId, choice, {
      media: null,
      mediaUrl: undefined,
      mediaType: undefined,
    })
  }

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      nodes.forEach((node) => {
        if (node.choiceA.mediaUrl?.startsWith('blob:')) {
          URL.revokeObjectURL(node.choiceA.mediaUrl)
        }
        if (node.choiceB.mediaUrl?.startsWith('blob:')) {
          URL.revokeObjectURL(node.choiceB.mediaUrl)
        }
      })
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validation: At least one node is required
    if (nodes.length === 0) {
      // Show error message (could use toast, but for now just prevent submission)
      return
    }

    onSubmit(nodes)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-level-2 border border-gray-700/50 p-6">
        <h2 className="text-xl font-semibold text-white mb-6">
          {t('createStory.branches.title')}
        </h2>

        {/* Add Node Button */}
        <div className="mb-6">
          <Button
            type="button"
            variant="outline"
            onClick={addNode}
            className="mb-4"
          >
            + {t('createStory.branches.addNode')}
          </Button>
        </div>

        {/* Nodes List */}
        {nodes.length === 0 ? (
          <p className="text-gray-400 text-center py-8">
            {t('createStory.branches.empty')}
          </p>
        ) : (
          <div className="space-y-6">
            {nodes.map((node, index) => (
              <div
                key={node.id}
                className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">
                    Node {index + 1}
                  </h3>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeNode(node.id)}
                    className="text-error hover:text-error"
                  >
                    Remove
                  </Button>
                </div>

                {/* Choice A */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t('createStory.branches.choiceA')}
                  </label>
                  <Textarea
                    value={node.choiceA.content || ''}
                    onChange={(e) =>
                      updateChoice(node.id, 'choiceA', {
                        content: e.target.value,
                      })
                    }
                    placeholder="Enter choice A content..."
                    rows={2}
                    className="mb-3"
                  />
                  
                  {/* Media Upload for Choice A */}
                  <div className="mb-3">
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={(e) => handleFileChange(node.id, 'choiceA', e)}
                      className="hidden"
                      id={`media-a-${node.id}`}
                    />
                    <div className="flex items-center gap-2">
                      <label
                        htmlFor={`media-a-${node.id}`}
                        className="cursor-pointer inline-block px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors ease-smooth"
                      >
                        {node.choiceA.media ? '📎 Change Media' : '📎 Add Media'}
                      </label>
                      {node.choiceA.media && (
                        <>
                          <span className="text-xs text-gray-400">{node.choiceA.media.name}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveMedia(node.id, 'choiceA')}
                            className="text-xs text-error hover:text-error"
                          >
                            ✕ Remove
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Media Preview for Choice A */}
                  {node.choiceA.mediaUrl && (
                    <div className="mb-3">
                      <div className="relative aspect-[9/16] w-full max-w-[200px] rounded-lg overflow-hidden bg-gray-700">
                        {node.choiceA.mediaType === 'video' ? (
                          <video
                            src={node.choiceA.mediaUrl}
                            className="w-full h-full object-cover"
                            controls
                          />
                        ) : (
                          <Image
                            src={node.choiceA.mediaUrl}
                            alt="Choice A preview"
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Choice B */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t('createStory.branches.choiceB')}
                  </label>
                  <Textarea
                    value={node.choiceB.content || ''}
                    onChange={(e) =>
                      updateChoice(node.id, 'choiceB', {
                        content: e.target.value,
                      })
                    }
                    placeholder="Enter choice B content..."
                    rows={2}
                    className="mb-3"
                  />
                  
                  {/* Media Upload for Choice B */}
                  <div className="mb-3">
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={(e) => handleFileChange(node.id, 'choiceB', e)}
                      className="hidden"
                      id={`media-b-${node.id}`}
                    />
                    <div className="flex items-center gap-2">
                      <label
                        htmlFor={`media-b-${node.id}`}
                        className="cursor-pointer inline-block px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors ease-smooth"
                      >
                        {node.choiceB.media ? '📎 Change Media' : '📎 Add Media'}
                      </label>
                      {node.choiceB.media && (
                        <>
                          <span className="text-xs text-gray-400">{node.choiceB.media.name}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveMedia(node.id, 'choiceB')}
                            className="text-xs text-error hover:text-error"
                          >
                            ✕ Remove
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Media Preview for Choice B */}
                  {node.choiceB.mediaUrl && (
                    <div className="mb-3">
                      <div className="relative aspect-[9/16] w-full max-w-[200px] rounded-lg overflow-hidden bg-gray-700">
                        {node.choiceB.mediaType === 'video' ? (
                          <video
                            src={node.choiceB.mediaUrl}
                            className="w-full h-full object-cover"
                            controls
                          />
                        ) : (
                          <Image
                            src={node.choiceB.mediaUrl}
                            alt="Choice B preview"
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4">
          <Button type="button" variant="outline" onClick={onBack} fullWidth>
            {t('createStory.back')}
          </Button>
          <Button
            type="submit"
            variant="primary"
            fullWidth
            disabled={nodes.length === 0}
          >
            {t('createStory.preview')}
          </Button>
        </div>
      </div>
    </form>
  )
}

