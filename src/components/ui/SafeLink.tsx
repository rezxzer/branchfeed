'use client'

import Link from 'next/link'
import { ExternalLink, AlertTriangle } from 'lucide-react'
import { validateAndSanitizeUrl, getLinkSecurityAttributes } from '@/lib/linkUtils'
import { cn } from '@/lib/utils'

interface SafeLinkProps {
  /** URL to link to */
  href: string
  /** Link text/content */
  children: React.ReactNode
  /** Custom className */
  className?: string
  /** Show external link icon */
  showExternalIcon?: boolean
  /** Show warning for external links */
  showWarning?: boolean
  /** Custom onClick handler */
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void
}

/**
 * SafeLink component - renders safe, validated links
 * Automatically adds security attributes for external links
 */
export function SafeLink({
  href,
  children,
  className,
  showExternalIcon = false,
  showWarning = false,
  onClick,
}: SafeLinkProps) {
  const validation = validateAndSanitizeUrl(href)

  // If invalid, render as plain text
  if (!validation.isValid || !validation.sanitizedUrl) {
    return (
      <span className={cn('text-gray-400', className)} title={validation.error || 'Invalid link'}>
        {children}
        {showWarning && (
          <AlertTriangle className="inline-block ml-1 h-3 w-3 text-yellow-500" aria-label="Invalid link" />
        )}
      </span>
    )
  }

  const isExternal = validation.isExternal
  const securityAttrs = getLinkSecurityAttributes(isExternal)

  // Internal link - use Next.js Link
  if (!isExternal) {
    return (
      <Link href={validation.sanitizedUrl} className={className} onClick={onClick}>
        {children}
      </Link>
    )
  }

  // External link - use regular anchor with security attributes
  return (
    <a
      href={validation.sanitizedUrl}
      className={cn('inline-flex items-center gap-1', className)}
      {...securityAttrs}
      onClick={onClick}
    >
      {children}
      {showExternalIcon && (
        <ExternalLink className="h-3 w-3 opacity-60" aria-label="External link" />
      )}
      {showWarning && (
        <AlertTriangle className="h-3 w-3 text-yellow-500" aria-label="External link warning" />
      )}
    </a>
  )
}

