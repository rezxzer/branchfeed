'use client'

import { SafeLink } from './SafeLink'
import { extractUrls, validateAndSanitizeUrl } from '@/lib/linkUtils'

interface LinkRendererProps {
  /** Text content that may contain URLs */
  text: string
  /** Custom className */
  className?: string
  /** Show external link icon */
  showExternalIcon?: boolean
  /** Show warning for external links */
  showWarning?: boolean
}

/**
 * LinkRenderer component - parses text and renders links
 * Automatically detects and renders URLs in text as clickable links
 */
export function LinkRenderer({ text, className, showExternalIcon = false, showWarning = false }: LinkRendererProps) {
  const urls = extractUrls(text)

  // If no URLs, return plain text
  if (urls.length === 0) {
    return <span className={className}>{text}</span>
  }

  // Split text by URLs and render
  const parts: (string | { type: 'url'; url: string; index: number })[] = []
  let lastIndex = 0

  urls.forEach((url, index) => {
    const urlIndex = text.indexOf(url, lastIndex)
    if (urlIndex > lastIndex) {
      parts.push(text.substring(lastIndex, urlIndex))
    }
    parts.push({ type: 'url', url, index })
    lastIndex = urlIndex + url.length
  })

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex))
  }

  return (
    <span className={className}>
      {parts.map((part, i) => {
        if (typeof part === 'string') {
          return <span key={i}>{part}</span>
        }

        const validation = validateAndSanitizeUrl(part.url)
        if (!validation.isValid || !validation.sanitizedUrl) {
          return <span key={i}>{part.url}</span>
        }

        return (
          <SafeLink
            key={i}
            href={validation.sanitizedUrl}
            showExternalIcon={showExternalIcon}
            showWarning={showWarning}
            className="text-brand-cyan hover:text-brand-cyan/80 underline"
          >
            {part.url}
          </SafeLink>
        )
      })}
    </span>
  )
}

