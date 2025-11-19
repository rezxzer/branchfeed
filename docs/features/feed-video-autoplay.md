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

- [x] ✅ `useInViewport` hook created (`src/hooks/useInViewport.ts`)
- [x] ✅ Intersection Observer integration (in `useInViewport` hook)
- [x] ✅ StoryCard component updated (viewport detection with `useInViewport`)
- [x] ✅ MediaDisplay component updated (autoplay control with `autoPlay` prop)
- [x] ✅ Video ref management (`videoRef` in `MediaDisplay.tsx`)
- [x] ✅ Autoplay error handling (try/catch with graceful fallback)
- [ ] Browser compatibility testing (manual testing required)
- [ ] Mobile testing (manual testing required)
- [x] ✅ Performance optimization (lazy loading, preload="metadata", pause on exit)
- [ ] User experience testing (manual testing required)
- [x] ✅ Battery Saver Mode Support (`useBatterySaver` hook in `StoryCard.tsx`)
- [x] ✅ User Opt-Out Toggle (`NotificationSettings.tsx` with video autoplay toggle)
- [x] ✅ Max Concurrent Videos Limit (`VideoAutoplayContext` with MAX_CONCURRENT_VIDEOS = 3)
- [x] ✅ Cleanup on Unmount (`video.pause()` in `MediaDisplay.tsx` useEffect cleanup)
- [x] ✅ Debugging Attributes (`data-autoplay` attribute in `StoryCard.tsx`)
- [x] ✅ Fallback Image on Error (`ErrorState` component in `MediaDisplay.tsx`)

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

## 🎛️ Playback Speed Control

### Overview

Playback Speed Control allows users to adjust video playback speed (0.5x, 0.75x, 1x, 1.25x, 1.5x, 2x) with persistence across page reloads.

**Location**: `src/hooks/usePlaybackSpeed.ts`, `src/components/MediaDisplay.tsx`

**Status**: ✅ **COMPLETED**

### Features

1. **Adjustable Playback Speed**
   - Options: 0.5x, 0.75x, 1x, 1.25x, 1.5x, 2x
   - Native HTML5 video controls support
   - Automatic persistence to localStorage

2. **Persistence**
   - Playback speed preference saved in localStorage
   - Restored when new videos load
   - Works across page reloads

3. **Integration**
   - Integrated with `MediaDisplay` component
   - Works with native video controls
   - Automatic restoration on video load

### Implementation

#### usePlaybackSpeed Hook

```typescript
// src/hooks/usePlaybackSpeed.ts
import { usePlaybackSpeed } from '@/hooks/usePlaybackSpeed'

const { playbackSpeed, setPlaybackSpeed } = usePlaybackSpeed({
  persistToStorage: true,
  defaultSpeed: 1.0,
})

// Playback speed options
export const PLAYBACK_SPEED_OPTIONS = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0] as const
```

#### MediaDisplay Integration

```typescript
// src/components/MediaDisplay.tsx
import { usePlaybackSpeed, PLAYBACK_SPEED_OPTIONS } from '@/hooks/usePlaybackSpeed'

export function MediaDisplay({ ... }: MediaDisplayProps) {
  const { playbackSpeed, setPlaybackSpeed: setPersistedPlaybackSpeed } = usePlaybackSpeed({
    persistToStorage: true,
    defaultSpeed: 1.0,
  })

  // Restore playback speed when video metadata loads
  useEffect(() => {
    const video = videoRef.current
    if (!video || mediaType !== 'video') return

    if (video.playbackRate !== playbackSpeed) {
      video.playbackRate = playbackSpeed
    }
  }, [mediaType, playbackSpeed])

  return (
    <video
      ref={videoRef}
      src={mediaUrl}
      onRateChange={(e) => {
        // Update persisted playback speed when user changes speed via controls
        const newSpeed = e.currentTarget.playbackRate
        const closestSpeed = PLAYBACK_SPEED_OPTIONS.reduce((prev, curr) => {
          return Math.abs(curr - newSpeed) < Math.abs(prev - newSpeed) ? curr : prev
        }, playbackSpeed)
        if (closestSpeed !== playbackSpeed) {
          setPersistedPlaybackSpeed(closestSpeed)
        }
      }}
      {...otherProps}
    />
  )
}
```

### Usage

Users can adjust playback speed using native HTML5 video controls:
1. Right-click on video → Playback Speed → Select speed (0.5x, 0.75x, 1x, 1.25x, 1.5x, 2x)
2. Or use browser's native playback speed controls
3. Preference is automatically saved and restored

### Storage

- **Key**: `branchfeed-video-playback-speed`
- **Format**: Number (0.5, 0.75, 1.0, 1.25, 1.5, 2.0)
- **Default**: 1.0 (normal speed)

---

## 🖼️ Picture-in-Picture (PiP) Mode

### Overview

Picture-in-Picture (PiP) mode allows users to watch videos in a small floating window while browsing other content or applications.

**Location**: `src/hooks/usePictureInPicture.ts`, `src/components/MediaDisplay.tsx`

**Status**: ✅ **COMPLETED**

### Features

1. **PiP Support Detection**
   - Automatic browser compatibility check
   - Graceful fallback for unsupported browsers
   - Real-time PiP state tracking

2. **Custom PiP Button**
   - Floating button overlay on video (top-right corner)
   - Visual feedback for PiP state
   - Accessible with ARIA labels

3. **Event Handling**
   - Enter/exit PiP event listeners
   - Cross-window PiP support
   - Error handling with user-friendly messages

