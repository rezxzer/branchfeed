# Feed Video Autoplay System - BranchFeed

ეს დოკუმენტაცია აღწერს Feed Video Autoplay System-ის იმპლემენტაციას BranchFeed-ში.

---

## 📋 Overview

Feed Video Autoplay System არის BranchFeed-ის სისტემა, რომელიც:
- ავტომატურად იწყებს ვიდეოების დაკვრას როცა viewport-ში ჩანს
- აჩერებს ვიდეოებს როცა viewport-ს გამოდის
- უზრუნველყოფს TikTok/Instagram Reels-ის მსგავს UX-ს
- მხარდაჭერას უწევს loop და muted playback-ს

**Location**: `src/components/feed/StoryCard.tsx`, `src/components/MediaDisplay.tsx`

**Status**: 🟡 **Medium Priority** - Phase 5+ (User Experience Enhancement)

> ℹ️ **შენიშვნა**
>
> Feed Video Autoplay System არის user experience enhancement, რომელიც:
> - აუმჯობესებს engagement-ს feed-ზე
> - უზრუნველყოფს modern social media experience-ს
> - მხარდაჭერას უწევს performance optimization-ს (ვიდეოები იწყება მხოლოდ როცა ჩანს)

---

## 🎯 Features

### Core Features

1. **Viewport-Based Autoplay**
   - ვიდეოები იწყება როცა viewport-ში ჩანს
   - ვიდეოები იჩერება როცა viewport-ს გამოდის
   - Intersection Observer API-ის გამოყენება
   - Performance optimization (მხოლოდ visible ვიდეოები იწყება)

2. **Muted Playback**
   - Default-ად muted playback
   - User-ს შეუძლია unmute-ის გაკეთება
   - Browser autoplay policies-ის დაცვა

3. **Loop Playback**
   - ვიდეოები loop-დება
   - Seamless playback experience
   - User-ს შეუძლია pause-ის გაკეთება

4. **Controls**
   - Video controls visible (play, pause, volume, fullscreen)
   - User-ს შეუძლია manual control
   - Touch-friendly controls mobile-ზე

5. **Performance Optimization**
   - Lazy loading (ვიდეოები იტვირთება მხოლოდ როცა viewport-ში ჩანს)
   - Preload="metadata" (მხოლოდ metadata იტვირთება)
   - Pause როცა viewport-ს გამოდის (bandwidth saving)

---

## 🔧 Implementation Details

### Intersection Observer API

```typescript
// Hook for viewport detection
import { useEffect, useRef, useState } from 'react'

export function useInViewport(options?: IntersectionObserverInit) {
  const [isInViewport, setIsInViewport] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInViewport(entry.isIntersecting)
      },
      {
        threshold: 0.5, // 50% of video must be visible
        rootMargin: '0px',
        ...options,
      }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [])

  return { ref, isInViewport }
}
```

### StoryCard Component Updates

```typescript
// src/components/feed/StoryCard.tsx
'use client'

import { useInViewport } from '@/hooks/useInViewport'

export function StoryCard({ story }: StoryCardProps) {
  const { ref, isInViewport } = useInViewport({
    threshold: 0.5, // 50% visible
  })

  return (
    <Card ref={ref} {...props}>
      {story.media_url && story.media_type === 'video' ? (
        <MediaDisplay
          mediaUrl={story.media_url}
          mediaType="video"
          alt={story.title}
          autoPlay={isInViewport} // Autoplay when in viewport
          loop={true}
          muted={true} // Default muted
          controls={true}
          lazy={true}
          maxWidth="w-full"
        />
      ) : (
        // Image display
      )}
    </Card>
  )
}
```

### MediaDisplay Component Updates

```typescript
// src/components/MediaDisplay.tsx
export function MediaDisplay({
  mediaUrl,
  mediaType,
  autoPlay = false,
  loop = false,
  muted = false,
  controls = true,
  ...props
}: MediaDisplayProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video || mediaType !== 'video') return

    if (autoPlay) {
      // Try to play video
      video.play().catch((error) => {
        console.warn('Video autoplay failed:', error)
        // Autoplay might fail due to browser policies
        // User will need to click play manually
      })
    } else {
      // Pause video when not in viewport
      video.pause()
    }
  }, [autoPlay, mediaType])

  return (
    <div {...containerProps}>
      {mediaType === 'video' ? (
        <video
          ref={videoRef}
          src={mediaUrl}
          controls={controls}
          loop={loop}
          muted={muted}
          playsInline
          preload="metadata"
          {...videoProps}
        />
      ) : (
        // Image display
      )}
    </div>
  )
}
```

