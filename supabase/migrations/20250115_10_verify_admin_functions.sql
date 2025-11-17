-- Verify and create admin functions if they don't exist
-- This migration ensures is_admin() and has_admin_permission() functions exist
-- Using CREATE OR REPLACE (idempotent - safe to run multiple times)

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

COMMENT ON FUNCTION is_admin(UUID) IS 'Checks if a user has any admin role';

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

COMMENT ON FUNCTION has_admin_permission(UUID, TEXT) IS 'Checks if a user has a specific admin permission';

-- Verification queries:
-- 1. Check functions exist:
-- SELECT routine_name, routine_type 
-- FROM information_schema.routines 
-- WHERE routine_schema = 'public' 
-- AND routine_name IN ('is_admin', 'has_admin_permission');

-- 2. Test is_admin function:
-- SELECT is_admin('0d04457a-c0f5-4b2d-a40e-d446404b43f5'::uuid) as is_admin_result;

-- 3. Test has_admin_permission function:
-- SELECT has_admin_permission('0d04457a-c0f5-4b2d-a40e-d446404b43f5'::uuid, 'canModerateContent') as can_moderate_result;

