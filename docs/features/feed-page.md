# Feed Page - BranchFeed

ეს დოკუმენტაცია აღწერს Feed Page-ის იმპლემენტაციას BranchFeed-ში.

---

## 📋 Overview

Feed Page არის BranchFeed-ის მთავარი კონტენტის გვერდი, სადაც:
- მომხმარებლები ხედავენ ყველა **root branching story-ს** (Phase 2)
- მომხმარებლებს შეუძლიათ აირჩიონ და გახსნან stories
- მომხმარებლებს შეუძლიათ ურთიერთქმედება (like, view count)
- Regular posts გადავა Phase 3+ (იხ. Future Enhancements)

**Route**: `/feed` (protected route)

**Status**: 🟡 **High Priority** - Phase 2 (Core Features)

> ℹ️ **შენიშვნა**
>
> Feed Page არის **დაცული გვერდი** - მხოლოდ ავტორიზებულ მომხმარებლებს შეუძლიათ წვდომა.
>
> Feed Page არის Phase 2-ის ძირითადი გვერდი, სადაც მომხმარებლები პირველად ხედავენ BranchFeed-ის კონტენტს.

> ℹ️ **Cursor-ზე**
>
> ამ ფაილში მოყვანილი კომპონენტები და სტრუქტურა არის **სტრუქტურის მაგალითები**.
>
> რეალური იმპლემენტაცია უნდა შეიქმნას Cursor-ის მიერ, `.cursorrules` და
> `docs/PROJECT_PRIORITIES.md` ფაილებში აღწერილი წესების დაცვით.

---

## 🎯 Features

### Core Features (MVP - Phase 2)

1. **Stories Display (Root Branching Stories Only)**
   - Branching stories list (root stories only - `is_root = true`)
   - Story cards with preview
   - Branching-specific metadata (branches count, user progress)
   - Story type tag ("Branching Story")

2. **Content Navigation**
   - Click story card → navigate to `/story/[id]`
   - Story card shows: thumbnail, title, author, stats (likes, views)
   - Branching metadata: paths count, "Continue" label (if user has progress)

3. **Basic Interactions**
   - Like button (quick like from feed)
   - View count display
   - Author info (avatar, username)
   - Click author → navigate to `/profile/[id]`

4. **Content Loading**
   - Pagination (basic - load more button)
   - Loading states (Spinner component)
   - Empty states (EmptyState component)
   - Error states (ErrorState component)

5. **Content Sorting**
   - Sort by: Recent (default), Popular (likes), Trending (views)
   - Filter options: Phase 2-ში მხოლოდ Stories (Posts filter → Phase 3+)

---

## 📐 Page Layout

### Structure

```
┌─────────────────────────────────────┐
│  Header (Navigation)               │
├─────────────────────────────────────┤
│  Feed Controls                      │
│  Sort: [Recent ▼]                  │
│  (Posts filter → Phase 3+)         │
├─────────────────────────────────────┤
│  Feed Content                       │
│  ┌─────────────────────────────┐   │
│  │ Story Card 1                │   │
│  │ [Thumbnail] Title           │   │
│  │ Author • Likes • Views      │   │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │ Story Card 2                │   │
│  └─────────────────────────────┘   │
│  ...                                │
│  [Load More] button                │
└─────────────────────────────────────┘
```

### Mobile Layout

```
┌─────────────────┐
│ Header (Mobile) │
├─────────────────┤
│ Feed Controls   │
│ Sort: [Recent▼] │
├─────────────────┤
│ Story Card      │
│ [Full Width]    │
├─────────────────┤
│ Story Card      │
│ [Full Width]    │
├─────────────────┤
│ [Load More]     │
└─────────────────┘
```

---

## 🎨 UI Components

### Used Components

1. **Header** (`src/components/Header.tsx`)
   - Navigation bar
   - User menu
   - Language switcher

