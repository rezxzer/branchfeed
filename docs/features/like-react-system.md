# Like/React System - BranchFeed

ეს დოკუმენტაცია აღწერს Like/React System-ის იმპლემენტაციას BranchFeed-ში.

---

## 📋 Overview

Like/React System არის BranchFeed-ის ინტერაქციის სისტემა, რომელიც:
- საშუალებას აძლევს მომხმარებლებს დაალაიკონ stories
- აჩვენებს like count-ს
- უზრუნველყოფს optimistic updates-ს
- მხარდაჭერას უწევს toggle like/unlike-ს

**Location**: `src/lib/likes.ts`, `src/hooks/useLike.ts`, `src/components/LikeButton.tsx`

**Status**: 🟡 **High Priority** - Phase 2 (Interaction Features)

> ℹ️ **შენიშვნა**
>
> Like/React System არის BranchFeed-ის მნიშვნელოვანი ინტერაქციის სისტემა, რომელიც გამოიყენება Story Detail Page-ზე და Feed Page-ზე.
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

1. **Like/Unlike Functionality**
   - Toggle like on stories
   - Toggle unlike on stories
   - One like per user per story
   - Real-time like count updates

2. **Like Count Display**
   - Display like count on stories
   - Cached like count (from stories table)
   - Real-time updates after like/unlike

3. **Optimistic Updates**
   - Update UI immediately (before server response)
   - Rollback on error
   - Smooth user experience

4. **Like Status**
   - Show if user has liked story
   - Visual indicator (filled/unfilled heart icon)
   - Loading state during like/unlike

5. **Like Button Component**
   - Heart icon button
   - Like count display
   - Hover effects
   - Disabled state (when loading)

---

## 📊 Database Schema

### Tables Used

1. **likes** table
   - `id` (UUID, primary key)
   - `story_id` (UUID, foreign key → stories.id)
   - `user_id` (UUID, foreign key → profiles.id)
   - `created_at` (timestamp)
   - Unique constraint: `(story_id, user_id)`

2. **stories** table
   - `likes_count` (integer, cached) - Updated via trigger

### RLS Policies (Summary)

- **likes**:
  - INSERT: მხოლოდ authenticated მომხმარებლებს (`auth.uid() = user_id`).
  - DELETE: მხოლოდ like owner-ს (`auth.uid() = user_id`).
  - SELECT: ყველა authenticated მომხმარებელს შეუძლია likes ნახვა.

> **შენიშვნა: RLS Implementation**
>
> ყველა RLS პოლიტიკა უნდა იყოს ჩაწერილი `do $$ ... end $$;` ბლოკით Supabase მიგრაციებში.

### Indexes (Performance)

Recommended indexes:

- `likes(story_id, user_id)` – Like lookup (unique)
- `likes(story_id)` – Like count queries
- `stories(likes_count)` – Sorting by likes

### Triggers (Like Count)

```sql
-- Trigger to update likes_count in stories table
CREATE OR REPLACE FUNCTION update_story_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE stories
    SET likes_count = likes_count + 1
    WHERE id = NEW.story_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE stories
    SET likes_count = GREATEST(likes_count - 1, 0)
    WHERE id = OLD.story_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER likes_count_trigger
  AFTER INSERT OR DELETE ON likes
  FOR EACH ROW
  EXECUTE FUNCTION update_story_likes_count();
```

> **შენიშვნა: Trigger Implementation**
>
> ლაიქების trigger-ი და ფუნქცია უნდა შეიქმნას idempotent SQL მიგრაციით `do $$ ... end $$;` ბლოკში, ისე რომ თავიდან გაშვებისას უსაფრთხოდ განახლდეს (DROP/CREATE სტილით) და production გარემოშიც იყოს voorsatile.

---

## 🔧 Implementation Details

### Like Functions

