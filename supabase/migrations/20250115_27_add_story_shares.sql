-- Migration: Add story shares tracking
-- Date: 2025-01-15
-- Description: Creates story_shares table to track story shares and adds shares_count column to stories table

-- Create story_shares table
CREATE TABLE IF NOT EXISTS story_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Foreign key to stories table
  CONSTRAINT fk_story_shares_story 
    FOREIGN KEY (story_id) 
    REFERENCES stories(id) 
    ON DELETE CASCADE,
  
  -- Foreign key to profiles table
  CONSTRAINT fk_story_shares_user 
    FOREIGN KEY (user_id) 
    REFERENCES profiles(id) 
    ON DELETE CASCADE,
  
  -- Unique constraint: one share per user per story (users can share multiple times, but we track unique shares)
  CONSTRAINT uq_story_shares_story_user 
    UNIQUE (story_id, user_id)
);

COMMENT ON TABLE story_shares IS 
  'Tracks which users have shared which stories. Enables share count tracking and analytics.';

COMMENT ON COLUMN story_shares.id IS 
  'Primary key for the share record.';

COMMENT ON COLUMN story_shares.story_id IS 
  'Reference to the story that was shared.';

COMMENT ON COLUMN story_shares.user_id IS 
  'Reference to the user who shared the story.';

COMMENT ON COLUMN story_shares.created_at IS 
  'Timestamp when the share was created.';

-- Add shares_count column to stories table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'stories' 
    AND column_name = 'shares_count'
  ) THEN
    ALTER TABLE stories 
    ADD COLUMN shares_count INTEGER NOT NULL DEFAULT 0;
    
    COMMENT ON COLUMN stories.shares_count IS 
      'Cached count of shares for this story. Updated via trigger.';
  END IF;
END $$;

-- Enable RLS on story_shares
ALTER TABLE story_shares ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DO $$
BEGIN
  -- Users can read all shares (for share counts)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'story_shares' 
    AND policyname = 'Users can read all shares'
  ) THEN
    CREATE POLICY "Users can read all shares"
      ON story_shares
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;

  -- Users can insert shares for themselves
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'story_shares' 
    AND policyname = 'Users can insert their own shares'
  ) THEN
    CREATE POLICY "Users can insert their own shares"
      ON story_shares
      FOR INSERT
      TO authenticated
      WITH CHECK (user_id = auth.uid());
  END IF;

  -- Users can delete their own shares
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'story_shares' 
    AND policyname = 'Users can delete their own shares'
  ) THEN
    CREATE POLICY "Users can delete their own shares"
      ON story_shares
      FOR DELETE
      TO authenticated
      USING (user_id = auth.uid());
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_story_shares_story_id ON story_shares(story_id);
CREATE INDEX IF NOT EXISTS idx_story_shares_user_id ON story_shares(user_id);
CREATE INDEX IF NOT EXISTS idx_story_shares_created_at ON story_shares(created_at DESC);

-- Create function to update shares_count
CREATE OR REPLACE FUNCTION update_story_shares_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE stories
    SET shares_count = COALESCE(shares_count, 0) + 1
    WHERE id = NEW.story_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE stories
    SET shares_count = GREATEST(COALESCE(shares_count, 0) - 1, 0)
    WHERE id = OLD.story_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update shares_count
DROP TRIGGER IF EXISTS trigger_update_story_shares_count ON story_shares;
CREATE TRIGGER trigger_update_story_shares_count
  AFTER INSERT OR DELETE ON story_shares
  FOR EACH ROW
  EXECUTE FUNCTION update_story_shares_count();

-- Initialize shares_count for existing stories (set to 0 if NULL)
UPDATE stories
SET shares_count = 0
WHERE shares_count IS NULL;

-- Verification queries
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'story_shares';

-- SELECT indexname, indexdef 
-- FROM pg_indexes 
-- WHERE tablename = 'story_shares';

