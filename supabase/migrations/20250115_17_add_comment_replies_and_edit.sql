-- Migration: Add comment replies and edit support
-- Date: 2025-01-15
-- Description: Adds parent_comment_id for nested replies and ensures updated_at is properly handled

-- Add parent_comment_id column for replies
ALTER TABLE comments 
ADD COLUMN IF NOT EXISTS parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE;

-- Add index for parent_comment_id (for efficient reply queries)
CREATE INDEX IF NOT EXISTS idx_comments_parent_id 
ON comments(parent_comment_id) 
WHERE parent_comment_id IS NOT NULL;

-- Add index for story_id + parent_comment_id (for efficient story comments with replies)
CREATE INDEX IF NOT EXISTS idx_comments_story_parent 
ON comments(story_id, parent_comment_id) 
WHERE story_id IS NOT NULL;

-- Ensure updated_at trigger exists (should already exist, but make it idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_comments_updated_at'
  ) THEN
    CREATE TRIGGER update_comments_updated_at
      BEFORE UPDATE ON comments
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Add trigger function to validate parent comment is on the same story
-- (PostgreSQL doesn't allow subqueries in CHECK constraints)
-- CREATE OR REPLACE is idempotent, so we can use it directly
CREATE OR REPLACE FUNCTION validate_comment_parent_story()
RETURNS TRIGGER AS $$
BEGIN
  -- If parent_comment_id is NULL, allow (top-level comment)
  IF NEW.parent_comment_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Check if parent comment exists and is on the same story
  IF NOT EXISTS (
    SELECT 1 FROM comments
    WHERE id = NEW.parent_comment_id
    AND story_id = NEW.story_id
  ) THEN
    RAISE EXCEPTION 'Parent comment must be on the same story';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'validate_comment_parent_story_trigger'
  ) THEN
    CREATE TRIGGER validate_comment_parent_story_trigger
      BEFORE INSERT OR UPDATE ON comments
      FOR EACH ROW
      EXECUTE FUNCTION validate_comment_parent_story();
  END IF;
END $$;

-- Verification queries
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'comments' AND column_name = 'parent_comment_id';

-- SELECT indexname, indexdef 
-- FROM pg_indexes 
-- WHERE tablename = 'comments' AND indexname LIKE '%parent%';

