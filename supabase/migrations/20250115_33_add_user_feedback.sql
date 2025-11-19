-- Migration: Add user feedback system
-- Date: 2025-01-15
-- Description: Creates user_feedback table for collecting and analyzing user feedback

-- Create user_feedback table
CREATE TABLE IF NOT EXISTS user_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('bug', 'feature', 'improvement', 'general', 'other')),
  category TEXT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'in_progress', 'resolved', 'dismissed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  admin_notes TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT fk_user_feedback_user FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE SET NULL
);

COMMENT ON TABLE user_feedback IS 'User feedback submissions for bug reports, feature requests, and general feedback.';
COMMENT ON COLUMN user_feedback.user_id IS 'User who submitted feedback (nullable for anonymous feedback).';
COMMENT ON COLUMN user_feedback.feedback_type IS 'Type of feedback: bug, feature, improvement, general, other.';
COMMENT ON COLUMN user_feedback.category IS 'Optional category (e.g., "feed", "story", "profile", "search").';
COMMENT ON COLUMN user_feedback.title IS 'Brief title/summary of feedback.';
COMMENT ON COLUMN user_feedback.description IS 'Detailed description of feedback.';
COMMENT ON COLUMN user_feedback.rating IS 'User satisfaction rating (1-5 stars, optional).';
COMMENT ON COLUMN user_feedback.status IS 'Feedback status: pending, reviewed, in_progress, resolved, dismissed.';
COMMENT ON COLUMN user_feedback.priority IS 'Priority level: low, medium, high, critical.';
COMMENT ON COLUMN user_feedback.admin_notes IS 'Internal admin notes about this feedback.';
COMMENT ON COLUMN user_feedback.resolved_at IS 'Timestamp when feedback was resolved.';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_feedback_user_id ON user_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_user_feedback_type ON user_feedback(feedback_type);
CREATE INDEX IF NOT EXISTS idx_user_feedback_status ON user_feedback(status);
CREATE INDEX IF NOT EXISTS idx_user_feedback_priority ON user_feedback(priority);
CREATE INDEX IF NOT EXISTS idx_user_feedback_created_at ON user_feedback(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_feedback_category ON user_feedback(category) WHERE category IS NOT NULL;

-- Enable RLS
ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DO $$
BEGIN
  -- Users can read their own feedback
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_feedback' AND policyname = 'Users can read own feedback') THEN
    CREATE POLICY "Users can read own feedback" ON user_feedback FOR SELECT TO authenticated USING (auth.uid() = user_id);
  END IF;

  -- Anyone (authenticated) can create feedback
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_feedback' AND policyname = 'Anyone can create feedback') THEN
    CREATE POLICY "Anyone can create feedback" ON user_feedback FOR INSERT TO authenticated WITH CHECK (auth.uid() = COALESCE(user_id, auth.uid()));
  END IF;

  -- Users can update their own feedback (only if status is pending)
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_feedback' AND policyname = 'Users can update own pending feedback') THEN
    CREATE POLICY "Users can update own pending feedback" ON user_feedback FOR UPDATE TO authenticated 
      USING (auth.uid() = user_id AND status = 'pending')
      WITH CHECK (auth.uid() = user_id AND status = 'pending');
  END IF;

  -- Admins can read all feedback
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_feedback' AND policyname = 'Admins can read all feedback') THEN
    CREATE POLICY "Admins can read all feedback" ON user_feedback FOR SELECT TO authenticated 
      USING (is_admin(auth.uid()));
  END IF;

  -- Admins can update all feedback
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_feedback' AND policyname = 'Admins can update all feedback') THEN
    CREATE POLICY "Admins can update all feedback" ON user_feedback FOR UPDATE TO authenticated 
      USING (is_admin(auth.uid()))
      WITH CHECK (is_admin(auth.uid()));
  END IF;

  -- Admins can delete feedback
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_feedback' AND policyname = 'Admins can delete feedback') THEN
    CREATE POLICY "Admins can delete feedback" ON user_feedback FOR DELETE TO authenticated 
      USING (is_admin(auth.uid()));
  END IF;
END $$;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_feedback_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_feedback_updated_at
  BEFORE UPDATE ON user_feedback
  FOR EACH ROW
  EXECUTE FUNCTION update_user_feedback_updated_at();

-- Verification queries
-- SELECT * FROM user_feedback LIMIT 5;
-- SELECT feedback_type, COUNT(*) FROM user_feedback GROUP BY feedback_type;
-- SELECT status, COUNT(*) FROM user_feedback GROUP BY status;

