# UI Style Guide - BranchFeed

ეს დოკუმენტაცია განსაზღვრავს UI-ის სტილს, ღილაკების დიზაინს, ფერებს, typography-ს და სხვა დიზაინის ელემენტებს.

---

## 🎭 Brand Mood & Theme – BranchFeed

**Dark-first, neon-გრადიენტები, „cinematic story" vibe**

BranchFeed არის ინტერაქტიული branching stories პლატფორმა, სადაც მომხმარებლები შექმნიან და გააკეთებენ „cinematic narrative" გამოცდილებას. UI-მ უნდა გადმოსცეს:

- **„Interactive narrative"** გრძნობა
- **„წასული TikTok/Netflix hybrid"** მომავალი
- **„Cinematic story"** ატმოსფერო

### ძირითადი ფერები

- **იასამნისფერი + ინდიگو + ციანი** – branch-ების ხაზგასმისთვის
- **Neon gradients** – choice ღილაკებზე და ჰედერზე
- **Dark backgrounds** – video content-ისთვის

### ვიზუალური სტილი

- **ღილაკები და choice-ები**: ძლიერი გრადიენტები
- **ბარათები**: წყნარი, სუფთა ფონები
- **Gradient-first** პლატფორმა, არა ბრტყელი ფერები

---

## 🎨 Color Palette

### Primary Colors

```css
/* Primary Blue - Main brand color */
--color-primary-50: #eff6ff;
--color-primary-100: #dbeafe;
--color-primary-200: #bfdbfe;
--color-primary-300: #93c5fd;
--color-primary-400: #60a5fa;
--color-primary-500: #3b82f6; /* Main primary */
--color-primary-600: #2563eb;
--color-primary-700: #1d4ed8;
--color-primary-800: #1e40af;
--color-primary-900: #1e3a8a;
```

### Secondary Colors

```css
/* Secondary Purple - Accent color */
--color-secondary-50: #faf5ff;
--color-secondary-100: #f3e8ff;
--color-secondary-200: #e9d5ff;
--color-secondary-300: #d8b4fe;
--color-secondary-400: #c084fc;
--color-secondary-500: #a855f7; /* Main secondary */
--color-secondary-600: #9333ea;
--color-secondary-700: #7e22ce;
--color-secondary-800: #6b21a8;
--color-secondary-900: #581c87;
```

### Neutral Colors

```css
/* Grays - Text, backgrounds, borders */
--color-gray-50: #f9fafb;
--color-gray-100: #f3f4f6;
--color-gray-200: #e5e7eb;
--color-gray-300: #d1d5db;
--color-gray-400: #9ca3af;
--color-gray-500: #6b7280;
--color-gray-600: #4b5563;
--color-gray-700: #374151;
--color-gray-800: #1f2937;
--color-gray-900: #111827;
```

### Semantic Colors

```css
/* Success - Green */
--color-success: #10b981;
--color-success-light: #d1fae5;
--color-success-dark: #059669;

/* Error/Danger - Red */
--color-error: #ef4444;
--color-error-light: #fee2e2;
--color-error-dark: #dc2626;

/* Warning - Yellow */
--color-warning: #f59e0b;
--color-warning-light: #fef3c7;
--color-warning-dark: #d97706;

/* Info - Blue */
--color-info: #3b82f6;
--color-info-light: #dbeafe;
--color-info-dark: #2563eb;
```

### Background Colors

```css
--color-bg-primary: #ffffff;
--color-bg-secondary: #f9fafb;
--color-bg-tertiary: #f3f4f6;
--color-bg-overlay: rgba(0, 0, 0, 0.5);
```

### Brand Core Colors

```css
/* Brand Core */
--color-brand-iris: #4f46e5;   /* Indigo - ძირითადი ბრენდი */
--color-brand-plum: #a855f7;   /* Electric Purple - აქცენტები */
--color-brand-cyan: #22d3ee;   /* Neon Cyan - highlight / hover */

/* Branch Specific */
--color-branch-a: #4f46e5;     /* Choice A – Indigo */
--color-branch-b: #ec4899;     /* Choice B – Pink/Magenta */

/* VIP & Premium */
--color-vip-gold: #fbbf24;     /* VIP badges, crowns, highlights */
--color-pro-amber: #f97316;    /* Pro tier accents */
```

---

## 🎨 Gradients

BranchFeed იყენებს gradient-first არქიტექტურას choice ღილაკებისა და ჰედერისთვის.

### Brand Gradients

```css
/* Brand Gradients */
--gradient-brand: linear-gradient(135deg, #4f46e5, #a855f7);
--gradient-branch: linear-gradient(135deg, #4f46e5, #22d3ee);
--gradient-danger: linear-gradient(135deg, #f97316, #ef4444);

/* VIP / Premium */
--gradient-vip: linear-gradient(135deg, #fbbf24, #a855f7);
--gradient-pro: linear-gradient(135deg, #22d3ee, #4f46e5);
```

### Usage Rules

- **Choice Buttons**:
  - Default Branch A: `--gradient-branch`
  - Default Branch B: `--gradient-brand`
  - VIP-only choices: `--gradient-vip`

