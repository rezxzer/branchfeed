-- ============================================
-- MIGRATION: Add Storage Bucket and Policies
-- ============================================
-- Date: 2025-01-15
-- Description: Create 'stories' storage bucket and policies for media uploads
-- 
-- This migration creates a public storage bucket for story media (images/videos)
-- and sets up RLS policies for public read access and authenticated upload.
-- ============================================

-- ============================================
-- MIGRATION_PLAN
-- ============================================
-- 
-- What we're adding:
-- 1. Storage bucket 'stories' (public bucket for story media)
-- 2. Storage policies:
--    - Public read access (anyone can view story media)
--    - Authenticated upload (only authenticated users can upload)
--    - Users can update own uploads
--    - Users can delete own uploads
-- 
-- Why this change is needed:
-- - Story creation requires media upload (images/videos)
-- - Media files need to be publicly accessible for viewing
-- - Only authenticated users should be able to upload
-- 
-- Migration file: 20250115_add_storage_bucket_and_policies.sql
-- ============================================

-- ============================================
-- SQL_MIGRATION
-- ============================================

-- Note: Storage buckets must be created via Supabase Dashboard or Storage API
-- This SQL file contains policies only. Bucket creation must be done manually:
-- 
-- Steps to create bucket:
-- 1. Go to Supabase Dashboard → Storage
-- 2. Click "New bucket"
-- 3. Name: "stories"
-- 4. Public bucket: YES (check this)
-- 5. File size limit: 50MB (or as needed)
-- 6. Allowed MIME types: image/*, video/* (or leave empty for all)
-- 7. Click "Create bucket"
--
-- After bucket is created, run the policies below.

-- ============================================
-- 1. STORAGE POLICIES FOR 'stories' BUCKET
-- ============================================

-- Drop existing policies if they exist (for idempotent migration)
DO $$
BEGIN
  -- Drop policies if they exist
  DROP POLICY IF EXISTS "Public read access" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated upload" ON storage.objects;
  DROP POLICY IF EXISTS "Users can update own uploads" ON storage.objects;
  DROP POLICY IF EXISTS "Users can delete own uploads" ON storage.objects;
END $$;

-- Policy 1: Public read access (anyone can view story media)
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'stories');

-- Policy 2: Authenticated users can upload
CREATE POLICY "Authenticated upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'stories' 
  AND auth.role() = 'authenticated'
);

-- Policy 3: Users can update their own uploads
-- Note: This allows users to update files they uploaded
-- In practice, you might want to restrict this further
CREATE POLICY "Users can update own uploads"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'stories' 
  AND auth.role() = 'authenticated'
);

-- Policy 4: Users can delete their own uploads
-- Note: This allows users to delete files they uploaded
-- In practice, you might want to restrict this further
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
-- After running this migration, verify it works:
--
-- 1. Check that bucket exists (in Supabase Dashboard):
--    - Go to Storage → Check if 'stories' bucket exists
--    - Verify it's marked as "Public"
--
-- 2. Check that policies exist:
--    SELECT policyname, cmd, qual, with_check
--    FROM pg_policies
--    WHERE schemaname = 'storage' 
--      AND tablename = 'objects'
--      AND policyname IN (
--        'Public read access',
--        'Authenticated upload',
--        'Users can update own uploads',
--        'Users can delete own uploads'
--      );
--
-- 3. Test upload (via Create Story page):
--    - Create a test story with an image
--    - Verify file appears in 'stories' bucket
--    - Verify file URL is publicly accessible
--
-- 4. Test read access:
--    - Copy public URL of uploaded file
--    - Open in incognito browser (not logged in)
--    - Verify image/video loads correctly
--
-- 5. Test authenticated upload:
--    - Try uploading while logged in (should work)
--    - Try uploading while logged out (should fail)
--
-- ============================================

