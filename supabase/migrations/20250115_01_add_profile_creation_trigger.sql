-- ============================================
-- MIGRATION: Add Profile Creation Trigger
-- ============================================
-- Date: 2025-01-15
-- Description: Automatically create user profile when new user signs up
-- 
-- This migration adds a database trigger that automatically creates
-- a profile record in the profiles table whenever a new user is created
-- in auth.users table.
-- ============================================

-- ============================================
-- 1. FUNCTION: Create profile for new user
-- ============================================

DO $$
BEGIN
  -- Drop function if exists (for idempotent migration)
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_new_user') THEN
    DROP FUNCTION handle_new_user() CASCADE;
  END IF;
END $$;

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  default_username TEXT;
  username_exists BOOLEAN;
  counter INTEGER := 0;
BEGIN
  -- Generate default username from email (before @ symbol)
  default_username := split_part(NEW.email, '@', 1);
  
  -- Check if username already exists
  SELECT EXISTS(SELECT 1 FROM profiles WHERE username = default_username) INTO username_exists;
  
  -- If username exists, append random number
  WHILE username_exists AND counter < 1000 LOOP
    default_username := split_part(NEW.email, '@', 1) || counter::TEXT;
    SELECT EXISTS(SELECT 1 FROM profiles WHERE username = default_username) INTO username_exists;
    counter := counter + 1;
  END LOOP;
  
  -- If still exists after 1000 attempts, use UUID suffix
  IF username_exists THEN
    default_username := split_part(NEW.email, '@', 1) || '_' || substr(NEW.id::TEXT, 1, 8);
  END IF;
  
  -- Insert profile for new user
  INSERT INTO public.profiles (id, username, email, avatar_url, bio, language_preference, created_at, updated_at)
  VALUES (
    NEW.id,
    default_username,
    NEW.email,
    NULL,
    NULL,
    'en', -- Default language preference
    NOW(),
    NOW()
  );
  
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- If username still conflicts, use UUID-based username
    INSERT INTO public.profiles (id, username, email, avatar_url, bio, language_preference, created_at, updated_at)
    VALUES (
      NEW.id,
      'user_' || substr(NEW.id::TEXT, 1, 8),
      NEW.email,
      NULL,
      NULL,
      'en',
      NOW(),
      NOW()
    );
    RETURN NEW;
  WHEN OTHERS THEN
    -- Log error but don't fail user creation
    RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 2. TRIGGER: Call function on new user creation
-- ============================================

-- Drop trigger if exists (for idempotent migration)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- 
-- After running this migration, verify it works:
--
-- 1. Check that function exists:
--    SELECT proname FROM pg_proc WHERE proname = 'handle_new_user';
--
-- 2. Check that trigger exists:
--    SELECT tgname FROM pg_trigger WHERE tgname = 'on_auth_user_created';
--
-- 3. Test profile creation (create a test user in Supabase Auth Dashboard):
--    - Create a new user via Supabase Auth
--    - Check that profile was created:
--      SELECT * FROM profiles WHERE email = 'test@example.com';
--
-- 4. Verify username generation:
--    - Username should be generated from email (before @ symbol)
--    - If username exists, it should append number or UUID
--
-- ============================================

