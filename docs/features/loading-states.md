# Loading States - BranchFeed

ეს დოკუმენტაცია აღწერს Loading States კომპონენტების იმპლემენტაციას BranchFeed-ში.

---

## 📋 Overview

Loading States არის UI კომპონენტების ნაკრები, რომელიც გამოიყენება ასინქრონული ოპერაციების დროს:
- Spinner (circular loading indicator)
- Skeleton Loader (content placeholder)
- Button loading state
- Page loading state

**Location**: `src/components/ui/Spinner.tsx`, `src/components/ui/Skeleton.tsx`

**Status**: 🔴 **Critical Priority** - Phase 1 (Foundation)

---

## 🎯 Features

### Core Features (MVP - Phase 1)

1. **Spinner Component**
   - Circular loading indicator
   - Different sizes
   - Color variants

2. **Skeleton Loader**
   - Content placeholder
   - Shimmer animation
   - Different shapes (text, circle, rectangle)

3. **Loading States**
   - Button loading (with spinner)
   - Page loading
   - Component loading

---

## 🎨 UI Components

### Spinner Component

```typescript
// src/components/ui/Spinner.tsx
'use client';

import { cn } from '@/lib/utils';

export type SpinnerSize = 'sm' | 'md' | 'lg';
export type SpinnerColor = 'primary' | 'white' | 'gray';

export interface SpinnerProps {
  size?: SpinnerSize;
  color?: SpinnerColor;
  className?: string;
}

export const Spinner = ({ 
  size = 'md', 
  color = 'primary',
  className 
}: SpinnerProps) => {
  return (
    <div
      className={cn(
        'inline-block border-2 rounded-full animate-spin',
        
        // Sizes
        size === 'sm' && 'w-4 h-4 border-2',
        size === 'md' && 'w-6 h-6 border-2',
        size === 'lg' && 'w-8 h-8 border-3',
        
        // Colors
        color === 'primary' && 'border-gray-200 border-t-primary-500',
        color === 'white' && 'border-gray-300 border-t-white',
        color === 'gray' && 'border-gray-200 border-t-gray-600',
        
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};
```

**UI Style** (see `UI_STYLE_GUIDE.md`):
- Base: `border-2 rounded-full animate-spin`
- Primary: `border-gray-200 border-t-primary-500`
- Animation: `spin 0.6s linear infinite`

### Skeleton Loader Component

```typescript
// src/components/ui/Skeleton.tsx
'use client';

import { cn } from '@/lib/utils';

export type SkeletonVariant = 'text' | 'circle' | 'rectangle';

export interface SkeletonProps {
  variant?: SkeletonVariant;
  width?: string;
  height?: string;
  className?: string;
}

export const Skeleton = ({ 
  variant = 'text',
  width,
  height,
  className 
}: SkeletonProps) => {
  return (
    <div
      className={cn(
        'bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200',
        'bg-[length:200%_100%] animate-[loading_1.5s_ease-in-out_infinite]',
        'rounded-lg',
        
        // Variants
        variant === 'text' && 'h-4 rounded',
        variant === 'circle' && 'rounded-full',
        variant === 'rectangle' && 'rounded-lg',
        
        className
      )}
      style={{
        width: width || (variant === 'circle' ? height || '40px' : '100%'),
        height: height || (variant === 'text' ? '16px' : variant === 'circle' ? width || '40px' : '100px')
      }}
      role="status"
      aria-label="Loading content"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};
```

**UI Style** (see `UI_STYLE_GUIDE.md`):
- Base: `bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200`
- Animation: `loading 1.5s ease-in-out infinite`
- Border radius: `rounded-lg` or `rounded-full` for circle

---

## 🔧 Implementation Details

### Spinner Component

**Sizes:**
- Small (`sm`): `w-4 h-4` - For buttons, inline loading
- Medium (`md`): `w-6 h-6` - Default size
- Large (`lg`): `w-8 h-8` - For page loading

**Colors:**
- Primary: Primary color spinner (default)
- White: White spinner (for dark backgrounds)
- Gray: Gray spinner (for subtle loading)

**Usage:**
```typescript
// In button
<Button isLoading>
  <Spinner size="sm" color="white" />
  Loading...
</Button>

// Standalone
<Spinner size="md" color="primary" />
```

### Skeleton Loader Component

