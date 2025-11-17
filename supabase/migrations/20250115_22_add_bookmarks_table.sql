-- Migration: Add bookmarks table for story favorites
-- Date: 2025-01-15
-- Description: Creates bookmarks table to allow users to save/favorite stories

-- Create bookmarks table
CREATE TABLE IF NOT EXISTS bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  story_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Foreign key to profiles table
  CONSTRAINT bookmarks_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES profiles(id) 
    ON DELETE CASCADE,
  
  -- Foreign key to stories table
  CONSTRAINT bookmarks_story_id_fkey 
    FOREIGN KEY (story_id) 
    REFERENCES stories(id) 
    ON DELETE CASCADE,
  
  -- Unique constraint: one bookmark per user per story
  CONSTRAINT uq_bookmarks_user_story 
    UNIQUE (user_id, story_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_story_id ON bookmarks(story_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_created ON bookmarks(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_story ON bookmarks(user_id, story_id);

-- RLS Policies
DO $$
BEGIN
  -- Enable RLS
  ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

  -- Users can read their own bookmarks
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'bookmarks' 
    AND policyname = 'Users can read own bookmarks'
  ) THEN
    CREATE POLICY "Users can read own bookmarks"
      ON bookmarks
      FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  -- Authenticated insert: Authenticated users can bookmark stories
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'bookmarks' 
    AND policyname = 'Authenticated insert bookmarks'
  ) THEN
    CREATE POLICY "Authenticated insert bookmarks"
      ON bookmarks
      FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;

  -- Owner delete: Users can unbookmark (delete their own bookmarks)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'bookmarks' 
    AND policyname = 'Owner delete bookmarks'
  ) THEN
    CREATE POLICY "Owner delete bookmarks"
      ON bookmarks
      FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Verification queries
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'bookmarks';

-- SELECT indexname, indexdef 
-- FROM pg_indexes 
-- WHERE tablename = 'bookmarks';

