# Media Display Component - BranchFeed

ეს დოკუმენტაცია აღწერს Media Display Component-ის იმპლემენტაციას BranchFeed-ში.

---

## 📋 Overview

Media Display Component არის BranchFeed-ის reusable UI კომპონენტი, რომელიც:
- აჩვენებს images და videos 9:16 aspect ratio-ში
- უზრუნველყოფს responsive, mobile-first დიზაინს
- აჩვენებს loading states და error handling-ს
- მხარდაჭერას უწევს lazy loading-ს და optimization-ს

**Location**: `src/components/MediaDisplay.tsx`

**Status**: 🟢 **Medium Priority** - Phase 2-3 (Reusable UI Component)

> ℹ️ **შენიშვნა**
>
> Media Display Component არის reusable კომპონენტი, რომელიც გამოიყენება:
> - Story Player Component-ში (story media-ს ჩვენება)
> - Post Detail Page-ზე (post media-ს ჩვენება)
> - Feed Page-ზე (story/post preview-ს ჩვენება)
> - სხვა ადგილებში, სადაც საჭიროა media-ს ჩვენება 9:16 aspect ratio-ში
>
> ეს კომპონენტი უზრუნველყოფს consistent media display experience-ს მთელ აპლიკაციაში.

Media Display Component ეყრდნობა Media Upload System-ში აღწერილ წესებს (9:16 aspect ratio, მხარდაჭერილი ფორმატები, ზომის ლიმიტი) და ითვალისწინებს, რომ `mediaUrl` მიუთითებს უკვე ვალიდირებულ მედია ფაილზე. ამით მკაფიოდაა რომ ვერ იხსნის upload-side პრობლემებს, უბრალოდ ასახავს.

> ℹ️ **Cursor-ზე**
>
> ამ ფაილში მოყვანილი კოდი არის **სტრუქტურის მაგალითი**.
>
> რეალური იმპლემენტაცია უნდა შეიქმნას Cursor-ის მიერ, `.cursorrules` და
> `docs/PROJECT_PRIORITIES.md` ფაილებში აღწერილი წესების დაცვით.

---

## 🎯 Features

### Core Features (MVP - Phase 2)

1. **Image Display**
   - JPEG, PNG, WebP support
   - 9:16 aspect ratio container
   - Object-fit: cover (maintains aspect ratio)
   - Lazy loading support
   - Alt text for accessibility

2. **Video Display**
   - MP4, WebM support
   - 9:16 aspect ratio container
   - Video controls (play, pause, volume)
   - Auto-play (optional)
   - Loop (optional)
   - Muted (optional)
   - თუ გამოიყენება auto-play, რეკომენდებულია `muted` იყოს `true` (ბრაუზერების autoplay პოლიტიკების დასაკმაყოფილებლად)

3. **Responsive Sizing**
   - Full width on mobile
   - Max width on desktop (max-w-md)
   - Maintains 9:16 aspect ratio on all screen sizes
   - Centered on desktop

4. **Loading States**
   - Loading spinner while media loads
   - Skeleton loader (optional - Phase 2+)
   - Loading overlay

5. **Error Handling**
   - Error state display
   - Retry functionality
   - Fallback image (optional)

6. **Accessibility**
   - Alt text for images
   - ARIA labels for video controls
   - Keyboard navigation support
   - Screen reader support

---

## 📐 Component Structure

### Visual Structure

```
┌─────────────────────────────┐
│  Media Display Container    │
│  (9:16 aspect ratio)        │
│  ┌───────────────────────┐ │
│  │                       │ │
│  │   [Media Content]     │ │
│  │   (Image or Video)    │ │
│  │                       │ │
│  └───────────────────────┘ │
│  [Loading/Error Overlay]    │
└─────────────────────────────┘
```

### Mobile Layout

```
┌─────────────────┐
│ Media Display   │
│ (Full Width)    │
│ ┌─────────────┐ │
│ │             │ │
│ │   [Media]    │ │
│ │             │ │
│ └─────────────┘ │
└─────────────────┘
```

### Desktop Layout

```
┌─────────────────────────────┐
│   Media Display Container   │
│   (Centered, max-w-md)      │
│   ┌───────────────────────┐ │
│   │                       │ │
│   │   [Media Content]     │ │
│   │                       │ │
│   └───────────────────────┘ │
└─────────────────────────────┘
```

---

