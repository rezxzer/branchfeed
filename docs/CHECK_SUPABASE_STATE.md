# Check Supabase State - SQL Queries

ეს დოკუმენტაცია შეიცავს SQL queries-ებს, რომლებიც უნდა გაუშვა Supabase Dashboard → SQL Editor-ში, რომ შევამოწმოთ არსებული state-ი.

**Date**: 2025-01-15

---

## 📋 Queries to Run

გაუშვი ეს queries Supabase Dashboard → SQL Editor-ში და გამოგვიგზავნე შედეგები:

### 1. Check Applied Migrations (if migration tracking exists)

```sql
-- Check if there's a migrations table
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE '%migration%';
```

**Expected**: თუ migration tracking table არ არსებობს, ეს დაბრუნებს ცარიელ result-ს.

---

### 2. Check Storage Buckets

```sql
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at
FROM storage.buckets
ORDER BY created_at;
```

**Expected**: უნდა ნახო `stories` bucket, თუ ის შექმნილია.

---

### 3. Check Storage Policies for 'stories' Bucket

```sql
SELECT 
  id,
  name,
  bucket_id,
  definition,
  check_expression,
  command
FROM storage.policies
WHERE bucket_id = 'stories'
ORDER BY command, name;
```

**Expected**: უნდა ნახო 4 policies:
- SELECT (public read)
- INSERT (authenticated upload)
- UPDATE (users can update own uploads)
- DELETE (users can delete own uploads)

---

### 4. Check Functions (Profile Creation Trigger)

```sql
SELECT 
  p.proname AS function_name,
  pg_get_functiondef(p.oid) AS function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.proname LIKE '%profile%' OR p.proname LIKE '%user%'
ORDER BY p.proname;
```

**Expected**: უნდა ნახო `handle_new_user()` function, თუ profile creation trigger migration გაეშვა.

---

### 5. Check Triggers

```sql
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement,
  action_timing
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND (trigger_name LIKE '%profile%' OR trigger_name LIKE '%user%')
ORDER BY event_object_table, trigger_name;
```

**Expected**: უნდა ნახო `on_auth_user_created` trigger on `auth.users` table, თუ profile creation trigger migration გაეშვა.

---

### 6. Check Tables (Verify Database Schema)

```sql
SELECT 
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('profiles', 'stories', 'story_nodes', 'user_story_progress', 'likes', 'comments')
ORDER BY table_name;
```

**Expected**: უნდა ნახო ყველა 6 table, თუ `init.sql` გაეშვა.

---

### 7. Check RLS Policies on Tables

```sql
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'stories', 'story_nodes', 'user_story_progress', 'likes', 'comments')
ORDER BY tablename, policyname;
```

**Expected**: უნდა ნახო RLS policies თითოეულ table-ზე.

---

## 📝 Instructions

1. გახსენი [Supabase Dashboard](https://app.supabase.com)
2. აირჩიე შენი project
3. მარცხენა მენიუში დააჭირე **"SQL Editor"**
4. გაუშვი თითოეული query ზემოთ (copy-paste)
5. გამოგვიგზავნე შედეგები (screenshots ან text)

---

## ✅ After Results

შედეგების მიღების შემდეგ:
- ვაანალიზებ რა migrations არის გაშვებული
- ვაანალიზებ რა storage buckets და policies არსებობს
- შევქმნი შესაბამის migration-ს, თუ რამე აკლია
- დავრწმუნდები რომ არ დუბლირება objects-ები

---

**Last Updated**: 2025-01-15

