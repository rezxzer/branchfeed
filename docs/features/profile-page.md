# Profile Page - BranchFeed

> Improvements (2025-01):
>
> - Route Access: `/profile/[id]` (protected – unauthenticated users redirect to `/signin`).
> - MVP Focus: Edit Profile optional (MVP+). Phase 2-ში ფოკუსი — view-only პროფილი და სტორიების ჩვენება.
> - Layout Table: დაამატებულია Markdown ცხრილი responsive ქცევისთვის.
> - UI: Avatar upload async (useMediaUpload), stats numbers Intl.NumberFormat, tabs configurable array.
> - Data: `getProfileStories` დაამატე pagination (limit/offset), RESTful endpoints (`GET /api/profiles/[id]`).
> - RLS: MVP-ში SELECT ყველა authenticated-ზე; future-ში `is_private` და followers-only მოდი.
> - i18n: plurals (e.g., `stats.stories`: "{count} Stories").
> - Requirements: დაამატე Accessibility (ARIA labels). Future: Privacy Controls, Infinite Scroll.

---

## 📋 Overview

Profile page არის მომხმარებლის პირადი გვერდი, სადაც ნაჩვენებია:
- მომხმარებლის ინფორმაცია (username, bio, avatar)
- მომხმარებლის შექმნილი stories და posts
- Profile statistics (stories count, likes, views)
- Profile editing functionality

**Route**: `/profile/[id]` (protected; unauthenticated → `/signin`)

---

## Tabs Policy (Structure)
- Tabs are optional in MVP. Default view: Stories only.
- Posts tab is Phase 3+; hide when feature flag is disabled.

---

## 🎯 Features

### Core Features (MVP)

1. **View Profile**
   - Display user information (username, bio, avatar)
   - View user's created stories
   - View user's regular posts
   - Profile statistics

2. **Edit Profile** (Own Profile Only)
   - Edit username
   - Edit bio
   - Upload/change avatar
   - Save changes

3. **Profile Statistics**
   - Stories count
   - Posts count
   - Total likes received
   - Total views

4. **Content Display**
   - User's branching stories grid/list
   - User's regular posts grid/list
   - Filter by content type

---

## 📐 Page Layout

### Structure

```
┌─────────────────────────────────────┐
│  Profile Header                     │
│  [Avatar] Username                  │
│  Bio text                           │
│  [Edit Profile] [Settings]          │
├─────────────────────────────────────┤
│  Profile Stats                      │
│  [Stories: 12] [Posts: 5]           │
│  [Likes: 234] [Views: 1.2K]         │
├─────────────────────────────────────┤
│  Tabs                               │
│  [Stories] [Posts] [About]          │
├─────────────────────────────────────┤
│  Content Grid/List                   │
│  [Story Card] [Story Card] ...      │
│  [Post Card] [Post Card] ...        │
└─────────────────────────────────────┘
```

### Layout Components

1. **ProfileHeader** - Avatar, username, bio, action buttons
2. **ProfileStats** - Statistics cards (stories, posts, likes, views)
3. **ProfileTabs** - Tab navigation (Stories, Posts, About)
4. **ProfileContent** - Content grid/list based on active tab

---

## 📱 Responsive Layout

Profile page must be fully responsive across different screen sizes. Layout behavior should align with grid/spacing rules described in `UI_STYLE_GUIDE.md`.

### Mobile (≤ 640px)

- **ProfileHeader**: 
  - Avatar, username, and buttons stacked vertically
  - Avatar: `w-16 h-16` (smaller on mobile)
  - Username and bio: Full width, stacked
  - Action buttons: Full width, stacked vertically

- **ProfileStats**: 
  - 2x2 grid layout (`grid-cols-2`)
  - Two columns, two rows
  - Smaller padding: `px-4 py-3`

- **ProfileTabs**: 
  - Horizontal scroll if needed
  - Smaller padding: `px-4 py-3`
  - Tab buttons: `px-4 py-3` (smaller)

- **ProfileContent**: 
  - 1 column grid (`grid-cols-1`)
  - Full width cards
  - Padding: `p-4`

