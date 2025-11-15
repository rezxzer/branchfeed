# Header / Navigation - BranchFeed

ეს დოკუმენტაცია აღწერს Header/Navigation კომპონენტის იმპლემენტაციას BranchFeed-ში.

---

## 📋 Overview

Header/Navigation არის BranchFeed-ის მთავარი ნავიგაციის კომპონენტი, რომელიც:
- გამოიყენება ყველა გვერდზე
- შეიცავს Logo-ს, Navigation links-ს, Auth buttons-ს და Language switcher-ს
- არის responsive და ადაპტირდება სხვადასხვა ეკრანის ზომაზე

**Location**: `src/components/Header.tsx`

**Status**: 🔴 **Critical Priority** - Phase 1 (Foundation)

> ℹ️ Auth გვერდებზე ქცევა
> `/signup` და `/signin` გვერდებზე Header უნდა ჩაირთოს „მსუბუქ რეჟიმში":
> - ჩანს მხოლოდ **Logo** და **Language Switcher**;
> - არ ჩანს Navigation ლინკები (Feed, Create, Profile);
> - არ ჩანს Sign In / Sign Up ღილაკები, რადგან ეს გვერდები თავად არის auth ფორმები;
> - ავტორიზებულ მომხმარებელს ამ გვერდებზე მაინც Middleware/Server redirect გადაიტანს `/feed`-ზე.

---

## 🎯 Features

### Core Features (MVP - Phase 1)

1. **Logo**
   - BranchFeed logo
   - Link to home page (`/`)
   - Responsive sizing

2. **Navigation Links** (optional for MVP)
   - Feed link (`/feed`)
   - Create link (`/create`)
   - Profile link (`/profile/[id]`)

   > Protected Routes
   > Navigation Links (Feed, Create, Profile) მიუთითებს **დაცულ როუთებზე**.
   > თვითონ Header მხოლოდ ლინკებს აჩვენებს; რეალურ დაცვას უზრუნველყოფს:
   > - `middleware.ts` (unauthenticated → `/signin`),
   > - შიდა გვერდების server-side redirect-ები (auth check).

   - Admin Link (Phase 3+):
     - „Admin" ნავიგაციის პუნქტი ან User Menu-ის item-ი
     - ჩანს მხოლოდ მაშინ, როცა მომხმარებელს აქვს admin როლი
     - იხ. `docs/features/admin-dashboard.md` როლის შემოწმებისთვის (`is_admin()` / `useAdminPermissions()`).

3. **Auth Buttons**
   - Sign Up button (if not authenticated)
   - Sign In button (if not authenticated)
   - User menu (if authenticated)
     - Profile link
     - Settings link
     - Sign Out button

4. **Language Switcher**
   - Language selection button
   - 5 languages: Georgian, English, German, Russian, French
   - See `docs/features/i18n-language-switcher.md` for details

5. **Mobile Menu** (responsive)
   - Hamburger menu for mobile
   - Collapsible navigation
   - Mobile-friendly layout

---

## 📐 Component Structure

### Desktop Layout

```
┌─────────────────────────────────────────────────────┐
│  [Logo]  [Feed] [Create]  [Language] [User Menu]   │
└─────────────────────────────────────────────────────┘
```

### Mobile Layout

```
┌─────────────────────────────────────┐
│  [☰] [Logo]  [Language] [User]      │
└─────────────────────────────────────┘
│  (Hamburger Menu - Collapsed)       │
│  [Feed] [Create] [Profile] [Sign Out]│
└─────────────────────────────────────┘
```

### Layout Components

1. **HeaderContainer** - Main header wrapper
2. **Logo** - BranchFeed logo with link
3. **NavigationLinks** - Navigation menu (desktop)
4. **AuthButtons** - Sign Up/Sign In buttons or User menu
5. **LanguageSwitcher** - Language selection button
6. **MobileMenu** - Hamburger menu for mobile

---

## 🎨 UI Components

### Header Component

