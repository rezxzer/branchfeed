-- Add RLS policies to prevent banned/suspended users from accessing platform
-- This migration adds policies that check banned_at and suspended_until fields

DO $$
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Banned users cannot access stories" ON stories;
  DROP POLICY IF EXISTS "Banned users cannot create stories" ON stories;
  DROP POLICY IF EXISTS "Banned users cannot access comments" ON comments;
  DROP POLICY IF EXISTS "Banned users cannot create comments" ON comments;
  DROP POLICY IF EXISTS "Banned users cannot access likes" ON story_likes;
  DROP POLICY IF EXISTS "Banned users cannot create likes" ON story_likes;
END $$;

-- Stories: Banned/suspended users cannot view or create stories
CREATE POLICY "Banned users cannot access stories"
  ON stories FOR SELECT
  TO authenticated
  USING (
    NOT EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.banned_at IS NOT NULL OR (profiles.suspended_until IS NOT NULL AND profiles.suspended_until > NOW()))
    )
  );

CREATE POLICY "Banned users cannot create stories"
  ON stories FOR INSERT
  TO authenticated
  WITH CHECK (
    NOT EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.banned_at IS NOT NULL OR (profiles.suspended_until IS NOT NULL AND profiles.suspended_until > NOW()))
    )
  );

-- Comments: Banned/suspended users cannot view or create comments
CREATE POLICY "Banned users cannot access comments"
  ON comments FOR SELECT
  TO authenticated
  USING (
    NOT EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.banned_at IS NOT NULL OR (profiles.suspended_until IS NOT NULL AND profiles.suspended_until > NOW()))
    )
  );

CREATE POLICY "Banned users cannot create comments"
  ON comments FOR INSERT
  TO authenticated
  WITH CHECK (
    NOT EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.banned_at IS NOT NULL OR (profiles.suspended_until IS NOT NULL AND profiles.suspended_until > NOW()))
    )
  );

-- Likes: Banned/suspended users cannot view or create likes
CREATE POLICY "Banned users cannot access likes"
  ON story_likes FOR SELECT
  TO authenticated
  USING (
    NOT EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.banned_at IS NOT NULL OR (profiles.suspended_until IS NOT NULL AND profiles.suspended_until > NOW()))
    )
  );

CREATE POLICY "Banned users cannot create likes"
  ON story_likes FOR INSERT
  TO authenticated
  WITH CHECK (
    NOT EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.banned_at IS NOT NULL OR (profiles.suspended_until IS NOT NULL AND profiles.suspended_until > NOW()))
    )
  );

-- Verification queries:
-- 1. Check policies exist:
-- SELECT schemaname, tablename, policyname FROM pg_policies 
-- WHERE tablename IN ('stories', 'comments', 'story_likes')
-- AND policyname LIKE '%Banned%'
-- ORDER BY tablename, policyname;

-- 2. Test ban check:
-- SELECT is_user_banned('USER_ID_HERE'::uuid) as is_banned;
-- SELECT is_user_suspended('USER_ID_HERE'::uuid) as is_suspended;

