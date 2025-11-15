# Choice Buttons Component - BranchFeed

ეს დოკუმენტაცია აღწერს Choice Buttons Component-ის იმპლემენტაციას BranchFeed-ში.

---

## 📋 Overview

Choice Buttons Component არის BranchFeed-ის ბირთვი კომპონენტი, რომელიც:
- აჩვენებს A/B არჩევნებს branching story-ში
- მომხმარებლებს საშუალებას აძლევს აირჩიონ path-ის მიმართულება
- უზრუნველყოფს gradient styling-ს და hover effects-ს
- მხარდაჭერას უწევს disabled states-ს

**Location**: `src/components/ChoiceButtons.tsx`

**Status**: 🔴 **Critical Priority** - Phase 2 (Core BranchFeed Component!)

> ℹ️ **შენიშვნა**
>
> Choice Buttons Component არის BranchFeed-ის ყველაზე მნიშვნელოვანი ინტერაქტიური კომპონენტი, რომელიც გამოიყენება Story Detail Page-ზე.
>
> ეს კომპონენტი არის "Choose Your Own Adventure" კონცეფციის ბირთვი.

> ℹ️ **Cursor-ზე**
>
> ამ ფაილში მოყვანილი კოდი არის **სტრუქტურის მაგალითი**.
>
> რეალური იმპლემენტაცია უნდა შეიქმნას Cursor-ის მიერ, `.cursorrules` და
> `docs/PROJECT_PRIORITIES.md` ფაილებში აღწერილი წესების დაცვით.

---

## 🎯 Features

### Core Features (MVP - Phase 2)

1. **Two Choice Buttons**
   - Choice A button (primary gradient)
   - Choice B button (secondary gradient)
   - Grid layout (2 columns)
   - Equal width buttons

2. **Choice Labels**
   - Main label (required) - Short, descriptive text
   - Optional content (optional) - Additional description
   - Label customization (creator can set custom labels)

3. **Visual Styling**
   - Gradient backgrounds (primary/secondary colors)
   - Hover effects (darker gradient on hover)
   - Transition animations
   - Shimmer animation (optional - Phase 2+)

4. **Interactive States**
   - Enabled state (normal styling)
   - Disabled state (opacity, cursor-not-allowed)
   - Loading state (optional - show spinner)
   - Hover state (darker gradient)

5. **Accessibility**
   - Keyboard navigation (Tab, Enter, Space)
   - ARIA labels
   - Focus indicators
   - Screen reader support

---

## 📐 Component Structure

### Visual Structure

```
┌─────────────────────────────────────┐
│  Choice Buttons Container           │
│  ┌──────────────┐  ┌──────────────┐ │
│  │  Choice A    │  │  Choice B    │ │
│  │  [Gradient] │  │  [Gradient] │ │
│  │  Label      │  │  Label      │ │
│  │  Content    │  │  Content    │ │
│  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────┘
```

### Mobile Layout

```
┌─────────────────┐
│ Choice Buttons  │
│ ┌─────────────┐ │
│ │  Choice A   │ │
│ └─────────────┘ │
│ ┌─────────────┐ │
│ │  Choice B   │ │
│ └─────────────┘ │
└─────────────────┘
```

---

## 🎨 UI Components

### Used Components

1. **Button** (`src/components/ui/Button.tsx`)
   - Base button component (optional - can be custom)

2. **Spinner** (`src/components/ui/Spinner.tsx`)
   - Loading state (optional)

---

## 🔧 Implementation Details

### Component Props

```typescript
interface ChoiceButtonsProps {
  choiceA: {
    label: string; // Required: Main label (e.g., "Go left", "Pizza")
    content?: string; // Optional: Additional description
  };
  choiceB: {
    label: string; // Required: Main label (e.g., "Go right", "Salad")
    content?: string; // Optional: Additional description
  };
  onChoice: (choice: 'A' | 'B') => void; // Callback when choice is made
  disabled?: boolean; // Disable both buttons
  loading?: boolean; // Show loading state (optional)
  className?: string; // Optional additional classes
}
```

### Component Implementation

```typescript
// components/ChoiceButtons.tsx
'use client';

import { Spinner } from '@/components/ui/Spinner';

interface ChoiceButtonsProps {
  choiceA: {
    label: string;
    content?: string;
  };
  choiceB: {
    label: string;
    content?: string;
  };
  onChoice: (choice: 'A' | 'B') => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export function ChoiceButtons({ 
  choiceA, 
  choiceB, 
  onChoice, 
  disabled = false,
  loading = false,
  className = ''
}: ChoiceButtonsProps) {
  const handleChoice = (choice: 'A' | 'B') => {
    if (disabled || loading) return;
    onChoice(choice);
  };

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${className}`}>
      {/* Choice A Button */}
      <button
        onClick={() => handleChoice('A')}
        disabled={disabled || loading}
        className="relative px-6 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg font-semibold hover:from-primary-600 hover:to-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        aria-label={`Choice A: ${choiceA.label}`}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Spinner size="sm" color="white" />
          </div>
        )}
        <div className={loading ? 'opacity-0' : ''}>
          <span className="text-sm opacity-80 block mb-1">Choice A</span>
          <p className="text-lg font-bold">{choiceA.label}</p>
          {choiceA.content && (
            <p className="text-sm opacity-90 mt-1">{choiceA.content}</p>
          )}
        </div>
      </button>

      {/* Choice B Button */}
      <button
        onClick={() => handleChoice('B')}
        disabled={disabled || loading}
        className="relative px-6 py-4 bg-gradient-to-r from-secondary-500 to-secondary-600 text-white rounded-lg font-semibold hover:from-secondary-600 hover:to-secondary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:ring-offset-2"
        aria-label={`Choice B: ${choiceB.label}`}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Spinner size="sm" color="white" />
          </div>
        )}
        <div className={loading ? 'opacity-0' : ''}>
          <span className="text-sm opacity-80 block mb-1">Choice B</span>
          <p className="text-lg font-bold">{choiceB.label}</p>
          {choiceB.content && (
            <p className="text-sm opacity-90 mt-1">{choiceB.content}</p>
          )}
        </div>
      </button>
    </div>
  );
}
```

### Usage Example

```typescript
// In Story Detail Page
<ChoiceButtons 
  choiceA={{
    label: 'Go left',
    content: 'Explore the forest'
  }}
  choiceB={{
    label: 'Go right',
    content: 'Visit the village'
  }}
  onChoice={(choice) => {
    console.log(`User chose: ${choice}`);
    // Handle choice
  }}
  disabled={loading || currentDepth >= maxDepth}
  loading={loadingNextNode}
