-- ============================================
-- MIGRATION: Add Admin System
-- ============================================
-- Date: 2025-01-15
-- Description: Creates admin system with roles, audit logs, and content reports.
-- Includes admin helper functions and RLS policies.
-- ============================================

DO $$
BEGIN
  -- Create admin_roles table if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'admin_roles'
  ) THEN
    CREATE TABLE admin_roles (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL UNIQUE,
      role TEXT NOT NULL CHECK (role IN ('super_admin', 'admin', 'moderator', 'support')),
      permissions JSONB DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      
      -- Foreign key to profiles table
      CONSTRAINT fk_admin_roles_user 
        FOREIGN KEY (user_id) 
        REFERENCES profiles(id) 
        ON DELETE CASCADE
    );

    -- Add comments for documentation
    COMMENT ON TABLE admin_roles IS 
      'Stores admin roles and permissions for users. Roles: super_admin, admin, moderator, support.';
    
    COMMENT ON COLUMN admin_roles.user_id IS 
      'Reference to the user profile who has admin role.';
    
    COMMENT ON COLUMN admin_roles.role IS 
      'Admin role level: super_admin (full access), admin (user/content management), moderator (content only), support (view only).';
    
    COMMENT ON COLUMN admin_roles.permissions IS 
      'Custom permissions override as JSONB. Can override default role permissions.';
  END IF;

  -- Create admin_audit_logs table if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'admin_audit_logs'
  ) THEN
    CREATE TABLE admin_audit_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      admin_id UUID NOT NULL,
      action TEXT NOT NULL,
      target_type TEXT,
      target_id UUID,
      details JSONB DEFAULT '{}'::jsonb,
      ip_address TEXT,
      user_agent TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      
      -- Foreign key to profiles table
      CONSTRAINT fk_admin_audit_logs_admin 
        FOREIGN KEY (admin_id) 
        REFERENCES profiles(id) 
        ON DELETE CASCADE
    );

    -- Add comments for documentation
    COMMENT ON TABLE admin_audit_logs IS 
      'Audit log for all admin actions. Records who did what, when, and why.';
    
    COMMENT ON COLUMN admin_audit_logs.action IS 
      'Action type: user_banned, content_deleted, role_assigned, role_removed, etc.';
    
    COMMENT ON COLUMN admin_audit_logs.target_type IS 
      'Type of target: user, story, post, comment, etc.';
    
    COMMENT ON COLUMN admin_audit_logs.target_id IS 
      'ID of the target (user_id, story_id, etc.).';
    
    COMMENT ON COLUMN admin_audit_logs.details IS 
      'Additional action details as JSONB.';
  END IF;

  -- Create content_reports table if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'content_reports'
  ) THEN
    CREATE TABLE content_reports (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      reporter_id UUID NOT NULL,
      content_type TEXT NOT NULL CHECK (content_type IN ('story', 'post', 'comment')),
      content_id UUID NOT NULL,
      reason TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
      admin_id UUID,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      resolved_at TIMESTAMPTZ,
      
      -- Foreign key to profiles table (reporter)
      CONSTRAINT fk_content_reports_reporter 
        FOREIGN KEY (reporter_id) 
        REFERENCES profiles(id) 
        ON DELETE CASCADE,
      
      -- Foreign key to profiles table (admin who handled)
      CONSTRAINT fk_content_reports_admin 
        FOREIGN KEY (admin_id) 
        REFERENCES profiles(id) 
        ON DELETE SET NULL
    );

    -- Add comments for documentation
    COMMENT ON TABLE content_reports IS 
      'Content reports for moderation. Users can report inappropriate content.';
    
    COMMENT ON COLUMN content_reports.content_type IS 
      'Type of content reported: story, post, or comment.';
    
    COMMENT ON COLUMN content_reports.content_id IS 
      'ID of the reported content (story_id, post_id, comment_id).';
    
    COMMENT ON COLUMN content_reports.reason IS 
      'Reason for reporting the content.';
    
    COMMENT ON COLUMN content_reports.status IS 
      'Report status: pending (not reviewed), reviewed (admin saw it), resolved (action taken), dismissed (no action).';
  END IF;

