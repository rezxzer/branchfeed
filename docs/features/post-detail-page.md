# Post Detail Page - BranchFeed

ეს დოკუმენტაცია აღწერს Post Detail Page-ის იმპლემენტაციას BranchFeed-ში.

---

## 📋 Overview

Post Detail Page არის BranchFeed-ის გვერდი, სადაც:
- მომხმარებლები ხედავენ **regular posts**-ს (non-branching content)
- მომხმარებლებს შეუძლიათ **ურთიერთქმედება** (like, comment, share)
- მომხმარებლები ხედავენ **post author**-ის ინფორმაციას
- Regular posts არის Phase 3+ ფუნქცია (Phase 2-ში მხოლოდ branching stories)

**Route**: `/post/[id]` (dynamic route, protected)

**Status**: 🟢 **Medium Priority** - Phase 3+ (Regular Posts Feature)

> ℹ️ **შენიშვნა**
>
> Post Detail Page არის **დაცული გვერდი** - მხოლოდ ავტორიზებულ მომხმარებლებს შეუძლიათ წვდომა.
>
> ეს გვერდი გამოიყენება Phase 3+ ეტაპზე, როდესაც regular posts (non-branching content) დაემატება.
>
> Phase 2-ში მხოლოდ branching stories არის ძირითადი კონტენტი.

> ℹ️ **Cursor-ზე**
>
> ამ ფაილში მოყვანილი კოდი არის **სტრუქტურის მაგალითი**.
>
> რეალური იმპლემენტაცია უნდა შეიქმნას Cursor-ის მიერ, `.cursorrules` და
> `docs/PROJECT_PRIORITIES.md` ფაილებში აღწერილი წესების დაცვით.

---

## 🎯 Features

### Core Features (Phase 3+)

1. **Post Display**
   - Post title
   - Post description/content
   - Post media (image/video)
   - Post author info (avatar, username)
   - Post timestamp

2. **Interactions**
   - Like button (toggle like)
   - Comment button (navigate to comments)
   - Share button (copy link)
   - View count

3. **Comments Section**
   - View comments
   - Add comment
   - Delete own comments
   - Comment count

4. **Post Information**
   - Post stats (likes, views, comments)
   - Post author profile link
   - Post creation date

---

## 📐 Page Layout

### Structure

```
┌─────────────────────────────────────┐
│  Header (Navigation)               │
├─────────────────────────────────────┤
│  Post Detail                        │
│  ┌─────────────────────────────┐   │
│  │ Author Info                  │   │
│  │ [Avatar] Username • Date     │   │
│  ├─────────────────────────────┤   │
│  │ Post Title                   │   │
│  │ Post Description             │   │
│  │ [Media Display]              │   │
│  ├─────────────────────────────┤   │
│  │ [Like] [Comment] [Share]     │   │
│  │ Stats: 12 likes, 5 comments  │   │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │ Comments Section             │   │
│  │ [Comment Form]               │   │
│  │ [Comments List]              │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

---

## 🎨 UI Components

### Used Components

1. **Header** (`src/components/Header.tsx`)
   - Navigation bar

2. **PostCard** (`src/components/PostCard.tsx`)
   - Post display (optional - can be custom)

3. **LikeButton** (`src/components/LikeButton.tsx`)
   - Like functionality

4. **CommentSection** (`src/components/CommentSection.tsx`)
   - Comments display and form

5. **ShareButton** (`src/components/ShareButton.tsx`)
   - Share functionality

---

## 🔐 Access Control

- `/post/[id]` არის **დაცული როუტი**:
  - `middleware.ts` → აუთენტიფიცირებულს აგდებს `/signin`-ზე.
  - `app/post/[id]/page.tsx` → server-side `getCurrentUser()` შემოწმება.
- თუ `getCurrentUser()` აბრუნებს `null` → `redirect('/signin')`.

---

## 🔧 Implementation Details

### Page Component Structure (Server Component)

```typescript
// app/post/[id]/page.tsx
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getPostById } from '@/lib/posts';
import { PostDetailPageClient } from '@/components/post/PostDetailPageClient';

interface PostDetailPageProps {
  params: {
    id: string;
  };
}

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/signin');
  }

  const post = await getPostById(params.id);
  
  if (!post) {
    redirect('/feed');
  }

  return <PostDetailPageClient post={post} />;
}
```

### PostDetailPageClient Component

```typescript
// components/post/PostDetailPageClient.tsx
'use client';

import { LikeButton } from '@/components/LikeButton';
import { CommentSection } from '@/components/CommentSection';
import { ShareButton } from '@/components/ShareButton';
import { useTranslation } from '@/hooks/useTranslation';

interface PostDetailPageClientProps {
  post: {
    id: string;
    title: string;
    description: string | null;
    media_url: string | null;
    media_type: 'image' | 'video' | null;
    author: {
      id: string;
      username: string;
      avatar_url: string | null;
    };
    likes_count: number;
    views_count: number;
    comments_count: number;
    created_at: string;
  };
}

