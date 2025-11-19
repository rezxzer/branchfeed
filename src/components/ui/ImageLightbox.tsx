'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImageLightboxProps {
  /** Image URL to display */
  imageUrl: string
  /** Alt text for accessibility */
  alt?: string
  /** Whether lightbox is open */
  isOpen: boolean
  /** Callback when lightbox should close */
  onClose: () => void
  /** Optional: Array of image URLs for navigation (if multiple images) */
  images?: string[]
  /** Optional: Current image index (if multiple images) */
  currentIndex?: number
  /** Optional: Callback when navigating to different image */
  onNavigate?: (index: number) => void
}

export function ImageLightbox({
  imageUrl,
  alt = '',
  isOpen,
  onClose,
  images,
  currentIndex = 0,
  onNavigate,
}: ImageLightboxProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [imageError, setImageError] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  // Handle ESC key to close
  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    // Handle arrow keys for navigation (if multiple images)
    const handleArrowKeys = (e: KeyboardEvent) => {
      if (!images || images.length <= 1) return

      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1
        onNavigate?.(prevIndex)
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        const nextIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0
        onNavigate?.(nextIndex)
      }
    }

    document.addEventListener('keydown', handleEscape)
    document.addEventListener('keydown', handleArrowKeys)
    
    // Prevent body scroll when lightbox is open
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.removeEventListener('keydown', handleArrowKeys)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose, images, currentIndex, onNavigate])

  // Reset loading state when image changes
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true)
      setImageError(false)
    }
  }, [imageUrl, isOpen])

  // Handle click outside to close
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!isOpen) return null

  const hasMultipleImages = images && images.length > 1
  const currentImageUrl = images ? images[currentIndex] : imageUrl

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label="Image lightbox"
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 rounded-full bg-black/60 p-2 text-white hover:bg-black/80 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
        aria-label="Close lightbox"
      >
        <X className="h-6 w-6" />
      </button>

      {/* Navigation buttons (if multiple images) */}
      {hasMultipleImages && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation()
              const prevIndex = currentIndex > 0 ? currentIndex - 1 : images!.length - 1
              onNavigate?.(prevIndex)
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 rounded-full bg-black/60 p-3 text-white hover:bg-black/80 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              const nextIndex = currentIndex < images!.length - 1 ? currentIndex + 1 : 0
              onNavigate?.(nextIndex)
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 rounded-full bg-black/60 p-3 text-white hover:bg-black/80 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Next image"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      {/* Image counter (if multiple images) */}
      {hasMultipleImages && (
        <div className="absolute top-4 left-4 z-10 rounded-full bg-black/60 px-3 py-1.5 text-sm text-white">
          {currentIndex + 1} / {images!.length}
        </div>
      )}

      {/* Image container */}
      <div className="relative w-full h-full flex items-center justify-center p-4 sm:p-8">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-white" />
          </div>
        )}

        {imageError ? (
          <div className="text-white text-center">
            <p className="text-lg mb-2">Failed to load image</p>
            <button
              onClick={onClose}
              className="text-sm text-white/70 hover:text-white underline"
            >
              Close
            </button>
          </div>
        ) : (
          <div
            className={cn(
              'relative max-w-full max-h-full w-full h-full flex items-center justify-center',
              isLoading && 'opacity-0'
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              ref={imageRef}
              src={currentImageUrl}
              alt={alt}
              className="max-w-full max-h-full object-contain"
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setIsLoading(false)
                setImageError(true)
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