END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_roles_user_id ON admin_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_roles_role ON admin_roles(role);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_admin_id ON admin_audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_created_at ON admin_audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_reports_status ON content_reports(status);
CREATE INDEX IF NOT EXISTS idx_content_reports_content ON content_reports(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_content_reports_created_at ON content_reports(created_at DESC);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for admin_roles.updated_at
DROP TRIGGER IF EXISTS trigger_admin_roles_updated_at ON admin_roles;
CREATE TRIGGER trigger_admin_roles_updated_at
  BEFORE UPDATE ON admin_roles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Admin Helper Functions
-- ============================================

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_roles
    WHERE admin_roles.user_id = is_admin.user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check admin permissions
CREATE OR REPLACE FUNCTION has_admin_permission(
  user_id UUID,
  permission TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
  user_perms JSONB;
BEGIN
  -- Get user role and permissions
  SELECT role, permissions INTO user_role, user_perms
  FROM admin_roles
  WHERE admin_roles.user_id = has_admin_permission.user_id;
  
  -- If user is not admin, return false
  IF user_role IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Super admin has all permissions
  IF user_role = 'super_admin' THEN
    RETURN TRUE;
  END IF;
  
  -- Check custom permissions override
  IF user_perms IS NOT NULL AND user_perms ? permission THEN
    RETURN (user_perms->>permission)::boolean;
  END IF;
  
  -- Role-based permissions (simplified for MVP)
  -- In future, this can be expanded with a permissions table
  CASE user_role
    WHEN 'admin' THEN
      -- Admin can do most things except manage other admins
      RETURN permission IN ('canManageUsers', 'canModerateContent', 'canViewAnalytics', 'canDeleteContent', 'canBanUsers');
    WHEN 'moderator' THEN
      -- Moderator can only moderate content
      RETURN permission IN ('canModerateContent', 'canDeleteContent');
    WHEN 'support' THEN
      -- Support can only view
      RETURN permission = 'canViewAnalytics';
    ELSE
      RETURN FALSE;
  END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log admin action
CREATE OR REPLACE FUNCTION log_admin_action(
  p_admin_id UUID,
  p_action TEXT,
  p_target_type TEXT DEFAULT NULL,
  p_target_id UUID DEFAULT NULL,
  p_details JSONB DEFAULT '{}'::jsonb,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO admin_audit_logs (
    admin_id,
    action,
    target_type,
    target_id,
    details,
    ip_address,
    user_agent
  ) VALUES (
    p_admin_id,
    p_action,
    p_target_type,
    p_target_id,
    p_details,
    p_ip_address,
    p_user_agent
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- RLS Policies
-- ============================================

-- Enable RLS on admin tables
ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_reports ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own admin role" ON admin_roles;
DROP POLICY IF EXISTS "Admins can view all admin roles" ON admin_roles;
DROP POLICY IF EXISTS "Admins can view audit logs" ON admin_audit_logs;
DROP POLICY IF EXISTS "Users can create content reports" ON content_reports;
DROP POLICY IF EXISTS "Users can view their own reports" ON content_reports;
DROP POLICY IF EXISTS "Admins can view all reports" ON content_reports;
DROP POLICY IF EXISTS "Admins can update reports" ON content_reports;

-- Admin roles policies
CREATE POLICY "Users can view their own admin role"
  ON admin_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all admin roles"
  ON admin_roles FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

-- Audit logs policies
CREATE POLICY "Admins can view audit logs"
  ON admin_audit_logs FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

-- Content reports policies
CREATE POLICY "Users can create content reports"
  ON content_reports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view their own reports"
  ON content_reports FOR SELECT
  TO authenticated
  USING (auth.uid() = reporter_id);

CREATE POLICY "Admins can view all reports"
  ON content_reports FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update reports"
  ON content_reports FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()) AND has_admin_permission(auth.uid(), 'canModerateContent'));

-- ============================================
-- Admin RLS Policies for Existing Tables
-- ============================================

-- Drop existing admin policies if they exist
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can view all stories" ON stories;
DROP POLICY IF EXISTS "Admins can delete stories" ON stories;

-- Admin can view all profiles (for user management)
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

-- Admin can view all stories (for moderation)
CREATE POLICY "Admins can view all stories"
  ON stories FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

-- Admin can delete stories (for moderation)
CREATE POLICY "Admins can delete stories"
  ON stories FOR DELETE
  TO authenticated
  USING (is_admin(auth.uid()) AND has_admin_permission(auth.uid(), 'canDeleteContent'));

-- ============================================
-- Verification Queries
-- ============================================
-- Run these queries in Supabase SQL Editor to verify the migration:
--
-- 1. Check tables exist:
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- AND table_name IN ('admin_roles', 'admin_audit_logs', 'content_reports');
--
-- 2. Check functions exist:
-- SELECT routine_name FROM information_schema.routines 
-- WHERE routine_schema = 'public' 
-- AND routine_name IN ('is_admin', 'has_admin_permission', 'log_admin_action');
--
-- 3. Check RLS is enabled:
-- SELECT tablename, rowsecurity FROM pg_tables 
-- WHERE schemaname = 'public' 
-- AND tablename IN ('admin_roles', 'admin_audit_logs', 'content_reports');
--
-- 4. Check policies exist:
-- SELECT schemaname, tablename, policyname FROM pg_policies 
-- WHERE tablename IN ('admin_roles', 'admin_audit_logs', 'content_reports', 'profiles', 'stories')
-- ORDER BY tablename, policyname;