export function PostDetailPageClient({ post }: PostDetailPageClientProps) {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Author Info */}
      <div className="flex items-center gap-3 mb-6">
        <img
          src={post.author.avatar_url || '/default-avatar.png'}
          alt={post.author.username}
          className="w-10 h-10 rounded-full"
        />
        <div>
          <p className="font-semibold">{post.author.username}</p>
          <p className="text-sm text-muted-foreground">
            {new Date(post.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Post Content */}
      <div className="space-y-4 mb-6">
        <h1 className="text-3xl font-bold">{post.title}</h1>
        {post.description && (
          <p className="text-lg">{post.description}</p>
        )}
        {post.media_url && (
          <div className="rounded-lg overflow-hidden">
            {post.media_type === 'image' ? (
              <img
                src={post.media_url}
                alt={post.title}
                className="w-full h-auto"
              />
            ) : (
              <video
                src={post.media_url}
                controls
                className="w-full"
              />
            )}
          </div>
        )}
      </div>

      {/* Interactions */}
      <div className="flex items-center gap-4 mb-8">
        <LikeButton
          postId={post.id}
          initialLiked={false}
          initialCount={post.likes_count}
        />
        <ShareButton postId={post.id} />
        <div className="text-sm text-muted-foreground">
          {post.views_count} {t('post.views')} • {post.comments_count} {t('post.comments')}
        </div>
      </div>
```

> **შენიშვნა: Component Props Consistency**
>
> ამ დოკუმენტში მოყვანილი `LikeButton` და `ShareButton` მაგალითები არის კონცეპტუალური. რეალურ იმპლემენტაციაში საჭიროა: ან ცალკე `PostLikeButton` / `PostShareButton` კომპონენტები (`post_likes` და `/post/[id]` route-ისთვის), ან არსებული Branch Story კომპონენტების გაფართოება `entityType: 'story' | 'post'` პარამეტრით. კომპონენტების დოკუმენტაციაში prop-ების სახელები (`storyId` vs `postId`) აუცილებლად უნდა იყოს ერთგვაროვანი.

      {/* Comments Section */}
      <CommentSection postId={post.id} />
    </div>
  );
}
```

---

## 📊 Database Schema

### Tables Used

1. **posts** table
   - `id` (UUID, primary key)
   - `author_id` (UUID, foreign key → profiles.id)
   - `title` (text, required)
   - `description` (text, nullable)
   - `media_url` (text, nullable)
   - `media_type` (text: 'image' | 'video', nullable)
   - `likes_count` (integer, cached)
   - `views_count` (integer, cached)
   - `comments_count` (integer, cached)
   - `created_at` (timestamp)

2. **post_likes** table
   - `post_id` (UUID, foreign key → posts.id)
   - `user_id` (UUID, foreign key → profiles.id)

3. **comments** table
   - `post_id` (UUID, foreign key → posts.id)
   - `user_id` (UUID, foreign key → profiles.id)
   - `content` (text)

### RLS Policies (Summary)

- **posts**:
  - SELECT: ყველა authenticated მომხმარებელს შეუძლია published posts ნახვა (არაქვეყნებულ/დრაფტ პოსტებზე წვდომა მხოლოდ ავტორს ან Admin-ს უნდა ჰქონდეს ცალკე პოლიტიკით).
  - UPDATE/DELETE: მხოლოდ post author-ს (`auth.uid() = author_id`).

> **შენიშვნა: RLS Implementation**
>
> ყველა RLS პოლიტიკა უნდა იყოს ჩაწერილი `do $$ ... end $$;` ბლოკით Supabase მიგრაციებში.

---

## 🌐 Internationalization (i18n)

### Translation Keys

```json
{
  "post": {
    "views": "views",
    "comments": "comments",
    "notFound": "Post not found",
    "errors": {
      "loadFailed": "Failed to load post"
    }
  }
}
```

---

## ✅ Requirements Checklist

- [ ] Post detail page created (`/post/[id]`)
- [ ] Post display
- [ ] Author info display
- [ ] Like functionality
- [ ] Comment functionality
- [ ] Share functionality
- [ ] View count display
- [ ] Database queries (posts table)
- [ ] RLS policies implemented
- [ ] Error handling
- [ ] i18n support (all text translatable)

---

## 🧪 Post Detail Page Testing Checklist (MVP)

1. ✅ Post Display:
   - Post loads correctly
   - Post title displays
   - Post description displays
   - Post media displays (if exists)
   - Author info displays

2. ✅ Interactions:
   - Like button works
   - Comment section works
   - Share button works
   - View count displays

3. ✅ Access Control:
   - Unauthenticated users redirected
   - Authenticated users can view
   - RLS policies work correctly

4. ✅ Error Handling:
   - Post not found handled
   - Network errors handled
   - User-friendly error messages

---

## 🔄 Future Enhancements

- **Post Editing**: Edit own posts
- **Post Deletion**: Delete own posts
- **Post Reactions**: Different reaction types
- **Post Collections**: Save posts to collections
- **Post Analytics**: View post analytics

---

## 📝 Notes

- **Phase 3+ Priority**: Post Detail Page is Phase 3+ feature
- **Regular Posts**: Regular posts (non-branching) are Phase 3+ feature
- **Phase 2 Focus**: Phase 2 focuses on branching stories only
- **Similar to Story Detail**: Similar structure to Story Detail Page, but without branching
- **Feature Flag**: `/post/[id]` და regular posts UI უნდა იყოს ჩართული მხოლოდ Feature Flag-ით (მაგ. `regular_posts_enabled`), რათა Phase 2-ში Branching Stories დარჩეს ერთადერთ აქტიურ კონტენტ ტიპად

---

## 🤖 Cursor Implementation Notes (Internal)

When implementing Post Detail Page in Cursor:

- Do NOT write code directly აქედან – გამოიყენე ეს დოკი როგორც source of truth.
- **Note**: This is Phase 3+ feature. Phase 2 focuses on branching stories only.
- Steps:
  1. Create `/post/[id]` route with server component.
  2. Create `PostDetailPageClient` component.
  3. Implement post display.
  4. Add like/comment/share functionality.
  5. Add error handling.
  6. Add tests according to "Post Detail Page Testing Checklist (MVP)".

---

**Last Updated**: 2025-01-XX  
**Version**: 1.0  
**Status**: Phase 3+ (Regular Posts Feature) - 🟢 Medium Priority

