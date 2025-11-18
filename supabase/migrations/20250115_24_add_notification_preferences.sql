-- Migration: Add notification preferences to profiles table
-- Date: 2025-01-15
-- Description: Adds notification_preferences JSONB column to profiles table for user notification settings

DO $$
BEGIN
  -- Add notification_preferences column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'notification_preferences'
  ) THEN
    ALTER TABLE profiles 
    ADD COLUMN notification_preferences JSONB DEFAULT '{
      "follow": true,
      "like": true,
      "comment": true,
      "reply": true,
      "story_new": true
    }'::jsonb;
    
    COMMENT ON COLUMN profiles.notification_preferences IS 
      'User notification preferences. Each key (follow, like, comment, reply, story_new) is a boolean indicating if notifications of that type are enabled.';
  END IF;
END $$;

-- Create index for notification preferences queries (optional, for performance)
CREATE INDEX IF NOT EXISTS idx_profiles_notification_preferences 
  ON profiles USING GIN (notification_preferences);

-- Verification queries
-- SELECT column_name, data_type, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'profiles' AND column_name = 'notification_preferences';

