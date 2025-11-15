# Media Upload System - BranchFeed

ეს დოკუმენტაცია აღწერს Media Upload System-ის იმპლემენტაციას BranchFeed-ში.

---

## 📋 Overview

Media Upload System არის BranchFeed-ის ბირთვი სისტემა, რომელიც:
- ატვირთავს images და videos Supabase Storage-ში
- ამოწმებს 9:16 aspect ratio-ს
- ამოწმებს file size-ს (10MB limit)
- უზრუნველყოფს media preview-ს
- მართავს storage buckets-ს (stories, story-nodes)

**Location**: `src/lib/storage.ts`, `src/hooks/useMediaUpload.ts`

**Status**: 🔴 **Critical Priority** - Phase 2 (Core BranchFeed System!)

> ℹ️ **შენიშვნა**
>
> Media Upload System არის BranchFeed-ის მნიშვნელოვანი სისტემა, რომელიც გამოიყენება Create Story Page-ზე და Branch Creator Component-ში.
>
> ეს სისტემა აუცილებელია Phase 2-ის სრულფასოვნებისთვის.

> ℹ️ **Cursor-ზე**
>
> ამ ფაილში მოყვანილი კოდი არის **სტრუქტურის მაგალითი**.
>
> რეალური იმპლემენტაცია უნდა შეიქმნას Cursor-ის მიერ, `.cursorrules` და
> `docs/PROJECT_PRIORITIES.md` ფაილებში აღწერილი წესების დაცვით.

---

## 🎯 Features

### Core Features (MVP - Phase 2)

1. **Image Upload**
   - JPEG, PNG, WebP support
   - 9:16 aspect ratio validation
   - File size validation (10MB limit)
   - Preview before upload

2. **Video Upload**
   - MP4, WebM support (optional for MVP)
   - 9:16 aspect ratio validation
   - File size validation (10MB limit)
   - Preview before upload

3. **Aspect Ratio Validation**
   - 9:16 aspect ratio required
   - Client-side validation (before upload)
   - Error messages for invalid aspect ratio

4. **File Size Validation**
   - Maximum 10MB per file
   - Client-side validation
   - Error messages for oversized files

5. **Supabase Storage Integration**
   - Upload to 'stories' bucket (root story media)
   - Upload to 'story-nodes' bucket (branch node media)
   - Generate unique file names
   - Return public URL

6. **Media Preview**
   - Preview before upload
   - Image preview (thumbnail)
   - Video preview (thumbnail/first frame)

---

## 📊 Supabase Storage Schema

### Storage Buckets

1. **stories** bucket
   - Purpose: Root story media (images/videos)
   - Public access: Yes (for displaying stories)
   - File naming: `{user_id}/{timestamp}-{random}.{ext}`
   - Max file size: 10MB

2. **story-nodes** bucket
   - Purpose: Branch node media (images/videos)
   - Public access: Yes (for displaying nodes)
   - File naming: `{user_id}/{timestamp}-{random}.{ext}`
   - Max file size: 10MB

### Storage Policies (RLS)

- **INSERT**: მხოლოდ authenticated მომხმარებლებს (`auth.uid() = user_id`).
- **SELECT**: public URL-ით media-ის ნახვა ყველას შეუძლია, მაგრამ upload/delete ოპერაციები მხოლოდ authenticated მომხმარებლებისთვის არის დაშვებული (RLS-ით დაცული).
- **DELETE**: მხოლოდ file owner-ს (`auth.uid() = user_id`).

> **შენიშვნა: Storage Policies Implementation**
>
> ყველა storage policy უნდა იყოს ჩაწერილი `do $$ ... end $$;` ბლოკით SQL მიგრაციაში `storage.objects` ცხრილზე (Supabase SQL Editor-ის საშუალებით).

---

## 🔧 Implementation Details

### Storage Functions