2. **StoryCard** (`src/components/feed/StoryCard.tsx`)
   - Story thumbnail (9:16 aspect ratio)
   - **Media Display**: Images and Videos supported
   - **Video Autoplay**: Videos autoplay when in viewport (muted, looped)
   - Story title
   - Author info (avatar, username)
   - Stats (likes, views)
   - **Branching-specific UI** (იხ. ქვემოთ)
   - Click → navigate to `/story/[id]`

3. **MediaDisplay** (`src/components/MediaDisplay.tsx`)
   - Displays images and videos
   - Video autoplay support (viewport-based)
   - Video controls (play, pause, volume, fullscreen)
   - Lazy loading for performance
   - Error handling with fallback

3. **Card** (`src/components/ui/Card.tsx`)
   - Base card component for StoryCard

4. **Button** (`src/components/ui/Button.tsx`)
   - Load More button

5. **Spinner** (`src/components/ui/Spinner.tsx`)
   - Loading state

6. **EmptyState** (`src/components/EmptyState.tsx`)
   - Empty feed message
   - "Create your first story" CTA

7. **ErrorState** (`src/components/ErrorState.tsx`)
   - Error loading feed
   - Retry button

### UI Style Guidelines

- **Card Layout**: Grid layout (3 columns desktop, 2 columns tablet, 1 column mobile)
- **Card Spacing**: Consistent gap between cards
- **Card Hover**: Subtle hover effect (shadow, scale)
- **Thumbnail**: 9:16 aspect ratio for stories
- **Typography**: Title (bold), Author (small, muted), Stats (small, muted)

### StoryCard – Branching Specific UI

- **Branch summary**:
  - `{branchesCount}` paths (e.g., "5 paths")
  - `{endingsCount}` endings (future enhancement)

- **User progress** (optional MVP+):
  - Label: "Continue" when user has existing path
  - Save last visited node in `user_story_progress` table
  - Display: "Continue from: Path B" or "Continue from choice 3"

- **Type tag**:
  - Pill: "Branching Story" to distinguish from future regular posts

### StoryCard – Video Support

- **Video Display**:
  - Videos are displayed using `MediaDisplay` component
  - 9:16 aspect ratio maintained
  - Video autoplay when in viewport (50% visible threshold)
  - Videos are muted by default (user can unmute)
  - Videos loop automatically
  - Video controls visible (play, pause, volume, fullscreen)
  - Pause when scrolling fast or out of viewport
  - Lazy loading for performance

- **Video Autoplay Behavior**:
  - Autoplay only when video is in viewport (Intersection Observer)
  - Pause when scrolling away from viewport
  - Pause on fast scroll (prevents unwanted autoplay)
  - Max 2-3 concurrent videos playing (performance optimization)
  - Cleanup on component unmount (video.pause())

- **Video Formats Supported**:
  - MP4, WebM, MOV, AVI, MKV
  - Max size: 50MB per video
  - 9:16 aspect ratio recommended

- **Image Display**:
  - Images displayed using Next.js Image component
  - 9:16 aspect ratio maintained
  - Lazy loading enabled
  - Optimized for performance

---

## 🔐 Access Control

- `/feed` არის **დაცული როუთი**:
  - `middleware.ts` → აუთენტიფიცირებულს აგდებს `/signin`-ზე.
  - `app/feed/page.tsx` → server-side `getCurrentUser()` შემოწმება.
- თუ `getCurrentUser()` აბრუნებს `null` → `redirect('/signin')`.
- ყველა client-side fetch იყენებს Supabase RLS-ს (read only public stories).

---

## 🔧 Implementation Details

### Page Component Structure (Server Component)

```typescript
// app/feed/page.tsx
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { FeedPageClient } from '@/components/feed/FeedPageClient';

export default async function FeedPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/signin');
  }

  return <FeedPageClient />;
}
```

### Feed Page Client Component