**Example Classes**:
```tsx
// Mobile-first approach
<div className="px-4 py-3"> {/* Smaller padding on mobile */}
  <div className="grid grid-cols-2 gap-3"> {/* 2x2 grid for stats */}
    {/* Stats */}
  </div>
</div>
```

### Tablet (≥ 768px)

- **ProfileHeader**: 
  - Avatar and info side-by-side
  - Avatar: `w-20 h-20` (medium size)
  - Horizontal layout with flex

- **ProfileStats**: 
  - 4 column grid (`md:grid-cols-4`)
  - All stats in one row
  - Padding: `px-6 py-4`

- **ProfileTabs**: 
  - Normal padding: `px-6 py-4`
  - Tab buttons: `px-6 py-4`

- **ProfileContent**: 
  - 2 column grid (`md:grid-cols-2`)
  - Cards side-by-side
  - Padding: `p-6`

**Example Classes**:
```tsx
// Tablet breakpoint
<div className="md:px-6 md:py-4">
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {/* Stats - 2 cols on mobile, 4 cols on tablet+ */}
  </div>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
    {/* Content - 1 col on mobile, 2 cols on tablet+ */}
  </div>
</div>
```

### Desktop (≥ 1024px)

- **ProfileHeader**: 
  - Avatar: `w-24 h-24` (large size)
  - More horizontal space
  - Better spacing between elements

- **ProfileStats**: 
  - 4 column grid (same as tablet)
  - More spacing: `gap-6`

- **ProfileTabs**: 
  - Normal padding: `px-6 py-4`
  - More spacing between tabs

- **ProfileContent**: 
  - 3 column grid (`lg:grid-cols-3`)
  - Cards in three columns
  - More horizontal space for story/post cards
  - Padding: `p-6`

**Example Classes**:
```tsx
// Desktop breakpoint
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
  {/* Content - 1 col mobile, 2 cols tablet, 3 cols desktop */}
</div>
```

### Responsive Breakpoints Summary

| Screen Size | Breakpoint | Stats Grid | Content Grid | Header Layout |
|-------------|-----------|------------|--------------|---------------|
| Mobile | ≤ 640px | 2x2 (`grid-cols-2`) | 1 column (`grid-cols-1`) | Stacked |
| Tablet | ≥ 768px | 4 columns (`md:grid-cols-4`) | 2 columns (`md:grid-cols-2`) | Side-by-side |
| Desktop | ≥ 1024px | 4 columns | 3 columns (`lg:grid-cols-3`) | Side-by-side |

### Alignment with UI_STYLE_GUIDE.md

- **Grid System**: Uses Tailwind responsive grid (`grid-cols-1`, `md:grid-cols-2`, `lg:grid-cols-3`)
- **Spacing**: Follows spacing scale from `UI_STYLE_GUIDE.md` (p-4, p-6, gap-4, gap-6)
- **Breakpoints**: Uses standard Tailwind breakpoints (sm: 640px, md: 768px, lg: 1024px)
- **Mobile-First**: All styles start with mobile, then add tablet/desktop variants

---

## 🎨 UI Components

### ProfileHeader Component (async uploads)

```typescript
// src/components/ProfileHeader.tsx
'use client';

import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';

interface ProfileHeaderProps {
  userId: string;
  username: string;
  bio: string | null;
  avatarUrl: string | null;
  isOwnProfile: boolean;
}

export function ProfileHeader({ userId, username, bio, avatarUrl, isOwnProfile }: ProfileHeaderProps) {
  const { t } = useTranslation();
  
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-8">
      <div className="flex items-start gap-6">
        {/* Avatar */}
        <div className="relative">
          <img
            src={avatarUrl || '/default-avatar.png'}
            alt={username}
            className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
          />
          {isOwnProfile && (
            <button className="absolute bottom-0 right-0 bg-primary-500 text-white rounded-full p-2 hover:bg-primary-600">
              <CameraIcon className="w-4 h-4" />
            </button>
          )}
        </div>
        
        {/* User Info */}
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{username}</h1>
          {bio && <p className="text-gray-600 mb-4">{bio}</p>}
          
          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {isOwnProfile ? (
              <>
                <button className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600">
                  {t('profile.editProfile')}
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  {t('profile.settings')}
                </button>
              </>
            ) : (
              <>
                <button className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600">
                  {t('profile.follow')}
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  {t('profile.message')}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
```

