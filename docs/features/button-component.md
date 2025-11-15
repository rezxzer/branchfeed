# Button Component - BranchFeed

ეს დოკუმენტაცია აღწერს Button Component-ის იმპლემენტაციას BranchFeed-ში.

---

## 📋 Overview

Button Component არის ძირითადი UI კომპონენტი, რომელიც გამოიყენება ყველა გვერდზე:
- Primary actions (Sign Up, Submit, Create)
- Secondary actions (Cancel, Back)
- Navigation buttons
- Icon buttons
- Loading states

**Location**: `src/components/ui/Button.tsx`

**Status**: 🔴 **Critical Priority** - Phase 1 (Foundation)

---

## 🎯 Features

### Core Features (MVP - Phase 1)

1. **Button Variants**
   - Primary (main actions)
   - Secondary (alternative actions)
   - Outline (bordered style)
   - Ghost (minimal style)
   - Danger (destructive actions)

2. **Button Sizes**
   - Small (`sm`)
   - Medium (`md`) - default
   - Large (`lg`)

3. **Button States**
   - Default
   - Hover
   - Active
   - Disabled
   - Loading (with spinner)

4. **Button Types**
   - Button (`button`)
   - Submit (`submit`)
   - Link (`link` - styled as button)

---

## 🎨 UI Components

### Button Component

```typescript
// src/components/ui/Button.tsx
'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'md',
    isLoading = false,
    leftIcon,
    rightIcon,
    fullWidth = false,
    disabled,
    children,
    ...props 
  }, ref) => {
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          // Base styles
          'inline-flex items-center justify-center font-semibold rounded-xl',
          'transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-offset-2',
          
          // Variants
          variant === 'primary' && 'bg-primary-500 text-white hover:bg-primary-600 active:scale-98 shadow-sm hover:shadow-md',
          variant === 'secondary' && 'bg-secondary-500 text-white hover:bg-secondary-600 shadow-sm hover:shadow-md',
          variant === 'outline' && 'bg-transparent text-primary-600 border-2 border-primary-500 hover:bg-primary-50 hover:border-primary-600',
          variant === 'ghost' && 'bg-transparent text-gray-700 hover:bg-gray-100',
          variant === 'danger' && 'bg-error text-white hover:bg-error-dark shadow-sm hover:shadow-md',
          
          // Sizes
          size === 'sm' && 'px-3 py-1.5 text-sm',
          size === 'md' && 'px-5 py-2.5 text-base',
          size === 'lg' && 'px-6 py-3 text-lg',
          
          // States
          isDisabled && 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60',
          isLoading && 'cursor-wait',
          
          // Full width
          fullWidth && 'w-full',
          
          // Focus ring
          'focus:ring-primary-500',
          
          className
        )}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
        {children}
        {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
```

**UI Style** (see `UI_STYLE_GUIDE.md`):
- Primary: `bg-primary-500 text-white rounded-xl px-5 py-2.5 font-semibold`
- Outline: `bg-transparent text-primary-600 border-2 border-primary-500`
- Ghost: `bg-transparent text-gray-700 hover:bg-gray-100`
- Danger: `bg-error text-white hover:bg-error-dark`

---

## 🔧 Implementation Details

### Button Variants

1. **Primary Button**
   - Main actions (Sign Up, Submit, Create)
   - Blue background (`bg-primary-500`)
   - White text
   - Shadow on hover

2. **Secondary Button**
   - Alternative actions
   - Secondary color background
   - White text

3. **Outline Button**
   - Bordered style
   - Transparent background
   - Primary color border and text

4. **Ghost Button**
   - Minimal style
   - No border, transparent background
   - Gray text

5. **Danger Button**
   - Destructive actions (Delete, Remove)
   - Red background (`bg-error`)
   - White text

### Button Sizes

- **Small (`sm`)**: `px-3 py-1.5 text-sm` - For compact spaces
- **Medium (`md`)**: `px-5 py-2.5 text-base` - Default size
- **Large (`lg`)**: `px-6 py-3 text-lg` - For prominent CTAs

### Button States

- **Default**: Normal state with base styles
- **Hover**: Slightly darker background, increased shadow
- **Active**: Scale down (0.98), darker background
- **Disabled**: Gray background, gray text, `cursor-not-allowed`
- **Loading**: Show spinner, disable interaction

### Loading State

When `isLoading={true}`:
- Button shows spinner icon
- Button is disabled
- `cursor-wait` style
- Spinner appears before text

### Design Tokens & Theme Alignment

BranchFeed-ში ყველა Button უნდა იყოს პირდაპირ მიბმული UI_STYLE_GUIDE-ში აღწერილ ფერების ტოკენებზე.

