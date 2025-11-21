'use client'

import { useRef, useEffect, useState, forwardRef } from 'react'
import { Spinner } from './Spinner'
import { cn } from '@/lib/utils'
import { Play, Volume2, VolumeX, Maximize } from 'lucide-react'

export interface VideoPlayerProps {
  /** Video URL (required) */
  src: string
  
  /** Poster/thumbnail image (optional) */
  poster?: string
  
  /** Auto-play video (default: false) */
  autoPlay?: boolean
  
  /** Show controls (default: true) */
  controls?: boolean
  
  /** Loop video (default: false) */
  loop?: boolean
  
  /** Muted (default: false for manual play, true for autoplay) */
  muted?: boolean
  
  /** Aspect ratio (default: '9/16' for vertical stories) */
  aspectRatio?: '9/16' | '16/9' | '1/1' | '4/3'
  
  /** Custom className */
  className?: string
  
  /** Callback when video is loaded and ready to play */
  onReady?: () => void
  
  /** Callback when video starts playing */
  onPlay?: () => void
  
  /** Callback when video is paused */
  onPause?: () => void
  
  /** Callback when video ends */
  onEnded?: () => void
  
  /** Callback on error */
  onError?: (error: Error) => void
}

/**
 * Simplified, reliable VideoPlayer component
 * 
 * Features:
 * - Autoplay with proper handling
 * - Loading states
 * - Error handling with retry
 * - Custom controls overlay
 * - Mobile-friendly
 * - Accessible
 * 
 * Usage:
 * ```tsx
 * <VideoPlayer 
 *   src={videoUrl} 
 *   autoPlay={true}
 *   poster={thumbnailUrl}
 *   onReady={() => console.log('ready')}
 * />
 * ```
 */
