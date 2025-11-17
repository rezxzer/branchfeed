# Auth Pages (Sign In / Sign Up)

> Improvements (2025-01):
>
> - Back to Home: Add a lightweight "← Home" link in the auth header for quick navigation to `/`.
> - Strong Password: Enforce stronger regex (e.g., `/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/`) and localized error messages.
> - Client-Side Guard: In addition to middleware, verify session on mount to handle expired sessions and redirect to `/feed` if already authenticated.

---

## 📋 Overview

Sign Up და Sign In გვერდები არის Authentication System-ის UI ნაწილი, სადაც:
- მომხმარებლები რეგისტრირდებიან (Sign Up)
- მომხმარებლები შედიან სისტემაში (Sign In)
- ხდება form validation და error handling

**Routes**: 
- `/signup` - Sign Up page
- `/signin` - Sign In page

**Status**: 🔴 **Critical Priority** - Phase 1 (Foundation)

> ℹ️ **შენიშვნა**
>
> Sign Up (`/signup`) და Sign In (`/signin`) გვერდები არის `Authentication System` დოკუმენტში აღწერილი ლოგიკის UI ნაწილი.
>
> Landing Page (`/`) და Middleware უნდა მუშაობდეს შეთანხმებულად:
> - არაუთენტიფიცირებული მომხმარებელი → ხედავს `/signup` / `/signin` გვერდებს;
> - ავტორიზებული მომხმარებელი → ყოველთვის გადამისამართდება `/feed`-ზე და აღარ ხედავს auth ფორმებს.

---

## 🎯 Features

### Sign Up Page Features

1. **Registration Form**
   - Email input field
   - Password input field
   - Confirm password input field
   - Form validation
   - Submit button

2. **Validation**
   - Email format validation
   - Password strength validation
   - Password match validation
   - Real-time validation feedback

3. **Error Handling**
   - Display validation errors
   - Display server errors
   - User-friendly error messages

4. **Success Handling**
   - Redirect to feed after successful sign up
   - Show success message

### Sign In Page Features

1. **Login Form**
   - Email input field
   - Password input field
   - Remember me checkbox (optional)
   - Submit button

2. **Validation**
   - Email format validation
   - Required field validation
   - Real-time validation feedback

3. **Error Handling**
   - Display validation errors
   - Display authentication errors
   - User-friendly error messages

4. **Success Handling**
   - Redirect to feed after successful sign in
   - Show success message

5. **Navigation**
   - Link to Sign Up page (if no account)
   - Link to password reset (optional, future)

### საერთო UX წესები ორივე გვერდისთვის

- ორივე გვერდი ვიზუალურად უნდა იგრძნობოდეს **ერთი ოჯახის** ნაწილად (იგივე layout, იგივე კონტეინერი, იგივე ბასიქ სტილები).

- ორივეგან უნდა გამოიყენებოდეს იგივე `Input`, `Button`, `Spinner` კომპონენტები, რომ შემდეგ დიზაინის შეცვლა ერთიანად იყოს შესაძლებელი.

- Validation წესები არ უნდა განსხვავდებოდეს UI-ში და `Authentication System` დოკუმენტში აღწერილი წესებისგან (მით უმეტეს პაროლის სიძლიერის მოთხოვნები).

- Error შეტყობინებები ორივეგან ეფუძნება **იგივე i18n key-ებს** (`auth.errors.*`), რომ ერთ ადგილას შევძლოთ შეცვლა.

---

## 📐 Page Layout

### Sign Up Page Structure

```
┌─────────────────────────────────────┐
│  Header                             │
│  [Logo] [Language Switcher]         │
├─────────────────────────────────────┤
│  Sign Up Form                       │
│  [Title: Sign Up]                   │
│  [Email Input]                      │
│  [Password Input]                   │
│  [Confirm Password Input]           │
│  [Submit Button]                    │
│  [Link to Sign In]                  │
└─────────────────────────────────────┘
```

### Sign In Page Structure

```
┌─────────────────────────────────────┐
│  Header                             │
│  [Logo] [Language Switcher]         │
├─────────────────────────────────────┤
│  Sign In Form                       │
│  [Title: Sign In]                   │
│  [Email Input]                      │
│  [Password Input]                   │
│  [Remember Me Checkbox] (optional)  │
│  [Submit Button]                    │
│  [Link to Sign Up]                  │
└─────────────────────────────────────┘
```

