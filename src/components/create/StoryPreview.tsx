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
  publishAsDraft?: boolean
  onPublishAsDraftChange?: (value: boolean) => void
  scheduledPublishAt?: string | null
  onScheduledPublishAtChange?: (value: string | null) => void
}

export function StoryPreview({
  rootStory,
  nodes,
  onPublish,
  onBack,
  loading,
  error,
  publishAsDraft = false,
  onPublishAsDraftChange,
  scheduledPublishAt = null,
  onScheduledPublishAtChange,
}: StoryPreviewProps) {
  const { t } = useTranslation()
  
  const handleScheduleToggle = (enabled: boolean) => {
    if (onScheduledPublishAtChange) {
      if (enabled) {
        // Set default to 1 hour from now
        const defaultDate = new Date()
        defaultDate.setHours(defaultDate.getHours() + 1)
        onScheduledPublishAtChange(defaultDate.toISOString().slice(0, 16))
      } else {
        onScheduledPublishAtChange(null)
      }
    }
  }
  
  const isScheduled = scheduledPublishAt !== null && scheduledPublishAt !== ''

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

      {/* Draft/Published Toggle */}
      {onPublishAsDraftChange && (
        <div className="mb-6 flex items-center gap-3 p-4 bg-gray-900/50 rounded-lg border border-gray-700/50">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={publishAsDraft}
              onChange={(e) => onPublishAsDraftChange(e.target.checked)}
              disabled={isScheduled}
              className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-brand-cyan focus:ring-brand-cyan focus:ring-2 disabled:opacity-50"
            />
            <span className="text-sm text-gray-300">
              Save as draft (not published)
            </span>
          </label>
        </div>
      )}

      {/* Schedule Publishing Toggle */}
      {onScheduledPublishAtChange && (
        <div className="mb-6 p-4 bg-gray-900/50 rounded-lg border border-gray-700/50">
          <div className="flex items-center gap-3 mb-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isScheduled}
                onChange={(e) => handleScheduleToggle(e.target.checked)}
                disabled={!publishAsDraft}
                className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-brand-cyan focus:ring-brand-cyan focus:ring-2 disabled:opacity-50"
              />
              <span className="text-sm text-gray-300">
                Schedule for later
              </span>
            </label>
          </div>
          {isScheduled && (
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Publish Date & Time
              </label>
              <input
                type="datetime-local"
                value={scheduledPublishAt || ''}
                onChange={(e) => onScheduledPublishAtChange(e.target.value || null)}
                min={new Date().toISOString().slice(0, 16)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-cyan"
              />
              <p className="mt-2 text-xs text-gray-400">
                Story will be automatically published at the selected time. Must be saved as draft.
              </p>
            </div>
          )}
        </div>
      )}

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
          aria-label={loading ? (publishAsDraft ? 'Saving draft...' : 'Publishing story...') : (publishAsDraft ? 'Save draft' : 'Publish story')}
        >
          {loading ? (
            publishAsDraft 
              ? (t('createStory.preview.savingDraft') || 'Saving draft...')
              : (t('createStory.preview.publishing') || 'Publishing...')
          ) : (
            publishAsDraft 
              ? (t('createStory.saveDraft') || 'Save Draft')
              : (t('createStory.publish') || 'Publish Story')
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

