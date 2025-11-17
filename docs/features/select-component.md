# Select Component - BranchFeed

## 📋 Overview

- **What**: Dropdown select component for forms
- **Purpose**: Provides a styled, accessible select dropdown for user input
- **Location**: `src/components/ui/Select.tsx`
- **Phase**: Phase 1 (Foundation)

## 🎯 Features

- Controlled and uncontrolled modes (standard HTML select behavior)
- Label support with optional required indicator
- Error state display
- Helper text support
- Full width option
- Dark theme styling (consistent with BranchFeed design system)
- Focus states with brand cyan color
- Disabled state support
- Accessibility: proper label association, ARIA attributes

## 📐 Component Structure

```
Select
├── Label (optional)
│   └── Required indicator (*)
├── Select Element
│   ├── Options (children)
│   └── Styling (error/disabled states)
└── Error/Helper Text (optional)
```

## 🎨 UI Components

- Uses BranchFeed design system colors:
  - Background: `bg-gray-800/50`
  - Border: `border-gray-700/50` (normal), `border-red-500/50` (error)
  - Text: `text-white`
  - Placeholder: `text-gray-400`
  - Focus ring: `focus:ring-brand-cyan`
  - Error text: `text-red-400`
  - Helper text: `text-gray-400`

## 🔧 Implementation

### Basic Usage

```tsx
import { Select } from '@/components/ui/Select'

<Select
  label="Choose an option"
  value={selectedValue}
  onChange={(e) => setSelectedValue(e.target.value)}
>
  <option value="">Select...</option>
  <option value="option1">Option 1</option>
  <option value="option2">Option 2</option>
</Select>
```

### With Error State

```tsx
<Select
  label="Country"
  error="Please select a country"
  value={country}
  onChange={(e) => setCountry(e.target.value)}
  required
>
  <option value="">Select country...</option>
  <option value="ge">Georgia</option>
  <option value="us">United States</option>
</Select>
```

### With Helper Text

```tsx
<Select
  label="Language"
  helperText="This will be your default language"
  value={language}
  onChange={(e) => setLanguage(e.target.value)}
>
  <option value="en">English</option>
  <option value="ka">Georgian</option>
</Select>
```

### Full Width

```tsx
<Select
  label="Category"
  fullWidth
  value={category}
  onChange={(e) => setCategory(e.target.value)}
>
  {/* options */}
</Select>
```

### Disabled State

```tsx
<Select
  label="Status"
  disabled
  value={status}
>
  {/* options */}
</Select>
```

## 📊 Props Interface

```typescript
export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}
```

### Props Description

- **label** (optional): Label text displayed above the select
- **error** (optional): Error message displayed below the select (takes priority over helperText)
- **helperText** (optional): Helper text displayed below the select (only shown if no error)
- **fullWidth** (optional): Whether the select should take full width of container (default: false)
- All standard HTML select attributes are supported (value, onChange, disabled, required, etc.)

## 🌐 Internationalization (i18n)

The Select component itself doesn't handle translations - labels, error messages, and helper text should be translated before passing to the component:

```tsx
import { useTranslation } from '@/hooks/useTranslation'

const { t } = useTranslation()

<Select
  label={t('form.country.label')}
  error={errors.country ? t('form.country.error') : undefined}
  helperText={t('form.country.helper')}
>
  {/* options */}
</Select>
```

## ✅ Requirements Checklist

- [x] Component created with TypeScript
- [x] Label support with required indicator
- [x] Error state styling and display
- [x] Helper text support
- [x] Full width option
- [x] Dark theme styling
- [x] Focus states
- [x] Disabled state
- [x] Accessibility (label association)
- [x] Exported from `src/components/ui/index.ts`

## 🔄 Future Enhancements

- Multi-select support
- Search/filter functionality for long option lists
- Custom option rendering
- Virtual scrolling for very long lists
- Option groups support
- Loading state for async options

## 📝 Notes

- Component follows BranchFeed design system (dark theme, brand colors)
- Uses `clsx` for conditional class names
- Automatically generates unique ID if not provided
- Error state takes priority over helper text
- Component is fully typed with TypeScript
- Compatible with React Hook Form and other form libraries

## 🔗 Related Documentation

- **UI Style Guide**: `docs/UI_STYLE_GUIDE.md`
- **Form Components**: `docs/features/form-components.md`
- **Input Component**: `src/components/ui/Input.tsx` (similar structure)

## 📊 Version History

| Version | Date | Changes |
| --- | --- | --- |
| 1.0 | 2025-01-15 | Initial implementation |

