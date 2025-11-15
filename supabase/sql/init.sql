-- BranchFeed Database Initialization
-- Phase 1: Foundation - Essential Tables Only
-- This file should be executed in Supabase SQL Editor

-- ============================================
-- 1. PROFILES TABLE
-- ============================================

-- Drop table if exists (for idempotent migration)
DROP TABLE IF EXISTS profiles CASCADE;

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE,
  avatar_url TEXT,
  bio TEXT,
  language_preference TEXT DEFAULT 'en' CHECK (language_preference IN ('ka', 'en', 'de', 'ru', 'fr')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. STORIES TABLE (Root stories - branching narratives)
-- ============================================

DROP TABLE IF EXISTS stories CASCADE;

CREATE TABLE stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  media_url TEXT,
  media_type TEXT CHECK (media_type IN ('image', 'video')),
  is_root BOOLEAN DEFAULT TRUE,
  max_depth INTEGER DEFAULT 5 CHECK (max_depth >= 1 AND max_depth <= 10),
  branches_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. STORY_NODES TABLE (Branch points)
-- ============================================

DROP TABLE IF EXISTS story_nodes CASCADE;

CREATE TABLE story_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  parent_node_id UUID REFERENCES story_nodes(id) ON DELETE CASCADE,
  choice_label TEXT CHECK (choice_label IN ('A', 'B')) NOT NULL,
  content TEXT,
  media_url TEXT,
  media_type TEXT CHECK (media_type IN ('image', 'video')),
  depth INTEGER NOT NULL CHECK (depth >= 0),
  choice_a_label TEXT DEFAULT 'A',
  choice_a_content TEXT,
  choice_b_label TEXT DEFAULT 'B',
  choice_b_content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. USER_STORY_PROGRESS TABLE (Path tracking)
-- ============================================

DROP TABLE IF EXISTS user_story_progress CASCADE;

CREATE TABLE user_story_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  path TEXT[] DEFAULT ARRAY[]::TEXT[] CHECK (array_length(path, 1) <= 10),
  current_depth INTEGER DEFAULT 0 CHECK (current_depth >= 0),
  last_node_id UUID REFERENCES story_nodes(id) ON DELETE SET NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, story_id)
);

-- ============================================
-- 5. LIKES TABLE
-- ============================================

DROP TABLE IF EXISTS likes CASCADE;

CREATE TABLE likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT likes_story_user_unique UNIQUE(story_id, user_id),
  CONSTRAINT likes_story_id_not_null CHECK (story_id IS NOT NULL)
);

-- ============================================
-- 6. COMMENTS TABLE (Future Phase 2)
-- ============================================

DROP TABLE IF EXISTS comments CASCADE;

CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  node_id UUID REFERENCES story_nodes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT comments_story_or_node CHECK (story_id IS NOT NULL OR node_id IS NOT NULL)
);

-- ============================================
-- 7. INDEXES (Performance)
-- ============================================

CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