```typescript
// components/feed/FeedPageClient.tsx
'use client';

import { FeedContent } from '@/components/FeedContent';
import { FeedControls } from '@/components/FeedControls';
import { useFeed } from '@/hooks/useFeed';

export function FeedPageClient() {
  const { 
    stories, 
    loading, 
    error, 
    hasMore, 
    loadMore,
    sortBy,
    setSortBy 
  } = useFeed();

  return (
    <div className="container mx-auto px-4 py-8">
      <FeedControls 
        sortBy={sortBy}
        onSortChange={setSortBy}
      />
      <FeedContent 
        stories={stories}
        loading={loading}
        error={error}
        hasMore={hasMore}
        onLoadMore={loadMore}
      />
    </div>
  );
}
```

### Feed Content Component

```typescript
// components/FeedContent.tsx
'use client';

import { StoryCard } from '@/components/StoryCard';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';

interface FeedContentProps {
  stories: Story[];
  loading: boolean;
  error: Error | null;
  hasMore: boolean;
  onLoadMore: () => void;
  onPrefetch?: () => void;
}

export function FeedContent({ 
  stories, 
  loading, 
  error, 
  hasMore, 
  onLoadMore,
  onPrefetch
}: FeedContentProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const loadMoreButtonRef = useRef<HTMLDivElement>(null);

  // Optional: Prefetch next page data when user scrolls near the "Load More" button
  useEffect(() => {
    if (!hasMore || loading || !loadMoreButtonRef.current || !onPrefetch) {
      return;
    }

    let prefetched = false;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!prefetched && (entry.isIntersecting || entry.boundingClientRect.top < window.innerHeight + 300)) {
          prefetched = true;
          onPrefetch(); // Trigger prefetch in background
        }
      },
      { rootMargin: '300px', threshold: 0 }
    );

    observer.observe(loadMoreButtonRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading, onPrefetch]);

  if (error) {
    return <ErrorState onRetry={onLoadMore} />;
  }

  if (loading && stories.length === 0) {
    return <Spinner size="lg" />;
  }

  if (stories.length === 0) {
    return (
      <EmptyState
        icon="📖"
        title={t('emptyStates.feed.noContent.title')}
        description={t('emptyStates.feed.noContent.description')}
        actionLabel={t('emptyStates.feed.noContent.action')}
        onAction={() => router.push('/create')}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {stories.map((story) => (
        <StoryCard key={story.id} story={story} />
      ))}
      
      {hasMore && (
        <div className="col-span-full flex justify-center mt-8">
          <Button 
            onClick={onLoadMore}
            disabled={loading}
            variant="outline"
          >
            {loading ? <Spinner size="sm" /> : t('feed.loadMore')}
          </Button>
        </div>
      )}
    </div>
  );
}
```

### useFeed Hook

```typescript
// hooks/useFeed.ts
'use client';

import { useState, useEffect } from 'react';
import { createClientClient } from '@/lib/auth';

type SortType = 'recent' | 'popular' | 'trending';

export function useFeed(feedType: FeedType = 'all', tagId?: string) {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortType>('recent');
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const prefetchedDataRef = useRef<Story[] | null>(null);
  const prefetchingRef = useRef<boolean>(false);

  const loadFeed = async (pageNum: number) => {
    try {
      setLoading(true);
      setError(null);

      // Use client-side Supabase client (respects RLS)
      const supabase = createClientClient();

      // Determine sort order based on sortBy
      let orderBy = 'created_at';
      let ascending = false;
      
      if (sortBy === 'popular') {
        orderBy = 'likes_count';
      } else if (sortBy === 'trending') {
        orderBy = 'views_count';
      }

      // Fetch root stories only (Phase 2)
      const { data, error: fetchError } = await supabase
        .from('stories')
        .select('*, author:profiles(*)')
        .eq('is_root', true)
        .order(orderBy, { ascending })
        .range((pageNum - 1) * 10, pageNum * 10 - 1);

      if (fetchError) throw fetchError;

      if (pageNum === 1) {
        setStories(data || []);
      } else {
        setStories(prev => [...prev, ...(data || [])]);
      }

      setHasMore((data?.length || 0) === 10);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeed(1);
    setPage(1);
  }, [sortBy]);

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      loadFeed(nextPage);
      setPage(nextPage);
    }
  };

  return {
    stories,
    loading,
    error,
    hasMore,
    loadMore,
    sortBy,
    setSortBy,
  };
}
```