```typescript
// lib/storage.ts
import { createClientClient } from '@/lib/auth';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const REQUIRED_ASPECT_RATIO = 9 / 16; // 9:16

export interface MediaValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate file size (max 10MB)
 */
export function validateFileSize(file: File): MediaValidationResult {
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: 'File size exceeds 10MB limit',
    };
  }
  return { valid: true };
}

/**
 * Validate aspect ratio (9:16)
 */
export async function validateAspectRatio(
  file: File
): Promise<MediaValidationResult> {
  return new Promise((resolve) => {
    if (file.type.startsWith('image/')) {
      const img = new Image();
      img.onload = () => {
        const aspectRatio = img.width / img.height;
        const tolerance = 0.01; // Allow small tolerance
        
        if (Math.abs(aspectRatio - REQUIRED_ASPECT_RATIO) > tolerance) {
          resolve({
            valid: false,
            error: 'Image must have 9:16 aspect ratio',
          });
        } else {
          resolve({ valid: true });
        }
      };
      img.onerror = () => {
        resolve({
          valid: false,
          error: 'Failed to load image',
        });
      };
      img.src = URL.createObjectURL(file);
    } else if (file.type.startsWith('video/')) {
      const video = document.createElement('video');
      video.onloadedmetadata = () => {
        const aspectRatio = video.videoWidth / video.videoHeight;
        const tolerance = 0.01;
        
        if (Math.abs(aspectRatio - REQUIRED_ASPECT_RATIO) > tolerance) {
          resolve({
            valid: false,
            error: 'Video must have 9:16 aspect ratio',
          });
        } else {
          resolve({ valid: true });
        }
      };
      video.onerror = () => {
        resolve({
          valid: false,
          error: 'Failed to load video',
        });
      };
      video.src = URL.createObjectURL(file);
    } else {
      resolve({
        valid: false,
        error: 'Unsupported file type',
      });
    }
  });
}

/**
 * Upload media to Supabase Storage
 */
export async function uploadMedia(
  file: File,
  bucket: 'stories' | 'story-nodes'
): Promise<string> {
  const supabase = createClientClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Validate file size
  const sizeValidation = validateFileSize(file);
  if (!sizeValidation.valid) {
    throw new Error(sizeValidation.error);
  }

  // Validate aspect ratio
  const aspectValidation = await validateAspectRatio(file);
  if (!aspectValidation.valid) {
    throw new Error(aspectValidation.error);
  }

  // Generate unique file name
  const fileExt = file.name.split('.').pop();
  const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);

  if (!urlData?.publicUrl) {
    throw new Error('Failed to get public URL');
  }

  return urlData.publicUrl;
}

/**
 * Delete media from Supabase Storage
 */
export async function deleteMedia(
  url: string,
  bucket: 'stories' | 'story-nodes'
): Promise<void> {
  const supabase = createClientClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Extract file path from URL
  const urlParts = url.split('/');
  const fileName = urlParts[urlParts.length - 1];
  const filePath = `${user.id}/${fileName}`;

  // Delete from Supabase Storage
  const { error } = await supabase.storage
    .from(bucket)
    .remove([filePath]);

  if (error) {
    throw new Error(`Delete failed: ${error.message}`);
  }
}
```

### useMediaUpload Hook

```typescript
// hooks/useMediaUpload.ts
'use client';

import { useState } from 'react';
import { uploadMedia, validateFileSize, validateAspectRatio } from '@/lib/storage';

interface UseMediaUploadResult {
  upload: (file: File, bucket: 'stories' | 'story-nodes') => Promise<string>;
  validate: (file: File) => Promise<MediaValidationResult>;
  loading: boolean;
  error: Error | null;
}

export function useMediaUpload(): UseMediaUploadResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const validate = async (file: File): Promise<MediaValidationResult> => {
    try {
      // Validate file size
      const sizeValidation = validateFileSize(file);
      if (!sizeValidation.valid) {
        return sizeValidation;
      }

      // Validate aspect ratio
      const aspectValidation = await validateAspectRatio(file);
      if (!aspectValidation.valid) {
        return aspectValidation;
      }

      return { valid: true };
    } catch (err) {
      return {
        valid: false,
        error: err instanceof Error ? err.message : 'Validation failed',
      };
    }
  };

  const upload = async (
    file: File,
    bucket: 'stories' | 'story-nodes'
  ): Promise<string> => {
    try {
      setLoading(true);
      setError(null);

      const url = await uploadMedia(file, bucket);
      return url;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Upload failed');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    upload,
    validate,
    loading,
    error,
  };
}
```

