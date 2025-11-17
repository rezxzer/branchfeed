-- Migration: Add followers table for follow system
-- Date: 2025-01-15
-- Description: Creates followers table to track user follow relationships

-- Create followers table
CREATE TABLE IF NOT EXISTS followers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT followers_unique_pair UNIQUE (follower_id, following_id),
  CONSTRAINT followers_no_self_follow CHECK (follower_id != following_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_followers_follower_id ON followers(follower_id);
CREATE INDEX IF NOT EXISTS idx_followers_following_id ON followers(following_id);
CREATE INDEX IF NOT EXISTS idx_followers_created_at ON followers(created_at DESC);

-- RLS Policies
DO $$
BEGIN
  -- Enable RLS
  ALTER TABLE followers ENABLE ROW LEVEL SECURITY;

  -- Public read: Anyone can see who follows whom
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'followers' 
    AND policyname = 'Public read followers'
  ) THEN
    CREATE POLICY "Public read followers"
      ON followers
      FOR SELECT
      USING (true);
  END IF;

  -- Authenticated insert: Authenticated users can follow others
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'followers' 
    AND policyname = 'Authenticated insert followers'
  ) THEN
    CREATE POLICY "Authenticated insert followers"
      ON followers
      FOR INSERT
      WITH CHECK (auth.uid() = follower_id);
  END IF;

  -- Owner delete: Users can unfollow (delete their own follow relationships)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'followers' 
    AND policyname = 'Owner delete followers'
  ) THEN
    CREATE POLICY "Owner delete followers"
      ON followers
      FOR DELETE
      USING (auth.uid() = follower_id);
  END IF;
END $$;

-- Verification queries
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'followers';

-- SELECT indexname, indexdef 
-- FROM pg_indexes 
-- WHERE tablename = 'followers';

