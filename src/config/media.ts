/**
 * Media Upload Configuration
 * 
 * Defines rules, limits, and specifications for media uploads
 */

// ============================================
// File Size Limits
// ============================================

export const MEDIA_SIZE_LIMITS = {
  image: {
    max: 10 * 1024 * 1024, // 10MB
    maxMB: 10,
    recommended: 5 * 1024 * 1024, // 5MB recommended
    recommendedMB: 5,
  },
  video: {
    max: 100 * 1024 * 1024, // 100MB
    maxMB: 100,
    recommended: 50 * 1024 * 1024, // 50MB recommended
    recommendedMB: 50,
  },
} as const

// ============================================
// Supported File Formats
// ============================================

export const SUPPORTED_FORMATS = {
  image: {
    mimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
    extensions: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
    display: 'JPEG, PNG, WebP, GIF',
  },
  video: {
    mimeTypes: ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'],
    extensions: ['.mp4', '.webm', '.mov', '.avi'],
    display: 'MP4, WebM, MOV, AVI',
    recommended: 'MP4 (H.264)',
  },
} as const

// ============================================
// Video Specifications
// ============================================

export const VIDEO_SPECS = {
  // Recommended video specs for best experience
  recommended: {
    aspectRatio: '9:16', // Vertical (portrait)
    resolution: '1080x1920', // Full HD vertical
    fps: 30, // 30 frames per second
    codec: 'H.264',
    format: 'MP4',
    duration: {
      min: 3, // 3 seconds
      max: 60, // 60 seconds (1 minute)
      recommended: 30, // 30 seconds
    },
  },
  
  // Alternative acceptable specs
  acceptable: {
    aspectRatios: ['9:16', '16:9', '1:1', '4:3'],
    resolutions: ['720x1280', '1080x1920', '1920x1080'],
    fps: [24, 25, 30, 60],
  },
  
  // Minimum requirements
  minimum: {
    resolution: '480x854', // 480p vertical
    duration: 3, // 3 seconds minimum
  },
} as const

// ============================================
// Image Specifications
// ============================================

export const IMAGE_SPECS = {
  recommended: {
    aspectRatio: '9:16', // Vertical (portrait)
    resolution: '1080x1920',
    format: 'JPEG or PNG',
  },
  
  acceptable: {
    aspectRatios: ['9:16', '16:9', '1:1', '4:3'],
    resolutions: ['720x1280', '1080x1920', '1920x1080'],
  },
  
  minimum: {
    resolution: '480x854',
  },
} as const

// ============================================
// Validation Functions
// ============================================

/**
 * Validate file type
 */
export function isValidFileType(file: File, type: 'image' | 'video'): boolean {
  const formats = SUPPORTED_FORMATS[type]
  
  // Check MIME type
  if (formats.mimeTypes.includes(file.type)) {
    return true
  }
  
  // Check file extension
  const extension = '.' + file.name.split('.').pop()?.toLowerCase()
  return formats.extensions.includes(extension)
}

/**
 * Validate file size
 */
export function isValidFileSize(file: File, type: 'image' | 'video'): boolean {
  const limit = MEDIA_SIZE_LIMITS[type].max
  return file.size <= limit
}

/**
 * Get file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Detect media type from file
 */
export function detectMediaType(file: File): 'image' | 'video' | 'unknown' {
  if (isValidFileType(file, 'video')) return 'video'
  if (isValidFileType(file, 'image')) return 'image'
  return 'unknown'
}

/**
 * Get file validation error message
 */
export function getFileValidationError(file: File, type: 'image' | 'video'): string | null {
  // Check file type
  if (!isValidFileType(file, type)) {
    const formats = SUPPORTED_FORMATS[type]
    return `Invalid file type. Supported formats: ${formats.display}`
  }
  
  // Check file size
  if (!isValidFileSize(file, type)) {
    const limit = MEDIA_SIZE_LIMITS[type]
    const currentSize = formatFileSize(file.size)
    return `File too large (${currentSize}). Maximum size: ${limit.maxMB}MB`
  }
  
  return null
}
