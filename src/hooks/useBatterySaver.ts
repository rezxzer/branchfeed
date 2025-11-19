/**
 * useBatterySaver Hook
 * 
 * Detects low battery and poor connection to reduce autoplay
 * Useful for saving battery and data on mobile devices
 */

import { useEffect, useState, useCallback, useRef } from 'react'

export interface UseBatterySaverOptions {
  /** Disable autoplay if battery level is below this threshold (0.0 to 1.0) */
  batteryThreshold?: number
  /** Disable autoplay if connection is slow (effectiveType) */
  slowConnectionTypes?: string[]
  /** Disable autoplay if saveData is enabled */
  respectSaveData?: boolean
}

export interface UseBatterySaverReturn {
  /** Whether autoplay should be disabled due to battery/connection */
  shouldDisableAutoplay: boolean
  /** Current battery level (0.0 to 1.0, or null if not available) */
  batteryLevel: number | null
  /** Whether device is on low battery */
  isLowBattery: boolean
  /** Whether connection is slow */
  isSlowConnection: boolean
  /** Whether data saver mode is enabled */
  isDataSaver: boolean
}

/**
 * Hook to detect battery saver conditions
 * 
 * @param options - Battery saver detection options
 * @returns Object with shouldDisableAutoplay and status flags
 * 
 * @example
 * ```tsx
 * const { shouldDisableAutoplay } = useBatterySaver({ batteryThreshold: 0.2 })
 * 
 * <Video autoplay={!shouldDisableAutoplay && isInViewport} />
 * ```
 */
export function useBatterySaver(
  options: UseBatterySaverOptions = {}
): UseBatterySaverReturn {
  const {
    batteryThreshold = 0.2, // 20% battery
    slowConnectionTypes = ['slow-2g', '2g'],
    respectSaveData = true,
  } = options

  const [batteryLevel, setBatteryLevel] = useState<number | null>(null)
  const [isLowBattery, setIsLowBattery] = useState(false)
  const [isSlowConnection, setIsSlowConnection] = useState(false)
  const [isDataSaver, setIsDataSaver] = useState(false)

  // Use refs to store latest values to avoid stale closures
  const batteryThresholdRef = useRef(batteryThreshold)
  const batteryManagerRef = useRef<any>(null)

  // Update ref when threshold changes
  useEffect(() => {
    batteryThresholdRef.current = batteryThreshold
  }, [batteryThreshold])

  // Memoize updateBattery to prevent recreating on every render
  const updateBattery = useCallback(() => {
    const battery = batteryManagerRef.current
    if (!battery) return

    const level = battery.level
    const threshold = batteryThresholdRef.current

    // Only update state if values actually changed
    setBatteryLevel((prevLevel) => {
      if (prevLevel === level) return prevLevel
      return level
    })
    
    setIsLowBattery((prevIsLow) => {
      const newIsLow = level < threshold
      if (prevIsLow === newIsLow) return prevIsLow
      return newIsLow
    })
  }, [])

  useEffect(() => {
    // Check if running in browser
    if (typeof window === 'undefined') {
      return
    }

    // 1. Check Battery API (if available)
    let batteryListener: (() => void) | null = null

    if ('getBattery' in navigator) {
      // @ts-ignore - Battery API is not in TypeScript types yet
      navigator.getBattery().then((battery: any) => {
        batteryManagerRef.current = battery

        // Initial update
        const level = battery.level
        const threshold = batteryThresholdRef.current
        setBatteryLevel(level)
        setIsLowBattery(level < threshold)

        // Listen for battery changes
        battery.addEventListener('levelchange', updateBattery)
        battery.addEventListener('chargingchange', updateBattery)

        batteryListener = () => {
          battery.removeEventListener('levelchange', updateBattery)
          battery.removeEventListener('chargingchange', updateBattery)
        }
      }).catch(() => {
        // Battery API not supported or failed
        setBatteryLevel(null)
      })
    }

    // 2. Check Network Information API (if available)
    const updateConnection = () => {
      // @ts-ignore - NetworkInformation API is not in TypeScript types yet
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection

      if (connection) {
        const effectiveType = connection.effectiveType || ''
        const saveData = connection.saveData || false

        setIsSlowConnection(slowConnectionTypes.includes(effectiveType))
        setIsDataSaver(respectSaveData && saveData)
      } else {
        setIsSlowConnection(false)
        setIsDataSaver(false)
      }
    }

    updateConnection()

    // Listen for connection changes
    window.addEventListener('online', updateConnection)
    window.addEventListener('offline', updateConnection)

    // @ts-ignore
    const connection = (navigator as any).connection
    if (connection) {
      connection.addEventListener('change', updateConnection)
    }

    return () => {
      // Cleanup battery listeners
      if (batteryListener) {
        batteryListener()
      }
      batteryManagerRef.current = null

      // Cleanup connection listeners
      window.removeEventListener('online', updateConnection)
      window.removeEventListener('offline', updateConnection)
      if (connection) {
        connection.removeEventListener('change', updateConnection)
      }
    }
  }, [updateBattery, slowConnectionTypes, respectSaveData])

  // Determine if autoplay should be disabled
  const shouldDisableAutoplay = isLowBattery || isSlowConnection || isDataSaver

  return {
    shouldDisableAutoplay,
    batteryLevel,
    isLowBattery,
    isSlowConnection,
    isDataSaver,
  }
}

