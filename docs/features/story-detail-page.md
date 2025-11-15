# Story Detail Page - BranchFeed

ეს დოკუმენტაცია აღწერს Story Detail Page-ის იმპლემენტაციას BranchFeed-ში.

---

## 📋 Overview

Story Detail Page არის BranchFeed-ის ბირთვი, სადაც:
- მომხმარებლები ხედავენ და ითამაშებენ **branching stories**-ს
- მომხმარებლები იღებენ **A/B არჩევნებს** ყოველ ნაბიჯზე
- მომხმარებლების **path tracking** ხდება (რომელ path-ზე მიდიან)
- მომხმარებლები ხედავენ **path progress**-ს (Step X of Y)
- მომხმარებლებს შეუძლიათ **ურთიერთქმედება** (like, comment, share)

**Route**: `/story/[id]` (dynamic route, protected)

**Status**: 🔴 **Critical Priority** - Phase 2 (Core BranchFeed Feature!)

> ℹ️ **შენიშვნა**
>
> Story Detail Page არის **დაცული გვერდი** - მხოლოდ ავტორიზებულ მომხმარებლებს შეუძლიათ წვდომა.
>
> ეს არის BranchFeed-ის ყველაზე მნიშვნელოვანი გვერდი, სადაც მომხმარებლები განიცდიან ინტერაქტიურ, branching narratives-ს.

> ℹ️ **Cursor-ზე**
>
> ამ ფაილში მოყვანილი კომპონენტები და სტრუქტურა არის **სტრუქტურის მაგალითები**.
>
> რეალური იმპლემენტაცია უნდა შეიქმნას Cursor-ის მიერ, `.cursorrules` და
> `docs/PROJECT_PRIORITIES.md` ფაილებში აღწერილი წესების დაცვით.

---

## 🎯 Features

### Core Features (MVP - Phase 2)

