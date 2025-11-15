# Modal Component - BranchFeed

ეს დოკუმენტაცია აღწერს Modal Component-ის იმპლემენტაციას BranchFeed-ში.

---

## 📋 Overview

Modal Component არის BranchFeed-ის UI კომპონენტი, რომელიც:
- აჩვენებს modal dialogs-ს
- უზრუნველყოფს overlay-ს და close functionality-ს
- მხარდაჭერას უწევს keyboard navigation-ს (ESC to close)
- უზრუნველყოფს accessibility features-ს

**Location**: `src/components/ui/Modal.tsx`

**Status**: 🟢 **Medium Priority** - Phase 2 (UI Component)

> ℹ️ **შენიშვნა**
>
> Modal Component არის BranchFeed-ის ძირითადი UI კომპონენტი, რომელიც გამოიყენება Share Modal-ში და სხვა dialogs-ში.
>
> ეს კომპონენტი უზრუნველყოფს consistent modal experience-ს მთელ აპლიკაციაში.

> ℹ️ **Cursor-ზე**
>
> ამ ფაილში მოყვანილი კოდი არის **სტრუქტურის მაგალითი**.
>
> რეალური იმპლემენტაცია უნდა შეიქმნას Cursor-ის მიერ, `.cursorrules` და
> `docs/PROJECT_PRIORITIES.md` ფაილებში აღწერილი წესების დაცვით.

---

## 🎯 Features

### Core Features (MVP - Phase 2)

1. **Modal Display**
   - Modal dialog overlay
   - Modal content container
   - Close button
   - Title display (optional)

2. **Close Functionality**
   - Close button click
   - Overlay click to close (optional)
   - ESC key to close
   - onClose callback

3. **Accessibility**
   - ARIA labels
   - Focus trap (focus stays in modal)
   - Keyboard navigation
   - Screen reader support

4. **Styling**
   - Centered modal
   - Backdrop overlay
   - Rounded corners
   - Responsive design

---

## 📐 Component Structure

### Visual Structure