```typescript
// lib/likes.ts
import { createClientClient } from '@/lib/auth';

export interface LikeStatus {
  isLiked: boolean;
  likesCount: number;
}

/**
 * Like a story
 */
export async function likeStory(storyId: string): Promise<void> {
  const supabase = createClientClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('likes')
    .insert({
      story_id: storyId,
      user_id: user.id,
    });

  if (error) {
    // If already liked, ignore error (idempotent)
    if (error.code !== '23505') { // Unique constraint violation
      throw new Error(`Like failed: ${error.message}`);
    }
  }
}

/**
 * Unlike a story
 */
export async function unlikeStory(storyId: string): Promise<void> {
  const supabase = createClientClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('likes')
    .delete()
    .eq('story_id', storyId)
    .eq('user_id', user.id);

  if (error) {
    throw new Error(`Unlike failed: ${error.message}`);
  }
}

/**
 * Get like status for a story
 */
export async function getLikeStatus(storyId: string): Promise<LikeStatus> {
  const supabase = createClientClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { isLiked: false, likesCount: 0 };
  }

  // Get like count
  const { count: likesCount } = await supabase
    .from('likes')
    .select('*', { count: 'exact', head: true })
    .eq('story_id', storyId);

  // Check if user has liked
  const { data: like } = await supabase
    .from('likes')
    .select('id')
    .eq('story_id', storyId)
    .eq('user_id', user.id)
    .single();

  return {
    isLiked: !!like,
    likesCount: likesCount || 0,
  };
}

/**
 * Get like status for multiple stories
 */
export async function getLikeStatuses(storyIds: string[]): Promise<Record<string, LikeStatus>> {
  const supabase = createClientClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user || storyIds.length === 0) {
    return {};
  }

  // Get all likes for these stories
  const { data: likes } = await supabase
    .from('likes')
    .select('story_id')
    .eq('user_id', user.id)
    .in('story_id', storyIds);

  const likedStoryIds = new Set(likes?.map(l => l.story_id) || []);

  // Get like counts from stories table (cached)
  const { data: stories } = await supabase
    .from('stories')
    .select('id, likes_count')
    .in('id', storyIds);

  const result: Record<string, LikeStatus> = {};
  
  stories?.forEach(story => {
    result[story.id] = {
      isLiked: likedStoryIds.has(story.id),
      likesCount: story.likes_count || 0,
    };
  });

  return result;
}
```

> **შენიშვნა: Like Count Optimization**
>
> Single story-სთვის like count-ის გამოტანისას რეკომენდებულია `stories.likes_count` ქეშირებული ველის გამოყენება (სანაცვლოდ იმისა, რომ ყოველ ჯერზე `COUNT(*)` გაკეთდეს `likes` ცხრილზე), განსაკუთრებით Feed Page-ზე მუშაობისას.

### useLike Hook

```typescript
// hooks/useLike.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { likeStory, unlikeStory, getLikeStatus, LikeStatus } from '@/lib/likes';

interface UseLikeResult {
  isLiked: boolean;
  likesCount: number;
  toggleLike: () => Promise<void>;
  loading: boolean;
  error: Error | null;
}

export function useLike(storyId: string, initialStatus?: LikeStatus): UseLikeResult {
  const [isLiked, setIsLiked] = useState(initialStatus?.isLiked || false);
  const [likesCount, setLikesCount] = useState(initialStatus?.likesCount || 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Load initial status if not provided
  useEffect(() => {
    if (!initialStatus) {
      getLikeStatus(storyId).then(status => {
        setIsLiked(status.isLiked);
        setLikesCount(status.likesCount);
      });
    }
  }, [storyId, initialStatus]);

  const toggleLike = useCallback(async () => {
    if (loading) return;

    // Optimistic update
    const previousIsLiked = isLiked;
    const previousCount = likesCount;

    setIsLiked(!previousIsLiked);
    setLikesCount(previousIsLiked ? previousCount - 1 : previousCount + 1);
    setLoading(true);
    setError(null);

    try {
      if (previousIsLiked) {
        await unlikeStory(storyId);
      } else {
        await likeStory(storyId);
      }
    } catch (err) {
      // Rollback on error
      setIsLiked(previousIsLiked);
      setLikesCount(previousCount);
      setError(err instanceof Error ? err : new Error('Like failed'));
    } finally {
      setLoading(false);
    }
  }, [storyId, isLiked, likesCount, loading]);

  return {
    isLiked,
    likesCount,
    toggleLike,
    loading,
    error,
  };
}
```

