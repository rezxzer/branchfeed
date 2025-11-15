# Check User Profile - SQL Queries

ეს დოკუმენტაცია შეიცავს SQL queries-ებს, რომლებიც უნდა გაუშვა Supabase Dashboard → SQL Editor-ში, რომ შევამოწმოთ user profile-ის არსებობა.

**Date**: 2025-01-15  
**Issue**: Foreign key constraint error - `stories_author_id_fkey`

---

## 🔍 Problem

Error: `insert or update on table "stories" violates foreign key constraint "stories_author_id_fkey"`

**Cause**: User-ს არ აქვს profile `profiles` table-ში, ან `author_id` არ ემთხვევა user ID-ს.

---

## 📋 Queries to Run

### 1. Check Current User ID

```sql
-- Get current authenticated user ID
SELECT 
  id,
  email,
  created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;
```

**Expected**: უნდა ნახო user-ები, მათ შორის შენი user ID.

---

### 2. Check Profiles Table

```sql
-- Check all profiles
SELECT 
  id,
  username,
  email,
  created_at
FROM profiles
ORDER BY created_at DESC;
```

**Expected**: უნდა ნახო profiles, მათ შორის შენი profile (თუ profile creation trigger მუშაობს).

---

### 3. Check if Your User Has Profile

```sql
-- Replace 'YOUR_USER_ID_HERE' with your actual user ID from query 1
-- Check if your user has a profile
SELECT 
  p.id,
  p.username,
  p.email,
  u.id AS auth_user_id,
  u.email AS auth_email
FROM profiles p
RIGHT JOIN auth.users u ON p.id = u.id
WHERE u.email = 'rezrezorezo123321@gmail.com'  -- Replace with your email
ORDER BY u.created_at DESC;
```

**Expected**: 
- თუ profile არსებობს: უნდა ნახო profile data
- თუ profile არ არსებობს: `p.id` და `p.username` იქნება `NULL`

---

### 4. Check Profile Creation Trigger

```sql
-- Check if trigger exists on auth.users
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement,
  action_timing
FROM information_schema.triggers
WHERE trigger_schema = 'auth'
  AND event_object_table = 'users'
  AND trigger_name LIKE '%profile%' OR trigger_name LIKE '%user%';
```

**Expected**: უნდა ნახო `on_auth_user_created` trigger (ან მსგავსი).

---

## 🔧 Solutions

### Solution 1: Create Profile Manually (If Missing)

თუ profile არ არსებობს, შექმენი manually:

```sql
-- Replace 'YOUR_USER_ID_HERE' with your actual user ID
INSERT INTO profiles (id, username, email)
SELECT 
  id,
  COALESCE(raw_user_meta_data->>'username', split_part(email, '@', 1)) AS username,
  email
FROM auth.users
WHERE id = 'YOUR_USER_ID_HERE'  -- Replace with your user ID
  AND NOT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.users.id
  );
```

---

### Solution 2: Fix Profile Creation Trigger

თუ trigger არ მუშაობს, გაუშვი profile creation trigger migration:

```sql
-- Run the profile creation trigger migration
-- File: supabase/migrations/20250115_01_add_profile_creation_trigger.sql
```

---

### Solution 3: Test Profile Creation

შემდეგ user-ის signup-ის შემდეგ, profile ავტომატურად უნდა შეიქმნას.

---

## 📝 Instructions

1. გახსენი [Supabase Dashboard](https://app.supabase.com)
2. აირჩიე შენი project
3. მარცხენა მენიუში დააჭირე **"SQL Editor"**
4. გაუშვი queries ზემოთ (1-4)
5. გამოგვიგზავნე შედეგები

---

## ✅ After Results

შედეგების მიღების შემდეგ:
- ვაანალიზებ რა პრობლემაა
- შევქმნი solution (manual profile creation ან trigger fix)
- დავრწმუნდები რომ story creation მუშაობს

---

**Last Updated**: 2025-01-15