- **Header / Navigation**: Subtle `--gradient-brand` on dark background

---

## 🌑 Theme Modes

BranchFeed არის **dark-first** UI, განსაკუთრებით video content-ისთვის.

### Light Theme

```css
/* Light Theme */
--bg-surface: #ffffff;
--bg-elevated: #f9fafb;
--bg-soft: #0f172a0a; /* subtle tint overlays */

--text-main: #0f172a;
--text-dark: #0f172a;
--text-muted: #6b7280;
```

### Dark Theme

```css
/* Dark Theme */
--bg-dark: #020617;        /* very dark navy */
--bg-dark-elevated: #0b1120;
--bg-dark-card: #1e293b;   /* slightly lighter for cards */
--border-dark-subtle: #334155;

--text-light: #e5e7eb;
--text-light-muted: #9ca3af;
```

### Theme Rules

- **Story Player, Feed main background** – `--bg-dark`
- **Cards / Modals** – `--bg-dark-card` (slightly lighter)
- **Primary text** – `--text-light`, subtle – `--text-light-muted`
- **Borders** – `--border-dark-subtle`

---

## 📐 Elevation / Depth Levels

BranchFeed იყენებს depth tokens-ს „cinema card" შეგრძნებისთვის – თითქოს ყველაფერი ოდნავ ჰაერში კიდია.

### Surface Levels

```css
/* Depth Levels */
--surface-level-0: transparent;          /* page background */
--surface-level-1: rgba(15, 23, 42, 0.85); /* cards on dark */
--surface-level-2: rgba(15, 23, 42, 0.92); /* modals / drawers */
--surface-level-3: rgba(15, 23, 42, 0.98); /* toasts / top overlays */
```

### Shadow Levels

```css
--shadow-level-1: 0 10px 25px rgba(15, 23, 42, 0.3);
--shadow-level-2: 0 20px 40px rgba(15, 23, 42, 0.45);
--shadow-level-3: 0 30px 60px rgba(15, 23, 42, 0.6);
```

### Usage Rules

- **Cards** → `--surface-level-1` + `--shadow-level-1`
- **Modals** → `--surface-level-2` + `--shadow-level-2`
- **Toasts / Top Overlays** → `--surface-level-3` + `--shadow-level-3`

---

## 🔘 Button Styles

### Button Variants

#### 1. Primary Button

```css
/* Default Primary */
.btn-primary {
  background-color: var(--color-primary-500);
  color: white;
  border-radius: 0.75rem; /* rounded-xl */
  padding: 0.625rem 1.25rem; /* py-2.5 px-5 */
  font-weight: 600;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  transition: all 0.2s;
}

.btn-primary:hover {
  background-color: var(--color-primary-600);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.btn-primary:active {
  background-color: var(--color-primary-700);
  transform: scale(0.98);
}

.btn-primary:disabled {
  background-color: var(--color-gray-300);
  color: var(--color-gray-500);
  cursor: not-allowed;
}
```

**Tailwind Classes:**
```html
<button class="bg-primary-500 text-white rounded-xl px-5 py-2.5 font-semibold shadow-sm hover:bg-primary-600 hover:shadow-md active:scale-98 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-all">
  Button Text
</button>
```

#### 2. Secondary Button

```css
.btn-secondary {
  background-color: var(--color-secondary-500);
  color: white;
  border-radius: 0.75rem;
  padding: 0.625rem 1.25rem;
  font-weight: 600;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.btn-secondary:hover {
  background-color: var(--color-secondary-600);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}
```

#### 3. Outline Button

```css
.btn-outline {
  background-color: transparent;
  color: var(--color-primary-600);
  border: 2px solid var(--color-primary-500);
  border-radius: 0.75rem;
  padding: 0.625rem 1.25rem;
  font-weight: 600;
}

.btn-outline:hover {
  background-color: var(--color-primary-50);
  border-color: var(--color-primary-600);
}
```

#### 4. Ghost Button

```css
.btn-ghost {
  background-color: transparent;
  color: var(--color-gray-700);
  border: none;
  border-radius: 0.75rem;
  padding: 0.625rem 1.25rem;
  font-weight: 500;
}

.btn-ghost:hover {
  background-color: var(--color-gray-100);
}
```

#### 5. Danger Button

```css
.btn-danger {
  background-color: var(--color-error);
  color: white;
  border-radius: 0.75rem;
  padding: 0.625rem 1.25rem;
  font-weight: 600;
}

.btn-danger:hover {
  background-color: var(--color-error-dark);
}
```

### Button Sizes

#### Small
```css
.btn-sm {
  padding: 0.375rem 0.75rem; /* py-1.5 px-3 */
  font-size: 0.875rem; /* text-sm */
}
```

#### Medium (Default)
```css
.btn-md {
  padding: 0.625rem 1.25rem; /* py-2.5 px-5 */
  font-size: 1rem; /* text-base */
}
```