## 🎨 UI Components

### Used Components

1. **Spinner** (`src/components/ui/Spinner.tsx`)
   - Loading state indicator
   - Centered overlay

2. **ErrorState** (`src/components/ui/ErrorState.tsx`)
   - Error message display
   - Retry button

3. **Image** (Next.js Image component - optional)
   - Optimized image loading
   - Lazy loading support

4. **Layout Tokens**
   - `maxWidth` prop-ში გამოყენებული Tailwind კლასები (მაგალითად, `max-w-md`, `max-w-2xl`) უნდა შეესაბამებოდეს საერთო დიზაინის ტოკენებს (Layout/Container widths), რათა სხვადასხვა გვერდზე MediaDisplay ყოველთვის თანმიმდევრულად გამოიყურებოდეს

---

## 🔧 Implementation Details

### Component Interface

```typescript
// components/MediaDisplay.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { useTranslation } from '@/hooks/useTranslation';

export interface MediaDisplayProps {
  /** Media URL (Supabase Storage public URL) */
  mediaUrl: string;
  
  /** Media type: 'image' | 'video' */
  mediaType: 'image' | 'video';
  // Note: mediaType აუცილებლად უნდა ემთხვეოდეს რეალური ფაილის ტიპს (image/* ან video/* MIME); არასწორი კომბინაცია შეიძლება დასრულდეს შეცდომით ან არასასიამოვნო UX-ით.
  
  /** Alt text for images (accessibility) */
  alt?: string;
  
  /** Video controls (default: true) */
  controls?: boolean;
  
  /** Auto-play video (default: false) */
  autoPlay?: boolean;
  
  /** Loop video (default: false) */
  loop?: boolean;
  
  /** Mute video (default: false) */
  muted?: boolean;
  
  /** Lazy load image (default: true) */
  lazy?: boolean;
  
  /** Loading callback */
  onLoad?: () => void;
  
  /** Error callback */
  onError?: (error: Error) => void;
  
  /** Custom className */
  className?: string;
  
  /** Max width on desktop (default: 'max-w-md') */
  maxWidth?: string;
}

export function MediaDisplay({
  mediaUrl,
  mediaType,
  alt = '',
  controls = true,
  autoPlay = false,
  loop = false,
  muted = false,
  lazy = true,
  onLoad,
  onError,
  className = '',
  maxWidth = 'max-w-md',
}: MediaDisplayProps) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

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

  // Note: Retry ღილაკის დაჭერაზე კომპონენტი მხოლოდ შიდა hasError/isLoading მდგომარეობას ასუფთავებს. თუ იგივე mediaUrl-ზე კვლავ იმეორებს შეცდომას, მშობელმა კომპონენტმა საჭიროა, სურვილისამებრ, შეცვალოს URL (მაგ. ახალი signed URL-ით) ან შეასრულოს დამატებითი სერვერ-საიდ ლოგიკა, რათა Retry რეალურად ეფექტური იყოს.

  if (hasError) {
    return (
      <div className={`aspect-[9/16] ${maxWidth} mx-auto bg-muted rounded-lg flex items-center justify-center ${className}`}>
        <ErrorState 
          title={t('mediaDisplay.error.title')}
          retryLabel={t('mediaDisplay.error.retry')}
          onRetry={() => {
            setHasError(false);
            setIsLoading(true);
          }}
        />
      </div>
    );
  }

  return (
    <div className={`relative aspect-[9/16] w-full ${maxWidth} mx-auto bg-black rounded-lg overflow-hidden ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
          <Spinner size="lg" color="white" />
        </div>
      )}

      {mediaType === 'image' ? (
        <Image
          src={mediaUrl}
          alt={alt}
          fill
          className="object-cover"
          onLoad={handleLoad}
          onError={() => handleError(new Error('Image load failed'))}
          loading={lazy ? 'lazy' : 'eager'}
          sizes="(max-width: 768px) 100vw, 448px"
        />
      ) : (
        <video
          src={mediaUrl}
          className="w-full h-full object-cover"
          controls={controls}
          autoPlay={autoPlay}
          loop={loop}
          muted={muted}
          playsInline
          onLoadedData={handleLoad}
          onError={() => handleError(new Error('Video load failed'))}
        />
      )}
    </div>
  );
}
```

### Usage Examples

#### Basic Image Display

```typescript
// In Story Player or Post Detail Page
<MediaDisplay
  mediaUrl={story.media_url}
  mediaType="image"
  alt={story.title}
  onLoad={() => console.log('Image loaded')}
  onError={(error) => console.error('Image error:', error)}
