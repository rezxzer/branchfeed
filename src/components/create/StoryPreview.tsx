'use client'

import Image from 'next/image'
import { useTranslation } from '@/hooks/useTranslation'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import type { RootStoryData, BranchNodeData } from '@/types/create'

interface StoryPreviewProps {
  rootStory: RootStoryData
  nodes: BranchNodeData[]
  onPublish: () => void
  onBack: () => void
  loading: boolean
  error: Error | null
}

export function StoryPreview({
  rootStory,
  nodes,
  onPublish,
  onBack,
  loading,
  error,
}: StoryPreviewProps) {
  const { t } = useTranslation()

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-level-2 border border-gray-700/50 p-6">
      <h2 className="text-xl font-semibold text-white mb-6">
        {t('createStory.preview.title')}
      </h2>

      {/* Root Story Preview */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          {rootStory.title}
        </h3>
        {rootStory.description && (
          <p className="text-gray-300 mb-4">{rootStory.description}</p>
        )}
        {rootStory.mediaUrl && (
          <div className="relative aspect-[9/16] w-full max-w-xs mx-auto rounded-lg overflow-hidden bg-gray-700">
            {rootStory.mediaType === 'video' ? (
              <video
                src={rootStory.mediaUrl}
                className="w-full h-full object-cover"
                controls
              />
            ) : (
              <Image
                src={rootStory.mediaUrl}
                alt={rootStory.title}
                fill
                className="object-cover"
                unoptimized
              />
            )}
          </div>
        )}
      </div>

      {/* Branch Nodes Preview */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-4">Branch Nodes</h3>
        <div className="space-y-4">
          {nodes.map((node, index) => (
            <div
              key={node.id}
              className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50"
            >
              <h4 className="text-md font-semibold text-white mb-2">
                Node {index + 1}
              </h4>
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-brand-cyan">
                    {t('createStory.branches.choiceA')}:
                  </span>
                  <p className="text-gray-300 text-sm">
                    {node.choiceA.content || 'No content'}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-brand-plum">
                    {t('createStory.branches.choiceB')}:
                  </span>
                  <p className="text-gray-300 text-sm">
                    {node.choiceB.content || 'No content'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button type="button" variant="outline" onClick={onBack} fullWidth>
          {t('createStory.back')}
        </Button>
        <Button
          type="button"
          variant="primary"
          onClick={onPublish}
          fullWidth
          disabled={loading}
          isLoading={loading}
          aria-label={loading ? 'Publishing story...' : 'Publish story'}
        >
          {loading ? (
            t('createStory.preview.publishing') || 'Publishing...'
          ) : (
            t('createStory.publish') || 'Publish Story'
          )}
        </Button>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-error/10 border border-error/20 rounded-lg">
          <p className="text-sm text-error whitespace-pre-line">{error.message}</p>
        </div>
      )}
    </div>
  )
}

