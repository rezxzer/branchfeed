'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getAllPaths, type PathInfo } from '@/lib/stories'
import { Spinner } from '@/components/ui/Spinner'
import { ErrorState } from '@/components/ui/ErrorState'
import { useTranslation } from '@/hooks/useTranslation'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface PathViewerProps {
  storyId: string
}

export function PathViewer({ storyId }: PathViewerProps) {
  const { t } = useTranslation()
  const router = useRouter()
  const [paths, setPaths] = useState<PathInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const loadPaths = async () => {
      try {
        setLoading(true)
        setError(null)
        const pathsData = await getAllPaths(storyId)
        setPaths(pathsData)
      } catch (err) {
        console.error('Error loading paths:', err)
        setError(err instanceof Error ? err : new Error('Failed to load paths'))
      } finally {
        setLoading(false)
      }
    }

    if (storyId) {
      loadPaths()
    }
  }, [storyId])

  const handlePathClick = (path: ('A' | 'B')[]) => {
    // Navigate to story with this path
    const pathParam = path.join(',')
    router.push(`/story/${storyId}?path=${pathParam}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load paths"
        message={error.message}
        onRetry={() => window.location.reload()}
      />
    )
  }

  if (paths.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <p>{t('story.paths.empty') || 'No paths found in this story.'}</p>
      </div>
    )
  }

  const totalUsers = paths.reduce((sum, path) => sum + path.userCount, 0)

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700/50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">
          {t('story.paths.title') || 'All Paths'}
        </h3>
        {totalUsers > 0 && (
          <span className="text-sm text-gray-400">
            {totalUsers} {t('story.paths.users') || 'users'}
          </span>
        )}
      </div>

      <div className="space-y-3">
        {paths.map((pathInfo, index) => (
          <div
            key={pathInfo.pathString}
            className={cn(
              'p-4 rounded-lg border transition-all cursor-pointer',
              'bg-gray-700/30 border-gray-600/50',
              'hover:bg-gray-700/50 hover:border-gray-600',
              index === 0 && pathInfo.userCount > 0 && 'ring-2 ring-brand-cyan/50'
            )}
            onClick={() => handlePathClick(pathInfo.path)}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                {/* Ranking Badge */}
                {index < 3 && pathInfo.userCount > 0 && (
                  <span
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                      index === 0 && 'bg-yellow-500/20 text-yellow-400',
                      index === 1 && 'bg-gray-400/20 text-gray-300',
                      index === 2 && 'bg-orange-500/20 text-orange-400'
                    )}
                  >
                    {index + 1}
                  </span>
                )}
                {index >= 3 && (
                  <span className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium text-gray-500">
                    {index + 1}
                  </span>
                )}

                {/* Path Display */}
                <div className="flex items-center gap-2">
                  {pathInfo.path.map((choice, choiceIndex) => (
                    <div key={choiceIndex} className="flex items-center gap-2">
                      <span
                        className={cn(
                          'px-2 py-1 rounded text-xs font-semibold',
                          choice === 'A'
                            ? 'bg-gradient-branch text-white'
                            : 'bg-gradient-brand text-white'
                        )}
                      >
                        {choice}
                      </span>
                      {choiceIndex < pathInfo.path.length - 1 && (
                        <span className="text-gray-500">→</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Statistics */}
              <div className="flex items-center gap-4 text-sm">
                {pathInfo.userCount > 0 ? (
                  <>
                    <span className="text-gray-300">
                      {pathInfo.userCount} {t('story.paths.users') || 'users'}
                    </span>
                    <span className="text-gray-400">
                      {pathInfo.percentage.toFixed(1)}%
                    </span>
                  </>
                ) : (
                  <span className="text-gray-500">
                    {t('story.paths.unexplored') || 'Unexplored'}
                  </span>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            {pathInfo.userCount > 0 && (
              <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden mt-2">
                <div
                  className="h-full bg-gradient-brand transition-all"
                  style={{ width: `${Math.min(pathInfo.percentage, 100)}%` }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {totalUsers === 0 && (
        <div className="mt-4 text-center text-sm text-gray-400">
          <p>{t('story.paths.noUsers') || 'No users have explored this story yet.'}</p>
        </div>
      )}
    </div>
  )
}

