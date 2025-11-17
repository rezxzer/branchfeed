# Error & Empty States

> Updates (2025-01):
>
> - Theme: States must adapt to Dark/Light themes via design tokens. Keep Dark as default; provide Light palette equivalents (e.g., `--error-foreground-light`, `--surface-light`).
> - i18n Keys: Prefer generalized namespaces, e.g., `emptyStates.feed.noContent.*` instead of `noPosts`, and `errorStates.common.network`/`retry` for reuse.

---

## 📋 Overview

Error States და Empty States არის UI კომპონენტები, რომელიც გამოიყენება სხვადასხვა სიტუაციებში:
- Empty States (როცა კონტენტი არ არის)
- Error States (როცა შეცდომა მოხდა)
- Network errors
- Loading errors

**Location**: `src/components/ui/EmptyState.tsx`, `src/components/ui/ErrorState.tsx`

**Status**: 🔴 **Critical Priority** - Phase 1 (Foundation)

---

## 🎯 Features

### Core Features (MVP - Phase 1)

1. **Empty State Component**
   - No content states
   - Icon + title + description
   - Action button (optional)

2. **Error State Component**
   - Error display
   - Error icon + message
   - Retry button (optional)

3. **Error Types**
   - Network errors
   - Loading errors
   - Generic errors

---

## 🎨 UI Components

### Empty State Component

```typescript
// src/components/ui/EmptyState.tsx
'use client';

import { cn } from '@/lib/utils';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className
}: EmptyStateProps) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center',
        'py-12 px-6 text-center',
        'bg-gray-50 rounded-2xl',
        className
      )}
    >
      {icon && (
        <div className="text-5xl mb-4 opacity-50">
          {icon}
        </div>
      )}
      <h3 className="text-xl font-semibold text-gray-700 mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-base text-gray-500 max-w-md mb-4">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
```

**UI Style** (see `UI_STYLE_GUIDE.md`):
- Container: `flex flex-col items-center justify-center py-12 px-6 text-center bg-gray-50 rounded-2xl`
- Icon: `text-5xl mb-4 opacity-50`
- Title: `text-xl font-semibold text-gray-700 mb-2`
- Description: `text-base text-gray-500 max-w-md`

### Error State Component

```typescript
// src/components/ui/ErrorState.tsx
'use client';

import { cn } from '@/lib/utils';
import { Button } from './Button';

export interface ErrorStateProps {
  icon?: React.ReactNode;
  title: string;
  message?: string;
  retryLabel?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState = ({
  icon,
  title,
  message,
  retryLabel,
  onRetry,
  className
}: ErrorStateProps) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center',
        'py-12 px-6 text-center',
        'bg-error-light border border-error rounded-2xl',
        className
      )}
    >
      {icon && (
        <div className="text-5xl mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-xl font-semibold text-error-dark mb-2">
        {title}
      </h3>
      {message && (
        <p className="text-base text-error mb-4 max-w-md">
          {message}
        </p>
      )}
      {retryLabel && onRetry && (
        <Button variant="primary" onClick={onRetry}>
          {retryLabel}
        </Button>
      )}
    </div>
  );
};
```

**UI Style** (see `UI_STYLE_GUIDE.md`):
- Container: `flex flex-col items-center justify-center py-12 px-6 text-center bg-error-light border border-error rounded-2xl`
- Icon: `text-5xl mb-4`
- Title: `text-xl font-semibold text-error-dark mb-2`
- Message: `text-base text-error max-w-md`

---

## 🔧 Implementation Details

### Empty State Types

1. **No Stories Yet**
   - Icon: 📖 Book icon
   - Title: "No Stories Yet"
   - Description: "Create your first branching story to get started!"
   - Action: "Create Story" button

2. **No Posts in Feed**
   - Icon: 🎬 Film icon
   - Title: "No Posts in Feed"
   - Description: "Follow users to see their posts in your feed"
   - Action: "Discover" button

3. **No Search Results**
   - Icon: 🔍 Search icon
   - Title: "No Results Found"
   - Description: "Try different keywords or filters"
   - Action: None

### Error State Types

1. **Error Loading Feed**
   - Icon: ⚠️ Warning icon
   - Title: "Error Loading Feed"
   - Message: "Something went wrong. Please try again."
   - Retry: "Retry" button

2. **Error Loading Story**
   - Icon: ❌ Error icon
   - Title: "Error Loading Story"
   - Message: "Unable to load this story. Please try again."
   - Retry: "Retry" button

3. **Network Error**
   - Icon: 📡 Network icon
   - Title: "Network Error"
   - Message: "Check your internet connection and try again."
   - Retry: "Retry" button

