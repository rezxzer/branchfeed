# Path Progress Component - BranchFeed

ეს დოკუმენტაცია აღწერს Path Progress Component-ის იმპლემენტაციას BranchFeed-ში.

---

## 📋 Overview

Path Progress Component არის BranchFeed-ის ვიზუალური ინდიკატორი, რომელიც:
- აჩვენებს მომხმარებლის პროგრესს branching story-ში
- ჩვენებს "Step X of Y" ტექსტს
- აჩვენებს path sequence-ს (A → B → A)
- უზრუნველყოფს progress bar-ს

**Location**: `src/components/PathProgress.tsx`

**Status**: 🔴 **Critical Priority** - Phase 2 (Core BranchFeed Component!)

> ℹ️ **შენიშვნა**
>
> Path Progress Component არის BranchFeed-ის მნიშვნელოვანი UX კომპონენტი, რომელიც გამოიყენება Story Detail Page-ზე.
>
> ეს კომპონენტი ეხმარება მომხმარებლებს გაიგონ, სად იმყოფებიან story-ში.

> ℹ️ **Cursor-ზე**
>
> ამ ფაილში მოყვანილი კოდი არის **სტრუქტურის მაგალითი**.
>
> რეალური იმპლემენტაცია უნდა შეიქმნას Cursor-ის მიერ, `.cursorrules` და
> `docs/PROJECT_PRIORITIES.md` ფაილებში აღწერილი წესების დაცვით.

---

## 🎯 Features

### Core Features (MVP - Phase 2)

1. **Progress Bar**
   - Visual progress bar (0-100%)
   - Current step / max steps display
   - Smooth transitions on step change
   - Color coding (primary color)

2. **Step Display**
   - "Step X of Y" text
   - Current step number
   - Max steps number
   - Percentage display (optional)

3. **Path Sequence Display**
   - Path sequence (A → B → A)
   - Visual path indicator (optional)
   - Path history (optional - Phase 2+)

4. **Completion Status**
   - Completion percentage
   - Visual completion indicator
   - "Path Complete" message (when at max depth)

5. **Accessibility**
   - ARIA labels
   - Screen reader support
   - Progress announcement

---

## 📐 Component Structure

### Visual Structure

```
┌─────────────────────────────────────┐
│  Path Progress                       │
│  Step 2 of 5              67%        │
│  ┌─────────────────────────────────┐ │
│  │████████████░░░░░░░░░░░░░░░░░░░░│ │
│  └─────────────────────────────────┘ │
│  Path: A → B                          │
└─────────────────────────────────────┘
```

### Mobile Layout

```
┌─────────────────┐
│ Path Progress   │
│ Step 2 of 5     │
│ [Progress Bar]  │
│ Path: A → B     │
└─────────────────┘
```

---

## 🎨 UI Components

### Used Components

- No external components required (self-contained)

---

## 🔧 Implementation Details

### Component Props

```typescript
interface PathProgressProps {
  currentStep: number; // Current step (1-based)
  maxSteps: number; // Maximum steps (e.g., 5)
  path?: string[]; // Path sequence (e.g., ['A', 'B', 'A'])
  showPath?: boolean; // Show path sequence (default: true)
  showPercentage?: boolean; // Show percentage (default: true)
  className?: string; // Optional additional classes
}
```

### Component Implementation

```typescript
// components/PathProgress.tsx
'use client';

import { useTranslation } from '@/hooks/useTranslation';

interface PathProgressProps {
  currentStep: number;
  maxSteps: number;
  path?: string[];
  showPath?: boolean;
  showPercentage?: boolean;
  className?: string;
}

export function PathProgress({ 
  currentStep, 
  maxSteps, 
  path = [],
  showPath = true,
  showPercentage = true,
  className = ''
}: PathProgressProps) {
  const { t } = useTranslation();
  const progress = Math.min((currentStep / maxSteps) * 100, 100);
  const pathString = path.join(' → ');

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Step Text and Percentage */}
      <div className="flex justify-between items-center text-sm">
        <span className="text-muted-foreground">
          {t('pathProgress.step', { current: currentStep, max: maxSteps })}
        </span>
        {showPercentage && (
          <span className="text-muted-foreground">
            {Math.round(progress)}%
          </span>
        )}
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
        <div 
          className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
          role="progressbar"
          aria-valuenow={currentStep}
          aria-valuemin={1}
          aria-valuemax={maxSteps}
          aria-label={t('pathProgress.step', { current: currentStep, max: maxSteps })}
        />
      </div>

      {/* Path Sequence */}
      {showPath && path.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {t('pathProgress.path', { path: pathString })}
        </p>
      )}

      {/* Completion Message */}
      {currentStep >= maxSteps && (
        <p className="text-sm text-primary font-semibold">
          {t('pathProgress.complete')}
        </p>
      )}
    </div>
  );
}
```

