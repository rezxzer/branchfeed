# Testing Story Creation - Step 2 Guide

ეს დოკუმენტაცია აჩვენებს როგორ შევამოწმოთ story creation functionality.

**Status**: ⏳ **IN PROGRESS**  
**Last Updated**: 2025-01-15

---

## 📋 Prerequisites

### 1. Supabase Storage Setup ✅

**CRITICAL**: Story creation **WILL FAIL** without the 'stories' bucket!

**Check if bucket exists:**
1. Open [Supabase Dashboard](https://app.supabase.com)
2. Go to **Storage** → Check if `stories` bucket exists
3. If not, follow `docs/STORAGE_SETUP_INSTRUCTIONS.md`

**Verify bucket is public:**
- Bucket should be marked as **"Public"**
- If not public, story media won't be accessible

### 2. Database Tables ✅

**Verify tables exist:**
- `stories` table (should exist from Phase 1)
- `story_nodes` table (should exist from Phase 1)
- `profiles` table (should exist from Phase 1)

**Check in Supabase Dashboard:**
1. Go to **Table Editor**
2. Verify all three tables exist
3. Check RLS policies are enabled

### 3. Authentication ✅

**Verify you're logged in:**
- Open `/signin` page
- Sign in with test account
- Should redirect to `/feed`

---

## 🧪 Testing Steps

### Step 1: Open Create Page

1. Navigate to `/create` page
2. Should see 3-step form:
   - Step 1: Root Story
   - Step 2: Branches
   - Step 3: Preview

**Expected:**
- Page loads without errors
- No console errors
- Form is visible

**If errors:**
- Check browser console
- Check if authenticated (should redirect to `/signin` if not)

---

### Step 2: Fill Root Story Form

1. **Title**: Enter test title (e.g., "My First Branching Story")
2. **Description**: Enter optional description
3. **Media**: Upload an image or video
   - Recommended: Use a 9:16 aspect ratio image
   - Max size: 10MB (check your bucket settings)
   - Supported: image/*, video/*

4. Click **"Next"** button

**Expected:**
- Form validates correctly
- Media preview shows
- Moves to Step 2 (Branches)

**If errors:**
- Check file size (should be < 10MB)
- Check file type (should be image or video)
- Check browser console for upload errors

---

### Step 3: Add Branch Nodes

1. **Add at least one branch node:**
   - **Choice A**: Enter text (e.g., "Go left")
   - **Choice B**: Enter text (e.g., "Go right")
   - Optionally upload media for each choice

2. Click **"Next"** button

**Expected:**
- Branch nodes are saved
- Moves to Step 3 (Preview)

**If errors:**
- Check if both choices have text
- Check browser console

---

### Step 4: Preview and Publish

1. **Review preview:**
   - Should show root story
   - Should show branch choices
   - Should show media previews

2. Click **"Publish Story"** button

**Expected:**
- Loading state shows
- Story ID is returned
- Redirects to `/story/[id]` page

**If errors:**
- Check browser console for detailed error
- Check Supabase Dashboard → Logs
- Verify storage bucket exists

---

## ✅ Verification Checklist

### Database Verification

**Check `stories` table:**
```sql
SELECT * FROM stories 
WHERE title = 'My First Branching Story' 
ORDER BY created_at DESC 
LIMIT 1;
```

**Expected:**
- Story record exists
- `is_root` = true
- `author_id` matches your user ID
- `media_url` is not null (if media uploaded)
- `branches_count` matches number of nodes

**Check `story_nodes` table:**
```sql
SELECT * FROM story_nodes 
WHERE story_id = '<story_id_from_above>'
ORDER BY created_at;
```

**Expected:**
- Node records exist
- `parent_id` is null (root nodes)
- `choice_a_text` and `choice_b_text` are filled
- `choice_a_media_url` and `choice_b_media_url` are set (if media uploaded)

---

### Storage Verification

**Check Supabase Storage:**
1. Go to **Storage** → `stories` bucket
2. Should see folders:
   - `root/` - Contains root story media
   - `nodes/<story_id>/` - Contains branch node media

**Expected:**
- Files are uploaded
- Files are accessible (public URLs work)
- File names are unique (timestamp-based)

---

### Frontend Verification

**Check `/story/[id]` page:**
1. Should load story correctly
2. Should show root story content
3. Should show branch choices
4. Should display media correctly

**If errors:**
- Check browser console
- Check network tab for failed requests
- Verify story ID is correct

---

## 🐛 Common Issues & Solutions

### Issue 1: "Storage bucket 'stories' not found"

**Error message:**
```
Failed to upload media: Storage bucket 'stories' not found
```

**Solution:**
1. Create `stories` bucket in Supabase Dashboard
2. Make it public
3. Apply storage policies (see `docs/STORAGE_SETUP_INSTRUCTIONS.md`)

---

### Issue 2: "User not authenticated"

**Error message:**
```
User not authenticated
```

**Solution:**
1. Sign in at `/signin`
2. Check if session is valid
3. Check browser console for auth errors

---

### Issue 3: "RLS policy violation"

**Error message:**
```
new row violates row-level security policy
```

**Solution:**
1. Check RLS policies in Supabase Dashboard
2. Verify policies allow INSERT for authenticated users
3. Check `supabase/sql/init.sql` for correct policies

---

### Issue 4: "Media upload failed"

**Error message:**
```
Failed to upload media: <error details>
```

**Solution:**
1. Check file size (should be < bucket limit)
2. Check file type (should be image or video)
3. Check storage policies allow upload
4. Check network connection

---

### Issue 5: "Story creation failed"

**Error message:**
```
Failed to create story: <error details>
```

**Solution:**
1. Check browser console for detailed error
2. Check Supabase Dashboard → Logs
3. Verify database tables exist
4. Verify RLS policies are correct

---

## 📊 Success Criteria

Story creation is successful if:

- ✅ Story is created in `stories` table
- ✅ Branch nodes are created in `story_nodes` table
- ✅ Media files are uploaded to Storage
- ✅ Story ID is returned correctly
- ✅ Redirect to `/story/[id]` works
- ✅ Story page displays correctly
- ✅ No console errors
- ✅ No Supabase errors in logs

---

## 🔄 Next Steps

After successful testing:

1. **Step 3**: Update Feed Page to use `getRootStoriesClient()`
2. **Step 4**: Update Story Player with real path navigation
3. **Step 5**: Integrate Path Tracking UI

See `docs/NEXT_STEPS_DETAILED.md` for full plan.

---

## 📝 Notes

- **Test with different media types**: image, video
- **Test with/without media**: Some stories may not have media
- **Test with multiple branch nodes**: Verify all nodes are created
- **Test error handling**: Try invalid inputs, large files, etc.

---

**Last Updated**: 2025-01-15  
**Status**: Ready for testing