> **შენიშვნა: RLS და Client Client**
>
> `useFeed()` იყენებს client-side Supabase client-ს (`createClientClient()`), რათა ყველა კითხვა დაექვემდებაროს RLS პოლიტიკას და არ გამოიყენოს service role key.

### StoryCard Component

```typescript
// components/feed/StoryCard.tsx
'use client';

import { Card } from '@/components/ui/Card';
import { MediaDisplay } from '@/components/MediaDisplay';
import { useRouter } from 'next/navigation';
import { useInViewport } from '@/hooks/useInViewport';
import { useScrollSpeed } from '@/hooks/useScrollSpeed';

interface StoryCardProps {
  story: Story;
}

export function StoryCard({ story }: StoryCardProps) {
  const router = useRouter();
  
  // Viewport detection for video autoplay
  const { ref: viewportRef, isInViewport } = useInViewport({
    threshold: 0.5, // 50% of video must be visible
    rootMargin: '0px',
  });

  // Fast scroll detection to pause videos
  const { isFastScrolling } = useScrollSpeed({
    fastScrollThreshold: 1000, // pixels per second
    debounceMs: 100,
  });

  return (
    <Card 
      ref={viewportRef}
      className="cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => router.push(`/story/${story.id}`)}
    >
      <div className="aspect-[9/16] relative overflow-hidden rounded-t-lg">
        {story.media_url && story.media_type ? (
          <MediaDisplay
            mediaUrl={story.media_url}
            mediaType={story.media_type}
            alt={story.title}
            lazy={true}
            maxWidth="w-full"
            // Video autoplay settings for feed
            autoPlay={
              story.media_type === 'video' 
                ? (isInViewport && !isFastScrolling) 
                : false
            }
            loop={story.media_type === 'video'}
            muted={story.media_type === 'video'}
            controls={true}
          />
        ) : (
          <div className="relative aspect-[9/16] w-full rounded-lg overflow-hidden bg-gray-700 flex items-center justify-center">
            <span className="text-4xl text-gray-400">📖</span>
          </div>
        )}
        
        {/* Type tag */}
        <div className="absolute top-2 right-2">
          <span className="px-2 py-1 text-xs bg-primary/80 text-white rounded-full">
            Branching Story
          </span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2">{story.title}</h3>
        
        {/* Branching metadata */}
        <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
          <span>🌳 {story.branches_count || 0} paths</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <img 
            src={story.author.avatar_url} 
            alt={story.author.username}
            className="w-6 h-6 rounded-full"
          />
          <span>{story.author.username}</span>
        </div>
        <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
          <span>❤️ {story.likes_count || 0}</span>
          <span>👁️ {story.views_count || 0}</span>
        </div>
      </div>
    </Card>
  );
}
```

---

## 📊 Database Schema

### Tables Used

1. **stories** table
   - `id` (UUID, primary key)
   - `title` (text)
   - `media_url` (text, Supabase Storage) - URL to image or video
   - `media_type` (text, CHECK) - 'image' or 'video' (required for proper display)
   - `thumbnail_url` (text, optional) - Optional thumbnail for videos
   - `author_id` (UUID, foreign key → profiles.id)
   - `is_root` (boolean) - true for root stories shown in feed
   - `created_at` (timestamp)
   - `likes_count` (integer, cached)
   - `views_count` (integer, cached)

2. **profiles** table
   - `id` (UUID, primary key)
   - `username` (text)
   - `avatar_url` (text, optional)

