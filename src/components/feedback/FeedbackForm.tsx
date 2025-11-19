'use client'

import { useState } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Spinner } from '@/components/ui/Spinner'
import { logError } from '@/lib/logger'

interface FeedbackFormProps {
  onSuccess?: () => void
  onCancel?: () => void
  defaultType?: 'bug' | 'feature' | 'improvement' | 'general' | 'other'
  defaultCategory?: string
}

export function FeedbackForm({
  onSuccess,
  onCancel,
  defaultType = 'general',
  defaultCategory,
}: FeedbackFormProps) {
  const { t } = useTranslation()
  const { isAuthenticated } = useAuth()
  
  const [feedbackType, setFeedbackType] = useState<'bug' | 'feature' | 'improvement' | 'general' | 'other'>(defaultType)
  const [category, setCategory] = useState(defaultCategory || '')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [rating, setRating] = useState<number | undefined>(undefined)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          feedbackType,
          category: category.trim() || undefined,
          title: title.trim(),
          description: description.trim(),
          rating: rating || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit feedback')
      }

      setSuccess(true)
      
      // Reset form
      setTitle('')
      setDescription('')
      setCategory('')
      setRating(undefined)
      
      // Call success callback
      setTimeout(() => {
        onSuccess?.()
        setSuccess(false)
      }, 2000)
    } catch (err: any) {
      logError('Error submitting feedback', err)
      setError(err.message || 'Failed to submit feedback. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="bg-green-500/10 border border-green-500/50 rounded-xl p-6 text-center">
        <div className="text-4xl mb-2">✅</div>
        <h3 className="text-lg font-semibold text-green-400 mb-2">
          {t('feedback.success.title') || 'Thank you!'}
        </h3>
        <p className="text-sm text-gray-300">
          {t('feedback.success.message') || 'Your feedback has been submitted successfully.'}
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Feedback Type */}
      <div>
        <label htmlFor="feedback-type" className="block text-sm font-medium text-gray-300 mb-2">
          {t('feedback.form.type') || 'Type'}
          <span className="text-red-400 ml-1">*</span>
        </label>
        <Select
          id="feedback-type"
          value={feedbackType}
          onChange={(e) => setFeedbackType(e.target.value as typeof feedbackType)}
          required
        >
          <option value="bug">{t('feedback.types.bug') || 'Bug Report'}</option>
          <option value="feature">{t('feedback.types.feature') || 'Feature Request'}</option>
          <option value="improvement">{t('feedback.types.improvement') || 'Improvement'}</option>
          <option value="general">{t('feedback.types.general') || 'General Feedback'}</option>
          <option value="other">{t('feedback.types.other') || 'Other'}</option>
        </Select>
      </div>

      {/* Category (Optional) */}
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-2">
          {t('feedback.form.category') || 'Category'} ({t('common.optional') || 'Optional'})
        </label>
        <Input
          id="category"
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder={t('feedback.form.categoryPlaceholder') || 'e.g., Feed, Story, Profile, Search'}
          maxLength={50}
        />
      </div>

      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
          {t('feedback.form.title') || 'Title'}
          <span className="text-red-400 ml-1">*</span>
        </label>
        <Input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t('feedback.form.titlePlaceholder') || 'Brief summary of your feedback'}
          required
          maxLength={200}
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
          {t('feedback.form.description') || 'Description'}
          <span className="text-red-400 ml-1">*</span>
        </label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t('feedback.form.descriptionPlaceholder') || 'Please provide detailed information...'}
          rows={6}
          required
          maxLength={2000}
        />
        <p className="text-xs text-gray-400 mt-1">
          {description.length} / 2000 {t('common.characters') || 'characters'}
        </p>
      </div>

      {/* Rating (Optional) */}
      <div>
        <label htmlFor="rating" className="block text-sm font-medium text-gray-300 mb-2">
          {t('feedback.form.rating') || 'Rating'} ({t('common.optional') || 'Optional'})
        </label>
        <Select
          id="rating"
          value={rating?.toString() || ''}
          onChange={(e) => setRating(e.target.value ? parseInt(e.target.value, 10) : undefined)}
        >
          <option value="">{t('feedback.form.noRating') || 'No rating'}</option>
          <option value="5">⭐⭐⭐⭐⭐ {t('feedback.ratings.excellent') || 'Excellent'}</option>
          <option value="4">⭐⭐⭐⭐ {t('feedback.ratings.good') || 'Good'}</option>
          <option value="3">⭐⭐⭐ {t('feedback.ratings.average') || 'Average'}</option>
          <option value="2">⭐⭐ {t('feedback.ratings.poor') || 'Poor'}</option>
          <option value="1">⭐ {t('feedback.ratings.veryPoor') || 'Very Poor'}</option>
        </Select>
      </div>

      {/* Submit Buttons */}
      <div className="flex gap-3">
        <Button
          type="submit"
          variant="primary"
          disabled={loading || !title.trim() || !description.trim()}
          className="flex-1"
        >
          {loading ? (
            <>
              <Spinner size="sm" className="mr-2" />
              {t('feedback.form.submitting') || 'Submitting...'}
            </>
          ) : (
            t('feedback.form.submit') || 'Submit Feedback'
          )}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            {t('common.cancel') || 'Cancel'}
          </Button>
        )}
      </div>

      {!isAuthenticated && (
        <p className="text-xs text-gray-400 text-center">
          {t('feedback.anonymous') || 'You can submit feedback anonymously. Sign in to track your submissions.'}
        </p>
      )}
    </form>
  )
}

