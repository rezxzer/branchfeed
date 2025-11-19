/**
 * useNetworkQuality Hook
 * 
 * Detects network connection quality and speed
 * Uses Navigator Connection API and Network Information API
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { logDebug, logWarn } from '@/lib/logger'

export type NetworkQuality = 'slow' | 'medium' | 'fast' | 'unknown'

export interface NetworkConnectionInfo {
  /** Effective connection type: 'slow-2g' | '2g' | '3g' | '4g' */
  effectiveType?: string
  
  /** Downlink speed in Mbps */
  downlink?: number
  
  /** Round-trip time in milliseconds */
  rtt?: number
  
  /** Whether save-data mode is enabled */
  saveData?: boolean
  
  /** Network quality classification */
  quality: NetworkQuality
}

export interface UseNetworkQualityOptions {
  /** Polling interval in milliseconds (default: 5000) */
  pollInterval?: number
  
  /** Threshold for slow connection (downlink in Mbps, default: 1.5) */
  slowThreshold?: number
  
  /** Threshold for fast connection (downlink in Mbps, default: 5.0) */
  fastThreshold?: number
  
  /** Callback when network quality changes */
  onQualityChange?: (quality: NetworkQuality) => void
}

export interface UseNetworkQualityReturn {
  /** Current network quality */
  quality: NetworkQuality
  
  /** Network connection information */
  connectionInfo: NetworkConnectionInfo
  
  /** Whether connection is slow */
  isSlow: boolean
  
  /** Whether connection is fast */
  isFast: boolean
  
  /** Whether save-data mode is enabled */
  isSaveData: boolean
  
  /** Refresh network quality manually */
  refresh: () => void
}

/**
 * Hook to detect network connection quality
 * 
 * @param options - Network quality detection options
 * @returns Object with network quality state and information
 * 
 * @example
 * ```tsx
 * const { quality, isSlow, connectionInfo } = useNetworkQuality({
 *   onQualityChange: (quality) => {
 *     console.log('Network quality changed:', quality)
 *   }
 * })
 * 
 * if (isSlow) {
 *   // Use lower quality video
 * }
 * ```
 */
export function useNetworkQuality(
  options: UseNetworkQualityOptions = {}
): UseNetworkQualityReturn {
  const {
    pollInterval = 5000,
    slowThreshold = 1.5, // Mbps
    fastThreshold = 5.0, // Mbps
    onQualityChange,
  } = options

  const [quality, setQuality] = useState<NetworkQuality>('unknown')
  const [connectionInfo, setConnectionInfo] = useState<NetworkConnectionInfo>({
    quality: 'unknown',
  })
  
  const previousQualityRef = useRef<NetworkQuality>('unknown')
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Get network connection information
  const getConnectionInfo = useCallback((): NetworkConnectionInfo => {
    // Check if Navigator Connection API is available
    const connection = 
      (navigator as any).connection ||
      (navigator as any).mozConnection ||
      (navigator as any).webkitConnection

    if (!connection) {
      logDebug('Network Connection API not available')
      return {
        quality: 'unknown',
      }
    }

    const effectiveType = connection.effectiveType
    const downlink = connection.downlink // Mbps
    const rtt = connection.rtt // milliseconds
    const saveData = connection.saveData || false

    // Determine quality based on downlink speed
    let quality: NetworkQuality = 'unknown'
    
    if (downlink !== undefined) {
      if (downlink < slowThreshold) {
        quality = 'slow'
      } else if (downlink >= fastThreshold) {
        quality = 'fast'
      } else {
        quality = 'medium'
      }
    } else if (effectiveType) {
      // Fallback to effectiveType if downlink is not available
      if (effectiveType === 'slow-2g' || effectiveType === '2g') {
        quality = 'slow'
      } else if (effectiveType === '4g') {
        quality = 'fast'
      } else {
        quality = 'medium'
      }
    }

    // Override to slow if save-data mode is enabled
    if (saveData && quality !== 'slow') {
      quality = 'slow'
      logDebug('Save-data mode enabled, using slow quality')
    }

    return {
      effectiveType,
      downlink,
      rtt,
      saveData,
      quality,
    }
  }, [slowThreshold, fastThreshold])

  // Update network quality
  const updateQuality = useCallback(() => {
    const info = getConnectionInfo()
    const newQuality = info.quality

    setConnectionInfo(info)
    setQuality(newQuality)

    // Notify if quality changed
    if (previousQualityRef.current !== newQuality) {
      logDebug('Network quality changed', {
        from: previousQualityRef.current,
        to: newQuality,
        downlink: info.downlink,
        effectiveType: info.effectiveType,
      })
      
      previousQualityRef.current = newQuality
      onQualityChange?.(newQuality)
    }
  }, [getConnectionInfo, onQualityChange])

  // Initial quality check
  useEffect(() => {
    updateQuality()
  }, [updateQuality])

  // Set up polling for connection changes
  useEffect(() => {
    const connection = 
      (navigator as any).connection ||
      (navigator as any).mozConnection ||
      (navigator as any).webkitConnection

    if (!connection) {
      logDebug('Network Connection API not available, skipping polling')
      return
    }

    // Listen for connection changes
    const handleConnectionChange = () => {
      updateQuality()
    }

    connection.addEventListener('change', handleConnectionChange)

    // Also poll periodically as fallback
    if (pollInterval > 0) {
      intervalRef.current = setInterval(updateQuality, pollInterval)
    }

    return () => {
      connection.removeEventListener('change', handleConnectionChange)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [updateQuality, pollInterval])

  // Manual refresh function
  const refresh = useCallback(() => {
    updateQuality()
  }, [updateQuality])

  const isSlow = quality === 'slow'
  const isFast = quality === 'fast'
  const isSaveData = connectionInfo.saveData || false

  return {
    quality,
    connectionInfo,
    isSlow,
    isFast,
    isSaveData,
    refresh,
  }
}

