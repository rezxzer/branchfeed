'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { useTranslation } from '@/hooks/useTranslation'
import { StoryPlayer } from './StoryPlayer'
import { ChoiceButtons } from './ChoiceButtons'
import { PathProgress } from './PathProgress'
import { InteractionButtons } from './InteractionButtons'
import { CommentSection } from './CommentSection'
import { StoryTreeViewer } from './StoryTreeViewer'
import { PathViewer } from './PathViewer'
import { Spinner } from '@/components/ui/Spinner'
import { StoryDetailSkeleton } from './StoryDetailSkeleton'
import { ErrorState } from '@/components/ui/ErrorState'
import { useStory } from '@/hooks/useStory'
import { usePathTracking } from '@/hooks/usePathTracking'
import { incrementStoryViews } from '@/lib/stories'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import Link from 'next/link'

interface StoryDetailPageClientProps {
  storyId: string
}

export function StoryDetailPageClient({
  storyId,
}: StoryDetailPageClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t } = useTranslation()
  const { currentPath, currentDepth, makeChoice, loadExistingPath, setPathFromUrl } =
    usePathTracking(storyId)
  const { story, currentNode, loading, error } = useStory(
    storyId,
    currentPath
  )

  // Parse path from URL query parameter
  useEffect(() => {
    const pathParam = searchParams.get('path')
    
    if (pathParam) {
      // Parse path from URL: "A,B,A" -> ['A', 'B', 'A']
      const pathFromUrl = pathParam
        .split(',')
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
      // No path in URL - load existing path from database/localStorage only if current path is not empty
      if (currentPath.length === 0) {
        loadExistingPath()
      }
    }
  }, [searchParams, story, currentPath, loadExistingPath, setPathFromUrl])

  // Increment view count when story is loaded
  useEffect(() => {
    if (story?.id) {
      // Increment view count (fire and forget - don't wait for it)
      incrementStoryViews(story.id).catch((err) => {
        console.error('Error incrementing view count:', err)
      })
    }
  }, [story?.id])

  const handleChoice = async (choice: 'A' | 'B') => {
    // Make choice and update path
    // This will trigger useStory to reload with new path (loading state handled by useStory)
    await makeChoice(choice)
    
    // Update URL with new path (no page reload, just URL update)
    const newPath = [...currentPath, choice]
    const pathParam = newPath.join(',')
    router.push(`/story/${storyId}?path=${pathParam}`, { scroll: false })
    
    // Scroll to top of story player section for better UX
    window.scrollTo({ top: 0, behavior: 'smooth' })
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
              <Link
                href={`/profile/${story.author_id}`}
                className="block font-semibold text-white hover:text-brand-cyan transition-colors ease-smooth text-sm sm:text-base"
              >
                {story.author?.username || 'Unknown'}
              </Link>
              <h1 className="text-base sm:text-lg lg:text-xl font-bold text-white break-words">{story.title}</h1>
            </div>
          </div>
          {story.description && (
            <p className="text-sm sm:text-base text-gray-300 mt-2 break-words">{story.description}</p>
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

        {/* Interactions - Always show, even for mock data */}
        {story && (
          <div className="mt-8">
            <InteractionButtons
              storyId={story.id}
              likesCount={story.likes_count || 0}
              viewsCount={story.views_count || 0}
              commentsCount={story.comments_count || 0}
              currentPath={currentPath}
              storyTitle={story.title}
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
        </div>
      </div>
    </ErrorBoundary>
  )
}