### RLS Policies (Summary)

- **stories**:
  - SELECT: ყველა authenticated მომხმარებელს შეუძლია root stories ნახვა.
  - INSERT/UPDATE/DELETE: მხოლოდ ავტორს (`auth.uid() = author_id`), დეტალები Branching Stories System დოკში.
- **profiles**:
  - SELECT: public profile data ყველა authenticated მომხმარებლისთვის (Phase 1 პროფილის დოკიდან).

> **შენიშვნა: RLS Implementation**
>
> ყველა RLS პოლიტიკა უნდა იყოს ჩაწერილი `do $$ ... end $$;` ბლოკით Supabase მიგრაციებში.

### Indexes (Performance)

Recommended indexes for Feed queries:

- `stories(created_at DESC)` – Recent feed
- `stories(likes_count DESC)` – Popular feed
- `stories(views_count DESC)` – Trending feed
- Optional: composite index `(is_root, created_at DESC)`

### Queries

```sql
-- Fetch root stories for feed (Phase 2)
SELECT 
  s.*,
  p.username,
  p.avatar_url,
  COUNT(DISTINCT sn.id) as branches_count
FROM stories s
JOIN profiles p ON s.author_id = p.id
LEFT JOIN story_nodes sn ON sn.story_id = s.id
WHERE s.is_root = true
GROUP BY s.id, p.username, p.avatar_url
ORDER BY s.created_at DESC
LIMIT 10 OFFSET ?;
```

---

## 🌐 Internationalization (i18n)

### Translation Keys

```json
{
  "feed": {
    "title": "Feed",
    "loadMore": "Load More",
    "loading": "Loading feed...",
    "filters": {
      "all": "All",
      "stories": "Stories",
      "posts": "Posts"
    },
    "_note": "filters.posts key exists for Phase 3+, but UI is hidden in Phase 2",
    "sort": {
      "recent": "Recent",
      "popular": "Popular",
      "trending": "Trending"
    }
  },
  "emptyStates": {
    "feed": {
      "noContent": {
        "title": "No content yet",
        "description": "Be the first to create a branching story!",
        "action": "Create Story"
      }
    }
  },
  "errors": {
    "feed": {
      "loadFailed": {
        "title": "Error Loading Feed",
        "message": "Something went wrong. Please try again."
      }
    }
  }
}
```

---

## ✅ Requirements Checklist

- [x] ✅ Feed page route created (`/feed`)
- [x] ✅ Feed page is protected (requires authentication)
- [x] ✅ FeedPageClient component created (client component)
- [x] ✅ StoryCard component created (with branching-specific UI)
- [x] ✅ FeedContent component created (client component)
- [x] ✅ FeedControls component created (sort only, no filters in Phase 2)
- [x] ✅ useFeedQuery hook created (stories only, no posts in Phase 2)
- [x] ✅ Database queries for root stories (is_root = true)
- [x] ✅ Infinite scroll implemented (replaced Load More button with Intersection Observer)
- [x] ✅ Loading states (Spinner, Skeleton loaders with shimmer effects)
- [x] ✅ Empty states (EmptyState with custom messages for different feed types)
- [x] ✅ Error states (ErrorState with retry functionality)
- [x] ✅ Responsive design (mobile, tablet, desktop)
- [x] ✅ i18n support (all text translatable in 5 languages)
- [x] ✅ Click story card → navigate to `/story/[id]`
- [x] ✅ StoryCard shows branching metadata (paths count/endings, type tag)
- [x] ✅ StoryCard shows "Continue" label if user has progress
- [x] ✅ Click author → navigate to `/profile/[id]`
- [x] ✅ Like button (quick like from feed with optimistic updates)
- [x] ✅ View count display
- [x] ✅ Grid layout (3 columns desktop, 2 tablet, 1 mobile)
- [x] ✅ **Video Support**: Videos display correctly in StoryCard
- [x] ✅ **Video Autoplay**: Videos autoplay when in viewport (muted, looped)
- [x] ✅ **Video Controls**: Video controls visible and functional
- [x] ✅ **Media Type Detection**: `media_type` field properly stored and displayed
- [x] ✅ **Video Performance**: Lazy loading, pause on scroll away, max concurrent videos limit
- [x] ✅ **Real-time Updates**: Supabase real-time subscriptions for new/updated/deleted stories
- [x] ✅ **Advanced Filters**: Date range, author, hashtags filtering
- [x] ✅ **Search Integration**: Search stories and users with infinite scroll
- [x] ✅ **Following Feed**: Show only stories from followed users with empty state and suggestions
- [x] ✅ **Story Preview**: Hover tooltip to preview story without clicking
- [x] ✅ **Trending Algorithm**: Enhanced calculation with velocity, engagement, branches, completion rate, time decay

