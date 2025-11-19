'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { SearchBar } from './SearchBar'
import { LinkRenderer } from '@/components/ui/LinkRenderer'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { useTranslation } from '@/hooks/useTranslation'
import { logError } from '@/lib/logger'
import type { Story, Profile } from '@/types'

interface SearchPageClientProps {
  query: string
  type: string
  sortBy: string
  page: number
}

interface SearchResult {
  stories: Story[]
  users: Profile[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export function SearchPageClient({ query: initialQuery, type: initialType, sortBy: initialSortBy, page: initialPage }: SearchPageClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t } = useTranslation()
  
  const [query, setQuery] = useState(initialQuery)
  const [type, setType] = useState<'all' | 'stories' | 'users'>(initialType as 'all' | 'stories' | 'users')
  const [sortBy, setSortBy] = useState<'relevance' | 'date' | 'popularity'>(initialSortBy as 'relevance' | 'date' | 'popularity')
  const [page, setPage] = useState(initialPage)
  const [results, setResults] = useState<SearchResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const fetchResults = useCallback(async (pageNum: number = 1, append: boolean = false) => {
    if (!query.trim()) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        q: query.trim(),
        type,
        sortBy,
        page: pageNum.toString(),
        limit: '20',
      })

      const response = await fetch(`/api/search?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch search results')
      }

      const data = await response.json()
      
      if (append) {
        // Append new results to existing ones
        setResults((prevResults) => {
          if (!prevResults) return data
          return {
            stories: [...prevResults.stories, ...(data.stories || [])],
            users: [...prevResults.users, ...(data.users || [])],
            pagination: data.pagination,
          }
        })
      } else {
        setResults(data)
      }
      
      // Check if there are more results
      setHasMore(pageNum < data.pagination.totalPages)
    } catch (err: any) {
      logError('Error fetching search results', err)
      setError(err.message || 'Failed to load search results')
    } finally {
      setLoading(false)
    }
  }, [query, type, sortBy])

  // Initial fetch
  useEffect(() => {
    fetchResults(1, false)
    setPage(1)
  }, [query, type, sortBy, fetchResults])

  // Infinite scroll with Intersection Observer
  useEffect(() => {
    if (!sentinelRef.current || !hasMore || loading) return

    const sentinel = sentinelRef.current

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          const nextPage = page + 1
          setPage(nextPage)
          fetchResults(nextPage, true)
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(sentinel)

    return () => {
      observer.disconnect()
    }
  }, [hasMore, loading, page, fetchResults])

  const handleSearch = (newQuery: string) => {
    setQuery(newQuery)
    setPage(1)
    // Update URL
    const params = new URLSearchParams({
      q: newQuery,
      type,
      sortBy,
    })
    router.push(`/search?${params.toString()}`)
  }

  const handleTypeChange = (newType: 'all' | 'stories' | 'users') => {
    setType(newType)
    setPage(1)
    const params = new URLSearchParams({
      q: query,
      type: newType,
      sortBy,
    })
    router.push(`/search?${params.toString()}`)
  }

  const handleSortChange = (newSortBy: 'relevance' | 'date' | 'popularity') => {
    setSortBy(newSortBy)
    setPage(1)
    const params = new URLSearchParams({
      q: query,
      type,
      sortBy: newSortBy,
    })
    router.push(`/search?${params.toString()}`)
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
    const params = new URLSearchParams({
      q: query,
      type,
      sortBy,
      page: newPage.toString(),
    })
    router.push(`/search?${params.toString()}`)
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Search Bar */}
        <div className="mb-6">
          <SearchBar
            placeholder="Search stories and users..."
            onSearch={handleSearch}
            className="max-w-2xl mx-auto"
          />
        </div>

        {/* Filters */}
        {query && (
          <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-wrap gap-3">
              <Button
                variant={type === 'all' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => handleTypeChange('all')}
              >
                All
              </Button>
              <Button
                variant={type === 'stories' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => handleTypeChange('stories')}
              >
                Stories
              </Button>
              <Button
                variant={type === 'users' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => handleTypeChange('users')}
              >
                Users
              </Button>
            </div>

            <Select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value as 'relevance' | 'date' | 'popularity')}
              className="w-full sm:w-auto"
            >
              <option value="relevance">Relevance</option>
              <option value="date">Newest</option>
              <option value="popularity">Most Popular</option>
            </Select>
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Spinner size="lg" />
          </div>
        ) : error ? (
          <ErrorState
            title="Error loading results"
            message={error}
            onRetry={fetchResults}
          />
        ) : results ? (
          <>
            {/* Results Count */}
            {results.pagination.total > 0 && (
              <div className="mb-4 text-sm text-gray-400">
                Found {results.pagination.total} result{results.pagination.total !== 1 ? 's' : ''} for &quot;{query}&quot;
              </div>
            )}

            {/* Stories Results */}
            {type === 'all' || type === 'stories' ? (
              <div className="mb-8">
                {results.stories.length > 0 ? (
                  <>
                    {type === 'all' && (
                      <h2 className="text-lg font-semibold text-white mb-4">Stories</h2>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {results.stories.map((story) => (
                        <Link
                          key={story.id}
                          href={`/story/${story.id}`}
                          className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 overflow-hidden hover:border-brand-cyan transition-colors"
                        >
                          {story.media_url && (
                            <div className="aspect-[9/16] relative bg-gray-800">
                              <Image
                                src={story.media_url}
                                alt={story.title}
                                fill
                                className="object-cover"
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                quality={85}
                                loading="lazy"
                                unoptimized={story.media_url.includes('supabase.co') && !story.media_url.includes('storage')}
                              />
                            </div>
                          )}
                          <div className="p-4">
                            <h3 className="font-semibold text-white mb-2 line-clamp-2">
                              {story.title}
                            </h3>
                            {story.description && (
                              <p className="text-sm text-gray-400 line-clamp-2 mb-2">
                                <LinkRenderer text={story.description} showExternalIcon={true} />
                              </p>
                            )}
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span>👁️ {story.views_count || 0}</span>
                              <span>❤️ {story.likes_count || 0}</span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </>
                ) : type === 'stories' && (
                  <EmptyState
                    icon="📖"
                    title="No stories found"
                    description={`No stories match &quot;${query}&quot;`}
                  />
                )}
              </div>
            ) : null}

            {/* Users Results */}
            {type === 'all' || type === 'users' ? (
              <div className="mb-8">
                {results.users.length > 0 ? (
                  <>
                    {type === 'all' && (
                      <h2 className="text-lg font-semibold text-white mb-4">Users</h2>
                    )}
                    <div className="space-y-3">
                      {results.users.map((user) => (
                        <Link
                          key={user.id}
                          href={`/profile/${user.id}`}
                          className="flex items-center gap-4 p-4 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 hover:border-brand-cyan transition-colors"
                        >
                          {user.avatar_url ? (
                            <Image
                              src={user.avatar_url}
                              alt={user.username || 'User'}
                              width={48}
                              height={48}
                              className="rounded-full object-cover"
                              style={{ width: 'auto', height: 'auto' }}
                              unoptimized
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-brand flex items-center justify-center text-white font-semibold">
                              {user.username?.charAt(0).toUpperCase() || 'U'}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-white truncate">
                              {user.username || 'Unknown'}
                            </h3>
                            {user.bio && (
                              <p className="text-sm text-gray-400 line-clamp-1">
                                {user.bio}
                              </p>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </>
                ) : type === 'users' && (
                  <EmptyState
                    icon="👤"
                    title="No users found"
                    description={`No users match &quot;${query}&quot;`}
                  />
                )}
              </div>
            ) : null}

            {/* No Results */}
            {results.pagination.total === 0 && (
              <EmptyState
                icon="🔍"
                title="No results found"
                description={`No results match &quot;${query}&quot;. Try different keywords.`}
              />
            )}

            {/* Infinite Scroll Sentinel */}
            {hasMore && (
              <div ref={sentinelRef} className="h-10 flex justify-center items-center py-4">
                {loading && <Spinner size="md" />}
              </div>
            )}
            
            {/* End of Results */}
            {!hasMore && results.pagination.total > 0 && (
              <div className="text-center text-gray-400 text-sm py-4">
                {t('search.endOfResults') || 'End of results'}
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  )
}

