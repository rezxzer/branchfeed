-- Migration: Add triggers for auto-creating notifications
-- Date: 2025-01-15
-- Description: Creates triggers to automatically create notifications for follows, likes, comments, etc.

-- Function to create follow notification
CREATE OR REPLACE FUNCTION create_follow_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Don't notify if user follows themselves
  IF NEW.follower_id = NEW.following_id THEN
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

-- Trigger for follow notifications
DROP TRIGGER IF EXISTS trigger_follow_notification ON followers;
CREATE TRIGGER trigger_follow_notification
  AFTER INSERT ON followers
  FOR EACH ROW
  EXECUTE FUNCTION create_follow_notification();

-- Function to create like notification
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

-- Trigger for like notifications
DROP TRIGGER IF EXISTS trigger_like_notification ON likes;
CREATE TRIGGER trigger_like_notification
  AFTER INSERT ON likes
  FOR EACH ROW
  EXECUTE FUNCTION create_like_notification();

-- Function to create comment notification
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

  -- Notify story author (if not own story and not already notified as reply)
  IF story_author_id != NEW.user_id AND NEW.parent_comment_id IS NULL THEN
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

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for comment notifications
DROP TRIGGER IF EXISTS trigger_comment_notification ON comments;
CREATE TRIGGER trigger_comment_notification
  AFTER INSERT ON comments
  FOR EACH ROW
  EXECUTE FUNCTION create_comment_notification();

-- Function to create new story notification for followers
CREATE OR REPLACE FUNCTION create_story_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Only notify for root stories
  IF NOT NEW.is_root THEN
    RETURN NEW;
  END IF;

  -- Notify all followers
  INSERT INTO notifications (user_id, type, actor_id, target_id, target_type, content)
  SELECT
    f.follower_id,
    'story_new',
    NEW.author_id,
    NEW.id,
    'story',
    NULL
  FROM followers f
  WHERE f.following_id = NEW.author_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for new story notifications
DROP TRIGGER IF EXISTS trigger_story_notification ON stories;
CREATE TRIGGER trigger_story_notification
  AFTER INSERT ON stories
  FOR EACH ROW
  EXECUTE FUNCTION create_story_notification();

-- Verification queries
-- SELECT tgname, tgtype, tgenabled 
-- FROM pg_trigger 
-- WHERE tgname LIKE '%notification%';

-- SELECT proname, prosrc 
-- FROM pg_proc 
-- WHERE proname LIKE '%notification%';