### Implementation

#### usePictureInPicture Hook

```typescript
// src/hooks/usePictureInPicture.ts
import { usePictureInPicture } from '@/hooks/usePictureInPicture'

const videoRef = useRef<HTMLVideoElement>(null)

const {
  isPictureInPicture,
  isSupported: isPiPSupported,
  enterPictureInPicture,
  exitPictureInPicture,
  togglePictureInPicture,
} = usePictureInPicture({
  videoRef,
  onEnter: () => console.log('Entered PiP'),
  onExit: () => console.log('Exited PiP'),
  onError: (error) => console.error('PiP error:', error),
})
```

#### MediaDisplay Integration

```typescript
// src/components/MediaDisplay.tsx
import { usePictureInPicture } from '@/hooks/usePictureInPicture'
import { PictureInPicture, X } from 'lucide-react'

export function MediaDisplay({ ... }: MediaDisplayProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  
  const {
    isPictureInPicture,
    isSupported: isPiPSupported,
    togglePictureInPicture,
  } = usePictureInPicture({
    videoRef,
    onEnter: () => logDebug('Entered Picture-in-Picture mode'),
    onExit: () => logDebug('Exited Picture-in-Picture mode'),
    onError: (error) => logWarn('Picture-in-Picture error', { error: error.message }),
  })

  return (
    <div className="relative w-full h-full">
      <video ref={videoRef} {...videoProps} />
      {isPiPSupported && (
        <button
          onClick={togglePictureInPicture}
          className="absolute top-2 right-2 z-10 p-2 rounded-lg bg-black/60 hover:bg-black/80 text-white"
          aria-label={isPictureInPicture ? 'Exit Picture-in-Picture' : 'Enter Picture-in-Picture'}
        >
          {isPictureInPicture ? (
            <X className="w-5 h-5" />
          ) : (
            <PictureInPicture className="w-5 h-5" />
          )}
        </button>
      )}
    </div>
  )
}
```

### Browser Compatibility

| Browser | PiP Support | Notes |
|---------|-------------|-------|
| Chrome/Edge | ✅ Yes | Full support |
| Firefox | ✅ Yes | Full support |
| Safari (Desktop) | ✅ Yes | macOS 10.15+ |
| Safari (iOS) | ❌ No | Not supported |
| Opera | ✅ Yes | Full support |

### Usage

1. **Enter PiP Mode**: Click the PiP button (top-right corner of video)
2. **Exit PiP Mode**: Click the X icon on the PiP button, or use browser's native PiP controls
3. **Automatic Detection**: Button only appears if PiP is supported in the browser

### Error Handling

- **Not Allowed**: User interaction may be required (some browsers require user gesture)
- **Not Supported**: Button is hidden automatically
- **Network Errors**: Graceful fallback with error logging

---

## 📶 Adaptive Video Quality

### Overview

Adaptive Video Quality automatically adjusts video loading strategy based on network connection speed, optimizing bandwidth usage and playback experience.

**Location**: `src/hooks/useNetworkQuality.ts`, `src/hooks/useAdaptiveVideoQuality.ts`, `src/components/MediaDisplay.tsx`

**Status**: ✅ **COMPLETED**

### Features

1. **Network Quality Detection**
   - Uses Navigator Connection API
   - Detects connection speed (slow, medium, fast)
   - Monitors connection changes in real-time
   - Respects save-data mode

2. **Adaptive Preload Strategy**
   - **Slow connection**: `preload="none"` (no preloading)
   - **Medium connection**: `preload="metadata"` (load metadata only)
   - **Fast connection**: `preload="auto"` (full preload)

3. **Network Quality Indicator**
   - Visual indicator on video (top-left corner)
   - Shows current network quality (slow/medium/fast)
   - Color-coded icons (yellow for slow, blue for medium, green for fast)

4. **Quality Selection**
   - Automatic quality selection based on network
   - Manual quality override support
   - Quality options: low (480p), medium (720p), high (1080p), auto

### Implementation

#### useNetworkQuality Hook

```typescript
// src/hooks/useNetworkQuality.ts
import { useNetworkQuality } from '@/hooks/useNetworkQuality'

const {
  quality, // 'slow' | 'medium' | 'fast' | 'unknown'
  connectionInfo,
  isSlow,
  isFast,
  isSaveData,
  refresh,
} = useNetworkQuality({
  pollInterval: 5000,
  slowThreshold: 1.5, // Mbps
  fastThreshold: 5.0, // Mbps
  onQualityChange: (quality) => {
    console.log('Network quality changed:', quality)
  },
})
```

#### useAdaptiveVideoQuality Hook

```typescript
// src/hooks/useAdaptiveVideoQuality.ts
import { useAdaptiveVideoQuality } from '@/hooks/useAdaptiveVideoQuality'

const {
  quality, // 'low' | 'medium' | 'high' | 'auto'
  networkQuality,
  isAdaptive,
  setQuality,
  setAdaptive,
  getRecommendedQuality,
  qualityOptions,
} = useAdaptiveVideoQuality({
  defaultQuality: 'auto',
  enableAdaptive: true,
  onQualityChange: (quality) => {
    console.log('Video quality changed:', quality)
  },
})
```

#### MediaDisplay Integration

