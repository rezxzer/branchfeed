'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Input } from '@/components/ui/Input'
import { Spinner } from '@/components/ui/Spinner'
import { Card } from '@/components/ui/Card'
import { AdminHeader } from './AdminHeader'
import { AdminSidebar } from './AdminSidebar'
import { FeedbackList } from './FeedbackList'
import { FeedbackStats } from './FeedbackStats'
import { logError } from '@/lib/logger'

interface Feedback {
  id: string
  user_id: string | null
  feedback_type: 'bug' | 'feature' | 'improvement' | 'general' | 'other'
  category: string | null
  title: string
  description: string
  rating: number | null
  status: 'pending' | 'reviewed' | 'in_progress' | 'resolved' | 'dismissed'
  priority: 'low' | 'medium' | 'high' | 'critical'
  admin_notes: string | null
  resolved_at: string | null
  created_at: string
  updated_at: string
  profiles?: {
    id: string
    username: string | null
    avatar_url: string | null
  } | null
}

interface FeedbackStats {
  total: number
  pending: number
  status: {
    pending: number
    reviewed: number
    in_progress: number
    resolved: number
    dismissed: number
  }
  type: {
    bug: number
    feature: number
    improvement: number
    general: number
    other: number
  }
  priority: {
    low: number
    medium: number
    high: number
    critical: number
  }
  averageRating: number | null
}

export function FeedbackManagementClient() {
  const { t } = useTranslation()
  const [feedback, setFeedback] = useState<Feedback[]>([])
  const [stats, setStats] = useState<FeedbackStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [priorityFilter, setPriorityFilter] = useState<string>('')
  const [categoryFilter, setCategoryFilter] = useState<string>('')

  const limit = 20

  const fetchFeedback = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: ((page - 1) * limit).toString(),
      })

      if (statusFilter) params.append('status', statusFilter)
      if (typeFilter) params.append('type', typeFilter)
      if (priorityFilter) params.append('priority', priorityFilter)
      if (categoryFilter) params.append('category', categoryFilter)

      const response = await fetch(`/api/admin/feedback?${params.toString()}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch feedback')
      }

      setFeedback(data.feedback || [])
      setTotalPages(data.pagination?.totalPages || 1)
    } catch (err: any) {
      logError('Error fetching feedback', err)
      setError(err.message || 'Failed to load feedback')
    } finally {
      setLoading(false)
    }
  }, [page, limit, statusFilter, typeFilter, priorityFilter, categoryFilter])

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/feedback/stats')
      const data = await response.json()

      if (response.ok) {
        setStats(data)
      }
    } catch (err: any) {
      logError('Error fetching feedback stats', err)
    }
  }, [])

  useEffect(() => {
    fetchFeedback()
    fetchStats()
  }, [fetchFeedback, fetchStats])

  const handleUpdateFeedback = async (id: string, updates: Partial<Feedback>) => {
    try {
      const response = await fetch('/api/admin/feedback', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          ...updates,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update feedback')
      }

      // Refresh feedback list
      await fetchFeedback()
      await fetchStats()
    } catch (err: any) {
      logError('Error updating feedback', err)
      throw err
    }
  }

  const clearFilters = () => {
    setStatusFilter('')
    setTypeFilter('')
    setPriorityFilter('')
    setCategoryFilter('')
    setPage(1)
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <AdminHeader />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            {t('admin.feedback.title') || 'User Feedback Management'}
          </h1>
          <p className="text-gray-400">
            {t('admin.feedback.description') || 'Manage and analyze user feedback submissions.'}
          </p>
        </div>

        {/* Stats */}
        {stats && <FeedbackStats stats={stats} />}

        {/* Filters */}
        <div className="bg-gray-800/80 backdrop-blur-lg rounded-2xl border border-gray-600/50 shadow-level-1 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                {t('admin.feedback.filters.status') || 'Status'}
              </label>
              <Select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setPage(1)
                }}
              >
                <option value="">{t('common.all') || 'All'}</option>
                <option value="pending">{t('admin.feedback.status.pending') || 'Pending'}</option>
                <option value="reviewed">{t('admin.feedback.status.reviewed') || 'Reviewed'}</option>
                <option value="in_progress">{t('admin.feedback.status.in_progress') || 'In Progress'}</option>
                <option value="resolved">{t('admin.feedback.status.resolved') || 'Resolved'}</option>
                <option value="dismissed">{t('admin.feedback.status.dismissed') || 'Dismissed'}</option>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                {t('admin.feedback.filters.type') || 'Type'}
              </label>
              <Select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value)
                  setPage(1)
                }}
              >
                <option value="">{t('common.all') || 'All'}</option>
                <option value="bug">{t('feedback.types.bug') || 'Bug Report'}</option>
                <option value="feature">{t('feedback.types.feature') || 'Feature Request'}</option>
                <option value="improvement">{t('feedback.types.improvement') || 'Improvement'}</option>
                <option value="general">{t('feedback.types.general') || 'General Feedback'}</option>
                <option value="other">{t('feedback.types.other') || 'Other'}</option>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                {t('admin.feedback.filters.priority') || 'Priority'}
              </label>
              <Select
                value={priorityFilter}
                onChange={(e) => {
                  setPriorityFilter(e.target.value)
                  setPage(1)
                }}
              >
                <option value="">{t('common.all') || 'All'}</option>
                <option value="low">{t('admin.feedback.priority.low') || 'Low'}</option>
                <option value="medium">{t('admin.feedback.priority.medium') || 'Medium'}</option>
                <option value="high">{t('admin.feedback.priority.high') || 'High'}</option>
                <option value="critical">{t('admin.feedback.priority.critical') || 'Critical'}</option>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                {t('admin.feedback.filters.category') || 'Category'}
              </label>
              <Input
                type="text"
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value)
                  setPage(1)
                }}
                placeholder={t('admin.feedback.filters.categoryPlaceholder') || 'Filter by category...'}
              />
            </div>
          </div>

          {(statusFilter || typeFilter || priorityFilter || categoryFilter) && (
            <div className="mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
              >
                {t('common.clearFilters') || 'Clear Filters'}
              </Button>
            </div>
          )}
        </div>

        {/* Feedback List */}
        {error && (
          <div className="bg-gray-800/80 backdrop-blur-lg rounded-2xl border border-red-500/50 shadow-level-1 p-6 mb-6">
            <div className="text-red-400">{error}</div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Spinner size="lg" />
          </div>
        ) : (
          <>
            <FeedbackList
              feedback={feedback}
              onUpdate={handleUpdateFeedback}
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  {t('common.previous') || 'Previous'}
                </Button>
                <span className="text-gray-400">
                  {t('common.page') || 'Page'} {page} {t('common.of') || 'of'} {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  {t('common.next') || 'Next'}
                </Button>
              </div>
            )}
          </>
        )}
        </main>
      </div>
    </div>
  )
}

