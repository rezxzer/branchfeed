'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { useTranslation } from '@/hooks/useTranslation'
import { StoryPlayer } from './StoryPlayer'
import { ChoiceButtons } from './ChoiceButtons'
import { PathProgress } from './PathProgress'
import { InteractionButtons } from './InteractionButtons'
import { Spinner } from '@/components/ui/Spinner'
import { StoryDetailSkeleton } from './StoryDetailSkeleton'
import { ErrorState } from '@/components/ui/ErrorState'
import { useStory } from '@/hooks/useStory'
import { usePathTracking } from '@/hooks/usePathTracking'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { StoryStatsBar } from './StoryStatsBar'
import { StoryTags } from './StoryTags'
import { encodePath, decodePath } from '@/lib/pathSharing'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useToast } from '@/components/ui/toast'
import { useAuth } from '@/hooks/useAuth'
import { EditStoryModal } from './EditStoryModal'
import { DeleteStoryModal } from './DeleteStoryModal'
import { Button } from '@/components/ui/Button'

// Lazy load non-critical components for code splitting
const CommentSection = dynamic(() => import('./CommentSection').then(mod => ({ default: mod.CommentSection })), {
  loading: () => <div className="mt-8"><Spinner size="md" /></div>,
});

const StoryTreeViewer = dynamic(() => import('./StoryTreeViewer').then(mod => ({ default: mod.StoryTreeViewer })), {
  loading: () => <div className="mt-8"><Spinner size="md" /></div>,
  ssr: false,
});

const PathViewer = dynamic(() => import('./PathViewer').then(mod => ({ default: mod.PathViewer })), {
  loading: () => <div className="mt-8"><Spinner size="md" /></div>,
  ssr: false,
});

const RecommendedStories = dynamic(() => import('../recommendations/RecommendedStories').then(mod => ({ default: mod.RecommendedStories })), {
  loading: () => <div className="mt-8"><Spinner size="md" /></div>,
  ssr: false,
});

const ShareStoryButton = dynamic(() => import('./ShareStoryButton').then(mod => ({ default: mod.ShareStoryButton })), {
  ssr: false,
});

interface StoryDetailPageClientProps {
  storyId: string
}