**UI Style** (see `UI_STYLE_GUIDE.md`):
- Avatar: `w-24 h-24 rounded-full` with shadow
- Username: `text-3xl font-bold`
- Bio: `text-gray-600`
- Buttons: Primary button for main action, Outline for secondary

In avatar upload, prefer an async handler via `useMediaUpload` to show progress and toasts.

### ProfileStats Component (i18n-friendly numbers)

```typescript
// src/components/ProfileStats.tsx
'use client';

interface ProfileStatsProps {
  storiesCount: number;
  postsCount: number;
  likesCount: number;
  viewsCount: number;
}

export function ProfileStats({ storiesCount, postsCount, likesCount, viewsCount }: ProfileStatsProps) {
  const numberFmt = new Intl.NumberFormat(undefined, { notation: 'compact' });
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="grid grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{numberFmt.format(storiesCount)}</div>
          <div className="text-sm text-gray-500">Stories</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{numberFmt.format(postsCount)}</div>
          <div className="text-sm text-gray-500">Posts</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{numberFmt.format(likesCount)}</div>
          <div className="text-sm text-gray-500">Likes</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{numberFmt.format(viewsCount)}</div>
          <div className="text-sm text-gray-500">Views</div>
        </div>
      </div>
    </div>
  );
}

function formatViews(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}
```

**UI Style**:
- Grid layout: `grid-cols-4 gap-4`
- Numbers: `text-2xl font-bold`
- Labels: `text-sm text-gray-500`

Replace `formatViews` with Intl API for localization:

```typescript
const numberFmt = new Intl.NumberFormat(undefined, { notation: 'compact' });
function formatNumber(n: number) {
  return numberFmt.format(n);
}
```

### ProfileTabs Component

**Important**: This component is **controlled** - it receives `activeTab` and `onTabChange` callback. State management happens in parent component.

```typescript
// src/components/ProfileTabs.tsx
'use client';

import { useTranslation } from '@/hooks/useTranslation';

export type Tab = 'stories' | 'posts' | 'about';

interface ProfileTabsProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export function ProfileTabs({ activeTab, onTabChange }: ProfileTabsProps) {
  const { t } = useTranslation();
  
  // Stories tab is first - it's the core BranchFeed feature
  const tabs: { id: Tab; label: string }[] = [
    { id: 'stories', label: t('profile.tabs.stories') }, // First - default tab
    { id: 'posts', label: t('profile.tabs.posts') },
    { id: 'about', label: t('profile.tabs.about') },
  ];
  
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="flex items-center gap-1 px-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-6 py-4 font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
```

**Props**:
- `activeTab: Tab` - Current active tab (controlled)
- `onTabChange: (tab: Tab) => void` - Callback to change active tab

**UI Style**:
- Active tab: `text-primary-600 border-b-2 border-primary-600`
- Inactive tab: `text-gray-600 hover:text-gray-900`
- Hover effect on inactive tabs

### ProfileContent Component

```typescript
// src/components/ProfileContent.tsx
'use client';

import { StoryCard } from '@/components/StoryCard';
import { PostCard } from '@/components/PostCard';
import { EmptyState } from '@/components/EmptyState';

interface ProfileContentProps {
  tab: 'stories' | 'posts' | 'about';
  stories: Story[];
  posts: Post[];
  userId: string;
}

export function ProfileContent({ tab, stories, posts, userId }: ProfileContentProps) {
  if (tab === 'stories') {
    if (stories.length === 0) {
      return (
        <EmptyState
          icon="📖"
          title="No Stories Yet"
          description="Create your first branching story and let users choose their own adventure!"
          actionButton={{
            label: "Create Story",
            onClick: () => router.push('/create'),
          }}
        />
      );
    }
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {stories.map((story) => (
          <StoryCard
            key={story.id}
            story={story}
            showBranchDepth={true} // Show branch depth on profile
            showPathCount={false} // Future: show path completion count
          />
        ))}
      </div>
    );
  }
  
  if (tab === 'posts') {
    if (posts.length === 0) {
      return <EmptyState icon="📝" title="No Posts Yet" description="This user hasn't created any posts yet." />;
    }
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    );
  }
  
  // About tab
  return (
    <div className="p-6">
      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <h2 className="text-xl font-semibold mb-4">About</h2>
        <p className="text-gray-600">User information and details...</p>
      </div>
    </div>
  );
}
```

