# Create Avatars Bucket - Quick Guide

**Status**: ⚠️ **REQUIRED** - Avatar upload will not work without this bucket

---

## 🚀 Quick Steps

### Step 1: Open Supabase Dashboard

1. გახსენი [Supabase Dashboard](https://app.supabase.com)
2. აირჩიე შენი project
3. მარცხენა მენიუში დააჭირე **"Storage"**

### Step 2: Create Avatars Bucket

1. Storage page-ზე დააჭირე **"New bucket"** ღილაკს (ზედა მარჯვენა კუთხეში)
2. შეიყვანე:
   - **Name**: `avatars` (exactly this name, lowercase - ძალიან მნიშვნელოვანია!)
   - **Public bucket**: ✅ **YES** (check this checkbox - ეს აუცილებელია!)
   - **File size limit**: `5` MB (recommended for avatars)
     - თუ "Restrict file size" toggle ON-ია, შეიყვანე `5`, dropdown-ში აირჩიე `MB`
   - **Allowed MIME types**: 
     - **ვარიანტი 1**: შეიყვანე `image/*` (მხოლოდ ეს, **არა** "(optional)" ან სხვა ტექსტი!)
     - **ვარიანტი 2**: ან დატოვე ცარიელი (თუ "Restrict MIME types" toggle OFF-ია)
     - ⚠️ **შენიშვნა**: თუ "Restrict MIME types" toggle ON-ია, უნდა შეიყვანო valid MIME type (მაგ: `image/*`), **არა** "(optional)"!
3. დააჭირე **"Create bucket"**

### Step 3: Verify Bucket Created

1. Storage page-ზე უნდა ნახო `avatars` bucket
2. უნდა იყოს მონიშნული როგორც **"Public"** (green badge)
3. Bucket-ის settings-ში შეამოწმე:
   - Public: ✅ Yes
   - File size limit: 5MB (ან როგორც დააყენე)

### Step 4: Verify Policies Applied

Migration-ი უკვე გაშვებულია, ასე რომ policies უნდა იყოს შექმნილი. შეამოწმე:

1. Storage page-ზე დააჭირე `avatars` bucket-ზე
2. გადადი **"Policies"** tab-ზე
3. უნდა ნახო 4 policies:
   - ✅ "Public read access for avatars" (SELECT)
   - ✅ "Authenticated upload avatars" (INSERT)
   - ✅ "Users can update own avatars" (UPDATE)
   - ✅ "Users can delete own avatars" (DELETE)

თუ policies არ არის, გაუშვი `supabase/migrations/20250115_04_add_avatars_bucket_and_policies.sql` SQL Editor-ში.

---

## ✅ Test Avatar Upload

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

## 🐛 Troubleshooting

### Error: "Bucket not found"

**Cause**: Bucket 'avatars' არ არსებობს

**Solution**:
1. შექმენი bucket Step 2-ის მიხედვით
2. დარწმუნდი რომ name არის exactly `avatars` (lowercase, no spaces)
3. დარწმუნდი რომ bucket არის Public (green badge)

### Error: "Permission denied" ან "Access denied"

**Cause**: Storage policies არ არის დაყენებული

**Solution**:
1. გაუშვი `supabase/migrations/20250115_04_add_avatars_bucket_and_policies.sql` SQL Editor-ში
2. ან manually შექმენი policies Storage → avatars → Policies tab-ზე

### Error: "File too large"

**Cause**: File size აღემატება bucket-ის limit-ს

**Solution**:
1. შეამცირე file size (use image compression)
2. ან გაზარდე bucket-ის file size limit (Settings → File size limit)

---

## 📝 Important Notes

- Bucket name **MUST** be exactly `avatars` (lowercase, no spaces) - code expects this exact name
- Bucket **MUST** be Public for avatars to be viewable
- Policies allow:
  - Anyone to view avatars (public read)
  - Authenticated users to upload avatars
  - Users to update/delete their own avatars (based on folder structure: `{user_id}/`)

---

**Last Updated**: 2025-01-15

