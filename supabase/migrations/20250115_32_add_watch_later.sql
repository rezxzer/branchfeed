-- Migration: Add watch later queue system
-- Date: 2025-01-15
-- Description: Creates watch_later table for saving videos for later viewing

-- Create watch_later table
CREATE TABLE IF NOT EXISTS watch_later (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  story_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT fk_watch_later_user FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE,
  CONSTRAINT fk_watch_later_story FOREIGN KEY (story_id) REFERENCES stories(id) ON DELETE CASCADE,
  CONSTRAINT uq_watch_later_user_story UNIQUE (user_id, story_id)
);

COMMENT ON TABLE watch_later IS 'Queue of videos saved by users for later viewing. Only videos (not images) should be saved.';
COMMENT ON COLUMN watch_later.user_id IS 'User who saved the video.';
COMMENT ON COLUMN watch_later.story_id IS 'Story (video) saved for later viewing.';
COMMENT ON COLUMN watch_later.created_at IS 'When the video was added to watch later queue.';
COMMENT ON COLUMN watch_later.updated_at IS 'Last update timestamp (for sorting).';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_watch_later_user_id ON watch_later(user_id);
CREATE INDEX IF NOT EXISTS idx_watch_later_story_id ON watch_later(story_id);
CREATE INDEX IF NOT EXISTS idx_watch_later_user_created ON watch_later(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_watch_later_user_updated ON watch_later(user_id, updated_at DESC);

-- Enable RLS
ALTER TABLE watch_later ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DO $$
BEGIN
  -- Users can read their own watch later queue
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'watch_later' AND policyname = 'Users can read own watch later') THEN
    CREATE POLICY "Users can read own watch later" ON watch_later FOR SELECT TO authenticated USING (auth.uid() = user_id);
  END IF;

  -- Users can add videos to their watch later queue
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'watch_later' AND policyname = 'Users can add to own watch later') THEN
    CREATE POLICY "Users can add to own watch later" ON watch_later FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
  END IF;

  -- Users can remove videos from their watch later queue
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'watch_later' AND policyname = 'Users can remove from own watch later') THEN
    CREATE POLICY "Users can remove from own watch later" ON watch_later FOR DELETE TO authenticated USING (auth.uid() = user_id);
  END IF;

  -- Users can update their own watch later queue (for reordering, etc.)
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'watch_later' AND policyname = 'Users can update own watch later') THEN
    CREATE POLICY "Users can update own watch later" ON watch_later FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END
$$;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_watch_later_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS trigger_watch_later_updated_at ON watch_later;
CREATE TRIGGER trigger_watch_later_updated_at
  BEFORE UPDATE ON watch_later
  FOR EACH ROW
  EXECUTE FUNCTION update_watch_later_updated_at();

-- Verification queries
-- SELECT * FROM watch_later LIMIT 10;
-- SELECT policyname, cmd, qual, with_check FROM pg_policies WHERE tablename = 'watch_later';