### Auth Header-ის ქცევა

- Auth გვერდების Header-ში უნდა ჩანდეს მხოლოდ:
  - Logo (BranchFeed)
  - Language Switcher

- Auth გვერდებზე **არ უნდა** გამოჩნდეს შიდა ნავიგაციის ლინკები (Feed, Profile, Create...) და Sign Out ღილაკი, რადგან ეს ფაზა არის „გზა სისტემაში შესვლამდე".

- თუ მომავალში დაემატება „Back to Landing" ბმული, ის უნდა გადადიოდეს `/`-ზე და იქ უკვე იმუშავებს Redirect ლოგიკა (auth სტატუსზე დამოკიდებულებით).

### Layout Components

1. **Header** - Logo, language switcher
2. **AuthForm** - Form container with title
3. **Form Fields** - Input components (Email, Password, Confirm Password)
4. **Submit Button** - Primary button for form submission
5. **Navigation Links** - Links to other auth pages

---

## 🎨 UI Components

> ℹ️ **Cursor-ზე**
>
> ქვემოთ მოყვანილი `SignUpPage` და `SignInPage` კომპონენტები არის **სტრუქტურისა და ლოგიკის მაგალითად**.
>
> რეალური კოდი უნდა შეიქმნას Cursor-ის მიერ, ჩვენს `.cursorrules` და
>
> `docs/PROJECT_PRIORITIES.md` ფაილებში აღწერილი წესების დაცვით (კოდი/SQL ინგლისურად,
>
> RLS `do $$ ... end $$;` სტილში და ა.შ.).

### SignUpPage Component

```typescript
// app/signup/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';
import { Header } from '@/components/Header';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import Link from 'next/link';

export default function SignUpPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  const { t } = useTranslation();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Email validation
    if (!email) {
      newErrors.email = t('auth.errors.emailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = t('auth.errors.invalidEmail');
    }
    
    // Password validation
    if (!password) {
      newErrors.password = t('auth.errors.passwordRequired');
    } else if (password.length < 8) {
      newErrors.password = t('auth.errors.weakPassword');
    }
    
    // Confirm password validation
    if (password !== confirmPassword) {
      newErrors.confirmPassword = t('auth.errors.passwordMismatch');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setErrors({});
    
    const result = await signUp(email, password);
    
    if (result.success) {
      router.push('/feed');
    } else {
      setErrors({ submit: result.error?.message || t('auth.errors.networkError') });
    }
    
    setLoading(false);
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
              {t('auth.signUp.title')}
            </h1>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('auth.signUp.email')}
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={errors.email}
                  required
                />
              </div>
              
              {/* Password Input */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('auth.signUp.password')}
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={errors.password}
                  required
                />
              </div>
              
              {/* Confirm Password Input */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('auth.signUp.confirmPassword')}
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  error={errors.confirmPassword}
                  required
                />
              </div>
              
              {/* Submit Error */}
              {errors.submit && (
                <div className="text-red-600 text-sm">{errors.submit}</div>
              )}
              
              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                disabled={loading}
              >
                {loading ? <Spinner /> : t('auth.signUp.submit')}
              </Button>
            </form>
            
            {/* Link to Sign In */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                {t('auth.signUp.alreadyHaveAccount')}{' '}
                <Link href="/signin" className="text-primary-600 hover:text-primary-700 font-medium">
                  {t('auth.signUp.signInLink')}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### SignInPage Component

```typescript
// app/signin/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';
import { Header } from '@/components/Header';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import Link from 'next/link';

