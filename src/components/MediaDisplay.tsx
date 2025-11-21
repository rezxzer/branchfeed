'use client'

import { useState } from 'react'
import Image from 'next/image'
import { VideoPlayer } from './ui/VideoPlayer'
import { Spinner } from './ui/Spinner'
import { ErrorState } from './ui/ErrorState'
import { ImageLightbox } from './ui/ImageLightbox'
import { useTranslation } from '@/hooks/useTranslation'
import { cn } from '@/lib/utils'

export interface MediaDisplayProps {
  /** Media URL (Supabase Storage public URL or any valid URL) */
  mediaUrl: string
  
  /** Media type: 'image' | 'video' */
  mediaType: 'image' | 'video'
  
  /** Alt text for images (accessibility) */
  alt?: string
  
  /** Video controls (default: true) */
  controls?: boolean
  
  /** Auto-play video (default: false) */
  autoPlay?: boolean
  
  /** Loop video (default: false) */
  loop?: boolean
  
  /** Mute video (default: false, auto-muted if autoPlay=true) */
  muted?: boolean
  
  /** Poster/thumbnail image for video (shown before load) */
  poster?: string
  
  /** Lazy load image (default: true) */
  lazy?: boolean
  
  /** Loading callback */
  onLoad?: () => void
  
  /** Error callback */
  onError?: (error: Error) => void
  
  /** Video play callback */
  onPlay?: () => void
  
  /** Video pause callback */
  onPause?: () => void
  
  /** Video end callback (for playlist mode) */
  onEnded?: () => void
  
  /** Custom className */
  className?: string
  
  /** Max width on desktop (default: 'max-w-md') */
  maxWidth?: string

  /** Enable lightbox on image click (default: true for images) */
  enableLightbox?: boolean
  
  /** Aspect ratio (default: '9/16' for vertical stories) */
  aspectRatio?: '9/16' | '16/9' | '1/1' | '4/3'
}

/**
 * Simplified MediaDisplay component
 * 
 * Displays images or videos with proper loading, error handling, and controls.
 * 
 * Features:
 * - Image display with lightbox
 * - Video display with custom controls (using VideoPlayer)
 * - Loading states
 * - Error handling with retry
 * - Responsive and mobile-friendly
 * 
 * Usage:
 * ```tsx
 * <MediaDisplay 
 *   mediaUrl={url}
 *   mediaType="video"
 *   autoPlay={true}
 *   poster={thumbnailUrl}
 * />
 * ```
 */
