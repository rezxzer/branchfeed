# Phase 2 Implementation Plan - BranchFeed

ეს დოკუმენტაცია აჩვენებს Phase 2-ის იმპლემენტაციის გეგმას თანმიმდევრობით.

**Last Updated**: 2025-01-15  
**Status**: 🚧 In Progress

---

## 📊 Current Status

### ✅ Completed

1. **Story Creation Functions** (`src/lib/stories.ts`)
   - ✅ Media upload functions
   - ✅ Story creation with branch nodes
   - ✅ Story fetching functions
   - ✅ Node fetching functions
   - ✅ Path navigation functions
   - ✅ Path tracking functions

2. **Hooks Updated**
   - ✅ `useCreateStory` hook - Real database integration

---

## 🎯 Implementation Order (Step-by-Step)

### Step 1: Supabase Storage Setup ⚠️ **REQUIRED FIRST**

**Priority**: 🔴 **CRITICAL** - Must be done before testing story creation

**What to do:**
1. Open Supabase Dashboard → Storage
2. Create new bucket: `stories`
3. Set bucket to **Public** (for public read access)
4. Create storage policies:
   - **Public Read Policy**: Allow anyone to read files
   - **Authenticated Upload Policy**: Allow authenticated users to upload

**Storage Policies SQL** (run in Supabase SQL Editor):

```sql
-- Allow public read access to stories bucket
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'stories');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'stories' 
  AND auth.role() = 'authenticated'
);

-- Allow users to update their own uploads
CREATE POLICY "Users can update own uploads"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'stories' 
  AND auth.role() = 'authenticated'
);

-- Allow users to delete their own uploads
CREATE POLICY "Users can delete own uploads"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'stories' 
  AND auth.role() = 'authenticated'
);
```

**Files affected**: None (Supabase Dashboard setup)

**Dependencies**: None

**Estimated time**: 10-15 minutes

**Verification**:
- Try uploading a test image via Create Story page
- Check if file appears in Storage bucket
- Check if file URL is accessible publicly

---

### Step 2: Test Story Creation 🔍

**Priority**: 🟡 **HIGH** - Verify database integration works

**What to do:**
1. Test story creation via `/create` page
2. Verify:
   - Root story is created in `stories` table
   - Branch nodes are created in `story_nodes` table
   - Media files are uploaded to Storage
   - Story ID is returned correctly
   - Redirect to story detail page works

**Files to test**:
- `src/app/create/page.tsx`
- `src/components/create/CreateStoryPageClient.tsx`
- `src/hooks/useCreateStory.ts`
- `src/lib/stories.ts`

**Dependencies**: Step 1 (Storage Setup)

**Estimated time**: 15-20 minutes

**If errors occur**:
- Check browser console for errors
- Check Supabase logs
- Verify RLS policies allow inserts
- Verify storage bucket exists and is public

---

### Step 3: Update Feed Page with Real Data 📰

**Priority**: 🟡 **HIGH** - Core feature for viewing stories

**What to do:**
1. Update `src/hooks/useFeed.ts` to use `getRootStoriesClient()`
2. Update `src/components/feed/FeedPageClient.tsx` to display real stories
3. Add pagination (load more button or infinite scroll)
4. Handle loading and error states
5. Remove mock data fallbacks

**Files to update**:
- `src/hooks/useFeed.ts` - Replace mock data with `getRootStoriesClient()`
- `src/components/feed/FeedPageClient.tsx` - Use real data from hook
- `src/components/feed/StoryCard.tsx` - Verify it works with real Story type

**Dependencies**: Step 2 (Story Creation works)

**Estimated time**: 30-45 minutes

**Implementation details**:
```typescript
// src/hooks/useFeed.ts
import { getRootStoriesClient } from '@/lib/stories'

export function useFeed() {
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [offset, setOffset] = useState(0)
  const limit = 10

  const loadStories = async () => {
    setLoading(true)
    try {
      const newStories = await getRootStoriesClient(limit, offset)
      if (newStories.length < limit) {
        setHasMore(false)
      }
      setStories(prev => [...prev, ...newStories])
      setOffset(prev => prev + limit)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStories()
  }, [])

  return { stories, loading, error, hasMore, loadMore: loadStories }
}
```

---

### Step 4: Update Story Player with Real Data 🎮

**Priority**: 🟡 **HIGH** - Core BranchFeed feature