```typescript
// src/components/Header.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Button } from '@/components/ui/Button';

export function Header() {
  const router = useRouter();
  const { user, signOut, isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };
  
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-primary-600">🌿</span>
              <span className="ml-2 text-xl font-bold text-gray-900 hidden sm:block">
                BranchFeed
              </span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {isAuthenticated && (
              <>
                <Link
                  href="/feed"
                  className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                >
                  {t('nav.feed')}
                </Link>
                <Link
                  href="/create"
                  className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                >
                  {t('nav.create')}
                </Link>
              </>
            )}
          </nav>
          
          {/* Right Side: Language Switcher + Auth */}
          <div className="flex items-center space-x-4">
            {/* Language Switcher */}
            <LanguageSwitcher />
            
            {/* Auth Buttons / User Menu */}
            {isAuthenticated ? (
              <div className="relative">
                {/* User Menu Button */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-primary-600"
                >
                  <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-primary-600 font-semibold">
                      {user?.email?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <span className="hidden sm:block">{user?.email}</span>
                </button>
                
                {/* User Menu Dropdown (Desktop) */}
                <div className="hidden md:block absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200">
                  <div className="py-2">
                    <Link
                      href={`/profile/${user?.id}`}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      {t('nav.profile')}
                    </Link>
                    <Link
                      href="/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      {t('nav.settings')}
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      {t('auth.signOut.button')}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/signin')}
                >
                  {t('nav.signIn')}
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => router.push('/signup')}
                >
                  {t('nav.signUp')}
                </Button>
              </div>
            )}
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-700 hover:text-primary-600"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <nav className="flex flex-col space-y-2">
              {isAuthenticated ? (
                <>
                  <Link
                    href="/feed"
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t('nav.feed')}
                  </Link>
                  <Link
                    href="/create"
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t('nav.create')}
                  </Link>
                  <Link
                    href={`/profile/${user?.id}`}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t('nav.profile')}
                  </Link>
                  <Link
                    href="/settings"
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t('nav.settings')}
                  </Link>
                  <button
                    onClick={() => {
                      handleSignOut();
                      setMobileMenuOpen(false);
                    }}
                    className="px-4 py-2 text-left text-red-600 hover:bg-gray-100 rounded-lg"
                  >
                    {t('auth.signOut.button')}
                  </button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      router.push('/signin');
                      setMobileMenuOpen(false);
                    }}
                  >
                    {t('nav.signIn')}
                  </Button>
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={() => {
                      router.push('/signup');
                      setMobileMenuOpen(false);
                    }}
                  >
                    {t('nav.signUp')}
                  </Button>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
```

**UI Style** (see `UI_STYLE_GUIDE.md`):
- Header: `bg-white border-b border-gray-200 sticky top-0 z-50`
- Logo: `text-2xl font-bold text-primary-600`
- Navigation links: `text-gray-700 hover:text-primary-600 font-medium`
- User menu: `bg-white rounded-lg shadow-lg border border-gray-200`

---

## 📱 Responsive Layout

Header must be fully responsive across different screen sizes.

### Mobile (≤ 768px)

- **Layout**:
  - Hamburger menu button visible
  - Logo and language switcher visible
  - User menu button visible
  - Desktop navigation hidden

- **Mobile Menu**:
  - Collapsible menu below header
  - Full width navigation links
  - Stacked layout

### Tablet (≥ 768px)

- **Layout**:
  - Desktop navigation visible
  - Hamburger menu hidden
  - Full navigation bar

### Desktop (≥ 1024px)

- **Layout**:
  - Full navigation bar
  - More spacing between elements
  - User menu dropdown

---

## 🔧 Implementation Details

### Authentication State

Header component uses `useAuth()` hook to determine:
- If user is authenticated → show User Menu
- If user is not authenticated → show Sign Up/Sign In buttons

### User Menu (Desktop) წესები

- Desktop-ზე User Menu (Profile, Settings, Sign Out) უნდა ჩანდეს მხოლოდ მაშინ, როცა:
  - მომხმარებელი არის ავტორიზებული (`isAuthenticated === true`);
  - User Menu state (`userMenuOpen`) არის true.

