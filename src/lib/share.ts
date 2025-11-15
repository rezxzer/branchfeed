'use client'

/**
 * Share Functions - BranchFeed
 * 
 * Functions for sharing stories with current path
 */

/**
 * Copy story link to clipboard
 * @param storyId - Story ID
 * @param path - Current path (optional, for deep linking)
 * @returns Promise that resolves when link is copied
 */
export async function copyStoryLink(
  storyId: string,
  path?: ('A' | 'B')[]
): Promise<void> {
  // Build URL with path if provided
  let url = `${window.location.origin}/story/${storyId}`
  
  if (path && path.length > 0) {
    // Add path as query parameter
    const pathParam = path.join(',')
    url += `?path=${pathParam}`
  }

  try {
    // Use Clipboard API if available
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(url)
      return
    }

    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = url
    textArea.style.position = 'fixed'
    textArea.style.left = '-999999px'
    textArea.style.top = '-999999px'
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()

    try {
      document.execCommand('copy')
      textArea.remove()
    } catch (err) {
      textArea.remove()
      throw new Error('Failed to copy link')
    }
  } catch (err) {
    console.error('Error copying link:', err)
    throw new Error('Failed to copy link to clipboard')
  }
}

/**
 * Share story to social media platforms
 * @param platform - Social media platform ('twitter' | 'facebook' | 'linkedin')
 * @param storyId - Story ID
 * @param path - Current path (optional)
 * @returns Promise that resolves when share window opens
 */
export async function shareToSocial(
  platform: 'twitter' | 'facebook' | 'linkedin',
  storyId: string,
  path?: ('A' | 'B')[]
): Promise<void> {
  // Build URL
  let url = `${window.location.origin}/story/${storyId}`
  
  if (path && path.length > 0) {
    const pathParam = path.join(',')
    url += `?path=${pathParam}`
  }

  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent('Check out this branching story on BranchFeed!')

  let shareUrl = ''

  switch (platform) {
    case 'twitter':
      shareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`
      break
    case 'facebook':
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
      break
    case 'linkedin':
      shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`
      break
    default:
      throw new Error(`Unsupported platform: ${platform}`)
  }

  // Open share window
  window.open(shareUrl, '_blank', 'width=600,height=400')
}

/**
 * Share using Web Share API (if available)
 * @param storyId - Story ID
 * @param path - Current path (optional)
 * @param title - Story title (optional)
 * @returns Promise that resolves when share dialog is shown
 */
export async function shareNative(
  storyId: string,
  path?: ('A' | 'B')[],
  title?: string
): Promise<void> {
  // Check if Web Share API is available
  if (!navigator.share) {
    // Fallback to copy link
    await copyStoryLink(storyId, path)
    return
  }

  // Build URL
  let url = `${window.location.origin}/story/${storyId}`
  
  if (path && path.length > 0) {
    const pathParam = path.join(',')
    url += `?path=${pathParam}`
  }

  try {
    await navigator.share({
      title: title || 'Check out this branching story on BranchFeed!',
      text: title || 'Check out this branching story on BranchFeed!',
      url: url,
    })
  } catch (err) {
    // User cancelled or error occurred
    if ((err as Error).name !== 'AbortError') {
      console.error('Error sharing:', err)
      // Fallback to copy link
      await copyStoryLink(storyId, path)
    }
  }
}

