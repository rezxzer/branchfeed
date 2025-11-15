# Settings Page - BranchFeed

ეს დოკუმენტაცია აღწერს Settings Page-ის იმპლემენტაციას BranchFeed-ში.

---

## 📋 Overview

Settings Page არის მომხმარებლის პარამეტრების გვერდი, სადაც:
- მომხმარებლები არედაქტირებენ პროფილს (username, bio, avatar)
- მომხმარებლები არჩევენ ენას (language preference)
- მომხმარებლები აკონფიგურირებენ notification settings-ს (optional)
- მომხმარებლები აკონფიგურირებენ privacy settings-ს (optional)

**Route**: `/settings` (protected route)

**Status**: 🟢 **Medium Priority** - Phase 2 (User Features)

> ℹ️ **შენიშვნა**
>
> Settings Page არის **დაცული გვერდი** - მხოლოდ ავტორიზებულ მომხმარებლებს შეუძლიათ წვდომა.
>
> ეს გვერდი საშუალებას აძლევს მომხმარებლებს მართონ თავიანთი პროფილის და პარამეტრების პარამეტრები.

> ℹ️ **Cursor-ზე**
>
> ამ ფაილში მოყვანილი კოდი არის **სტრუქტურის მაგალითი**.
>
> რეალური იმპლემენტაცია უნდა შეიქმნას Cursor-ის მიერ, `.cursorrules` და
> `docs/PROJECT_PRIORITIES.md` ფაილებში აღწერილი წესების დაცვით.

---

## 🎯 Features

### Core Features (MVP - Phase 2)

1. **Profile Settings**
   - Edit username
   - Edit bio
   - Upload/change avatar
   - Save profile changes

2. **Language Preference**
   - Select language (Georgian, English, German, Russian, French)
   - Save language preference
   - Apply language immediately

3. **Account Settings** (Optional - Phase 2+)
   - Change email
   - Change password
   - Delete account

4. **Notification Settings** (Optional - Phase 2+)
   - Email notifications toggle
   - Push notifications toggle
   - Notification preferences

5. **Privacy Settings** (Optional - Phase 2+)
   - Profile visibility
   - Story visibility
   - Data privacy options

---

## 📐 Page Layout

### Structure

```
┌─────────────────────────────────────┐
│  Header (Navigation)               │
├─────────────────────────────────────┤
│  Settings Page                      │
│  ┌─────────────────────────────┐   │
│  │ Settings Tabs                │   │
│  │ [Profile] [Language] [Account]│   │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │ Profile Settings              │   │
│  │ [Avatar Upload]               │   │
│  │ [Username Input]               │   │
│  │ [Bio Textarea]                │   │
│  │ [Save Button]                 │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

### Mobile Layout

```
┌─────────────────┐
│ Settings        │
│ [Tabs]          │
│                 │
│ Profile         │
│ [Avatar]        │
│ [Username]      │
│ [Bio]           │
│ [Save]          │
└─────────────────┘
```

---

## 🎨 UI Components

### Used Components

1. **Header** (`src/components/Header.tsx`)
   - Navigation bar

2. **Form Components** (`src/components/ui/Input.tsx`, `Textarea.tsx`)
   - Username input
   - Bio textarea

3. **Button** (`src/components/ui/Button.tsx`)
   - Save button
   - Cancel button

4. **MediaUploader** (`src/components/MediaUploader.tsx`)
   - Avatar upload
   - **Note**: Avatar-ის ატვირთვისას რეკომენდებულია Media Upload System-ში აღწერილი validation წესების (ფაილის ზომა, ტიპი და ასპექტის კონტროლი) გამოყენება, რათა Settings Page-ის avatar upload არ იქცეს განსაკუთრებულ, დაუცველ გზად.

5. **Select** (`src/components/ui/Select.tsx`)
   - Language selection

6. **Tabs** (`src/components/ui/Tabs.tsx`)
   - Settings tabs (optional)

---

## 🔐 Access Control

- `/settings` არის **დაცული როუტი**:
  - `middleware.ts` → აუთენტიფიცირებულს აგდებს `/signin`-ზე.
  - `app/settings/page.tsx` → server-side `getCurrentUser()` შემოწმება.
- თუ `getCurrentUser()` აბრუნებს `null` → `redirect('/signin')`.
- Settings editing requires authenticated user (own settings only).

---

## 🔧 Implementation Details

### Page Component Structure (Server Component)

```typescript
// app/settings/page.tsx
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { SettingsPageClient } from '@/components/settings/SettingsPageClient';

