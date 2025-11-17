# Story Player Component - BranchFeed

ეს დოკუმენტაცია აღწერს Story Player Component-ის იმპლემენტაციას BranchFeed-ში.

> Updates (2025-01):
>
> - Fullscreen: Treat fullscreen support as MVP. Detect support (e.g., `document.fullscreenEnabled` and vendor prefixes); gracefully disable on unsupported devices (iOS Safari caveats).
> - Video Poster: Provide `poster={thumbnailUrl}` for initial load to improve perceived performance.
> - Retry Debounce: Wrap `onRetry` in a 400–600ms debounce to avoid rapid repeat requests.

---

## 📋 Overview

Story Player Component არის BranchFeed-ის ბირთვი კომპონენტი, რომელიც:
- აჩვენებს story media-ს (image/video) 9:16 aspect ratio-ში
- მხარდაჭერას უწევს root story-ს და branch node-ების media-ს
- უზრუნველყოფს responsive, mobile-first დიზაინს
- აჩვენებს loading states და error handling-ს

**Location**: `src/components/StoryPlayer.tsx`

**Status**: 🔴 **Critical Priority** - Phase 2 (Core BranchFeed Component!)

> ℹ️ **შენიშვნა**
>
> Story Player Component არის BranchFeed-ის ყველაზე მნიშვნელოვანი UI კომპონენტი, რომელიც გამოიყენება Story Detail Page-ზე.
>
> ეს კომპონენტი აჩვენებს root story-ს ან current node-ს, რაც დამოკიდებულია user-ის path-ზე.

> ℹ️ **Cursor-ზე**
>
> ამ ფაილში მოყვანილი კოდი არის **სტრუქტურის მაგალითი**.
>
> რეალური იმპლემენტაცია უნდა შეიქმნას Cursor-ის მიერ, `.cursorrules` და
> `docs/PROJECT_PRIORITIES.md` ფაილებში აღწერილი წესების დაცვით.

---

## 🎯 Features

### Core Features (MVP - Phase 2)

1. **Media Display**
   - Image display (9:16 aspect ratio)
   - Video display (9:16 aspect ratio)
   - Responsive container (max-width on desktop)
   - Object-fit: cover (maintains aspect ratio)

2. **Media Types**
   - Image support (JPEG, PNG, WebP)
   - Video support (MP4, WebM)
   - Media type detection (from props)
   - Fallback handling

3. **Loading States**
   - Loading spinner while media loads
   - Skeleton loader (optional - Phase 2+)
   - Error state (if media fails to load)

4. **Full-screen Mode** (Optional - Phase 2+)
   - Full-screen toggle button
   - Full-screen API support
   - Exit full-screen on ESC key

5. **Accessibility**
   - Alt text for images
   - ARIA labels for buttons
   - Keyboard navigation support
   - Screen reader support

---

## 📐 Component Structure

### Visual Structure

```
┌─────────────────────────────┐
│  Story Player Container     │
│  (9:16 aspect ratio)        │
│  ┌───────────────────────┐ │
│  │                       │ │
│  │   [Media Display]     │ │
│  │   (Image or Video)    │ │
│  │                       │ │
│  └───────────────────────┘ │
│  [Fullscreen Button] (opt)  │
└─────────────────────────────┘
```

### Mobile Layout

```
┌─────────────────┐
│ Story Player    │
│ (Full Width)    │
│ ┌─────────────┐ │
│ │             │ │
│ │   [Media]    │ │
│ │             │ │
│ └─────────────┘ │
└─────────────────┘
```

---

## 🎨 UI Components

### Used Components

1. **Spinner** (`src/components/ui/Spinner.tsx`)
   - Loading state during media load

2. **ErrorState** (`src/components/ErrorState.tsx`)
   - Error message if media fails to load
   - **Note**: ErrorState-ის გამოყენებისას `title` და `retryLabel` ყოველთვის უნდა მოდიოდეს i18n key-ებიდან (მაგ. `storyPlayer.error.title`, `storyPlayer.retry`), ხოლო `message` არის არასავალდებულო და არ უნდა იყოს ჰარდკოდით "Failed to load media".

---

## 🔧 Implementation Details

### Component Props

```typescript
interface StoryPlayerProps {
  mediaUrl: string;
  mediaType: 'image' | 'video';
  alt?: string; // Optional alt text for images
  className?: string; // Optional additional classes
  onLoad?: () => void; // Optional callback when media loads
  onError?: (error: Error) => void; // Optional error handler
}
```

### Component Implementation

