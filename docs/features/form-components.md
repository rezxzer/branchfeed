# Form Components - BranchFeed

ეს დოკუმენტაცია აღწერს Form Components-ის იმპლემენტაციას BranchFeed-ში.

---

## 📋 Overview

Form Components არის UI კომპონენტების ნაკრები, რომელიც გამოიყენება ყველა form-ში:
- Input fields (text, email, password, etc.)
- Textarea
- Select dropdown
- Checkbox
- Radio buttons
- Form validation
- Error messages

**Location**: `src/components/ui/Input.tsx`, `src/components/ui/Textarea.tsx`, etc.

**Status**: 🔴 **Critical Priority** - Phase 1 (Foundation)

---

## 🎯 Features

### Core Components (MVP - Phase 1)

1. **Input Component**
   - Text input
   - Email input
   - Password input
   - Number input
   - Error state
   - Disabled state
   - Placeholder support

2. **Textarea Component**
   - Multi-line text input
   - Resizable (optional)
   - Error state
   - Disabled state
   - Character count (optional)

3. **Select Component**
   - Dropdown selection
   - Multiple selection (optional)
   - Error state
   - Disabled state

4. **Label Component**
   - Form field labels
   - Required indicator
   - Accessibility support

5. **Form Validation**
   - Real-time validation
   - Error messages
   - Success states (optional)

---

## 🎨 UI Components

### Input Component

```typescript
// src/components/ui/Input.tsx
'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, label, id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={cn(
            'w-full px-4 py-2 border rounded-lg transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
            error
              ? 'border-red-300 bg-red-50'
              : 'border-gray-300 bg-white hover:border-gray-400',
            props.disabled && 'bg-gray-100 cursor-not-allowed',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
```

**UI Style** (see `UI_STYLE_GUIDE.md`):
- Input: `px-4 py-2 border rounded-lg`
- Focus: `focus:ring-2 focus:ring-primary-500`
- Error: `border-red-300 bg-red-50`
- Disabled: `bg-gray-100 cursor-not-allowed`

### Textarea Component

```typescript
// src/components/ui/Textarea.tsx
'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  label?: string;
  maxLength?: number;
  showCharCount?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, label, id, maxLength, showCharCount, ...props }, ref) => {
    const inputId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
    const charCount = props.value?.toString().length || 0;
    
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <textarea
          id={inputId}
          ref={ref}
          maxLength={maxLength}
          className={cn(
            'w-full px-4 py-2 border rounded-lg transition-colors resize-y',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
            'min-h-[100px]',
            error
              ? 'border-red-300 bg-red-50'
              : 'border-gray-300 bg-white hover:border-gray-400',
            props.disabled && 'bg-gray-100 cursor-not-allowed',
            className
          )}
          {...props}
        />
        <div className="flex justify-between items-center mt-1">
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
          {showCharCount && maxLength && (
            <p className={cn(
              'text-sm ml-auto',
              charCount > maxLength * 0.9 ? 'text-orange-600' : 'text-gray-500'
            )}>
              {charCount} / {maxLength}
            </p>
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
```

**UI Style**:
- Textarea: `px-4 py-2 border rounded-lg resize-y min-h-[100px]`
- Character count: `text-sm text-gray-500` (orange when near limit)

### Select Component

```typescript
// src/components/ui/Select.tsx
'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  label?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, label, id, options, ...props }, ref) => {
    const inputId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
    
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <select
          id={inputId}
          ref={ref}
          className={cn(
            'w-full px-4 py-2 border rounded-lg transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
            'appearance-none bg-white',
            error
              ? 'border-red-300 bg-red-50'
              : 'border-gray-300 hover:border-gray-400',
            props.disabled && 'bg-gray-100 cursor-not-allowed',
            className
          )}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
```

**UI Style**:
- Select: `px-4 py-2 border rounded-lg appearance-none`
- Custom arrow can be added with CSS

### Checkbox Component