#### Large
```css
.btn-lg {
  padding: 0.75rem 1.5rem; /* py-3 px-6 */
  font-size: 1.125rem; /* text-lg */
}
```

### Button States

- **Default**: Normal state
- **Hover**: Slightly darker background, shadow increase
- **Active**: Scale down (0.98), darker background
- **Disabled**: Gray background, gray text, cursor not-allowed
- **Loading**: Show spinner, disable interaction

---

## 📦 Card Styles

### Card Component

```css
.card {
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-gray-200);
  border-radius: 1rem; /* rounded-2xl */
  padding: 1.5rem; /* p-6 */
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
}

.card:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border-color: var(--color-gray-300);
}
```

**Tailwind Classes:**
```html
<div class="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-gray-300 transition-all">
  Card Content
</div>
```

### Post Card

```css
.post-card {
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-gray-200);
  border-radius: 1rem;
  padding: 1.25rem; /* p-5 */
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.post-card:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}
```

---

## 📝 Typography

### Font Family

```css
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-mono: 'Fira Code', 'Courier New', monospace;
```

### Font Sizes

```css
/* Headings */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
--text-5xl: 3rem;      /* 48px */
```

### Font Weights

```css
--font-light: 300;
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### Line Heights

```css
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.75;
```

### Text Colors

```css
--text-primary: var(--color-gray-900);
--text-secondary: var(--color-gray-600);
--text-tertiary: var(--color-gray-400);
--text-inverse: white;
```

---

## 📏 Spacing System

### Spacing Scale

```css
--space-0: 0;
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;     /* 8px */
--space-3: 0.75rem;    /* 12px */
--space-4: 1rem;       /* 16px */
--space-5: 1.25rem;    /* 20px */
--space-6: 1.5rem;     /* 24px */
--space-8: 2rem;       /* 32px */
--space-10: 2.5rem;    /* 40px */
--space-12: 3rem;      /* 48px */
--space-16: 4rem;      /* 64px */
--space-20: 5rem;      /* 80px */
```

---

## 🎭 Border Radius

```css
--radius-sm: 0.375rem;   /* 6px - rounded-md */
--radius-md: 0.5rem;      /* 8px - rounded-lg */
--radius-lg: 0.75rem;     /* 12px - rounded-xl */
--radius-xl: 1rem;        /* 16px - rounded-2xl */
--radius-full: 9999px;    /* Full circle */
```

---

## 🌑 Shadows

```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
--shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
```

---

## 🎬 Transitions & Animations

### Transition Durations

```css
--transition-fast: 150ms;
--transition-base: 200ms;
--transition-slow: 300ms;
```

### Easing Functions

```css
--ease-smooth: cubic-bezier(0.23, 1, 0.32, 1);      /* smooth out */
--ease-bounce-soft: cubic-bezier(0.34, 1.56, 0.64, 1); /* for small micro-bounce */
```

### Common Transitions

```css
/* Button hover */
transition: transform 150ms var(--ease-bounce-soft), box-shadow 150ms var(--ease-smooth);

/* Card hover */
transition: box-shadow 150ms var(--ease-smooth), transform 150ms var(--ease-smooth);

/* Modal fade */
transition: opacity var(--transition-slow) var(--ease-smooth), transform var(--transition-slow) var(--ease-smooth);
```

### Usage Rules

- **Buttons hover/active** → `--ease-bounce-soft` (for small micro-bounce effect)
- **Modals, drawers** → `--ease-smooth` (for smooth, cinematic transitions)

### Hover Effects

```css
/* Scale on hover */
.hover-scale:hover {
  transform: scale(1.02);
}

/* Lift on hover */
.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}
```

---

## 📱 Form Components

### Input Field

```css
.input {
  width: 100%;
  padding: 0.625rem 0.75rem; /* py-2.5 px-3 */
  border: 1px solid var(--color-gray-300);
  border-radius: 0.5rem; /* rounded-lg */
  font-size: 1rem;
  transition: all 0.2s;
}

.input:focus {
  outline: none;
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.input:disabled {
  background-color: var(--color-gray-100);
  cursor: not-allowed;
}
```

### Textarea

```css
.textarea {
  width: 100%;
  padding: 0.625rem 0.75rem;
  border: 1px solid var(--color-gray-300);
  border-radius: 0.5rem;
  font-size: 1rem;
  resize: vertical;
  min-height: 6rem;
}
```

### Select

```css
.select {
  width: 100%;
  padding: 0.625rem 0.75rem;
  border: 1px solid var(--color-gray-300);
  border-radius: 0.5rem;
  font-size: 1rem;
  background-color: white;
}
```

---

## 🔔 Loading States

### Spinner

```css
.spinner {
  width: 1.5rem;
  height: 1.5rem;
  border: 2px solid var(--color-gray-200);
  border-top-color: var(--color-primary-500);
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

### Skeleton Loader

```css
.skeleton {
  background: linear-gradient(
    90deg,
    var(--color-gray-200) 0%,
    var(--color-gray-100) 50%,
    var(--color-gray-200) 100%
  );
  background-size: 200% 100%;
  animation: loading 1.5s ease-in-out infinite;
  border-radius: 0.5rem;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

---

## 🎯 Modal Styles

### Modal Overlay

```css
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 50;
}
```

### Modal Content

```css
.modal-content {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: var(--shadow-2xl);
  max-width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
  z-index: 51;
}
```

---

## 🌐 Language Switcher Button

### Language Button Style

```css
.lang-switcher {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background-color: transparent;
  border: 1px solid var(--color-gray-300);
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-gray-700);
  cursor: pointer;
  transition: all 0.2s;
}