### Usage Example

```typescript
// In Story Detail Page
<PathProgress 
  currentStep={currentDepth + 1}
  maxSteps={story.max_depth}
  path={currentPath}
  showPath={true}
  showPercentage={true}
/>
```

---

## 🎨 UI Style Guidelines

### Progress Bar

- **Height**: `h-2` (8px) - Thin, unobtrusive
- **Background**: Muted color (`bg-muted`)
- **Fill**: Primary color (`bg-primary`)
- **Rounded**: `rounded-full` - Fully rounded
- **Transition**: Smooth animation (`transition-all duration-300`)

### Typography

- **Step Text**: Small, muted (`text-sm text-muted-foreground`)
- **Percentage**: Small, muted (optional)
- **Path Text**: Extra small, muted (`text-xs text-muted-foreground`)
- **Completion**: Small, primary, bold (`text-sm text-primary font-semibold`)

### Layout

- **Spacing**: Consistent spacing (`space-y-2`)
- **Alignment**: Left-aligned text, right-aligned percentage
- **Width**: Full width container

---

## 🌐 Internationalization (i18n)

### Translation Keys

```json
{
  "pathProgress": {
    "step": "Step {current} of {max}",
    "path": "Path: {path}",
    "complete": "Path Complete!"
  }
}
```

---

## ✅ Requirements Checklist

- [ ] PathProgress component created
- [ ] Progress bar display
- [ ] Step text ("Step X of Y")
- [ ] Percentage display (optional)
- [ ] Path sequence display
- [ ] Completion message
- [ ] Smooth transitions
- [ ] ARIA labels
- [ ] Screen reader support
- [ ] Responsive design
- [ ] i18n support (all text translatable)

---

## 🧪 Path Progress Component Testing Checklist (MVP)

1. ✅ Progress Bar:
   - Progress bar displays correctly
   - Width updates based on currentStep/maxSteps
   - Smooth transitions on step change
   - Color is primary color

2. ✅ Step Display:
   - "Step X of Y" text displays correctly
   - Current step updates correctly
   - Max steps displays correctly

3. ✅ Percentage:
   - Percentage calculates correctly
   - Percentage displays when enabled
   - Percentage hidden when disabled

4. ✅ Path Sequence:
   - Path sequence displays correctly
   - Path format: "A → B → A"
   - Path hidden when empty
   - Path hidden when showPath=false

5. ✅ Completion:
   - Completion message shows at max depth
   - Progress bar shows 100% at max depth

6. ✅ Accessibility:
   - ARIA labels correct
   - Screen reader announces progress
   - Progress bar has role="progressbar"

7. ✅ Responsive:
   - Mobile layout works
   - Desktop layout works
   - Text doesn't overflow

---

## 🔄 Future Enhancements

- **Visual Path Indicator**: Visual tree showing path
- **Path History**: Expandable path history
- **Path Comparison**: Compare with other users' paths
- **Path Statistics**: Show path popularity
- **Path Recommendations**: Suggest alternative paths
- **Path Sharing**: Share specific path
- **Path Bookmarks**: Save favorite paths

---

## 📝 Notes

- **Phase 2 Priority**: Path Progress Component is critical priority for Phase 2
- **Progress Calculation**: `(currentStep / maxSteps) * 100`
- **Step Numbering**: 1-based (Step 1, Step 2, etc.)
- **Path Format**: "A → B → A" (arrow-separated)
- **Completion**: Shown when `currentStep >= maxSteps`
- **Accessibility**: Full keyboard and screen reader support required

---

## 🤖 Cursor Implementation Notes (Internal)

When implementing Path Progress Component in Cursor:

- Do NOT write code directly აქედან – გამოიყენე ეს დოკი როგორც source of truth.
- Steps:
  1. Create `PathProgress` component with progress bar.
  2. Implement step text display.
  3. Add percentage calculation and display.
  4. Add path sequence display.
  5. Add completion message.
  6. Add accessibility features (ARIA labels).
  7. Test responsive design.
  8. Add tests according to "Path Progress Component Testing Checklist (MVP)".

---

**Last Updated**: 2025-01-XX  
**Version**: 1.0  
**Status**: Phase 2 (Core BranchFeed Component) - 🔴 Critical Priority

