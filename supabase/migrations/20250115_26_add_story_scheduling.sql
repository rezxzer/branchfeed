-- Migration: Add story scheduling functionality
-- Date: 2025-01-15
-- Description: Adds scheduled_publish_at column to stories table for scheduling stories to be published in the future

DO $$
BEGIN
  -- Add scheduled_publish_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'stories' 
    AND column_name = 'scheduled_publish_at'
  ) THEN
    ALTER TABLE stories 
    ADD COLUMN scheduled_publish_at TIMESTAMPTZ;
    
    COMMENT ON COLUMN stories.scheduled_publish_at IS 
      'Timestamp when the story should be automatically published. NULL if not scheduled. Story must be in draft status when scheduled.';
  END IF;
END $$;

-- Create index for scheduled stories queries
CREATE INDEX IF NOT EXISTS idx_stories_scheduled_publish_at 
  ON stories(scheduled_publish_at) 
  WHERE scheduled_publish_at IS NOT NULL AND status = 'draft';

-- Create function to publish scheduled stories
CREATE OR REPLACE FUNCTION publish_scheduled_stories()
RETURNS INTEGER AS $$
DECLARE
  published_count INTEGER;
BEGIN
  -- Update stories that are scheduled and should be published now
  UPDATE stories
  SET 
    status = 'published',
    scheduled_publish_at = NULL,
    updated_at = NOW()
  WHERE 
    status = 'draft'
    AND scheduled_publish_at IS NOT NULL
    AND scheduled_publish_at <= NOW();
  
  GET DIAGNOSTICS published_count = ROW_COUNT;
  
  RETURN published_count;
END;
$$ LANGUAGE plpgsql;

-- Verification queries
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'stories' AND column_name = 'scheduled_publish_at';

-- SELECT indexname, indexdef 
-- FROM pg_indexes 
-- WHERE tablename = 'stories' AND indexname = 'idx_stories_scheduled_publish_at';

