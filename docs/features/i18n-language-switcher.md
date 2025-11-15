# Internationalization (i18n) - Language Switcher

ეს დოკუმენტაცია აღწერს ენის შეცვლის სისტემას BranchFeed-ში.

---

## 🌐 Supported Languages

### Required Languages

1. **Georgian (ka)** - ქართული
   - Language code: `ka`
   - Flag emoji: 🇬🇪
   - Default language

2. **English (en)** - English
   - Language code: `en`
   - Flag emoji: 🇬🇧
   - International standard

3. **German (de)** - Deutsch
   - Language code: `de`
   - Flag emoji: 🇩🇪
   - European market

4. **Russian (ru)** - Русский
   - Language code: `ru`
   - Flag emoji: 🇷🇺
   - Regional market

5. **French (fr)** - Français
   - Language code: `fr`
   - Flag emoji: 🇫🇷
   - European market

---

## 🎯 Implementation Requirements

> ⚠️ **Note**: This document describes **UI-side language switcher** for client components. For Next.js 15 Server Components, language detection should use cookies/headers. This is not a full SEO/route-level i18n solution (e.g., `/en/feed`, `/ka/feed`).

### Server vs Client i18n

#### Client Components (Current Implementation)

- **Language Source**: localStorage (user preference)
- **Language Switcher**: UI button in header
- **Translation Loading**: Client-side, loaded on mount
- **Use Case**: Interactive UI elements, buttons, labels

#### Server Components (Next.js 15)

- **Language Source**: Cookies or headers (e.g., `Accept-Language`)
- **Language Detection**: Server-side, before rendering
- **Translation Loading**: Server-side, included in initial HTML
- **Use Case**: Page titles, meta tags, initial content

**Example Server Component**:
```typescript
// app/page.tsx (Server Component)
import { cookies } from 'next/headers';
import { getTranslations } from '@/lib/i18n/server';

export default async function HomePage() {
  const cookieStore = await cookies();
  const lang = cookieStore.get('language')?.value || 'ka';
  const t = await getTranslations(lang);
  
  return <h1>{t('common.welcome')}</h1>;
}
```

**Important**: This document focuses on **client-side language switcher**. For full server-side i18n with route-based localization (`/en/`, `/ka/`), see future architecture documentation.

### Language Switcher Component

#### Location
- **Header/Navigation**: Always visible in header
- **Settings Page**: Available in user settings

#### Design
- **Button Style**: Outline button with language code/flag
- **Dropdown**: Shows all available languages
- **Active State**: Highlighted current language
- **Icon**: Globe icon or flag emoji

#### Functionality
- Click to open dropdown
- Select language to switch
- Persist selection in localStorage
- Update UI immediately
- Reload translations

---

## 📁 File Structure

```
src/
├── lib/
│   └── i18n/
│       ├── config.ts          # Language configuration
│       ├── translations/
│       │   ├── ka.json         # Georgian translations
│       │   ├── en.json         # English translations
│       │   ├── de.json         # German translations
│       │   ├── ru.json         # Russian translations
│       │   └── fr.json         # French translations
│       └── utils.ts            # i18n utilities
├── components/
│   └── LanguageSwitcher.tsx   # Language switcher component
└── hooks/
    └── useLanguage.ts          # Language hook
```

---

## 🔧 Implementation Details

### Language Configuration

```typescript
// src/lib/i18n/config.ts
export const languages = [
  {
    code: 'ka',
    name: 'ქართული',
    flag: '🇬🇪',
    nativeName: 'ქართული',
  },
  {
    code: 'en',
    name: 'English',
    flag: '🇬🇧',
    nativeName: 'English',
  },
  {
    code: 'de',
    name: 'Deutsch',
    flag: '🇩🇪',
    nativeName: 'Deutsch',
  },
  {
    code: 'ru',
    name: 'Русский',
    flag: '🇷🇺',
    nativeName: 'Русский',
  },
  {
    code: 'fr',
    name: 'Français',
    flag: '🇫🇷',
    nativeName: 'Français',
  },
] as const;

export const defaultLanguage = 'ka';
export type LanguageCode = typeof languages[number]['code'];
```

### Language Switcher Component

```typescript
// src/components/LanguageSwitcher.tsx
'use client';

import { useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { languages } from '@/lib/i18n/config';

export function LanguageSwitcher() {
  const { currentLanguage, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const currentLang = languages.find(lang => lang.code === currentLanguage);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <span>{currentLang?.flag}</span>
        <span className="text-sm font-medium">{currentLang?.code.toUpperCase()}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg p-2 min-w-[10rem] z-50">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setLanguage(lang.code);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                currentLanguage === lang.code
                  ? 'bg-primary-50 text-primary-700 font-semibold'
                  : 'hover:bg-gray-100'
              }`}
            >
              <span>{lang.flag}</span>
              <span className="text-sm">{lang.nativeName}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

### Language Hook

