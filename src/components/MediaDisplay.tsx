'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Spinner } from './ui/Spinner'
import { ErrorState } from './ui/ErrorState'
import { useTranslation } from '@/hooks/useTranslation'
import { cn } from '@/lib/utils'

export interface MediaDisplayProps {
  /** Media URL (Supabase Storage public URL) */
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
  
  /** Mute video (default: false) */
  muted?: boolean
  
  /** Poster image for video (thumbnail shown before load) */
  poster?: string
  
  /** Lazy load image (default: true) */
  lazy?: boolean
  
  /** Loading callback */
  onLoad?: () => void
  
  /** Error callback */
  onError?: (error: Error) => void
  
  /** Custom className */
  className?: string
  
  /** Max width on desktop (default: 'max-w-md') */
  maxWidth?: string
}

export function MediaDisplay({
  mediaUrl,
  mediaType,
  alt = '',
  controls = true,
  autoPlay = false,
  loop = false,
  muted = false,
  poster,
  lazy = true,
  onLoad,
  onError,
  className = '',
  maxWidth = 'max-w-md',
}: MediaDisplayProps) {
  const { t } = useTranslation()
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const lastRetryRef = useRef<number>(0)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    setIsLoading(true)
    setHasError(false)
  }, [mediaUrl])

  // Handle autoplay for videos
  useEffect(() => {
    const video = videoRef.current
    if (!video || mediaType !== 'video') return

    if (autoPlay) {
      // Try to play video when autoplay is enabled
      const playPromise = video.play()
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            // Autoplay started successfully
            console.debug('Video autoplay started')
          })
          .catch((error) => {
            // Autoplay was prevented (browser policy)
            console.warn('Video autoplay failed:', error)
            // Video will show play button - user can click to play
          })
      }
    } else {
      // Pause video when autoplay is disabled
      video.pause()
    }
  }, [autoPlay, mediaType])

  const handleLoad = () => {
    setIsLoading(false)
    onLoad?.()
  }

  const handleError = (error: Error) => {
    setIsLoading(false)
    setHasError(true)
    onError?.(error)
  }

  const handleRetry = () => {
    const now = Date.now()
    if (now - lastRetryRef.current < 500) return // debounce ~500ms
    lastRetryRef.current = now
    setIsLoading(true)
    setHasError(false)
  }

  if (hasError) {
    return (
      <div className={cn('relative aspect-[9/16] w-full rounded-lg overflow-hidden bg-gray-800/60', className)}>
        <ErrorState
          title={t('media.error.title') || 'Failed to load media'}
          message={t('media.error.message') || 'The media could not be loaded. Please try again.'}
          retryLabel={t('media.error.retry') || 'Retry'}
          onRetry={handleRetry}
          className="h-full"
        />
      </div>
    )
  }

  return (
    <div
      className={cn(
        'relative aspect-[9/16] w-full rounded-lg overflow-hidden bg-gray-800/60',
        maxWidth,
        'mx-auto',
        className
      )}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800/80 z-10">
          <Spinner size="lg" />
        </div>
      )}

      {mediaType === 'image' ? (
        <div className="relative w-full h-full">
          <Image
            src={mediaUrl}
            alt={alt}
            fill
            className="object-cover"
            onLoad={handleLoad}
            onError={() => handleError(new Error('Image load failed'))}
            loading={lazy ? 'lazy' : 'eager'}
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 100vw, (max-width: 1024px) 448px, 448px"
            quality={85}
            priority={!lazy}
            unoptimized={mediaUrl.includes('supabase.co') && !mediaUrl.includes('storage')}
          />
        </div>
      ) : (
        <video
          ref={videoRef}
          src={mediaUrl}
          className="w-full h-full object-cover"
          controls={controls}
          autoPlay={autoPlay}
          loop={loop}
          muted={muted}
          poster={poster}
          preload="metadata"
          playsInline
          onLoadedData={handleLoad}
          onError={() => handleError(new Error('Video load failed'))}
        />
      )}
    </div>
  )
}

