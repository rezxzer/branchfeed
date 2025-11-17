-- ============================================
-- MIGRATION: Create story_likes Table
-- ============================================
-- Date: 2025-01-15
-- Description: Creates story_likes table to track per-user likes on stories.
-- This table will enable "one like per user per story" functionality.
-- In a future step (B2), stories.likes_count will be aggregated from this table.
-- ============================================

DO $$
BEGIN
  -- Create story_likes table if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'story_likes'
  ) THEN
    CREATE TABLE story_likes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      story_id UUID NOT NULL,
      user_id UUID NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      
      -- Foreign key to stories table
      CONSTRAINT fk_story_likes_story 
        FOREIGN KEY (story_id) 
        REFERENCES stories(id) 
        ON DELETE CASCADE,
      
      -- Foreign key to profiles table
      CONSTRAINT fk_story_likes_user 
        FOREIGN KEY (user_id) 
        REFERENCES profiles(id) 
        ON DELETE CASCADE,
      
      -- Unique constraint: one like per user per story
      CONSTRAINT uq_story_likes_story_user 
        UNIQUE (story_id, user_id)
    );

    -- Add comments for documentation
    COMMENT ON TABLE story_likes IS 
      'Tracks which users have liked which stories. Enables one like per user per story.';
    
    COMMENT ON COLUMN story_likes.id IS 
      'Primary key for the like record.';
    
    COMMENT ON COLUMN story_likes.story_id IS 
      'Reference to the story that was liked.';
    
    COMMENT ON COLUMN story_likes.user_id IS 
      'Reference to the user who liked the story.';
    
    COMMENT ON COLUMN story_likes.created_at IS 
      'Timestamp when the like was created.';
    
    COMMENT ON CONSTRAINT uq_story_likes_story_user ON story_likes IS 
      'Ensures a user can only like a story once. Prevents duplicate likes.';
  END IF;
END $$;

-- ============================================
-- Enable RLS on story_likes
-- ============================================

DO $$
BEGIN
  -- Enable RLS if not already enabled
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'story_likes'
    AND rowsecurity = true
  ) THEN
    ALTER TABLE story_likes ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- ============================================
-- RLS Policy: Users can read their own likes
-- ============================================

DO $$
BEGIN
  -- Drop policy if exists (for idempotent migration)
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'story_likes' 
    AND policyname = 'Users can read their own likes'
  ) THEN
    DROP POLICY "Users can read their own likes" ON story_likes;
  END IF;

  -- Create select policy
  CREATE POLICY "Users can read their own likes"
    ON story_likes
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());
END $$;

-- ============================================
-- RLS Policy: Users can insert likes for themselves
-- ============================================

DO $$
BEGIN
  -- Drop policy if exists (for idempotent migration)
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'story_likes' 
    AND policyname = 'Users can insert their own likes'
  ) THEN
    DROP POLICY "Users can insert their own likes" ON story_likes;
  END IF;

  -- Create insert policy
  CREATE POLICY "Users can insert their own likes"
    ON story_likes
    FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());
END $$;

-- ============================================
-- RLS Policy: Users can delete their own likes
-- ============================================

DO $$
BEGIN
  -- Drop policy if exists (for idempotent migration)
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'story_likes' 
    AND policyname = 'Users can delete their own likes'
  ) THEN
    DROP POLICY "Users can delete their own likes" ON story_likes;
  END IF;

  -- Create delete policy
  CREATE POLICY "Users can delete their own likes"
    ON story_likes
    FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());
END $$;

-- ============================================
-- Create indexes for performance
-- ============================================

DO $$
BEGIN
  -- Index on story_id for fast lookups of all likes for a story
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND tablename = 'story_likes' 
    AND indexname = 'idx_story_likes_story_id'
  ) THEN
    CREATE INDEX idx_story_likes_story_id ON story_likes(story_id);
  END IF;

  -- Index on user_id for fast lookups of all likes by a user
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND tablename = 'story_likes' 
    AND indexname = 'idx_story_likes_user_id'
  ) THEN
    CREATE INDEX idx_story_likes_user_id ON story_likes(user_id);
  END IF;

  -- Index on created_at for sorting/analytics
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND tablename = 'story_likes' 
    AND indexname = 'idx_story_likes_created_at'
  ) THEN
    CREATE INDEX idx_story_likes_created_at ON story_likes(created_at DESC);
  END IF;
END $$;