4. **Something Went Wrong**
   - Icon: 🔧 Wrench icon
   - Title: "Something Went Wrong"
   - Message: "An unexpected error occurred. Please try again later."
   - Retry: "Retry" button

### Usage Examples

```typescript
// Empty State
<EmptyState
  icon="📖"
  title="No Stories Yet"
  description="Create your first branching story to get started!"
  actionLabel="Create Story"
  onAction={() => router.push('/create')}
/>

// Error State
<ErrorState
  icon="⚠️"
  title="Error Loading Feed"
  message="Something went wrong. Please try again."
  retryLabel="Retry"
  onRetry={() => refetch()}
/>
```

---

## 🌐 Internationalization (i18n)

All text in Empty States and Error States should be translated:

```typescript
<EmptyState
  title={t('emptyStates.noStories.title')}
  description={t('emptyStates.noStories.description')}
  actionLabel={t('emptyStates.noStories.action')}
/>

<ErrorState
  title={t('errors.loadingFeed.title')}
  message={t('errors.loadingFeed.message')}
  retryLabel={t('errors.retry')}
/>
```

> **i18n Key Naming Convention**
> Empty/Error state-ებისთვის ვიყენებთ სტრუქტურირებულ key-ებს, მაგალითად:
>
> - Empty States:
>   - `emptyStates.feed.noPosts.title`
>   - `emptyStates.feed.noPosts.description`
>   - `emptyStates.feed.noPosts.action`
>   - `emptyStates.stories.noStories.*`
>
> - Error States:
>   - `errors.feed.loadFailed.title`
>   - `errors.feed.loadFailed.message`
>   - `errors.common.network.title`
>   - `errors.common.network.message`
>   - `errors.retry` (გლობალური Retry ღილაკისთვის)
>
> ეს სტრუქტურა უზრუნველყოფს, რომ Feed, Stories, Search და სხვა მოდულებმა
> გამოიყენონ ერთიანი სახელები და მოგვიანებით ადვილად მივამატოთ ახალი ენები.

---

## ♿ Accessibility

- All states must have proper semantic HTML
- Icons should have `aria-hidden="true"` (decorative)
- Titles should be proper headings (`<h3>`)
- Action buttons must be keyboard accessible
- Error states should be announced to screen readers

---

## 📱 Responsive Design

- Empty/Error states are responsive by default
- Padding adjusts on smaller screens
- Text wraps properly on mobile
- Icons scale appropriately

---

## ✅ Requirements Checklist

- [ ] Empty State component created
- [ ] Error State component created
- [ ] All empty state types implemented
- [ ] All error state types implemented
- [ ] Icon support
- [ ] Action/Retry buttons
- [ ] i18n support
- [ ] Accessibility (semantic HTML, ARIA)
- [ ] Responsive design
- [ ] Core views (Feed, Story Viewer, Profile, Search) use shared EmptyState/ErrorState components instead of custom ad-hoc markup
- [ ] Shared i18n keys defined for most common empty/error states (feed, stories, search)

---

## 🧪 Error States Testing Checklist (MVP)

1. ✅ Empty States render correctly:
   - Icon displays
   - Title and description display
   - Action button works (if provided)

2. ✅ Error States render correctly:
   - Icon displays
   - Title and message display
   - Retry button works (if provided)

3. ✅ Accessibility:
   - Screen reader announces state
   - Keyboard navigation works
   - Semantic HTML correct

4. ✅ Responsive:
   - Layout works on all screen sizes
   - Text wraps properly
   - Icons scale correctly

---

## 🔄 Future Enhancements

- **Custom Icons**: Support for custom icon components
- **Illustrations**: SVG illustrations for empty states
- **Error Details**: Expandable error details
- **Error Logging**: Automatic error logging

---

## 📝 Notes

- **Phase 1 Priority**: Error and Empty states are critical for UX
- **User-Friendly**: All error messages should be user-friendly
- **Actionable**: States should provide clear next steps
- **Consistency**: All states should follow the same design system
- **Usage Rules**: Feed, Story Viewer, Profile და Search გვერდებზე
  Empty/Error მდგომარეობები ყოველთვის უნდა გამოიყენოს **EmptyState/ErrorState** კომპონენტები
  და არა ad-hoc `<p>` ტექსტები.
  ეს უზრუნველყოფს ერთიან დიზაინს, i18n-ს და უკეთეს ხელმისაწვდომობას.

---

**Last Updated**: 2025-01-XX  
**Version**: 1.0  
**Status**: Phase 1 (Foundation) - Critical Priority