.lang-switcher:hover {
  background-color: var(--color-gray-100);
  border-color: var(--color-gray-400);
}

.lang-switcher:focus {
  outline: none;
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
```

### Language Dropdown

```css
.lang-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  background-color: white;
  border: 1px solid var(--color-gray-200);
  border-radius: 0.75rem;
  box-shadow: var(--shadow-lg);
  padding: 0.5rem;
  min-width: 10rem;
  z-index: 50;
}

.lang-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 0.75rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.lang-option:hover {
  background-color: var(--color-gray-100);
}

.lang-option.active {
  background-color: var(--color-primary-50);
  color: var(--color-primary-700);
  font-weight: 600;
}
```

---

## 📱 Responsive Breakpoints

```css
/* Mobile First */
--breakpoint-sm: 640px;   /* @media (min-width: 640px) */
--breakpoint-md: 768px;   /* @media (min-width: 768px) */
--breakpoint-lg: 1024px;  /* @media (min-width: 1024px) */
--breakpoint-xl: 1280px;  /* @media (min-width: 1280px) */
--breakpoint-2xl: 1536px; /* @media (min-width: 1536px) */
```

---

## ✅ Usage Guidelines

### Button Usage

- **Primary**: Main actions (Submit, Create, Save)
- **Secondary**: Alternative actions (Cancel, Back)
- **Outline**: Less important actions
- **Ghost**: Tertiary actions, icon buttons
- **Danger**: Destructive actions (Delete, Remove)

### Contrast & Readability Rules

**CRITICAL**: ყოველთვის უნდა დავრწმუნდეთ, რომ ტექსტი და UI ელემენტები კარგად ჩანს background-ზე.

#### Rules for Gradient Backgrounds

- **Primary buttons on gradient backgrounds**: გამოიყენე `variant="primary"` (gradient background + white text)
- **Outline buttons on gradient backgrounds**: გამოიყენე `variant="outline"` მხოლოდ თეთრი ბორდერით და თეთრი ტექსტით (`text-white border-white`), არა brand colors-ით
- **Text on gradient backgrounds**: ყოველთვის თეთრი ტექსტი (`text-white`), drop-shadow-ით თუ საჭიროა (`drop-shadow-lg`)

#### Rules for Dark Backgrounds

- **Buttons on dark backgrounds** (`bg-gray-900`, `bg-gray-800`):
  - Primary: `bg-gradient-brand` (gradient) + `text-white`
  - Outline: `border-white/80` + `text-white`
  - Ghost: `text-gray-300` + `hover:bg-gray-800`
- **Text on dark backgrounds**:
  - Primary text: `text-white`
  - Secondary text: `text-gray-300`
  - Muted text: `text-gray-400`

#### Rules for Light Backgrounds

- **Buttons on light backgrounds** (`bg-white`, `bg-gray-50`):
  - Primary: `bg-gradient-brand` + `text-white`
  - Outline: `border-brand-iris` + `text-brand-iris`
- **Text on light backgrounds**:
  - Primary text: `text-gray-900`
  - Secondary text: `text-gray-600`

#### Dropdowns & Menus

- **Dropdown on dark header**: `bg-gray-800` + `border-gray-700` + `text-gray-300`
- **Active item**: `bg-brand-iris/20` + `text-brand-cyan`
- **Hover state**: `hover:bg-gray-700`

#### Minimum Contrast Requirements

- **Text on background**: მინიმუმ 4.5:1 contrast ratio (WCAG AA)
- **Buttons**: მინიმუმ 3:1 contrast ratio (WCAG AA)
- **Gradient backgrounds**: ტექსტი უნდა იყოს თეთრი ან ღია ფერი drop-shadow-ით
- **Outline buttons**: ბორდერი და ტექსტი უნდა იყოს იმავე ფერის (თეთრი gradient-ზე, brand color light background-ზე)

#### Testing Checklist

- ✅ ყველა ღილაკი კარგად ჩანს background-ზე
- ✅ Dropdown-ის ტექსტი კარგად იკითხება
- ✅ Links კარგად ჩანს და განსხვავდება ჩვეულებრივი ტექსტისგან
- ✅ Error messages კარგად ჩანს
- ✅ Placeholder text კარგად ჩანს
- ✅ Icons კარგად ჩანს background-ზე

### Color Usage

- **Primary Blue**: Main brand, primary actions, links
- **Secondary Purple**: Accents, highlights
- **Gray**: Text, borders, backgrounds
- **Semantic Colors**: Success (green), Error (red), Warning (yellow), Info (blue)

### Spacing

- Use consistent spacing scale
- Maintain visual rhythm
- Group related elements together

### Typography

- **Headings**: Use semibold (600) or bold (700)
- **Body**: Use normal (400) or medium (500)
- **Small text**: Use text-sm (0.875rem)

---

## 🌿 BranchFeed-Specific Components

### Branch Choice Buttons

BranchFeed-ის მთავარი ფუნქციაა A/B არჩევანის ღილაკები, რომლებიც მომხმარებლებს საშუალებას აძლევს აირჩიონ სტორიის შემდეგი path.

#### Choice Button Visual Mapping

| ელემენტი | ფერი / ვიზუალი |
|---------|-----------------|
| Choice A Button | `--gradient-branch` (Indigo → Cyan) |
| Choice B Button | `--gradient-brand` (Indigo → Purple) |
| Active Path Badge | `border + text --color-brand-cyan` + subtle glow |
| VIP-only Path Marker | `--color-vip-gold` + პატარა ⭐ icon |
| Completed Path | `box-shadow: 0 0 0 1px var(--color-brand-cyan);` |

#### Path Badges

**A path** → პატარა წრე ბეჯი `--color-branch-a`  
**B path** → `--color-branch-b`  
**Completed path** → subtle glow `box-shadow: 0 0 0 1px var(--color-brand-cyan);`

#### Choice Button Style

```css
.choice-button {
  width: 100%;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, var(--color-primary-500), var(--color-secondary-500));
  color: white;
  border: none;
  border-radius: 1rem; /* rounded-2xl */
  font-size: 1.125rem; /* text-lg */
  font-weight: 600;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.choice-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.choice-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2);
}

