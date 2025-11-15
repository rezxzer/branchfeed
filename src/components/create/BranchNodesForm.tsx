'use client'

import { useState } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
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
                  />
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
                  />
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

