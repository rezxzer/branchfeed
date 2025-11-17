-- Migration: Add status field to stories table for draft/published
-- Date: 2025-01-15
-- Description: Adds status field to support draft stories

-- Add status column to stories table
ALTER TABLE stories
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'published'
  CHECK (status IN ('draft', 'published'));

-- Create index for status queries (for filtering drafts)
CREATE INDEX IF NOT EXISTS idx_stories_status ON stories(status);
CREATE INDEX IF NOT EXISTS idx_stories_author_status ON stories(author_id, status);

-- Update existing stories to be published (if they don't have status)
UPDATE stories
SET status = 'published'
WHERE status IS NULL OR status NOT IN ('draft', 'published');

-- Add comment
COMMENT ON COLUMN stories.status IS 'Story status: draft (not published) or published (visible in feed)';

-- Verification queries
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'stories' AND column_name = 'status';

-- SELECT indexname, indexdef
-- FROM pg_indexes
-- WHERE tablename = 'stories' AND indexname LIKE '%status%';

