'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useTranslation } from '@/hooks/useTranslation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Skeleton } from '@/components/ui/Skeleton'
import { Spinner } from '@/components/ui/Spinner'
import { X, Calendar, User, Hash } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Profile, Tag } from '@/types'

export interface AdvancedFiltersState {
  dateRange: {
    type: 'all' | '24h' | '7d' | '30d' | 'custom'
    startDate?: string
    endDate?: string
  }
  authorId?: string
  authorName?: string
  tagIds: string[]
  tagNames: string[]
}

interface AdvancedFiltersProps {
  /** Current filter state */
  filters: AdvancedFiltersState
  /** Callback when filters change */
  onFiltersChange: (filters: AdvancedFiltersState) => void
  /** Available tags for selection */
  availableTags?: Tag[]
  /** Whether filters panel is open */
  isOpen: boolean
  /** Callback to toggle filters panel */
  onToggle: () => void
}

/**
 * Advanced Filters component for Feed Page
 * Provides date range, author, and hashtag filtering
 */
export function AdvancedFilters({
  filters,
  onFiltersChange,
  availableTags = [],
  isOpen,
  onToggle,
}: AdvancedFiltersProps) {
  const { t } = useTranslation()
  const [authorSearchQuery, setAuthorSearchQuery] = useState('')
  const [authorSearchResults, setAuthorSearchResults] = useState<Profile[]>([])
  const [authorSearchLoading, setAuthorSearchLoading] = useState(false)
  const [showAuthorDropdown, setShowAuthorDropdown] = useState(false)

  // Search authors
  useEffect(() => {
    if (!authorSearchQuery.trim() || authorSearchQuery.length < 2) {
      setAuthorSearchResults([])
      setShowAuthorDropdown(false)
      return
    }

    const searchAuthors = async () => {
      setAuthorSearchLoading(true)
      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(authorSearchQuery)}&type=users&limit=5`
        )
        if (response.ok) {
          const data = await response.json()
          setAuthorSearchResults(data.users || [])
          setShowAuthorDropdown(true)
        }
      } catch (error) {
        console.error('Error searching authors:', error)
        setAuthorSearchResults([])
      } finally {
        setAuthorSearchLoading(false)
      }
    }

    const debounceTimer = setTimeout(searchAuthors, 300)
    return () => clearTimeout(debounceTimer)
  }, [authorSearchQuery])

  const handleDateRangeChange = (type: 'all' | '24h' | '7d' | '30d' | 'custom') => {
    onFiltersChange({
      ...filters,
      dateRange: {
        type,
        startDate: type === 'custom' ? filters.dateRange.startDate : undefined,
        endDate: type === 'custom' ? filters.dateRange.endDate : undefined,
      },
    })
  }

  const handleCustomDateChange = (field: 'startDate' | 'endDate', value: string) => {
    onFiltersChange({
      ...filters,
      dateRange: {
        ...filters.dateRange,
        type: 'custom',
        [field]: value,
      },
    })
  }

  const handleAuthorSelect = (author: Profile) => {
    onFiltersChange({
      ...filters,
      authorId: author.id,
      authorName: author.username,
    })
    setAuthorSearchQuery('')
    setShowAuthorDropdown(false)
  }

  const handleAuthorClear = () => {
    onFiltersChange({
      ...filters,
      authorId: undefined,
      authorName: undefined,
    })
    setAuthorSearchQuery('')
    setShowAuthorDropdown(false)
  }

  const handleTagToggle = (tag: Tag) => {
    const isSelected = filters.tagIds.includes(tag.id)
    onFiltersChange({
      ...filters,
      tagIds: isSelected
        ? filters.tagIds.filter((id) => id !== tag.id)
        : [...filters.tagIds, tag.id],
      tagNames: isSelected
        ? filters.tagNames.filter((name) => name !== tag.name)
        : [...filters.tagNames, tag.name],
    })
  }

  const handleClearAll = () => {
    onFiltersChange({
      dateRange: { type: 'all' },
      tagIds: [],
      tagNames: [],
    })
    setAuthorSearchQuery('')
    setShowAuthorDropdown(false)
  }

  const hasActiveFilters =
    filters.dateRange.type !== 'all' ||
    filters.authorId ||
    filters.tagIds.length > 0

  if (!isOpen) {
    return (
      <div className="mb-4 sm:mb-6">
        <Button
          onClick={onToggle}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <Hash className="w-4 h-4" />
          {t('feed.filters.advanced') || 'Advanced Filters'}
          {hasActiveFilters && (
            <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-brand-cyan text-gray-900">
              {[filters.dateRange.type !== 'all' ? 1 : 0, filters.authorId ? 1 : 0, filters.tagIds.length]
                .reduce((a, b) => a + b, 0)}
            </span>
          )}
        </Button>
      </div>
    )
  }

  return (
    <div className="mb-4 sm:mb-6 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Hash className="w-5 h-5" />
          {t('feed.filters.advanced') || 'Advanced Filters'}
        </h3>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <Button
              onClick={handleClearAll}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
            >
              {t('feed.filters.clearAll') || 'Clear All'}
            </Button>
          )}
          <Button
            onClick={onToggle}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {/* Date Range Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {t('feed.filters.dateRange') || 'Date Range'}
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <Select
              value={filters.dateRange.type}
              onChange={(e) =>
                handleDateRangeChange(e.target.value as 'all' | '24h' | '7d' | '30d' | 'custom')
              }
              className="flex-1"
            >
              <option value="all">{t('feed.filters.dateRange.all') || 'All Time'}</option>
              <option value="24h">{t('feed.filters.dateRange.last24h') || 'Last 24 Hours'}</option>
              <option value="7d">{t('feed.filters.dateRange.last7d') || 'Last 7 Days'}</option>
              <option value="30d">{t('feed.filters.dateRange.last30d') || 'Last 30 Days'}</option>
              <option value="custom">{t('feed.filters.dateRange.custom') || 'Custom Range'}</option>
            </Select>
            {filters.dateRange.type === 'custom' && (
              <div className="flex gap-2 flex-1">
                <Input
                  type="date"
                  value={filters.dateRange.startDate || ''}
                  onChange={(e) => handleCustomDateChange('startDate', e.target.value)}
                  className="flex-1"
                  placeholder={t('feed.filters.dateRange.startDate') || 'Start'}
                />
                <Input
                  type="date"
                  value={filters.dateRange.endDate || ''}
                  onChange={(e) => handleCustomDateChange('endDate', e.target.value)}
                  className="flex-1"
                  placeholder={t('feed.filters.dateRange.endDate') || 'End'}
                />
              </div>
            )}
          </div>
        </div>

        {/* Author Filter */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
            <User className="w-4 h-4" />
            {t('feed.filters.author') || 'Author'}
          </label>
          <div className="relative">
            {filters.authorId ? (
              <div className="flex items-center gap-2 p-2 bg-gray-700/50 rounded-lg">
                <span className="text-white text-sm flex-1">{filters.authorName}</span>
                <Button
                  onClick={handleAuthorClear}
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ) : (
              <>
                <Input
                  type="text"
                  value={authorSearchQuery}
                  onChange={(e) => setAuthorSearchQuery(e.target.value)}
                  placeholder={t('feed.filters.authorPlaceholder') || 'Search by author name...'}
                  className="w-full"
                  onFocus={() => {
                    if (authorSearchResults.length > 0) {
                      setShowAuthorDropdown(true)
                    }
                  }}
                />
                {authorSearchLoading && (
                  <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-level-2 p-4">
                    <div className="flex items-center gap-2">
                      <Spinner size="sm" />
                      <span className="text-gray-400 text-sm">
                        {t('feed.filters.searching') || 'Searching...'}
                      </span>
                    </div>
                  </div>
                )}
                {showAuthorDropdown && authorSearchResults.length > 0 && !authorSearchLoading && (
                  <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-level-2 max-h-48 overflow-y-auto">
                    {authorSearchResults.map((author) => (
                      <button
                        key={author.id}
                        onClick={() => handleAuthorSelect(author)}
                        className="w-full px-4 py-2 text-left hover:bg-gray-700 transition-colors flex items-center gap-2"
                      >
                        {author.avatar_url ? (
                          <Image
                            src={author.avatar_url}
                            alt={author.username || ''}
                            width={24}
                            height={24}
                            className="w-6 h-6 rounded-full"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-xs text-gray-400">
                            {author.username?.[0]?.toUpperCase() || '?'}
                          </div>
                        )}
                        <span className="text-white text-sm">{author.username}</span>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Tags Filter */}
        {availableTags.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
              <Hash className="w-4 h-4" />
              {t('feed.filters.tags') || 'Tags'}
            </label>
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => {
                const isSelected = filters.tagIds.includes(tag.id)
                return (
                  <button
                    key={tag.id}
                    onClick={() => handleTagToggle(tag)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                      isSelected
                        ? 'bg-brand-cyan text-gray-900'
                        : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
                    )}
                    style={
                      isSelected && tag.color
                        ? {
                            backgroundColor: tag.color,
                            color: '#fff',
                          }
                        : undefined
                    }
                  >
                    #{tag.name}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