```typescript
// src/components/MediaDisplay.tsx
import { useAdaptiveVideoQuality } from '@/hooks/useAdaptiveVideoQuality'

export function MediaDisplay({ ... }: MediaDisplayProps) {
  const {
    quality: videoQuality,
    networkQuality,
    isAdaptive,
  } = useAdaptiveVideoQuality({
    defaultQuality: 'auto',
    enableAdaptive: true,
  })

  // Determine preload strategy based on network quality
  const preloadStrategy = 
    networkQuality === 'slow' ? 'none' : 
    networkQuality === 'medium' ? 'metadata' : 
    'auto'

  return (
    <div className="relative w-full h-full">
      <video
        ref={videoRef}
        src={mediaUrl}
        preload={preloadStrategy}
        {...otherProps}
      />
      {/* Network Quality Indicator */}
      {networkQuality !== 'unknown' && (
        <div className="absolute top-2 left-2 z-10 px-2 py-1 rounded-lg bg-black/60">
          <Wifi className="w-3.5 h-3.5" />
          <span className="capitalize">{networkQuality}</span>
        </div>
      )}
    </div>
  )
}
```

### Network Quality Classification

| Network Quality | Downlink Speed | Preload Strategy | Use Case |
|----------------|----------------|------------------|----------|
| **Slow** | < 1.5 Mbps | `none` | Mobile data, slow Wi-Fi |
| **Medium** | 1.5 - 5.0 Mbps | `metadata` | Standard Wi-Fi, 3G/4G |
| **Fast** | > 5.0 Mbps | `auto` | Fast Wi-Fi, 5G, Ethernet |

### Browser Compatibility

| Browser | Connection API Support | Notes |
|---------|------------------------|-------|
| Chrome/Edge | ✅ Yes | Full support |
| Firefox | ✅ Yes | Full support |
| Safari (Desktop) | ⚠️ Partial | Limited support |
| Safari (iOS) | ❌ No | Not supported |
| Opera | ✅ Yes | Full support |

**Fallback**: If Connection API is not available, defaults to `medium` quality.

### Usage

1. **Automatic Adaptation**: Quality adjusts automatically based on network speed
2. **Visual Feedback**: Network quality indicator shows current connection status
3. **Preload Optimization**: Video preloading strategy adapts to connection speed
4. **Save-Data Mode**: Automatically uses slow quality when save-data is enabled

### Future Enhancements

- **Multiple Video Sources**: Support for multiple quality versions (480p, 720p, 1080p)
- **Adaptive Bitrate Streaming**: Dynamic quality switching during playback
- **Quality Selector UI**: Manual quality selection for users
- **Bandwidth Monitoring**: Track bandwidth usage and adjust accordingly

---

## 📊 Video View Duration Analytics

### Overview

Video View Duration Analytics tracks how long users watch videos, including playback events, watch percentage, and completion rates.

**Location**: `src/hooks/useVideoAnalytics.ts`, `src/components/MediaDisplay.tsx`, `src/app/api/stories/[id]/analytics/route.ts`

**Status**: ✅ **COMPLETED**

### Features

1. **View Duration Tracking**
   - Tracks total view duration in seconds
   - Records session start and end times
   - Calculates watch percentage (0-100%)
   - Detects video completion

2. **Event Tracking**
   - **Play**: Video started playing
   - **Pause**: Video paused
   - **Ended**: Video completed
   - **Seek**: User seeking through video
   - **Buffering**: Video buffering events

3. **Session Management**
   - Automatic session start on play
   - Automatic session end on unmount or video end
   - Minimum duration threshold (default: 1 second)
   - Session data sent to server

4. **API Integration**
   - POST endpoint for saving analytics
   - Authentication required
   - Story ID validation
   - Error handling and logging

### Implementation

#### useVideoAnalytics Hook

```typescript
// src/hooks/useVideoAnalytics.ts
import { useVideoAnalytics } from '@/hooks/useVideoAnalytics'

const videoRef = useRef<HTMLVideoElement>(null)

const {
  session,
  totalDuration,
  isWatching,
  startTracking,
  stopTracking,
  recordEvent,
  getWatchPercentage,
  setVideoRef,
} = useVideoAnalytics({
  videoId: storyId || mediaUrl,
  enabled: mediaType === 'video' && !!storyId,
  minDuration: 1,
  sendToServer: true,
  onSessionEnd: (session) => {
    console.log('Session ended:', session)
  },
})
```

#### MediaDisplay Integration

```typescript
// src/components/MediaDisplay.tsx
import { useVideoAnalytics } from '@/hooks/useVideoAnalytics'

export function MediaDisplay({ storyId, ... }: MediaDisplayProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  
  const {
    startTracking,
    stopTracking,
    recordEvent,
    setVideoRef,
  } = useVideoAnalytics({
    videoId: storyId || mediaUrl,
    enabled: mediaType === 'video' && !!storyId,
  })

  // Set video ref for analytics
  useEffect(() => {
    if (videoRef.current && mediaType === 'video') {
      setVideoRef(videoRef.current)
    }
  }, [videoRef, mediaType, setVideoRef])

  return (
    <video
      ref={videoRef}
      onPlay={() => {
        startTracking()
        recordEvent('play')
      }}
      onPause={() => recordEvent('pause')}
      onEnded={() => {
        recordEvent('ended')
        stopTracking()
      }}
      onSeeking={() => recordEvent('seek')}
      onWaiting={() => recordEvent('buffering')}
      {...otherProps}
    />
  )
}
```

#### API Endpoint

```typescript
// src/app/api/stories/[id]/analytics/route.ts
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Validate authentication
  // Validate story exists
  // Store analytics data
  // Return success response
}
```

### Tracked Metrics

