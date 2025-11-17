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

-- Add constraint: parent_comment_id must reference a comment on the same story
-- (This ensures replies are always on the same story as the parent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'comments_parent_same_story'
  ) THEN
    ALTER TABLE comments
    ADD CONSTRAINT comments_parent_same_story
    CHECK (
      parent_comment_id IS NULL OR
      EXISTS (
        SELECT 1 FROM comments c1, comments c2
        WHERE c1.id = comments.id
        AND c2.id = comments.parent_comment_id
        AND c1.story_id = c2.story_id
      )
    );
  END IF;
END $$;

-- Verification queries
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'comments' AND column_name = 'parent_comment_id';

-- SELECT indexname, indexdef 
-- FROM pg_indexes 
-- WHERE tablename = 'comments' AND indexname LIKE '%parent%';