**Variants:**
- Text: Horizontal line (for text content)
- Circle: Circular shape (for avatars, images)
- Rectangle: Rectangular shape (for cards, images)

**Usage:**
```typescript
// Text skeleton
<Skeleton variant="text" width="200px" />

// Circle skeleton (avatar)
<Skeleton variant="circle" width="40px" height="40px" />

// Rectangle skeleton (card)
<Skeleton variant="rectangle" width="100%" height="200px" />
```

### Loading States in Components

1. **Button Loading**
   - Spinner appears before text
   - Button is disabled
   - `isLoading` prop controls state

2. **Page Loading**
   - Full page spinner
   - Centered on screen
   - Large size spinner

3. **Component Loading**
   - Skeleton loaders for content
   - Maintains layout structure
   - Smooth transition when content loads

### Integration with Button და Page Loading Patterns

- **Button Loading:**
  Primary ღილაკებისთვის რეკომენდირებულია გამოიყენოს:
  - `Spinner size="sm" color="white"` ან შესაბამისი თეთრი/კონტრასტული კომბინაცია;
  - `isLoading` მდგომარეობაში ტექსტი რჩება, უბრალოდ წინ ემატება spinner (ხარისხიანი feedback-ისთვის).

- **Page Loading:**
  Page-level loading-სთვის უნდა არსებობდეს ცალკე `<PageLoader>` პატერნი, რომელიც:
  - ცენტრში აჩვენებს `Spinner size="lg"`-ს;
  - იყენებს ერთსა და იმავე layout-ს ყველა route loading შემთხვევისთვის;
  - გამოიყენება Next.js-ის `loading.tsx` ან `Suspense` boundaries-თან ინტეგრაციაში.

> ძირითადი პრინციპი: Loading UI უნდა ინარჩუნებდეს layout-ს,
> არ უნდა „ხტებოდეს" გვერდი და მომხმარებელმა ყოველთვის იცოდეს რომ რამე მუშავდება.

---

## 🌐 Internationalization (i18n)

Loading states use `aria-label` for screen readers:
- Spinner: `aria-label="Loading"`
- Skeleton: `aria-label="Loading content"`
- Screen reader text: `sr-only` class for "Loading..."

---

## ♿ Accessibility

- All loading indicators must have `role="status"` and `aria-label`
- Screen reader text with `sr-only` class
- Loading states should not block keyboard navigation
- Focus management during loading states

---

## 📱 Responsive Design

- Spinner sizes adjust for different screen sizes
- Skeleton loaders maintain aspect ratios
- Loading states work on all devices

---

## ✅ Requirements Checklist

- [ ] Spinner component created
- [ ] All spinner sizes implemented (Small, Medium, Large)
- [ ] All spinner colors implemented (Primary, White, Gray)
- [ ] Skeleton component created
- [ ] All skeleton variants implemented (Text, Circle, Rectangle)
- [ ] Shimmer animation
- [ ] Button loading state
- [ ] Page loading state
- [ ] Accessibility (ARIA labels, screen reader support)
- [ ] Responsive design
- [ ] Common PageLoader pattern defined for route-level loading (uses Spinner size="lg")

---

## 🧪 Loading States Testing Checklist (MVP)

1. ✅ Spinner renders correctly:
   - All sizes (Small, Medium, Large)
   - All colors (Primary, White, Gray)
   - Animation works smoothly

2. ✅ Skeleton loader renders correctly:
   - All variants (Text, Circle, Rectangle)
   - Shimmer animation works
   - Custom width/height works

3. ✅ Button loading state:
   - Spinner appears
   - Button is disabled
   - Text remains visible

4. ✅ Accessibility:
   - Screen reader announces loading state
   - ARIA labels present
   - Keyboard navigation not blocked

---

## 🔄 Future Enhancements

- **Progress Bar**: Linear progress indicator
- **Loading Overlay**: Full screen loading overlay
- **Skeleton Variants**: More skeleton shapes (card, list, etc.)
- **Loading States per Component**: Component-specific loading states

---

## 📝 Notes

- **Phase 1 Priority**: Loading states are critical for UX
- **Performance**: Animations should be smooth and lightweight
- **Accessibility**: All loading states must be accessible
- **Consistency**: All loading states should follow the same design system

---

**Last Updated**: 2025-01-XX  
**Version**: 1.0  
**Status**: Phase 1 (Foundation) - Critical Priority