### LikeButton Component

```typescript
// components/LikeButton.tsx
'use client';

import { useLike } from '@/hooks/useLike';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { useTranslation } from '@/hooks/useTranslation';

interface LikeButtonProps {
  storyId: string;
  initialLiked?: boolean;
  initialCount?: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  className?: string;
}

export function LikeButton({
  storyId,
  initialLiked = false,
  initialCount = 0,
  size = 'md',
  showCount = true,
  className = '',
}: LikeButtonProps) {
  const { t } = useTranslation();
  const { isLiked, likesCount, toggleLike, loading } = useLike(storyId, {
    isLiked: initialLiked,
    likesCount: initialCount,
  });

  return (
    <Button
      variant={isLiked ? 'primary' : 'outline'}
      size={size}
      onClick={toggleLike}
      disabled={loading}
      className={className}
      aria-label={isLiked ? t('likes.unlike') : t('likes.like')}
    >
      {loading ? (
        <Spinner size="sm" />
      ) : (
        <span className={isLiked ? 'text-red-500' : ''}>
          {isLiked ? '❤️' : '🤍'}
        </span>
      )}
      {showCount && (
        <span className="ml-2">
          {likesCount > 0 ? likesCount : ''}
        </span>
      )}
    </Button>
  );
}
```

### Usage Example

```typescript
// In Story Detail Page or Feed Page
<LikeButton
  storyId={story.id}
  initialLiked={story.isLiked}
  initialCount={story.likes_count}
  showCount={true}
/>
```

---

## 🌐 Internationalization (i18n)

### Translation Keys

```json
{
  "likes": {
    "like": "Like",
    "unlike": "Unlike",
    "liked": "Liked",
    "loading": "Loading...",
    "errors": {
      "likeFailed": "Failed to like story",
      "unlikeFailed": "Failed to unlike story",
      "notAuthenticated": "You must be logged in to like stories"
    }
  }
}
```

**Note**: `likes.errors.notAuthenticated` გამოიყენება მაშინ, როცა აუთენტიფიცირებელი მომხმარებელი ცდილობს story-ის დალაიკებას და სისტემამ უნდა მიუთითოს, რომ ამისთვის საჭიროა შესვლა.

---

## 🧪 Testing & Verification Instructions

> **⚠️ IMPORTANT**: ეს სექცია აღწერს კონკრეტულ ნაბიჯებს, რომელთა შემდეგაც უნდა შეამოწმო feature-ის მუშაობა. გთხოვ, გაგზავნო სქრინშოტი ან ტექსტური აღწერა, რომ დავადასტურო რომ მუშაობს ან არ მუშაობს.

### Manual Testing Steps

#### 1. Story Detail Page Like Button

**⚠️ IMPORTANT**: Feed-ზე ახლა EmptyState-ია (database-ში stories არ არის). Story Detail Page-ზე შესვლისთვის:

**ნაბიჯი 1**: 
1. იხილე browser-ის address bar (URL bar) ზედა ნაწილში (`localhost:3000/feed`)
2. დააჭირე address bar-ს (F6 ან Ctrl+L ქართულ კლავიატურაზე)
3. შეაცვალე URL: `localhost:3000/feed` → `localhost:3000/story/test-story-id`
4. დააჭირე Enter-ს

ან პირდაპირ address bar-ში შეიყვანე:
```
localhost:3000/story/test-story-id
```
და დააჭირე Enter-ს.

> **Note**: `useStory` hook-ში არის mock data fallback - თუ database არ არის setup-ში, ავტომატურად დააბრუნებს mock story-ს ტესტირებისთვის.

**ნაბიჯი 2**: Story Detail Page უნდა გაიხსნას (loading-ის შემდეგ)