/>
```

---

## 🎨 UI Style Guidelines

### Gradient Colors

- **Choice A**: Primary gradient (`from-primary-500 to-primary-600`)
- **Choice B**: Secondary gradient (`from-secondary-500 to-secondary-600`)
- **Hover**: Darker gradient (`hover:from-primary-600 hover:to-primary-700`)
- **Disabled**: Reduced opacity (`opacity-50`)

### Typography

- **Label**: Large, bold text (`text-lg font-bold`)
- **Content**: Small, slightly transparent (`text-sm opacity-90`)
- **Choice indicator**: Small, very transparent (`text-sm opacity-80`)

### Layout

- **Grid**: 2 columns on desktop (`grid-cols-2`)
- **Grid**: 1 column on mobile (`grid-cols-1`)
- **Gap**: Consistent spacing (`gap-4`)
- **Padding**: Comfortable padding (`px-6 py-4`)

### States

- **Enabled**: Full opacity, hover effects
- **Disabled**: Reduced opacity, no hover
- **Loading**: Spinner overlay, text hidden
- **Focus**: Ring indicator for keyboard navigation

---

## 🌐 Internationalization (i18n)

### Translation Keys

```json
{
  "choiceButtons": {
    "choiceA": "Choice A",
    "choiceB": "Choice B",
    "loading": "Loading...",
    "disabled": "Choice unavailable"
  }
}
```

**Note**: UI-ში "Choice A" და "Choice B" ტექსტები ყოველთვის უნდა მივიდეს i18n key-ებიდან (`choiceButtons.choiceA`, `choiceButtons.choiceB`) და არ უნდა იყოს ჰარდკოდით ჩაწერილი კომპონენტის შიგნით.

---

## ✅ Requirements Checklist

- [ ] ChoiceButtons component created
- [ ] Two choice buttons (A/B)
- [ ] Gradient styling (primary/secondary)
- [ ] Hover effects
- [ ] Disabled state
- [ ] Loading state (optional)
- [ ] Label display
- [ ] Optional content display
- [ ] Keyboard navigation (Tab, Enter, Space)
- [ ] ARIA labels
- [ ] Focus indicators
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] i18n support (all text translatable)

---

## 🧪 Choice Buttons Component Testing Checklist (MVP)

1. ✅ Button Display:
   - Two buttons display correctly
   - Labels show correctly
   - Optional content shows when provided
   - Grid layout works (2 columns desktop, 1 column mobile)

2. ✅ Styling:
   - Gradient backgrounds apply correctly
   - Hover effects work
   - Disabled state shows reduced opacity
   - Focus indicators visible

3. ✅ Interaction:
   - Clicking button calls `onChoice` callback
   - Disabled buttons don't trigger callback
   - Loading state prevents interaction

4. ✅ Keyboard Navigation:
   - Tab key navigates between buttons
   - Enter/Space activates button
   - Focus indicators visible

5. ✅ Accessibility:
   - ARIA labels correct
   - Screen reader announces choices
   - Keyboard navigation works

6. ✅ Responsive:
   - Mobile: 1 column layout
   - Desktop: 2 columns layout
   - Buttons maintain equal width

---

## 🔄 Future Enhancements

- **Shimmer Animation**: Subtle shimmer effect on buttons
- **Icon Support**: Add icons to choices
- **Image Preview**: Show preview image for each choice
- **Choice Statistics**: Show how many users chose each option
- **Choice Recommendations**: AI-powered choice suggestions
- **Choice History**: Show user's previous choices
- **Choice Undo**: Allow user to undo last choice

---

## 📝 Notes

- **Phase 2 Priority**: Choice Buttons Component is critical priority for Phase 2
- **Gradient Colors**: Use primary/secondary colors from UI_STYLE_GUIDE
- **Label Length**: Keep labels short (1-3 words recommended)
- **Content**: Optional content can be longer description
- **Disabled State**: Controlled by parent component (based on depth, loading, etc.)
- **Accessibility**: Full keyboard and screen reader support required

---

## 🤖 Cursor Implementation Notes (Internal)

When implementing Choice Buttons Component in Cursor:

- Do NOT write code directly აქედან – გამოიყენე ეს დოკი როგორც source of truth.
- Steps:
  1. Create `ChoiceButtons` component with two buttons.
  2. Implement gradient styling (primary/secondary).
  3. Add hover effects and transitions.
  4. Implement disabled and loading states.
  5. Add keyboard navigation and accessibility.
  6. Test responsive design (mobile, tablet, desktop).
  7. Add tests according to "Choice Buttons Component Testing Checklist (MVP)".

---

**Last Updated**: 2025-01-XX  
**Version**: 1.0  
**Status**: Phase 2 (Core BranchFeed Component) - 🔴 Critical Priority

