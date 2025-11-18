-- Migration: Add story collections system
-- Date: 2025-01-15
-- Description: Creates collections table and collection_stories junction table for organizing stories into playlists/collections

-- Create collections table
CREATE TABLE IF NOT EXISTS collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  cover_image_url TEXT,
  stories_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT fk_collections_user FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
);

COMMENT ON TABLE collections IS 'Collections/playlists created by users to organize stories. Can be public or private.';
COMMENT ON COLUMN collections.name IS 'Collection name (e.g., "My Favorite Adventures", "Sci-Fi Stories").';
COMMENT ON COLUMN collections.is_public IS 'Whether the collection is visible to other users (true) or private (false).';
COMMENT ON COLUMN collections.stories_count IS 'Cached count of stories in this collection (updated via trigger).';

-- Create collection_stories junction table
CREATE TABLE IF NOT EXISTS collection_stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID NOT NULL,
  story_id UUID NOT NULL,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT fk_collection_stories_collection FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE,
  CONSTRAINT fk_collection_stories_story FOREIGN KEY (story_id) REFERENCES stories(id) ON DELETE CASCADE,
  CONSTRAINT uq_collection_stories_collection_story UNIQUE (collection_id, story_id)
);

COMMENT ON TABLE collection_stories IS 'Junction table linking collections to stories. Many-to-many relationship.';
COMMENT ON COLUMN collection_stories.position IS 'Order/position of story within collection (for custom ordering).';

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_collections_user_id ON collections(user_id);
CREATE INDEX IF NOT EXISTS idx_collections_is_public ON collections(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_collections_user_created ON collections(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_collection_stories_collection_id ON collection_stories(collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_stories_story_id ON collection_stories(story_id);
CREATE INDEX IF NOT EXISTS idx_collection_stories_position ON collection_stories(collection_id, position);

-- Enable RLS
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_stories ENABLE ROW LEVEL SECURITY;

-- RLS Policies for collections
DO $$
BEGIN
  -- Anyone can read public collections
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'collections' AND policyname = 'Anyone can read public collections') THEN
    CREATE POLICY "Anyone can read public collections" ON collections FOR SELECT TO authenticated, anon USING (is_public = true);
  END IF;

  -- Users can read their own collections (public or private)
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'collections' AND policyname = 'Users can read own collections') THEN
    CREATE POLICY "Users can read own collections" ON collections FOR SELECT TO authenticated USING (auth.uid() = user_id);
  END IF;

  -- Users can create their own collections
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'collections' AND policyname = 'Users can create own collections') THEN
    CREATE POLICY "Users can create own collections" ON collections FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
  END IF;

  -- Users can update their own collections
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'collections' AND policyname = 'Users can update own collections') THEN
    CREATE POLICY "Users can update own collections" ON collections FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;

  -- Users can delete their own collections
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'collections' AND policyname = 'Users can delete own collections') THEN
    CREATE POLICY "Users can delete own collections" ON collections FOR DELETE TO authenticated USING (auth.uid() = user_id);
  END IF;

  -- Admins can manage all collections
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'collections' AND policyname = 'Admins can manage all collections') THEN
    CREATE POLICY "Admins can manage all collections" ON collections FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM admin_roles WHERE user_id = auth.uid() AND role = 'admin')) WITH CHECK (EXISTS (SELECT 1 FROM admin_roles WHERE user_id = auth.uid() AND role = 'admin'));
  END IF;
END $$;

-- RLS Policies for collection_stories
DO $$
BEGIN
  -- Anyone can read stories in public collections
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'collection_stories' AND policyname = 'Anyone can read stories in public collections') THEN
    CREATE POLICY "Anyone can read stories in public collections" ON collection_stories FOR SELECT TO authenticated, anon USING (EXISTS (SELECT 1 FROM collections WHERE id = collection_stories.collection_id AND is_public = true));
  END IF;

  -- Users can read stories in their own collections
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'collection_stories' AND policyname = 'Users can read stories in own collections') THEN
    CREATE POLICY "Users can read stories in own collections" ON collection_stories FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM collections WHERE id = collection_stories.collection_id AND user_id = auth.uid()));
  END IF;

  -- Users can manage stories in their own collections
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'collection_stories' AND policyname = 'Users can manage stories in own collections') THEN
    CREATE POLICY "Users can manage stories in own collections" ON collection_stories FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM collections WHERE id = collection_stories.collection_id AND user_id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM collections WHERE id = collection_stories.collection_id AND user_id = auth.uid()));
  END IF;

  -- Admins can manage all collection stories
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'collection_stories' AND policyname = 'Admins can manage all collection stories') THEN
    CREATE POLICY "Admins can manage all collection stories" ON collection_stories FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM admin_roles WHERE user_id = auth.uid() AND role = 'admin')) WITH CHECK (EXISTS (SELECT 1 FROM admin_roles WHERE user_id = auth.uid() AND role = 'admin'));
  END IF;
END $$;

-- Function to update collections.updated_at
CREATE OR REPLACE FUNCTION update_collections_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update collections.updated_at
DROP TRIGGER IF EXISTS trigger_collections_updated_at ON collections;
CREATE TRIGGER trigger_collections_updated_at
  BEFORE UPDATE ON collections
  FOR EACH ROW
  EXECUTE FUNCTION update_collections_updated_at();

-- Function to update collections.stories_count
CREATE OR REPLACE FUNCTION update_collection_stories_count() RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE collections SET stories_count = stories_count + 1 WHERE id = NEW.collection_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE collections SET stories_count = GREATEST(stories_count - 1, 0) WHERE id = OLD.collection_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update stories_count when stories are added/removed
DROP TRIGGER IF EXISTS trigger_update_collection_stories_count ON collection_stories;
CREATE TRIGGER trigger_update_collection_stories_count
  AFTER INSERT OR DELETE ON collection_stories
  FOR EACH ROW
  EXECUTE FUNCTION update_collection_stories_count();

-- Initial stories_count update for existing collections
UPDATE collections SET stories_count = (
  SELECT COUNT(*) FROM collection_stories WHERE collection_id = collections.id
);