---

## 🧪 Feed Page Testing Checklist (MVP)

1. ✅ Authenticated user:
   - `/feed` → shows feed content
   - Stories and posts are displayed
   - Cards are clickable

2. ✅ Unauthenticated user:
   - `/feed` → redirects to `/signin`

3. ✅ Content loading:
   - Initial load shows loading spinner
   - Content appears after loading
   - Empty state shows when no content

4. ✅ Pagination:
   - "Load More" button appears when hasMore = true
   - Clicking "Load More" loads next page
   - "Load More" button disappears when hasMore = false

5. ✅ Sort:
   - "Recent" sorts by created_at DESC
   - "Popular" sorts by likes_count DESC
   - "Trending" sorts by views_count DESC

6. ✅ Navigation:
   - Click story card → navigates to `/story/[id]`
   - Click author → navigates to `/profile/[id]`

7. ✅ RLS შემოწმება:
   - Unauthenticated Supabase query-ს (მაგ. REST / SQL Editor-ში anon key-ით) არ უნდა დაუბრუნდეს private ისტორია.
   - მხოლოდ authenticated კონტექსტში ჩანს feed.

8. ✅ Branching Progress (თუ ამ ფუნქციას ჩაწერ დოკში):
   - დაიწყე ისტორია → გახსენი `/story/[id]` → აირჩიე რამდენიმე path.
   - დაბრუნდი `/feed`-ზე → StoryCard-ზე ჩანდეს "Continue" label.
   - დაადასტურე, რომ progress მწყობრად მუშაობს "story detail" გვერდთან.

9. ✅ Responsive:
   - Desktop: 3 columns
   - Tablet: 2 columns
   - Mobile: 1 column

10. ✅ Error handling:
   - Network error → shows ErrorState
   - Retry button works

11. ✅ Video Display:
   - Videos display correctly in StoryCard
   - Video autoplay works when in viewport
   - Video pauses when scrolling away
   - Video controls visible and functional
   - Video muted by default (user can unmute)
   - Video loops automatically
   - Fast scroll pauses videos

12. ✅ Media Type:
   - `media_type` field properly stored in database ('image' or 'video')
   - `media_type` properly displayed in StoryCard
   - Images and videos both display correctly

---

## 🔄 Future Enhancements

- **Regular Posts**: Mixed feed (stories + posts together) - Phase 3+
- **PostCard Component**: Post cards for regular posts - Phase 3+
- **Post Detail Page**: `/post/[id]` route - Phase 3+
- **Filters**: "All", "Stories", "Posts" filter buttons - Phase 3+
- [x] ✅ **Infinite Scroll**: Replace "Load More" with infinite scroll (implemented with Intersection Observer)
- [x] ✅ **Real-time Updates**: Supabase real-time subscriptions for new stories (implemented with `useFeedRealtime` hook)
- [x] ✅ **Advanced Filters**: Date range, author, hashtags (implemented with `AdvancedFilters` component)
- [x] ✅ **Search**: Search stories and posts (infinite scroll, tag search, relevance sorting)
- [x] ✅ **Following Feed**: Show only stories from followed users (real-time updates, empty state, follow suggestions)
- [x] ✅ **Trending Algorithm**: More sophisticated trending calculation (velocity factor, engagement rate, branches factor, completion rate, exponential time decay)
- [x] ✅ **Story Preview**: Hover to preview story without clicking (implemented with `StoryPreviewTooltip` component)
- [x] ✅ **Skeleton Loaders**: Better loading UX (improved with shimmer effects, staggered animations, and infinite scroll skeletons)
- [x] ✅ **Endings Count**: Display endings count in StoryCard (implemented with paths_count)