- `primary` ვარიანტი იყენებს მხოლოდ `primary-*` ტონებს (მაგ. `bg-primary-500`, `hover:bg-primary-600`).
- `secondary` ვარიანტი იყენებს მხოლოდ `secondary-*` ტონებს.
- `danger` ვარიანტი იყენებს `error` ფერებს (`bg-error`, `bg-error-dark`).

თუ Tailwind theme-ში რომელიმე ტოკენი შეიცვლება (მაგ. გადაერქვა `primary-500` ან შეიცვალა ფერი),
Button-ის კლასებიც უნდა განახლდეს, რომ ყოველთვის ემთხვეოდეს UI_STYLE_GUIDE-ს.

> **შენიშვნა:** `isDisabled` მდგომარეობამ ყოველთვის უნდა გადაფაროს ვარიანტის ფერი
> (disabled ღილაკი არ უნდა ჩანდეს primary CTA-სავით). Disable სტილი უნდა იყოს ერთი და იგივე ყველა ვარიანტისთვის.

### Icons

- `leftIcon`: Icon before text (e.g., `<PlusIcon />`)
- `rightIcon`: Icon after text (e.g., `<ArrowRightIcon />`)
- Icons are hidden when `isLoading={true}`

---

## 🌐 Internationalization (i18n)

Button text should be passed as children and translated externally:

```typescript
<Button variant="primary">
  {t('auth.signUp.button')}
</Button>
```

Button component does not call `t()` function internally - all text comes from parent components.

---

## ♿ Accessibility

- All buttons must have accessible labels (via `aria-label` if no visible text)
- Disabled buttons must have `disabled` attribute
- Loading buttons must have `aria-busy="true"` when loading
- Focus styles must be visible (`focus:ring-2`)
- Keyboard navigation: Tab to focus, Enter/Space to activate

> **Loading & ARIA**
> როდესაც Button არის `isLoading` მდგომარეობაში:
> - რეკომენდირებულია დაემატოს `aria-busy="true"` და (საჭიროების შემთხვევაში) `aria-live="polite"` wrapper-ზე;
> - Spinner-ის გამოჩენამ არ უნდა შეცვალოს ღილაკის სიგანე (CTA არ „ხტება" ლეაუთში);
> - Cursor-ის იმპლემენტაციამ უნდა გადაამოწმოს, რომ loading მდგომარეობაში `onClick` შენიჭებულია,
>   მაგრამ ფაქტობრივად არ შეიძლება ორმაგი submit (disabled already covers this).

---

## 📱 Responsive Design

- Buttons are responsive by default
- On mobile, buttons can be full width with `fullWidth` prop
- Touch targets should be at least 44x44px (minimum for mobile)

---

## ✅ Requirements Checklist

- [ ] Button component created
- [ ] All variants implemented (Primary, Secondary, Outline, Ghost, Danger)
- [ ] All sizes implemented (Small, Medium, Large)
- [ ] Loading state with spinner
- [ ] Disabled state
- [ ] Icon support (left/right)
- [ ] Full width option
- [ ] Accessibility (ARIA labels, keyboard navigation)
- [ ] Focus styles
- [ ] Responsive design
- [ ] i18n support (external translation)
- [ ] Button variants use only colors defined in UI_STYLE_GUIDE theme tokens
- [ ] Loading state exposes proper ARIA hints (e.g. `aria-busy`) სადაც საჭიროა

---

## 🧪 Button Testing Checklist (MVP)

1. ✅ All variants render correctly:
   - Primary, Secondary, Outline, Ghost, Danger

2. ✅ All sizes render correctly:
   - Small, Medium, Large

3. ✅ States work correctly:
   - Hover effects
   - Active state (scale down)
   - Disabled state (gray, not clickable)
   - Loading state (spinner, disabled)

4. ✅ Icons work correctly:
   - Left icon appears before text
   - Right icon appears after text
   - Icons hidden when loading

5. ✅ Accessibility:
   - Keyboard navigation (Tab, Enter, Space)
   - Focus ring visible
   - Screen reader announces button text

6. ✅ Responsive:
   - Full width option works on mobile
   - Touch targets are adequate size (≥44px)

---

## 🔄 Future Enhancements

- **Button Groups**: Multiple buttons grouped together
- **Split Buttons**: Button with dropdown menu
- **Icon-only Buttons**: Buttons with only icons (toolbar buttons)
- **Floating Action Button (FAB)**: Circular button for primary action

---

## 📝 Notes

- **Phase 1 Priority**: Button is used on all pages, critical for user interactions
- **Consistency**: All buttons should follow the same design system
- **Accessibility**: Ensure buttons are keyboard accessible and have proper ARIA labels
- **Performance**: Button component should be lightweight and fast

---

**Last Updated**: 2025-01-XX  
**Version**: 1.0  
**Status**: Phase 1 (Foundation) - Critical Priority

