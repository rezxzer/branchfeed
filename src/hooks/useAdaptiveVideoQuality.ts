/**
 * useAdaptiveVideoQuality Hook
 * 
 * Manages adaptive video quality selection based on network connection
 * Automatically selects appropriate video quality/bitrate
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { useNetworkQuality, NetworkQuality } from './useNetworkQuality'
import { logDebug, logWarn } from '@/lib/logger'

export type VideoQuality = 'low' | 'medium' | 'high' | 'auto'

export interface VideoQualityOption {
  /** Quality label */
  label: string
  
  /** Quality value */
  value: VideoQuality
  
  /** Recommended bitrate in Mbps */
  bitrate?: number
  
  /** Recommended resolution (e.g., '480p', '720p', '1080p') */
  resolution?: string
}

export interface UseAdaptiveVideoQualityOptions {
  /** Default quality (default: 'auto') */
  defaultQuality?: VideoQuality
  
  /** Whether to enable adaptive quality (default: true) */
  enableAdaptive?: boolean
  
  /** Callback when quality changes */
  onQualityChange?: (quality: VideoQuality) => void
  
  /** Custom quality mapping (network quality -> video quality) */
  qualityMap?: Partial<Record<NetworkQuality, VideoQuality>>
  
  /** Polling interval for network quality (default: 5000ms) */
  pollInterval?: number
}

export interface UseAdaptiveVideoQualityReturn {
  /** Current selected video quality */
  quality: VideoQuality
  
  /** Network quality information */
  networkQuality: NetworkQuality
  
  /** Whether adaptive quality is enabled */
  isAdaptive: boolean
  
  /** Set video quality manually */
  setQuality: (quality: VideoQuality) => void
  
  /** Enable/disable adaptive quality */
  setAdaptive: (enabled: boolean) => void
  
  /** Get recommended quality for current network */
  getRecommendedQuality: () => VideoQuality
  
  /** Quality options */
  qualityOptions: VideoQualityOption[]
}

// Default quality mapping
const DEFAULT_QUALITY_MAP: Record<NetworkQuality, VideoQuality> = {
  slow: 'low',
  medium: 'medium',
  fast: 'high',
  unknown: 'medium', // Default to medium if unknown
}

// Quality options
const QUALITY_OPTIONS: VideoQualityOption[] = [
  {
    label: 'Low (480p)',
    value: 'low',
    bitrate: 1.0,
    resolution: '480p',
  },
  {
    label: 'Medium (720p)',
    value: 'medium',
    bitrate: 2.5,
    resolution: '720p',
  },
  {
    label: 'High (1080p)',
    value: 'high',
    bitrate: 5.0,
    resolution: '1080p',
  },
  {
    label: 'Auto',
    value: 'auto',
  },
]

/**
 * Hook to manage adaptive video quality based on network connection
 * 
 * @param options - Adaptive quality options
 * @returns Object with quality state and control functions
 * 
 * @example
 * ```tsx
 * const { quality, setQuality, isAdaptive } = useAdaptiveVideoQuality({
 *   defaultQuality: 'auto',
 *   enableAdaptive: true,
 *   onQualityChange: (quality) => {
 *     console.log('Quality changed to:', quality)
 *   }
 * })
 * 
 * // Use quality to select video source
 * const videoUrl = getVideoUrlForQuality(quality)
 * ```
 */
export function useAdaptiveVideoQuality(
  options: UseAdaptiveVideoQualityOptions = {}
): UseAdaptiveVideoQualityReturn {
  const {
    defaultQuality = 'auto',
    enableAdaptive = true,
    onQualityChange,
    qualityMap = DEFAULT_QUALITY_MAP,
    pollInterval = 5000,
  } = options

  const [quality, setQualityState] = useState<VideoQuality>(defaultQuality)
  const [isAdaptive, setIsAdaptive] = useState(enableAdaptive)
  const previousQualityRef = useRef<VideoQuality>(defaultQuality)

  // Get network quality
  const { quality: networkQuality, isSlow, isFast } = useNetworkQuality({
    pollInterval,
  })

  // Get recommended quality based on network
  const getRecommendedQuality = useCallback((): VideoQuality => {
    return qualityMap[networkQuality] || DEFAULT_QUALITY_MAP[networkQuality] || 'medium'
  }, [networkQuality, qualityMap])

  // Update quality based on network (if adaptive is enabled)
  useEffect(() => {
    if (!isAdaptive || quality !== 'auto') {
      return
    }

    const recommendedQuality = getRecommendedQuality()
    
    if (recommendedQuality !== quality) {
      logDebug('Adaptive quality change', {
        networkQuality,
        recommendedQuality,
        currentQuality: quality,
      })
      
      setQualityState(recommendedQuality)
      
      if (previousQualityRef.current !== recommendedQuality) {
        previousQualityRef.current = recommendedQuality
        onQualityChange?.(recommendedQuality)
      }
    }
  }, [networkQuality, isAdaptive, quality, getRecommendedQuality, onQualityChange])

  // Set quality manually
  const setQuality = useCallback((newQuality: VideoQuality) => {
    if (newQuality !== quality) {
      logDebug('Manual quality change', {
        from: quality,
        to: newQuality,
      })
      
      setQualityState(newQuality)
      previousQualityRef.current = newQuality
      onQualityChange?.(newQuality)
    }
  }, [quality, onQualityChange])

  // Enable/disable adaptive quality
  const setAdaptive = useCallback((enabled: boolean) => {
    setIsAdaptive(enabled)
    
    if (enabled && quality === 'auto') {
      // Re-evaluate quality when enabling adaptive
      const recommendedQuality = getRecommendedQuality()
      if (recommendedQuality !== quality) {
        setQualityState(recommendedQuality)
        onQualityChange?.(recommendedQuality)
      }
    }
  }, [quality, getRecommendedQuality, onQualityChange])

  return {
    quality,
    networkQuality,
    isAdaptive,
    setQuality,
    setAdaptive,
    getRecommendedQuality,
    qualityOptions: QUALITY_OPTIONS,
  }
}