.choice-button:hover::before {
  left: 100%;
}

.choice-button:active {
  transform: translateY(0);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.choice-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}
```

**Tailwind Classes:**
```html
<button class="w-full px-6 py-4 bg-gradient-to-br from-primary-500 to-secondary-500 text-white rounded-2xl text-lg font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all relative overflow-hidden">
  <span class="relative z-10">Choice A: Pizza</span>
</button>
```

#### Choice Button Variants

**Choice A (Primary Path)**
```css
.choice-button-a {
  background: linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600));
}
```

**Choice B (Alternative Path)**
```css
.choice-button-b {
  background: linear-gradient(135deg, var(--color-secondary-500), var(--color-secondary-600));
}
```

#### Path Progress Bar

Progress bar-ი აჩვენებს მომხმარებლის პოზიციას branching story-ში.

```css
.path-progress {
  width: 100%;
  height: 0.5rem; /* h-2 */
  background-color: var(--color-gray-200);
  border-radius: 9999px; /* rounded-full */
  overflow: hidden;
  margin-bottom: 1rem;
}

.path-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary-500), var(--color-secondary-500));
  border-radius: 9999px;
  transition: width 0.3s ease;
}

.path-progress-text {
  font-size: 0.875rem; /* text-sm */
  color: var(--color-gray-600);
  font-weight: 500;
  margin-bottom: 0.5rem;
}
```

**Tailwind Classes:**
```html
<div class="mb-4">
  <div class="text-sm text-gray-600 font-medium mb-2">Step 2 of 5</div>
  <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
    <div class="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full transition-all" style="width: 40%"></div>
  </div>
</div>
```

---

### Story Card / BranchFeed Card Layout

BranchFeed-ის Story Card არის სპეციალური layout, რომელიც აჩვენებს branching content-ს.

#### Card Structure

```
┌─────────────────────────────┐
│  [Avatar] Author Name       │ ← Header
├─────────────────────────────┤
│                             │
│      [Video/Image]          │ ← Media (9:16 aspect)
│      (9:16 aspect ratio)   │
│                             │
├─────────────────────────────┤
│  [Choice A Button]          │ ← Choice Buttons
│  [Choice B Button]          │
│  [Like] [Comment] [Share]   │ ← Actions
└─────────────────────────────┘
```

#### Story Card Styles

```css
.story-card {
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-gray-200);
  border-radius: 1rem; /* rounded-2xl */
  overflow: hidden;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
  max-width: 28rem; /* Mobile-first, max-width for desktop */
  margin: 0 auto;
}

.story-card:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.story-card-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--color-gray-200);
}

.story-card-avatar {
  width: 2.5rem; /* w-10 */
  height: 2.5rem;
  border-radius: 50%;
  object-fit: cover;
}

.story-card-author {
  font-weight: 600;
  color: var(--color-gray-900);
  font-size: 1rem;
}

.story-card-media {
  position: relative;
  width: 100%;
  aspect-ratio: 9 / 16; /* Vertical video aspect */
  background-color: var(--color-gray-900);
  overflow: hidden;
}