---

## 📝 Notes

- **Phase 2 Priority**: Feed Page is high priority for Phase 2
- **Scope**: Phase 2-ში Feed = Root Branching Stories Only (Posts → Phase 3+)
- **Pagination**: Basic pagination (Load More) is enough for MVP
- **Performance**: Consider caching feed data for better performance
- **RLS**: All feed content is public (readable by all authenticated users)
- **Thumbnails**: Story thumbnails should be 9:16 aspect ratio
- **Client Component**: FeedPageClient uses `'use client'` directive for hooks
- **Server Component**: Feed page.tsx is server component (auth check only)
- **Video Support**: Feed supports both images and videos
- **Video Autoplay**: Videos autoplay when in viewport (see `docs/features/feed-video-autoplay.md`)
- **Media Type**: `media_type` field is required in database for proper video/image display
- **Video Formats**: MP4, WebM, MOV, AVI, MKV supported
- **Video Size**: Max 50MB per video

---

## 🤖 Cursor Implementation Notes (Internal)

When implementing Feed Page in Cursor:

- Do NOT write code directly აქედან – გამოიყენე ეს დოკი როგორც source of truth.
- Steps:
  1. Ensure `/feed` route is protected (middleware + server redirect).
  2. Create `FeedPageClient` with `useFeed()` hook (client-side).
  3. Implement Story-only feed for Phase 2 (no posts in UI).
  4. Use existing UI primitives: `Header`, `Card`, `Button`, `Spinner`, `EmptyState`, `ErrorState`.
  5. Respect RLS – only `anon` client, no service role.
  6. Add tests according to "Feed Page Testing Checklist (MVP)".

---

**Last Updated**: 2025-01-15  
**Version**: 2.0  
**Status**: ✅ **COMPLETED** - All Phase 2 features and enhancements implemented

---

## 📹 Video Support in Feed

### Overview

Feed page supports both images and videos for stories. Videos are displayed with autoplay functionality when in viewport, providing a modern social media experience similar to TikTok or Instagram Reels.

### Video Display Features

1. **Autoplay When Visible**
   - Videos autoplay when 50% of video is visible in viewport
   - Uses Intersection Observer API for efficient viewport detection
   - Pauses when scrolling away from viewport
   - Pauses on fast scroll (prevents unwanted autoplay)

2. **Video Controls**
   - Controls visible (play, pause, volume, fullscreen)
   - User can manually control playback
   - Muted by default (user can unmute)
   - Loops automatically

3. **Performance Optimization**
   - Lazy loading (videos load only when in viewport)
   - Preload="metadata" (only metadata loaded initially)
   - Pause on exit (saves bandwidth)
   - Max 2-3 concurrent videos playing
   - Cleanup on component unmount

4. **Media Type Detection**
   - `media_type` field in database ('image' or 'video')
   - Properly stored when creating story
   - Used to determine display component (Image vs Video)

### Implementation

- **StoryCard Component**: Uses `MediaDisplay` component for both images and videos
- **MediaDisplay Component**: Handles video autoplay, controls, and error handling
- **useInViewport Hook**: Detects when video is in viewport
- **useScrollSpeed Hook**: Detects fast scrolling to pause videos

### Related Documentation

