-- Add description column to content_reports table
-- This allows users to provide additional context when reporting content

DO $$
BEGIN
  -- Add description column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'content_reports' 
    AND column_name = 'description'
  ) THEN
    ALTER TABLE content_reports 
    ADD COLUMN description TEXT;
    
    COMMENT ON COLUMN content_reports.description IS 
      'Optional additional details provided by the reporter.';
  END IF;
END $$;

-- Verification queries:
-- 1. Check column exists:
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'content_reports' 
-- AND column_name = 'description';

-- 2. Check table structure:
-- SELECT * FROM content_reports LIMIT 1;