### MediaUploader Component

```typescript
// components/MediaUploader.tsx
'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { useMediaUpload } from '@/hooks/useMediaUpload';
import { useTranslation } from '@/hooks/useTranslation';

interface MediaUploaderProps {
  label: string;
  onFileChange: (file: File | null) => void;
  acceptedFormats?: string[];
  aspectRatio?: string;
  maxSizeMB?: number;
  preview?: string | null;
  error?: string;
  required?: boolean;
}

export function MediaUploader({
  label,
  onFileChange,
  acceptedFormats = ['image/*', 'video/*'],
  aspectRatio = '9:16',
  maxSizeMB = 10,
  preview,
  error,
  required = false,
}: MediaUploaderProps) {
  const { t } = useTranslation();
  const { validate } = useMediaUpload();
  const [validationError, setValidationError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(preview || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    const validation = await validate(file);
    if (!validation.valid) {
      setValidationError(validation.error || 'Invalid file');
      onFileChange(null);
      return;
    }

    setValidationError(null);
    onFileChange(file);

    // Create preview
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleRemove = () => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    onFileChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>

      {previewUrl && (
        <div className="relative aspect-[9/16] max-w-xs rounded-lg overflow-hidden border">
          {previewUrl.startsWith('blob:') || previewUrl.match(/\.(jpg|jpeg|png|webp)$/i) ? (
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <video
              src={previewUrl}
              className="w-full h-full object-cover"
              controls
            />
          )}
          <button
            onClick={handleRemove}
            className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/70"
            aria-label="Remove media"
          >
            ×
          </button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedFormats.join(',')}
        onChange={handleFileSelect}
        className="hidden"
        id={`media-upload-${label}`}
      />

      <Button
        type="button"
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
      >
        {previewUrl ? t('mediaUpload.change') : t('mediaUpload.select')}
      </Button>

      {(error || validationError) && (
        <p className="text-sm text-destructive">
          {error || validationError}
        </p>
      )}

      <p className="text-xs text-muted-foreground">
        {t('mediaUpload.hint', { aspectRatio, maxSize: maxSizeMB })}
      </p>
    </div>
  );
}
```

---

## 🌐 Internationalization (i18n)

### Translation Keys

```json
{
  "mediaUpload": {
    "select": "Select Media",
    "change": "Change Media",
    "remove": "Remove",
    "uploading": "Uploading...",
    "uploaded": "Uploaded successfully",
    "hint": "Aspect ratio: {aspectRatio}, Max size: {maxSize}MB",
    "errors": {
      "fileSizeExceeded": "File size exceeds {maxSize}MB limit",
      "invalidAspectRatio": "Media must have {aspectRatio} aspect ratio",
      "unsupportedFileType": "Unsupported file type",
      "uploadFailed": "Upload failed",
      "deleteFailed": "Delete failed"
    }
  }
}
```

**Note**: ყველა ტექსტი (select, change, remove, hint) და ყველა შეცდომის მესიჯი (fileSizeExceeded, invalidAspectRatio, unsupportedFileType, uploadFailed, deleteFailed) უნდა მივიდეს i18n თარგმანებიდან და არ უნდა იყოს ჰარდკოდილი სტრინგები კომპონენტებში.

---

## ✅ Requirements Checklist