**UI Style**:
- Grid layout: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`
- Empty states: See `UI_STYLE_GUIDE.md` for Empty States styling

---

## 🌿 Branching Stories on Profile Page

Branching stories are the **core feature** of BranchFeed, so the profile page should emphasize this type of content.

### Stories Tab Priority

- **"Stories" tab must be first and default selected** (`activeTab = 'stories'`)
- Stories tab appears first in the tab list
- When profile page loads, Stories tab is active by default
- This highlights that BranchFeed is about branching narratives, not just regular posts

**Implementation**:
```typescript
// ProfilePageClient.tsx
const [activeTab, setActiveTab] = useState<Tab>('stories'); // Default to 'stories'
```

### StoryCard Enhancements

Story cards on profile page should display additional information:

- **Branch Depth Indicator**: Show how many choice steps the story has
  - Example: "3 steps" or "5 branches"
  - Visual indicator: Badge or small text on card

- **Path Count** (Future Enhancement): Show how many paths users have completed
  - Example: "12 paths completed"
  - Helps creators see engagement

**Example StoryCard on Profile**:
```typescript
<StoryCard
  story={story}
  showBranchDepth={true} // Show branch depth on profile
  showPathCount={false} // Future: show path completion count
/>
```

**Visual Example**:
```
┌─────────────────────────┐
│ [Avatar] Story Title    │
│ [Video/Image]            │
│                         │
│ 🌿 3 steps • 12 paths   │ ← Branch info
│ [Like] [Comment] [Share]│
└─────────────────────────┘
```

### Empty State for Stories

If user has no stories, empty state should encourage creating first branching story:

**Empty State Text**:
- **Title**: "No Stories Yet"
- **Description**: "Create your first branching story and let users choose their own adventure!"
- **Action Button**: "Create Story" (links to `/create`)

**Example**:
```typescript
if (stories.length === 0) {
  return (
    <EmptyState
      icon="📖"
      title={t('profile.emptyStates.noStories')}
      description={t('profile.emptyStates.noStoriesDesc')}
      actionButton={{
        label: t('profile.createFirstStory'),
        onClick: () => router.push('/create'),
      }}
    />
  );
}
```

### Why This Matters

- **Brand Identity**: Profile feels like "BranchFeed creator profile", not generic social media profile
- **Feature Emphasis**: Branching stories are highlighted as the main content type
- **User Guidance**: Encourages users to create branching content
- **Creator Focus**: Shows that BranchFeed is for interactive storytelling creators

---

## 🌐 Data Fetching & API

Profile page relies on three main helper functions for data fetching:

### API Functions

#### `getProfile(id)`

- **Returns**: Profile main data from `profiles` table
- **Contains**: username, bio, avatar, and aggregated statistics (stories/posts/likes/views)
- **Usage**: Display profile header and statistics
- **Endpoint**: `/api/profile/[id]` (to be documented in `API.md`)

**Example Response**:
```typescript
{
  id: string;
  username: string;
  bio: string | null;
  avatar_url: string | null;
  total_likes: number;
  total_views: number;
  created_at: string;
}
```

#### `getProfileStories(userId)`

- **Returns**: Branching stories created by this user
- **Based on**: `stories` and `story_nodes` tables (exact schema described in `DATABASE.md`)
- **Usage**: Display in "Stories" tab
- **Endpoint**: `/api/profile/[id]/stories` (to be documented in `API.md`)

**Example Response**:
```typescript
Story[] // Array of story objects with branching structure
```

Add pagination to `getProfileStories(userId, { limit, offset })` and document REST endpoints as:
- `GET /api/profiles/[id]`
- `GET /api/profiles/[id]/stories?limit=...&offset=...`
- `GET /api/profiles/[id]/posts?limit=...&offset=...`
- `PATCH /api/profiles/[id]` (updateProfile)

Caching:
- Client-side caching with React Query (`useQuery`) for profile and stories; background refetch on focus.

#### `getProfilePosts(userId)`

- **Returns**: Regular posts from `posts` table
- **Usage**: Display in "Posts" tab
- **Endpoint**: `/api/profile/[id]/posts` (to be documented in `API.md`)

**Example Response**:
```typescript
Post[] // Array of post objects
```

### Implementation Location

These helper functions should be implemented in:
- **Server-side**: `src/lib/api/profile.ts` (for server components)
- **Client-side**: `src/lib/api/client/profile.ts` (for client components, if needed)

### API Documentation

Detailed API endpoint documentation should be added to `docs/API.md`:
- `GET /api/profile/[id]` - Get profile data
- `GET /api/profile/[id]/stories` - Get user's stories
- `GET /api/profile/[id]/posts` - Get user's posts
- `PATCH /api/profile/[id]` - Update profile (for own profile)

---

## 🔧 Implementation

### Architecture Overview

Profile page uses **Server/Client component separation**:

1. **Server Component** (`app/profile/[id]/page.tsx`):
   - Fetches data (profile, stories, posts)
   - No state management
   - Passes data to client component

2. **Client Component** (`ProfilePageClient.tsx`):
   - Manages tab state (`activeTab`)
   - Handles tab switching logic
   - Renders all interactive components

3. **Controlled Components**:
   - `ProfileTabs`: Receives `activeTab` and `onTabChange` callback
   - `ProfileContent`: Receives `tab` prop to know what to display

**Benefits**:
- ✅ Tab state management in one place
- ✅ Clear separation of concerns
- ✅ Server-side data fetching
- ✅ Client-side interactivity

### Profile Page Route (Server Component)

```typescript
// app/profile/[id]/page.tsx
import { ProfilePageClient } from '@/components/ProfilePageClient';
import { getProfile, getProfileStories, getProfilePosts } from '@/lib/api/profile';
import { getCurrentUser } from '@/lib/auth';

