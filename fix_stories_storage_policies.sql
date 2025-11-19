-- ============================================
-- FIX: Stories Storage Bucket Policies
-- ============================================
-- Date: 2025-01-15
-- Description: Fix STORIES bucket policies - change INSERT/UPDATE/DELETE from 'public' to 'authenticated'
-- 
-- This SQL fixes the security issue where unauthenticated users could upload/update/delete files.
-- ============================================

-- Drop existing policies if they exist (for idempotent migration)
DO $$
BEGIN
  -- Drop policies if they exist
  DROP POLICY IF EXISTS "Authenticated upload" ON storage.objects;
  DROP POLICY IF EXISTS "Users can update own uploads" ON storage.objects;
  DROP POLICY IF EXISTS "Users can delete own uploads" ON storage.objects;
END $$;

-- Policy 1: Authenticated users can upload (FIXED - was 'public', now 'authenticated')
CREATE POLICY "Authenticated upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'stories' 
  AND auth.role() = 'authenticated'
);

-- Policy 2: Users can update their own uploads (FIXED - was 'public', now 'authenticated')
CREATE POLICY "Users can update own uploads"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'stories' 
  AND auth.role() = 'authenticated'
);

-- Policy 3: Users can delete their own uploads (FIXED - was 'public', now 'authenticated')
CREATE POLICY "Users can delete own uploads"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'stories' 
  AND auth.role() = 'authenticated'
);

-- ============================================
-- VERIFICATION
-- ============================================
-- 
-- After running this SQL, verify it works:
--
-- 1. Check policies in Supabase Dashboard:
--    - Go to Storage → Policies tab
--    - Find STORIES bucket section
--    - Verify:
--      ✅ "Public read access" (SELECT) - APPLIED TO: public (correct)
--      ✅ "Authenticated upload" (INSERT) - APPLIED TO: authenticated (fixed)
--      ✅ "Users can update own uploads" (UPDATE) - APPLIED TO: authenticated (fixed)
--      ✅ "Users can delete own uploads" (DELETE) - APPLIED TO: authenticated (fixed)
--
-- 2. Test authenticated upload:
--    - Try uploading while logged in (should work)
--    - Try uploading while logged out (should fail with permission error)
--
-- 3. SQL query to verify policies:
--    SELECT 
--      policyname,
--      cmd,
--      qual,
--      with_check
--    FROM pg_policies
--    WHERE schemaname = 'storage' 
--      AND tablename = 'objects'
--      AND policyname IN (
--        'Public read access',
--        'Authenticated upload',
--        'Users can update own uploads',
--        'Users can delete own uploads'
--      )
--    ORDER BY policyname;
--
-- Expected result:
-- - "Public read access" should allow SELECT for everyone
-- - "Authenticated upload" should check auth.role() = 'authenticated'
-- - "Users can update own uploads" should check auth.role() = 'authenticated'
-- - "Users can delete own uploads" should check auth.role() = 'authenticated'
--
-- ============================================

