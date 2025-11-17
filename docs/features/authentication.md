# Authentication System - BranchFeed

> Improvements (2025-01):
>
> - Server Client: Prefer `createServerComponentClient` from `@supabase/ssr` for reliable cookie handling in server components and routes.
> - Profile Creation: Use sign-up callback to insert profile as primary path; keep DB trigger only as fallback safety net.
> - Rate Limiting: Gate auth-related endpoints (login/signup error responses) via Supabase Edge Functions or middleware throttling to mitigate abuse.

---

## 📋 Overview

Authentication System არის BranchFeed-ის ბირთვი, რომელიც უზრუნველყოფს:
- მომხმარებლის რეგისტრაციას (Sign Up)
- მომხმარებლის ავტორიზაციას (Sign In)
- Session management-ს
- Protected routes-ის დაცვას
- User profile-ის ავტომატურ შექმნას

**Tech Stack**: Supabase Auth (Email/Password ან Magic Link)

**Status**: 🔴 **Critical Priority** - Phase 1 (Foundation)

> ℹ️ **შენიშვნა Cursor-ზე**
>
> ამ დოკუმენტში მოყვანილი TypeScript კოდები არის **სტრუქტურული მაგალითები**.
>
> რეალური იმპლემენტაცია უნდა შეიქმნას Cursor-ის მიერ, `.cursorrules` და
>
> `docs/PROJECT_PRIORITIES.md` ფაილებში აღწერილი წესების დაცვით.

---

## 🧱 Implementation Strategy (High-Level)

ამ ფაილი აღწერს მხოლოდ ლოგიკას. რეალური იმპლემენტაცია უნდა ეფუძნებოდეს Supabase-ის ოფიციალურ რეკომენდაციებს Next.js App Router-ისთვის:

- Server-side auth გამოიყენებს ერთიან helper-ს (`createServerClient`) და **არ ვაკეთებთ JWT-ის ხელით გაშიფვრას ან cookie-ს სახელების გამოცნობას**.

- Client-side auth გამოიყენებს ერთ helper-ს (`createClientClient` ან ანალოგურს), რომელსაც Cursor შექმნის Supabase-ის დოკუმენტაციაზე დაყრდნობით.

- ყველა auth ოპერაცია (`signIn`, `signUp`, `signOut`, `getCurrentUser`) ინახება **მხოლოდ** `src/lib/auth.ts` ფაილში, რომ სხვა კოდში არ გაჩნდეს დუბლირებული ლოგიკა.

---

## 🎯 Features

### Core Features (MVP - Phase 1)

1. **Sign Up (Registration)**
   - Email/Password registration
   - Magic Link registration (optional, can be added later)
   - Email validation
   - Password strength validation
   - User profile creation after sign up

2. **Sign In (Login)**
   - Email/Password login
   - Magic Link login (optional)
   - Session management
   - Remember me functionality (optional)

3. **Sign Out (Logout)**
   - Session termination
   - Redirect to landing page

4. **Session Management**
   - Automatic session refresh
   - Session persistence (cookies, managed by Supabase Auth)
   - Session expiration handling

5. **Protected Routes**
   - Route protection middleware
   - Redirect to sign in if not authenticated
   - Redirect to feed if already authenticated

6. **User Profile Creation**
   - Automatic profile creation on sign up
   - Default username generation (from email)
   - Default avatar assignment

---

## 🔧 Implementation

### Authentication Helper Functions