export function MediaDisplay({
  mediaUrl,
  mediaType,
  alt = '',
  controls = true,
  autoPlay = false,
  loop = false,
  muted,
  poster,
  lazy = true,
  onLoad,
  onError,
  onPlay,
  onPause,
  onEnded,
  className = '',
  maxWidth = 'max-w-md',
  enableLightbox = true,
  aspectRatio = '9/16',
}: MediaDisplayProps) {
  const { t } = useTranslation()
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  // Validate media URL
  const isValidUrl = mediaUrl && typeof mediaUrl === 'string' && mediaUrl.trim() !== '' && (
    mediaUrl.startsWith('http://') || 
    mediaUrl.startsWith('https://') || 
    mediaUrl.startsWith('/')
  )

  // Fallback placeholder image
  const fallbackImageUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjcxMSIgdmlld0JveD0iMCAwIDQwMCA3MTEiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNzExIiBmaWxsPSJ1cmwoI3BhaW50MF9saW5lYXJfMF8xKSIvPgo8ZGVmcz4KPGxpbmVhckdyYWRpZW50IGlkPSJwYWludDBfbGluZWFyXzBfMSIgeDE9IjAiIHkxPSIwIiB4Mj0iNDAwIiB5Mj0iNzExIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CjxzdG9wIHN0b3AtY29sb3I9IiMxRjIwM0EiLz4KPHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjM0I0MDUwIi8+CjwvbGluZWFyR3JhZGllbnQ+CjwvZGVmcz4KPC9zdmc+'

  // Handle image/video load
  const handleLoad = () => {
    setIsLoading(false)
    setHasError(false)
    onLoad?.()
  }

  // Handle error
  const handleError = (error: Error) => {
    setIsLoading(false)
    setHasError(true)
    onError?.(error)
  }

  // Handle retry
  const handleRetry = () => {
    setIsLoading(true)
    setHasError(false)
    setRetryCount(prev => prev + 1)
  }

  // Invalid URL - show error immediately
  if (!isValidUrl) {
    return (
      <div className={cn(
        'relative w-full rounded-lg overflow-hidden bg-gray-800/60',
        aspectRatio === '9/16' && 'aspect-[9/16]',
        aspectRatio === '16/9' && 'aspect-video',
        aspectRatio === '1/1' && 'aspect-square',
        aspectRatio === '4/3' && 'aspect-[4/3]',
        maxWidth,
        'mx-auto',
        className
      )}>
        <ErrorState
          title={t('media.error.title') || 'Invalid URL'}
          message={t('media.error.invalidUrl') || 'The media URL is invalid or missing.'}
          onRetry={handleRetry}
        />
      </div>
    )
  }

  // Error state
  if (hasError) {
    return (
      <div className={cn(
        'relative w-full rounded-lg overflow-hidden bg-gray-800/60',
        aspectRatio === '9/16' && 'aspect-[9/16]',
        aspectRatio === '16/9' && 'aspect-video',
        aspectRatio === '1/1' && 'aspect-square',
        aspectRatio === '4/3' && 'aspect-[4/3]',
        maxWidth,
        'mx-auto',
        className
      )}>
        {/* Fallback image on error */}
        <div className="relative w-full h-full">
          <Image
            src={fallbackImageUrl}
            alt={alt || 'Media placeholder'}
            fill
            className="object-cover opacity-50"
            unoptimized
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <ErrorState
              title={t('media.error.title') || 'Failed to load'}
              message={t('media.error.message') || 'The media could not be loaded. Please try again.'}
              onRetry={handleRetry}
              className="h-full"
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'relative w-full rounded-lg overflow-hidden bg-gray-800/60',
        maxWidth,
        'mx-auto',
        className
      )}
    >
      {/* Loading Overlay (only for images, video has its own loading) */}
      {isLoading && mediaType === 'image' && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800/80 z-10">
          <Spinner size="lg" />
        </div>
      )}

      {/* Image Display */}
      {mediaType === 'image' ? (
        <>
          <div 
            className={cn(
              'relative w-full',
              aspectRatio === '9/16' && 'aspect-[9/16]',
              aspectRatio === '16/9' && 'aspect-video',
              aspectRatio === '1/1' && 'aspect-square',
              aspectRatio === '4/3' && 'aspect-[4/3]',
              enableLightbox && 'cursor-zoom-in'
            )}
            onClick={() => enableLightbox && setIsLightboxOpen(true)}
            role={enableLightbox ? 'button' : undefined}
            tabIndex={enableLightbox ? 0 : undefined}
            onKeyDown={(e) => {
              if (enableLightbox && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault()
                setIsLightboxOpen(true)
              }
            }}
            aria-label={enableLightbox ? 'Click to view fullscreen' : undefined}
          >
            <Image
              key={`image-${retryCount}`}
              src={mediaUrl}
              alt={alt}
              fill
              className="object-cover"
              onLoad={handleLoad}
              onError={() => handleError(new Error('Image load failed'))}
              loading={lazy ? 'lazy' : 'eager'}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              quality={85}
              priority={!lazy}
              unoptimized={mediaUrl.includes('supabase.co') && !mediaUrl.includes('storage')}
              style={{ objectFit: 'cover' }}
            />
          </div>

          {/* Image Lightbox */}
          {enableLightbox && (
            <ImageLightbox
              imageUrl={mediaUrl}
              alt={alt}
              isOpen={isLightboxOpen}
              onClose={() => setIsLightboxOpen(false)}
            />
          )}
        </>
      ) : (
        /* Video Display */
        <VideoPlayer
          key={`video-${retryCount}`}
          src={mediaUrl}
          poster={poster}
          autoPlay={autoPlay}
          controls={controls}
          loop={loop}
          muted={muted ?? (autoPlay ? true : false)} // Auto-mute if autoplay
          aspectRatio={aspectRatio}
          onReady={handleLoad}
          onPlay={onPlay}
          onPause={onPause}
          onEnded={onEnded}
          onError={handleError}
        />
      )}
    </div>
  )
}