export function StoryDetailPageClient({
  storyId,
}: StoryDetailPageClientProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { t } = useTranslation()
  const { showToast } = useToast()
  const { user } = useAuth()
  const { currentPath, currentDepth, makeChoice, loadExistingPath, setPathFromUrl } =
    usePathTracking(storyId)
  const { story, currentNode, loading, error } = useStory(
    storyId,
    currentPath
  )

  // Edit/Delete modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDuplicating, setIsDuplicating] = useState(false)

  // Check if current user is the author
  const isAuthor = user && story && story.author_id === user.id

  // Local state for views count (updated from API)
  const [viewsCount, setViewsCount] = useState<number>(0)

  // Local state for likes count (updated from API)
  const [likesCount, setLikesCount] = useState<number>(0)

  // Local state for liked status (updated from API)
  const [isLiked, setIsLiked] = useState<boolean>(false)

  // Loading state for like operation
  const [isLiking, setIsLiking] = useState<boolean>(false)

  // Track if this is the initial mount to avoid updating URL on initial load
  const isInitialMount = useRef(true)

  // Parse path from URL query parameter on initial load
  useEffect(() => {
    const pathParam = searchParams.get('path')
    
    if (pathParam) {
      // Decode path from URL using utility function
      const decodedPath = decodePath(pathParam)
      
      // Convert to ('A' | 'B')[] and validate
      const pathFromUrl = decodedPath
        .map((p) => p.trim().toUpperCase())
        .filter((p) => p === 'A' || p === 'B') as ('A' | 'B')[]
      
      // Only update if path is different from current path (avoid unnecessary updates)
      const currentPathStr = currentPath.join(',')
      const pathFromUrlStr = pathFromUrl.join(',')
      
      if (pathFromUrlStr !== currentPathStr) {
        // Validate path length (max depth check)
        if (pathFromUrl.length > 0 && story) {
          const maxDepth = story.max_depth || 5
          if (pathFromUrl.length <= maxDepth) {
            // Set path from URL (this will override database/localStorage path)
            setPathFromUrl(pathFromUrl)
          }
        } else if (pathFromUrl.length > 0) {
          // If story not loaded yet, set path anyway (will be validated when story loads)
          setPathFromUrl(pathFromUrl)
        }
      }
    } else {
      // No path in URL - load existing path from database/localStorage only if current path is empty
      if (currentPath.length === 0) {
        loadExistingPath()
      }
    }
    
    // Mark initial mount as complete
    isInitialMount.current = false
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run on mount to read initial URL

  // Sync URL with current path (update URL when path changes)
  useEffect(() => {
    // Skip if this is the initial mount (URL reading happens in the other useEffect)
    if (isInitialMount.current) {
      return
    }
    
    // We only want to update URL when path changes after user interaction
    const currentPathParam = searchParams.get('path')
    const currentPathEncoded = encodePath(currentPath)
    
    // Only update URL if path has actually changed
    if (currentPathParam !== currentPathEncoded) {
      const params = new URLSearchParams(searchParams.toString())
      
      if (currentPath.length > 0) {
        // Add or update path parameter
        params.set('path', currentPathEncoded)
      } else {
        // Remove path parameter if path is empty
        params.delete('path')
      }
      
      // Build new URL
      const newQuery = params.toString()
      const newUrl = newQuery 
        ? `${pathname}?${newQuery}`
        : pathname
      
      // Update URL without adding to history (replace instead of push)
      router.replace(newUrl, { scroll: false })
    }
  }, [currentPath, pathname, router, searchParams])

  // Initialize views count from story data
  useEffect(() => {
    if (story?.views_count !== undefined) {
      setViewsCount(story.views_count)
    }
  }, [story?.views_count])

  // Initialize likes count from story data
  useEffect(() => {
    if (story?.likes_count !== undefined) {
      setLikesCount(story.likes_count ?? 0)
    }
  }, [story?.likes_count])

  // Initialize liked status from story data
  useEffect(() => {
    if (story?.userHasLiked !== undefined) {
      setIsLiked(story.userHasLiked)
    }
  }, [story?.userHasLiked])

  // Increment view count via API when story is loaded
  // TODO: Add smarter view de-duplication (per user/session) in a future task
  useEffect(() => {
    if (story?.id) {
      // Call API to increment views
      fetch(`/api/stories/${story.id}/view`, {
        method: 'POST',
      })
        .then(async (response) => {
          // Handle 403 (Forbidden) - subscription limit exceeded
          if (response.status === 403) {
            const errorData = await response.json().catch(() => ({}))
            const errorMessage = errorData.error || 'Daily view limit reached'
            const remaining = errorData.remaining
            let message = errorMessage
            if (remaining !== undefined && remaining !== -1) {
              message = `${errorMessage} (${remaining} remaining)`
            }
            showToast(
              `${message}. Upgrade your subscription to increase limits.`,
              'error',
              5000
            )
            return null // Don't update views count
          }

          if (!response.ok) {
            // Try to get error message from response
            let errorMessage = `HTTP error! status: ${response.status}`
            try {
              const errorData = await response.json()
              if (errorData.error) {
                errorMessage = errorData.error
              }
            } catch {
              // If response is not JSON, use default message
            }
            throw new Error(errorMessage)
          }
          return response.json()
        })
        .then((data: { viewsCount: number } | null) => {
          // Update local state with new views count (only if not null)
          if (data && typeof data.viewsCount === 'number') {
            setViewsCount(data.viewsCount)
          }
        })
        .catch((err) => {
          console.error('Error incrementing view count:', err)
          // Don't update state on error - keep existing value
          // View increment is non-critical, so we silently fail (unless it's a limit error)
        })
    }
  }, [story?.id, showToast])

  // Handle like click with toggle logic
  const handleLikeClick = async () => {
    if (!story?.id || isLiking) {
      return
    }

    setIsLiking(true)

    try {
      // Call API to toggle like
      const response = await fetch(`/api/stories/${story.id}/like`, {
        method: 'POST',
      })

      // Handle 401 (Unauthorized) - user not authenticated
      if (response.status === 401) {
        showToast('Sign in to like stories', 'warning')
        setIsLiking(false)
        return
      }

      // Handle 400 (Bad Request) - profile not found
      if (response.status === 400) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error || 'Profile setup required'
        showToast(errorMessage, 'warning')
        setIsLiking(false)
        return
      }

      // Handle 403 (Forbidden) - subscription limit exceeded
      if (response.status === 403) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error || 'Daily like limit reached'
        const remaining = errorData.remaining
        let message = errorMessage
        if (remaining !== undefined && remaining !== -1) {
          message = `${errorMessage} (${remaining} remaining)`
        }
        showToast(
          `${message}. Upgrade your subscription to increase limits.`,
          'error',
          5000
        )
        setIsLiking(false)
        return
      }

      if (!response.ok) {
        // Try to get error message from response
        let errorMessage = `HTTP error! status: ${response.status}`
        try {
          const errorData = await response.json()
          if (errorData.error) {
            errorMessage = errorData.error
          }
        } catch {
          // If response is not JSON, use default message
        }
        throw new Error(errorMessage)
      }

      const data: { likesCount: number; liked: boolean } = await response.json()

      // Update state with actual values from server
      if (typeof data.likesCount === 'number') {
        setLikesCount(data.likesCount)
      }
      if (typeof data.liked === 'boolean') {
        setIsLiked(data.liked)
      }

      // Show success toast
      if (data.liked) {
        showToast('Added to your likes', 'success')
      } else {
        showToast('Removed from your likes', 'info')
      }
    } catch (err: any) {
      console.error('Error toggling like:', err)
      
      // Check if it's a subscription limit error
      if (err.limitExceeded || err.message?.includes('limit') || err.message?.includes('Limit')) {
        const errorMessage = err.message || 'Daily like limit reached'
        showToast(
          `${errorMessage}. Upgrade your subscription to increase limits.`,
          'error',
          5000
        )
      } else {
        showToast('Something went wrong. Please try again.', 'error')
      }
      // Keep current state on error - no rollback needed since we don't do optimistic updates
    } finally {
      setIsLiking(false)
    }
  }

  const handleDuplicate = async () => {
    if (!story || isDuplicating) return

    setIsDuplicating(true)
    try {
      const response = await fetch(`/api/stories/${story.id}/duplicate`, {
        method: 'POST',
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to duplicate story')
      }

      const data = await response.json()
      showToast('Story duplicated successfully! Redirecting to drafts...', 'success')
      
      // Redirect to drafts page after a short delay
      setTimeout(() => {
        router.push('/drafts')
      }, 1500)
    } catch (err: any) {
      console.error('Error duplicating story:', err)
      showToast(err.message || 'Failed to duplicate story', 'error')
    } finally {
      setIsDuplicating(false)
    }
  }

  const handleChoice = async (choice: 'A' | 'B') => {
    // Make choice and update path
    // This will trigger useStory to reload with new path (loading state handled by useStory)
    await makeChoice(choice)
    
    // Scroll to top of story player section for better UX
    window.scrollTo({ top: 0, behavior: 'smooth' })
    // Note: URL update is handled by the useEffect below when currentPath changes
  }

  if (loading && !story) {
    return (
      <div className="min-h-screen bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <StoryDetailSkeleton />
        </div>
      </div>
    )
  }

  if (error || !story) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <ErrorState
          title={t('story.errors.notFound')}
          message={error?.message || t('story.errors.loadFailed')}
          onRetry={() => router.refresh()}
        />
      </div>
    )
  }

  const currentMediaUrl = currentNode?.media_url || story.media_url
  const currentMediaType = currentNode?.media_type || story.media_type

  // Check if we can make more choices (not at max depth)
  const canMakeChoices = currentDepth < (story.max_depth || 5)
  
  // For root story (no path yet), we can always make choices if story has nodes
  // For nodes, we assume they have children if we haven't reached max depth
  // In a real implementation, we'd check if child nodes exist, but for MVP we use depth check
  const hasChildren = canMakeChoices && (currentNode !== null || currentPath.length === 0)

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Story Info */}
        <div className="mb-4 sm:mb-6">
          <div className="flex items-start sm:items-center gap-3 mb-2">
            {story.author?.avatar_url ? (
              <Image
                src={story.author.avatar_url}
                alt={story.author.username || 'User avatar'}
                width={40}
                height={40}
                className="rounded-full object-cover flex-shrink-0"
                unoptimized
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-brand flex items-center justify-center text-white font-semibold flex-shrink-0">
                {story.author?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3 mb-1">
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/profile/${story.author_id}`}
                    className="block font-semibold text-white hover:text-brand-cyan transition-colors ease-smooth text-sm sm:text-base"
                  >
                    {story.author?.username || 'Unknown'}
                  </Link>
                  <h1 className="text-base sm:text-lg lg:text-xl font-bold text-white break-words">{story.title}</h1>
                </div>
                <div className="flex-shrink-0 flex items-center gap-2">
                  {isAuthor && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/story/${story.id}/analytics`)}
                        className="text-xs"
                      >
                        📊 Analytics
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDuplicate}
                        disabled={isDuplicating}
                        className="text-xs"
                      >
                        {isDuplicating ? <Spinner size="sm" /> : '📋 Duplicate'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditModalOpen(true)}
                        className="text-xs"
                      >
                        ✏️ Edit
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => setIsDeleteModalOpen(true)}
                        className="text-xs"
                      >
                        🗑️ Delete
                      </Button>
                    </>
                  )}
                  <ShareStoryButton 
                    storyId={storyId} 
                    path={currentPath}
                    initialShared={story?.userHasShared}
                    initialSharesCount={story?.shares_count || 0}
                    showCount={true}
                  />
                </div>
              </div>
            </div>
          </div>
          {story.description && (
            <p className="text-sm sm:text-base text-gray-300 mt-2 break-words">{story.description}</p>
          )}
          
          {/* Tags */}
          {story.tags && story.tags.length > 0 && (
            <div className="mt-3">
              <StoryTags tags={story.tags} />
            </div>
          )}
        </div>

        {/* Story Player Section */}
        <div className="mb-6 space-y-6">
          {/* Path Progress - Top */}
          <PathProgress
            currentStep={currentDepth + 1}
            maxSteps={story.max_depth || 5}
            path={currentPath}
          />

          {/* Media Display - Center */}
          <div className="flex justify-center">
            <StoryPlayer
              mediaUrl={currentMediaUrl}
              mediaType={currentMediaType}
              loading={loading}
              onSwipeLeft={() => {
                // Swipe left = Choice B
                if (currentDepth < (story?.max_depth || 5) && currentNode && hasChildren) {
                  handleChoice('B')
                }
              }}
              onSwipeRight={() => {
                // Swipe right = Choice A
                if (currentDepth < (story?.max_depth || 5) && currentNode && hasChildren) {
                  handleChoice('A')
                }
              }}
            />
          </div>

          {/* Choice Buttons - Below Media */}
          {/* Show choice buttons if: not at max depth, and (at root or have current node) */}
          {canMakeChoices && (currentPath.length === 0 || currentNode) && (
            <ChoiceButtons
              choiceA={currentNode?.choiceA || { label: 'A' }}
              choiceB={currentNode?.choiceB || { label: 'B' }}
              onChoice={handleChoice}
              disabled={loading}
              storyTitle={story.title}
              currentNodeTitle={currentNode?.content || story.title}
            />
          )}

          {/* End of Path State */}
          {/* Show end of path if: at max depth OR no more choices available */}
          {!canMakeChoices && (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 sm:p-8 text-center">
              <div className="text-4xl mb-3 opacity-80">📖</div>
              <p className="text-white text-lg sm:text-xl font-semibold mb-2">
                {t('story.endOfPath.title') || 'End of Path'}
              </p>
              <p className="text-gray-300 text-sm sm:text-base">
                {t('story.endOfPath.description') || 'You have reached the end of this path.'}
              </p>
            </div>
          )}
        </div>

        {/* Story Stats Bar */}
        {story && (
          <div className="mt-6">
            <StoryStatsBar
              pathsCount={story.paths_count ?? 0}
              viewsCount={viewsCount}
              likesCount={story.likes_count ?? 0}
            />
          </div>
        )}

        {/* Interactions - Always show, even for mock data */}
        {story && (
          <div className="mt-8">
            <InteractionButtons
              storyId={story.id}
              likesCount={likesCount}
              viewsCount={viewsCount}
              commentsCount={story.comments_count || 0}
              currentPath={currentPath}
              storyTitle={story.title}
              onLikeClick={handleLikeClick}
              isLiked={isLiked}
              isLiking={isLiking}
            />
          </div>
        )}

        {/* Comments Section */}
        {story && (
          <div className="mt-8">
            <CommentSection storyId={story.id} />
          </div>
        )}

        {/* Story Tree Visualization */}
        {story && (
          <div className="mt-8">
            <StoryTreeViewer storyId={story.id} />
          </div>
        )}

        {/* Path Viewer */}
        {story && (
          <div className="mt-8">
            <PathViewer storyId={story.id} />
          </div>
        )}

        {/* Recommended Stories */}
        {story && (
          <div className="mt-8">
            <RecommendedStories excludeStoryId={story.id} limit={6} />
          </div>
        )}

        {/* Edit/Delete Modals */}
        {story && (
          <>
            <EditStoryModal
              isOpen={isEditModalOpen}
              onClose={() => setIsEditModalOpen(false)}
              story={story}
              onSuccess={() => {
                // Reload page to show updated story
                router.refresh()
              }}
            />
            <DeleteStoryModal
              isOpen={isDeleteModalOpen}
              onClose={() => setIsDeleteModalOpen(false)}
              storyId={story.id}
              storyTitle={story.title}
            />
          </>
        )}
        </div>
      </div>
    </ErrorBoundary>
  )
}

