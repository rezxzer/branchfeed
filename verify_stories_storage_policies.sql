-- ============================================
-- VERIFICATION: Stories Storage Bucket Policies
-- ============================================
-- Run this SQL to verify that policies are correctly configured
-- ============================================

-- Check all policies for 'stories' bucket
SELECT 
  policyname,
  cmd AS command,
  CASE 
    WHEN cmd = 'SELECT' THEN 'Public read access (anyone can view)'
    WHEN cmd = 'INSERT' THEN 'Authenticated upload (only logged-in users)'
    WHEN cmd = 'UPDATE' THEN 'Authenticated update (only logged-in users)'
    WHEN cmd = 'DELETE' THEN 'Authenticated delete (only logged-in users)'
  END AS description,
  qual AS using_clause,
  with_check AS with_check_clause
FROM pg_policies
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND (
    policyname LIKE '%stories%' 
    OR policyname LIKE '%upload%'
    OR policyname LIKE '%Public read access%'
    OR policyname LIKE '%Authenticated upload%'
    OR policyname LIKE '%update own%'
    OR policyname LIKE '%delete own%'
  )
ORDER BY 
  CASE cmd
    WHEN 'SELECT' THEN 1
    WHEN 'INSERT' THEN 2
    WHEN 'UPDATE' THEN 3
    WHEN 'DELETE' THEN 4
  END,
  policyname;

-- Expected result:
-- 1. "Public read access" - SELECT - should allow anyone to read (no auth.role() check)
-- 2. "Authenticated upload" - INSERT - should check auth.role() = 'authenticated'
-- 3. "Users can update own uploads" - UPDATE - should check auth.role() = 'authenticated'
-- 4. "Users can delete own uploads" - DELETE - should check auth.role() = 'authenticated'