```typescript
// src/components/ui/Checkbox.tsx
'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, error, label, id, ...props }, ref) => {
    const inputId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;
    
    return (
      <div className="w-full">
        <div className="flex items-center">
          <input
            id={inputId}
            ref={ref}
            type="checkbox"
            className={cn(
              'w-4 h-4 text-primary-600 border-gray-300 rounded',
              'focus:ring-2 focus:ring-primary-500',
              error && 'border-red-300',
              className
            )}
            {...props}
          />
          {label && (
            <label
              htmlFor={inputId}
              className="ml-2 text-sm text-gray-700"
            >
              {label}
              {props.required && <span className="text-red-500 ml-1">*</span>}
            </label>
          )}
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
```

**UI Style**:
- Checkbox: `w-4 h-4 text-primary-600 border-gray-300 rounded`
- Focus: `focus:ring-2 focus:ring-primary-500`

> ℹ️ ID მართვის პრინციპი
> - Form კომპონენტისთვის პრეფერენციულია, რომ **მშობელმა გადასცეს `id` prop**, განსაკუთრებით SSR გვერდებზე.
> - თუ `id` არ არის გადაცემული, კომპონენტი აგენერირებს დროებით `id`-ს მხოლოდ UX-ისთვის.
> - Production ფორმებში რეკომენდებულია ყოველთვის გამოვიყენოთ სტაბილური, ხელით გადაცემული `id`-ები (მაგ. `"signup-email"`, `"signup-password"`), რომ ავიცილოთ hydration-ის პრობლემები და გაადვილდეს დიბაგი.

### Label Component

```typescript
// src/components/ui/Label.tsx
'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, required, children, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(
          'block text-sm font-medium text-gray-700 mb-2',
          className
        )}
        {...props}
      >
        {children}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
    );
  }
);

Label.displayName = 'Label';
```

**UI Style**:
- Label: `block text-sm font-medium text-gray-700 mb-2`
- Required indicator: `text-red-500 ml-1`

### Label-ის გამოყენების წესები

- პატარა, მარტივ ფორმებში (Sign In, Sign Up, Single Field) შეიძლება გამოვიყენოთ **`label` prop** პირდაპირ `Input`/`Textarea`/`Select` კომპონენტზე.

- უფრო კომპლექსურ ფორმებში (განსაკუთრებით როცა ვმართავთ layout-ს, grid-ს ან ვამატებთ help text-ს) რეკომენდებულია ცალკე **`<Label>` კომპონენტის** გამოყენება:
  - `<Label htmlFor="field-id">` + `<Input id="field-id" />`

- ნებისმიერი ვარიანტის დროს:
  - ერთი field → ერთ label-ს უკავშირდება;
  - Required ვარსკვლავი (`*`) მართავს ან `required` prop-ი (Input/Textarea/Select), ან `<Label required>`.

---

## 📱 Responsive Design

Form components must be fully responsive across different screen sizes.

### Mobile (≤ 640px)

- **Input Fields**:
  - Full width
  - Larger touch targets (min-height: 44px)
  - Larger font size for better readability

- **Textarea**:
  - Full width
  - Minimum height for mobile

- **Select**:
  - Full width
  - Native mobile select (better UX)

### Tablet (≥ 768px)

- **Input Fields**:
  - Standard sizing
  - Standard touch targets

### Desktop (≥ 1024px)

- **Input Fields**:
  - Standard sizing
  - Hover states
  - Keyboard navigation

---

## 🔧 Usage Examples

### Sign Up Form Example

```typescript
// Example usage in Sign Up form
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export function SignUpForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  return (
    <form onSubmit={handleSubmit}>
      <Input
        type="email"
        label="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
        required
      />
      <Input
        type="password"
        label="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
        required
      />
      <Button type="submit" variant="primary">
        Sign Up
      </Button>
    </form>
  );
}
```

### Textarea Example

