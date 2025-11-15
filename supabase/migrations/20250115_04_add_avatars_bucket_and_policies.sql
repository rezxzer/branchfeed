-- ============================================
-- MIGRATION: Add Avatars Storage Bucket and Policies
-- ============================================
-- Date: 2025-01-15
-- Description: Creates 'avatars' storage bucket and RLS policies for avatar uploads.
-- This bucket is used for user profile avatars.
-- ============================================

-- ============================================
-- NOTE: Bucket Creation
-- ============================================
-- Supabase Storage buckets cannot be created via SQL.
-- You MUST create the bucket manually in Supabase Dashboard:
--
-- 1. Go to Supabase Dashboard → Storage
-- 2. Click "New bucket"
-- 3. Name: "avatars" (exactly this name, lowercase)
-- 4. Public bucket: ✅ YES (check this checkbox)
-- 5. File size limit: 5 MB (recommended for avatars)
-- 6. Allowed MIME types: image/* (optional)
-- 7. Click "Create bucket"
--
-- After creating the bucket, run the policies below.
-- ============================================

-- ============================================
-- 1. STORAGE POLICIES FOR 'avatars' BUCKET
-- ============================================

-- Policy 1: Public read access (anyone can view avatars)
do $$
begin
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'storage' 
    and tablename = 'objects' 
    and policyname = 'Public read access for avatars'
  ) then
    create policy "Public read access for avatars"
    on storage.objects
    for select
    using (bucket_id = 'avatars');
  end if;
end $$;

-- Policy 2: Authenticated users can upload avatars
do $$
begin
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'storage' 
    and tablename = 'objects' 
    and policyname = 'Authenticated upload avatars'
  ) then
    create policy "Authenticated upload avatars"
    on storage.objects
    for insert
    to authenticated
    with check (bucket_id = 'avatars');
  end if;
end $$;

-- Policy 3: Users can update their own avatars
do $$
begin
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'storage' 
    and tablename = 'objects' 
    and policyname = 'Users can update own avatars'
  ) then
    create policy "Users can update own avatars"
    on storage.objects
    for update
    to authenticated
    using (
      bucket_id = 'avatars' 
      and (storage.foldername(name))[1] = auth.uid()::text
    )
    with check (
      bucket_id = 'avatars' 
      and (storage.foldername(name))[1] = auth.uid()::text
    );
  end if;
end $$;

-- Policy 4: Users can delete their own avatars
do $$
begin
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'storage' 
    and tablename = 'objects' 
    and policyname = 'Users can delete own avatars'
  ) then
    create policy "Users can delete own avatars"
    on storage.objects
    for delete
    to authenticated
    using (
      bucket_id = 'avatars' 
      and (storage.foldername(name))[1] = auth.uid()::text
    );
  end if;
end $$;

-- ============================================
-- VERIFICATION
-- ============================================
-- To verify the bucket exists, run in Supabase Dashboard:
-- SELECT * FROM storage.buckets WHERE name = 'avatars';
--
-- To verify policies were created, run:
-- SELECT * FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname LIKE '%avatars%';
--
-- To test avatar upload:
-- 1. Go to /settings page
-- 2. Upload an avatar image
-- 3. Check Supabase Storage → avatars bucket
-- 4. Verify file appears in {user_id}/ folder