**What to do:**
1. Update `src/hooks/useStory.ts` to use real path navigation
2. Integrate `getNodeByPath()` for path navigation
3. Integrate `updateUserProgress()` when user makes choice
4. Integrate `getUserProgress()` to show user's current position
5. Update `src/components/story/StoryPlayer.tsx` to use real data
6. Update `src/components/story/StoryDetailPageClient.tsx` to handle path navigation

**Files to update**:
- `src/hooks/useStory.ts` - Replace mock data with real functions
- `src/components/story/StoryPlayer.tsx` - Use real node data
- `src/components/story/StoryDetailPageClient.tsx` - Handle path state
- `src/components/story/ChoiceButtons.tsx` - Verify it works with real choices
- `src/components/story/PathProgress.tsx` - Show real path progress

**Dependencies**: Step 2 (Story Creation works), Step 3 (Feed works)

**Estimated time**: 45-60 minutes

**Implementation details**:
```typescript
// src/hooks/useStory.ts - Update to use real path navigation
import { getStoryByIdClient, getNodeByPath, updateUserProgress } from '@/lib/stories'

export function useStory(storyId: string, path: ('A' | 'B')[]) {
  // ... existing code ...
  
  useEffect(() => {
    const loadStory = async () => {
      try {
        // Load story
        const storyData = await getStoryByIdClient(storyId)
        setStory(storyData)
        
        // Load current node based on path
        if (path.length > 0) {
          const node = await getNodeByPath(storyId, path)
          setCurrentNode(node)
        } else {
          setCurrentNode(null) // Show root story
        }
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }
    
    loadStory()
  }, [storyId, path])
  
  // Function to handle choice selection
  const handleChoice = async (choice: 'A' | 'B') => {
    const newPath = [...path, choice]
    const userId = user?.id
    
    if (userId) {
      await updateUserProgress(userId, storyId, newPath)
    }
    
    // Navigate to new path
    router.push(`/story/${storyId}?path=${newPath.join(',')}`)
  }
}
```

---

### Step 5: Integrate Path Tracking UI 📍

**Priority**: 🟢 **MEDIUM** - Enhance user experience

**What to do:**
1. Show user's current path in Story Player
2. Show path progress (Step X of Y)
3. Allow user to see their progress history
4. Update path when user makes choice

**Files to update**:
- `src/components/story/PathProgress.tsx` - Show real path data
- `src/components/story/StoryPlayer.tsx` - Display path information
- `src/hooks/useStory.ts` - Load user progress on mount

**Dependencies**: Step 4 (Story Player works)

**Estimated time**: 20-30 minutes

---

### Step 6: Integrate Like Functionality ❤️

**Priority**: 🟢 **MEDIUM** - Basic interaction

**What to do:**
1. Verify `src/lib/likes.ts` has story like functions
2. Update `src/components/ui/LikeButton.tsx` to work with stories
3. Test like/unlike functionality
4. Verify likes count updates correctly

**Files to check/update**:
- `src/lib/likes.ts` - Verify story like functions exist
- `src/components/ui/LikeButton.tsx` - Verify it works with stories
- `src/components/story/InteractionButtons.tsx` - Verify like button integration

**Dependencies**: Step 2 (Stories exist in database)

**Estimated time**: 20-30 minutes

---

### Step 7: Integrate Comment Functionality 💬

**Priority**: 🟢 **MEDIUM** - Basic interaction

**What to do:**
1. Create comment functions in `src/lib/comments.ts` (if not exists)
2. Update comment UI to work with stories
3. Test comment creation
4. Test comment display

**Files to create/update**:
- `src/lib/comments.ts` - Comment functions (create, fetch, delete)
- `src/components/story/InteractionButtons.tsx` - Comment button integration
- Comment display component (if needed)

**Dependencies**: Step 2 (Stories exist in database)

**Estimated time**: 30-45 minutes

---

### Step 8: Implement View Count 👁️

**Priority**: 🟢 **MEDIUM** - Analytics

**What to do:**
1. Create function to increment view count
2. Call function when story is viewed
3. Update view count display

**Files to create/update**:
- `src/lib/stories.ts` - Add `incrementStoryViews()` function
- `src/components/story/StoryDetailPageClient.tsx` - Call increment on mount
- `src/components/feed/StoryCard.tsx` - Display view count