```typescript
// components/StoryPlayer.tsx
'use client';

import { useState, useEffect } from 'react';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ErrorState';
import { useTranslation } from '@/hooks/useTranslation';

interface StoryPlayerProps {
  mediaUrl: string;
  mediaType: 'image' | 'video';
  alt?: string;
  className?: string;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

export function StoryPlayer({ 
  mediaUrl, 
  mediaType, 
  alt = 'Story',
  className = '',
  onLoad,
  onError 
}: StoryPlayerProps) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
  }, [mediaUrl]);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = (error: Error) => {
    setIsLoading(false);
    setHasError(true);
    onError?.(error);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  if (hasError) {
    return (
      <div className={`aspect-[9/16] max-w-md mx-auto bg-muted rounded-lg flex items-center justify-center ${className}`}>
        <ErrorState 
          title={t('storyPlayer.error.title')}
          retryLabel={t('storyPlayer.retry')}
          onRetry={() => {
            setHasError(false);
            setIsLoading(true);
          }}
        />
      </div>
    );
  }

  return (
    <div className={`relative aspect-[9/16] max-w-md mx-auto bg-black rounded-lg overflow-hidden ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
          <Spinner size="lg" color="white" />
        </div>
      )}

      {mediaType === 'image' ? (
        <img 
          src={mediaUrl} 
          alt={alt}
          className="w-full h-full object-cover"
          onLoad={handleLoad}
          onError={() => handleError(new Error('Image load failed'))}
          loading="lazy"
        />
      ) : (
        <video 
          src={mediaUrl}
          className="w-full h-full object-cover"
          controls
          autoPlay
          loop
          muted
          playsInline
          onLoadedData={handleLoad}
          onError={() => handleError(new Error('Video load failed'))}
        />
      )}
      
      {/* Fullscreen toggle (optional) */}
      <button
        onClick={toggleFullscreen}
        className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors z-20"
        aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
      >
        {isFullscreen ? '⤓' : '⤢'}
      </button>
    </div>
  );
}
```

### Usage Example

```typescript
// In Story Detail Page
<StoryPlayer 
  mediaUrl={currentNode?.media_url || story.media_url}
  mediaType={currentNode?.media_type || story.media_type}
  alt={story.title}
  onLoad={() => console.log('Media loaded')}
  onError={(error) => console.error('Media error:', error)}
/>
```

---

## 🎨 UI Style Guidelines

### Aspect Ratio

- **9:16 aspect ratio** - Mobile-first design (Instagram Stories style)
- Container: `aspect-[9/16]` (Tailwind CSS)
- Max width: `max-w-md` (desktop) - prevents too large on desktop
- Full width on mobile

### Media Display

- **Object-fit: cover** - Maintains aspect ratio, fills container
- **Background: black** - For letterboxing if needed
- **Rounded corners**: `rounded-lg` (optional)

### Loading State

- **Spinner**: Centered, white color, large size
- **Background overlay**: `bg-black/50` for visibility
- **Z-index**: Higher than media (z-10)

### Error State

- **Error message**: User-friendly message
- **Retry button**: Allows user to retry loading
- **Background**: Muted background color

---

## 🌐 Internationalization (i18n)

### Translation Keys

```json
{
  "storyPlayer": {
    "loading": "Loading media...",
    "error": {
      "title": "Failed to load media"
    },
    "retry": "Retry",
    "fullscreen": {
      "enter": "Enter fullscreen",
      "exit": "Exit fullscreen"
    }
  }
}
```

---

## ✅ Requirements Checklist

- [ ] StoryPlayer component created
- [ ] Image display (9:16 aspect ratio)
- [ ] Video display (9:16 aspect ratio)
- [ ] Loading state (Spinner)
- [ ] Error state (ErrorState)
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Object-fit: cover
- [ ] Full-screen mode (optional - Phase 2+)
- [ ] Accessibility (alt text, ARIA labels)
- [ ] Keyboard navigation support
- [ ] i18n support (all text translatable)

---

## 🧪 Story Player Component Testing Checklist (MVP)

1. ✅ Image Display:
   - Image loads correctly
   - 9:16 aspect ratio maintained
   - Object-fit: cover works
   - Alt text displays correctly

2. ✅ Video Display:
   - Video loads correctly
   - 9:16 aspect ratio maintained
   - Video controls work
   - Auto-play works (muted)
   - Loop works

3. ✅ Loading State:
   - Spinner shows while loading
   - Spinner hides after load
   - Loading state resets on media change

4. ✅ Error Handling:
   - Error state shows on load failure
   - Retry button works
   - Error message is user-friendly

5. ✅ Responsive:
   - Mobile: Full width
   - Tablet: Max width with centering
   - Desktop: Max width with centering

6. ✅ Full-screen (if implemented):
   - Full-screen button works
   - ESC key exits full-screen
   - Full-screen API works

7. ✅ Accessibility:
   - Alt text for images
   - ARIA labels for buttons
   - Keyboard navigation works
   - Screen reader support

---

## 🔄 Future Enhancements

- **Media Controls**: Advanced video controls (playback speed, quality)
- **Media Preloading**: Preload next node's media
- **Media Caching**: Cache media for offline viewing
- **Media Optimization**: Lazy loading, progressive loading
- **Media Filters**: Image/video filters (optional)
- **Media Annotations**: Text overlays, stickers
- **Media Sharing**: Share specific frame/moment
- **Media Analytics**: Track view duration, completion rate

---

## 📝 Notes

- **Phase 2 Priority**: Story Player Component is critical priority for Phase 2
- **Aspect Ratio**: 9:16 aspect ratio is required (mobile-first design)
- **Media Format**: Supports image (JPEG, PNG, WebP) and video (MP4, WebM)
- **Loading**: Lazy loading for images, eager loading for videos
- **Error Handling**: User-friendly error messages with retry option
- **Accessibility**: Full keyboard and screen reader support

---

## 🤖 Cursor Implementation Notes (Internal)

When implementing Story Player Component in Cursor:

- Do NOT write code directly აქედან – გამოიყენე ეს დოკი როგორც source of truth.
- Steps:
  1. Create `StoryPlayer` component with image/video support.
  2. Implement 9:16 aspect ratio container.
  3. Add loading state (Spinner).
  4. Add error handling (ErrorState).
  5. Implement full-screen mode (optional).
  6. Add accessibility features (alt text, ARIA labels).
  7. Test responsive design (mobile, tablet, desktop).
  8. Add tests according to "Story Player Component Testing Checklist (MVP)".

---

**Last Updated**: 2025-01-XX  
**Version**: 1.0  
**Status**: Phase 2 (Core BranchFeed Component) - 🔴 Critical Priority