- [ ] Storage functions created (`uploadMedia`, `deleteMedia`)
- [ ] Validation functions created (`validateFileSize`, `validateAspectRatio`)
- [ ] useMediaUpload hook created
- [ ] MediaUploader component created
- [ ] Supabase Storage buckets created (stories, story-nodes) და მათი პოლიტიკები აღწერილია SQL მიგრაციებში (storage.objects RLS policies)
- [ ] Storage policies implemented (RLS)
- [ ] 9:16 aspect ratio validation
- [ ] 10MB file size limit
- [ ] Media preview functionality
- [ ] Error handling
- [ ] i18n support (all text translatable)

---

## 🧪 Media Upload System Testing Checklist (MVP)

1. ✅ File Size Validation:
   - Files under 10MB pass validation
   - Files over 10MB fail validation
   - Error message displays correctly

2. ✅ Aspect Ratio Validation:
   - 9:16 images pass validation
   - 9:16 videos pass validation
   - Invalid aspect ratio fails validation
   - Error message displays correctly

3. ✅ File Type Validation:
   - Images (JPEG, PNG, WebP) accepted
   - Videos (MP4, WebM) accepted
   - Unsupported types rejected

4. ✅ Upload Functionality:
   - Upload to 'stories' bucket works
   - Upload to 'story-nodes' bucket works
   - Public URL returned correctly
   - File naming correct (user_id/timestamp-random.ext)

5. ✅ Preview Functionality:
   - Image preview displays correctly
   - Video preview displays correctly
   - Preview removed on file change
   - Preview removed on remove

6. ✅ Error Handling:
   - Network errors handled
   - Validation errors handled
   - Upload errors handled
   - User-friendly error messages

7. ✅ Storage Policies:
   - Only authenticated users can upload
   - Only file owner can delete
   - Public access works for viewing

---

## 🔄 Future Enhancements

- **Image Optimization**: Compress images before upload
- **Video Compression**: Compress videos before upload
- **Progressive Upload**: Upload large files in chunks
- **Upload Progress**: Show upload progress bar
- **Multiple Files**: Support multiple file uploads
- **Drag & Drop**: Drag and drop file upload
- **Image Cropping**: Crop images to 9:16 before upload
- **Video Trimming**: Trim videos before upload
- **Thumbnail Generation**: Auto-generate thumbnails
- **CDN Integration**: Use CDN for media delivery

---

## 📝 Notes

- **Phase 2 Priority**: Media Upload System is critical priority for Phase 2
- **Aspect Ratio**: 9:16 aspect ratio is required (mobile-first design)
- **File Size**: Maximum 10MB per file (configurable)
- **Storage Buckets**: Two buckets - 'stories' and 'story-nodes'
- **File Naming**: `{user_id}/{timestamp}-{random}.{ext}` format
- **Public Access**: Buckets are public for viewing, but upload requires authentication
- **Validation**: Client-side validation before upload (saves bandwidth)
- **Server-side validation**: Server-side validation (file type, file size) ასევე სავალდებულოა API ფენაში, რომ უსაფრთხოება მხოლოდ client-side შემოწმებაზე არ იყოს დამოკიდებული.

---

## 🤖 Cursor Implementation Notes (Internal)

When implementing Media Upload System in Cursor:

- Do NOT write code directly აქედან – გამოიყენე ეს დოკი როგორც source of truth.
- Steps:
  1. Create Supabase Storage buckets ('stories', 'story-nodes').
  2. Create storage functions (`uploadMedia`, `deleteMedia`).
  3. Create validation functions (`validateFileSize`, `validateAspectRatio`).
  4. Create `useMediaUpload` hook.
  5. Create `MediaUploader` component.
  6. Implement storage policies (RLS).
  7. Add error handling.
  8. Add tests according to "Media Upload System Testing Checklist (MVP)".

---

**Last Updated**: 2025-01-XX  
**Version**: 1.0  
**Status**: Phase 2 (Core BranchFeed System) - 🔴 Critical Priority