```
┌─────────────────────────────────────┐
│  Overlay (Backdrop)                 │
│  ┌─────────────────────────────┐   │
│  │ Modal Container              │   │
│  │ ┌─────────────────────────┐ │   │
│  │ │ Title [X]                │ │   │
│  │ ├─────────────────────────┤ │   │
│  │ │                         │ │   │
│  │ │   Modal Content         │ │   │
│  │ │                         │ │   │
│  │ └─────────────────────────┘ │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

---

## 🎨 UI Components

### Used Components

- No external components required (self-contained)

---

## 🔧 Implementation Details

### Component Props

```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}
```

### Component Implementation

```typescript
// components/ui/Modal.tsx
'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/Button';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
};

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  size = 'md',
  className = '',
}: ModalProps) {
  const { t } = useTranslation();
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Handle ESC key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // Focus trap
  useEffect(() => {
    if (!isOpen) return;

    // Save previous active element
    previousActiveElement.current = document.activeElement as HTMLElement;

    // Focus modal
    modalRef.current?.focus();

    // Lock body scroll
    document.body.style.overflow = 'hidden';

    return () => {
      // Restore body scroll
      document.body.style.overflow = '';
      
      // Restore focus
      previousActiveElement.current?.focus();
    };
  }, [isOpen]);

  // Handle overlay click
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div
        ref={modalRef}
        className={cn(
          'bg-surface rounded-2xl shadow-xl w-full',
          sizeClasses[size],
          className
        )}
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        {/* Header */}
        {(title || closeOnEscape) && (
          <div className="flex items-center justify-between p-6 border-b">
            {title && (
              <h2 id="modal-title" className="text-xl font-semibold">
                {title}
              </h2>
            )}
            {closeOnEscape && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                aria-label={t('modal.close')}
              >
                ×
              </Button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
```

### Usage Example

```typescript
// In ShareModal or other components
const [isOpen, setIsOpen] = useState(false);

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Share Story"
  size="md"
  closeOnOverlayClick={true}
  closeOnEscape={true}
>
  <div>
    {/* Modal content */}
  </div>
</Modal>
```

---

## 🌐 Internationalization (i18n)

### Translation Keys

```json
{
  "modal": {
    "close": "Close",
    "errors": {
      "closeFailed": "Failed to close modal"
    }
  }
}
```

---

## ✅ Requirements Checklist

- [ ] Modal component created
- [ ] Overlay backdrop
- [ ] Close button
- [ ] ESC key to close
- [ ] Overlay click to close (optional)
- [ ] Focus trap (Tab/Shift+Tab უნდა ცირკულირებდეს მხოლოდ მოდალის შიგნით, სანამ modal ღიაა)
- [ ] Body scroll lock
- [ ] ARIA labels
- [ ] Keyboard navigation
- [ ] Responsive design
- [ ] Portal rendering
- [ ] i18n support (all text translatable)

---

## 🧪 Modal Component Testing Checklist (MVP)

1. ✅ Modal Display:
   - Modal opens correctly
   - Modal closes correctly
   - Overlay displays correctly
   - Content displays correctly

2. ✅ Close Functionality:
   - Close button works
   - ESC key closes modal
   - Overlay click closes modal (if enabled)
   - onClose callback fires

3. ✅ Focus Management:
   - Focus trap works
   - Focus returns to previous element
   - Body scroll locked when open

4. ✅ Accessibility:
   - ARIA labels correct
   - Keyboard navigation works
   - Screen reader support
   - Focus indicators visible
   - `role="dialog"` და `aria-modal="true"` ატრიბუტები უნდა იყოს მინიჭებული უშუალოდ მოდალის კონტეინერს, და `aria-labelledby` უნდა მიუთითებდეს მოდალში არსებულ სათაურს (title), რათა Screen Reader-ებმა სწორად ამოიცნონ დიალოგი

5. ✅ Responsive:
   - Mobile layout works
   - Desktop layout works
   - Modal doesn't overflow viewport

---

## 🔄 Future Enhancements

- **Animation**: Fade in/out animations
- **Multiple Modals**: Stack multiple modals
- **Modal Sizes**: More size options
- **Custom Overlay**: Customizable overlay styles
- **Modal Transitions**: Smooth transitions

---

## 📝 Notes

- **Phase 2 Priority**: Modal Component is medium priority for Phase 2
- **Portal Rendering**: Modal renders in document.body using React Portal
- **Focus Trap**: Focus stays within modal when open
- **Body Scroll Lock**: Body scroll is locked when modal is open
- **Accessibility**: Full keyboard and screen reader support required
- **Client-only Component**: Modal Component არის client-side კომპონენტი (იყენებს `document`-სა და React Portal-ს), ამიტომ მისი მოხმობა უნდა მოხდეს მხოლოდ client components-დან ან client wrapper-ებიდან
- **Design Tokens**: Modal-ის სტილში გამოყენებული utility კლასები (მაგ. `bg-surface`, `backdrop-blur-sm`) უნდა იყოს აღწერილი საერთო UI style guide-ში, რომ სხვა კომპონენტებშიც ერთი და იგივე დიზაინ ტოკენები იქნას გამოყენებული

---

## 🤖 Cursor Implementation Notes (Internal)

When implementing Modal Component in Cursor:

- Do NOT write code directly აქედან – გამოიყენე ეს დოკი როგორც source of truth.
- Steps:
  1. Create `Modal` component with overlay and content.
  2. Implement close functionality (button, ESC, overlay).
  3. Implement focus trap.
  4. Implement body scroll lock.
  5. Add accessibility features (ARIA labels).
  6. Add portal rendering.
  7. Test responsive design.
  8. Add tests according to "Modal Component Testing Checklist (MVP)".

---

**Last Updated**: 2025-01-XX  
**Version**: 1.0  
**Status**: Phase 2 (UI Component) - 🟢 Medium Priority