**Dependencies**: Step 2 (Stories exist in database)

**Estimated time**: 15-20 minutes

**Implementation**:
```typescript
// src/lib/stories.ts
export async function incrementStoryViews(storyId: string): Promise<void> {
  const supabase = createClientClient()
  
  const { error } = await supabase.rpc('increment_story_views', {
    story_id: storyId
  })
  
  if (error) {
    console.error('Error incrementing views:', error)
  }
}
```

**Note**: May need to create database function for atomic increment:
```sql
CREATE OR REPLACE FUNCTION increment_story_views(story_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE stories
  SET views_count = views_count + 1
  WHERE id = story_id;
END;
$$ LANGUAGE plpgsql;
```

---

### Step 9: Implement Share Functionality 🔗

**Priority**: 🟢 **MEDIUM** - Basic interaction

**What to do:**
1. Create share function that copies link with current path
2. Update share button to use real function
3. Test share functionality

**Files to create/update**:
- `src/lib/share.ts` - Share functions (copy link, social share)
- `src/components/story/InteractionButtons.tsx` - Share button integration

**Dependencies**: Step 4 (Path navigation works)

**Estimated time**: 15-20 minutes

---

## 📋 Checklist Summary

### Critical Path (Must Complete First)
- [ ] **Step 1**: Supabase Storage Setup
- [ ] **Step 2**: Test Story Creation
- [ ] **Step 3**: Update Feed Page
- [ ] **Step 4**: Update Story Player

### Important Features
- [ ] **Step 5**: Path Tracking UI
- [ ] **Step 6**: Like Functionality
- [ ] **Step 7**: Comment Functionality

### Nice to Have
- [ ] **Step 8**: View Count
- [ ] **Step 9**: Share Functionality

---

## 🔄 Dependencies Graph

```
Step 1 (Storage Setup)
  ↓
Step 2 (Test Story Creation)
  ↓
Step 3 (Feed Page) ──┐
  ↓                  │
Step 4 (Story Player) ←┘
  ↓
Step 5 (Path Tracking UI)
  ↓
Step 6 (Like) ──┐
Step 7 (Comment)│ (Can be done in parallel)
Step 8 (Views)  │
Step 9 (Share) ─┘
```

---

## ⚠️ Important Notes

1. **Storage Setup is CRITICAL**: Story creation will fail without storage bucket
2. **Test as you go**: Don't move to next step until current step works
3. **Error handling**: Add proper error handling at each step
4. **User feedback**: Show loading states and error messages
5. **Database verification**: Check Supabase Dashboard after each step

---

## 🐛 Common Issues & Solutions

### Issue: Story creation fails with storage error
**Solution**: Verify storage bucket exists and policies are set correctly (Step 1)

### Issue: Stories don't appear in feed
**Solution**: 
- Check RLS policies allow SELECT
- Verify `is_root = true` in database
- Check browser console for errors

### Issue: Path navigation doesn't work
**Solution**:
- Verify nodes are created correctly (check `story_nodes` table)
- Check path format (should be array of 'A' | 'B')
- Verify `getNodeByPath()` function logic

### Issue: User progress not saving
**Solution**:
- Check RLS policies for `user_story_progress` table
- Verify user is authenticated
- Check `updateUserProgress()` function

---

## 📊 Progress Tracking

**Current Step**: Step 1 (Storage Setup) - ✅ Migration created  
**Next Step**: Step 1 (Storage Setup) - ⏳ Apply migration in Supabase  
**Blockers**: None  
**Estimated Time to Complete Phase 2**: 4-6 hours

### Step 1 Status
- ✅ Migration file created: `supabase/migrations/20250115_02_add_storage_bucket_and_policies.sql`
- ✅ Bucket created in Supabase Dashboard
- ✅ Policies migration applied successfully

### Step 2 Status
- ⏳ Testing story creation
- ⏳ Verifying database integration

---

## 🔗 Related Documentation

- `docs/PROJECT_STATUS.md` - Overall project status
- `docs/PROJECT_PRIORITIES.md` - Feature priorities
- `docs/features/branching-stories-system.md` - Branching system details
- `docs/features/create-story-page.md` - Create story page docs
- `docs/features/story-detail-page.md` - Story detail page docs
- `docs/features/feed-page.md` - Feed page docs

---

**Last Updated**: 2025-01-15  
**Next Review**: After each step completion

