-- ============================================
-- MIGRATION: Add Platform Settings Table
-- ============================================
-- Date: 2025-01-15
-- Description: Platform settings and feature flags storage
-- ============================================

DO $$
BEGIN
  -- Create platform_settings table if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'platform_settings'
  ) THEN
    CREATE TABLE platform_settings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      key TEXT UNIQUE NOT NULL,
      value JSONB NOT NULL DEFAULT '{}'::jsonb,
      description TEXT,
      updated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    COMMENT ON TABLE platform_settings IS 
      'Platform-wide settings and feature flags. Only admins can modify.';
    
    COMMENT ON COLUMN platform_settings.key IS 
      'Setting key (e.g., "maintenance_mode", "feature_comments", "max_story_depth")';
    
    COMMENT ON COLUMN platform_settings.value IS 
      'Setting value as JSON (can be boolean, number, string, or object)';
    
    COMMENT ON COLUMN platform_settings.description IS 
      'Human-readable description of what this setting does';
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_platform_settings_key ON platform_settings(key);

-- Enable RLS
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can view all settings" ON platform_settings;
DROP POLICY IF EXISTS "Admins can manage settings" ON platform_settings;

-- RLS Policies
CREATE POLICY "Admins can view all settings"
  ON platform_settings FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage settings"
  ON platform_settings FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()) AND has_admin_permission(auth.uid(), 'canAccessSettings'))
  WITH CHECK (is_admin(auth.uid()) AND has_admin_permission(auth.uid(), 'canAccessSettings'));

-- Insert default settings
INSERT INTO platform_settings (key, value, description)
VALUES 
  ('maintenance_mode', '{"enabled": false, "message": "Platform is under maintenance"}', 'Enable/disable maintenance mode'),
  ('feature_comments', '{"enabled": true}', 'Enable/disable comments feature'),
  ('feature_stories', '{"enabled": true}', 'Enable/disable story creation'),
  ('max_story_depth', '{"value": 5}', 'Maximum depth for branching stories'),
  ('max_stories_per_user', '{"value": 10}', 'Maximum stories a user can create per day'),
  ('site_name', '{"value": "BranchFeed"}', 'Platform name'),
  ('site_description', '{"value": "Interactive branching stories platform"}', 'Platform description')
ON CONFLICT (key) DO NOTHING;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS trigger_platform_settings_updated_at ON platform_settings;
CREATE TRIGGER trigger_platform_settings_updated_at
  BEFORE UPDATE ON platform_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these queries in Supabase SQL Editor to verify:
--
-- 1. Check table exists:
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- AND table_name = 'platform_settings';
--
-- 2. Check default settings:
-- SELECT key, value, description FROM platform_settings;
--
-- 3. Check RLS is enabled:
-- SELECT tablename, rowsecurity FROM pg_tables 
-- WHERE schemaname = 'public' 
-- AND tablename = 'platform_settings';