interface ProfilePageProps {
  params: {
    id: string;
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  // Server-side data fetching
  const currentUser = await getCurrentUser();
  const profile = await getProfile(params.id);
  const stories = await getProfileStories(params.id);
  const posts = await getProfilePosts(params.id);
  
  const isOwnProfile = currentUser?.id === params.id;
  
  // Pass data to client component for state management
  return (
    <ProfilePageClient
      profile={profile}
      stories={stories}
      posts={posts}
      isOwnProfile={isOwnProfile}
    />
  );
}
```

### Profile Page Client Component (State Management)

```typescript
// src/components/ProfilePageClient.tsx
'use client';

import { useState } from 'react';
import { ProfileHeader } from '@/components/ProfileHeader';
import { ProfileStats } from '@/components/ProfileStats';
import { ProfileTabs, type Tab } from '@/components/ProfileTabs';
import { ProfileContent } from '@/components/ProfileContent';

interface ProfilePageClientProps {
  profile: {
    id: string;
    username: string;
    bio: string | null;
    avatar_url: string | null;
    total_likes: number;
    total_views: number;
  };
  stories: Story[];
  posts: Post[];
  isOwnProfile: boolean;
}

export function ProfilePageClient({ profile, stories, posts, isOwnProfile }: ProfilePageClientProps) {
  // Tab state management - all tab logic in one place
  // Default to 'stories' - Branching stories are the core feature of BranchFeed
  const [activeTab, setActiveTab] = useState<Tab>('stories');
  
  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <ProfileHeader
        userId={profile.id}
        username={profile.username}
        bio={profile.bio}
        avatarUrl={profile.avatar_url}
        isOwnProfile={isOwnProfile}
      />
      <ProfileStats
        storiesCount={stories.length}
        postsCount={posts.length}
        likesCount={profile.total_likes}
        viewsCount={profile.total_views}
      />
      <ProfileTabs
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
      <ProfileContent
        tab={activeTab}
        stories={stories}
        posts={posts}
        userId={profile.id}
      />
    </div>
  );
}
```

**Architecture**:
- **Server Component** (`page.tsx`): Fetches data only, no state management
- **Client Component** (`ProfilePageClient`): Manages tab state, handles all interactivity
- **Controlled Components**: `ProfileTabs` and `ProfileContent` receive props, don't manage their own state

### Edit Profile Modal

```typescript
// src/components/EditProfileModal.tsx
'use client';