- See `docs/features/feed-video-autoplay.md` for detailed autoplay implementation
- See `docs/features/media-display-component.md` for MediaDisplay component details
- See `docs/features/media-upload-system.md` for video upload process

---

## 🔐 Security Considerations (Phase 2)

- CSRF/XSS: Harden headers (e.g., next-safe/middleware or secure headers) and sanitize any user-rendered text in cards.
- Auth Guard: `/feed` protected by middleware + server redirect; never fetch with service role on client.
- Rate Limiting: Apply per-user request throttling for feed fetch (API route or Supabase edge function layer) to avoid abuse.
- Privacy: If storing user progress/likes, document data retention and allow user deletion per privacy regulations.

## 🚀 Performance Optimizations

- Caching Strategy: ✅ Use React Query (`@tanstack/react-query`) for client caching and background refetch; ✅ implemented with `useInfiniteQuery` for pagination, 30s stale time, 5min cache time, automatic refetch on window focus.
- Image Optimization: Thumbnails via `next/image` with lazy loading and explicit sizes; prefer WebP/AVIF where possible.
- Pagination UX: Keep Load More for MVP; debounce subsequent fetches; prefetch next page when nearing viewport end.
- Database: Keep indexes on `(created_at DESC)` and `(author_id, created_at)`; periodically EXPLAIN ANALYZE critical queries.

## 🎨 UX / Accessibility Improvements

- Skeletons: Display 6–9 skeleton StoryCards during initial load for better perceived performance.
- A11y: ✅ Add ARIA labels to interactive controls (like, share); ✅ ensure keyboard navigation works across cards (Enter/Space keys, tabIndex, focus rings).
- Microcopy: Show comment count teaser (e.g., “12 comments”) when available to encourage engagement.
- Dark Mode: Ensure card/contrast tokens meet WCAG AA in both themes.

## ➕ MVP+ / Phase 3 Additions

- Search: Simple search by title/author; server-side filtering with safe LIKE/ILIKE and index support.
- Personalization: “Recommended for you” using likes/progress; keep behind a feature flag initially.
- Analytics: Hook basic events (card view, click, load more) to the analytics provider.
- Error Monitoring: Integrate Sentry/LogRocket for client error tracking on feed interactions.
- i18n Enhancements: Optional auto-detect language from browser with user override.

## 📚 Documentation Enhancements

- Visuals: Add screenshots/diagrams for layout and states (loading/empty/error).
- Dependencies: List key libs used (Next.js App Router, Supabase JS, React Query, TailwindCSS).
- Versioning: Maintain a small changelog for feed-related updates.
- API Docs: Document any API routes or edge functions used for feed with request/response shapes.

---

**Next Action Items (Track in Issues/TODOs)**
- ✅ Implement skeleton loaders in `FeedPageClient`.
- ✅ Add ARIA labels and keyboard navigation checks to `StoryCard`.
- ✅ Switch thumbnails to `next/image` with sizes attribute.
- ✅ Add debounce to "Load More" and optional prefetch of next page.
- ✅ Add keyboard navigation to Like and Share buttons.
- ✅ Add React Query caching layer for feed fetching.
- ✅ Implement infinite scroll (replaced "Load More" button with Intersection Observer).
- ✅ Implement real-time updates via Supabase subscriptions (`useFeedRealtime` hook).
- ✅ Implement story preview tooltip on hover (`StoryPreviewTooltip` component with 500ms delay).
- ✅ Implement advanced filters (date range, author, hashtags) with `AdvancedFilters` component.
- ✅ Improve skeleton loaders with shimmer effects, staggered animations, and infinite scroll skeletons.
- ✅ Enhance trending algorithm with velocity factor, engagement rate, branches factor, completion rate, and exponential time decay.
- ✅ Improve following feed with real-time updates, better empty state, and follow suggestions component.
- ✅ Enhance search with infinite scroll, tag search, and improved relevance sorting algorithm.
- ✅ Display endings count (paths_count) in StoryCard with i18n support.