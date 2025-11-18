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

**Status**: 🟡 **Medium Priority** - Phase 3 (User Experience Enhancement)

> **Note**: Phase 3-ად გადავიტანეთ, რადგან BranchFeed-ის core არის interactive content, ასე რომ autoplay უნდა იყოს ადრეულ ეტაპზე.

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
   - Max concurrent videos limit (2-3 only)
   - Cleanup on unmount (video.pause())

6. **User Preference Toggle**
   - User-ს შეუძლია autoplay-ის გამორთვა Settings-ში
   - Data saver mode support
   - Battery saver mode support

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
  threshold?: number | number[] // 0.5 = 50% visible, [0.25, 0.5, 0.75] for multiple triggers
  rootMargin?: string // '0px' = no margin
  root?: Element | null // Viewport by default, or feed container for scrollable containers
}
```

> **Note**: Threshold array support allows fine-grained control (e.g., preload at 25%, play at 50%).

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
2. **Click Volume**: Unmute/Mute (with smooth volume fade)
3. **Click Fullscreen**: Fullscreen mode
4. **Scroll Away**: Automatic pause
5. **Fast Scroll**: Pause on fast scroll (prevents unwanted autoplay)
6. **Swipe Gestures**: Swipe up/down to next/previous video (mobile)

---

## ⚠️ Browser Compatibility

### Autoplay Policies

- **Chrome/Edge**: Autoplay allowed if muted
- **Firefox**: Autoplay allowed if muted
- **Safari**: Autoplay allowed if muted (iOS requires user interaction)
- **Mobile**: Autoplay might be restricted (user interaction required)

### iOS Safari Specific

- **playsInline**: Always required for iOS
- **User Interaction**: May require user interaction for first autoplay
- **Workaround**: Show play button if autoplay fails

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
- **Max Concurrent Videos**: Limit to 2-3 videos playing simultaneously
- **Cleanup**: video.pause() on component unmount

### Battery Saver Mode

- **Low Battery Detection**: Reduce autoplay on low battery
- **Poor Connection**: Reduce autoplay on slow connection
- **User Preference**: Respect user's data saver settings

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
- [ ] Battery Saver Mode Support (reduce autoplay on low battery)
- [ ] User Opt-Out Toggle (Settings)
- [ ] Max Concurrent Videos Limit (2-3 only)
- [ ] Cleanup on Unmount (video.pause())
- [ ] Debugging Attributes (data-autoplay)
- [ ] Fallback Image on Error

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
   - Swipe gestures work
   - iOS Safari compatibility

8. ✅ **Low Bandwidth**:
   - Autoplay reduces on slow connection
   - Pause on exit saves bandwidth
   - Throttle network test passes

9. ✅ **Accessibility**:
   - ARIA live region announces autoplay
   - Keyboard navigation works
   - Screen reader support

---

## 🔄 Future Enhancements

### Short-term (Phase 3-4)

- **Volume Persistence**: Remember user's volume preference
- **Playback Speed**: Adjustable playback speed
- **Picture-in-Picture**: PiP mode support
- **Video Quality**: Adaptive quality based on connection
- **Analytics**: Track video view duration
- **Preload Next**: Preload next video in feed
- **Swipe Gestures**: Swipe to next/previous video
- **Volume Fade**: Smooth unmute transition
- **Playlist Mode**: Auto-advance to next story
- **Watch Later Queue**: Save videos for later viewing

### Medium-term (Phase 5+)

- **Bandwidth Analytics**: Track autoplay starts/pauses for analytics
- **User Opt-Out**: Toggle autoplay in Settings
- **Browser Policy Workarounds**: Advanced workarounds for strict policies
- **Eco Mode**: Reduce autoplay on low battery/poor connection
- **Personalized Feeds**: Autoplay based on user history and preferences

### Long-term (Phase 6+)

- **AI Autoplay**: AI-powered video recommendations for autoplay (based on user preferences)
- **VR Autoplay**: VR mode immersive autoplay experience
- **Social Autoplay**: Sync autoplay with friends' viewing sessions

---

## 📝 Notes

- **Browser Policies**: Autoplay might be blocked by browser policies
- **User Experience**: Always provide manual controls
- **Performance**: Optimize for mobile devices
- **Accessibility**: Ensure keyboard navigation works, announce autoplay with ARIA live region
- **Bandwidth**: Consider user's data usage
- **Debugging**: Use `data-autoplay` attribute for debugging autoplay state
- **Error Handling**: Provide fallback image if video fails to load
- **Cleanup**: Always cleanup video resources on component unmount
- **iOS Safari**: Always use `playsInline` attribute for iOS compatibility
- **Scrollable Containers**: Use `root` option for feed containers that are scrollable

---

**Last Updated**: 2025-01-15  
**Version**: 1.1  
**Status**: Phase 3 (User Experience Enhancement) - 🟡 Medium Priority

---

## 💡 Implementation Improvements & Recommendations

### 🔧 Suggested Improvements

#### 1. Overview & Features
- ✅ **Phase Priority**: Changed to Phase 3 (from Phase 5+) - BranchFeed's core is interactive content, so autoplay should be early
- ✅ **User Preference Toggle**: Added to Features section (autoplay off for data savers)

#### 2. Implementation Details
- **Root Option**: Add `root` option for scrollable feed containers (e.g., `root: document.querySelector('#feed-container')`)
- **Error Handler**: Add `onError` handler in MediaDisplay (e.g., fallback image)
- **Debugging Attribute**: Add `data-autoplay` attribute in StoryCard for debugging

#### 3. Configuration Options
- ✅ **Threshold Array**: Support for threshold arrays (e.g., `[0.25, 0.5, 0.75]`) for multiple triggers
  - **Why?** Fine-grained control (e.g., preload at 25%, play at 50%)

#### 4. User Experience
- ✅ **Pause on Fast Scroll**: Pause if user scrolls fast (prevents unwanted autoplay)
- ✅ **Swipe Gestures**: Swipe up/down to next/previous video (mobile)

#### 5. Browser Compatibility
- ✅ **iOS Safari**: Always use `playsInline` attribute (iOS autoplay is more restricted)

#### 6. Performance Considerations
- ✅ **Cleanup**: `video.pause()` on component unmount
- ✅ **Max Concurrent Videos**: Limit to 2-3 videos playing simultaneously

#### 7. Requirements Checklist
- ✅ **Battery Saver Mode**: Reduce autoplay on low battery
- ✅ **User Opt-Out**: Toggle in Settings

#### 8. Testing Checklist
- ✅ **Low Bandwidth Test**: Throttle network test

#### 9. Notes
- ✅ **Accessibility**: Announce autoplay with ARIA live region

---

## 🚀 Recommended Additions

### Security & Performance

1. **Bandwidth Analytics**
   - Track autoplay starts/pauses for analytics
   - Monitor user data usage patterns
   - Optimize based on usage data

2. **User Opt-Out**
   - Toggle autoplay in Settings page
   - Respect user preferences
   - Data saver mode integration

### UX/UI Enhancements

1. **Swipe Gestures**
   - Swipe up/down to navigate between videos
   - Mobile-first gesture support
   - Smooth transitions

2. **Volume Fade**
   - Smooth unmute transition
   - Gradual volume increase
   - Better user experience

### Feature Additions

1. **Playlist Mode**
   - Auto-advance to next story
   - Continuous playback
   - Skip option

2. **Watch Later Queue**
   - Save videos for later viewing
   - Queue management
   - Offline viewing support

### Documentation Enhancements

1. **Browser Policy Workarounds Table**
   - Detailed workarounds for each browser
   - Platform-specific solutions
   - Testing guidelines

---

## 🌟 Innovation Ideas

### AI-Powered Features

- **AI Autoplay**: AI-powered video recommendations for autoplay based on user preferences
- **Personalized Feeds**: Autoplay based on user history and engagement patterns

### Advanced Features

- **VR Autoplay**: VR mode immersive autoplay experience
- **Eco Mode**: Reduce autoplay on low battery/poor connection (intelligent throttling)
- **Social Autoplay**: Sync autoplay with friends' viewing sessions (social features)

---

## 📋 Browser Policy Workarounds

| Browser | Policy | Workaround |
|---------|--------|------------|
| Chrome/Edge | Autoplay allowed if muted | Always use `muted={true}` |
| Firefox | Autoplay allowed if muted | Always use `muted={true}` |
| Safari (Desktop) | Autoplay allowed if muted | Always use `muted={true}` |
| Safari (iOS) | Requires user interaction | Show play button, use `playsInline` |
| Mobile (General) | May require user interaction | Graceful fallback to manual play |

---

**Implementation Status**: ✅ Core features implemented, enhancements planned for future phases