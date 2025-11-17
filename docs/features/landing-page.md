# Landing Page - BranchFeed

ეს დოკუმენტაცია აღწერს Landing Page-ის იმპლემენტაციას BranchFeed-ში.

---

## 📋 Overview

Landing Page არის BranchFeed-ის მთავარი გვერდი, სადაც:
- მომხმარებლები პირველად ხვდებიან პლატფორმას
- ნაჩვენებია პლატფორმის მთავარი მახასიათებლები
- მომხმარებლებს შეუძლიათ რეგისტრაცია ან შესვლა

**Route**: `/` (root route)

**Status**: 🔴 **Critical Priority** - Phase 1 (Foundation)

> ℹ️ **შენიშვნა**
>
> Landing Page არის **ერთადერთი სრული public გვერდი**, სადაც მომხმარებელი პირველად ხედავს BranchFeed-ს.
>
> ყველა დანარჩენი ძირითადი ფუნქციური გვერდი (ფიდი, პოსტის შექმნა, პროფილი და ა.შ.) არის დაცული (`Authentication System` დოკუმენტში აღწერილ წესებზე დაყრდნობით).

> ℹ️ **Cursor-ზე**
>
> ამ ფაილში მოყვანილი კომპონენტები (`HeroSection`, `FeaturesSection`) არის **სტრუქტურის მაგალითები**.
>
> რეალური იმპლემენტაცია უნდა შეიქმნას Cursor-ის მიერ, `.cursorrules` და
>
> `docs/PROJECT_PRIORITIES.md` ფაილებში აღწერილი წესების დაცვით.

---

## 🎯 Features

### Core Features (MVP - Phase 1)

1. **Hero Section**
   - Main headline (BranchFeed-ის კონცეფცია)
   - Subheadline (რა არის BranchFeed)
   - CTA buttons (Sign Up, Sign In)
   - Visual element (image/video placeholder)

2. **Features Section**
   - Branching Stories feature highlight
   - A/B Choices feature highlight
   - Path Tracking feature highlight
   - Simple icons/illustrations

3. **Navigation Header**
   - Logo
   - Navigation links (optional for MVP)
   - Sign Up / Sign In buttons
   - Language switcher

#### Navigation ქცევის წესები (MVP)

- Header-ზე Navigation links შეიძლება იყოს მინიმალური (მაგალითად: "Home", "Features").

- ძირითადი ღილაკებია: **Sign Up** (primary) და **Sign In** (outline).

