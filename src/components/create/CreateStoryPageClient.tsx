'use client'

import { useState } from 'react'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { useRouter } from 'next/navigation'
import { useTranslation } from '@/hooks/useTranslation'
import { useToast } from '@/components/ui/toast'
import { RootStoryForm } from './RootStoryForm'
import { BranchNodesForm } from './BranchNodesForm'
import { StoryPreview } from './StoryPreview'
import { Progress } from '@/components/ui/Progress'
import { useCreateStory } from '@/hooks/useCreateStory'
import type { RootStoryData, BranchNodeData } from '@/types/create'

type Step = 'root' | 'branches' | 'preview'

export function CreateStoryPageClient() {
  const router = useRouter()
  const { t } = useTranslation()
  const { showToast } = useToast()
  const [step, setStep] = useState<Step>('root')
  const [rootStory, setRootStory] = useState<RootStoryData | null>(null)
  const [branchNodes, setBranchNodes] = useState<BranchNodeData[]>([])

  const { createStory, loading, error, uploadProgress } = useCreateStory()

  const handleRootSubmit = (data: RootStoryData) => {
    setRootStory(data)
    setStep('branches')
  }

  const handleBranchesSubmit = (nodes: BranchNodeData[]) => {
    setBranchNodes(nodes)
    setStep('preview')
  }

  const handleBack = () => {
    if (step === 'preview') {
      setStep('branches')
    } else if (step === 'branches') {
      setStep('root')
    }
  }

  const handlePublish = async () => {
    if (!rootStory || branchNodes.length === 0) return

    try {
      const storyId = await createStory({
        root: rootStory,
        nodes: branchNodes,
      })

      // Show success toast
      showToast(
        t('createStory.success.message') || 'Story created successfully!',
        'success',
        3000
      )

      // Redirect to new story page after a short delay to show toast
      setTimeout(() => {
        router.push(`/story/${storyId}`)
      }, 500)
    } catch (err) {
      console.error('Failed to publish story:', err)
      // Error is already handled by useCreateStory hook and displayed in UI
    }
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8">
          {t('createStory.title')}
        </h1>

        {/* Step Indicator */}
        <div className="mb-6 sm:mb-8 flex items-center justify-center gap-2 sm:gap-4 overflow-x-auto pb-2">
          <div
            className={`flex items-center gap-1.5 sm:gap-2 flex-shrink-0 ${
              step === 'root' ? 'text-brand-cyan' : 'text-gray-400'
            }`}
          >
            <div
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-semibold text-xs sm:text-sm ${
                step === 'root'
                  ? 'bg-brand-cyan text-gray-900'
                  : 'bg-gray-700 text-gray-300'
              }`}
            >
              1
            </div>
            <span className="text-xs sm:text-sm font-medium whitespace-nowrap">{t('createStory.steps.root')}</span>
          </div>
          <div className="w-8 sm:w-12 h-0.5 bg-gray-700 flex-shrink-0" />
          <div
            className={`flex items-center gap-1.5 sm:gap-2 flex-shrink-0 ${
              step === 'branches' ? 'text-brand-cyan' : 'text-gray-400'
            }`}
          >
            <div
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-semibold text-xs sm:text-sm ${
                step === 'branches'
                  ? 'bg-brand-cyan text-gray-900'
                  : 'bg-gray-700 text-gray-300'
              }`}
            >
              2
            </div>
            <span className="text-xs sm:text-sm font-medium whitespace-nowrap">{t('createStory.steps.branches')}</span>
          </div>
          <div className="w-8 sm:w-12 h-0.5 bg-gray-700 flex-shrink-0" />
          <div
            className={`flex items-center gap-1.5 sm:gap-2 flex-shrink-0 ${
              step === 'preview' ? 'text-brand-cyan' : 'text-gray-400'
            }`}
          >
            <div
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-semibold text-xs sm:text-sm ${
                step === 'preview'
                  ? 'bg-brand-cyan text-gray-900'
                  : 'bg-gray-700 text-gray-300'
              }`}
            >
              3
            </div>
            <span className="text-xs sm:text-sm font-medium whitespace-nowrap">{t('createStory.steps.preview')}</span>
          </div>
        </div>

        {/* Forms */}
        {step === 'root' && (
          <RootStoryForm onSubmit={handleRootSubmit} initialData={rootStory} />
        )}

        {step === 'branches' && rootStory && (
          <BranchNodesForm
            onSubmit={handleBranchesSubmit}
            initialNodes={branchNodes}
            maxDepth={5}
            onBack={handleBack}
          />
        )}

        {step === 'preview' && rootStory && branchNodes.length > 0 && (
          <StoryPreview
            rootStory={rootStory}
            nodes={branchNodes}
            onPublish={handlePublish}
            onBack={handleBack}
            loading={loading}
            error={error}
          />
        )}

        {/* Upload Progress */}
        {uploadProgress && (
          <div className="mt-6 p-4 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50">
            <div className="mb-2">
              <p className="text-sm font-medium text-gray-300 mb-2">
                {uploadProgress.message}
              </p>
              <Progress
                value={uploadProgress.progress}
                variant={
                  uploadProgress.stage === 'complete'
                    ? 'success'
                    : uploadProgress.stage === 'uploading'
                    ? 'default'
                    : 'default'
                }
                size="md"
                showLabel={true}
              />
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <div className="flex items-start gap-3">
              <span className="text-red-400 text-lg">⚠️</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-400 mb-1">
                  {t('createStory.errors.publishFailed') || 'Failed to create story'}
                </p>
                <p className="text-sm text-red-300 whitespace-pre-line">
                  {error.message || 'An unexpected error occurred. Please try again.'}
                </p>
                {(error as any).limitExceeded && (
                  <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <p className="text-sm text-yellow-300 mb-2">
                      <strong>Subscription Limit Reached</strong>
                    </p>
                    {(error as any).remaining !== undefined && (error as any).remaining !== -1 && (
                      <p className="text-xs text-yellow-200/80">
                        Remaining: {(error as any).remaining}
                      </p>
                    )}
                    {(error as any).maxBranches !== undefined && (
                      <p className="text-xs text-yellow-200/80">
                        Maximum branches per story: {(error as any).maxBranches}
                      </p>
                    )}
                    <p className="text-xs text-yellow-200/80 mt-2">
                      Upgrade your subscription to increase limits or wait for the limit to reset.
                    </p>
                    <button
                      onClick={() => router.push('/settings?tab=subscription')}
                      className="mt-2 px-3 py-1.5 text-xs font-semibold bg-yellow-500/20 text-yellow-300 rounded-lg hover:bg-yellow-500/30 transition-colors"
                    >
                      View Subscription Plans
                    </button>
                  </div>
                )}
                {error.message?.includes('Bucket not found') && (
                  <p className="text-xs text-red-200/80 mt-2">
                    Tip: Make sure the storage bucket is created in Supabase Dashboard.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </ErrorBoundary>
  )
}