```typescript
// src/lib/auth.ts
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Server-side Supabase client
export function createServerClient() {
  const cookieStore = cookies();
  
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      getSession: async () => {
        const cookie = cookieStore.get('sb-access-token');
        if (!cookie) return { data: { session: null }, error: null };
        // Parse and return session from cookie
      },
    },
  });
}

// Client-side Supabase client
export function createClientClient() {
  return createClient(supabaseUrl, supabaseAnonKey);
}

// Sign up with email and password
export async function signUp(email: string, password: string) {
  const supabase = createClientClient();
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  
  if (error) throw error;
  
  // Note: Profile creation is handled by database trigger (see Profile Creation Strategy section)
  // This is a fallback only - trigger should create profile automatically
  // if (data.user) {
  //   await createUserProfile(data.user.id, email);
  // }
  
  return data;
}

// Sign in with email and password
export async function signIn(email: string, password: string) {
  const supabase = createClientClient();
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) throw error;
  return data;
}

// Sign out
export async function signOut() {
  const supabase = createClientClient();
  
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// Get current user (server-side)
export async function getCurrentUser() {
  const supabase = createServerClient();
  
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error) return null;
  return user;
}

// Get current user (client-side)
export async function getCurrentUserClient() {
  const supabase = createClientClient();
  
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error) return null;
  return user;
}

// Check if user is authenticated
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return user !== null;
}

// Create user profile after sign up (FALLBACK ONLY)
// Note: Profile creation should be handled by database trigger (see Profile Creation Strategy section)
// This function is only used as a fallback if trigger fails
async function createUserProfile(userId: string, email: string) {
  const supabase = createServerClient();
  
  // Generate default username from email
  const defaultUsername = email.split('@')[0] + Math.floor(Math.random() * 1000);
  
  const { error } = await supabase
    .from('profiles')
    .insert({
      id: userId,
      email: email,
      username: defaultUsername,
      avatar_url: null,
      bio: null,
      created_at: new Date().toISOString(),
    });
  
  if (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
}
```

### Authentication Hook (Client-side)

```typescript
// src/hooks/useAuth.ts
'use client';

import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { createClientClient, signIn, signUp, signOut } from '@/lib/auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Get initial user
    getCurrentUserClient().then(setUser).finally(() => setLoading(false));
    
    // Listen for auth changes
    const supabase = createClientClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );
    
    return () => subscription.unsubscribe();
  }, []);
  
  const handleSignIn = async (email: string, password: string) => {
    try {
      const data = await signIn(email, password);
      setUser(data.user);
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };
  
  const handleSignUp = async (email: string, password: string) => {
    try {
      const data = await signUp(email, password);
      setUser(data.user);
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };
  
  const handleSignOut = async () => {
    try {
      await signOut();
      setUser(null);
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };
  
  return {
    user,
    loading,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut,
    isAuthenticated: user !== null,
  };
}
```

### Session Storage Policy

უსაფრთხოების გამო:

- Session/token ინფორმაცია ინახება მხოლოდ **HTTP-only cookies**-ში, რომელსაც Supabase/Auth helper-ები მართავს.

- **არ ვიყენებთ `localStorage` ან `sessionStorage`-ს** auth token-ებისთვის.

- Client-მა უნდა გამოიყენოს Supabase SDK ან server components, რომ გაიგოს user-ის სტატუსი, და არა ხელით შენახული სტრინგები ბრაუზერში.

### Protected Route Middleware

```typescript
// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Protected routes (require authentication)
  // See "Protected Routes Map (MVP)" section for complete list
  const protectedRoutes = ['/feed', '/create', '/post', '/profile', '/settings'];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  
  // Auth routes (redirect if already authenticated)
  const authRoutes = ['/signin', '/signup'];
  const isAuthRoute = authRoutes.includes(pathname);
  
  // Check authentication
  const user = await getCurrentUser();
  const isAuthenticated = user !== null;
  
  // Redirect to sign in if accessing protected route without auth
  if (isProtectedRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL('/signin', request.url));
  }
  
  // Redirect to feed if accessing auth route while authenticated
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/feed', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
```

### Protected Route Component

```typescript
// src/components/ProtectedRoute.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Spinner } from '@/components/ui/Spinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!loading && !user) {
      router.push('/signin');
    }
  }, [user, loading, router]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }
  
  if (!user) {
    return null;
  }
  
  return <>{children}</>;
}
```

### Protected Routes Map (MVP)

Auth სისტემამ ზუსტად უნდა იცოდეს, რომელი რაუტებია დაცული, რომ Middleware-მა და `ProtectedRoute`-მა ერთნაირად იმუშაოს.

MVP ვერსიაში დაცულია:

- `/feed`
- `/create`
- `/post/[id]`
- `/profile/[id]`
- `/settings`

ღია რჩება:

- `/` – Landing page
- `/signin`
- `/signup`

ეს სია აუცილებლად უნდა იყოს synch-ში:

- Navigation/პრიორიტეტების დოკუმენტთან (`PROJECT_PRIORITIES.md`)
- `middleware.ts` კონფიგურაციასთან
- ნებისმიერი `ProtectedRoute` კომპონენტის ლოგიკასთან.

---

## 👤 Profile Creation Strategy

MVP-ში პროფილის შექმნა უნდა იყოს **ავტომატური და სანდო**:

- როდესაც ახალი user იქმნება `auth.users` ცხრილში, ავტომატურად უნდა შეიქმნას ჩანაწერი `profiles` ცხრილში.

- რეკომენდებული გზაა **Postgres trigger + function** Supabase-ში (დეტალურად იქნება `docs/DATABASE.md` ფაილში):
  - Trigger: `AFTER INSERT ON auth.users`
  - ქმნის `profiles.id = auth.users.id` ჩანაწერს, default `username`-ით და ცარიელი `avatar`/`bio`-თი.

- Frontend / `signUp` ფუნქციამ **არ უნდა იყოს მთავარი წყარო** პროფილის შესაქმნელად.
  კლიენტის მხრიდან პროფილის შექმნა შეიძლება იყოს მხოლოდ fallback / დამატებითი დაცვა, მაგრამ ძირითადი ხმა ეკუთვნის **database trigger-ს**.

ასე თავიდან ავირიდებთ race condition-ებს და შემთხვევებს, როცა user არსებობს, მაგრამ პროფილი – არა.

ფაქტობრივად, ამით დოკში წერია: „პროფილი სერვერზე/DB-ში ემბედედ იქმნება, არა client კოდიდან".

---

## 📊 Database Schema

### Profiles Table

```sql
-- User profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
do $$
begin
  -- Users can view all profiles (public)
  CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);
  
  -- Users can update their own profile
  CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);
  
  -- Users can insert their own profile (on sign up)
  CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);
end $$;
```

> ℹ️ **შენიშვნა**
>
> პროფილის ავტომატური შექმნის trigger/function სრული SQL იმპლემენტაციით აღწერილი იქნება
>
> `docs/DATABASE.md` ფაილში და შესრულდება Supabase SQL Editor-იდან `do $$ ... end $$;` ბლოკით.

---

## 🔐 Security Considerations

1. **Password Requirements**
   - Minimum 8 characters
   - At least one uppercase letter
   - At least one lowercase letter
   - At least one number
   - At least one special character

2. **Email Validation**
   - Valid email format
   - Unique email (no duplicates)

3. **Session Security**
   - Secure cookie storage
   - Session expiration (configurable)
   - HTTPS only in production

4. **RLS Policies**
   - All database operations protected by RLS
   - Users can only modify their own data

---

## 🙈 Error Messages & UX

უსაფრთხოებისა და კარგი UX-ის გამო:

- Login შეცდომებზე **არ ვაკონკრეტებთ**, არსებობს თუ არა ელფოსტა ბაზაში.
  - ცუდი მაგალითი: „ამ ელფოსტით მომხმარებელი არ არსებობს"
  - კარგი მაგალითი: „ელფოსტა ან პაროლი არასწორია"

