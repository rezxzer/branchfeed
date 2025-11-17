-- Migration: Add comment likes/reactions
-- Date: 2025-01-15
-- Description: Creates comment_likes table and adds likes_count to comments table

-- Create comment_likes table
CREATE TABLE IF NOT EXISTS comment_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Foreign key to comments table
  CONSTRAINT comment_likes_comment_id_fkey 
    FOREIGN KEY (comment_id) 
    REFERENCES comments(id) 
    ON DELETE CASCADE,
  
  -- Foreign key to profiles table
  CONSTRAINT comment_likes_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES profiles(id) 
    ON DELETE CASCADE,
  
  -- Unique constraint: one like per user per comment
  CONSTRAINT uq_comment_likes_comment_user 
    UNIQUE (comment_id, user_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment_id ON comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_user_id ON comment_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment_user ON comment_likes(comment_id, user_id);

-- Add likes_count column to comments table
ALTER TABLE comments 
ADD COLUMN IF NOT EXISTS likes_count INTEGER NOT NULL DEFAULT 0;

-- Create trigger function to update comment likes_count
CREATE OR REPLACE FUNCTION update_comment_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment likes_count when a like is added
    UPDATE comments
    SET likes_count = likes_count + 1
    WHERE id = NEW.comment_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement likes_count when a like is removed
    UPDATE comments
    SET likes_count = GREATEST(likes_count - 1, 0)
    WHERE id = OLD.comment_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for comment likes count
DROP TRIGGER IF EXISTS tr_comment_likes_count ON comment_likes;
CREATE TRIGGER tr_comment_likes_count
  AFTER INSERT OR DELETE ON comment_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_comment_likes_count();

-- Backfill likes_count to ensure correctness
UPDATE comments c
SET likes_count = COALESCE(sub.cnt, 0)
FROM (
  SELECT comment_id, COUNT(*)::INTEGER AS cnt
  FROM comment_likes
  GROUP BY comment_id
) sub
WHERE c.id = sub.comment_id;

-- RLS Policies
DO $$
BEGIN
  -- Enable RLS
  ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;

  -- Public read: Anyone can read comment likes (for like counts)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'comment_likes' 
    AND policyname = 'Public read comment likes'
  ) THEN
    CREATE POLICY "Public read comment likes"
      ON comment_likes
      FOR SELECT
      USING (true);
  END IF;

  -- Authenticated insert: Authenticated users can like comments
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'comment_likes' 
    AND policyname = 'Authenticated insert comment likes'
  ) THEN
    CREATE POLICY "Authenticated insert comment likes"
      ON comment_likes
      FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;

  -- Owner delete: Users can unlike (delete their own likes)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'comment_likes' 
    AND policyname = 'Owner delete comment likes'
  ) THEN
    CREATE POLICY "Owner delete comment likes"
      ON comment_likes
      FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Verification queries
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'comment_likes';

-- SELECT indexname, indexdef 
-- FROM pg_indexes 
-- WHERE tablename = 'comment_likes';

-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'comments' AND column_name = 'likes_count';

