# Fix User Profile - Step by Step

**Date**: 2025-01-15  
**Issue**: Profile not created - "No rows returned" from queries

---

## 🔍 Step 1: Check if User Exists

გაუშვი ეს query, რომ შევამოწმოთ user არსებობს თუ არა:

```sql
-- Check all users in auth.users
SELECT 
  id,
  email,
  created_at,
  raw_user_meta_data
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;
```

**Expected**: უნდა ნახო user-ები, მათ შორის შენი user.

---

## 🔍 Step 2: Find Your User ID

თუ user არსებობს, დააკოპირე user ID (UUID) და email.

---

## 🔧 Step 3: Create Profile with Correct User ID

თუ user არსებობს, გაუშვი ეს query (შეცვალე `YOUR_USER_ID_HERE` შენი user ID-ით):

```sql
-- Create profile for user (replace YOUR_USER_ID_HERE with actual user ID)
INSERT INTO profiles (id, username, email, language_preference, created_at, updated_at)
SELECT 
  id,
  COALESCE(raw_user_meta_data->>'username', split_part(email, '@', 1)) AS username,
  email,
  'en' AS language_preference,
  NOW() AS created_at,
  NOW() AS updated_at
FROM auth.users
WHERE id = 'YOUR_USER_ID_HERE'  -- Replace with your actual user ID from Step 1
  AND NOT EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.users.id
  )
RETURNING id, username, email;
```

**Expected**: უნდა დაინახო profile data (id, username, email).

---

## 🔧 Alternative: Create Profile for All Users Without Profiles

თუ რამდენიმე user-ს არ აქვს profile, შეგიძლია შექმნა ყველასთვის:

```sql
-- Create profiles for all users who don't have one
INSERT INTO profiles (id, username, email, language_preference, created_at, updated_at)
SELECT 
  id,
  COALESCE(raw_user_meta_data->>'username', split_part(email, '@', 1)) AS username,
  email,
  'en' AS language_preference,
  NOW() AS created_at,
  NOW() AS updated_at
FROM auth.users
WHERE NOT EXISTS (
  SELECT 1 FROM profiles WHERE profiles.id = auth.users.id
)
RETURNING id, username, email;
```

---

## ✅ Step 4: Verify Profile Created

Profile-ის შექმნის შემდეგ, გაუშვი ეს query:

```sql
-- Check all profiles
SELECT 
  p.id,
  p.username,
  p.email,
  u.email AS auth_email,
  p.created_at
FROM profiles p
JOIN auth.users u ON p.id = u.id
ORDER BY p.created_at DESC;
```

**Expected**: უნდა ნახო შენი profile.

---

## 📝 Instructions

1. გახსენი [Supabase Dashboard](https://app.supabase.com) → SQL Editor
2. გაუშვი **Step 1** query - იპოვე შენი user ID
3. გაუშვი **Step 3** query - შექმენი profile (შეცვალე user ID)
4. გაუშვი **Step 4** query - verify profile created
5. გამოგვიგზავნე შედეგები

---

## 🎯 After Profile Creation

Profile-ის შექმნის შემდეგ:
1. გადადი `/create` გვერდზე
2. შექმენი story ისევ
3. უნდა იმუშაოს - foreign key error აღარ უნდა იყოს

---

**Last Updated**: 2025-01-15

