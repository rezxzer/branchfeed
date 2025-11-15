# Card Component - BranchFeed

ეს დოკუმენტაცია აღწერს Card Component-ის იმპლემენტაციას BranchFeed-ში.

---

## 📋 Overview

Card Component არის ძირითადი UI კომპონენტი, რომელიც გამოიყენება კონტენტის ორგანიზაციისთვის:
- Story cards (branching stories)
- Post cards (regular posts)
- Content cards
- Information cards

**Location**: `src/components/ui/Card.tsx`, `src/components/StoryCard.tsx`, `src/components/PostCard.tsx`

**Status**: 🔴 **Critical Priority** - Phase 1 (Foundation)

---

## 🎯 Features

### Core Features (MVP - Phase 1)

1. **Base Card Component**
   - Reusable card wrapper
   - Hover effects
   - Shadow styles
   - Border styles

2. **Card Variants**
   - Default card
   - Post card
   - Story card (Phase 2)

3. **Card States**
   - Default
   - Hover (elevated shadow)
   - Clickable (cursor pointer)

---

## 🎨 UI Components

### Base Card Component

```typescript
// src/components/ui/Card.tsx
'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'post' | 'story';
  hoverable?: boolean;
  clickable?: boolean;
  padding?: 'sm' | 'md' | 'lg';
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ 
    className, 
    variant = 'default',
    hoverable = true,
    clickable = false,
    padding = 'md',
    children,
    ...props 
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Base styles
          'bg-white border border-gray-200 rounded-2xl',
          'transition-all duration-200',
          
          // Padding
          padding === 'sm' && 'p-4',
          padding === 'md' && 'p-6',
          padding === 'lg' && 'p-8',
          
          // Variants
          variant === 'default' && 'shadow-sm',
          variant === 'post' && 'shadow-sm',
          variant === 'story' && 'shadow-sm',
          
          // Hover effects
          hoverable && 'hover:shadow-md hover:border-gray-300',
          variant === 'post' && hoverable && 'hover:-translate-y-0.5',
          
          // Clickable
          clickable && 'cursor-pointer',
          
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
```

**UI Style** (see `UI_STYLE_GUIDE.md`):
- Base: `bg-white border border-gray-200 rounded-2xl p-6 shadow-sm`
- Hover: `hover:shadow-md hover:border-gray-300`
- Post Card: `hover:-translate-y-0.5` (slight lift on hover)

---

## 🔧 Implementation Details

### Card Variants

1. **Default Card**
   - General purpose card
   - Standard padding (`p-6`)
   - Subtle shadow

2. **Post Card**
   - For regular posts
   - Slightly smaller padding (`p-5`)
   - Lift effect on hover (`-translate-y-0.5`)

3. **Story Card** (Phase 2)
   - For branching stories
   - 9:16 aspect ratio support
   - Branch indicators

### Card Props

- `variant`: Card style variant (`'default' | 'post' | 'story'`)
- `hoverable`: Enable hover effects (default: `true`)
- `clickable`: Make card clickable with pointer cursor (default: `false`)
- `padding`: Padding size (`'sm' | 'md' | 'lg'`)

### Card States

- **Default**: Normal state with base styles
- **Hover**: Elevated shadow, border color change
- **Clickable**: Pointer cursor, can be used with `onClick`

### Accessibility & Semantics for Clickable Cards

Clickable Card, რომელიც მთლიანად მოქმედებს როგორც ლინკი ან ღილაკი, არ უნდა დარჩეს უბრალო `<div>`-ად.

**რეკომენდაციები:**

- თუ Card გადასიყვანს სხვა გვერდზე → გამოიყენეთ `<Link>` ან `<a>` wrapper
  და Card მხოლოდ ვიზუალურ wrapper-ად იმუშაოს (semantics ლინკზე გადავა).

- თუ Card ასრულებს მოქმედებას (მაგ. ხსნის მოდალს) →
  უკეთესია `<button>` wrapper, ან მინიმუმ:
  - `role="button"`
  - `tabIndex={0}`
  - კლავიატურის მხარდაჭერა (`Enter` / `Space` აქტივაციაზე).

ეს წესები განსაკუთრებით მნიშვნელოვანია Feed/Story ბარათებისთვის, რომ კლავიატურით ნავიგაცია და screen reader-ებიც სწორად მუშაობდნენ.

---

## 📱 Responsive Design

- Cards are responsive by default
- On mobile, cards use full width
- Padding adjusts on smaller screens
- Grid layouts for multiple cards

---

## ✅ Requirements Checklist

- [ ] Base Card component created
- [ ] All variants implemented (Default, Post, Story)
- [ ] Hover effects
- [ ] Clickable state
- [ ] Padding options
- [ ] Responsive design
- [ ] Shadow styles
- [ ] Border styles
- [ ] Clickable cards use accessible semantics (link or button role + keyboard support)

---

## 🧪 Card Testing Checklist (MVP)

1. ✅ All variants render correctly:
   - Default, Post, Story

2. ✅ States work correctly:
   - Hover effects (shadow elevation)
   - Clickable state (cursor pointer)

3. ✅ Padding options work:
   - Small, Medium, Large

4. ✅ Responsive:
   - Full width on mobile
   - Proper spacing on all screen sizes

---

## 🔄 Future Enhancements

- **Card Actions**: Footer with action buttons
- **Card Header**: Header section with title and actions
- **Card Image**: Image support with aspect ratio
- **Card Grid**: Grid layout component for multiple cards
- **Card Skeleton**: Loading skeleton for cards

---

## 📝 Notes

- **Phase 1 Priority**: Card is used for content organization
- **Consistency**: All cards should follow the same design system
- **Performance**: Card component should be lightweight
- **Accessibility**: Cards should have proper semantic HTML

---

**Last Updated**: 2025-01-XX  
**Version**: 1.0  
**Status**: Phase 1 (Foundation) - Critical Priority

