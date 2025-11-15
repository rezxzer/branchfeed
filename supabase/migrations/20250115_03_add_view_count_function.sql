-- Migration: Add View Count Increment Function
-- Date: 2025-01-15
-- Sequence: 03 (third migration of the day)
-- Description: Creates database function for atomic view count increment

-- ============================================
-- VIEW COUNT INCREMENT FUNCTION
-- ============================================

-- Drop function if exists (for idempotency)
DROP FUNCTION IF EXISTS increment_story_views(UUID);

-- Create function for atomic view count increment
CREATE OR REPLACE FUNCTION increment_story_views(story_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE stories
  SET views_count = views_count + 1,
      updated_at = NOW()
  WHERE id = story_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION increment_story_views(UUID) TO authenticated;

-- ============================================
-- VERIFICATION
-- ============================================

-- To verify the function was created, run:
-- SELECT routine_name, routine_type 
-- FROM information_schema.routines 
-- WHERE routine_schema = 'public' 
-- AND routine_name = 'increment_story_views';

-- To test the function, run:
-- SELECT increment_story_views('your-story-id-here');
-- SELECT views_count FROM stories WHERE id = 'your-story-id-here';

