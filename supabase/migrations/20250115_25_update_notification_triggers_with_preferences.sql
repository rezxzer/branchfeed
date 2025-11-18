-- Migration: Update notification triggers to respect user preferences
-- Date: 2025-01-15
-- Description: Updates notification trigger functions to check user notification preferences before creating notifications

-- Helper function to check if notification type is enabled for user
CREATE OR REPLACE FUNCTION is_notification_enabled(user_id UUID, notification_type TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  prefs JSONB;
  enabled BOOLEAN;
BEGIN
  -- Get user's notification preferences
  SELECT notification_preferences INTO prefs
  FROM profiles
  WHERE id = user_id;
  
  -- If preferences don't exist, default to enabled
  IF prefs IS NULL THEN
    RETURN TRUE;
  END IF;
  
  -- Check if specific notification type is enabled
  -- Default to true if key doesn't exist
  enabled := COALESCE((prefs->>notification_type)::boolean, TRUE);
  
  RETURN enabled;
END;
$$ LANGUAGE plpgsql;

-- Function to create follow notification (updated with preferences check)
CREATE OR REPLACE FUNCTION create_follow_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Don't notify if user follows themselves
  IF NEW.follower_id = NEW.following_id THEN
    RETURN NEW;
  END IF;
  
  -- Check if follow notifications are enabled for the user being followed
  IF NOT is_notification_enabled(NEW.following_id, 'follow') THEN
    RETURN NEW;
  END IF;

  INSERT INTO notifications (user_id, type, actor_id, target_id, target_type, content)
  VALUES (
    NEW.following_id, -- User being followed
    'follow',
    NEW.follower_id, -- User who followed
    NULL,
    NULL,
    NULL
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to create like notification (updated with preferences check)
CREATE OR REPLACE FUNCTION create_like_notification()
RETURNS TRIGGER AS $$
DECLARE
  story_author_id UUID;
BEGIN
  -- Get story author
  SELECT author_id INTO story_author_id
  FROM stories
  WHERE id = NEW.story_id;

  -- Don't notify if user likes their own story
  IF story_author_id = NEW.user_id THEN
    RETURN NEW;
  END IF;
  
  -- Check if like notifications are enabled for the story author
  IF NOT is_notification_enabled(story_author_id, 'like') THEN
    RETURN NEW;
  END IF;

  INSERT INTO notifications (user_id, type, actor_id, target_id, target_type, content)
  VALUES (
    story_author_id, -- Story author
    'like',
    NEW.user_id, -- User who liked
    NEW.story_id,
    'story',
    NULL
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to create comment notification (updated with preferences check)
CREATE OR REPLACE FUNCTION create_comment_notification()
RETURNS TRIGGER AS $$
DECLARE
  story_author_id UUID;
  parent_comment_user_id UUID;
BEGIN
  -- Get story author
  SELECT author_id INTO story_author_id
  FROM stories
  WHERE id = NEW.story_id;

  -- If it's a reply, notify parent comment author
  IF NEW.parent_comment_id IS NOT NULL THEN
    SELECT user_id INTO parent_comment_user_id
    FROM comments
    WHERE id = NEW.parent_comment_id;

    -- Don't notify if replying to own comment
    IF parent_comment_user_id != NEW.user_id THEN
      -- Check if reply notifications are enabled for parent comment author
      IF is_notification_enabled(parent_comment_user_id, 'reply') THEN
        INSERT INTO notifications (user_id, type, actor_id, target_id, target_type, content)
        VALUES (
          parent_comment_user_id,
          'reply',
          NEW.user_id,
          NEW.id,
          'comment',
          NULL
        );
      END IF;
    END IF;
  END IF;

  -- Notify story author (if not own story and not already notified as reply)
  IF story_author_id != NEW.user_id AND NEW.parent_comment_id IS NULL THEN
    -- Check if comment notifications are enabled for story author
    IF is_notification_enabled(story_author_id, 'comment') THEN
      INSERT INTO notifications (user_id, type, actor_id, target_id, target_type, content)
      VALUES (
        story_author_id,
        'comment',
        NEW.user_id,
        NEW.story_id,
        'story',
        NULL
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to create new story notification for followers (updated with preferences check)
CREATE OR REPLACE FUNCTION create_story_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Only notify for root stories
  IF NOT NEW.is_root THEN
    RETURN NEW;
  END IF;

  -- Notify all followers who have story_new notifications enabled
  INSERT INTO notifications (user_id, type, actor_id, target_id, target_type, content)
  SELECT
    f.follower_id,
    'story_new',
    NEW.author_id,
    NEW.id,
    'story',
    NULL
  FROM followers f
  WHERE f.following_id = NEW.author_id
    AND is_notification_enabled(f.follower_id, 'story_new') = TRUE;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Verification queries
-- SELECT proname, prosrc 
-- FROM pg_proc 
-- WHERE proname LIKE '%notification%';

