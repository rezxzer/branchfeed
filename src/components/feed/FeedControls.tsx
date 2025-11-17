'use client'

import { useTranslation } from '@/hooks/useTranslation'

type SortType = 'recent' | 'popular' | 'trending'
type TimeRange = '24h' | '7d' | '30d' | 'all'

interface FeedControlsProps {
  sortBy: SortType
  onSortChange: (sort: SortType) => void
  timeRange?: TimeRange
  onTimeRangeChange?: (range: TimeRange) => void
}

export function FeedControls({ 
  sortBy, 
  onSortChange, 
  timeRange = '7d',
  onTimeRangeChange 
}: FeedControlsProps) {
  const { t } = useTranslation()
  const showTimeRange = sortBy === 'trending' && onTimeRangeChange

  return (
    <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
      <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
        <span className="text-xs sm:text-sm font-medium text-gray-300 whitespace-nowrap">
          {t('feed.sortBy')}:
        </span>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as SortType)}
          className="flex-1 sm:flex-none px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan transition-all ease-smooth"
        >
          <option value="recent">{t('feed.sort.recent')}</option>
          <option value="popular">{t('feed.sort.popular')}</option>
          <option value="trending">{t('feed.sort.trending')}</option>
        </select>
        {showTimeRange && (
          <>
            <span className="text-xs sm:text-sm font-medium text-gray-300 whitespace-nowrap">
              Time:
            </span>
            <select
              value={timeRange}
              onChange={(e) => onTimeRangeChange?.(e.target.value as TimeRange)}
              className="flex-1 sm:flex-none px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan transition-all ease-smooth"
            >
              <option value="24h">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="all">All time</option>
            </select>
          </>
        )}
      </div>
    </div>
  )
}