export default async function SettingsPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/signin');
  }

  return <SettingsPageClient user={user} />;
}
```

### SettingsPageClient Component

```typescript
// components/settings/SettingsPageClient.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientClient } from '@/lib/auth';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { MediaUploader } from '@/components/MediaUploader';
import { useTranslation } from '@/hooks/useTranslation';
import { toast } from '@/components/ui/toast';

interface SettingsPageClientProps {
  user: {
    id: string;
    username: string;
    bio: string | null;
    avatar_url: string | null;
    language_preference: string; // მოჰყვება profiles.language_preference ველიდან
  };
}

export function SettingsPageClient({ user: initialUser }: SettingsPageClientProps) {
  const { t, setLanguage, currentLanguage } = useTranslation();
  const router = useRouter();
  const [username, setUsername] = useState(initialUser.username);
  const [bio, setBio] = useState(initialUser.bio || '');
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState(initialUser.avatar_url);
  const [language, setLanguageState] = useState(currentLanguage);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSaveProfile = async () => {
    const newErrors: Record<string, string> = {};

    if (!username.trim()) {
      newErrors.username = t('settings.errors.usernameRequired');
    }
    if (username.length < 3) {
      newErrors.username = t('settings.errors.usernameTooShort');
    }
    if (username.length > 30) {
      newErrors.username = t('settings.errors.usernameTooLong');
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const supabase = createClientClient();

      // Upload avatar if changed
      let avatarUrl = initialUser.avatar_url;
      if (avatar) {
        // Upload to Supabase Storage
        const fileExt = avatar.name.split('.').pop();
        const fileName = `${initialUser.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, avatar, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);

        avatarUrl = urlData.publicUrl;
      }

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          username: username.trim(),
          bio: bio.trim() || null,
          avatar_url: avatarUrl,
        })
        .eq('id', initialUser.id);

      if (updateError) throw updateError;

      toast.success(t('settings.profileUpdated'));
      router.refresh();
    } catch (error) {
      toast.error(t('settings.errors.updateFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageChange = async (newLanguage: string) => {
    setLanguageState(newLanguage);
    setLanguage(newLanguage);
    
    // Update language preference in database
    try {
      const supabase = createClientClient();
      const { error } = await supabase
        .from('profiles')
        .update({ language_preference: newLanguage })
        .eq('id', initialUser.id);
      
      if (error) throw error;
      
      // Optionally save to localStorage for next session
      if (typeof window !== 'undefined') {
        localStorage.setItem('language', newLanguage);
      }
      
      toast.success(t('settings.languageUpdated'));
    } catch (error) {
      toast.error(t('settings.errors.updateFailed'));
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">{t('settings.title')}</h1>

      {/* Profile Settings */}
      <div className="space-y-6 mb-8">
        <h2 className="text-2xl font-semibold">{t('settings.profile.title')}</h2>

        {/* Avatar Upload */}
        <div>
          <MediaUploader
            label={t('settings.profile.avatar')}
            onFileChange={(file) => {
              setAvatar(file);
              if (file) {
                const url = URL.createObjectURL(file);
                setAvatarPreview(url);
              }
            }}
            acceptedFormats={['image/*']}
            preview={avatarPreview}
          />
        </div>

        {/* Username */}
        <div>
          <Input
            id="username"
            label={t('settings.profile.username')}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            error={errors.username}
            required
          />
        </div>

        {/* Bio */}
        <div>
          <Textarea
            id="bio"
            label={t('settings.profile.bio')}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            maxLength={500}
          />
        </div>

        <Button
          onClick={handleSaveProfile}
          variant="primary"
          disabled={loading}
        >
          {loading ? t('settings.saving') : t('settings.save')}
        </Button>
      </div>

      {/* Language Settings */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">{t('settings.language.title')}</h2>

        <Select
          id="language"
          label={t('settings.language.select')}
          value={language}
          onChange={(e) => handleLanguageChange(e.target.value)}
          options={[
            { value: 'ka', label: 'ქართული' },
            { value: 'en', label: 'English' },
            { value: 'de', label: 'Deutsch' },
            { value: 'ru', label: 'Русский' },
            { value: 'fr', label: 'Français' },
          ]}
        />
      </div>
    </div>
  );
}
```

---

## 📊 Database Schema

### Tables Used

1. **profiles** table
   - `id` (UUID, primary key)
   - `username` (text, unique)
   - `bio` (text, nullable)
   - `avatar_url` (text, nullable)
   - `language_preference` (text, default: 'ka') – ინახავს მომხმარებლის არჩეულ ინტერფეისის ენას და გამოიყენება როგორც საწყისი მნიშვნელობა i18n სისტემისთვის
   - `updated_at` (timestamp)

2. **Supabase Storage**
   - `avatars` bucket (for avatar images)

### RLS Policies (Summary)

- **profiles**:
  - UPDATE: მხოლოდ მომხმარებელს თავისი პროფილის (`auth.uid() = id`).
  - SELECT: ყველა authenticated მომხმარებელს შეუძლია profiles ნახვა.

> **შენიშვნა: RLS Implementation**
>
> ყველა RLS პოლიტიკა უნდა იყოს ჩაწერილი `do $$ ... end $$;` ბლოკით Supabase მიგრაციებში.

---

## 🌐 Internationalization (i18n)

### Translation Keys

```json
{
  "settings": {
    "title": "Settings",
    "save": "Save Changes",
    "saving": "Saving...",
    "profileUpdated": "Profile updated successfully",
    "languageUpdated": "Language updated successfully",
    "profile": {
      "title": "Profile Settings",
      "avatar": "Avatar",
      "username": "Username",
      "bio": "Bio"
    },
    "language": {
      "title": "Language Settings",
      "select": "Select Language"
    },
    "errors": {
      "usernameRequired": "Username is required",
      "usernameTooShort": "Username must be at least 3 characters",
      "usernameTooLong": "Username must be at most 30 characters",
      "updateFailed": "Failed to update settings"
    }
  }
}
```

---

## ✅ Requirements Checklist

- [ ] Settings page created (`/settings`)
- [ ] Profile settings form
- [ ] Avatar upload functionality
- [ ] Username validation
- [ ] Bio textarea
- [ ] Language selection
- [ ] Save functionality
- [ ] Database update (profiles table)
- [ ] RLS policies implemented
- [ ] Error handling
- [ ] i18n support (all text translatable)

---

## 🧪 Settings Page Testing Checklist (MVP)

1. ✅ Profile Settings:
   - Username edit works
   - Bio edit works
   - Avatar upload works
   - Save changes works
   - Validation works (username required, min/max length)

2. ✅ Language Settings:
   - Language selection works
   - Language change applies immediately
   - Language preference saved

3. ✅ Access Control:
   - Unauthenticated users redirected to signin
   - Only own settings editable
   - RLS policies work correctly

4. ✅ Error Handling:
   - Network errors handled
   - Validation errors handled
   - User-friendly error messages

---

## 🔄 Future Enhancements

- **Account Settings**: Change email, password, delete account
- **Notification Settings**: Email/push notification preferences
- **Privacy Settings**: Profile visibility, story visibility
- **Security Settings**: Two-factor authentication
- **Data Export**: Export user data
- **Connected Accounts**: Social media account connections

---

## 📝 Notes

- **Phase 2 Priority**: Settings Page is medium priority for Phase 2
- **Profile Editing**: Users can only edit their own profile
- **Language Preference**: Stored in profiles table and localStorage
- **Avatar Upload**: Uses Supabase Storage 'avatars' bucket
- **Validation**: Username must be 3-30 characters, unique
- **Profile Source of Truth**: პროფილის ყველა UI (username, bio, avatar, language) უნდა ეყრდნობოდეს `profiles` ცხრილს როგორც ერთიან source of truth-ს და არ უნდა ეყრდნობოდეს მხოლოდ auth user ობიექტს

---

## 🤖 Cursor Implementation Notes (Internal)

When implementing Settings Page in Cursor:

- Do NOT write code directly აქედან – გამოიყენე ეს დოკი როგორც source of truth.
- Steps:
  1. Create `/settings` route with server component.
  2. Create `SettingsPageClient` component.
  3. Implement profile settings form.
  4. Implement avatar upload.
  5. Implement language selection.
  6. Add validation.
  7. Add error handling.
  8. Add tests according to "Settings Page Testing Checklist (MVP)".

---

**Last Updated**: 2025-01-XX  
**Version**: 1.0  
**Status**: Phase 2 (User Features) - 🟢 Medium Priority