/>
```

#### Video Display with Controls

```typescript
// In Story Player
<MediaDisplay
  mediaUrl={node.media_url}
  mediaType="video"
  controls={true}
  autoPlay={true}
  loop={true}
  muted={true}
  onLoad={() => console.log('Video loaded')}
/>
```

#### Custom Max Width

```typescript
// In Post Detail Page (wider display)
<MediaDisplay
  mediaUrl={post.media_url}
  mediaType="image"
  alt={post.title}
  maxWidth="max-w-2xl"
/>
```

#### Feed Preview (Smaller)

```typescript
// In Feed Page (smaller preview)
<MediaDisplay
  mediaUrl={story.media_url}
  mediaType="image"
  alt={story.title}
  maxWidth="max-w-xs"
  lazy={true}
/>
```

---

## 📊 Database Schema

Media Display Component არ იყენებს პირდაპირ database-ს, მაგრამ იყენებს:

1. **Supabase Storage**
   - Public URLs from `stories.media_url` or `story_nodes.media_url`
   - Public URLs from `posts.media_url`

2. **Media URLs**
   - ჩვეულებრივ ფორმატი იქნება: `https://[project].supabase.co/storage/v1/object/public/[bucket]/[path]`
   - თუმცა კომპონენტი agnostic უნდა იყოს და მიიღოს ნებისმიერი მოქმედი https URL (მათ შორის signed URLs ან CDN ბმულები)
   - Auth/ხელახლა ხელმოწერის ლოგიკა უნდა დარჩეს ზედა ფენაში (Story Player/Post Detail/სხვა კონტეინერები), ხოლო MediaDisplay მხოლოდ გამოტანით იყოს დაკავებული

---

## 🌐 Internationalization (i18n)

### Translation Keys

```json
{
  "mediaDisplay": {
    "error": {
      "title": "Failed to load media",
      "retry": "Retry"
    }
  }
}
```

**Note**: ყველა ტექსტი (error messages, retry button) უნდა მივიდეს i18n თარგმანებიდან და არ უნდა იყოს ჰარდკოდილი სტრინგები.

Alt ტექსტი სავალდებულოა იმ შემთხვევებში, როცა მედია წარმოადგენს შინაარსის მთავარ ნაწილს (მაგალითად, მთავარ Story/Post გამოსახულებას). `alt=""` დაშვებულია მხოლოდ დეკორატიული მედიისთვის, სადაც ეკრანის მკითხველისთვის ზედმეტი ხმაური შეიქმნებოდა.

---

## ✅ Requirements Checklist

- [ ] MediaDisplay component created (`src/components/MediaDisplay.tsx`)
- [ ] Image display support (JPEG, PNG, WebP)
- [ ] Video display support (MP4, WebM)
- [ ] 9:16 aspect ratio container
- [ ] Responsive sizing (full width on mobile, კონსისტენტური max-width desktop-ზე design tokens-ის მიხედვით)
- [ ] Loading state (Spinner)
- [ ] Error state (ErrorState with retry)
- [ ] Lazy loading for images
- [ ] Video controls support
- [ ] Accessibility features (alt text, ARIA labels)
- [ ] i18n support (all text translatable)

---

## 🧪 Media Display Component Testing Checklist (MVP)

1. ✅ Image Display:
   - Image loads correctly
   - Image displays in 9:16 aspect ratio
   - Alt text displays (accessibility)
   - Lazy loading works
   - Responsive sizing works

2. ✅ Video Display:
   - Video loads correctly
   - Video displays in 9:16 aspect ratio
   - Video controls work (play, pause, volume)
   - Auto-play works (if enabled)
   - Loop works (if enabled)
   - Muted works (if enabled)

3. ✅ Loading State:
   - Loading spinner displays while media loads
   - Loading spinner hides after media loads
   - Loading state works for both image and video

4. ✅ Error Handling:
   - Error state displays if media fails to load
   - Retry button works
   - Error callback fires correctly
   - იმ ტესტის უზრუნველყოფა, რომ Retry-ზე შიდა state მართლაც სუფთავდება და, საჭიროების შემთხვევაში, მშობელი კომპონენტი შეიძლება ახალი URL-ით ხელახლა სცადოს ჩატვირთვა

