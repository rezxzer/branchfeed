'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useTranslation } from '@/hooks/useTranslation'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import type { RootStoryData } from '@/types/create'

interface RootStoryFormProps {
  onSubmit: (data: RootStoryData) => void
  initialData?: RootStoryData | null
}

export function RootStoryForm({ onSubmit, initialData }: RootStoryFormProps) {
  const { t } = useTranslation()
  const [title, setTitle] = useState(initialData?.title || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [media, setMedia] = useState<File | null>(initialData?.media || null)
  const [mediaPreview, setMediaPreview] = useState<string | null>(
    initialData?.mediaUrl || null
  )
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [mediaType, setMediaType] = useState<'image' | 'video' | undefined>(
    initialData?.mediaType
  )

  useEffect(() => {
    if (media) {
      const url = URL.createObjectURL(media)
      setMediaPreview(url)
      // Detect media type from file type or extension
      const isVideo = media.type.startsWith('video/') || /\.(mp4|webm|mov|avi|mkv)$/i.test(media.name)
      setMediaType(isVideo ? 'video' : 'image')
      return () => URL.revokeObjectURL(url)
    } else {
      // Clear preview when media is removed
      setMediaPreview(null)
      setMediaType(undefined)
    }
  }, [media])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    console.log('📁 File selected:', {
      name: file.name,
      type: file.type,
      size: file.size,
      sizeMB: (file.size / 1024 / 1024).toFixed(2) + ' MB',
    })

    // Clear previous errors
    setErrors({ ...errors, media: '' })

    // Detect if file is video or image
    const isVideo = file.type.startsWith('video/') || /\.(mp4|webm|mov|avi|mkv)$/i.test(file.name)
    const isImage = file.type.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif)$/i.test(file.name)
    
    console.log('🔍 File type detection:', {
      isVideo,
      isImage,
      fileType: file.type,
      fileName: file.name,
    })
    
    if (!isVideo && !isImage) {
      console.error('❌ Invalid file type:', file.type, file.name)
      setErrors({ 
        media: t('createStory.errors.invalidFileType') || 'Please upload an image (JPEG, PNG, WebP, GIF) or video (MP4, WebM, MOV, AVI) file.' 
      })
      return
    }

    // File size validation
    const maxSize = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024 // 50MB for videos, 10MB for images
    
    if (file.size > maxSize) {
      console.error('❌ File too large:', file.size, 'max:', maxSize)
      setErrors({ 
        media: t('createStory.errors.fileTooLarge') || `File size must be less than ${isVideo ? '50' : '10'}MB. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB` 
      })
      return
    }
    
    // Set media type immediately (synchronous) to ensure it's available when submitting
    const detectedMediaType = isVideo ? 'video' : 'image'
    console.log('✅ Setting media type:', detectedMediaType)
    setMediaType(detectedMediaType)
    
    // Set media file - this will trigger preview in useEffect
    setMedia(file)
    console.log('✅ File set successfully')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}

    if (!title.trim()) {
      newErrors.title = t('createStory.errors.titleRequired') || 'Story title is required'
    }
    if (!media && !mediaPreview) {
      newErrors.media = t('createStory.errors.mediaRequired') || 'Please upload an image or video for your story'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      media,
      mediaUrl: mediaPreview || undefined,
      mediaType,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-level-2 border border-gray-700/50 p-6">
        <h2 className="text-xl font-semibold text-white mb-6">
          {t('createStory.steps.root')}
        </h2>

        {/* Title */}
        <div className="mb-6">
          <Input
            id="story-title"
            type="text"
            label={t('createStory.root.title')}
            value={title}
            onChange={(e) => {
              setTitle(e.target.value)
              if (errors.title) setErrors({ ...errors, title: '' })
            }}
            error={errors.title}
            required
            placeholder="Enter story title..."
          />
        </div>

        {/* Description */}
        <div className="mb-6">
          <Textarea
            id="story-description"
            label={t('createStory.root.description')}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Enter story description (optional)..."
          />
        </div>

        {/* Media Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {t('createStory.root.media')} <span className="text-error ml-1">*</span>
          </label>
          
          {/* Separate inputs for image and video */}
          <input
            id="story-media-image"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <input
            id="story-media-video"
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            className="hidden"
          />
          
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Upload Image Button */}
            <label
              htmlFor="story-media-image"
              className="cursor-pointer inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors ease-smooth border border-gray-600 hover:border-brand-cyan/50 flex-1"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm font-medium">
                {media && mediaType === 'image' ? '🖼️ Change Image' : '🖼️ Upload Image'}
              </span>
            </label>
            
            {/* Upload Video Button */}
            <label
              htmlFor="story-media-video"
              className="cursor-pointer inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors ease-smooth border border-gray-600 hover:border-brand-cyan/50 flex-1"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span className="text-sm font-medium">
                {media && mediaType === 'video' ? '📹 Change Video' : '📹 Upload Video'}
              </span>
            </label>
          </div>
          
          {/* Selected file info */}
          {media && (
            <div className="mt-3 flex items-center gap-2 px-4 py-3 bg-gray-900/50 rounded-lg border border-gray-700/50">
              <span className="text-sm text-gray-300">
                {mediaType === 'video' ? '📹' : '🖼️'} {media.name}
              </span>
              <span className="text-xs text-gray-500">
                ({(media.size / 1024 / 1024).toFixed(2)} MB)
              </span>
              <button
                type="button"
                onClick={() => {
                  setMedia(null)
                  setMediaPreview(null)
                  setMediaType(undefined)
                  setErrors({ ...errors, media: '' })
                  // Reset file inputs
                  const imageInput = document.getElementById('story-media-image') as HTMLInputElement
                  const videoInput = document.getElementById('story-media-video') as HTMLInputElement
                  if (imageInput) imageInput.value = ''
                  if (videoInput) videoInput.value = ''
                }}
                className="ml-auto text-xs text-error hover:text-error/80 transition-colors"
              >
                ✕ Remove
              </button>
            </div>
          )}
          
          <p className="mt-2 text-xs text-gray-400">
            Supported formats: Images (JPEG, PNG, WebP, GIF) or Videos (MP4, WebM, MOV, AVI). Max size: 10MB (images) / 50MB (videos)
          </p>
          <p className="mt-1 text-xs text-yellow-400">
            💡 Tip: If video files don&apos;t appear, change the file type filter dropdown to &quot;All Files (*.*)&quot; in the file picker
          </p>
          {errors.media && (
            <p className="mt-2 text-sm text-error">{errors.media}</p>
          )}
        </div>

        {/* Media Preview */}
        {mediaPreview && (
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-300 mb-2">Preview:</p>
            <div className="relative aspect-[9/16] w-full max-w-xs mx-auto rounded-lg overflow-hidden bg-gray-700">
              {mediaType === 'video' ? (
                <video
                  src={mediaPreview}
                  className="w-full h-full object-cover"
                  controls
                />
              ) : (
                <Image
                  src={mediaPreview}
                  alt="Preview"
                  fill
                  className="object-cover"
                  unoptimized
                />
              )}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <Button type="submit" variant="primary" size="lg" fullWidth>
          {t('createStory.next')}
        </Button>
      </div>
    </form>
  )
}

