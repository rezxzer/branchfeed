'use client'

import { useState, useEffect } from 'react'
import { getStoryTree, type TreeNode } from '@/lib/stories'
import { Spinner } from '@/components/ui/Spinner'
import { ErrorState } from '@/components/ui/ErrorState'
import { useTranslation } from '@/hooks/useTranslation'
import { cn } from '@/lib/utils'

interface StoryTreeViewerProps {
  storyId: string
}

export function StoryTreeViewer({ storyId }: StoryTreeViewerProps) {
  const { t } = useTranslation()
  const [tree, setTree] = useState<TreeNode[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())

  useEffect(() => {
    const loadTree = async () => {
      try {
        setLoading(true)
        setError(null)
        const treeData = await getStoryTree(storyId)
        setTree(treeData)
        // Expand all nodes by default
        const allNodeIds = new Set<string>()
        const collectIds = (nodes: TreeNode[]) => {
          nodes.forEach((node) => {
            allNodeIds.add(node.id)
            if (node.children.length > 0) {
              collectIds(node.children)
            }
          })
        }
        collectIds(treeData)
        setExpandedNodes(allNodeIds)
      } catch (err) {
        console.error('Error loading story tree:', err)
        setError(err instanceof Error ? err : new Error('Failed to load story tree'))
      } finally {
        setLoading(false)
      }
    }

    if (storyId) {
      loadTree()
    }
  }, [storyId])

  const toggleNode = (nodeId: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev)
      if (next.has(nodeId)) {
        next.delete(nodeId)
      } else {
        next.add(nodeId)
      }
      return next
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load story tree"
        message={error.message}
        onRetry={() => window.location.reload()}
      />
    )
  }

  if (tree.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <p>No branches found in this story.</p>
      </div>
    )
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700/50">
      <h3 className="text-lg font-semibold text-white mb-4">
        {t('story.tree.title') || 'Story Tree'}
      </h3>
      <div className="space-y-2">
        {tree.map((node) => (
          <TreeNodeComponent
            key={node.id}
            node={node}
            level={0}
            expandedNodes={expandedNodes}
            onToggle={toggleNode}
          />
        ))}
      </div>
    </div>
  )
}

interface TreeNodeComponentProps {
  node: TreeNode
  level: number
  expandedNodes: Set<string>
  onToggle: (nodeId: string) => void
}

function TreeNodeComponent({
  node,
  level,
  expandedNodes,
  onToggle,
}: TreeNodeComponentProps) {
  const isExpanded = expandedNodes.has(node.id)
  const hasChildren = node.children.length > 0

  return (
    <div className="relative">
      {/* Node */}
      <div
        className={cn(
          'flex items-center gap-2 p-3 rounded-lg border transition-colors',
          'bg-gray-700/30 border-gray-600/50',
          'hover:bg-gray-700/50 hover:border-gray-600',
          level === 0 && 'bg-gray-700/50 border-gray-600'
        )}
        style={{ marginLeft: `${level * 24}px` }}
      >
        {/* Expand/Collapse Button */}
        {hasChildren && (
          <button
            onClick={() => onToggle(node.id)}
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-600 transition-colors"
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            <span className="text-gray-300 text-sm">
              {isExpanded ? '▼' : '▶'}
            </span>
          </button>
        )}
        {!hasChildren && <div className="w-6" />}

        {/* Choice Label Badge */}
        {node.choiceLabel && (
          <span
            className={cn(
              'px-2 py-1 rounded text-xs font-semibold',
              node.choiceLabel === 'A'
                ? 'bg-gradient-branch text-white'
                : 'bg-gradient-brand text-white'
            )}
          >
            {node.choiceLabel}
          </span>
        )}

        {/* Node Content */}
        <div className="flex-1 min-w-0">
          {node.content && (
            <p className="text-sm text-gray-200 line-clamp-1">{node.content}</p>
          )}
          {!node.content && node.choiceLabel && (
            <p className="text-sm text-gray-400">
              Choice {node.choiceLabel}
            </p>
          )}
        </div>

        {/* Depth Indicator */}
        <span className="text-xs text-gray-500">Depth {node.depth}</span>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="mt-2 space-y-2">
          {node.children.map((child) => (
            <TreeNodeComponent
              key={child.id}
              node={child}
              level={level + 1}
              expandedNodes={expandedNodes}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  )
}

