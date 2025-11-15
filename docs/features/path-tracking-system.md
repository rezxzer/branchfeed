# Path Tracking System - BranchFeed

ეს დოკუმენტაცია აღწერს Path Tracking System-ის იმპლემენტაციას BranchFeed-ში.

---

## 📋 Overview

Path Tracking System არის BranchFeed-ის მნიშვნელოვანი სისტემა, რომელიც:
- აკონტროლებს user-ის journey-ს branching story-ში
- ინახავს path sequence-ს (A → B → A)
- აჩვენებს user-ის progress-ს
- საშუალებას აძლევს user-ს გააგრძელოს story სადაც შეჩერდა

**Location**: `src/lib/paths.ts`, `src/hooks/usePathTracking.ts`

**Status**: 🔴 **Critical Priority** - Phase 2 (Core BranchFeed System!)

> ℹ️ **შენიშვნა**
>
> Path Tracking System არის BranchFeed-ის მნიშვნელოვანი სისტემა, რომელიც აკონტროლებს user-ის path-ის tracking-ს.
>
> ეს სისტემა გამოიყენება Story Detail Page-ზე, რათა user-მა შეძლოს გააგრძელოს story სადაც შეჩერდა.

> ℹ️ **Cursor-ზე**
>
> ამ ფაილში მოყვანილი კოდი არის **სტრუქტურის მაგალითი**.
>
> რეალური იმპლემენტაცია უნდა შეიქმნას Cursor-ის მიერ, `.cursorrules` და
> `docs/PROJECT_PRIORITIES.md` ფაილებში აღწერილი წესების დაცვით.

---

## 🎯 Features

### Core Features (MVP - Phase 2)

1. **Path Tracking**
   - Track user's choices (A/B)
   - Save path sequence (e.g., ['A', 'B', 'A'])
   - Save current depth
   - Save last visited node ID

2. **Path Loading**
   - Load user's existing path
   - Resume from last position
   - Handle path not found (start from root)

3. **Path Updates**
   - Update path on each choice
   - Update current depth
   - Update last node ID
   - Upsert (create or update)

4. **Path Validation**
   - Validate path sequence
   - Validate depth (not exceeding max)
   - Handle invalid paths

5. **Path History** (Optional - Phase 2+)
   - View path history
   - Compare paths
   - Share paths

---

## 📊 Database Schema

### Tables Used

1. **user_story_progress** table
   - `id` (UUID, primary key)
   - `user_id` (UUID, foreign key → profiles.id)
   - `story_id` (UUID, foreign key → stories.id)
   - `path` (text[] - array of 'A' | 'B' choices)
   - `current_depth` (integer, 0 = root)
   - `last_node_id` (UUID, foreign key → story_nodes.id, nullable)
   - `updated_at` (timestamp)
   - Unique constraint: `(user_id, story_id)`

### RLS Policies (Summary)

- **user_story_progress**:
  - SELECT/INSERT/UPDATE/DELETE: მხოლოდ მომხმარებელს თავისი progress (`auth.uid() = user_id`).

> **შენიშვნა: RLS Implementation**
>
> ყველა RLS პოლიტიკა უნდა იყოს ჩაწერილი `do $$ ... end $$;` ბლოკით Supabase მიგრაციებში.

### Indexes (Performance)

Recommended indexes:

- `user_story_progress(user_id, story_id)` – User progress lookup (unique)
- `user_story_progress(story_id)` – Story progress queries

---

## 🔧 Implementation Details

### Path Tracking Functions

```typescript
// lib/paths.ts
import { createClientClient } from '@/lib/auth';

interface UserStoryProgress {
  id: string;
  user_id: string;
  story_id: string;
  path: string[];
  current_depth: number;
  last_node_id: string | null;
  updated_at: string;
}

export async function savePath(
  storyId: string,
  path: string[],
  lastNodeId: string | null = null
): Promise<void> {
  const supabase = createClientClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('user_story_progress')
    .upsert({
      user_id: user.id,
      story_id: storyId,
      path,
      current_depth: path.length,
      last_node_id: lastNodeId,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id,story_id'
    });

  if (error) throw error;
}

export async function loadPath(storyId: string): Promise<UserStoryProgress | null> {
  const supabase = createClientClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;

  const { data, error } = await supabase
    .from('user_story_progress')
    .select('*')
    .eq('user_id', user.id)
    .eq('story_id', storyId)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
  return data || null;
}

export async function clearPath(storyId: string): Promise<void> {
  const supabase = createClientClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('user_story_progress')
    .delete()
    .eq('user_id', user.id)
    .eq('story_id', storyId);

  if (error) throw error;
}

export function validatePath(path: string[], maxDepth: number = 5): boolean {
  // Path should only contain 'A' or 'B'
  const validChoices = path.every(choice => choice === 'A' || choice === 'B');
  
  // Path length should not exceed max depth
  const validLength = path.length <= maxDepth;
  
  return validChoices && validLength;
}
```

### usePathTracking Hook