---

## 📊 Configuration Options

### Intersection Observer Options

```typescript
interface ViewportOptions {
  threshold?: number | number[] // 0.5 = 50% visible
  rootMargin?: string // '0px' = no margin
  root?: Element | null // Viewport by default
}
```

### Video Playback Options

```typescript
interface VideoPlaybackOptions {
  autoPlay?: boolean // Autoplay when in viewport
  loop?: boolean // Loop video
  muted?: boolean // Muted by default
  controls?: boolean // Show controls
  preload?: 'none' | 'metadata' | 'auto' // 'metadata' recommended
}
```

---

## 🎨 User Experience

### Default Behavior

1. **Scroll Down**: ვიდეოები იწყება როცა viewport-ში ჩანს
2. **Scroll Up**: ვიდეოები იჩერება როცა viewport-ს გამოდის
3. **Muted**: Default-ად muted (user-ს შეუძლია unmute)
4. **Loop**: ვიდეოები loop-დება
5. **Controls**: Controls visible (user-ს შეუძლია manual control)

### User Interactions

1. **Click Play/Pause**: Manual control
2. **Click Volume**: Unmute/Mute
3. **Click Fullscreen**: Fullscreen mode
4. **Scroll Away**: Automatic pause

---

## ⚠️ Browser Compatibility

### Autoplay Policies

- **Chrome/Edge**: Autoplay allowed if muted
- **Firefox**: Autoplay allowed if muted
- **Safari**: Autoplay allowed if muted (iOS requires user interaction)
- **Mobile**: Autoplay might be restricted (user interaction required)

### Fallback Behavior

- თუ autoplay fails, video shows play button
- User-ს შეუძლია manual play
- Controls always visible

---

## 🚀 Performance Considerations

### Optimization Strategies

1. **Lazy Loading**: ვიდეოები იტვირთება მხოლოდ როცა viewport-ში ჩანს
2. **Preload Metadata**: მხოლოდ metadata იტვირთება (not full video)
3. **Pause on Exit**: ვიდეოები pause-დება როცა viewport-ს გამოდის (bandwidth saving)
4. **Intersection Observer**: Efficient viewport detection
5. **Single Observer**: One observer for all videos (performance)

### Bandwidth Management

- **Preload**: `metadata` (not `auto`)
- **Pause on Exit**: Saves bandwidth
- **Lazy Loading**: Only load when visible

---

## ✅ Requirements Checklist

- [ ] `useInViewport` hook created
- [ ] Intersection Observer integration
- [ ] StoryCard component updated (viewport detection)
- [ ] MediaDisplay component updated (autoplay control)
- [ ] Video ref management
- [ ] Autoplay error handling
- [ ] Browser compatibility testing
- [ ] Mobile testing
- [ ] Performance optimization
- [ ] User experience testing

---

## 🧪 Testing Checklist

1. ✅ **Viewport Detection**:
   - Video plays when scrolling into viewport
   - Video pauses when scrolling out of viewport
   - Threshold works correctly (50% visible)

2. ✅ **Autoplay**:
   - Autoplay works when muted
   - Autoplay fails gracefully if blocked
   - Play button shows if autoplay fails

3. ✅ **Loop**:
   - Videos loop correctly
   - Seamless loop transition

4. ✅ **Muted**:
   - Default muted
   - User can unmute
   - Mute state persists

5. ✅ **Controls**:
   - Controls visible
   - Play/pause works
   - Volume control works
   - Fullscreen works

6. ✅ **Performance**:
   - Lazy loading works
   - Pause on exit saves bandwidth
   - No memory leaks
   - Smooth scrolling

7. ✅ **Mobile**:
   - Touch controls work
   - Autoplay works (if allowed)
   - Performance acceptable

---

## 🔄 Future Enhancements

- **Volume Persistence**: Remember user's volume preference
- **Playback Speed**: Adjustable playback speed
- **Picture-in-Picture**: PiP mode support
- **Video Quality**: Adaptive quality based on connection
- **Analytics**: Track video view duration
- **Preload Next**: Preload next video in feed
- **Swipe Gestures**: Swipe to next/previous video

---

## 📝 Notes

- **Browser Policies**: Autoplay might be blocked by browser policies
- **User Experience**: Always provide manual controls
- **Performance**: Optimize for mobile devices
- **Accessibility**: Ensure keyboard navigation works
- **Bandwidth**: Consider user's data usage

---

**Last Updated**: 2025-01-15  
**Version**: 1.0  
**Status**: Phase 5+ (User Experience Enhancement) - 🟡 Medium Priority

