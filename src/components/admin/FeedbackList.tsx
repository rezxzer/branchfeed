'use client'

import { useState } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Card } from '@/components/ui/Card'
import Image from 'next/image'
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

interface FeedbackListProps {
  feedback: Feedback[]
  onUpdate: (id: string, updates: Partial<Feedback>) => Promise<void>
}

export function FeedbackList({ feedback, onUpdate }: FeedbackListProps) {
  const { t } = useTranslation()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [status, setStatus] = useState<string>('')
  const [priority, setPriority] = useState<string>('')
  const [adminNotes, setAdminNotes] = useState<string>('')
  const [saving, setSaving] = useState(false)

  const handleEdit = (item: Feedback) => {
    setEditingId(item.id)
    setStatus(item.status)
    setPriority(item.priority)
    setAdminNotes(item.admin_notes || '')
  }

  const handleSave = async (id: string) => {
    setSaving(true)
    try {
      await onUpdate(id, {
        status: status as Feedback['status'],
        priority: priority as Feedback['priority'],
        admin_notes: adminNotes,
      })
      setEditingId(null)
    } catch (err: any) {
      logError('Error saving feedback', err)
      alert(err.message || 'Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setStatus('')
    setPriority('')
    setAdminNotes('')
  }

  const getStatusColor = (status: Feedback['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
      case 'reviewed':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50'
      case 'in_progress':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/50'
      case 'resolved':
        return 'bg-green-500/20 text-green-400 border-green-500/50'
      case 'dismissed':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/50'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/50'
    }
  }

  const getPriorityColor = (priority: Feedback['priority']) => {
    switch (priority) {
      case 'low':
        return 'bg-gray-500/20 text-gray-400'
      case 'medium':
        return 'bg-blue-500/20 text-blue-400'
      case 'high':
        return 'bg-orange-500/20 text-orange-400'
      case 'critical':
        return 'bg-red-500/20 text-red-400'
      default:
        return 'bg-gray-500/20 text-gray-400'
    }
  }

  const getTypeIcon = (type: Feedback['feedback_type']) => {
    switch (type) {
      case 'bug':
        return '🐛'
      case 'feature':
        return '✨'
      case 'improvement':
        return '🔧'
      case 'general':
        return '💬'
      case 'other':
        return '📝'
      default:
        return '📝'
    }
  }

  if (feedback.length === 0) {
    return (
      <div className="bg-gray-800/80 backdrop-blur-lg rounded-2xl border border-gray-600/50 shadow-level-1 p-12 text-center">
        <p className="text-gray-300">
          {t('admin.feedback.empty') || 'No feedback found'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {feedback.map((item) => {
        const isEditing = editingId === item.id
        return (
          <div
            key={item.id}
            className="bg-gray-800/80 backdrop-blur-lg rounded-2xl border border-gray-600/50 shadow-level-1 p-6 hover:shadow-level-2 hover:border-brand-cyan/30 transition-all"
          >
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="text-3xl">{getTypeIcon(item.feedback_type)}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                      {item.rating && (
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-400">⭐</span>
                          <span className="text-sm text-gray-300">{item.rating}/5</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(item.status)}`}>
                        {t(`admin.feedback.status.${item.status}`) || item.status}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(item.priority)}`}>
                        {t(`admin.feedback.priority.${item.priority}`) || item.priority}
                      </span>
                      {item.category && (
                        <span className="px-2 py-1 rounded text-xs font-medium bg-gray-700/50 text-gray-300">
                          {item.category}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {item.profiles && (
                    <div className="flex items-center gap-2">
                      {item.profiles.avatar_url ? (
                        <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-gray-600">
                          <Image
                            src={item.profiles.avatar_url}
                            alt={item.profiles.username || 'User'}
                            width={32}
                            height={32}
                            className="w-full h-full object-cover"
                            style={{ width: 'auto', height: 'auto' }}
                            unoptimized
                          />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-brand flex items-center justify-center text-white text-xs font-semibold">
                          {item.profiles.username?.charAt(0).toUpperCase() || 'U'}
                        </div>
                      )}
                      <span className="text-sm text-gray-300">{item.profiles.username || 'Anonymous'}</span>
                    </div>
                  )}
                  {!item.profiles && (
                    <span className="text-sm text-gray-300">{t('common.anonymous') || 'Anonymous'}</span>
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-300 whitespace-pre-wrap">{item.description}</p>

              {/* Admin Notes */}
              {item.admin_notes && !isEditing && (
                <div className="bg-gray-900/70 rounded-lg p-3 border border-gray-600/70">
                  <p className="text-xs text-gray-300 mb-1 font-medium">
                    {t('admin.feedback.adminNotes') || 'Admin Notes:'}
                  </p>
                  <p className="text-sm text-gray-200 whitespace-pre-wrap">{item.admin_notes}</p>
                </div>
              )}

              {/* Edit Form */}
              {isEditing && (
                <div className="bg-gray-900/70 rounded-lg p-4 border border-gray-600/70 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-2">
                        {t('admin.feedback.status.label') || 'Status'}
                      </label>
                      <Select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                      >
                        <option value="pending">{t('admin.feedback.status.pending') || 'Pending'}</option>
                        <option value="reviewed">{t('admin.feedback.status.reviewed') || 'Reviewed'}</option>
                        <option value="in_progress">{t('admin.feedback.status.in_progress') || 'In Progress'}</option>
                        <option value="resolved">{t('admin.feedback.status.resolved') || 'Resolved'}</option>
                        <option value="dismissed">{t('admin.feedback.status.dismissed') || 'Dismissed'}</option>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-2">
                        {t('admin.feedback.priority.label') || 'Priority'}
                      </label>
                      <Select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                      >
                        <option value="low">{t('admin.feedback.priority.low') || 'Low'}</option>
                        <option value="medium">{t('admin.feedback.priority.medium') || 'Medium'}</option>
                        <option value="high">{t('admin.feedback.priority.high') || 'High'}</option>
                        <option value="critical">{t('admin.feedback.priority.critical') || 'Critical'}</option>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">
                      {t('admin.feedback.adminNotes') || 'Admin Notes'}
                    </label>
                    <Textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      rows={3}
                      placeholder={t('admin.feedback.adminNotesPlaceholder') || 'Add internal notes...'}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleSave(item.id)}
                      disabled={saving}
                    >
                      {saving ? t('common.saving') || 'Saving...' : t('common.save') || 'Save'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancel}
                      disabled={saving}
                    >
                      {t('common.cancel') || 'Cancel'}
                    </Button>
                  </div>
                </div>
              )}

              {/* Actions */}
              {!isEditing && (
                  <div className="flex items-center justify-between pt-2 border-t border-gray-600/50">
                  <div className="text-xs text-gray-300">
                    {t('common.created') || 'Created'}: {new Date(item.created_at).toLocaleString()}
                    {item.resolved_at && (
                      <> • {t('common.resolved') || 'Resolved'}: {new Date(item.resolved_at).toLocaleString()}</>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(item)}
                  >
                    {t('common.edit') || 'Edit'}
                  </Button>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