.story-card-media video,
.story-card-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.story-card-choices {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.story-card-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1.25rem;
  border-top: 1px solid var(--color-gray-200);
}
```

**Tailwind Classes:**
```html
<div class="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all max-w-md mx-auto">
  <!-- Header -->
  <div class="flex items-center gap-3 px-5 py-4 border-b border-gray-200">
    <img src="avatar.jpg" alt="Author" class="w-10 h-10 rounded-full object-cover" />
    <span class="font-semibold text-gray-900">Author Name</span>
  </div>
  
  <!-- Media (9:16 aspect) -->
  <div class="relative w-full aspect-[9/16] bg-gray-900 overflow-hidden">
    <video src="story.mp4" class="w-full h-full object-cover" />
  </div>
  
  <!-- Choices -->
  <div class="px-5 py-5 flex flex-col gap-3">
    <button class="choice-button-a">Choice A</button>
    <button class="choice-button-b">Choice B</button>
  </div>
  
  <!-- Actions -->
  <div class="flex items-center gap-4 px-5 py-3 border-t border-gray-200">
    <button>Like</button>
    <button>Comment</button>
    <button>Share</button>
  </div>
</div>
```

#### Media Aspect Ratios

```css
/* Vertical Video (TikTok/Instagram Stories style) */
.aspect-vertical {
  aspect-ratio: 9 / 16;
}

/* Square (Instagram Post style) */
.aspect-square {
  aspect-ratio: 1 / 1;
}

