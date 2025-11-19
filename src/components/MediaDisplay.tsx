'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Spinner } from './ui/Spinner'
import { ErrorState } from './ui/ErrorState'
import { ImageLightbox } from './ui/ImageLightbox'
import { logDebug, logWarn } from '@/lib/logger'
import { useTranslation } from '@/hooks/useTranslation'
import { cn } from '@/lib/utils'
import { useVideoAutoplayOptional } from '@/contexts/VideoAutoplayContext'
import { useVolumePersistence } from '@/hooks/useVolumePersistence'
import { useVolumeFade } from '@/hooks/useVolumeFade'
import { usePlaybackSpeed, PLAYBACK_SPEED_OPTIONS } from '@/hooks/usePlaybackSpeed'
import { usePictureInPicture } from '@/hooks/usePictureInPicture'
import { useAdaptiveVideoQuality } from '@/hooks/useAdaptiveVideoQuality'
import { useVideoAnalytics } from '@/hooks/useVideoAnalytics'
import { PictureInPicture, X, Wifi, WifiOff } from 'lucide-react'

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
  
  /** Video play callback (for autoplay announcements) */
  onPlay?: () => void
  
  /** Video end callback (for playlist mode) */
  onEnded?: () => void
  
  /** Custom className */
  className?: string
  
  /** Max width on desktop (default: 'max-w-md') */
  maxWidth?: string

  /** Enable lightbox on image click (default: true for images) */
  enableLightbox?: boolean
  
  /** Story ID for analytics tracking (optional) */
  storyId?: string
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
  onPlay,
  onEnded,
  className = '',
  maxWidth = 'max-w-md',
  enableLightbox = true,
  storyId,
}: MediaDisplayProps) {
  const { t } = useTranslation()
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [showFallback, setShowFallback] = useState(false)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [retryKey, setRetryKey] = useState(0) // Key to force video element remount
  const lastRetryRef = useRef<number>(0)
  const videoRef = useRef<HTMLVideoElement>(null)
  const videoIdRef = useRef<string>(`video-${Date.now()}-${Math.random()}`)
  const loadTimeoutRef = useRef<NodeJS.Timeout | null>(null) // Timeout for video loading
  
  // Volume persistence - restore user's volume preference
  const { volume: persistedVolume, setVolume: setPersistedVolume } = useVolumePersistence({
    persistToStorage: true,
    defaultVolume: 1.0,
  })

  // Volume fade for smooth unmute/mute transitions
  const { fadeIn, fadeOut, isFading } = useVolumeFade({
    videoRef,
    targetVolume: persistedVolume,
    enabled: mediaType === 'video',
    duration: 300, // 300ms fade duration
    easing: 'easeInOut',
    onFadeStart: () => {
      logDebug('Volume fade started')
    },
    onFadeComplete: () => {
      logDebug('Volume fade completed', { finalVolume: persistedVolume })
    },
  })
  
  // Playback speed persistence - restore user's playback speed preference
  const { playbackSpeed, setPlaybackSpeed: setPersistedPlaybackSpeed } = usePlaybackSpeed({
    persistToStorage: true,
    defaultSpeed: 1.0,
  })
  
  // Picture-in-Picture functionality
  const {
    isPictureInPicture,
    isSupported: isPiPSupported,
    enterPictureInPicture,
    exitPictureInPicture,
    togglePictureInPicture,
  } = usePictureInPicture({
    videoRef,
    onEnter: () => {
      logDebug('Entered Picture-in-Picture mode')
    },
    onExit: () => {
      logDebug('Exited Picture-in-Picture mode')
    },
    onError: (error) => {
      logWarn('Picture-in-Picture error', { error: error.message })
    },
  })
  
  // Adaptive video quality based on network connection
  const {
    quality: videoQuality,
    networkQuality,
    isAdaptive,
    getRecommendedQuality,
  } = useAdaptiveVideoQuality({
    defaultQuality: 'auto',
    enableAdaptive: true,
    onQualityChange: (quality) => {
      logDebug('Video quality changed', { quality, networkQuality })
    },
  })
  
  // Determine preload strategy based on network quality
  const preloadStrategy = networkQuality === 'slow' ? 'none' : networkQuality === 'medium' ? 'metadata' : 'auto'
  
  // Video analytics tracking
  const {
    startTracking,
    stopTracking,
    recordEvent,
    setVideoRef: setAnalyticsVideoRef,
  } = useVideoAnalytics({
    videoId: storyId || mediaUrl,
    enabled: mediaType === 'video' && !!storyId,
    minDuration: 1,
    sendToServer: true,
    onSessionEnd: (session) => {
      logDebug('Video analytics session ended', {
        videoId: session.videoId,
        duration: session.totalDuration,
        watchPercentage: session.watchPercentage,
        completed: session.completed,
      })
    },
  })
  
  // Set video ref for analytics
  useEffect(() => {
    if (videoRef.current && mediaType === 'video') {
      setAnalyticsVideoRef(videoRef.current)
    }
  }, [videoRef, mediaType, setAnalyticsVideoRef])

  // Fallback placeholder image (simple gradient placeholder)
  const fallbackImageUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjcxMSIgdmlld0JveD0iMCAwIDQwMCA3MTEiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNzExIiBmaWxsPSJ1cmwoI3BhaW50MF9saW5lYXJfMF8xKSIvPgo8ZGVmcz4KPGxpbmVhckdyYWRpZW50IGlkPSJwYWludDBfbGluZWFyXzBfMSIgeDE9IjAiIHkxPSIwIiB4Mj0iNDAwIiB5Mj0iNzExIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CjxzdG9wIHN0b3AtY29sb3I9IiMxRjIwM0EiLz4KPHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjM0I0MDUwIi8+CjwvbGluZWFyR3JhZGllbnQ+CjwvZGVmcz4KPC9zdmc+'
  
  // Validate media URL format
  const isValidUrl = mediaUrl && typeof mediaUrl === 'string' && mediaUrl.trim() !== '' && (
    mediaUrl.startsWith('http://') || 
    mediaUrl.startsWith('https://') || 
    mediaUrl.startsWith('/')
  )
  
  // Debug logging for video URLs
  useEffect(() => {
    if (mediaType === 'video') {
      logDebug('MediaDisplay video props', {
        mediaUrl,
        mediaType,
        isValidUrl,
        urlType: typeof mediaUrl,
        urlLength: mediaUrl?.length,
        urlStartsWithHttp: mediaUrl?.startsWith('http'),
        urlStartsWithHttps: mediaUrl?.startsWith('https'),
      })
    }
  }, [mediaType, mediaUrl, isValidUrl])
  
  // Early validation: if URL is invalid, show error immediately
  // Note: handleError is defined later, but we can call it directly
  useEffect(() => {
    if (mediaType === 'video') {
      if (!isValidUrl) {
        logWarn('Invalid video URL', { 
          error: new Error('Video URL is invalid or missing'),
          url: mediaUrl,
          urlType: typeof mediaUrl,
          urlLength: mediaUrl?.length,
          urlValue: String(mediaUrl),
        })
        // Set error state directly since handleError is not yet defined
        setIsLoading(false)
        setHasError(true)
        setShowFallback(true)
        onError?.(new Error('Invalid video URL'))
      } else {
        // URL is valid, ensure error state is cleared
        setHasError(false)
        setShowFallback(false)
      }
    }
  }, [mediaType, isValidUrl, mediaUrl, onError])
  
  // Video autoplay context (optional - returns null if provider doesn't exist)
  const videoAutoplay = useVideoAutoplayOptional()

  useEffect(() => {
    setIsLoading(true)
    setHasError(false)
    setShowFallback(false)
    
    // Clear any existing timeout
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current)
      loadTimeoutRef.current = null
    }
    
    // Set timeout for video loading (30 seconds)
    if (mediaType === 'video') {
      loadTimeoutRef.current = setTimeout(() => {
        // Check if video is still loading (by checking ref, not state)
        const video = videoRef.current
        if (video && video.readyState < 2) { // 0=HAVE_NOTHING, 1=HAVE_METADATA, 2=HAVE_CURRENT_DATA
          handleError(new Error('Video load timeout'))
        }
      }, 30000)
    }
    
    return () => {
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current)
        loadTimeoutRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mediaUrl, mediaType])

  // Handle mute/unmute with volume fade
  useEffect(() => {
    const video = videoRef.current
    if (!video || mediaType !== 'video' || isFading) {
      return
    }

    // If muted prop changes, trigger fade
    if (muted && video.volume > 0) {
      // Mute: fade out
      fadeOut()
    } else if (!muted && video.volume === 0 && persistedVolume > 0) {
      // Unmute: fade in
      fadeIn()
    }
  }, [muted, persistedVolume, mediaType, isFading, fadeIn, fadeOut])

  // Restore persisted volume and playback speed when video element is ready
  useEffect(() => {
    const video = videoRef.current
    if (!video || mediaType !== 'video') return

    // Restore volume and playback speed when video metadata is loaded
    const restorePreferences = () => {
      // Only restore volume if not muted and not currently fading
      if (!muted && !isFading && video.volume !== persistedVolume) {
        video.volume = persistedVolume
        logDebug('Video volume restored', { volume: persistedVolume })
      }
      if (video.playbackRate !== playbackSpeed) {
        video.playbackRate = playbackSpeed
        logDebug('Video playback speed restored', { playbackSpeed })
      }
    }

    // Try to restore preferences immediately if video is ready
    if (video.readyState >= 1) { // HAVE_METADATA or higher
      restorePreferences()
    } else {
      // Wait for metadata to load
      video.addEventListener('loadedmetadata', restorePreferences, { once: true })
      return () => {
        video.removeEventListener('loadedmetadata', restorePreferences)
      }
    }
  }, [mediaType, persistedVolume, playbackSpeed, retryKey, isFading, muted])

  // Force video reload when src changes or on retry
  useEffect(() => {
    if (mediaType === 'video' && videoRef.current && !hasError && isValidUrl) {
      const video = videoRef.current
      // Small delay to ensure video element is ready
      const timeoutId = setTimeout(() => {
        if (videoRef.current && mediaUrl) {
          // Ensure src is set correctly
          if (videoRef.current.src !== mediaUrl) {
            logDebug('Video src mismatch, updating', {
              currentSrc: videoRef.current.src,
              expectedSrc: mediaUrl,
            })
            videoRef.current.src = mediaUrl
          }
          // Restore volume and playback speed after src is set (only if not muted and not fading)
          if (!muted && !isFading && videoRef.current.volume !== persistedVolume) {
            videoRef.current.volume = persistedVolume
            logDebug('Video volume restored after src update', { volume: persistedVolume })
          }
          if (videoRef.current.playbackRate !== playbackSpeed) {
            videoRef.current.playbackRate = playbackSpeed
            logDebug('Video playback speed restored after src update', { playbackSpeed })
          }
          // Force reload by calling load() method
          try {
            videoRef.current.load()
            logDebug('Video load() called', { 
              url: mediaUrl.substring(0, 50) + '...',
              src: videoRef.current.src.substring(0, 50) + '...',
              readyState: videoRef.current.readyState,
            })
          } catch (error) {
            logWarn('Video load() failed', { error })
          }
        }
      }, 100)
      
      return () => clearTimeout(timeoutId)
    }
  }, [mediaUrl, mediaType, retryKey, hasError, isValidUrl, persistedVolume, isFading, muted, playbackSpeed])

  // Handle autoplay for videos
  useEffect(() => {
    const video = videoRef.current
    if (!video || mediaType !== 'video') return

    // Store videoAutoplay in a ref to avoid dependency issues
    const autoplayContext = videoAutoplay

    if (autoPlay) {
      // Check if we can autoplay (respect max concurrent videos limit)
      const canPlay = !autoplayContext || autoplayContext.canAutoplay(videoIdRef.current)
      
      if (canPlay) {
        // Request autoplay slot
        let granted = true
        if (autoplayContext) {
          granted = autoplayContext.requestAutoplay(videoIdRef.current)
          if (!granted) {
            // Max concurrent videos reached, don't autoplay
            logDebug('Video autoplay denied: max concurrent videos reached', {
              videoId: videoIdRef.current,
            })
            return
          }
        }

        // Try to play video when autoplay is enabled
        const playPromise = video.play()
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              // Autoplay started successfully
              logDebug('Video autoplay started successfully', {
                videoId: videoIdRef.current,
                url: mediaUrl.substring(0, 50) + '...',
              })
            })
            .catch((error) => {
              // Autoplay was prevented (browser policy) or interrupted
              // AbortError is normal when video is paused/interrupted - don't log as warning
              if (error.name !== 'AbortError') {
                logWarn('Video autoplay failed', {
                  error,
                  videoId: videoIdRef.current,
                  url: mediaUrl.substring(0, 50) + '...',
                })
              } else {
                // AbortError is normal (video was paused/interrupted) - just debug log
                logDebug('Video autoplay interrupted (normal):', {
                  videoId: videoIdRef.current,
                })
              }
              // Release slot if we had one
              if (autoplayContext) {
                autoplayContext.releaseAutoplay(videoIdRef.current)
              }
              // Video will show play button - user can click to play
            })
        }
      } else {
        logDebug('Video autoplay denied: cannot autoplay', {
          videoId: videoIdRef.current,
          hasContext: !!autoplayContext,
        })
      }
    } else {
      // Pause video when autoplay is disabled
      video.pause()
      // Release autoplay slot
      if (autoplayContext) {
        autoplayContext.releaseAutoplay(videoIdRef.current)
      }
    }
    // Only depend on autoPlay and mediaType, not videoAutoplay object
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlay, mediaType])

  // Cleanup: pause video on unmount
  useEffect(() => {
    const video = videoRef.current
    if (!video || mediaType !== 'video') return

    // Store videoAutoplay in a ref to avoid dependency issues
    const autoplayContext = videoAutoplay
    // Store ref values to avoid stale closures
    const currentVideoId = videoIdRef.current
    const currentVideo = videoRef.current

    return () => {
      // Cleanup: pause video when component unmounts
      if (currentVideo) {
        currentVideo.pause()
        currentVideo.src = '' // Clear source to free memory
      }
      // Stop analytics tracking
      stopTracking()
      // Release autoplay slot
      if (autoplayContext && currentVideoId) {
        autoplayContext.releaseAutoplay(currentVideoId)
      }
    }
    // Only depend on mediaType, not videoAutoplay object
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mediaType])

  // Handle video pause/play events to track state
  useEffect(() => {
    const video = videoRef.current
    if (!video || mediaType !== 'video' || !videoAutoplay) return

    // Store videoAutoplay in a ref to avoid dependency issues
    const autoplayContext = videoAutoplay

    const handlePause = () => {
      autoplayContext?.releaseAutoplay(videoIdRef.current)
    }

    const handlePlay = () => {
      // Video started playing (user clicked or autoplay)
      autoplayContext?.requestAutoplay(videoIdRef.current)
    }

    video.addEventListener('pause', handlePause)
    video.addEventListener('play', handlePlay)

    return () => {
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('play', handlePlay)
    }
    // Only depend on mediaType, not videoAutoplay object
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mediaType])

  const handleLoad = () => {
    // Clear timeout if video loaded successfully
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current)
      loadTimeoutRef.current = null
    }
    setIsLoading(false)
    onLoad?.()
  }

  const handleError = (error: Error) => {
    // Clear timeout on error
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current)
      loadTimeoutRef.current = null
    }
    setIsLoading(false)
    setHasError(true)
    setShowFallback(true)
    onError?.(error)
  }

  const handleRetry = () => {
    const now = Date.now()
    if (now - lastRetryRef.current < 500) return // debounce ~500ms
    lastRetryRef.current = now
    
    // Reset error state and force video element remount
    setIsLoading(true)
    setHasError(false)
    setShowFallback(false)
    setRetryKey(prev => prev + 1) // Force React to remount video element
  }

  if (hasError && showFallback) {
    return (
      <div className={cn('relative aspect-[9/16] w-full rounded-lg overflow-hidden bg-gray-800/60', className)}>
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
              title={t('media.error.title') || 'Failed to load media'}
              message={t('media.error.message') || 'The media could not be loaded. Please try again.'}
              retryLabel={t('media.error.retry') || 'Retry'}
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
        <div 
          className={cn(
            'relative w-full h-full',
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
      ) : isValidUrl ? (
        <div className="relative w-full h-full">
          <video
            key={`video-${retryKey}-${mediaUrl}`} // Force remount on retry
            ref={videoRef}
            src={mediaUrl}
            className="w-full h-full object-cover"
            controls={controls}
          autoPlay={autoPlay}
          loop={loop}
          muted={muted}
          poster={poster}
          preload={preloadStrategy}
          playsInline
          onVolumeChange={(e) => {
            // Update persisted volume when user changes volume via controls
            const newVolume = e.currentTarget.volume
            if (newVolume !== persistedVolume) {
              setPersistedVolume(newVolume)
              logDebug('Video volume changed', { 
                oldVolume: persistedVolume, 
                newVolume,
                muted: e.currentTarget.muted,
              })
            }
          }}
          onRateChange={(e) => {
            // Update persisted playback speed when user changes speed via controls
            const newSpeed = e.currentTarget.playbackRate
            // Find closest valid speed option
            const closestSpeed = PLAYBACK_SPEED_OPTIONS.reduce((prev, curr) => {
              return Math.abs(curr - newSpeed) < Math.abs(prev - newSpeed) ? curr : prev
            }, playbackSpeed)
            if (closestSpeed !== playbackSpeed) {
              setPersistedPlaybackSpeed(closestSpeed)
              logDebug('Video playback speed changed', { 
                oldSpeed: playbackSpeed, 
                newSpeed,
                closestSpeed,
              })
            }
          }}
          onLoadStart={() => {
            // Video loading started - ensure loading state is true
            setIsLoading(true)
            setHasError(false)
            setShowFallback(false)
            logDebug('Video load started', { url: mediaUrl.substring(0, 50) + '...' })
          }}
          onLoadedMetadata={() => {
            // Metadata loaded - video is ready to play
            logDebug('Video metadata loaded', { url: mediaUrl.substring(0, 50) + '...' })
            // Clear error state if metadata loaded successfully
            setHasError(false)
            setShowFallback(false)
            // Try to load more data after metadata is loaded
            if (videoRef.current && videoRef.current.readyState >= 1) {
              // Video has metadata, try to load more
              videoRef.current.load()
            }
          }}
          onLoadedData={() => {
            // First frame loaded - video is ready
            logDebug('Video data loaded', { url: mediaUrl.substring(0, 50) + '...' })
            handleLoad()
          }}
          onCanPlay={() => {
            // Video can start playing - clear loading state
            logDebug('Video can play', { url: mediaUrl.substring(0, 50) + '...' })
            handleLoad()
          }}
          onCanPlayThrough={() => {
            // Video can play through without buffering
            logDebug('Video can play through', { url: mediaUrl.substring(0, 50) + '...' })
            handleLoad()
          }}
          onPlay={() => {
            // Notify parent when video starts playing (including autoplay)
            onPlay?.()
            // Start tracking for analytics
            startTracking()
            recordEvent('play')
          }}
          onEnded={() => {
            // Video ended - notify parent (for playlist mode)
            onEnded?.()
            // Record ended event for analytics
            recordEvent('ended')
            // Stop tracking
            stopTracking()
            logDebug('Video ended', { storyId })
          }}
          onStalled={() => {
            // Video stalled (buffering) - don't show error, just log
            logDebug('Video stalled (buffering)', { url: mediaUrl.substring(0, 50) + '...' })
          }}
          onWaiting={() => {
            // Video waiting for data - don't show error, just log
            logDebug('Video waiting for data', { url: mediaUrl.substring(0, 50) + '...' })
            // Record buffering event
            recordEvent('buffering')
          }}
          onError={(e) => {
            // Get more detailed error information
            const video = e.currentTarget
            const error = video.error
            let errorMessage = 'Video load failed'
            
            if (error) {
              switch (error.code) {
                case error.MEDIA_ERR_ABORTED:
                  // Aborted is usually not a real error (user navigated away, etc.)
                  logDebug('Video loading aborted (normal)', { url: mediaUrl.substring(0, 50) + '...' })
                  return // Don't show error for aborted
                case error.MEDIA_ERR_NETWORK:
                  errorMessage = 'Network error while loading video'
                  break
                case error.MEDIA_ERR_DECODE:
                  errorMessage = 'Video decoding error'
                  break
                case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
                  errorMessage = 'Video format not supported or URL invalid'
                  break
                default:
                  errorMessage = 'Video load failed'
              }
            }
            
            // Only show error if video is actually in error state
            // Sometimes onError fires but video can still load
            if (video.readyState === 0) { // HAVE_NOTHING - video hasn't loaded anything
              // Log detailed error information for debugging
              logWarn('Video load error', { 
                error: new Error(errorMessage),
                code: error?.code,
                readyState: video.readyState,
                url: mediaUrl,
                networkState: video.networkState,
                errorMessage: error?.message,
                // Check if URL is accessible
                urlCheck: {
                  isValid: isValidUrl,
                  startsWithHttp: mediaUrl?.startsWith('http'),
                  startsWithHttps: mediaUrl?.startsWith('https'),
                  hasExtension: /\.(mp4|webm|mov|avi|mkv)/i.test(mediaUrl || ''),
                }
              })
              handleError(new Error(`${errorMessage}. URL: ${mediaUrl?.substring(0, 100)}`))
            } else {
              // Video has some data loaded - might still work
              logDebug('Video error but has data, continuing...', { 
                readyState: video.readyState,
                code: error?.code,
                url: mediaUrl.substring(0, 50) + '...'
              })
            }
          }}
          />
          {/* Picture-in-Picture Button */}
          {isPiPSupported && (
            <button
              onClick={togglePictureInPicture}
              className={cn(
                'absolute top-2 right-2 z-10',
                'p-2 rounded-lg',
                'bg-black/60 hover:bg-black/80',
                'text-white',
                'transition-all ease-smooth',
                'focus:outline-none focus:ring-2 focus:ring-brand-cyan focus:ring-offset-2 focus:ring-offset-gray-800',
                'backdrop-blur-sm',
                'shadow-lg'
              )}
              aria-label={isPictureInPicture ? 'Exit Picture-in-Picture' : 'Enter Picture-in-Picture'}
              title={isPictureInPicture ? 'Exit Picture-in-Picture' : 'Enter Picture-in-Picture'}
            >
              {isPictureInPicture ? (
                <X className="w-5 h-5" />
              ) : (
                <PictureInPicture className="w-5 h-5" />
              )}
            </button>
          )}
          {/* Network Quality Indicator */}
          {networkQuality !== 'unknown' && (
            <div
              className={cn(
                'absolute top-2 left-2 z-10',
                'px-2 py-1 rounded-lg',
                'bg-black/60 backdrop-blur-sm',
                'text-white text-xs font-medium',
                'flex items-center gap-1.5',
                'shadow-lg'
              )}
              title={`Network: ${networkQuality} (Quality: ${videoQuality})`}
            >
              {networkQuality === 'slow' ? (
                <WifiOff className="w-3.5 h-3.5 text-yellow-400" />
              ) : networkQuality === 'fast' ? (
                <Wifi className="w-3.5 h-3.5 text-green-400" />
              ) : (
                <Wifi className="w-3.5 h-3.5 text-blue-400" />
              )}
              <span className="capitalize">{networkQuality}</span>
            </div>
          )}
        </div>
      ) : (
        // Invalid URL - show error state
        <div className={cn('relative aspect-[9/16] w-full rounded-lg overflow-hidden bg-gray-800/60', className)}>
          <ErrorState
            title={t('media.error.title') || 'Failed to load media'}
            message={t('media.error.message') || 'The media could not be loaded. Please try again.'}
            retryLabel={t('media.error.retry') || 'Retry'}
            onRetry={() => {
              setRetryKey((prev) => prev + 1)
              setHasError(false)
              setShowFallback(false)
            }}
          />
        </div>
      )}

      {/* Image Lightbox */}
      {mediaType === 'image' && enableLightbox && (
        <ImageLightbox
          imageUrl={mediaUrl}
          alt={alt}
          isOpen={isLightboxOpen}
          onClose={() => setIsLightboxOpen(false)}
        />
      )}
    </div>
  )
}

