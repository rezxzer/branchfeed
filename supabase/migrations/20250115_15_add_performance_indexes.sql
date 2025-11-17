-- Performance Optimization: Add indexes for frequently used queries
-- This migration adds composite indexes and single-column indexes for better query performance

-- ============================================
-- Stories Table Indexes
-- ============================================

-- Composite index for feed queries: WHERE is_root = true ORDER BY created_at DESC
-- This is the most common query pattern for the feed page
CREATE INDEX IF NOT EXISTS idx_stories_is_root_created_at 
  ON public.stories(is_root, created_at DESC) 
  WHERE is_root = true;

-- Index for popular stories queries: ORDER BY views_count DESC
-- Used in analytics and popular stories sections
CREATE INDEX IF NOT EXISTS idx_stories_views_count 
  ON public.stories(views_count DESC);

-- Index for author's stories queries: WHERE author_id = ? ORDER BY created_at DESC
-- Used in profile pages to show user's stories
CREATE INDEX IF NOT EXISTS idx_stories_author_created 
  ON public.stories(author_id, created_at DESC);

-- ============================================
-- Comments Table Indexes
-- ============================================

-- Composite index for comments queries: WHERE story_id = ? ORDER BY created_at DESC
-- This is more efficient than separate indexes for story_id and created_at
-- Replaces the need for idx_comments_story_id when ordering by created_at
CREATE INDEX IF NOT EXISTS idx_comments_story_created 
  ON public.comments(story_id, created_at DESC);

-- Index for user's comments queries: WHERE user_id = ? ORDER BY created_at DESC
-- Used in profile pages to show user's comments
CREATE INDEX IF NOT EXISTS idx_comments_user_created 
  ON public.comments(user_id, created_at DESC);

-- ============================================
-- Profiles Table Indexes
-- ============================================

-- Index for active users queries: WHERE updated_at >= ? 
-- Used in admin analytics to find active users in last 24h/7d/30d
CREATE INDEX IF NOT EXISTS idx_profiles_updated_at 
  ON public.profiles(updated_at DESC);

-- ============================================
-- User Story Progress Table Indexes
-- ============================================

-- Composite index for completion rate queries: WHERE story_id = ? AND completed = true
-- Used in analytics to calculate story completion rates
CREATE INDEX IF NOT EXISTS idx_user_story_progress_story_completed 
  ON public.user_story_progress(story_id, completed) 
  WHERE completed = true;

-- Index for user's progress queries: WHERE user_id = ? ORDER BY updated_at DESC
-- Used in profile pages to show user's story progress
CREATE INDEX IF NOT EXISTS idx_user_story_progress_user_updated 
  ON public.user_story_progress(user_id, updated_at DESC);

-- ============================================
-- Story Nodes Table Indexes (if needed)
-- ============================================

-- Composite index for node queries: WHERE story_id = ? AND parent_node_id = ? AND choice_label = ?
-- Used in path navigation to find next node based on choice
CREATE INDEX IF NOT EXISTS idx_story_nodes_story_parent_choice 
  ON public.story_nodes(story_id, parent_node_id, choice_label);

-- Index for depth queries: WHERE story_id = ? ORDER BY depth
-- Used in story tree visualization
CREATE INDEX IF NOT EXISTS idx_story_nodes_story_depth 
  ON public.story_nodes(story_id, depth);

-- ============================================
-- Verification Queries (for documentation)
-- ============================================

-- To verify indexes were created, run:
-- SELECT indexname, indexdef FROM pg_indexes WHERE schemaname = 'public' AND tablename IN ('stories', 'comments', 'profiles', 'user_story_progress', 'story_nodes') ORDER BY tablename, indexname;