export const VideoPlayer = forwardRef<HTMLVideoElement, VideoPlayerProps>(
  (
    {
      src,
      poster,
      autoPlay = false,
      controls = true,
      loop = false,
      muted: mutedProp,
      aspectRatio = '9/16',
      className,
      onReady,
      onPlay,
      onPause,
      onEnded,
      onError,
    },
    ref
  ) => {
    const videoRef = useRef<HTMLVideoElement>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [hasError, setHasError] = useState(false)
    const [isPlaying, setIsPlaying] = useState(false)
    const [isMuted, setIsMuted] = useState(mutedProp ?? autoPlay) // Auto-mute if autoplay
    const [showControls, setShowControls] = useState(true)
    const hideControlsTimeoutRef = useRef<NodeJS.Timeout>()

    // Combine refs (forwardRef + internal ref)
    useEffect(() => {
      if (ref && videoRef.current) {
        if (typeof ref === 'function') {
          ref(videoRef.current)
        } else {
          ref.current = videoRef.current
        }
      }
    }, [ref])

    // Auto-hide controls after 3 seconds (if playing)
    useEffect(() => {
      if (isPlaying && controls) {
        hideControlsTimeoutRef.current = setTimeout(() => {
          setShowControls(false)
        }, 3000)
      } else {
        setShowControls(true)
      }

      return () => {
        if (hideControlsTimeoutRef.current) {
          clearTimeout(hideControlsTimeoutRef.current)
        }
      }
    }, [isPlaying, controls])

    // Handle video loaded (ready to play)
    const handleLoadedData = () => {
      setIsLoading(false)
      setHasError(false)
      onReady?.()
    }

    // Handle video error
    const handleError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
      const video = e.currentTarget
      const error = video.error

      let errorMessage = 'Failed to load video'
      if (error) {
        switch (error.code) {
          case error.MEDIA_ERR_NETWORK:
            errorMessage = 'Network error while loading video'
            break
          case error.MEDIA_ERR_DECODE:
            errorMessage = 'Video decoding error'
            break
          case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
            errorMessage = 'Video format not supported'
            break
          default:
            errorMessage = 'Failed to load video'
        }
      }

      setIsLoading(false)
      setHasError(true)
      onError?.(new Error(errorMessage))
    }

    // Handle play/pause
    const handlePlayPause = () => {
      const video = videoRef.current
      if (!video) return

      if (video.paused) {
        video.play()
      } else {
        video.pause()
      }
    }

    // Handle mute/unmute
    const handleMuteToggle = () => {
      const video = videoRef.current
      if (!video) return

      video.muted = !video.muted
      setIsMuted(video.muted)
    }

    // Handle fullscreen
    const handleFullscreen = () => {
      const video = videoRef.current
      if (!video) return

      if (video.requestFullscreen) {
        video.requestFullscreen()
      } else if ((video as any).webkitRequestFullscreen) {
        ;(video as any).webkitRequestFullscreen()
      }
    }

    // Retry loading video
    const handleRetry = () => {
      const video = videoRef.current
      if (!video) return

      setIsLoading(true)
      setHasError(false)
      video.load()
    }

    // Aspect ratio mapping
    const aspectRatioClass = {
      '9/16': 'aspect-[9/16]',
      '16/9': 'aspect-video',
      '1/1': 'aspect-square',
      '4/3': 'aspect-[4/3]',
    }[aspectRatio]

    return (
      <div
        className={cn(
          'relative w-full rounded-lg overflow-hidden bg-gray-900',
          aspectRatioClass,
          className
        )}
        onMouseEnter={() => setShowControls(true)}
        onMouseMove={() => setShowControls(true)}
        onMouseLeave={() => isPlaying && setShowControls(false)}
      >
        {/* Video Element */}
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          autoPlay={autoPlay}
          loop={loop}
          muted={isMuted}
          playsInline
          preload="metadata"
          className="w-full h-full object-cover"
          onLoadedData={handleLoadedData}
          onPlay={() => {
            setIsPlaying(true)
            onPlay?.()
          }}
          onPause={() => {
            setIsPlaying(false)
            onPause?.()
          }}
          onEnded={() => {
            setIsPlaying(false)
            onEnded?.()
          }}
          onError={handleError}
        />

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm z-10">
            <Spinner size="lg" />
          </div>
        )}

        {/* Error Overlay */}
        {hasError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/90 backdrop-blur-sm z-10 p-4">
            <div className="text-center">
              <div className="text-4xl mb-4">⚠️</div>
              <p className="text-white font-medium mb-2">Failed to load video</p>
              <p className="text-gray-400 text-sm mb-4">
                The video could not be loaded. Please try again.
              </p>
              <button
                onClick={handleRetry}
                className="px-4 py-2 bg-brand-cyan hover:bg-brand-cyan/90 text-gray-900 font-medium rounded-lg transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Custom Controls Overlay */}
        {controls && !isLoading && !hasError && (
          <div
            className={cn(
              'absolute inset-0 flex items-center justify-center transition-opacity duration-300 z-20',
              showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
            )}
          >
            {/* Play/Pause Button (center) */}
            <button
              onClick={handlePlayPause}
              className="w-16 h-16 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-sm flex items-center justify-center transition-all ease-smooth"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {!isPlaying && (
                <Play className="w-8 h-8 text-white ml-1" fill="white" />
              )}
            </button>

            {/* Bottom Controls Bar */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <div className="flex items-center gap-3">
                {/* Mute/Unmute Button */}
                <button
                  onClick={handleMuteToggle}
                  className="p-2 rounded-lg bg-black/40 hover:bg-black/60 transition-colors"
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? (
                    <VolumeX className="w-5 h-5 text-white" />
                  ) : (
                    <Volume2 className="w-5 h-5 text-white" />
                  )}
                </button>

                <div className="flex-1" />

                {/* Fullscreen Button */}
                <button
                  onClick={handleFullscreen}
                  className="p-2 rounded-lg bg-black/40 hover:bg-black/60 transition-colors"
                  aria-label="Fullscreen"
                >
                  <Maximize className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }
)

VideoPlayer.displayName = 'VideoPlayer'