import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: {
    username: string;
    bio: string | null;
    avatarUrl: string | null;
  };
  onSave: (data: { username: string; bio: string; avatar: File | null }) => Promise<void>;
}

export function EditProfileModal({ isOpen, onClose, currentProfile, onSave }: EditProfileModalProps) {
  const { t } = useTranslation();
  const [username, setUsername] = useState(currentProfile.username);
  const [bio, setBio] = useState(currentProfile.bio || '');
  const [avatar, setAvatar] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  
  if (!isOpen) return null;
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave({ username, bio, avatar });
      onClose();
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-4">{t('profile.editProfile')}</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">{t('profile.avatar')}</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setAvatar(e.target.files?.[0] || null)}
              className="w-full"
            />
          </div>
          
          {/* Username */}
          <div>
            <label className="block text-sm font-medium mb-2">{t('profile.username')}</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>
          
          {/* Bio */}
          <div>
            <label className="block text-sm font-medium mb-2">{t('profile.bio')}</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              maxLength={500}
            />
            <div className="text-sm text-gray-500 mt-1">{bio.length}/500</div>
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50"
            >
              {loading ? t('common.saving') : t('common.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

**UI Style** (see `UI_STYLE_GUIDE.md`):
- Modal overlay: `fixed inset-0 bg-black/50`
- Modal content: `bg-white rounded-2xl p-6`
- Form inputs: See Form Components in `UI_STYLE_GUIDE.md`

---

## 📊 Database Schema

> ℹ️ **Note**: `Story` and `Post` types are defined in TypeScript file `src/types/content.ts` and correspond to the respective tables in `DATABASE.md` documentation.

### Profiles Table

```sql
-- Profiles table (already exists in ESSENTIAL_FEATURES.md)
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE,
  username TEXT UNIQUE,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP
);

-- Add computed columns for statistics (or use views)
-- Total likes received (from stories and posts)
-- Total views (from stories and posts)
```

### Profile Statistics Query

```sql
-- Get profile with statistics
SELECT 
  p.*,
  COUNT(DISTINCT s.id) as stories_count,
  COUNT(DISTINCT po.id) as posts_count,
  COALESCE(SUM(s.likes_count), 0) + COALESCE(SUM(po.likes_count), 0) as total_likes,
  COALESCE(SUM(s.views_count), 0) + COALESCE(SUM(po.views_count), 0) as total_views
FROM profiles p
LEFT JOIN stories s ON s.author_id = p.id
LEFT JOIN posts po ON po.author_id = p.id
WHERE p.id = $1
GROUP BY p.id;
```

---

## 🔐 RLS და პირადი პროფილები

Profile accessibility must be controlled by RLS (Row Level Security) policies.

### Initial Version (MVP)

- **Public Profiles**: All profiles are public by default
  - All authenticated users can view all profiles
  - Profile data (username, bio, avatar) is visible to everyone
  - User's stories and posts are visible to everyone
  - Simple RLS policy: `SELECT` allowed for all authenticated users

**Example RLS Policy (MVP)**:
```sql
-- Allow all authenticated users to read profiles
CREATE POLICY "Profiles are viewable by authenticated users"
ON profiles FOR SELECT
TO authenticated
USING (true);
```

### Future Enhancements

- **Private Profile Mode**: 
  - Only approved followers can view profile
  - Profile visibility setting in user settings
  - Stories and posts hidden from non-followers
  - Requires `follows` table and approval system

- **Profile Visibility Control**:
  - Settings page option: "Make profile private"
  - Users can approve/deny follow requests
  - Granular control over what's visible

**Future RLS Policy Example**:
```sql
-- Private profiles: only followers can view
CREATE POLICY "Private profiles viewable by followers only"
ON profiles FOR SELECT
TO authenticated
USING (
  is_private = false 
  OR 
  id = auth.uid() 
  OR 
  EXISTS (
    SELECT 1 FROM follows 
    WHERE follower_id = auth.uid() 
    AND following_id = profiles.id 
    AND approved = true
  )
);
```

Add future `is_private boolean DEFAULT false` to `profiles` and followers-based policy (see DATABASE.md). Keep MVP policy as-is (authenticated can read).

Audit Logs:
- Record profile updates in `audit_logs` (actor_id, action='profile_update', details JSON).

### Documentation

- **Detailed RLS Policies**: Exact RLS policies and examples should be documented in `docs/DATABASE.md`
- **Privacy Settings**: Profile privacy settings UI should be documented in Settings page feature docs
- **Follow System**: Private profiles require follow system (see Future Enhancements)

---

## 🌐 Internationalization (i18n)

### Translation Keys

Add to translation files (see `features/i18n-language-switcher.md`):

```json
{
  "profile": {
    "editProfile": "Edit Profile",
    "settings": "Settings",
    "follow": "Follow",
    "message": "Message",
    "avatar": "Avatar",
    "username": "Username",
    "bio": "Bio",
    "tabs": {
      "stories": "Stories",
      "posts": "Posts",
      "about": "About"
    },
    "stats": {
      "stories": "Stories",
      "posts": "Posts",
      "likes": "Likes",
      "views": "Views"
    },
    "emptyStates": {
      "noStories": "No Stories Yet",
      "noPosts": "No Posts Yet",
      "noStoriesDesc": "Create your first branching story and let users choose their own adventure!",
      "noPostsDesc": "This user hasn't created any posts yet."
    },
    "createFirstStory": "Create Story"
  }
}
```

Add plurals example:

```json
{
  "profile": {
    "stats": {
      "stories": "{count} Stories"
    }
  }
}
```

**Georgian translations**:
```json
{
  "profile": {
    "editProfile": "პროფილის რედაქტირება",
    "settings": "პარამეტრები",
    "follow": "გამოწერა",
    "message": "შეტყობინება",
    "avatar": "ავატარი",
    "username": "მომხმარებლის სახელი",
    "bio": "ბიოგრაფია",
    "tabs": {
      "stories": "სტორიები",
      "posts": "პოსტები",
      "about": "შესახებ"
    }
  }
}
```

---

## 🎨 Related Documentation

- **Database Schema**: See `docs/DATABASE.md` (profiles, follows, audit_logs, views)
- **UI Components**: See `UI_STYLE_GUIDE.md` for:
  - Button styles (Primary, Secondary, Outline)
  - Card components
  - Form components (Input, Textarea)
  - Modal styles
  - Empty States styling
- **i18n**: See `features/i18n-language-switcher.md`

---

## ✅ Requirements Checklist

- [ ] Accessibility check (ARIA labels on tabs, buttons, cards)

---

## 🔄 Future Enhancements

- Privacy Controls (private profiles, followers-only)
- Infinite Scroll for stories/posts
- Username availability check in EditProfileModal
- Profile Search (discover creators by username)

---

## 🧩 Dependencies (for Implementation)
- Hooks: `useProfile`, `useAuth`, `useMediaUpload`, React Query `useQuery`
- Libraries: `date-fns`/Intl for dates, `next/image`, React Query
- Components: `ProfileHeader`, `ProfileStats`, `ProfileTabs`, `ProfileContent`, `EditProfileModal`

---

## 🧪 Testing Checklist
- View own vs other profile variations
- Avatar upload flow (progress, error, success)
- Stories pagination (Load More/Infinite Scroll)
- Accessibility (tab order, ARIA)
- i18n (plurals on stats)
- RLS visibility (authenticated vs unauthenticated)

---

## 📝 Notes

- **Own Profile vs Other Profile**: Different UI/actions based on whether user is viewing their own profile
- **Privacy Settings**: Future feature - control who can see profile/stories
- **Profile Completion**: Encourage users to complete profile (avatar, bio)
- **Branching Stories Priority**: 
  - Stories tab is **first and default** - emphasizes BranchFeed's core feature
  - Story cards show branch depth and path information
  - Empty state encourages creating first branching story
  - Profile feels like "BranchFeed creator profile", not generic social media profile

---

**Last Updated**: 2025-01-XX  
**Version**: 1.0  
**Status**: Active