5. ✅ Responsive Design:
   - Full width on mobile
   - Max width on desktop (centered)
   - 9:16 aspect ratio maintained on all screen sizes

6. ✅ Accessibility:
   - Alt text for images
   - ARIA labels for video controls
   - Keyboard navigation works
   - Screen reader support
   - დარწმუნდეთ, რომ video controls rely on ბრაუზერის native კონტროლებზე (ან, თუ მომავალში დაემატება custom კონტროლები, ყველა ღილაკს აქვს ARIA label და focus-ის ინდიკაცია)

---

## 🔄 Future Enhancements

- **Image Optimization**: Next.js Image component with blur placeholder
- **Video Optimization**: Adaptive bitrate streaming
- **Media Preloading**: Preload next media in sequence
- **Media Caching**: Cache media for offline viewing
- **Media Filters**: Image/video filters (optional)
- **Media Annotations**: Text overlays, stickers
- **Media Sharing**: Share specific frame/moment
- **Media Analytics**: Track view duration, completion rate
- **Progressive Loading**: Progressive image/video loading
- **Media Compression**: Automatic media compression

---

## 📝 Notes

- **Phase 2-3 Priority**: Media Display Component is medium priority for Phase 2-3
- **Reusable Component**: This component is designed to be reusable across the application
- **Aspect Ratio**: 9:16 aspect ratio is required (mobile-first design)
- **Media Format**: Supports image (JPEG, PNG, WebP) and video (MP4, WebM)
- **Loading**: Lazy loading for images, eager loading for videos (optional)
- **Auto-play ქცევა**: Auto-play ვიდეოსთვის უნდა ჩაირთოს მხოლოდ იმ შემთხვევაში, თუ კომპონენტი რეალურად ჩანს viewport-ში (მაგ. Story Player-ში). Scroll-ზე დაფუძნებული auto-play ლოგიკა უნდა იყოს მშობელ კომპონენტებში, ხოლო MediaDisplay მხოლოდ `autoPlay` prop-ს ეყრდნობოდეს (ანუ ლოგიკა თავზეა, ეს მხოლოდ UI-ა)
- **Error Handling**: User-friendly error messages with retry option
- **Client Component**: Media Display Component არის client-side კომპონენტი (`useEffect`, browser APIs, Next.js Image), ამიტომ მისი გამოძახება უნდა მოხდეს მხოლოდ client components-დან ან wrapper-ებიდან, და არა უშუალოდ server-only კონტექსტიდან
- **Accessibility**: Full keyboard and screen reader support
- **Performance**: Optimized for performance (lazy loading, image optimization)
- **Next.js Image**: Consider using Next.js Image component for automatic optimization (if available)

---

## 🔗 Integration with Other Systems

Media Display Component გამოიყენება როგორც ვიზუალური ფენა BranchFeed-ის სხვა სისტემებისთვის:

- **Media Upload System** უზრუნველყოფს ვალიდურ 9:16 მედია ფაილებს Supabase Storage-ში
- **Story Player / Story Nodes / Post Detail Pages** უზრუნველყოფენ სწორი `mediaUrl`/`mediaType` მნიშვნელობებს
- **Interaction Systems (Likes/Share)** მუშაობენ უკვე გამოტანილ მედია ბლოკებზე

ამ კომპონენტში არ უნდა იყოს business logic (views count, tracking, feature flags) – მხოლოდ UI/UX და accessibility.

---

## 🤖 Cursor Implementation Notes (Internal)

When implementing Media Display Component in Cursor:

- Do NOT write code directly აქედან – გამოიყენე ეს დოკი როგორც source of truth.
- Steps:
  1. Create `MediaDisplay` component with image/video support.
  2. Implement 9:16 aspect ratio container.
  3. Add loading state (Spinner).
  4. Add error handling (ErrorState).
  5. Add responsive sizing (full width mobile, max-width desktop).
  6. Add accessibility features (alt text, ARIA labels).
  7. Add lazy loading support for images.
  8. Test responsive design (mobile, tablet, desktop).
  9. Add tests according to "Media Display Component Testing Checklist (MVP)".

---

**Last Updated**: 2025-01-XX  
**Version**: 1.0  
**Status**: Phase 2-3 (Reusable UI Component) - 🟢 Medium Priority