```typescript
// Example usage with Textarea
import { Textarea } from '@/components/ui/Textarea';

export function BioEditor() {
  const [bio, setBio] = useState('');
  
  return (
    <Textarea
      label="Bio"
      value={bio}
      onChange={(e) => setBio(e.target.value)}
      maxLength={500}
      showCharCount
      placeholder="Tell us about yourself..."
    />
  );
}
```

### Select Example

```typescript
// Example usage with Select
import { Select } from '@/components/ui/Select';

export function LanguageSelector() {
  const [language, setLanguage] = useState('en');
  
  const languages = [
    { value: 'ka', label: 'Georgian' },
    { value: 'en', label: 'English' },
    { value: 'de', label: 'German' },
    { value: 'ru', label: 'Russian' },
    { value: 'fr', label: 'French' },
  ];
  
  return (
    <Select
      label="Language"
      value={language}
      onChange={(e) => setLanguage(e.target.value)}
      options={languages}
    />
  );
}
```

---

## 🌐 Internationalization (i18n)

Form components use translation keys for labels and error messages. See `docs/features/authentication.md` and `docs/features/auth-pages.md` for i18n examples.

> i18n პრინციპი Form Components-ზე
> - Form კომპონენტები **არ იძახებენ `t()` ფუნქციას შიგნით**.
> - ყველა label, placeholder, error ტექსტი უნდა გადმოვიდეს გარედან, უკვე თარგმნილი (მაგ.: `label={t('auth.signUp.email')}`, `error={t('auth.errors.invalidEmail')}`).
> - ეს ინარჩუნებს კომპონენტების სისუფთავეს და ამარტივებს თარგმნის მართვას.

---

## 🔧 Form Validation

### Error Handling სტანდარტი

- ყველა ფორმა იყენებს ერთსა და იმავე Error ობიექტის სტრუქტურას:
  - `Record<string, string>` – სადაც key არის field-ის სახელი (მაგ.: `"email"`, `"password"`, `"confirmPassword"`, `"submit"`).

- Field-ს მიეწოდება თავისი error სტრინგი კომპონენტის `error` prop-ით, მაგ.:
  - `error={errors.email}`
  - `error={errors.password}`

- ზოგადი, form-level შეცდომები (მაგ. „Invalid credentials", „Network error") ინახება `errors.submit`-ში და გამოჩნდება ფორმის ქვედა/ზედა ნაწილში ერთიანი ტექსტით.

- Validation-ის ლოგიკა (regex, სილები) არ არის ჩაშენებული კომპონენტებში – კომპონენტები მხოლოდ იღებენ `error` prop-ს და აჩვენებენ შესაბამის სტილს.

### Validation UX წესები

- Email/Password ველებს:
  - პირველ ეტაპზე ვამოწმებთ **form submit-ისას**;
  - სურვილისამებრ შეიძლება დაემატოს `onBlur` validation (ველიდან გამოსვლისას), მაგრამ არა ყოველ keypress-ზე.

- Password strength (Phase 2+):
  - არ უნდა ბლოკავდეს input-ს;
  - strength meter მხოლოდ ინფორმაციად ჩანს (`weak / medium / strong`), საბოლოო შემოწმება მაინც ხდება submit-ისას.

- Error-ს რომ გავასწორებთ (მაგ. მომხმარებელმა გამოასწორა email), შესაბამისი `errors[field]` უნდა განულდეს, რომ წითელი ტექსტი არ დარჩეს.

---

## 🎨 Related Documentation

- **Button Component**: See `docs/UI_STYLE_GUIDE.md` for button styles
- **Form Validation**: See `docs/features/auth-pages.md` for validation examples
- **UI Style Guide**: See `docs/UI_STYLE_GUIDE.md` for overall UI styles

---

## ✅ Requirements Checklist

