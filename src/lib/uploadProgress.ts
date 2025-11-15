/**
 * Upload Progress Tracker
 * 
 * This module provides utilities for tracking file upload progress.
 * Note: Supabase Storage API doesn't support progress tracking natively,
 * so we simulate progress for better UX.
 */

export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

export type ProgressCallback = (progress: UploadProgress) => void

/**
 * Simulate upload progress for better UX
 * Since Supabase Storage doesn't support progress events,
 * we simulate progress with a smooth animation
 */
export function simulateUploadProgress(
  fileSize: number,
  onProgress: ProgressCallback,
  duration: number = 2000 // 2 seconds default
): Promise<void> {
  return new Promise((resolve) => {
    const startTime = Date.now()
    const interval = 50 // Update every 50ms

    const updateProgress = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 0.95) // Cap at 95% until real upload completes

      onProgress({
        loaded: Math.floor(fileSize * progress),
        total: fileSize,
        percentage: Math.floor(progress * 100),
      })

      if (progress < 0.95) {
        setTimeout(updateProgress, interval)
      } else {
        resolve()
      }
    }

    updateProgress()
  })
}

/**
 * Complete upload progress (100%)
 */
export function completeUploadProgress(
  fileSize: number,
  onProgress: ProgressCallback
): void {
  onProgress({
    loaded: fileSize,
    total: fileSize,
    percentage: 100,
  })
}

