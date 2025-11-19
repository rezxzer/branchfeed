'use client'

import { useState } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { FeedbackForm } from './FeedbackForm'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface FeedbackPageClientProps {
  userId: string | null
}

export function FeedbackPageClient({ userId }: FeedbackPageClientProps) {
  const { t } = useTranslation()
  const router = useRouter()
  const [showForm, setShowForm] = useState(true)

  const handleSuccess = () => {
    // Optionally redirect or show success message
    setShowForm(false)
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            {t('feedback.title') || 'Submit Feedback'}
          </h1>
          <p className="text-gray-400">
            {t('feedback.description') || 'Help us improve BranchFeed by sharing your thoughts, reporting bugs, or suggesting new features.'}
          </p>
        </div>

        {/* Feedback Form */}
        <Card variant="default" className="p-6 sm:p-8">
          {showForm ? (
            <FeedbackForm
              onSuccess={handleSuccess}
              onCancel={() => router.back()}
            />
          ) : (
            <div className="text-center">
              <div className="text-4xl mb-4">✅</div>
              <h2 className="text-xl font-semibold text-white mb-2">
                {t('feedback.success.title') || 'Thank you!'}
              </h2>
              <p className="text-gray-400 mb-6">
                {t('feedback.success.message') || 'Your feedback has been submitted successfully.'}
              </p>
              <div className="flex gap-3 justify-center">
                <Button
                  variant="primary"
                  onClick={() => setShowForm(true)}
                >
                  {t('feedback.submitAnother') || 'Submit Another'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push('/feed')}
                >
                  {t('common.backToFeed') || 'Back to Feed'}
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Info Section */}
        <div className="mt-8 space-y-4">
          <Card variant="default" className="p-6">
            <h2 className="text-lg font-semibold text-white mb-3">
              {t('feedback.info.title') || 'What kind of feedback can I submit?'}
            </h2>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <strong className="text-brand-cyan">🐛 {t('feedback.types.bug') || 'Bug Report'}:</strong>{' '}
                {t('feedback.info.bug') || 'Report issues, errors, or unexpected behavior.'}
              </li>
              <li>
                <strong className="text-brand-cyan">✨ {t('feedback.types.feature') || 'Feature Request'}:</strong>{' '}
                {t('feedback.info.feature') || 'Suggest new features or functionality.'}
              </li>
              <li>
                <strong className="text-brand-cyan">🔧 {t('feedback.types.improvement') || 'Improvement'}:</strong>{' '}
                {t('feedback.info.improvement') || 'Share ideas to improve existing features.'}
              </li>
              <li>
                <strong className="text-brand-cyan">💬 {t('feedback.types.general') || 'General Feedback'}:</strong>{' '}
                {t('feedback.info.general') || 'Share your overall experience and thoughts.'}
              </li>
            </ul>
          </Card>

          {userId && (
            <Card variant="default" className="p-6">
              <h2 className="text-lg font-semibold text-white mb-2">
                {t('feedback.viewSubmissions') || 'View Your Submissions'}
              </h2>
              <p className="text-sm text-gray-400 mb-4">
                {t('feedback.viewSubmissionsDesc') || 'Track the status of your feedback submissions.'}
              </p>
              <Link href="/feedback/my">
                <Button variant="outline" size="sm">
                  {t('feedback.myFeedback') || 'My Feedback'}
                </Button>
              </Link>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