**რას უნდა ნახო**:
- Story title: "Mock Story" (mock data-დან)
- Story description: "This is a mock story"
- InteractionButtons section ქვემოთ (Like, Comment, Share ღილაკებით)
- Like button (❤️ ან 🤍 icon)

**ნაბიჯი 3**: იპოვე Like button (❤️ ან 🤍 icon) InteractionButtons section-ში

**რას უნდა ნახო**:
- Like button უნდა გამოჩნდეს ❤️ ან 🤍 icon-ით
- Like count უნდა გამოჩნდეს ღილაკის გვერდით (მაგალითად: "🤍 5" ან "❤️ 6")
- თუ database არ არის setup-ში, უბრალოდ count უნდა იყოს 0 ან initial count

**ნაბიჯი 4**: დააჭირე Like button-ს

**რას უნდა ნახო**:
- ❤️ icon-ში უნდა შეიცვალოს (🤍 → ❤️) **მაშინვე** (optimistic update)
- Like count უნდა გაიზარდოს +1 (მაგალითად: "🤍 0" → "❤️ 1" mock data-ზე)
- თუ database არ არის setup-ში, count უნდა იზარდოს UI-ში, მაგრამ console-ში უნდა იყოს warning: "Likes table not found"

**ნაბიჯი 5**: კიდევ ერთხელ დააჭირე Like button-ს (unlike)

**რას უნდა ნახო**:
- ❤️ icon-ში უნდა შეიცვალოს (❤️ → 🤍) **მაშინვე**
- Like count უნდა შემცირდეს -1 (მაგალითად: "❤️ 1" → "🤍 0")

**ნაბიჯი 6**: დააჭირე Like button-ს რამდენჯერმე სწრაფად

**რას უნდა ნახო**:
- Button უნდა იყოს disabled (opacity-50, cursor-not-allowed) loading-ის დროს
- Like count არ უნდა "გადახტეს" (მხოლოდ +1/-1 უნდა იცვლებოდეს თითოეულ click-ზე)

**ნაბიჯი 7**: შეამოწმე browser console (F12 → Console)

**რას უნდა ნახო**:
- თუ database არ არის setup-ში: warning: "Likes table not found. Database setup may be needed."
- Error messages თუ რაიმე პრობლემა იქნება

#### 2. Like Button Visual States

**ნაბიჯი 1**: იპოვე Like button Story Detail Page-ზე

**რას უნდა ნახო**:
- **Default state (unliked)**: 🤍 icon + gray text (`text-gray-300`)
- **Liked state**: ❤️ icon + red text (`text-red-500`)
- **Hover state**: hover-ზე text უნდა იყოს `text-red-400` (უფრო ღია red)
- **Liked icon**: უნდა იყოს `scale-110` (ცოტა დიდი) და `drop-shadow-sm` (shadow effect)

#### 3. Feed Page Like Button (Optional)

**ნაბიჯი 1**: გახსენი Feed Page (`/feed`)

**ნაბიჯი 2**: იპოვე StoryCard component

**რას უნდა ნახო**:
- StoryCard-ზე like count უნდა გამოჩნდეს stats section-ში (მაგალითად: "5 likes")
- LikeButton არ არის დამატებული StoryCard-ზე (ახლა მხოლოდ count display-ია)

> **Note**: LikeButton StoryCard-ზე დამატება optional feature-ია და შეიძლება Phase 3-ში დაემატოს.

### Expected Behavior

#### ✅ When Database is Setup:
- Like button should work correctly
- Like/unlike should persist in database
- Like count should update from database
- Optimistic updates should work smoothly

#### ✅ When Database is NOT Setup:
- Like button should still work in UI (optimistic updates)
- Like count should update temporarily
- Console should show warning: "Likes table not found"
- No errors should break the page

### What to Report

როცა შეამოწმებ, გთხოვ გამომიგზავნო:

1. **სქრინშოტი Story Detail Page-ზე** (`/story/test-story-id`) Like button-ით
   - URL უნდა იყოს: `localhost:3000/story/test-story-id` (ან მსგავსი)
   - უნდა ჩანდეს Story title, description, და InteractionButtons section ქვემოთ
2. **ტექსტური აღწერა**:
   - გაიხსნა თუ არა Story Detail Page URL-ით?
   - ჩანს თუ არა Like button InteractionButtons section-ში?
   - მუშაობს თუ არა Like button (click-ზე იცვლება ❤️/🤍)?
   - მუშაობს თუ არა Like count (იზრდება/მცირდება)?
   - არის თუ არა console errors/warnings?
3. **Browser Console output** (თუ არის errors)

> **Note**: თუ Story Detail Page არ გაიხსნა ან error-ია, გამომიგზავნე error message და მე გავასწორებ.

დავადასტურებ მუშაობს თუ არა და, თუ საჭიროა, გავასწორებ.

---

## ✅ Requirements Checklist

- [ ] Like functions created (`likeStory`, `unlikeStory`, `getLikeStatus`)
- [ ] useLike hook created
- [ ] LikeButton component created
- [ ] Database table (likes) created
- [ ] RLS policies implemented
- [ ] Indexes created
- [ ] Like count trigger implemented როგორც idempotent SQL მიგრაცია (`do $$ ... end $$;` ბლოკით)
- [ ] Optimistic updates
- [ ] Error handling
- [ ] i18n support (all text translatable)

---

## 🧪 Like/React System Testing Checklist (MVP)

1. ✅ Like Functionality:
   - Like story works
   - Unlike story works
   - One like per user per story
   - Cannot like twice

2. ✅ Like Count:
   - Like count increments on like
   - Like count decrements on unlike
   - Like count displays correctly
   - Like count cached in stories table

3. ✅ Optimistic Updates:
   - UI updates immediately on like
   - UI updates immediately on unlike
   - Rollback on error works
   - Loading state shows during request

4. ✅ Like Status:
   - Shows if user has liked story
   - Visual indicator (filled/unfilled heart)
   - Status persists across page reloads

5. ✅ Database:
   - RLS policies work correctly
   - Unique constraint prevents duplicate likes
   - Trigger updates likes_count correctly
   - Indexes improve query performance

6. ✅ Error Handling:
   - Network errors handled
   - Authentication errors handled
   - User-friendly error messages

---

## 🔄 Future Enhancements

- **Like Animations**: Heart animation on like
- **Like Notifications**: Notify story author on like
- **Like History**: View liked stories
- **Like Analytics**: Track like trends
- **Reactions**: Different reaction types (like, love, etc.)
- **Like Comments**: Like specific comments
- **Like Sharing**: Share liked stories

---

## 📝 Notes

- **Phase 2 Priority**: Like/React System is high priority for Phase 2
- **Optimistic Updates**: UI updates immediately for better UX
- **Like Count**: Cached in stories table for performance
- **Unique Constraint**: Prevents duplicate likes
- **RLS**: Only authenticated users can like/unlike
- **RLS Implementation**: RLS წესები `likes` ცხრილზე აუცილებლად უნდა იყოს SQL მიგრაციებში გაწერილი, რომ ყველა გარემოში (dev/stage/prod) ერთნაირად იმოქმედოს.

---

## 🤖 Cursor Implementation Notes (Internal)

When implementing Like/React System in Cursor:

- Do NOT write code directly აქედან – გამოიყენე ეს დოკი როგორც source of truth.
- Steps:
  1. Create `likes` table in Supabase.
  2. Create like functions (`likeStory`, `unlikeStory`, `getLikeStatus`).
  3. Create `useLike` hook.
  4. Create `LikeButton` component.
  5. Implement RLS policies.
  6. Create database indexes.
  7. Implement like count trigger.
  8. Add optimistic updates.
  9. Add error handling.
  10. Add tests according to "Like/React System Testing Checklist (MVP)".

---

**Last Updated**: 2025-01-XX  
**Version**: 1.0  
**Status**: Phase 2 (Interaction Features) - 🟡 High Priority