CREATE INDEX IF NOT EXISTS idx_stories_author_id ON stories(author_id);
CREATE INDEX IF NOT EXISTS idx_stories_is_root ON stories(is_root) WHERE is_root = TRUE;
CREATE INDEX IF NOT EXISTS idx_stories_created_at ON stories(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_story_nodes_story_id ON story_nodes(story_id);
CREATE INDEX IF NOT EXISTS idx_story_nodes_parent ON story_nodes(story_id, parent_node_id);
CREATE INDEX IF NOT EXISTS idx_story_nodes_choice_label ON story_nodes(story_id, parent_node_id, choice_label);

CREATE INDEX IF NOT EXISTS idx_user_story_progress_user_story ON user_story_progress(user_id, story_id);
CREATE INDEX IF NOT EXISTS idx_user_story_progress_story_id ON user_story_progress(story_id);

CREATE INDEX IF NOT EXISTS idx_likes_story_id ON likes(story_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_story_user ON likes(story_id, user_id);

CREATE INDEX IF NOT EXISTS idx_comments_story_id ON comments(story_id);
CREATE INDEX IF NOT EXISTS idx_comments_node_id ON comments(node_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);

-- ============================================
-- 8. TRIGGERS (Like Count Updates)
-- ============================================

-- Function to update story likes_count
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_story_likes_count') THEN
    DROP FUNCTION update_story_likes_count() CASCADE;
  END IF;
END $$;

CREATE OR REPLACE FUNCTION update_story_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE stories
    SET likes_count = likes_count + 1
    WHERE id = NEW.story_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE stories
    SET likes_count = GREATEST(likes_count - 1, 0)
    WHERE id = OLD.story_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for likes table
DROP TRIGGER IF EXISTS likes_count_trigger ON likes;
CREATE TRIGGER likes_count_trigger
  AFTER INSERT OR DELETE ON likes
  FOR EACH ROW
  EXECUTE FUNCTION update_story_likes_count();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_stories_updated_at ON stories;
CREATE TRIGGER update_stories_updated_at
  BEFORE UPDATE ON stories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_story_progress_updated_at ON user_story_progress;
CREATE TRIGGER update_user_story_progress_updated_at
  BEFORE UPDATE ON user_story_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_story_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DO $$
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
  DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
  DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

  -- CREATE policies
  CREATE POLICY "Users can view all profiles"
    ON profiles FOR SELECT
    USING (auth.role() = 'authenticated');

  CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

  CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);
END $$;

-- Stories policies
DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can view all published stories" ON stories;
  DROP POLICY IF EXISTS "Users can create stories" ON stories;
  DROP POLICY IF EXISTS "Authors can update own stories" ON stories;
  DROP POLICY IF EXISTS "Authors can delete own stories" ON stories;

  CREATE POLICY "Users can view all published stories"
    ON stories FOR SELECT
    USING (auth.role() = 'authenticated');

  CREATE POLICY "Users can create stories"
    ON stories FOR INSERT
    WITH CHECK (auth.uid() = author_id);

  CREATE POLICY "Authors can update own stories"
    ON stories FOR UPDATE
    USING (auth.uid() = author_id);

  CREATE POLICY "Authors can delete own stories"
    ON stories FOR DELETE
    USING (auth.uid() = author_id);
END $$;

-- Story nodes policies
DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can view all story nodes" ON story_nodes;
  DROP POLICY IF EXISTS "Story authors can insert nodes" ON story_nodes;
  DROP POLICY IF EXISTS "Story authors can update nodes" ON story_nodes;
  DROP POLICY IF EXISTS "Story authors can delete nodes" ON story_nodes;

  CREATE POLICY "Users can view all story nodes"
    ON story_nodes FOR SELECT
    USING (auth.role() = 'authenticated');

  CREATE POLICY "Story authors can insert nodes"
    ON story_nodes FOR INSERT
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM stories
        WHERE stories.id = story_nodes.story_id
        AND stories.author_id = auth.uid()
      )
    );

  CREATE POLICY "Story authors can update nodes"
    ON story_nodes FOR UPDATE
    USING (
      EXISTS (
        SELECT 1 FROM stories
        WHERE stories.id = story_nodes.story_id
        AND stories.author_id = auth.uid()
      )
    );

  CREATE POLICY "Story authors can delete nodes"
    ON story_nodes FOR DELETE
    USING (
      EXISTS (
        SELECT 1 FROM stories
        WHERE stories.id = story_nodes.story_id
        AND stories.author_id = auth.uid()
      )
    );
END $$;

-- User story progress policies
DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can view own progress" ON user_story_progress;
  DROP POLICY IF EXISTS "Users can insert own progress" ON user_story_progress;
  DROP POLICY IF EXISTS "Users can update own progress" ON user_story_progress;

  CREATE POLICY "Users can view own progress"
    ON user_story_progress FOR SELECT
    USING (auth.uid() = user_id);

  CREATE POLICY "Users can insert own progress"
    ON user_story_progress FOR INSERT
    WITH CHECK (auth.uid() = user_id);

  CREATE POLICY "Users can update own progress"
    ON user_story_progress FOR UPDATE
    USING (auth.uid() = user_id);
END $$;

-- Likes policies
DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can view all likes" ON likes;
  DROP POLICY IF EXISTS "Users can like stories" ON likes;
  DROP POLICY IF EXISTS "Users can unlike own likes" ON likes;

  CREATE POLICY "Users can view all likes"
    ON likes FOR SELECT
    USING (auth.role() = 'authenticated');

  CREATE POLICY "Users can like stories"
    ON likes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

  CREATE POLICY "Users can unlike own likes"
    ON likes FOR DELETE
    USING (auth.uid() = user_id);
END $$;

-- Comments policies
DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can view all comments" ON comments;
  DROP POLICY IF EXISTS "Users can create comments" ON comments;
  DROP POLICY IF EXISTS "Users can update own comments" ON comments;
  DROP POLICY IF EXISTS "Users can delete own comments" ON comments;

  CREATE POLICY "Users can view all comments"
    ON comments FOR SELECT
    USING (auth.role() = 'authenticated');

  CREATE POLICY "Users can create comments"
    ON comments FOR INSERT
    WITH CHECK (auth.uid() = user_id);

  CREATE POLICY "Users can update own comments"
    ON comments FOR UPDATE
    USING (auth.uid() = user_id);

  CREATE POLICY "Users can delete own comments"
    ON comments FOR DELETE
    USING (auth.uid() = user_id);
END $$;

-- ============================================
-- 10. STORAGE POLICIES (Supabase Storage)
-- ============================================

-- Note: Storage buckets and policies should be created in Supabase Dashboard
-- or via Supabase Storage API. This is a placeholder comment.

-- Recommended buckets:
-- - avatars (for user avatars)
-- - stories (for story media: images/videos)
-- - story-nodes (for branch node media)

-- Example storage policies (execute in Supabase Dashboard):
-- - Users can upload own avatar
-- - Users can view all avatars
-- - Story authors can upload story media
-- - All authenticated users can view story media

-- ============================================
-- INITIALIZATION COMPLETE
-- ============================================

-- Verify tables were created
SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'stories', 'story_nodes', 'user_story_progress', 'likes', 'comments')
ORDER BY tablename;