- [ ] Input component created
- [ ] Textarea component created
- [ ] Select component created
- [ ] Checkbox component created
- [ ] Label component created
- [ ] Error state styling
- [ ] Disabled state styling
- [ ] Focus states
- [ ] Required field indicator
- [ ] Accessibility (ARIA labels, keyboard navigation)
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Character count for Textarea (optional)
- [ ] Form validation integration

---

## 🧪 Form Components Testing Checklist

1. ✅ Input
   - ჩვეულებრივი მდგომარეობა (no error, enabled);
   - error prop-ის გადაცემისას ჩნდება წითელი ჩარჩო და ტექსტი;
   - disabled prop-ით ხდება ნაცრისფერი და `cursor-not-allowed`;
   - focus:ring მუშაობს Tab-ით და მაუსით.

2. ✅ Textarea
   - min height მუშაობს (გრძელი ტექსტი სქროლდება);
   - showCharCount + maxLength აჩვენებს სწორ რიცხვებს;
   - როცა მივუახლოვდებით ლიმიტს, ფერი იცვლება (orange).

3. ✅ Select
   - ყველა option ჩანს და აირჩევა;
   - disabled მდგომარეობა სწორად ბლოკავს interaction-ს.

4. ✅ Checkbox
   - label-ზე კლიკიც ინიშნება/იხსნება checkbox-ს;
   - error-ის დროს წითელი ტექსტი ჩანს.

5. ✅ Accessibility
   - Screen reader ხედავს label-ს და error ტექსტს (ARIA ატრიბუტებით);
   - Form fields focus-ით მისადგომია და ხილული focus სტილი აქვს.

6. ✅ Responsive
   - Mobile-ზე (`≤640px`) ყველა field სრულ სიგანეზეა;
   - Desktop-ზე layout არ ინგრევა, hover/focus სტილები მუშაობს.

---

## 🔄 Future Enhancements

- **Date Picker**: Date input component
- **File Upload**: File input with preview
- **Rich Text Editor**: WYSIWYG editor for textarea
- **Autocomplete**: Input with autocomplete suggestions
- **Password Strength Meter**: Visual indicator for password strength
- **Input Icons**: Icons inside input fields
- **Input Groups**: Multiple inputs grouped together
- **Form Wizard**: Multi-step form component
- **Form Library Integrations**: Helper wrapper-ები React Hook Form/Zod-თან ინტეგრაციისთვის
  (მაგ. `FormField` კომპონენტი, რომელიც აკავშირებს Input-ს validation schema-სთან).

---

## ♿ Accessibility წესები Form Components-ზე

- ყველა Input / Textarea / Select ელემენტმა, რომელსაც აქვს შეცდომა, უნდა გამოიყენოს:
  - `aria-invalid="true"` შეცდომის არსებობისას;
  - `aria-describedby="field-error-{id}"`, სადაც უკავშირდება შეცდომის `<p>` ელემენტს.

- Error ტექსტი (`<p class="text-sm text-red-600">`) უნდა ჰქონდეს `id="field-error-{id}"`, რომ screen reader-მა სწორად წაიკითხოს.

- Checkbox-ის label ყოველთვის უნდა იყოს მიბმული `htmlFor`-ით შესაბამის `id`-ზე, რომ მთლიანი მწკრივი კლიკებადი იყოს.

- ყველა form field უნდა იყოს focus-ით მისადგომი (`Tab`), და focus სტილები უნდა იყოს ნათელი (ენქორირებული `UI_STYLE_GUIDE.md`-ში).

---

## 📝 Notes

- **Phase 1 Priority**: Form components are critical for all forms (Sign Up, Sign In, Create Story, etc.)
- **Accessibility**: All form components must be accessible (labels, ARIA attributes, keyboard navigation)
- **Consistency**: All form components should follow the same design system
- **Error Handling**: All form components should support error states
- **Reusability**: Components should be reusable across different forms

---

**Last Updated**: 2025-01-XX  
**Version**: 1.0  
**Status**: Phase 1 (Foundation) - Critical Priority