- Dropdown-ის default მდგომარეობა უნდა იყოს დახურული.

- Dropdown მდებარეობს Header-ის მარჯვენა ზღვართან და არ ფარავს Logo-ს ან Navigation-ს.

### Navigation Links

Navigation links are conditionally rendered based on:
- Authentication state
- User permissions (future)
- Current route (active state)

### Mobile Menu

Mobile menu is controlled by `mobileMenuOpen` state:
- Opens/closes on hamburger button click
- Closes when navigation link is clicked
- Closes on outside click (optional)

### Active Route Highlighting (optional)

- Header უნდა გამოიყენებდეს `usePathname()` (Next.js) hook-ს, რომ განსაზღვროს current route.

- Active ბმული (მაგ. `/feed`) შეიძლება გამოიხატოს:
  - სხვა ფერში (`text-primary-600`),
  - ქვედა ხაზით (`border-b-2 border-primary-600`),
  - ან სხვა subtle სტილით.

- Mobile მენიუშიც იგივე active წესები უნდა იმოქმედოს, რომ მომხმარებელმა იცოდეს სად იმყოფება.

### State Management წესები

- Mobile მენიუ და Desktop User Dropdown უნდა იმართებოდეს **განსხვავებული state-ებით**:
  - `mobileMenuOpen` → აკონტროლებს მხოლოდ hamburger მენიუს (`md:hidden` ბლოკი).
  - `userMenuOpen` → აკონტროლებს მხოლოდ Desktop user dropdown-ს.

- Avatar ღილაკზე დაჭერამ არ უნდა გახსნას/დახუროს Mobile მენიუ.

- ორივე მენიუმ:
  - უნდა დაიხუროს, როცა მომხმარებელი გადადის სხვა როუთზე;
  - შეიძლება დაიხუროს Esc ღილაკზე ან header-ის გარეთ დაკლიკებაზე (Future Enhancement).

> **Implementation detail – ორ განსხვავებულ state-ზე გაფრთხილება**
>
> Production ვერსიაში Desktop User Dropdown და Mobile Menu არ უნდა იყოფდეს ერთსა და იმავე state-ს.
> აუცილებელია:
> - `mobileMenuOpen` მართავდეს მხოლოდ hamburger/mobile მენიუს გახსნა–დახურვას;
> - `userMenuOpen` მართავდეს მხოლოდ Desktop user dropdown-ს (Profile / Settings / Sign Out).
>
> ზემოთ მოყვანილი კოდის სნიპეტი შეიძლება იყოს გამარტივებული მაგალითი,
> მაგრამ რეალური იმპლემენტაციის დროს ეს ორი state განცალკევებული უნდა იყოს,
> რომ თავიდან ავიცილოთ ბაგები (მაგალითად, avatar-ზე დაჭერამ რომ არ გახსნას mobile მენიუ და პირიქით).

---

## 🌐 Internationalization (i18n)

### Translation Keys

Add to translation files (see `features/i18n-language-switcher.md`):

```json
{
  "nav": {
    "feed": "Feed",
    "create": "Create",
    "profile": "Profile",
    "settings": "Settings",
    "signIn": "Sign In",
    "signUp": "Sign Up"
  }
}
```

**Georgian translations**:
```json
{
  "nav": {
    "feed": "გვერდი",
    "create": "შექმნა",
    "profile": "პროფილი",
    "settings": "პარამეტრები",
    "signIn": "შესვლა",
    "signUp": "რეგისტრაცია"
  }
}
```

> i18n შეთანხმება
> Header-ში გამოყენებული ყველა key (`nav.feed`, `nav.create`, `nav.profile`, `nav.settings`, `nav.signIn`, `nav.signUp`)
> უნდა ემთხვეოდეს იმავე სახელების გამოყენებას სხვა დოკებში (Landing, Auth Pages).
> Sign Out ღილაკი იყენებს `auth.signOut.button` key-ს, რომელიც აღწერილია `Authentication System` დოკუმენტში.
>
> **შენიშვნა ქართულ ვერსიაზე**: `nav.feed`-ისთვის შეიძლება აირჩეს "ფიდი" ან "ნიუსფიდი" – როგორც გადაწყვეტ.

