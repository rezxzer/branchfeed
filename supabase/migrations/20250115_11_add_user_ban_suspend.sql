-- Add user ban and suspend functionality
-- This migration adds banned_at and suspended_until fields to profiles table

DO $$
BEGIN
  -- Add banned_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'banned_at'
  ) THEN
    ALTER TABLE profiles 
    ADD COLUMN banned_at TIMESTAMPTZ;
    
    COMMENT ON COLUMN profiles.banned_at IS 
      'Timestamp when user was banned. NULL if not banned. Permanent ban if set.';
  END IF;

  -- Add suspended_until column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'suspended_until'
  ) THEN
    ALTER TABLE profiles 
    ADD COLUMN suspended_until TIMESTAMPTZ;
    
    COMMENT ON COLUMN profiles.suspended_until IS 
      'Timestamp until which user is suspended. NULL if not suspended. Temporary suspension if set.';
  END IF;

  -- Add ban_reason column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'ban_reason'
  ) THEN
    ALTER TABLE profiles 
    ADD COLUMN ban_reason TEXT;
    
    COMMENT ON COLUMN profiles.ban_reason IS 
      'Reason for ban or suspension. Stored for audit purposes.';
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_banned_at ON profiles(banned_at) WHERE banned_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_suspended_until ON profiles(suspended_until) WHERE suspended_until IS NOT NULL;

-- Create helper function to check if user is banned
CREATE OR REPLACE FUNCTION is_user_banned(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = is_user_banned.user_id
    AND banned_at IS NOT NULL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION is_user_banned(UUID) IS 'Checks if a user is permanently banned';

-- Create helper function to check if user is suspended
CREATE OR REPLACE FUNCTION is_user_suspended(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = is_user_suspended.user_id
    AND suspended_until IS NOT NULL
    AND suspended_until > NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION is_user_suspended(UUID) IS 'Checks if a user is currently suspended (temporary ban)';

-- Verification queries:
-- 1. Check columns exist:
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'profiles' 
-- AND column_name IN ('banned_at', 'suspended_until', 'ban_reason');

-- 2. Check functions exist:
-- SELECT routine_name FROM information_schema.routines 
-- WHERE routine_schema = 'public' 
-- AND routine_name IN ('is_user_banned', 'is_user_suspended');

-- 3. Test functions:
-- SELECT is_user_banned('USER_ID_HERE'::uuid) as is_banned;
-- SELECT is_user_suspended('USER_ID_HERE'::uuid) as is_suspended;

