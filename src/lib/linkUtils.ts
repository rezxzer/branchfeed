/**
 * Link validation and sanitization utilities
 * Prevents malicious links and ensures safe external link handling
 */

export interface LinkValidationResult {
  isValid: boolean
  isExternal: boolean
  sanitizedUrl: string | null
  error?: string
}

/**
 * Allowed URL protocols
 */
const ALLOWED_PROTOCOLS = ['http:', 'https:']

/**
 * Blocked URL protocols (security risk)
 */
const BLOCKED_PROTOCOLS = ['javascript:', 'data:', 'vbscript:', 'file:', 'about:']

/**
 * Whitelist of allowed domains (optional - if empty, all domains are allowed)
 * Add your own domain here to restrict links to specific domains
 */
const ALLOWED_DOMAINS: string[] = []

/**
 * Get current site domain from environment or window
 */
function getCurrentDomain(): string {
  if (typeof window !== 'undefined') {
    return window.location.hostname
  }
  if (process.env.NEXT_PUBLIC_APP_URL) {
    try {
      return new URL(process.env.NEXT_PUBLIC_APP_URL).hostname
    } catch {
      return ''
    }
  }
  return ''
}

/**
 * Validate and sanitize a URL
 */
export function validateAndSanitizeUrl(url: string): LinkValidationResult {
  // Trim whitespace
  url = url.trim()

  // Empty URL
  if (!url) {
    return {
      isValid: false,
      isExternal: false,
      sanitizedUrl: null,
      error: 'URL is empty',
    }
  }

  // Add protocol if missing (assume https)
  let urlWithProtocol = url
  if (!url.match(/^[a-zA-Z][a-zA-Z\d+\-.]*:/)) {
    urlWithProtocol = `https://${url}`
  }

  let parsedUrl: URL | null = null
  try {
    parsedUrl = new URL(urlWithProtocol)
  } catch (error) {
    return {
      isValid: false,
      isExternal: false,
      sanitizedUrl: null,
      error: 'Invalid URL format',
    }
  }

  // Check for blocked protocols
  const protocol = parsedUrl.protocol.toLowerCase()
  if (BLOCKED_PROTOCOLS.includes(protocol)) {
    return {
      isValid: false,
      isExternal: false,
      sanitizedUrl: null,
      error: 'Blocked protocol',
    }
  }

  // Check for allowed protocols
  if (!ALLOWED_PROTOCOLS.includes(protocol)) {
    return {
      isValid: false,
      isExternal: false,
      sanitizedUrl: null,
      error: 'Protocol not allowed',
    }
  }

  // Check domain whitelist (if configured)
  if (ALLOWED_DOMAINS.length > 0) {
    const hostname = parsedUrl.hostname.toLowerCase()
    const isAllowed = ALLOWED_DOMAINS.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`))
    if (!isAllowed) {
      return {
        isValid: false,
        isExternal: false,
        sanitizedUrl: null,
        error: 'Domain not allowed',
      }
    }
  }

  // Determine if external
  const currentDomain = getCurrentDomain()
  const isExternal = currentDomain ? parsedUrl.hostname.toLowerCase() !== currentDomain.toLowerCase() : true

  // Return sanitized URL
  return {
    isValid: true,
    isExternal,
    sanitizedUrl: parsedUrl.toString(),
  }
}

/**
 * Extract URLs from text
 */
export function extractUrls(text: string): string[] {
  // URL regex pattern (matches http/https URLs)
  const urlPattern = /https?:\/\/[^\s<>"{}|\\^`\[\]]+/gi
  const matches = text.match(urlPattern)
  return matches || []
}

/**
 * Check if text contains URLs
 */
export function containsUrls(text: string): boolean {
  return extractUrls(text).length > 0
}

/**
 * Get link security attributes for external links
 */
export function getLinkSecurityAttributes(isExternal: boolean): {
  rel?: string
  target?: string
} {
  if (isExternal) {
    return {
      rel: 'noopener noreferrer',
      target: '_blank',
    }
  }
  return {}
}

