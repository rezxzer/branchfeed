# Storage Setup Instructions - Supabase

ეს დოკუმენტაცია აჩვენებს როგორ შევქმნათ storage buckets Supabase-ში.

**Status**: ⚠️ **REQUIRED** - Story creation and avatar upload will fail without these buckets

## Required Buckets

1. **`stories`** - For story media (images/videos)
2. **`avatars`** - For user profile avatars

---

## 📋 Step-by-Step Instructions

### Step 1: Open Supabase Dashboard

1. გახსენი [Supabase Dashboard](https://app.supabase.com)
2. აირჩიე შენი project
3. მარცხენა მენიუში დააჭირე **"Storage"**

### Step 2: Create New Bucket

1. Storage page-ზე დააჭირე **"New bucket"** ღილაკს
2. შეიყვანე:
   - **Name**: `stories` (exactly this name, lowercase)
   - **Public bucket**: ✅ **YES** (check this checkbox - this is important!)
   - **Restrict file size**: ✅ **YES** (toggle ON)
     - **File size limit**: `50` (ან როგორც გინდა - default-ად 50MB უფასო პლანისთვის)
     - **Unit**: `MB` (აირჩიე dropdown-ში)
     - ⚠️ **ყურადღება**: თუ helper text-ში წერია "This project has a global file size limit of 50 MB", ეს არის default-ი და bucket-ის limit-იც 50MB-ია (მომავალში შეიძლება გაზარდო)
   - **Restrict MIME types**: ✅ **YES** (toggle ON)
     - **Allowed MIME types**: `image/*,video/*` (⚠️ **მნიშვნელოვანი**: space-ების გარეშე, მხოლოდ comma-ით გამოყოფილი)
     - ან დატოვე ცარიელი (თუ გინდა ყველა ტიპის ფაილი)
3. დააჭირე **"Create bucket"**

⚠️ **MIME Type Format Error-ის თავიდან ასაცილებლად:**
- ❌ **არასწორი**: `image/*, video/*` (space-ით)
- ✅ **სწორი**: `image/*,video/*` (space-ების გარეშე)
- ✅ **ან**: `image/jpeg,image/png,image/webp,video/mp4,video/webm` (specific types)

### Step 3: Verify Bucket Created

1. Storage page-ზე უნდა ნახო `stories` bucket
2. უნდა იყოს მონიშნული როგორც **"Public"**
3. Bucket-ის settings-ში შეამოწმე:
   - Public: ✅ Yes
   - File size limit: 50MB (ან როგორც დააყენე - default-ად 50MB უფასო პლანისთვის)

---

## 🔧 How to Update Existing Bucket's File Size Limit

თუ bucket უკვე შექმნილია და გინდა გაზარდო max file size limit-ი:

### Step 1: Open Bucket Settings

1. გახსენი [Supabase Dashboard](https://app.supabase.com)
2. აირჩიე შენი project
3. მარცხენა მენიუში დააჭირე **"Storage"**
4. Storage page-ზე დააჭირე **`stories`** bucket-ზე (bucket-ის სახელზე)

### Step 2: Edit Bucket Settings

1. Bucket-ის გვერდზე, ზედა მარჯვენა კუთხეში დააჭირე **"Settings"** ან **"Edit bucket"** ღილაკს
2. ან bucket-ის სახელის გვერდით დააჭირე **"⋮"** (three dots) → **"Edit"**

### Step 3: Update File Size Limit

1. იპოვე **"File size limit"** ან **"Restrict file size"** toggle/input
2. თუ toggle ON-ია:
   - შეიყვანე `50` (ან მეტი, თუ გინდა - default-ად 50MB)
   - Dropdown-ში აირჩიე `MB` (არა `KB` ან `GB`)
3. თუ toggle OFF-ია:
   - ჩართე toggle
   - შეიყვანე `50`
   - აირჩიე `MB`

### Step 4: Save Changes

1. დააჭირე **"Save"** ან **"Update"** ან **"Update bucket"** ღილაკს
2. დაელოდე confirmation message-ს

### Step 5: Verify Changes

1. Bucket-ის settings-ში შეამოწმე:
   - File size limit: **50MB** (ან როგორც დააყენე)
2. თუ ჯერ კიდევ არის პრობლემა:
   - განაახლე browser page (F5)
   - შეეცადე ისევ ვიდეოს ატვირთვა

---

## 🌐 Global File Size Limit

თუ screenshot-ში ხედავ helper text-ს: **"This project has a global file size limit of 50 MB"**, ეს ნიშნავს რომ project-ის global limit-ი 50 MB-ია, და bucket-ის limit-ი არ შეიძლება იყოს global limit-ზე მეტი.

### როგორ გავზარდო Global File Size Limit:

1. **Supabase Dashboard** → შენი project
2. მარცხენა მენიუში დააჭირე **"Settings"** (⚙️ gear icon)
3. გადადი **"Storage"** tab-ზე
4. იპოვე **"File size limit"** ან **"Global file size limit"** სექცია
5. შეიყვანე `50` (ან მეტი, თუ გინდა - default-ად 50MB უფასო პლანისთვის)
6. აირჩიე `MB` (dropdown-ში)
7. დააჭირე **"Save"** ან **"Update"**

⚠️ **ყურადღება**: 
- Default-ად global limit-ი 50MB-ია (უფასო პლანი)
- თუ გინდა მეტი, გაზარდე global limit-ი და bucket-ის limit-იც

---

## ⚠️ Troubleshooting

### Problem: "File size limit" option not visible

**Solution:**
- შეამოწმე რომ bucket-ის settings-ში ხარ
- შეამოწმე რომ შენი account-ს აქვს admin/owner permissions
- შეეცადე bucket-ის გადახედვა (refresh page)

### Problem: Changes not saving

**Solution:**
- დარწმუნდი რომ დააჭირე "Save" ღილაკს
- შეამოწმე browser console-ში errors
- შეეცადე browser-ის განახლება და ისევ ცდა

### Problem: Still getting "exceeded the maximum allowed size" error

**Solution:**
1. შეამოწმე რომ bucket-ის file size limit ნამდვილად განახლდა (50MB)
2. შეამოწმე რომ project-ის **global file size limit** არის ≥ 50MB (Settings → Storage → Global file size limit)
3. შეამოწმე რომ ფაილი ნამდვილად < 50MB-ია
4. განაახლე browser page (F5)
5. შეეცადე ისევ ვიდეოს ატვირთვა

### Problem: "Invalid MIME type format" error

**Solution:**
- ❌ **არასწორი**: `image/*, video/*` (space-ით)
- ✅ **სწორი**: `image/*,video/*` (space-ების გარეშე)
- ✅ **ან**: დატოვე ცარიელი (თუ გინდა ყველა ტიპის ფაილი)
- ✅ **ან**: `image/jpeg,image/png,image/webp,video/mp4,video/webm` (specific types, space-ების გარეშე)

### Step 4: Verify Policies Applied

1. Storage page-ზე დააჭირე `stories` bucket-ზე
2. გადადი **"Policies"** tab-ზე
3. უნდა იყოს 4 policies:
   - ✅ "Public read access" (SELECT)
   - ✅ "Authenticated upload" (INSERT)
   - ✅ "Users can update own uploads" (UPDATE)
   - ✅ "Users can delete own uploads" (DELETE)

თუ policies არ არის, გაუშვი `supabase/migrations/20250115_02_add_storage_bucket_and_policies.sql` SQL Editor-ში.

---

## ✅ Verification

### Test Upload

1. გახსენი `/create` გვერდი
2. შექმენი test story
3. Upload image/video
4. დააჭირე "Publish"
5. Verification:
   - [ ] Upload მოხდა წარმატებით
   - [ ] File გამოჩნდა Storage → stories bucket-ში
   - [ ] File URL არის publicly accessible
   - [ ] Story შეიქმნა database-ში

### Check Storage Bucket

1. Supabase Dashboard → Storage → stories
2. უნდა ნახო uploaded files
3. File-ზე click-ით უნდა ნახო public URL

---

## 🐛 Troubleshooting

### Error: "Bucket not found"

**Cause**: Bucket 'stories' არ არსებობს

**Solution**:
1. შექმენი bucket Step 2-ის მიხედვით
2. დარწმუნდი რომ name არის exactly `stories` (lowercase)
3. დარწმუნდი რომ bucket არის Public

### Error: "Permission denied" ან "Access denied"

**Cause**: Storage policies არ არის დაყენებული

**Solution**:
1. გაუშვი `supabase/migrations/20250115_02_add_storage_bucket_and_policies.sql` SQL Editor-ში
2. ან manually შექმენი policies Storage → stories → Policies tab-ზე

### Error: "File too large"

**Cause**: File size აღემატება bucket-ის limit-ს

**Solution**:
1. შეამცირე file size
2. ან გაზარდე bucket-ის file size limit

---

## 📝 Notes

- Bucket name **MUST** be exactly `stories` (lowercase) - code expects this name
- Bucket **MUST** be Public for story media to be viewable
- Policies allow:
  - Anyone to view files (public read)
  - Authenticated users to upload
  - Authenticated users to update/delete their uploads

---

## Avatars Bucket Setup

> ⚠️ **IMPORTANT**: Migration `20250115_04_add_avatars_bucket_and_policies.sql` creates only the **policies**. The **bucket itself** must be created manually in Supabase Dashboard!

### Step 1: Create Avatars Bucket (MANUAL - Required!)

1. გახსენი [Supabase Dashboard](https://app.supabase.com)
2. აირჩიე შენი project
3. მარცხენა მენიუში დააჭირე **"Storage"**
4. Storage page-ზე დააჭირე **"New bucket"** ღილაკს (ზედა მარჯვენა კუთხეში)
5. შეიყვანე:
   - **Name**: `avatars` (exactly this name, lowercase - ძალიან მნიშვნელოვანია!)
   - **Public bucket**: ✅ **YES** (check this checkbox - ეს აუცილებელია!)
   - **File size limit**: `5` MB (recommended for avatars)
     - თუ "Restrict file size" toggle ON-ია, შეიყვანე `5`, dropdown-ში აირჩიე `MB`
   - **Allowed MIME types**: 
     - **ვარიანტი 1**: შეიყვანე `image/*` (მხოლოდ ეს, **არა** "(optional)" ან სხვა ტექსტი!)
     - **ვარიანტი 2**: ან დატოვე ცარიელი (თუ "Restrict MIME types" toggle OFF-ია)
     - ⚠️ **შენიშვნა**: თუ "Restrict MIME types" toggle ON-ია, უნდა შეიყვანო valid MIME type (მაგ: `image/*`), **არა** "(optional)"!
6. დააჭირე **"Create bucket"**

### Step 2: Verify Policies Applied

Migration `20250115_04_add_avatars_bucket_and_policies.sql` უკვე გაშვებულია, ასე რომ policies უნდა იყოს შექმნილი. შეამოწმე:

1. Storage page-ზე დააჭირე `avatars` bucket-ზე
2. გადადი **"Policies"** tab-ზე
3. უნდა ნახო 4 policies:
   - ✅ "Public read access for avatars" (SELECT)
   - ✅ "Authenticated upload avatars" (INSERT)
   - ✅ "Users can update own avatars" (UPDATE)
   - ✅ "Users can delete own avatars" (DELETE)

თუ policies არ არის, გაუშვი `supabase/migrations/20250115_04_add_avatars_bucket_and_policies.sql` SQL Editor-ში.

### Step 3: Test Avatar Upload

1. გახსენი `/settings` page-ზე
2. დააჭირე **"Change Avatar"** ღილაკს
3. აირჩიე image file (max 5MB)
4. დააჭირე **"Save Changes"**
5. Verification:
   - [ ] Upload მოხდა წარმატებით (no error message)
   - [ ] Avatar გამოჩნდა profile-ში
   - [ ] File გამოჩნდა Storage → avatars bucket-ში
   - [ ] File URL არის publicly accessible

---

**Last Updated**: 2025-01-15