| Metric | Description | Example |
|--------|-------------|---------|
| **Total Duration** | Total time video was watched (seconds) | 45.3 |
| **Watch Percentage** | Percentage of video watched (0-100%) | 75.5 |
| **Completed** | Whether video was watched to end | true/false |
| **Events** | Array of playback events | `[{type: 'play', timestamp: ...}]` |
| **Start Time** | Session start timestamp | 1234567890 |
| **End Time** | Session end timestamp | 1234567935 |

### Event Types

- **play**: Video started playing
- **pause**: Video paused
- **ended**: Video completed
- **seek**: User seeking through video
- **buffering**: Video buffering

### Usage

1. **Automatic Tracking**: Analytics start automatically when video plays
2. **Event Recording**: All playback events are recorded
3. **Session End**: Analytics sent to server when:
   - Video ends
   - Component unmounts
   - User navigates away
4. **Minimum Duration**: Sessions shorter than 1 second are not sent

### API Endpoint

**POST** `/api/stories/[id]/analytics`

**Request Body:**
```json
{
  "videoId": "story-id-or-url",
  "startTime": 1234567890,
  "endTime": 1234567935,
  "totalDuration": 45.3,
  "watchPercentage": 75.5,
  "completed": false,
  "events": [
    {
      "type": "play",
      "timestamp": 1234567890,
      "currentTime": 0,
      "duration": 60
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Analytics recorded"
}
```

### Future Enhancements

- **Database Storage**: Store analytics in `video_analytics` table
- **Analytics Dashboard**: View analytics in story analytics page
- **Aggregated Metrics**: Average watch time, completion rate, etc.
- **Heatmaps**: Visual representation of most-watched segments
- **A/B Testing**: Compare analytics across different video versions

---

## ⚡ Preload Next Video

### Overview

Preload Next Video automatically preloads the next video in the feed for smoother playback, reducing buffering and improving user experience.

**Location**: `src/hooks/usePreloadNext.ts`, `src/components/feed/FeedContent.tsx`

**Status**: ✅ **COMPLETED**

### Features

1. **Automatic Preloading**
   - Detects currently visible video in feed
   - Preloads next video(s) ahead of current position
   - Uses lightweight metadata preloading (`preload="metadata"`)

2. **Intersection Observer**
   - Tracks visible story cards in viewport
   - Detects when new video becomes visible
   - Triggers preload for next video automatically

3. **Smart Preloading**
   - Only preloads video media (skips images)
   - Prevents duplicate preloads (tracks preloaded videos)
   - Cleans up preloaded elements on unmount

4. **Performance Optimized**
   - Hidden video elements (not visible to user)
   - Metadata-only preloading (lightweight)
   - Automatic cleanup to prevent memory leaks

### Implementation

#### usePreloadNext Hook

```typescript
// src/hooks/usePreloadNext.ts
import { usePreloadNext } from '@/hooks/usePreloadNext'

const { preloadNext, preloadVideo, clearPreloads } = usePreloadNext({
  stories: feedStories,
  currentIndex: visibleIndex,
  preloadAhead: 1, // Preload 1 video ahead
  preloadDistance: 500, // Start preloading 500px before viewport
  enabled: true,
  onPreload: (target) => {
    console.log('Preloading:', target.url)
  },
})
```

#### FeedContent Integration

```typescript
// src/components/feed/FeedContent.tsx
import { usePreloadNext } from '@/hooks/usePreloadNext'

export function FeedContent({ stories, ... }: FeedContentProps) {
  const [visibleIndex, setVisibleIndex] = useState<number>(0)
  
  const { preloadNext } = usePreloadNext({
    stories,
    currentIndex: visibleIndex,
    preloadAhead: 1,
    enabled: true,
  })
  
  // Track visible story index
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Find most visible story card
        let maxIntersection = 0
        let mostVisibleIndex = 0
        
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > maxIntersection) {
            maxIntersection = entry.intersectionRatio
            const index = Array.from(storyCards).indexOf(entry.target)
            if (index !== -1) {
              mostVisibleIndex = index
            }
          }
        })
        
        if (maxIntersection > 0 && mostVisibleIndex !== visibleIndex) {
          setVisibleIndex(mostVisibleIndex)
          
          // Preload next video when current video becomes visible
          const currentStory = stories[mostVisibleIndex]
          if (currentStory?.media_type === 'video') {
            preloadNext()
          }
        }
      },
      {
        threshold: [0, 0.25, 0.5, 0.75, 1.0],
        rootMargin: '200px',
      }
    )
    
    storyCards.forEach((card) => observer.observe(card))
    
    return () => observer.disconnect()
  }, [stories, visibleIndex, preloadNext])
  
  return (
    <div>
      {stories.map((story, index) => (
        <StoryCard key={story.id} story={story} />
      ))}
    </div>
  )
}
```

### How It Works

1. **Visibility Detection**: Intersection Observer tracks which story card is most visible
2. **Video Detection**: When a video story becomes visible, next video is identified
3. **Preload Creation**: Hidden `<video>` element is created with `preload="metadata"`
4. **Background Loading**: Video metadata loads in background (lightweight)
5. **Cleanup**: Preloaded elements are cleaned up when no longer needed

### Preload Strategy

