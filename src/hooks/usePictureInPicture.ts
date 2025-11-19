/**
 * usePictureInPicture Hook
 * 
 * Manages Picture-in-Picture (PiP) functionality for video elements
 * Provides PiP state, enter/exit functions, and browser compatibility checks
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { logDebug, logWarn, logError } from '@/lib/logger'

export interface UsePictureInPictureOptions {
  /** Video element ref */
  videoRef: React.RefObject<HTMLVideoElement>
  
  /** Callback when PiP enters */
  onEnter?: () => void
  
  /** Callback when PiP exits */
  onExit?: () => void
  
  /** Callback when PiP error occurs */
  onError?: (error: Error) => void
}

export interface UsePictureInPictureReturn {
  /** Whether PiP is currently active */
  isPictureInPicture: boolean
  
  /** Whether PiP is supported in this browser */
  isSupported: boolean
  
  /** Enter Picture-in-Picture mode */
  enterPictureInPicture: () => Promise<void>
  
  /** Exit Picture-in-Picture mode */
  exitPictureInPicture: () => Promise<void>
  
  /** Toggle Picture-in-Picture mode */
  togglePictureInPicture: () => Promise<void>
}

/**
 * Hook to manage Picture-in-Picture (PiP) functionality for video elements
 * 
 * @param options - PiP configuration options
 * @returns Object with PiP state and control functions
 * 
 * @example
 * ```tsx
 * const videoRef = useRef<HTMLVideoElement>(null)
 * const { isPictureInPicture, enterPictureInPicture, isSupported } = usePictureInPicture({
 *   videoRef,
 *   onEnter: () => console.log('Entered PiP'),
 *   onExit: () => console.log('Exited PiP'),
 * })
 * 
 * return (
 *   <video ref={videoRef} />
 *   {isSupported && (
 *     <button onClick={enterPictureInPicture}>
 *       {isPictureInPicture ? 'Exit PiP' : 'Enter PiP'}
 *     </button>
 *   )}
 * )
 * ```
 */
export function usePictureInPicture(
  options: UsePictureInPictureOptions
): UsePictureInPictureReturn {
  const { videoRef, onEnter, onExit, onError } = options
  
  const [isPictureInPicture, setIsPictureInPicture] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  
  // Track if we're in the middle of entering/exiting PiP
  const isTransitioningRef = useRef(false)
  
  // Check browser support
  useEffect(() => {
    const video = videoRef.current
    if (!video) {
      setIsSupported(false)
      return
    }
    
    // Check if Picture-in-Picture API is supported
    const supported = 
      'pictureInPictureEnabled' in document &&
      document.pictureInPictureEnabled !== false &&
      video.requestPictureInPicture !== undefined
    
    setIsSupported(supported)
    
    if (!supported) {
      logDebug('Picture-in-Picture is not supported in this browser')
    }
  }, [videoRef])
  
  // Listen for PiP state changes
  useEffect(() => {
    const video = videoRef.current
    if (!video || !isSupported) return
    
    const handleEnterPictureInPicture = () => {
      setIsPictureInPicture(true)
      isTransitioningRef.current = false
      logDebug('Entered Picture-in-Picture mode')
      onEnter?.()
    }
    
    const handleLeavePictureInPicture = () => {
      setIsPictureInPicture(false)
      isTransitioningRef.current = false
      logDebug('Left Picture-in-Picture mode')
      onExit?.()
    }
    
    video.addEventListener('enterpictureinpicture', handleEnterPictureInPicture)
    video.addEventListener('leavepictureinpicture', handleLeavePictureInPicture)
    
    // Also listen on document for cross-window PiP
    document.addEventListener('enterpictureinpicture', handleEnterPictureInPicture)
    document.addEventListener('leavepictureinpicture', handleLeavePictureInPicture)
    
    // Check initial state
    if (document.pictureInPictureElement === video) {
      setIsPictureInPicture(true)
    }
    
    return () => {
      video.removeEventListener('enterpictureinpicture', handleEnterPictureInPicture)
      video.removeEventListener('leavepictureinpicture', handleLeavePictureInPicture)
      document.removeEventListener('enterpictureinpicture', handleEnterPictureInPicture)
      document.removeEventListener('leavepictureinpicture', handleLeavePictureInPicture)
    }
  }, [videoRef, isSupported, onEnter, onExit])
  
  // Enter Picture-in-Picture mode
  const enterPictureInPicture = useCallback(async () => {
    const video = videoRef.current
    if (!video || !isSupported || isTransitioningRef.current) {
      return
    }
    
    // Check if already in PiP
    if (document.pictureInPictureElement === video) {
      logDebug('Already in Picture-in-Picture mode')
      return
    }
    
    try {
      isTransitioningRef.current = true
      await video.requestPictureInPicture()
      logDebug('Successfully entered Picture-in-Picture mode')
    } catch (error) {
      isTransitioningRef.current = false
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      logError('Failed to enter Picture-in-Picture mode', error, {
        errorMessage,
        videoReady: video.readyState >= 2, // HAVE_CURRENT_DATA
      })
      
      // Provide user-friendly error message
      if (errorMessage.includes('not allowed')) {
        logWarn('Picture-in-Picture request not allowed. User interaction may be required.')
      } else if (errorMessage.includes('not supported')) {
        logWarn('Picture-in-Picture is not supported in this browser.')
      }
      
      onError?.(error instanceof Error ? error : new Error(errorMessage))
    }
  }, [videoRef, isSupported, onError])
  
  // Exit Picture-in-Picture mode
  const exitPictureInPicture = useCallback(async () => {
    if (!isSupported || isTransitioningRef.current) {
      return
    }
    
    // Check if we're in PiP
    if (!document.pictureInPictureElement) {
      logDebug('Not in Picture-in-Picture mode')
      return
    }
    
    try {
      isTransitioningRef.current = true
      await document.exitPictureInPicture()
      logDebug('Successfully exited Picture-in-Picture mode')
    } catch (error) {
      isTransitioningRef.current = false
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      logError('Failed to exit Picture-in-Picture mode', error, {
        errorMessage,
      })
      onError?.(error instanceof Error ? error : new Error(errorMessage))
    }
  }, [isSupported, onError])
  
  // Toggle Picture-in-Picture mode
  const togglePictureInPicture = useCallback(async () => {
    if (isPictureInPicture) {
      await exitPictureInPicture()
    } else {
      await enterPictureInPicture()
    }
  }, [isPictureInPicture, enterPictureInPicture, exitPictureInPicture])
  
  return {
    isPictureInPicture,
    isSupported,
    enterPictureInPicture,
    exitPictureInPicture,
    togglePictureInPicture,
  }
}