- Sign up-ზე, სადაც საჭიროა, შეგვიძლია ვაჩვენოთ სპეციფიკური მესიჯი („Email already exists"), მაგრამ მაინც არ ვამატებთ ზედმეტ ტექნიკურ დეტალებს.

- Network / უცნობ შეცდომებზე ვაჩვენებთ ნეიტრალურ შეტყობინებას („რაღაც შეცდომა მოხდა, სცადეთ თავიდან") და დეტალებს ვლოგავთ მხოლოდ console-ში ან monitoring სისტემაში.

- ეს წესები უნდა აისახოს `auth.errors` i18n სტრიქონებშიც, რომ ყველა ენაზე ერთნაირი policy გვქონდეს.

---

## 🌐 Internationalization (i18n)

### Translation Keys

Add to translation files (see `features/i18n-language-switcher.md`):

```json
{
  "auth": {
    "signUp": {
      "title": "Sign Up",
      "email": "Email",
      "password": "Password",
      "confirmPassword": "Confirm Password",
      "submit": "Create Account",
      "alreadyHaveAccount": "Already have an account?",
      "signInLink": "Sign In"
    },
    "signIn": {
      "title": "Sign In",
      "email": "Email",
      "password": "Password",
      "submit": "Sign In",
      "noAccount": "Don't have an account?",
      "signUpLink": "Sign Up"
    },
    "signOut": {
      "button": "Sign Out"
    },
    "errors": {
      "invalidEmail": "Invalid email address",
      "weakPassword": "Password is too weak",
      "passwordMismatch": "Passwords do not match",
      "emailExists": "Email already exists",
      "invalidCredentials": "Invalid email or password",
      "networkError": "Network error. Please try again."
    }
  }
}
```

**Georgian translations**:
```json
{
  "auth": {
    "signUp": {
      "title": "რეგისტრაცია",
      "email": "ელფოსტა",
      "password": "პაროლი",
      "confirmPassword": "დაადასტურეთ პაროლი",
      "submit": "ანგარიშის შექმნა",
      "alreadyHaveAccount": "უკვე გაქვთ ანგარიში?",
      "signInLink": "შესვლა"
    },
    "signIn": {
      "title": "შესვლა",
      "email": "ელფოსტა",
      "password": "პაროლი",
      "submit": "შესვლა",
      "noAccount": "არ გაქვთ ანგარიში?",
      "signUpLink": "რეგისტრაცია"
    },
    "errors": {
      "invalidEmail": "არასწორი ელფოსტის მისამართი",
      "weakPassword": "პაროლი ძალიან სუსტია",
      "passwordMismatch": "პაროლები არ ემთხვევა",
      "emailExists": "ეს ელფოსტა უკვე გამოყენებულია",
      "invalidCredentials": "ელფოსტა ან პაროლი არასწორია",
      "networkError": "რაღაც შეცდომა მოხდა, სცადეთ თავიდან"
    }
  }
}
```

---

## 📱 Related Pages

- **Sign Up Page**: See `docs/features/auth-pages.md` (to be created)
- **Sign In Page**: See `docs/features/auth-pages.md` (to be created)
- **Landing Page**: See `docs/features/landing-page.md` (to be created)

---

## ✅ Requirements Checklist

- [ ] Supabase Auth setup (Email/Password)
- [ ] Sign up function implemented
- [ ] Sign in function implemented
- [ ] Sign out function implemented
- [ ] Session management (server + client)
- [ ] Protected route middleware
- [ ] ProtectedRoute component
- [ ] User profile creation on sign up
- [ ] Password validation
- [ ] Email validation
- [ ] Error handling
- [ ] Loading states
- [ ] RLS policies for profiles table
- [ ] i18n translations
- [ ] Security best practices

---

## 🧪 Auth Testing Checklist (MVP)

Auth სისტემის „Done" სტატუსისთვის უნდა გაკეთდეს მინიმუმ ასეთი ხელით ტესტები:

1. ✅ ახალი მომხმარებლის რეგისტრაცია (valid email + strong password)

2. ✅ რეგისტრაციის შემდეგ ავტომატურად იქმნება პროფილი `profiles` ცხრილში (`id`, `email`, `username`)

3. ✅ არასწორი პაროლი → იძახება უსაფრთხო შეცდომის მესიჯი, session არ იქმნება

4. ✅ Sign out → მომხმარებელი აღარ ხედავს protected გვერდებს (`/feed`, `/create`, `/settings`…)

5. ✅ RLS: სხვა მომხმარებლის პროფილის ცვლილება (`UPDATE profiles SET ... WHERE id != auth.uid()`) ბრუნდება შეცდომით Supabase-ში

6. ✅ Middleware: არაუთენტიფიცირებული მომხმარებელი `/feed` ან `/create` → redirect `/signin`

7. ✅ აუთენტიფიცირებული მომხმარებელი `/signin` ან `/signup`-ზე რომ შევა → redirect `/feed`

ეს checklist უნდა გამოვიყენოთ როგორც Manual Smoke Test, სანამ Phase 1 ჩავთვლით დასრულებულად.

---

## 🔄 Future Enhancements

- **Magic Link Authentication**: Passwordless login via email
- **Social Auth**: Google, GitHub, etc. (optional)
- **Two-Factor Authentication (2FA)**: Enhanced security
- **Password Reset**: Forgot password functionality
- **Email Verification**: Verify email before account activation
- **Remember Me**: Persistent sessions
- **Session Management UI**: View active sessions, logout from all devices

---

## 📝 Notes

- **Phase 1 Priority**: Authentication is critical foundation for all other features
- **Supabase Auth**: Uses Supabase Auth for all authentication operations
- **Profile Creation**: User profile is automatically created on sign up
- **RLS Policies**: All database operations must follow RLS policies with `do $$ ... end $$;` block syntax
- **Security First**: Never expose sensitive data in client-side code
- **Error Handling**: All auth operations must have proper error handling and user-friendly messages

---

**Last Updated**: 2025-01-XX  
**Version**: 1.0  
**Status**: Phase 1 (Foundation) - Critical Priority