---

## 🎨 Related Documentation

- **Language Switcher**: See `docs/features/i18n-language-switcher.md` for LanguageSwitcher component
- **Button Component**: See `docs/UI_STYLE_GUIDE.md` for button styles
- **Authentication**: See `docs/features/authentication.md` for auth logic

---

## ✅ Requirements Checklist

- [ ] Header component created
- [ ] Logo with link to home page
- [ ] Navigation links (Feed, Create) for authenticated users
- [ ] Auth buttons (Sign Up, Sign In) for non-authenticated users
- [ ] User menu for authenticated users
- [ ] Language switcher integrated
- [ ] Mobile menu (hamburger) implemented
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Sticky header (stays at top on scroll)
- [ ] Active route highlighting (optional)
- [ ] i18n translations
- [ ] Sign out functionality
- [ ] User avatar/initial display
- [ ] Separate state for desktop user dropdown (`userMenuOpen`) and mobile menu (`mobileMenuOpen`)

---

## 🧪 Header Testing Checklist (MVP)

1. ✅ არაუთენტიფიცირებული მომხმარებელი:
   - `/` → Header აჩვენებს Logo-ს, Language Switcher-ს და Sign In / Sign Up ღილაკებს.
   - `/signup` / `/signin` → Header-ში მხოლოდ Logo + Language (auth ფორმები არ მეორდება Header-ში).

2. ✅ ავტორიზებული მომხმარებელი:
   - `/feed` → Header აჩვენებს Feed/Create ლინკებს + User Menu-ს.
   - Avatar-ს დაჭერაზე იხსნება User Dropdown; სხვა ადგილას დაკლიკებისას იკეტება (თუ ეს ქცევა იქნება დანერგილი).

3. ✅ Mobile:
   - ≤768px → ჩანს hamburger ღილაკი, Desktop nav იმალება.
   - Hamburger-ზე დაჭერით იხსნება მენიუ, ლინკზე დაჭერით მენიუ იკეტება.

4. ✅ Sign Out:
   - User Menu → Sign Out დაჭერაზე ხურავს session-ს და გადაყვანს `/`-ზე.
   - `/`-ზე დაბრუნებულზე Header უნდა იქცეოდეს „guest" რეჟიმში (Sign In / Sign Up).

5. ✅ Language Switcher:
   - ენის შეცვლაზე მყისიერად იცვლება Header-ის ტექსტები (`nav.*` და auth ღილაკები).

---

## 🔄 Future Enhancements

- **Notifications Badge**: Show notification count in header
- **Search Bar**: Global search in header (Phase 2+)
- **Breadcrumbs**: Navigation breadcrumbs for deep pages
- **Quick Actions**: Quick action buttons (create story, etc.)
- **User Dropdown Enhancements**: More menu options, user stats
- **Theme Toggle**: Dark/light theme switcher (optional)

---

## 📝 Notes

- **Phase 1 Priority**: Header is used on all pages, critical for navigation
- **Sticky Header**: Header stays at top when scrolling
- **Mobile First**: Design for mobile first, then scale up
- **Accessibility**: Ensure navigation is keyboard accessible
- **Performance**: Header should be lightweight and fast
- **Admin Roles**: Admin როლების არსებობის შემთხვევაში Header-ში Admin ბმული უნდა იხელმძღვანელოს იმავე permission-ებით, რაც Admin Dashboard დოკშია აღწერილი.
- **Keyboard Navigation**: Navigation ბმულები და მენიუ ღილაკები უნდა იყვნენ focus-ით მისადგენი (`tab`),
  და ჰქონდეთ მკაფიო focus-სტილი, რომ კლავიატურით ნავიგაციაც კომფორტული იყოს.

---

**Last Updated**: 2025-01-XX  
**Version**: 1.0  
**Status**: Phase 1 (Foundation) - Critical Priority