1. **Story Player**
   - Root story display (image/video, 9:16 aspect ratio)
   - Current node display (based on user's path)
   - Media player (image viewer / video player)
   - Full-screen mode (optional - Phase 2+)

2. **A/B Choice Buttons**
   - Two choice buttons (A and B)
   - Choice labels (customizable by creator)
   - Choice content preview (optional)
   - Click choice → load next node in that path
   - Disabled when at max depth or end of path

3. **Path Progress Indicator**
   - Progress bar showing "Step X of Y"
   - Current depth / max depth display
   - Visual path indicator (optional)
   - Completion status

4. **Path Tracking**
   - Track user's journey through branches
   - Save path sequence (e.g., A → B → A)
   - Load user's existing path (if returning)
   - Path history display (optional - Phase 2+)

5. **Next Node Loading**
   - Load next node based on user's choice
   - Fetch child nodes for current node
   - Handle end of path (no more nodes)
   - Handle max depth reached

6. **Basic Interactions**
   - Like button (toggle like)
   - View count (increment on view)
   - Comment button (navigate to comments)
   - Share button (copy link with path)

7. **Story Information**
   - Story title
   - Author info (avatar, username)
   - Story description
   - Story stats (likes, views, branches count)

---

## 📐 Page Layout

### Structure

```
┌─────────────────────────────────────┐
│  Header (Navigation)               │
├─────────────────────────────────────┤
│  Story Info                         │
│  [Avatar] Author • Title            │
│  Description                        │
├─────────────────────────────────────┤
│  Story Player                       │
│  ┌─────────────────────────────┐   │
│  │                             │   │
│  │   [Media Display]           │   │
│  │   (9:16 aspect ratio)        │   │
│  │                             │   │
│  └─────────────────────────────┘   │
│  Path Progress: Step 2 / 5          │
├─────────────────────────────────────┤
│  Choice Buttons                     │
│  ┌──────────┐  ┌──────────┐        │
│  │ Choice A │  │ Choice B │        │
│  │ "Pizza"  │  │ "Salad"  │        │
│  └──────────┘  └──────────┘        │
├─────────────────────────────────────┤
│  Interactions                       │
│  [Like] [Comment] [Share]           │
│  Stats: ❤️ 123  👁️ 456            │
└─────────────────────────────────────┘
```

### Mobile Layout

```
┌─────────────────┐
│ Header (Mobile)  │
├─────────────────┤
│ Story Info      │
│ [Avatar] Author │
│ Title           │
├─────────────────┤
│ Story Player    │
│ [Full Screen]   │
│ [Media]         │
├─────────────────┤
│ Path: Step 2/5  │
├─────────────────┤
│ [Choice A]      │
│ [Choice B]      │
├─────────────────┤
│ [Like] [Share]  │
└─────────────────┘
```

---

## 🎨 UI Components

### Used Components

1. **Header** (`src/components/Header.tsx`)
   - Navigation bar
   - User menu

2. **StoryPlayer** (`src/components/StoryPlayer.tsx`)
   - Media display (image/video)
   - 9:16 aspect ratio container
   - Full-screen toggle (optional)
   - Loading state

3. **ChoiceButtons** (`src/components/ChoiceButtons.tsx`)
   - Two choice buttons (A/B)
   - Gradient styling
   - Hover effects
   - Shimmer animation (optional)
   - Disabled state

4. **PathProgress** (`src/components/PathProgress.tsx`)
   - Progress bar
   - "Step X of Y" text
   - Visual indicator
   - Completion status

5. **InteractionButtons** (`src/components/InteractionButtons.tsx`)
   - Like button
   - Comment button
   - Share button
   - Stats display

6. **Spinner** (`src/components/ui/Spinner.tsx`)
   - Loading state during node loading

7. **ErrorState** (`src/components/ErrorState.tsx`)
   - Error messages

---

## 🔐 Access Control

- `/story/[id]` არის **დაცული როუთი**:
  - `middleware.ts` → აუთენტიფიცირებულს აგდებს `/signin`-ზე.
  - `app/story/[id]/page.tsx` → server-side `getCurrentUser()` შემოწმება.
- თუ `getCurrentUser()` აბრუნებს `null` → `redirect('/signin')`.
- Story viewing requires authenticated user (for path tracking).

---

## 🔧 Implementation Details

### Page Component Structure (Server Component)

```typescript
// app/story/[id]/page.tsx
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { StoryDetailPageClient } from '@/components/story/StoryDetailPageClient';

interface StoryDetailPageProps {
  params: {
    id: string;
  };
}

export default async function StoryDetailPage({ params }: StoryDetailPageProps) {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/signin');
  }

  return <StoryDetailPageClient storyId={params.id} />;
}
```

### Story Detail Page Client Component

> **Implementation Note – useStory + usePathTracking**
>
> StoryDetailPageClient-ში `useStory` უნდა იყოს მიბმული `path`-ზე:
>
> - Path-ს მართავს `usePathTracking(storyId)` (აბრუნებს `currentPath`-ს და `currentDepth`-ს).
> - `useStory` იღებს ორ არგუმენტს: `storyId` და `currentPath`.
> - `path` შეიცვლება `makeChoice()`-ზე, და `useStory` გადატვირთავს current node-ს.

```typescript
// components/story/StoryDetailPageClient.tsx
'use client';

import { useState, useEffect } from 'react';
import { StoryPlayer } from '@/components/StoryPlayer';
import { ChoiceButtons } from '@/components/ChoiceButtons';
import { PathProgress } from '@/components/PathProgress';
import { InteractionButtons } from '@/components/InteractionButtons';
import { useStory } from '@/hooks/useStory';
import { usePathTracking } from '@/hooks/usePathTracking';

interface StoryDetailPageClientProps {
  storyId: string;
}

export function StoryDetailPageClient({ storyId }: StoryDetailPageClientProps) {
  const { currentPath, currentDepth, makeChoice, loadExistingPath } = usePathTracking(storyId);
  const { story, currentNode, loading, error } = useStory(storyId, currentPath);

  useEffect(() => {
    // Load existing path if user has one
    loadExistingPath();
  }, [storyId]);

  const handleChoice = async (choice: 'A' | 'B') => {
    await makeChoice(choice);
    // Next node will be loaded automatically via useStory hook
  };

  if (loading) {
    return <Spinner size="lg" />;
  }

  if (error || !story) {
    return <ErrorState message={error?.message || 'Story not found'} />;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Story Info */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <img 
            src={story.author.avatar_url} 
            alt={story.author.username}
            className="w-10 h-10 rounded-full"
          />
          <div>
            <p className="font-semibold">{story.author.username}</p>
            <p className="text-sm text-muted-foreground">{story.title}</p>
          </div>
        </div>
        {story.description && (
          <p className="text-muted-foreground">{story.description}</p>
        )}
      </div>

      {/* Story Player */}
      <div className="mb-6">
        <StoryPlayer 
          mediaUrl={currentNode?.media_url || story.media_url}
          mediaType={currentNode?.media_type || story.media_type}
        />
      </div>

      {/* Path Progress */}
      <div className="mb-6">
        <PathProgress 
          currentStep={currentDepth + 1}
          maxSteps={story.max_depth}
          path={currentPath}
        />
      </div>

      {/* Choice Buttons */}
      {currentDepth < story.max_depth && (
        <div className="mb-6">
          <ChoiceButtons 
            choiceA={currentNode?.choiceA || { label: 'A' }}
            choiceB={currentNode?.choiceB || { label: 'B' }}
            onChoice={handleChoice}
            disabled={loading || !currentNode}
          />
        </div>
      )}

      {/* End of Path / Max Depth */}
      {currentDepth >= story.max_depth && (
        <div className="mb-6 p-4 bg-muted rounded-lg text-center">
          <p className="text-lg font-semibold mb-2">
            {t('storyDetail.pathComplete')}
          </p>
          <p className="text-muted-foreground">
            {t('storyDetail.pathCompleteDescription')}
          </p>
        </div>
      )}

      {/* Interactions */}
      <div className="border-t pt-6">
        <InteractionButtons 
          storyId={storyId}
          likesCount={story.likes_count}
          viewsCount={story.views_count}
        />
      </div>
    </div>
  );
}
```

### useStory Hook

> **Implementation Detail – Path Traversal**
>
> Path-ის გასაყვანად:
>
> - ვიყენებთ ლოკალურ ცვლადს, სადაც ვინახავთ "ბოლო ნაპოვნ node-ს" (მაგ. `lastNode`).
> - ყოველი choice-ზე ვკითხავთ `story_nodes` ცხრილს `story_id + parent_node_id + choice_label` კომბინაციით.
> - ლუპის ბოლოს current node არის ბოლო ნაპოვნი node (`lastNode`), და ის უნდა ჩაიწეროს `setCurrentNode(...)`-ში.

```typescript
// hooks/useStory.ts
'use client';

import { useState, useEffect } from 'react';
import { createClientClient } from '@/lib/auth';

interface UseStoryResult {
  story: Story | null;
  currentNode: StoryNode | null;
  loading: boolean;
  error: Error | null;
}

export function useStory(storyId: string, path?: string[]): UseStoryResult {
  const [story, setStory] = useState<Story | null>(null);
  const [currentNode, setCurrentNode] = useState<StoryNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadStory = async () => {
      try {
        setLoading(true);
        setError(null);

        const supabase = createClientClient();

        // 1. Load root story
        const { data: storyData, error: storyError } = await supabase
          .from('stories')
          .select('*, author:profiles(*)')
          .eq('id', storyId)
          .eq('is_root', true)
          .single();

        if (storyError) throw storyError;
        setStory(storyData);

        // 2. Load current node based on path
        if (path && path.length > 0) {
          // Navigate through path to find current node
          let parentNodeId: string | null = null;
          let lastNode: StoryNode | null = null;
          
          for (const choice of path) {
            const { data: nodeData, error: nodeError } = await supabase
              .from('story_nodes')
              .select('*')
              .eq('story_id', storyId)
              .eq('parent_node_id', parentNodeId)
              .eq('choice_label', choice)
              .single();

            if (nodeError) throw nodeError;
            parentNodeId = nodeData.id;
            lastNode = nodeData;
          }

          // Use last found node as current node
          setCurrentNode(lastNode);
        } else {
          // No path = show root story
          setCurrentNode(null);
        }

        // 3. Increment view count
        await supabase.rpc('increment_story_views', { story_id: storyId });
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    loadStory();
  }, [storyId, path]);

  return {
    story,
    currentNode,
    loading,
    error,
  };
}
```

### usePathTracking Hook

```typescript
// hooks/usePathTracking.ts
'use client';

import { useState, useEffect } from 'react';
import { createClientClient } from '@/lib/auth';

interface UsePathTrackingResult {
  currentPath: string[];
  currentDepth: number;
  makeChoice: (choice: 'A' | 'B') => Promise<void>;
  loadExistingPath: () => Promise<void>;
}

export function usePathTracking(storyId: string): UsePathTrackingResult {
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [currentDepth, setCurrentDepth] = useState(0);

  const makeChoice = async (choice: 'A' | 'B') => {
    const newPath = [...currentPath, choice];
    setCurrentPath(newPath);
    setCurrentDepth(newPath.length);

    // Save path to database
    const supabase = createClientClient();
    await supabase
      .from('user_story_progress')
      .upsert({
        user_id: (await supabase.auth.getUser()).data.user?.id,
        story_id: storyId,
        path: newPath,
        current_depth: newPath.length,
        last_node_id: null, // Will be updated after loading next node
      });
  };

  const loadExistingPath = async () => {
    const supabase = createClientClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;

    const { data: progress } = await supabase
      .from('user_story_progress')
      .select('path, current_depth')
      .eq('user_id', user.id)
      .eq('story_id', storyId)
      .single();

    if (progress) {
      setCurrentPath(progress.path || []);
      setCurrentDepth(progress.current_depth || 0);
    }
  };

  return {
    currentPath,
    currentDepth,
    makeChoice,
    loadExistingPath,
  };
}
```

### StoryPlayer Component

```typescript
// components/StoryPlayer.tsx
'use client';

import { useState } from 'react';

interface StoryPlayerProps {
  mediaUrl: string;
  mediaType: 'image' | 'video';
}

export function StoryPlayer({ mediaUrl, mediaType }: StoryPlayerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <div className="relative aspect-[9/16] max-w-md mx-auto bg-black rounded-lg overflow-hidden">
      {mediaType === 'image' ? (
        <img 
          src={mediaUrl} 
          alt="Story"
          className="w-full h-full object-cover"
        />
      ) : (
        <video 
          src={mediaUrl}
          className="w-full h-full object-cover"
          controls
          autoPlay
          loop
        />
      )}
      
      {/* Fullscreen toggle (optional) */}
      <button
        onClick={() => setIsFullscreen(!isFullscreen)}
        className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white"
      >
        {isFullscreen ? '⤓' : '⤢'}
      </button>
    </div>
  );
}
```

### ChoiceButtons Component

> **Text / Content Rules**
>
> - `choiceA.label` და `choiceB.label` არის მთავარი, მოკლე ტექსტი (მაგ. "Go left", "Go right").
> - `choiceA.content` და `choiceB.content` არის არასავალდებულო აღწერა – თუ არ არის, UI უბრალოდ label-ს აჩვენებს.
> - Disabled მდგომარეობა იმართება გარედან (`disabled` prop), რომელიც დამოკიდებულია `loading`-ზე და იმაზე, შესაძლებელია თუ არა შემდეგ node-ზე გადასვლა.

```typescript
// components/ChoiceButtons.tsx
'use client';

interface ChoiceButtonsProps {
  choiceA: {
    label: string;
    content?: string;
  };
  choiceB: {
    label: string;
    content?: string;
  };
  onChoice: (choice: 'A' | 'B') => void;
  disabled?: boolean;
}

export function ChoiceButtons({ choiceA, choiceB, onChoice, disabled }: ChoiceButtonsProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <button
        onClick={() => onChoice('A')}
        disabled={disabled}
        className="relative px-6 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg font-semibold hover:from-primary-600 hover:to-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        <span className="text-sm opacity-80">Choice A</span>
        <p className="text-lg">{choiceA.label}</p>
        {choiceA.content && (
          <p className="text-sm opacity-90 mt-1">{choiceA.content}</p>
        )}
      </button>

      <button
        onClick={() => onChoice('B')}
        disabled={disabled}
        className="relative px-6 py-4 bg-gradient-to-r from-secondary-500 to-secondary-600 text-white rounded-lg font-semibold hover:from-secondary-600 hover:to-secondary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        <span className="text-sm opacity-80">Choice B</span>
        <p className="text-lg">{choiceB.label}</p>
        {choiceB.content && (
          <p className="text-sm opacity-90 mt-1">{choiceB.content}</p>
        )}
      </button>
    </div>
  );
}
```

### PathProgress Component

```typescript
// components/PathProgress.tsx
'use client';

interface PathProgressProps {
  currentStep: number;
  maxSteps: number;
  path: string[];
}

export function PathProgress({ currentStep, maxSteps, path }: PathProgressProps) {
  const progress = (currentStep / maxSteps) * 100;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>Step {currentStep} of {maxSteps}</span>
        <span>{Math.round(progress)}%</span>
      </div>
      <div className="w-full bg-muted rounded-full h-2">
        <div 
          className="bg-primary h-2 rounded-full transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
      {path.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Path: {path.join(' → ')}
        </p>
      )}
    </div>
  );
}
```

---

## 📊 Database Schema

### Tables Used

1. **stories** table
   - `id` (UUID, primary key)
   - `title` (text)
   - `description` (text, optional)
   - `media_url` (text, Supabase Storage)
   - `media_type` (text: 'image' | 'video')
   - `author_id` (UUID, foreign key → profiles.id)
   - `max_depth` (integer, default: 5)
   - `likes_count` (integer, cached)
   - `views_count` (integer, cached)
   - `created_at` (timestamp)

2. **story_nodes** table
   - `id` (UUID, primary key)
   - `story_id` (UUID, foreign key → stories.id)
   - `parent_node_id` (UUID, foreign key → story_nodes.id, nullable)
   - `choice_label` (text: 'A' | 'B' | custom)
   - `content` (text, optional)
   - `media_url` (text, Supabase Storage, optional)
   - `media_type` (text: 'image' | 'video', optional)
   - `depth` (integer, 0 = root level)
   - `created_at` (timestamp)

3. **user_story_progress** table
   - `id` (UUID, primary key)
   - `user_id` (UUID, foreign key → profiles.id)
   - `story_id` (UUID, foreign key → stories.id)
   - `path` (text[] - array of 'A' | 'B' choices)
   - `current_depth` (integer)
   - `last_node_id` (UUID, foreign key → story_nodes.id, nullable)
   - `updated_at` (timestamp)

4. **profiles** table
   - `id` (UUID, primary key)
   - `username` (text)
   - `avatar_url` (text, optional)

### RLS Policies (Summary)

- **stories**:
  - SELECT: ყველა authenticated მომხმარებელს შეუძლია root stories ნახვა.
  - UPDATE: მხოლოდ ავტორს (`auth.uid() = author_id`).

- **story_nodes**:
  - SELECT: ყველა authenticated მომხმარებელს შეუძლია nodes ნახვა.

- **user_story_progress**:
  - SELECT/INSERT/UPDATE: მხოლოდ მომხმარებელს თავისი progress (`auth.uid() = user_id`).

> **შენიშვნა: RLS Implementation**
>
> ყველა RLS პოლიტიკა უნდა იყოს ჩაწერილი `do $$ ... end $$;` ბლოკით Supabase მიგრაციებში.

### Indexes (Performance)

Recommended indexes:

- `stories(id, is_root)` – Story lookup
- `story_nodes(story_id, parent_node_id, choice_label)` – Node navigation
- `user_story_progress(user_id, story_id)` – User progress lookup

---

## 🌐 Internationalization (i18n)

### Translation Keys

```json
{
  "storyDetail": {
    "title": "Story",
    "pathComplete": "Path Complete!",
    "pathCompleteDescription": "You've reached the end of this path.",
    "maxDepthReached": "Maximum depth reached",
    "loading": "Loading story...",
    "errors": {
      "notFound": "Story not found",
      "loadFailed": "Failed to load story"
    }
  },
  "pathProgress": {
    "step": "Step {current} of {max}",
    "path": "Path: {path}"
  },
  "choiceButtons": {
    "choiceA": "Choice A",
    "choiceB": "Choice B"
  }
}
```

---

## ✅ Requirements Checklist

- [ ] Story detail page route created (`/story/[id]`)
- [ ] Story detail page is protected (requires authentication)
- [ ] StoryDetailPageClient component created (client component)
- [ ] StoryPlayer component created
- [ ] ChoiceButtons component created
- [ ] PathProgress component created
- [ ] useStory hook created
- [ ] usePathTracking hook created
- [ ] Path tracking (save user's choices)
- [ ] Next node loading based on choice
- [ ] useStory და usePathTracking სინქრონიზებულია: path-ის ცვლილება ყოველთვის იწვევს current node-ის განახლებას
- [ ] Max depth validation
- [ ] View count increment
- [ ] Like/Comment/Share buttons
- [ ] Error handling
- [ ] Loading states (Spinner)
- [ ] i18n support (all text translatable)
- [ ] Responsive design (mobile, tablet, desktop)

---

## 🧪 Story Detail Page Testing Checklist (MVP)

1. ✅ Authenticated user:
   - `/story/[id]` → shows story player
   - Can see root story
   - Can make A/B choices

2. ✅ Unauthenticated user:
   - `/story/[id]` → redirects to `/signin`

3. ✅ Story Player:
   - Root story displays correctly
   - Media (image/video) displays in 9:16 aspect ratio
   - Current node displays based on path

4. ✅ Choice Buttons:
   - Two choice buttons (A/B) display
   - Clicking choice loads next node
   - Buttons disabled at max depth
   - Path დასრულებულად ითვლება, როცა:
     - `currentDepth >= story.max_depth`
     - ან სისტემა ვერ პოულობს child node-ს მოცემული path-ის შემდეგ
   - ამ დროს Choice Buttons აღარ ჩანს და ჩნდება "Path Complete" ბლოკი

5. ✅ Path Progress:
   - Progress bar shows current step / max steps
   - Path sequence displays correctly
   - Progress updates on each choice

6. ✅ Path Tracking:
   - User's choices are saved
   - Returning user sees their existing path
   - Path history is correct

7. ✅ Max Depth:
   - Story stops at max depth (5 steps)
   - "Path Complete" message shows
   - Choice buttons disabled

8. ✅ Interactions:
   - Like button works
   - View count increments
   - Share button copies link

9. ✅ Error Handling:
   - Story not found → shows error
   - Network error → shows error
   - Invalid path → shows error

10. ✅ Responsive:
    - Mobile layout works
    - Tablet layout works
    - Desktop layout works

---

## 🔄 Future Enhancements

- **Path History**: Visual path history display
- **Multiple Endings**: Show all possible endings
- **Story Completion**: Completion percentage
- **Story Analytics**: Views per path, completion rates
- **Story Sharing**: Share specific path
- **Story Comments**: Comment on specific nodes
- **Story Reactions**: Emoji reactions
- **Story Bookmarks**: Save favorite paths
- **Story Recommendations**: Similar stories

---

## 📝 Notes

- **Phase 2 Priority**: Story Detail Page is critical priority for Phase 2
- **Max Depth**: Default max depth is 5 steps per path
- **Path Tracking**: User's path is saved in `user_story_progress` table
- **Media Format**: 9:16 aspect ratio for stories (mobile-first design)
- **Client Component**: StoryDetailPageClient uses `'use client'` directive
- **Server Component**: Story detail page.tsx is server component (auth check only)
- **RLS**: Story viewing requires authenticated user (for path tracking)

---

## 🤖 Cursor Implementation Notes (Internal)

When implementing Story Detail Page in Cursor:

- Do NOT write code directly აქედან – გამოიყენე ეს დოკი როგორც source of truth.
- Steps:
  1. Ensure `/story/[id]` route is protected (middleware + server redirect).
  2. Create `StoryDetailPageClient` with story player and choice buttons.
  3. Implement `useStory` hook for loading story and nodes.
  4. Implement `usePathTracking` hook for path tracking.
  5. Create `StoryPlayer`, `ChoiceButtons`, `PathProgress` components.
  6. Respect RLS – only authenticated users can view stories.
  7. Add tests according to "Story Detail Page Testing Checklist (MVP)".

---

**Last Updated**: 2025-01-XX  
**Version**: 1.0  
**Status**: Phase 2 (Core BranchFeed Feature) - 🔴 Critical Priority

