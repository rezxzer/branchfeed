-- Migration: Add story tags system
-- Date: 2025-01-15
-- Description: Creates tags table and story_tags junction table for categorizing stories

-- Create tags table
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE tags IS 'Tags for categorizing stories. Tags can be used for filtering and discovery.';

COMMENT ON COLUMN tags.name IS 'Tag name (e.g., Adventure, Romance, Mystery).';

COMMENT ON COLUMN tags.slug IS 'URL-friendly version of tag name (e.g., adventure, romance, mystery).';

COMMENT ON COLUMN tags.color IS 'Optional hex color code for tag display (e.g., #667eea).';

-- Create story_tags junction table
CREATE TABLE IF NOT EXISTS story_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL,
  tag_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT fk_story_tags_story FOREIGN KEY (story_id) REFERENCES stories(id) ON DELETE CASCADE,
  CONSTRAINT fk_story_tags_tag FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
  CONSTRAINT uq_story_tags_story_tag UNIQUE (story_id, tag_id)
);

COMMENT ON TABLE story_tags IS 'Junction table linking stories to tags. Many-to-many relationship.';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);
CREATE INDEX IF NOT EXISTS idx_tags_slug ON tags(slug);
CREATE INDEX IF NOT EXISTS idx_story_tags_story_id ON story_tags(story_id);
CREATE INDEX IF NOT EXISTS idx_story_tags_tag_id ON story_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_story_tags_created_at ON story_tags(created_at DESC);

-- Enable RLS
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_tags ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DO $$
BEGIN
  -- Tags: Everyone can read tags
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'tags' 
    AND policyname = 'Anyone can read tags'
  ) THEN
    CREATE POLICY "Anyone can read tags"
      ON tags
      FOR SELECT
      TO authenticated, anon
      USING (true);
  END IF;

  -- Tags: Only admins can create/update/delete tags
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'tags' 
    AND policyname = 'Admins can manage tags'
  ) THEN
    CREATE POLICY "Admins can manage tags"
      ON tags
      FOR ALL
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM admin_roles
          WHERE user_id = auth.uid()
          AND role = 'admin'
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM admin_roles
          WHERE user_id = auth.uid()
          AND role = 'admin'
        )
      );
  END IF;

  -- Story Tags: Everyone can read story tags
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'story_tags' 
    AND policyname = 'Anyone can read story tags'
  ) THEN
    CREATE POLICY "Anyone can read story tags"
      ON story_tags
      FOR SELECT
      TO authenticated, anon
      USING (true);
  END IF;

  -- Story Tags: Story authors can add/remove tags from their stories
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'story_tags' 
    AND policyname = 'Story authors can manage their story tags'
  ) THEN
    CREATE POLICY "Story authors can manage their story tags"
      ON story_tags
      FOR ALL
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM stories
          WHERE id = story_tags.story_id
          AND author_id = auth.uid()
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM stories
          WHERE id = story_tags.story_id
          AND author_id = auth.uid()
        )
      );
  END IF;

  -- Story Tags: Admins can manage all story tags
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'story_tags' 
    AND policyname = 'Admins can manage all story tags'
  ) THEN
    CREATE POLICY "Admins can manage all story tags"
      ON story_tags
      FOR ALL
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM admin_roles
          WHERE user_id = auth.uid()
          AND role = 'admin'
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM admin_roles
          WHERE user_id = auth.uid()
          AND role = 'admin'
        )
      );
  END IF;
END $$;

-- Function to generate slug from tag name
CREATE OR REPLACE FUNCTION generate_tag_slug(tag_name TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN lower(regexp_replace(regexp_replace(tag_name, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_tags_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS trigger_tags_updated_at ON tags;
CREATE TRIGGER trigger_tags_updated_at
  BEFORE UPDATE ON tags
  FOR EACH ROW
  EXECUTE FUNCTION update_tags_updated_at();

-- Function to automatically generate slug when tag is created/updated
CREATE OR REPLACE FUNCTION auto_generate_tag_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug = generate_tag_slug(NEW.name);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-generating slug
DROP TRIGGER IF EXISTS trigger_auto_generate_tag_slug ON tags;
CREATE TRIGGER trigger_auto_generate_tag_slug
  BEFORE INSERT OR UPDATE ON tags
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_tag_slug();

-- Insert some default tags
INSERT INTO tags (name, description, color) VALUES
  ('Adventure', 'Stories with exciting journeys and quests', '#667eea'),
  ('Romance', 'Love stories and romantic narratives', '#f093fb'),
  ('Mystery', 'Mysterious and suspenseful stories', '#4facfe'),
  ('Fantasy', 'Fantasy worlds and magical stories', '#43e97b'),
  ('Sci-Fi', 'Science fiction and futuristic stories', '#fa709a'),
  ('Horror', 'Scary and thrilling stories', '#ff6b6b'),
  ('Comedy', 'Funny and humorous stories', '#feca57'),
  ('Drama', 'Dramatic and emotional stories', '#48dbfb')
ON CONFLICT (name) DO NOTHING;
