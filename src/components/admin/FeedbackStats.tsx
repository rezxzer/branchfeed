'use client'

import { useTranslation } from '@/hooks/useTranslation'
import { Card } from '@/components/ui/Card'

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

interface FeedbackStatsProps {
  stats: FeedbackStats
}

export function FeedbackStats({ stats }: FeedbackStatsProps) {
  const { t } = useTranslation()

  const cards = [
    {
      title: t('admin.feedback.stats.total') || 'Total Feedback',
      value: stats.total,
      icon: '💬',
      color: 'blue',
    },
    {
      title: t('admin.feedback.stats.pending') || 'Pending',
      value: stats.pending,
      icon: '⏳',
      color: 'yellow',
    },
    {
      title: t('admin.feedback.stats.resolved') || 'Resolved',
      value: stats.status.resolved,
      icon: '✅',
      color: 'green',
    },
    {
      title: t('admin.feedback.stats.averageRating') || 'Avg Rating',
      value: stats.averageRating ? `${stats.averageRating.toFixed(1)} ⭐` : 'N/A',
      icon: '⭐',
      color: 'purple',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {cards.map((card) => (
        <div
          key={card.title}
          className="bg-gray-800/80 backdrop-blur-lg rounded-2xl border border-gray-600/50 shadow-level-1 p-6 hover:shadow-level-2 hover:border-brand-cyan/30 transition-all"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-300 mb-1">{card.title}</p>
              <p className="text-3xl font-bold text-white">
                {typeof card.value === 'number' ? card.value.toLocaleString() : card.value}
              </p>
            </div>
            <div className="text-4xl">{card.icon}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