/* Horizontal (YouTube style) */
.aspect-horizontal {
  aspect-ratio: 16 / 9;
}
```

---

### Empty States & Error States

Empty states და error states არის მნიშვნელოვანი UX ელემენტები BranchFeed-ში.

> **⚠️ CRITICAL: Dark Theme Only + Brand Colors**
>
> BranchFeed არის **dark-first, neon-gradient, cinematic story** პლატფორმა. ყველა EmptyState და ErrorState component **უნდა** გამოიყენებდეს dark theme-ის სტილებს **brand colors-თან alignment-ით**:
>
> **EmptyState:**
> - Background: `bg-gray-800/60 backdrop-blur-sm` (მუქი backdrop, ოდნავ მეტი opacity)
> - Border: `border-brand-iris/20 hover:border-brand-cyan/30` (brand gradient accents)
> - Shadow: `shadow-level-2` (elevation)
> - Title: `text-white drop-shadow-sm` (თეთრი ტექსტი, subtle shadow)
> - Description: `text-gray-300/90` (light gray text, ოდნავ მეტი opacity)
> - Icons: `bg-gradient-brand bg-clip-text text-transparent opacity-80` (gradient icon colors)
> - Hover: `hover:border-brand-cyan/30 transition-all ease-smooth` (interactive border)
>
> **ErrorState:**
> - Background: `bg-gray-800/60 backdrop-blur-sm` (მუქი backdrop)
> - Border: `border-red-500/40 hover:border-red-400/50` (vibrant red accent)
> - Shadow: `shadow-level-2` (elevation)
> - Title: `text-red-400 drop-shadow-sm` (vibrant red title)
> - Description: `text-gray-300/90` (light gray text)
> - Icons: `opacity-90 filter drop-shadow-sm` (enhanced visibility)
> - Hover: `hover:border-red-400/50 transition-all ease-smooth` (interactive border)
>
> **არასოდეს** გამოიყენო light theme-ის სტილები (`bg-gray-50`, `bg-white`, `text-gray-700`, და ა.შ.) EmptyState ან ErrorState components-ში!

### Color Variations & Context Usage

EmptyState და ErrorState components-ებში **შეიძლება** გამოყენებული იქნეს სხვადასხვა brand colors და gradients, **context-ის მიხედვით**:

#### EmptyState Color Variations

| Context | Border Color | Icon Style | Button Variant | Usage |
|---------|-------------|------------|----------------|-------|
| **Default / Feed** | `border-brand-iris/20` → `hover:border-brand-cyan/30` | `bg-gradient-brand` | `primary` (gradient-brand) | Feed empty, general empty states |
| **Create Story** | `border-brand-plum/20` → `hover:border-brand-cyan/30` | `bg-gradient-branch` | `primary` (gradient-brand) | Empty create page, no drafts |
| **User Stories** | `border-branch-a/20` → `hover:border-branch-b/30` | `bg-gradient-branch` | `primary` (gradient-brand) | User profile, no user stories |
| **Search Results** | `border-gray-700/50` → `hover:border-brand-cyan/30` | `text-gray-400` | `outline` (brand-cyan) | No search results |
| **Trending** | `border-brand-cyan/20` → `hover:border-brand-plum/30` | `bg-gradient-pro` | `primary` (gradient-vip) | Trending page, no trending content |

**წესები:**
- **Icons**: გამოიყენე gradient colors (`bg-gradient-brand`, `bg-gradient-branch`, `bg-gradient-pro`) ემოჯი ან icon-ებისთვის `bg-clip-text text-transparent`-ით
- **Borders**: ყოველთვის იყენე low opacity (`/20` ან `/30`) default state-ში, hover-ზე მეტი opacity (`/30` ან `/50`)
- **Transitions**: `transition-all ease-smooth` borders-ისთვის interactive feel-ისთვის

#### ErrorState Color Variations

| Error Type | Border Color | Title Color | Icon | Button Variant | Usage |
|-----------|-------------|-------------|------|----------------|-------|
| **Generic Error** | `border-red-500/40` → `hover:border-red-400/50` | `text-red-400` | `⚠️` | `danger` (red) | Feed load failed, generic errors |
| **Network Error** | `border-orange-500/40` → `hover:border-orange-400/50` | `text-orange-400` | `📡` | `danger` (red) | Network timeout, connection issues |
| **Permission Error** | `border-yellow-500/40` → `hover:border-yellow-400/50` | `text-yellow-400` | `🔒` | `outline` (warning) | Access denied, permission issues |
| **Validation Error** | `border-red-400/40` → `hover:border-red-300/50` | `text-red-300` | `❌` | `danger` (red) | Form validation, input errors |

**წესები:**
- **Error Colors**: გამოიყენე vibrant colors (`red-400`, `orange-400`, `yellow-400`) visibility-ისთვის
- **Borders**: ყოველთვის იყენე `/40` default-ზე, hover-ზე `/50` ან `/60` უფრო მკვეთრი effect-ისთვის
- **Icons**: `opacity-90` ან `opacity-80` + `filter drop-shadow-sm` უკეთესი visibility-ისთვის

#### Dynamic Color Selection Guidelines

1. **EmptyState**: გამოიყენე brand colors (`brand-iris`, `brand-cyan`, `brand-plum`) ან branch colors (`branch-a`, `branch-b`) context-ის მიხედვით
2. **ErrorState**: გამოიყენე semantic colors (`red`, `orange`, `yellow`) error type-ის მიხედვით
3. **Gradients**: icons-ისთვის გამოიყენე `bg-gradient-brand`, `bg-gradient-branch`, `bg-gradient-pro` brand identity-ისთვის
4. **Hover States**: ყოველთვის იყენე უფრო vibrant colors hover-ზე (`cyan/30` → `cyan/50`, `red-400/50` → `red-300/60`)
5. **Consistency**: იგივე context-ში იყენე იგივე color scheme (მაგ. Feed-ში ყოველთვის `brand-iris` → `brand-cyan`)

> **💡 Design Tip**: EmptyState და ErrorState components-ები არის **brand identity-ის** ნაწილი. გამოიყენე brand colors და gradients, რომ BranchFeed გამოირჩეოდეს და ჰქონდეს consistent, cinematic vibe!

#### Empty States Style Guide

| State | Icon | Border Color | Icon Style | Usage |
|-------|------|-------------|------------|-------|
| **No Stories Yet** | 📖 Book icon | `border-brand-iris/20` → `hover:border-brand-cyan/30` | `bg-gradient-brand` | When user has no stories (Feed) |
| **No Posts in Feed** | 🎬 Film icon | `border-brand-iris/20` → `hover:border-brand-cyan/30` | `bg-gradient-brand` | When feed is empty |
| **No Choices Available** | 🎯 Target icon | `border-branch-a/20` → `hover:border-branch-b/30` | `bg-gradient-branch` | When story has no branches |
| **No Search Results** | 🔍 Search icon | `border-gray-700/50` → `hover:border-brand-cyan/30` | `text-gray-400` | When search returns nothing |
| **No Drafts** | 📝 Note icon | `border-brand-plum/20` → `hover:border-brand-cyan/30` | `bg-gradient-branch` | When user has no drafts |
| **No Trending** | 🔥 Fire icon | `border-brand-cyan/20` → `hover:border-brand-plum/30` | `bg-gradient-pro` | When trending page is empty |

> **Note**: ყველა EmptyState **უნდა** იყენებდეს dark theme-ის სტილებს: `bg-gray-800/60 backdrop-blur-sm`, `text-white` (title), `text-gray-300/90` (description), `shadow-level-2`. Borders და icons იცვლება context-ის მიხედვით (იხ. Color Variations ზემოთ).

#### Error States Style Guide

| State | Icon | Border Color | Title Color | Usage |
|-------|------|-------------|-------------|-------|
| **Error Loading Feed** | ⚠️ Warning icon | `border-red-500/40` → `hover:border-red-400/50` | `text-red-400` | When feed fails to load |
| **Error Loading Story** | ❌ Error icon | `border-red-500/40` → `hover:border-red-400/50` | `text-red-400` | When story fails to load |
| **Network Error** | 📡 Network icon | `border-orange-500/40` → `hover:border-orange-400/50` | `text-orange-400` | When network request fails |
| **Permission Error** | 🔒 Lock icon | `border-yellow-500/40` → `hover:border-yellow-400/50` | `text-yellow-400` | When access is denied |
| **Validation Error** | ❌ Error icon | `border-red-400/40` → `hover:border-red-300/50` | `text-red-300` | When form validation fails |
| **Something Went Wrong** | 🔧 Wrench icon | `border-red-500/40` → `hover:border-red-400/50` | `text-red-400` | Generic error state |

> **Note**: ყველა ErrorState **უნდა** იყენებდეს dark theme-ის სტილებს: `bg-gray-800/60 backdrop-blur-sm`, `text-gray-300/90` (message), `shadow-level-2`. Border colors და title colors იცვლება error type-ის მიხედვით (იხ. Color Variations ზემოთ).

#### Empty State Component (Dark Theme Required)

```tsx
// ✅ CORRECT - Dark theme + brand colors
<div className="bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-brand-iris/20 hover:border-brand-cyan/30 shadow-level-2 transition-all ease-smooth">
  <div className="bg-gradient-brand bg-clip-text text-transparent opacity-80">📖</div>
  <h3 className="text-white drop-shadow-sm">Title</h3>
  <p className="text-gray-300/90 leading-relaxed">Description</p>
