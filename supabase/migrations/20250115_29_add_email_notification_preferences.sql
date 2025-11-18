-- Migration: Add email notification preferences
-- Date: 2025-01-15
-- Description: Adds email notification preferences to notification_preferences JSONB column

DO $$
BEGIN
  -- Update existing notification_preferences to include email preferences
  -- Default: email notifications enabled for all types
  UPDATE profiles
  SET notification_preferences = COALESCE(notification_preferences, '{}'::jsonb) || '{
    "email_follow": true,
    "email_like": true,
    "email_comment": true,
    "email_reply": true,
    "email_story_new": true
  }'::jsonb
  WHERE notification_preferences IS NULL 
     OR NOT (notification_preferences ? 'email_follow');
  
  -- For existing users with notification_preferences, add email preferences if missing
  UPDATE profiles
  SET notification_preferences = notification_preferences || '{
    "email_follow": true,
    "email_like": true,
    "email_comment": true,
    "email_reply": true,
    "email_story_new": true
  }'::jsonb
  WHERE notification_preferences IS NOT NULL
    AND (
      NOT (notification_preferences ? 'email_follow') OR
      NOT (notification_preferences ? 'email_like') OR
      NOT (notification_preferences ? 'email_comment') OR
      NOT (notification_preferences ? 'email_reply') OR
      NOT (notification_preferences ? 'email_story_new')
    );
END $$;

COMMENT ON COLUMN profiles.notification_preferences IS 
  'User notification preferences. Includes in-app and email preferences:
   - follow, like, comment, reply, story_new: in-app notifications (boolean)
   - email_follow, email_like, email_comment, email_reply, email_story_new: email notifications (boolean)';

-- Verification queries
-- SELECT id, username, notification_preferences FROM profiles LIMIT 5;