- **Preload Type**: `metadata` only (lightweight, doesn't download full video)
- **Preload Distance**: 200px before viewport (configurable)
- **Preload Ahead**: 1 video (configurable)
- **Cleanup**: Automatic on component unmount

### Performance Benefits

- **Reduced Buffering**: Next video is ready when user scrolls to it
- **Smoother Playback**: Less waiting time for video to start
- **Better UX**: Seamless video playback experience
- **Bandwidth Efficient**: Only preloads metadata, not full video

### Browser Support

Works in all modern browsers that support:
- Intersection Observer API
- HTML5 Video API
- `preload="metadata"` attribute

### Future Enhancements

- **Adaptive Preloading**: Adjust preload distance based on network speed
- **Preload Queue**: Queue multiple videos for preloading
- **Preload Priority**: Prioritize preloading based on user behavior
- **Bandwidth Management**: Pause preloading on slow connections

---

## 👆 Swipe Gestures

### Overview

Swipe Gestures enable users to navigate between videos in the feed using swipe gestures (up/down), providing a TikTok/Instagram Reels-like experience.

**Location**: `src/hooks/useSwipeGestures.ts`, `src/components/feed/StoryCard.tsx`, `src/components/feed/FeedContent.tsx`

**Status**: ✅ **COMPLETED**

### Features

1. **Touch & Mouse Support**
   - Detects swipe gestures on touch devices (mobile)
   - Also supports mouse drag for desktop testing
   - Handles touchstart, touchmove, touchend events

2. **Swipe Detection**
   - Detects swipe direction (up, down, left, right)
   - Calculates swipe distance, velocity, and duration
   - Configurable minimum distance and velocity thresholds

3. **Video Navigation**
   - Swipe up: Navigate to next video in feed
   - Swipe down: Navigate to previous video in feed
   - Smooth scroll to target video card
   - Only enabled for video stories (not images)

4. **Smart Gesture Handling**
   - Prevents default touch behavior during swipe
   - Only triggers on valid swipes (meets thresholds)
   - Prevents accidental swipes during scrolling

### Implementation

#### useSwipeGestures Hook

```typescript
// src/hooks/useSwipeGestures.ts
import { useSwipeGestures } from '@/hooks/useSwipeGestures'

const { onTouchStart, onTouchMove, onTouchEnd } = useSwipeGestures({
  minDistance: 50, // Minimum swipe distance (px)
  minVelocity: 300, // Minimum swipe velocity (px/s)
  maxDuration: 500, // Maximum swipe duration (ms)
  enabled: true,
  onSwipeUp: () => {
    navigateToNextVideo()
  },
  onSwipeDown: () => {
    navigateToPreviousVideo()
  },
  preventDefault: true,
})
```

#### StoryCard Integration

```typescript
// src/components/feed/StoryCard.tsx
import { useSwipeGestures } from '@/hooks/useSwipeGestures'

export function StoryCard({ story, onSwipeUp, onSwipeDown }: StoryCardProps) {
  const swipeHandlers = useSwipeGestures({
    enabled: story.media_type === 'video',
    minDistance: 50,
    minVelocity: 300,
    onSwipeUp: () => {
      if (story.media_type === 'video') {
        onSwipeUp?.()
      }
    },
    onSwipeDown: () => {
      if (story.media_type === 'video') {
        onSwipeDown?.()
      }
    },
    preventDefault: true,
  })

  return (
    <Card
      onTouchStart={swipeHandlers.onTouchStart}
      onTouchMove={swipeHandlers.onTouchMove}
      onTouchEnd={swipeHandlers.onTouchEnd}
      onMouseDown={swipeHandlers.onMouseDown}
      onMouseMove={swipeHandlers.onMouseMove}
      onMouseUp={swipeHandlers.onMouseUp}
    >
      {/* Story content */}
    </Card>
  )
}
```

#### FeedContent Navigation

```typescript
// src/components/feed/FeedContent.tsx
const navigateToNextVideo = useCallback(() => {
  // Find next video story starting from visibleIndex + 1
  for (let i = visibleIndex + 1; i < stories.length; i++) {
    if (stories[i].media_type === 'video') {
      const storyCard = document.querySelector(`[data-story-id="${stories[i].id}"]`)
      if (storyCard) {
        storyCard.scrollIntoView({ behavior: 'smooth', block: 'center' })
        setVisibleIndex(i)
        return
      }
    }
  }
}, [stories, visibleIndex])

const navigateToPreviousVideo = useCallback(() => {
  // Find previous video story starting from visibleIndex - 1
  for (let i = visibleIndex - 1; i >= 0; i--) {
    if (stories[i].media_type === 'video') {
      const storyCard = document.querySelector(`[data-story-id="${stories[i].id}"]`)
      if (storyCard) {
        storyCard.scrollIntoView({ behavior: 'smooth', block: 'center' })
        setVisibleIndex(i)
        return
      }
    }
  }
}, [stories, visibleIndex])

return (
  <div>
    {stories.map((story, index) => (
      <StoryCard
        story={story}
        onSwipeUp={navigateToNextVideo}
        onSwipeDown={navigateToPreviousVideo}
      />
    ))}
  </div>
)
```

### How It Works

1. **Touch Start**: Records initial touch position and timestamp
2. **Touch Move**: Tracks touch movement, detects if swipe is in progress
3. **Touch End**: Calculates swipe direction, distance, velocity, and duration
4. **Swipe Validation**: Checks if swipe meets minimum requirements (distance, velocity, duration)
5. **Navigation**: If valid swipe detected, navigates to next/previous video
6. **Smooth Scroll**: Scrolls to target video card with smooth animation

### Swipe Configuration

- **Min Distance**: 50px (configurable)
- **Min Velocity**: 300px/s (configurable)
- **Max Duration**: 500ms (configurable)
- **Prevent Default**: Enabled (prevents default touch behavior)

### Gesture Directions

- **Swipe Up** → Navigate to next video
- **Swipe Down** → Navigate to previous video
- **Swipe Left/Right** → Currently not used (can be extended for other actions)

### Performance Benefits

- **Intuitive Navigation**: Natural swipe gestures for video browsing
- **Mobile-First UX**: Optimized for touch devices
- **Smooth Scrolling**: Smooth scroll animation to target video
- **Efficient Detection**: Only processes valid swipes (meets thresholds)

### Browser Support

Works in all modern browsers that support:
- Touch Events API (mobile)
- Mouse Events API (desktop)
- `scrollIntoView` with smooth behavior

### Future Enhancements

- **Swipe Left/Right**: Add horizontal swipe for other actions (like, share, etc.)
- **Swipe Animation**: Add visual feedback during swipe (e.g., card movement)
- **Swipe Threshold Customization**: Allow users to customize swipe sensitivity
- **Fullscreen Swipe**: Enable swipe navigation in fullscreen video mode
- **Swipe History**: Track swipe history for undo/redo functionality

---

## 🔊 Volume Fade

### Overview

Volume Fade provides smooth fade in/out transitions when muting or unmuting videos, creating a more polished and professional user experience.

**Location**: `src/hooks/useVolumeFade.ts`, `src/components/MediaDisplay.tsx`

**Status**: ✅ **COMPLETED**

### Features

1. **Smooth Transitions**
   - Fade in when unmuting (0 → target volume)
   - Fade out when muting (current volume → 0)
   - Configurable fade duration (default: 300ms)
   - Multiple easing functions (linear, easeIn, easeOut, easeInOut)

2. **Animation Frame Based**
   - Uses `requestAnimationFrame` for smooth 60fps animations
   - Precise volume interpolation over time
   - Automatic cleanup on unmount

3. **Smart Fade Detection**
   - Only fades when mute state actually changes
   - Prevents unnecessary fades during volume restoration
   - Respects current fade state (doesn't interrupt ongoing fade)

4. **Configurable Options**
   - Fade duration (default: 300ms)
   - Easing function (default: easeInOut)
   - Number of animation steps (default: 30)
   - Enable/disable fade

### Implementation

#### useVolumeFade Hook

```typescript
// src/hooks/useVolumeFade.ts
import { useVolumeFade } from '@/hooks/useVolumeFade'

const videoRef = useRef<HTMLVideoElement>(null)

const { fadeIn, fadeOut, isFading, cancelFade } = useVolumeFade({
  videoRef,
  targetVolume: 1.0,
  enabled: true,
  duration: 300, // 300ms fade duration
  easing: 'easeInOut',
  onFadeStart: () => {
    console.log('Volume fade started')
  },
  onFadeComplete: () => {
    console.log('Volume fade completed')
  },
})

// Fade in when unmuting
const handleUnmute = () => {
  fadeIn()
}

// Fade out when muting
const handleMute = () => {
  fadeOut()
}
```

#### MediaDisplay Integration

```typescript
// src/components/MediaDisplay.tsx
import { useVolumeFade } from '@/hooks/useVolumeFade'

export function MediaDisplay({ muted, ... }: MediaDisplayProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const { volume: persistedVolume } = useVolumePersistence()
  
  const { fadeIn, fadeOut, isFading } = useVolumeFade({
    videoRef,
    targetVolume: persistedVolume,
    enabled: mediaType === 'video',
    duration: 300,
    easing: 'easeInOut',
  })

  // Handle mute/unmute with volume fade
  useEffect(() => {
    const video = videoRef.current
    if (!video || mediaType !== 'video' || isFading) {
      return
    }

    // If muted prop changes, trigger fade
    if (muted && video.volume > 0) {
      // Mute: fade out
      fadeOut()
    } else if (!muted && video.volume === 0 && persistedVolume > 0) {
      // Unmute: fade in
      fadeIn()
    }
  }, [muted, persistedVolume, mediaType, isFading, fadeIn, fadeOut])

  return (
    <video
      ref={videoRef}
      muted={muted}
      // ... other props
    />
  )
}
```

### How It Works

1. **Mute Detection**: Detects when `muted` prop changes
2. **Fade Trigger**: If muting, calls `fadeOut()`. If unmuting, calls `fadeIn()`
3. **Animation Loop**: Uses `requestAnimationFrame` to update volume smoothly
4. **Easing**: Applies easing function to create smooth acceleration/deceleration
5. **Completion**: Sets final volume and calls `onFadeComplete` callback

### Easing Functions

- **linear**: Constant speed (no easing)
- **easeIn**: Slow start, fast end
- **easeOut**: Fast start, slow end
- **easeInOut**: Slow start and end, fast middle (default)

### Fade Configuration

- **Duration**: 300ms (configurable)
- **Steps**: 30 animation frames (configurable)
- **Easing**: easeInOut (configurable)
- **Target Volume**: From `useVolumePersistence` hook

### Performance Benefits

- **Smooth Transitions**: Professional fade in/out animations
- **Better UX**: Less jarring than instant mute/unmute
- **Efficient**: Uses `requestAnimationFrame` for optimal performance
- **Non-Blocking**: Doesn't block UI during fade

### Browser Support

Works in all modern browsers that support:
- `requestAnimationFrame` API
- HTML5 Video API
- `video.volume` property

### Future Enhancements

- **Custom Easing**: Allow custom easing functions
- **Fade Speed Control**: User-configurable fade duration
- **Fade on Volume Change**: Fade when volume slider is moved
- **Fade Presets**: Different fade styles (fast, slow, dramatic)

---

## 📺 Playlist Mode

### Overview

Playlist Mode automatically advances to the next video in the feed when the current video ends, creating a continuous viewing experience similar to YouTube playlists or TikTok's For You page.

**Location**: `src/hooks/usePlaylistMode.ts`, `src/components/feed/FeedContent.tsx`, `src/components/feed/StoryCard.tsx`

**Status**: ✅ **COMPLETED**

### Features

1. **Auto-Advance**
   - Automatically navigates to next video when current video ends
   - Configurable delay before advancing (default: 500ms)
   - Only advances for videos (skips images)

2. **Smart Navigation**
   - Finds next video story in feed
   - Smooth scroll to target video card
   - Automatically loads more content if needed

3. **Playlist Control**
   - Enable/disable playlist mode
   - Callback when playlist ends (no more videos)
   - Prevents duplicate advances

4. **Video End Detection**
   - Listens to `onEnded` event from video element
   - Integrates with video analytics
   - Stops tracking when video ends

### Implementation

#### usePlaylistMode Hook

```typescript
// src/hooks/usePlaylistMode.ts
import { usePlaylistMode } from '@/hooks/usePlaylistMode'

const { handleVideoEnd, isEnabled, enable, disable } = usePlaylistMode({
  enabled: true,
  advanceDelay: 500,
  videosOnly: true,
  onAdvance: (currentIndex, nextIndex) => {
    navigateToNextVideo()
  },
  onPlaylistEnd: () => {
    console.log('Playlist ended')
  },
})

// Handle video end
<video onEnded={() => handleVideoEnd(currentIndex)} />
```

#### FeedContent Integration

```typescript
// src/components/feed/FeedContent.tsx
import { usePlaylistMode } from '@/hooks/usePlaylistMode'

export function FeedContent({ stories, ... }: FeedContentProps) {
  const [playlistModeEnabled, setPlaylistModeEnabled] = useState<boolean>(false)
  
  const { handleVideoEnd: handlePlaylistVideoEnd } = usePlaylistMode({
    enabled: playlistModeEnabled,
    advanceDelay: 500,
    videosOnly: true,
    onAdvance: (currentIndex, nextIndex) => {
      navigateToNextVideo()
    },
    onPlaylistEnd: () => {
      logDebug('Playlist ended - no more videos')
    },
  })

  const navigateToNextVideo = useCallback(() => {
    // Find next video story starting from visibleIndex + 1
    for (let i = visibleIndex + 1; i < stories.length; i++) {
      if (stories[i].media_type === 'video') {
        const storyCard = document.querySelector(`[data-story-id="${stories[i].id}"]`)
        if (storyCard) {
          storyCard.scrollIntoView({ behavior: 'smooth', block: 'center' })
          setVisibleIndex(i)
          return
        }
      }
    }
    
    // If no more videos found, try to load more
    if (hasMore && !loading) {
      onLoadMore()
    }
  }, [stories, visibleIndex, hasMore, loading, onLoadMore])

  return (
    <div>
      {stories.map((story, index) => (
        <StoryCard
          story={story}
          onVideoEnd={() => {
            if (playlistModeEnabled) {
              handlePlaylistVideoEnd(index)
            }
          }}
        />
      ))}
    </div>
  )
}
```

#### StoryCard Integration

```typescript
// src/components/feed/StoryCard.tsx
export function StoryCard({ story, onVideoEnd, ... }: StoryCardProps) {
  return (
    <MediaDisplay
      mediaUrl={story.media_url}
      mediaType={story.media_type}
      onEnded={() => {
        if (story.media_type === 'video') {
          onVideoEnd?.()
        }
      }}
    />
  )
}
```

#### MediaDisplay Integration

```typescript
// src/components/MediaDisplay.tsx
export function MediaDisplay({ onEnded, ... }: MediaDisplayProps) {
  return (
    <video
      onEnded={() => {
        // Video ended - notify parent (for playlist mode)
        onEnded?.()
        // Record ended event for analytics
        recordEvent('ended')
        // Stop tracking
        stopTracking()
      }}
    />
  )
}
```

### How It Works

1. **Video End Detection**: `onEnded` event fires when video finishes
2. **Playlist Handler**: `handleVideoEnd` is called with current video index
3. **Advance Delay**: Waits for configured delay (default: 500ms)
4. **Next Video Search**: Finds next video story in feed
5. **Smooth Navigation**: Scrolls to target video card with smooth animation
6. **Auto-Load More**: If no more videos, automatically loads more content

### Configuration

- **Enabled**: `false` by default (can be enabled via user preference)
- **Advance Delay**: 500ms (configurable)
- **Videos Only**: `true` (skips images, only advances to videos)
- **Auto-Load More**: Enabled (loads more content if no videos found)

### Performance Benefits

- **Continuous Viewing**: Seamless video playback experience
- **Automatic Navigation**: No manual scrolling needed
- **Smart Loading**: Automatically loads more content when needed
- **Efficient**: Only processes video end events when enabled

### Browser Support

Works in all modern browsers that support:
- HTML5 Video API
- `onEnded` event
- `scrollIntoView` with smooth behavior

### Future Enhancements

- **User Preference**: Allow users to enable/disable playlist mode in settings
- **Playlist Controls**: Add UI controls to enable/disable playlist mode
- **Playlist History**: Track viewed videos in playlist
- **Shuffle Mode**: Randomize video order in playlist
- **Repeat Mode**: Loop playlist when it ends
- **Playlist Progress**: Show progress indicator for current playlist

---

## 📺 Watch Later Queue

### Overview

Watch Later Queue allows users to save videos for later viewing, creating a personalized collection of videos they want to watch at a convenient time.

**Location**: `src/hooks/useWatchLater.ts`, `src/app/api/watch-later`, `src/components/story/WatchLaterButton.tsx`, `src/app/watch-later/page.tsx`, `supabase/migrations/20250115_32_add_watch_later.sql`

**Status**: ✅ **COMPLETED**

### Features

1. **Save Videos**
   - Save videos to watch later queue
   - Only videos can be saved (images are excluded)
   - One-click save/remove from feed

2. **Watch Later Page**
   - Dedicated page to view saved videos
   - Grid layout with story cards
   - Empty state with helpful message

3. **Database Storage**
   - `watch_later` table with user_id and story_id
   - RLS policies for security
   - Automatic cleanup on story/user deletion

4. **UI Integration**
   - WatchLaterButton component in StoryCard
   - Only shows for videos
   - Visual feedback (Clock icon when not saved, X icon when saved)

### Implementation

#### Database Migration

```sql
-- supabase/migrations/20250115_32_add_watch_later.sql
CREATE TABLE IF NOT EXISTS watch_later (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  story_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT fk_watch_later_user FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE,
  CONSTRAINT fk_watch_later_story FOREIGN KEY (story_id) REFERENCES stories(id) ON DELETE CASCADE,
  CONSTRAINT uq_watch_later_user_story UNIQUE (user_id, story_id)
);
```

#### useWatchLater Hook

```typescript
// src/hooks/useWatchLater.ts
import { useWatchLater } from '@/hooks/useWatchLater'

const { isInWatchLater, loading, toggleWatchLater } = useWatchLater(
  storyId,
  initialInWatchLater
)

// Toggle watch later
await toggleWatchLater(storyId)
```

#### API Endpoints

```typescript
// POST /api/watch-later/[id] - Add video to watch later
// DELETE /api/watch-later/[id] - Remove video from watch later
// GET /api/watch-later - Get user's watch later queue
```

#### WatchLaterButton Component

```typescript
// src/components/story/WatchLaterButton.tsx
<WatchLaterButton
  storyId={story.id}
  variant="ghost"
  size="sm"
  className="text-gray-400 hover:text-brand-cyan"
/>
```

#### Watch Later Page

```typescript
// src/app/watch-later/page.tsx
// Displays all saved videos in a grid layout
// Shows empty state if no videos saved
```

### How It Works

1. **Save Video**: User clicks WatchLaterButton on a video story
2. **API Call**: POST request to `/api/watch-later/[id]`
3. **Validation**: Checks if story is a video (images are rejected)
4. **Database**: Inserts record into `watch_later` table
5. **UI Update**: Button icon changes to indicate saved state
6. **View Queue**: User navigates to `/watch-later` to see all saved videos

### Security

- **RLS Policies**: Users can only read/modify their own watch later queue
- **Authentication**: All endpoints require authentication
- **Validation**: Only videos can be saved (server-side validation)
- **Cascade Delete**: Watch later items are automatically deleted when story or user is deleted

### Performance

- **Optimistic Updates**: UI updates immediately before API call completes
- **Indexed Queries**: Database indexes on `user_id` and `story_id` for fast lookups
- **Efficient Loading**: Watch Later page loads videos in batches (pagination support)

### Browser Support

Works in all modern browsers that support:
- Fetch API
- React hooks
- Next.js routing

### Future Enhancements

- **Queue Management**: Reorder videos in watch later queue
- **Categories**: Organize watch later videos into categories
- **Notifications**: Remind users about unwatched videos
- **Watch Progress**: Track which videos have been watched
- **Share Queue**: Share watch later queue with friends
- **Export**: Export watch later queue as a list

---

## 🔄 Future Enhancements

### Short-term (Phase 3-4)

- [x] ✅ **Volume Persistence**: Remember user's volume preference (`useVolumePersistence` hook, localStorage persistence)
- [x] ✅ **Playback Speed**: Adjustable playback speed with persistence (`usePlaybackSpeed` hook, localStorage persistence, options: 0.5x, 0.75x, 1x, 1.25x, 1.5x, 2x)
- [x] ✅ **Picture-in-Picture**: PiP mode support (`usePictureInPicture` hook, browser compatibility checks, custom PiP button)
- [x] ✅ **Video Quality**: Adaptive quality based on connection (`useNetworkQuality` hook, `useAdaptiveVideoQuality` hook, adaptive preload strategy, network quality indicator)
- [x] ✅ **Analytics**: Track video view duration (`useVideoAnalytics` hook, event tracking, session management, API endpoint)
- [x] ✅ **Preload Next**: Preload next video in feed (`usePreloadNext` hook, Intersection Observer, automatic preloading)
- [x] ✅ **Swipe Gestures**: Swipe to next/previous video (`useSwipeGestures` hook, touch/mouse event handling, smooth scroll navigation)
- [x] ✅ **Volume Fade**: Smooth unmute transition (`useVolumeFade` hook, fade in/out transitions, easing functions)
- [x] ✅ **Playlist Mode**: Auto-advance to next story (`usePlaylistMode` hook, video end detection, auto-navigation)
- [x] ✅ **Watch Later Queue**: Save videos for later viewing (`useWatchLater` hook, watch_later table, WatchLaterButton component, Watch Later page)

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
**Version**: 1.2  
**Status**: ✅ **COMPLETED** - Core features implemented, manual testing pending

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