</div>

// ❌ WRONG - Light theme styles (DO NOT USE!)
<div className="bg-gray-50 rounded-2xl">
  <h3 className="text-gray-700">Title</h3>
  <p className="text-gray-500">Description</p>
</div>
```

```css
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1.5rem;
  text-align: center;
  background-color: var(--color-gray-50);
  border-radius: 1rem;
}

.empty-state-icon {
  font-size: 3rem; /* text-5xl */
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state-title {
  font-size: 1.25rem; /* text-xl */
  font-weight: 600;
  color: var(--color-gray-700);
  margin-bottom: 0.5rem;
}

.empty-state-description {
  font-size: 1rem;
  color: var(--color-gray-500);
  max-width: 24rem;
}
```

**Tailwind Classes:**
```html
<div class="flex flex-col items-center justify-center py-12 px-6 text-center bg-gray-50 rounded-2xl">
  <div class="text-5xl mb-4 opacity-50">📖</div>
  <h3 class="text-xl font-semibold text-gray-700 mb-2">No Stories Yet</h3>
  <p class="text-base text-gray-500 max-w-md">Create your first branching story to get started!</p>
</div>
```

#### Error State Component (Dark Theme Required)

```tsx
// ✅ CORRECT - Dark theme + vibrant red accent
<div className="bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-red-500/40 hover:border-red-400/50 shadow-level-2 transition-all ease-smooth">
  <div className="opacity-90 filter drop-shadow-sm">⚠️</div>
  <h3 className="text-red-400 drop-shadow-sm">Error Title</h3>
  <p className="text-gray-300/90 leading-relaxed">Error message</p>
</div>

// ❌ WRONG - Light theme styles (DO NOT USE!)
<div className="bg-error-light border border-error rounded-2xl">
  <h3 className="text-error-dark">Error Title</h3>
  <p className="text-error-dark">Error message</p>
</div>
```

```css
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1.5rem;
  text-align: center;
  background-color: var(--color-error-light);
  border: 1px solid var(--color-error);
  border-radius: 1rem;
}

.error-state-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: var(--color-error);
}

.error-state-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-error-dark);
  margin-bottom: 0.5rem;
}

.error-state-description {
  font-size: 1rem;
  color: var(--color-error-dark);
  max-width: 24rem;
  margin-bottom: 1.5rem;
}

.error-state-button {
  padding: 0.625rem 1.25rem;
  background-color: var(--color-error);
  color: white;
  border-radius: 0.5rem;
  font-weight: 600;
}
```

**Tailwind Classes:**
```html
<div class="flex flex-col items-center justify-center py-12 px-6 text-center bg-error-light border border-error rounded-2xl">
  <div class="text-5xl mb-4 text-error">⚠️</div>
  <h3 class="text-xl font-semibold text-error-dark mb-2">Error Loading Feed</h3>
  <p class="text-base text-error-dark max-w-md mb-6">Something went wrong. Please try again.</p>
  <button class="px-5 py-2.5 bg-error text-white rounded-lg font-semibold">Try Again</button>
</div>
```

---

## 🎨 Design Tokens (Tailwind Config)

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        // Base tokens (existing)
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          // ... up to 900
          500: '#3b82f6', // Main
        },
        secondary: {
          500: '#a855f7', // Main
        },
        // Brand Core
        brand: {
          iris: '#4f46e5',
          plum: '#a855f7',
          cyan: '#22d3ee',
        },
        // Branch Specific
        branch: {
          a: '#4f46e5',
          b: '#ec4899',
        },
        // VIP & Premium
        vip: {
          gold: '#fbbf24',
        },
        pro: {
          amber: '#f97316',
        },
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #4f46e5, #a855f7)',
        'gradient-branch': 'linear-gradient(135deg, #4f46e5, #22d3ee)',
        'gradient-danger': 'linear-gradient(135deg, #f97316, #ef4444)',
        'gradient-vip': 'linear-gradient(135deg, #fbbf24, #a855f7)',
        'gradient-pro': 'linear-gradient(135deg, #22d3ee, #4f46e5)',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        'level-1': '0 10px 25px rgba(15, 23, 42, 0.3)',
        'level-2': '0 20px 40px rgba(15, 23, 42, 0.45)',
        'level-3': '0 30px 60px rgba(15, 23, 42, 0.6)',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.23, 1, 0.32, 1)',
        'bounce-soft': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
}
```

---

**Last Updated**: 2025-01-XX  
**Version**: 1.0  
**Status**: Active

