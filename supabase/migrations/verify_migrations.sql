-- ============================================
-- Migration Verification Script
-- ============================================
-- Run this in Supabase SQL Editor after deploying
-- to verify all migrations are applied correctly
-- ============================================

-- 1. CHECK TABLES
-- ============================================
SELECT 
  'Tables' as check_type,
  COUNT(*) as count,
  string_agg(table_name, ', ' ORDER BY table_name) as items,
  CASE 
    WHEN COUNT(*) = 6 THEN '✅ PASS'
    ELSE '❌ FAIL - Expected 6 tables'
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('profiles', 'stories', 'story_nodes', 'user_story_progress', 'likes', 'comments');

-- Expected: 6 tables (profiles, stories, story_nodes, user_story_progress, likes, comments)

-- 2. CHECK FUNCTIONS
-- ============================================
SELECT 
  'Functions' as check_type,
  COUNT(*) as count,
  string_agg(routine_name, ', ' ORDER BY routine_name) as items,
  CASE 
    WHEN COUNT(*) >= 2 THEN '✅ PASS'
    ELSE '❌ FAIL - Expected at least 2 functions'
  END as status
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name IN ('handle_new_user', 'increment_story_views', 'update_story_likes_count', 'update_updated_at_column');

-- Expected: At least 2 functions (handle_new_user, increment_story_views)

-- 3. CHECK TRIGGERS
-- ============================================
SELECT 
  'Triggers' as check_type,
  COUNT(*) as count,
  string_agg(tgname, ', ' ORDER BY tgname) as items,
  CASE 
    WHEN COUNT(*) >= 2 THEN '✅ PASS'
    ELSE '❌ FAIL - Expected at least 2 triggers'
  END as status
FROM pg_trigger 
WHERE tgname IN ('on_auth_user_created', 'likes_count_trigger', 'update_profiles_updated_at', 'update_stories_updated_at', 'update_user_story_progress_updated_at');

-- Expected: At least 2 triggers (on_auth_user_created, likes_count_trigger)

-- 4. CHECK STORAGE BUCKETS
-- ============================================
SELECT 
  'Storage Buckets' as check_type,
  COUNT(*) as count,
  string_agg(name, ', ' ORDER BY name) as items,
  CASE 
    WHEN COUNT(*) = 2 THEN '✅ PASS'
    ELSE '❌ FAIL - Expected 2 buckets (stories, avatars)'
  END as status
FROM storage.buckets 
WHERE name IN ('stories', 'avatars');

-- Expected: 2 buckets (stories, avatars)

-- 5. CHECK STORAGE POLICIES
-- ============================================
SELECT 
  'Storage Policies' as check_type,
  COUNT(*) as count,
  string_agg(policyname, ', ' ORDER BY policyname) as items,
  CASE 
    WHEN COUNT(*) >= 4 THEN '✅ PASS'
    ELSE '❌ FAIL - Expected at least 4 policies'
  END as status
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND (policyname LIKE '%stories%' OR policyname LIKE '%avatars%');

-- Expected: At least 4 policies (2 for stories, 2 for avatars)

-- 6. CHECK RLS POLICIES ON TABLES
-- ============================================
SELECT 
  'RLS Enabled' as check_type,
  COUNT(*) as count,
  string_agg(tablename, ', ' ORDER BY tablename) as items,
  CASE 
    WHEN COUNT(*) = 6 THEN '✅ PASS'
    ELSE '❌ FAIL - Expected RLS on 6 tables'
  END as status
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'stories', 'story_nodes', 'user_story_progress', 'likes', 'comments')
  AND rowsecurity = true;

-- Expected: RLS enabled on all 6 tables

-- 7. CHECK INDEXES
-- ============================================
SELECT 
  'Indexes' as check_type,
  COUNT(*) as count,
  string_agg(indexname, ', ' ORDER BY indexname) as items,
  CASE 
    WHEN COUNT(*) >= 10 THEN '✅ PASS'
    ELSE '⚠️ WARNING - Expected at least 10 indexes'
  END as status
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'stories', 'story_nodes', 'user_story_progress', 'likes', 'comments')
  AND indexname LIKE 'idx_%';

-- Expected: At least 10 indexes for performance

-- ============================================
-- SUMMARY
-- ============================================
-- If all checks show ✅ PASS, your database is ready for production!
-- If any check shows ❌ FAIL, review the corresponding migration file.