- Landing Page-ზე **არ უნდა გამოჩნდეს** ავტორიზებული მომხმარებლის მენიუ (პროფილი, Sign Out და სხვა) –
  თუ მომხმარებელი უკვე ავტორიზებულია, `/`იდან ავტომატურად გადადის `/feed`-ზე (იხ. ქვემოთ „Redirect Logic").

- ენის გადამრთველი (Language Switcher) უნდა იყოს **ყოველთვის მხედველობაში** Header-ში,
  ტოლის წესებით, როგორც `Internationalization (i18n) - Language Switcher` დოკშია აღწერილი.

4. **Footer** (optional for MVP)
   - Basic footer with links
   - Copyright information

### ❌ რას არ ვამატებთ MVP Landing-ზე

MVP ვერსიაში Landing Page **უნდა იყოს მაქსიმალურად მარტივი**:

- არ ვამატებთ Pricing სექციას, სანამ მონეტიზაცია არ გახდება აქტუალური.

- არ ვამატებთ Testimonials/Blog სექციებს, სანამ ძირითადი ფუნქციონალი არ იმუშავებს.

- არ ვამატებთ მძიმე ანიმაციებს, ვიდეოებსა და 3D გრაფიკას, თუ ეს აშკარად არ არის აუცილებელი.

- არ ვამატებთ ავტო-თამაშებად ვიდეო background-ს (ეს გადადის „Future Enhancements" სექციაში).

მიზანი: Landing Page Phase 1-ში უნდა ემსახურებოდეს **ერთ მიზანს** –
მომხმარებელი ან დარეგისტრირდეს, ან შევა თავის ანგარიშში.

---

## 📐 Page Layout

### Structure

```
┌─────────────────────────────────────┐
│  Header                             │
│  [Logo] [Sign Up] [Sign In]         │
├─────────────────────────────────────┤
│  Hero Section                       │
│  [Headline]                         │
│  [Subheadline]                      │
│  [CTA Buttons]                      │
│  [Visual Element]                   │
├─────────────────────────────────────┤
│  Features Section                   │
│  [Feature 1] [Feature 2] [Feature 3]│
├─────────────────────────────────────┤
│  Footer (optional)                  │
│  [Links] [Copyright]                │
└─────────────────────────────────────┘
```

### Layout Components

1. **Header** - Logo, navigation, auth buttons, language switcher
2. **HeroSection** - Main headline, subheadline, CTA buttons, visual
3. **FeaturesSection** - Feature highlights with icons
4. **Footer** - Basic footer (optional)

---

## 🎨 UI Components

### HeroSection Component

```typescript
// src/components/landing/HeroSection.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/Button';

export function HeroSection() {
  const router = useRouter();
  const { t } = useTranslation();
  
  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 px-4 py-20">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Text Content */}
        <div className="text-center lg:text-left">
          <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            {t('landing.hero.title')}
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            {t('landing.hero.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Button
              variant="primary"
              size="lg"
              onClick={() => router.push('/signup')}
            >
              {t('landing.hero.signUp')}
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => router.push('/signin')}
            >
              {t('landing.hero.signIn')}
            </Button>
          </div>
        </div>
        
        {/* Visual Element */}
        <div className="hidden lg:block">
          <div className="bg-white rounded-2xl p-8 shadow-xl">
            {/* Placeholder for BranchFeed visual */}
            <div className="aspect-video bg-gradient-to-br from-primary-100 to-secondary-100 rounded-lg flex items-center justify-center">
              <span className="text-4xl">🌿</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

**UI Style** (see `UI_STYLE_GUIDE.md`):
- Hero section: `min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50`
- Headline: `text-5xl lg:text-6xl font-bold text-gray-900`
- CTA buttons: Primary and Outline variants

### FeaturesSection Component

```typescript
// src/components/landing/FeaturesSection.tsx
'use client';

import { useTranslation } from '@/hooks/useTranslation';

const features = [
  {
    icon: '🌿',
    titleKey: 'landing.features.branching.title',
    descriptionKey: 'landing.features.branching.description',
  },
  {
    icon: '🎯',
    titleKey: 'landing.features.choices.title',
    descriptionKey: 'landing.features.choices.description',
  },
  {
    icon: '📍',
    titleKey: 'landing.features.paths.title',
    descriptionKey: 'landing.features.paths.description',
  },
];

export function FeaturesSection() {
  const { t } = useTranslation();
  
  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          {t('landing.features.title')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-gray-50 rounded-2xl p-6 text-center"
            >
              <div className="text-5xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {t(feature.titleKey)}
              </h3>
              <p className="text-gray-600">
                {t(feature.descriptionKey)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

**UI Style**:
- Features grid: `grid grid-cols-1 md:grid-cols-3 gap-8`
- Feature cards: `bg-gray-50 rounded-2xl p-6`

---

## 🔧 Implementation

### Redirect Logic (Auth-თან კოორდინაცია)

Landing Page-ის ქცევა უნდა იყოს თანხვედრაში `Authentication System` დოკუმენტთან:

- თუ მომხმარებელი **არ არის ავტორიზებული** → `/` აჩვენებს Landing Page-ს (Hero + Features).

- თუ მომხმარებელი **უკვე ავტორიზებულია** → `/` უნდა გადააგზავნოს `/feed`-ზე.

- ეს ლოგიკა უნდა იყოს ერთნაირად გაწერილი:
  - `app/page.tsx` ფაილში (server-side redirect),
  - და საჭიროების შემთხვევაში Middleware დონეზე (იხ. `Authentication System` დოკი).

### Landing Page Route

```typescript
// app/page.tsx
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { Header } from '@/components/Header';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';

export default async function LandingPage() {
  // Redirect to feed if already authenticated
  const user = await getCurrentUser();
  if (user) {
    redirect('/feed');
  }
  
  return (
    <div className="min-h-screen">
      <Header />
      <HeroSection />
      <FeaturesSection />
    </div>
  );
}
```

---

## 📱 Responsive Layout

Landing page must be fully responsive across different screen sizes.

### Mobile (≤ 640px)

- **Hero Section**:
  - Single column layout
  - Headline: `text-4xl` (smaller)
  - CTA buttons: Stacked vertically, full width
  - Visual element: Hidden or below text

- **Features Section**:
  - Single column (`grid-cols-1`)
  - Feature cards: Full width

### Tablet (≥ 768px)

- **Hero Section**:
  - Two column layout (`md:grid-cols-2`)
  - Visual element: Visible

- **Features Section**:
  - Two columns (`md:grid-cols-2`)

### Desktop (≥ 1024px)

- **Hero Section**:
  - Two column layout (`lg:grid-cols-2`)
  - Larger text sizes
  - More spacing

- **Features Section**:
  - Three columns (`lg:grid-cols-3`)

### Responsive პრიორიტეტები

- დიზაინი არის **Mobile First** – პირველად ვამოწმებთ, როგორ მუშაობს გვერდი პატარა ეკრანებზე.

- Hero ტექსტი **არ უნდა გახდეს** იმდენად დიდი, რომ 1 ეკრანზე არ ეტეოდეს მთავარ CTA-ებთან ერთად.

- CTA ღილაკები პატარა ეკრანებზე უნდა იყოს სრულ სიგანეზე (`full width` სტილი).

- Visual ელემენტი (placeholder/სურათი) პატარა ეკრანებზე შეიძლება მთლიანად აიწყოს ან გადავიდეს ტექსტის ქვემოთ –
  მთავარია, რომ ტექსტი და ღილაკები არ დაიფაროს.

---

## 🌐 Internationalization (i18n)

### Translation Keys

Add to translation files (see `features/i18n-language-switcher.md`):

```json
{
  "landing": {
    "hero": {
      "title": "Create Branching Stories",
      "subtitle": "Tell interactive stories with A/B choices. Let your audience shape the narrative.",
      "signUp": "Get Started",
      "signIn": "Sign In"
    },
    "features": {
      "title": "Why BranchFeed?",
      "branching": {
        "title": "Branching Stories",
        "description": "Create interactive narratives with multiple paths and choices."
      },
      "choices": {
        "title": "A/B Choices",
        "description": "Let your audience choose the direction of the story."
      },
      "paths": {
        "title": "Path Tracking",
        "description": "Track your audience's journey through different story paths."
      }
    }
  }
}
```

**Georgian translations**:
```json
{
  "landing": {
    "hero": {
      "title": "შექმენით განშტოებული ისტორიები",
      "subtitle": "თხრობეთ ინტერაქტიული ისტორიები A/B არჩევანებით. მიეცით თქვენს აუდიტორიას ნარატივის ფორმირების საშუალება.",
      "signUp": "დაწყება",
      "signIn": "შესვლა"
    },
    "features": {
      "title": "რატომ BranchFeed?",
      "branching": {
        "title": "განშტოებული ისტორიები",
        "description": "შექმენით ინტერაქტიული ნარატივები მრავალი გზით და არჩევანებით."
      },
      "choices": {
        "title": "A/B არჩევანები",
        "description": "მიეცით თქვენს აუდიტორიას ისტორიის მიმართულების არჩევის საშუალება."
      },
      "paths": {
        "title": "გზის თვალყურდევნება",
        "description": "თვალყურდევნეთ თქვენი აუდიტორიის მოგზაურობას სხვადასხვა ისტორიის გზებზე."
      }
    }
  }
}
```

---

## ✍️ Copywriting წესები Landing Page-სთვის

Landing Page-ის ტექსტები უნდა იყოს:

- **კონკრეტული და მოკლე** – 1 ძირითადი headline + 1 მოკლე subheadline.

- ორივე ენაზე (ქართული/ინგლისური) უნდა გადმოსცემდეს ერთსა და იმავე იდეას:
  *BranchFeed = განშტოებული, ინტერაქტიული ისტორიები / ფიდი*.

- CTA ღილაკების ტექსტები (Sign Up / Get Started) **არ უნდა იცვლებოდეს ხშირად**,
  რომ მეხსიერებაში დარჩეს როგორც ფიქსირებული მოქმედებები.

- ყველა ტექსტი, რომელიც გამოიყენება Landing-ზე, უნდა იყოს აღწერილი i18n JSON ფაილებში
  (`landing.hero.*`, `landing.features.*`), რომ შემდეგ იოლად შევცვალოთ ტექსტი კოდში ცვლილებების გარეშე.

---

## 🎨 Related Documentation

- **Header/Navigation**: See `docs/features/header-navigation.md` (to be created)
- **Button Component**: See `docs/UI_STYLE_GUIDE.md` for button styles
- **Authentication**: See `docs/features/authentication.md` for auth flow

---

## ✅ Requirements Checklist

- [x] Landing page route (`/`) implemented
- [x] Header component integrated
- [x] HeroSection component created
- [x] FeaturesSection component created
- [x] CTA buttons (Sign Up, Sign In) working
- [x] Redirect to feed if already authenticated
- [x] Responsive design (mobile, tablet, desktop)
- [x] i18n translations added
- [x] Visual elements (placeholder or actual)
- [x] Error handling
- [x] Loading states (if needed)

---

## 🧪 Landing Page Testing Checklist (MVP)

Phase 1-ში Landing Page რომ ჩავთვალოთ დასრულებულად, უნდა გაიაროს ასეთი ტესტები:

1. ✅ არაუთენტიფიცირებული მომხმარებელი → მხოლოდ Landing Page-ს ხედავს `/` როუტზე.

2. ✅ ავტორიზებული მომხმარებელი → `/` ავტომატურად გადასდევს `/feed`-ზე (არ ხედავს Landing-ს).

3. ✅ "დაწყება" / "Get Started" (Sign Up CTA) → გადადის სწორად `/signup` გვერდზე.

4. ✅ "შესვლა" / "Sign In" CTA → გადადის სწორად `/signin` გვერდზე.

5. ✅ ენის გადამრთველი მუშაობს:
   - ქართულზე → სათაური/ქვე-სათაური და Features ტექსტები ქართულად ჩანს;
   - ინგლისურზე → იგივე სტრუქტურა, ტექსტები ინგლისურად.

6. ✅ Mobile შრიფტები და ღილაკები ეკრანზე არ იჭრება (Headline + CTA-ები ეტევა 1–1.5 სკროლში).

7. ✅ Lighthouse / Performance ტესტი – Landing Page-ზე არ არის მძიმე asset-ები,
   რომელი Phase 1-ისთვის არ გვჭირდება (ვიდეო background და მსგავსი).

---

## 🔄 Future Enhancements

- **Video Background**: Hero section with video background
- **Interactive Demo**: Live demo of branching story
- **Testimonials Section**: User testimonials
- **Pricing Section**: If monetization is added
- **FAQ Section**: Frequently asked questions
- **Blog Section**: Latest blog posts
- **Social Proof**: User count, story count, etc.

> ℹ️ **შენიშვნა**
>
> Video Background, Pricing, FAQ, Blog და Social Proof სექციები დეტალურად უნდა
>
> გაწერილ იქნას ცალკე დოკუმენტებში (მაგალითად: `SEO_AND_LANDING_ENHANCEMENTS.md`,
>
> `PRICING_AND_MONETIZATION.md`), სანამ რეალურად დაემატება პროდაქშენ Landing Page-ს.

---

## 📝 Notes

- **Phase 1 Priority**: Landing page is the first impression of BranchFeed
- **Simple & Clear**: Keep messaging simple and focused on core value proposition
- **BranchFeed Focus**: Emphasize branching stories as the core feature
- **Mobile First**: Design for mobile first, then scale up
- **Performance**: Optimize images and assets for fast loading

---

**Last Updated**: 2025-01-XX  
**Version**: 1.0  
**Status**: Phase 1 (Foundation) - Critical Priority

---

## Improvements (2025-01)

- Redirect Edge Case: In addition to server redirect on `/`, verify session validity in middleware to handle expired sessions gracefully.
- Hero Visual: Replace placeholder emoji with SVG/`next/image` asset, lazy-loaded; keep explicit width/height to avoid CLS.
- Responsive CTA: Ensure hero has `max-h-screen` and CTA remains within first viewport on small screens.

---