```typescript
// src/hooks/useLanguage.ts
'use client';

import { useState, useEffect } from 'react';
import { defaultLanguage, type LanguageCode } from '@/lib/i18n/config';

const STORAGE_KEY = 'branchfeed-language';

export function useLanguage() {
  const [language, setLanguageState] = useState<LanguageCode>(defaultLanguage);

  useEffect(() => {
    // Load from localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && isValidLanguage(stored)) {
      setLanguageState(stored as LanguageCode);
    }
  }, []);

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
    // Trigger translation reload
    window.dispatchEvent(new Event('languagechange'));
  };

  return {
    currentLanguage: language,
    setLanguage,
  };
}

function isValidLanguage(code: string): boolean {
  return ['ka', 'en', 'de', 'ru', 'fr'].includes(code);
}
```

---

## 📝 How Components Should Use Translations

### Translation Policy

**CRITICAL**: All UI text must come from translation files. Hardcoded text in components is not allowed.

#### Rules

1. **No Hardcoded Text**: Never write English or Georgian text directly in components
   ```tsx
   // ❌ BAD
   <button>Sign In</button>
   <h1>Welcome to BranchFeed</h1>
   
   // ✅ GOOD
   <button>{t('common.signIn')}</button>
   <h1>{t('common.welcome')}</h1>
   ```

2. **Use Translation Keys**: All text must use translation keys with dot notation
   - Format: `{namespace}.{key}` (e.g., `common.home`, `posts.createPost`)
   - Namespaces: `common`, `posts`, `stories`, `errors`, `auth`, etc.

3. **Naming Convention**:
   - **Common UI**: `common.{key}` (e.g., `common.home`, `common.settings`)
   - **Feature-specific**: `{feature}.{key}` (e.g., `posts.createPost`, `stories.createStory`)
   - **Errors**: `errors.{key}` (e.g., `errors.somethingWentWrong`)
   - **Auth**: `auth.{key}` (e.g., `auth.signIn`, `auth.signUp`)

4. **Component Example**:
   ```tsx
   'use client';
   
   import { useTranslation } from '@/hooks/useTranslation';
   
   export function CreatePostButton() {
     const { t } = useTranslation();
     
     return (
       <button>
         {t('posts.createPost')}
       </button>
     );
   }
   ```

5. **Fallback**: If translation key is missing, show key name (e.g., `common.home`) instead of crashing

---

## 📝 Translation Files Structure

### Example: en.json

```json
{
  "common": {
    "home": "Home",
    "feed": "Feed",
    "create": "Create",
    "profile": "Profile",
    "settings": "Settings",
    "signIn": "Sign In",
    "signUp": "Sign Up",
    "signOut": "Sign Out"
  },
  "posts": {
    "createPost": "Create Post",
    "editPost": "Edit Post",
    "deletePost": "Delete Post",
    "like": "Like",
    "comment": "Comment",
    "share": "Share"
  },
  "errors": {
    "somethingWentWrong": "Something went wrong",
    "tryAgain": "Try again"
  }
}
```

### Example: ka.json

```json
{
  "common": {
    "home": "მთავარი",
    "feed": "ფიდი",
    "create": "შექმნა",
    "profile": "პროფილი",
    "settings": "პარამეტრები",
    "signIn": "შესვლა",
    "signUp": "რეგისტრაცია",
    "signOut": "გასვლა"
  },
  "posts": {
    "createPost": "პოსტის შექმნა",
    "editPost": "პოსტის რედაქტირება",
    "deletePost": "პოსტის წაშლა",
    "like": "მოწონება",
    "comment": "კომენტარი",
    "share": "გაზიარება"
  },
  "errors": {
    "somethingWentWrong": "რაღაც შეცდომა მოხდა",
    "tryAgain": "სცადეთ თავიდან"
  }
}
```

---

## 🎨 UI Style

### Language Switcher Button

- **Style**: Outline button
- **Size**: Medium (py-2 px-3)
- **Border**: rounded-lg
- **Content**: Flag emoji + Language code (e.g., "🇬🇪 KA")
- **Hover**: Background color change
- **Position**: Header right side

### Language Dropdown

- **Position**: Below button, right-aligned
- **Background**: White
- **Border**: rounded-xl
- **Shadow**: shadow-lg
- **Padding**: p-2
- **Min Width**: 10rem
- **Active State**: Primary background color, semibold text

---

## ✅ Requirements Checklist

- [ ] Language switcher component created
- [ ] 5 languages configured (ka, en, de, ru, fr)
- [ ] Language persistence (localStorage)
- [ ] Translation files structure created
- [ ] Language hook implemented
- [ ] UI updates on language change
- [ ] Language switcher in header
- [ ] Language switcher in settings
- [ ] Active language highlighting
- [ ] Dropdown animations
- [ ] Mobile responsive

---

## 🔄 Future Enhancements

- Auto-detect browser language
- RTL support for Arabic/Hebrew (if needed)
- Language-specific date/time formats
- Language-specific number formats
- Translation management system
- Crowd-sourced translations
- **Localized meta tags & titles for SEO (per language)**: Each language should have its own page titles, meta descriptions, and Open Graph tags for better SEO

---

**Last Updated**: 2025-01-XX  
**Version**: 1.0  
**Status**: Active

