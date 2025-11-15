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

2. **StoryCard** (`src/components/StoryCard.tsx`)
   - Story thumbnail (9:16 aspect ratio)
   - Story title
   - Author info (avatar, username)
   - Stats (likes, views)
   - **Branching-specific UI** (იხ. ქვემოთ)
   - Click → navigate to `/story/[id]`

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
}

export function FeedContent({ 
  stories, 
  loading, 
  error, 
  hasMore, 
  onLoadMore 
}: FeedContentProps) {
  const router = useRouter();
  const { t } = useTranslation();

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

export function useFeed() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortType>('recent');

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
// components/StoryCard.tsx
'use client';

import { Card } from '@/components/ui/Card';
import { useRouter } from 'next/navigation';
import { useUserStoryProgress } from '@/hooks/useUserStoryProgress';

interface StoryCardProps {
  story: Story;
}

export function StoryCard({ story }: StoryCardProps) {
  const router = useRouter();
  const { hasProgress, lastPath } = useUserStoryProgress(story.id);

  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => router.push(`/story/${story.id}`)}
    >
      <div className="aspect-[9/16] relative overflow-hidden rounded-t-lg">
        <img 
          src={story.thumbnail_url || story.media_url} 
          alt={story.title}
          className="w-full h-full object-cover"
        />
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
          {hasProgress && (
            <span className="text-primary">• Continue from: {lastPath}</span>
          )}
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
   - `media_url` (text, Supabase Storage)
   - `thumbnail_url` (text, optional)
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

- [ ] Feed page route created (`/feed`)
- [ ] Feed page is protected (requires authentication)
- [ ] FeedPageClient component created (client component)
- [ ] StoryCard component created (with branching-specific UI)
- [ ] FeedContent component created (client component)
- [ ] FeedControls component created (sort only, no filters in Phase 2)
- [ ] useFeed hook created (stories only, no posts in Phase 2)
- [ ] Database queries for root stories (is_root = true)
- [ ] Pagination implemented (Load More button)
- [ ] Loading states (Spinner)
- [ ] Empty states (EmptyState)
- [ ] Error states (ErrorState)
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] i18n support (all text translatable)
- [ ] Click story card → navigate to `/story/[id]`
- [ ] StoryCard shows branching metadata (paths count, type tag)
- [ ] StoryCard shows "Continue" label if user has progress
- [ ] Click author → navigate to `/profile/[id]`
- [ ] Like button (quick like from feed)
- [ ] View count display
- [ ] Grid layout (3 columns desktop, 2 tablet, 1 mobile)

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

---

## 🔄 Future Enhancements

- **Regular Posts**: Mixed feed (stories + posts together) - Phase 3+
- **PostCard Component**: Post cards for regular posts - Phase 3+
- **Post Detail Page**: `/post/[id]` route - Phase 3+
- **Filters**: "All", "Stories", "Posts" filter buttons - Phase 3+
- **Infinite Scroll**: Replace "Load More" with infinite scroll
- **Real-time Updates**: Supabase real-time subscriptions for new stories
- **Advanced Filters**: Date range, author, hashtags
- **Search**: Search stories and posts
- **Following Feed**: Show only stories from followed users
- **Trending Algorithm**: More sophisticated trending calculation
- **Story Preview**: Hover to preview story without clicking
- **Skeleton Loaders**: Better loading UX
- **Endings Count**: Display endings count in StoryCard (when implemented)

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

**Last Updated**: 2025-01-XX  
**Version**: 1.0  
**Status**: Phase 2 (Core Features) - High Priority