```typescript
// hooks/usePathTracking.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { savePath, loadPath, validatePath } from '@/lib/paths';

interface UsePathTrackingResult {
  currentPath: string[];
  currentDepth: number;
  makeChoice: (choice: 'A' | 'B') => Promise<void>;
  loadExistingPath: () => Promise<void>;
  clearPath: () => Promise<void>;
  isLoading: boolean;
}

export function usePathTracking(storyId: string, maxDepth: number = 5): UsePathTrackingResult {
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [currentDepth, setCurrentDepth] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const makeChoice = useCallback(async (choice: 'A' | 'B') => {
    const newPath = [...currentPath, choice];
    
    // Validate path
    if (!validatePath(newPath, maxDepth)) {
      throw new Error('Invalid path or max depth exceeded');
    }

    setIsLoading(true);
    try {
      setCurrentPath(newPath);
      setCurrentDepth(newPath.length);
      
      // Save path to database (lastNodeId will be updated after loading next node)
      await savePath(storyId, newPath, null);
    } catch (error) {
      // Revert on error
      setCurrentPath(currentPath);
      setCurrentDepth(currentPath.length);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [currentPath, storyId, maxDepth]);

  const loadExistingPath = useCallback(async () => {
    setIsLoading(true);
    try {
      const progress = await loadPath(storyId);
      
      if (progress) {
        setCurrentPath(progress.path || []);
        setCurrentDepth(progress.current_depth || 0);
      } else {
        // No existing path, start from root
        setCurrentPath([]);
        setCurrentDepth(0);
      }
    } catch (error) {
      console.error('Failed to load path:', error);
      // Default to root
      setCurrentPath([]);
      setCurrentDepth(0);
    } finally {
      setIsLoading(false);
    }
  }, [storyId]);

  const clearPath = useCallback(async () => {
    setIsLoading(true);
    try {
      await clearPath(storyId);
      setCurrentPath([]);
      setCurrentDepth(0);
    } catch (error) {
      console.error('Failed to clear path:', error);
    } finally {
      setIsLoading(false);
    }
  }, [storyId]);

  // Load existing path on mount
  useEffect(() => {
    loadExistingPath();
  }, [loadExistingPath]);

  return {
    currentPath,
    currentDepth,
    makeChoice,
    loadExistingPath,
    clearPath,
    isLoading,
  };
}
```

### Path Update on Node Load

```typescript
// When next node is loaded, update last_node_id
export async function updateLastNode(
  storyId: string,
  nodeId: string
): Promise<void> {
  const supabase = createClientClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('user_story_progress')
    .update({ last_node_id: nodeId })
    .eq('user_id', user.id)
    .eq('story_id', storyId);

  if (error) throw error;
}
```

---

## 🌐 Internationalization (i18n)

### Translation Keys

```json
{
  "pathTracking": {
    "loading": "Loading progress...",
    "saving": "Saving progress...",
    "errors": {
      "loadFailed": "Failed to load progress",
      "saveFailed": "Failed to save progress",
      "invalidPath": "Invalid path",
      "maxDepthExceeded": "Maximum depth exceeded"
    }
  }
}
```

---

## ✅ Requirements Checklist

- [ ] Path tracking functions (`savePath`, `loadPath`, `clearPath`)
- [ ] usePathTracking hook created
- [ ] Path validation
- [ ] Database table (user_story_progress)
- [ ] RLS policies implemented
- [ ] Indexes created
- [ ] Path updates on choice
- [ ] Path loading on mount
- [ ] Error handling
- [ ] i18n support (all text translatable)

---

## 🧪 Path Tracking System Testing Checklist (MVP)

1. ✅ Path Saving:
   - Path saves correctly on choice
   - Path updates correctly
   - Upsert works (create or update)

2. ✅ Path Loading:
   - Existing path loads correctly
   - No path defaults to root
   - Path not found handled correctly

3. ✅ Path Validation:
   - Valid path (A, B) passes
   - Invalid path (C, D) fails
   - Max depth exceeded fails

4. ✅ Path Updates:
   - Path updates on each choice
   - Depth updates correctly
   - Last node ID updates after node load

5. ✅ Database:
   - RLS policies work correctly
   - Unique constraint works
   - Indexes improve query performance

6. ✅ Error Handling:
   - Network errors handled
   - Invalid paths handled
   - Max depth exceeded handled

---

## 🔄 Future Enhancements

- **Path History**: View all paths user has taken
- **Path Comparison**: Compare with other users' paths
- **Path Statistics**: Show path popularity
- **Path Sharing**: Share specific path
- **Path Bookmarks**: Save favorite paths
- **Path Analytics**: Track completion rates per path
- **Path Recommendations**: Suggest alternative paths

---

## 📝 Notes

- **Phase 2 Priority**: Path Tracking System is critical priority for Phase 2
- **Path Format**: Path is array of 'A' | 'B' choices
- **Depth Calculation**: Depth = path.length (0 = root)
- **Upsert**: Uses upsert to create or update progress
- **Unique Constraint**: One progress record per user per story
- **RLS**: User can only access their own progress

---

## 🤖 Cursor Implementation Notes (Internal)

When implementing Path Tracking System in Cursor:

- Do NOT write code directly აქედან – გამოიყენე ეს დოკი როგორც source of truth.
- Steps:
  1. Create `user_story_progress` table in Supabase.
  2. Create path tracking functions (`savePath`, `loadPath`, `clearPath`).
  3. Create `usePathTracking` hook.
  4. Implement path validation.
  5. Implement RLS policies.
  6. Create database indexes.
  7. Add error handling.
  8. Add tests according to "Path Tracking System Testing Checklist (MVP)".

---

**Last Updated**: 2025-01-XX  
**Version**: 1.0  
**Status**: Phase 2 (Core BranchFeed System) - 🔴 Critical Priority