export default function SignInPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const { t } = useTranslation();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!email) {
      newErrors.email = t('auth.errors.emailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = t('auth.errors.invalidEmail');
    }
    
    if (!password) {
      newErrors.password = t('auth.errors.passwordRequired');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setErrors({});
    
    const result = await signIn(email, password);
    
    if (result.success) {
      router.push('/feed');
    } else {
      setErrors({ submit: result.error?.message || t('auth.errors.invalidCredentials') });
    }
    
    setLoading(false);
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
              {t('auth.signIn.title')}
            </h1>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('auth.signIn.email')}
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={errors.email}
                  required
                />
              </div>
              
              {/* Password Input */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('auth.signIn.password')}
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={errors.password}
                  required
                />
              </div>
              
              {/* Submit Error */}
              {errors.submit && (
                <div className="text-red-600 text-sm">{errors.submit}</div>
              )}
              
              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                disabled={loading}
              >
                {loading ? <Spinner /> : t('auth.signIn.submit')}
              </Button>
            </form>
            
            {/* Link to Sign Up */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                {t('auth.signIn.noAccount')}{' '}
                <Link href="/signup" className="text-primary-600 hover:text-primary-700 font-medium">
                  {t('auth.signIn.signUpLink')}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

**UI Style** (see `UI_STYLE_GUIDE.md`):
- Form container: `bg-white rounded-2xl shadow-lg p-8`
- Input fields: See `docs/features/form-components.md` (to be created)
- Submit button: Primary variant, full width
- Error messages: `text-red-600 text-sm`

---

## 📱 Responsive Layout

Auth pages must be fully responsive across different screen sizes.

### Mobile (≤ 640px)

- **Form Container**:
  - Full width with padding (`px-4`)
  - Smaller padding: `p-6` instead of `p-8`
  - Stacked layout

- **Input Fields**:
  - Full width
  - Larger touch targets

- **Submit Button**:
  - Full width
  - Larger height for touch

### Tablet (≥ 768px)

- **Form Container**:
  - Max width: `max-w-md`
  - Centered layout

### Desktop (≥ 1024px)

- **Form Container**:
  - Max width: `max-w-md`
  - More spacing
  - Larger form fields

---

## 🔧 Implementation Details

### Form Validation

1. **Email Validation**
   - Required field
   - Valid email format (regex)
   - Real-time validation on blur

2. **Password Validation**
   - Required field
   - Minimum 8 characters
   - At least one uppercase letter
   - At least one lowercase letter
   - At least one number
   - At least one special character

3. **Confirm Password Validation**
   - Must match password
   - Real-time validation

#### i18n Error Key-ების შეთანხმება

Sign Up / Sign In ფორმები იყენებს შემდეგ error key-ებს:

- `auth.errors.emailRequired`
- `auth.errors.passwordRequired`
- `auth.errors.invalidEmail`
- `auth.errors.weakPassword`
- `auth.errors.passwordMismatch`
- `auth.errors.invalidCredentials`
- `auth.errors.networkError`

ეს key-ები აუცილებლად უნდა იყოს აღწერილი `Authentication System` დოკში მითითებულ i18n ფაილებში.
Error ტექსტები უნდა იყოს **მომხმარებლისთვის გასაგები**, ხოლო სერვერის შიდა შეტყობინებები
(მაგ. `"Database error"`, `"rate limit exceeded"`) პირდაპირ UI-ში არ უნდა გამოტანილ იქნას.

### Error Handling

1. **Client-side Validation**
   - Real-time feedback
   - Field-level errors
   - Form-level errors

2. **Server-side Errors**
   - Display authentication errors
   - Display network errors
   - User-friendly messages

#### უსაფრთხოების წესები Error Handling-ზე

- კონკრეტული მიზეზი, თუ რატომ ვერ შედის მომხმარებელი (მაგ. „ეს email საერთოდ არ არსებობს")
  უმჯობესია **არც გადაიწეროს palabra-სიტყვით Supabase-ის error-დან** – საკმარისია ზოგადი მესიჯები.

- Error მესიჯებში არ უნდა ჩანდეს:
  - SQL ტექსტები,
  - შიდა Error კოდები,
  - Stack trace ან რაიმე ისეთი, რაც სისტემის სტრუქტურაზე ბევრ რამეს ამბობს.

- ზედმეტი ცდის შემთხვევაში (მაგ. ერთმანეთის მიყოლებით მრავალი `invalidCredentials`)
  მომავალში შეიძლება დაემატოს Rate Limit / Lockout სისტემა (იხ. `Authentication System` დოკი).

### Redirect Logic

1. **After Sign Up**
   - Redirect to `/feed`
   - Show success message (optional)

2. **After Sign In**
   - Redirect to `/feed`
   - Show success message (optional)

3. **If Already Authenticated**
   - Redirect to `/feed` (handled by middleware)

#### Middleware + Auth Pages ქცევის შეთანხმება

- `/signup` და `/signin` გვერდებზე პირდაპირი არხით შესვლისას:
  - თუ სერვერზე (`getCurrentUser`) already authenticated user ჩანს → Middleware/Server redirect → `/feed`;
  - თუ user არ არის ავტორიზებული → ფორმა ნორმალურად იმაჩნება.

- ასე თავიდან ავიცილებთ სიტუაციას, როცა მომხმარებელი 1 წამით მაინც ხედავს auth ფორმას,
  მიუხედავად იმისა, რომ უკვე შესულია სისტემაში.

---

## 🌐 Internationalization (i18n)

Translation keys are already defined in `docs/features/authentication.md`. See that document for complete i18n structure.

---

## 🎨 Related Documentation

- **Authentication System**: See `docs/features/authentication.md` for auth logic
- **Form Components**: See `docs/features/form-components.md` (to be created) for Input, Button components
- **Header**: See `docs/features/header-navigation.md` (to be created) for Header component

---

## ✅ Requirements Checklist

- [ ] Sign Up page route (`/signup`) implemented
- [ ] Sign In page route (`/signin`) implemented
- [ ] Form validation (email, password, confirm password)
- [ ] Error handling (client-side and server-side)
- [ ] Loading states (spinner during submission)
- [ ] Redirect to feed after successful auth
- [ ] Redirect to feed if already authenticated
- [ ] Navigation links between Sign Up and Sign In
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] i18n translations
- [ ] Password strength indicator (optional)
- [ ] Remember me checkbox (optional)

---

## 🧪 Auth Pages Testing Checklist (MVP)

Sign Up / Sign In რომ ჩავთვალოთ დასრულებულად, უნდა გაიაროს ასეთი ტესტები:

1. ✅ არაუთენტიფიცირებული მომხმარებელი:
   - `/signup` → ჩანს ფორმა, ველების validation მუშაობს;
   - `/signin` → ჩანს ფორმა, ველების validation მუშაობს.

2. ✅ ავტორიზებული მომხმარებელი:
   - `/signup` და `/signin` → ავტომატურად გადაამისამართებს `/feed`-ზე.

3. ✅ Sign Up happy path:
   - სწორ email + ძლიერი პაროლი → წარმატებული რეგისტრაცია → redirect `/feed`-ზე.

4. ✅ Sign In happy path:
   - არსებული email + სწორი პაროლი → redirect `/feed`-ზე.

5. ✅ Invalid email ფორმატი:
   - ყრის `auth.errors.invalidEmail`-ის ტექსტს და არ უშვებს submit-ს.

6. ✅ Password слишком მოკლე ან სუსტი:
   - ყრის `auth.errors.weakPassword`-ის მესიჯს.

7. ✅ Password mismatch Sign Up-ზე:
   - `password` ≠ `confirmPassword` → `auth.errors.passwordMismatch`.

8. ✅ Network / Supabase error სიუჟეტი:
   - ხელოვნურად გამოიწვევ შეცდომა (მაგ. გამორთული Supabase URL)
     → საჭიროა ზოგადი, გასაგები მესიჯი (`auth.errors.networkError`).

9. ✅ Mobile layout:
   - პატარა ეკრანზე ფორმა იკითხება, ღილაკი ერთ ხაზზე ეტევა, input-ები არ იჭრება.

---

## 🔄 Future Enhancements

- **Magic Link Authentication**: Passwordless login via email
- **Social Auth**: Google, GitHub, etc. (optional)
- **Password Reset**: Forgot password functionality
- **Email Verification**: Verify email before account activation
- **Two-Factor Authentication (2FA)**: Enhanced security
- **Password Strength Meter**: Visual indicator of password strength
- **Remember Me**: Persistent sessions
- **Auto-fill Support**: Browser password manager integration

---

## 📝 Notes

- **Phase 1 Priority**: Auth pages are critical for user onboarding
- **Simple & Clear**: Keep forms simple and focused
- **Error Handling**: All errors must be user-friendly and actionable
- **Security**: Never expose sensitive information in error messages
- **Accessibility**: Ensure forms are accessible (labels, ARIA attributes)
- **Mobile First**: Design for mobile first, then scale up
- **Form Labels**: ფორმის ყველა ველი უნდა იყოს დაკავშირებული `<label>` თეგებთან,
  რომ screen reader-ებმა სწორად წაიკითხონ (Accessibility).
- **Error Association**: Error მესიჯები უნდა იყო დაკავშირებული შესაბამის input-თან `aria-describedby` ან მსგავს ატრიბუტებით,
  რომ ვიზუალურად და ტექნიკურადაც ცხადი იყოს, რომელ ველს ეხება პრობლემა.

---

**Last Updated**: 2025-01-XX  
**Version**: 1.0  
**Status**: Phase 1 (Foundation) - Critical Priority

