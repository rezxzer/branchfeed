# Development Setup Guide - BranchFeed

ეს დოკუმენტაცია აღწერს როგორ დავაყენოთ BranchFeed development environment-ი local machine-ზე.

**Last Updated**: 2025-01-15

---

## 📋 Prerequisites

### Required Software

1. **Node.js** 18.0.0 ან უფრო მაღალი
   - Download: [nodejs.org](https://nodejs.org/)
   - Verify: `node --version` (should show v18+)

2. **pnpm** (recommended) ან **npm**
   - Install pnpm: `npm install -g pnpm`
   - Verify: `pnpm --version`
   - Alternative: npm (comes with Node.js)

3. **Git**
   - Download: [git-scm.com](https://git-scm.com/)
   - Verify: `git --version`

4. **Supabase Account** (free tier available)
   - Sign up: [supabase.com](https://supabase.com)
   - Create a new project

5. **Code Editor** (optional but recommended)
   - VS Code with extensions:
     - ESLint
     - Prettier
     - TypeScript
     - Tailwind CSS IntelliSense

---

## 🚀 Installation Steps

### Step 1: Clone Repository

```bash
git clone <repository-url>
cd branch
```

### Step 2: Install Dependencies

```bash
pnpm install
```

**Note**: თუ pnpm არ გაქვს დაყენებული:
```bash
npm install -g pnpm
pnpm install
```

ან გამოიყენე npm:
```bash
npm install
```

### Step 3: Create Environment File

Create `.env.local` file in project root:

```bash
# Windows
copy .env.example .env.local

# macOS/Linux
cp .env.example .env.local
```

### Step 4: Configure Supabase

#### 4.1. Create Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click **New Project**
3. Fill in:
   - **Name**: BranchFeed (or any name)
   - **Database Password**: (save this password!)
   - **Region**: Choose closest region
4. Click **Create new project**
5. Wait for project to be created (2-3 minutes)

#### 4.2. Get Supabase Credentials

1. In Supabase Dashboard, go to **Settings** → **API**
2. Copy:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

#### 4.3. Update `.env.local`

Open `.env.local` and add your Supabase credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Example**:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 5: Setup Database

#### 5.1. Run Migrations

1. Go to Supabase Dashboard → **SQL Editor**
2. Open each migration file from `supabase/migrations/` in order:
   - `20250115_01_add_profile_creation_trigger.sql`
   - `20250115_02_add_storage_bucket_and_policies.sql`
   - `20250115_03_add_view_count_function.sql`
   - `20250115_04_add_avatars_bucket_and_policies.sql`
3. Copy and paste each migration into SQL Editor
4. Click **Run** (or press `Ctrl+Enter`)
5. Verify success message appears

**Important**: Run migrations in order (by date and sequence number).

#### 5.2. Verify Database Setup

Run this query in SQL Editor to verify tables exist:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

Expected tables:
- `profiles`
- `stories`
- `story_nodes`
- `user_story_progress`
- `likes`
- `comments`

### Step 6: Setup Storage Buckets

#### 6.1. Create `stories` Bucket

1. Go to Supabase Dashboard → **Storage**
2. Click **New bucket**
3. Fill in:
   - **Name**: `stories` (exactly this name, lowercase)
   - **Public bucket**: ✅ **YES** (check this!)
   - **File size limit**: 10 MB (recommended)
   - **Allowed MIME types**: `image/*,video/*` (optional)
4. Click **Create bucket**

#### 6.2. Create `avatars` Bucket

1. Click **New bucket** again
2. Fill in:
   - **Name**: `avatars` (exactly this name, lowercase)
   - **Public bucket**: ✅ **YES** (check this!)
   - **File size limit**: 5 MB (recommended)
   - **Allowed MIME types**: `image/*` (optional)
3. Click **Create bucket**

**Note**: Storage policies are already created by migration `20250115_02_add_storage_bucket_and_policies.sql` and `20250115_04_add_avatars_bucket_and_policies.sql`. You only need to create the buckets manually.

See `docs/STORAGE_SETUP_INSTRUCTIONS.md` for detailed instructions.

### Step 7: Start Development Server

```bash
pnpm dev
```

Server should start on [http://localhost:3000](http://localhost:3000)

**First time setup may take 1-2 minutes** (Next.js compiles on first run).

---

## ✅ Verification

### 1. Check Server is Running

- Open [http://localhost:3000](http://localhost:3000)
- You should see the landing page

### 2. Test Authentication

1. Click **Sign Up** button
2. Create a test account:
   - Email: `test@example.com`
   - Password: `password123` (or any password 8+ characters)
3. Click **Sign Up**
4. You should be redirected to `/feed` page

**Note**: If email confirmation is enabled in Supabase, check your email for confirmation link.

### 3. Test Story Creation

1. Navigate to `/create` (should be accessible if logged in)
2. Fill in story form:
   - Title: "Test Story"
   - Upload an image or video
3. Click **Next** → **Next** → **Publish**
4. You should be redirected to the story detail page

### 4. Check Browser Console

- Open browser DevTools (F12)
- Check **Console** tab for errors
- Should see no errors (warnings are OK)

### 5. Check Terminal

- Check terminal where `pnpm dev` is running
- Should see no errors
- Should see compilation success messages

---

## 🛠️ Development Commands

### Start Development Server

```bash
pnpm dev
```

Starts Next.js development server on `http://localhost:3000`

### Type Checking

```bash
pnpm typecheck
```

Runs TypeScript compiler to check for type errors.

### Linting

```bash
pnpm lint
```

Runs ESLint to check code quality.

### Build for Production

```bash
pnpm build
```

Creates optimized production build in `.next/` directory.

### Run Tests

```bash
# Unit/Component tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage report
pnpm test:coverage

# E2E tests (requires Playwright setup)
pnpm test:e2e
```

### Install Playwright Browsers (for E2E tests)

```bash
npx playwright install
```

---

## 🔧 Common Issues & Solutions

### Issue 1: "Module not found" errors

**Solution**:
```bash
# Delete node_modules and reinstall
rm -rf node_modules
pnpm install
```

Windows:
```powershell
Remove-Item -Recurse -Force node_modules
pnpm install
```

### Issue 2: Port 3000 already in use

**Solution**:
```bash
# Use different port
pnpm dev -- -p 3001
```

Or kill process using port 3000:
```bash
# Find process
lsof -ti:3000

# Kill process (replace PID with actual process ID)
kill -9 <PID>
```

Windows:
```powershell
# Find and kill process
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Issue 3: Supabase connection errors

**Symptoms**: 
- "Failed to fetch" errors
- Authentication not working

**Solutions**:
1. Check `.env.local` file exists and has correct values
2. Verify Supabase project is active (not paused)
3. Check Supabase Dashboard → **Settings** → **API** for correct URL and key
4. Restart dev server after changing `.env.local`

### Issue 4: Database errors (tables not found)

**Symptoms**:
- "relation does not exist" errors
- "table not found" errors

**Solutions**:
1. Verify migrations were run successfully
2. Check Supabase Dashboard → **SQL Editor** → Run verification query:
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public';
   ```
3. Re-run migrations if tables are missing

### Issue 5: Storage upload errors

**Symptoms**:
- "Bucket not found" errors
- "Permission denied" errors

**Solutions**:
1. Verify storage buckets exist:
   - Go to Supabase Dashboard → **Storage**
   - Check `stories` and `avatars` buckets exist
2. Verify buckets are **Public**:
   - Click on bucket → **Settings** → **Public bucket** should be checked
3. Verify storage policies exist:
   - Go to Supabase Dashboard → **Storage** → **Policies**
   - Should see policies for `stories` and `avatars` buckets

### Issue 6: TypeScript errors

**Symptoms**:
- Red squiggly lines in editor
- Type errors in terminal

**Solutions**:
1. Restart TypeScript server in VS Code:
   - Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
   - Type "TypeScript: Restart TS Server"
2. Check `tsconfig.json` is correct
3. Run `pnpm typecheck` to see all errors
4. Fix errors one by one

### Issue 7: Build errors

**Symptoms**:
- `pnpm build` fails
- Production build errors

**Solutions**:
1. Check for TypeScript errors: `pnpm typecheck`
2. Check for linting errors: `pnpm lint`
3. Clear Next.js cache:
   ```bash
   rm -rf .next
   pnpm build
   ```
4. Check for missing environment variables

### Issue 8: Authentication redirect loop

**Symptoms**:
- Page keeps redirecting to `/signin`
- Cannot access protected routes

**Solutions**:
1. Clear browser cookies for `localhost:3000`
2. Check Supabase project is not paused
3. Verify `.env.local` has correct Supabase credentials
4. Check browser console for errors
5. Restart dev server

---

## 📁 Project Structure Overview

```
branch/
├── src/
│   ├── app/              # Next.js pages (routes)
│   ├── components/       # React components
│   ├── lib/              # Utilities and helpers
│   ├── hooks/            # Custom React hooks
│   └── types/            # TypeScript types
├── supabase/
│   └── migrations/       # Database migrations
├── e2e/                  # E2E tests
├── docs/                 # Documentation
└── .env.local            # Environment variables (not in git)
```

See `docs/ARCHITECTURE.md` for detailed architecture documentation.

---

## 🔐 Environment Variables

### Required Variables

| Variable | Description | Where to Find |
|----------|-------------|---------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Supabase Dashboard → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Supabase Dashboard → Settings → API → anon/public key |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Development server port | `3000` |
| `NODE_ENV` | Environment mode | `development` |

**Note**: All `NEXT_PUBLIC_*` variables are exposed to the browser. Never put secrets in these variables.

---

## 🧪 Testing Setup

### Unit/Component Tests (Jest)

Tests are located in `src/**/__tests__/` directories.

**Run tests**:
```bash
pnpm test
```

**Watch mode**:
```bash
pnpm test:watch
```

**Coverage**:
```bash
pnpm test:coverage
```

### E2E Tests (Playwright)

Tests are located in `e2e/` directory.

**First time setup**:
```bash
npx playwright install
```

**Run E2E tests**:
```bash
pnpm test:e2e
```

**Interactive UI mode**:
```bash
pnpm test:e2e:ui
```

**Headed mode** (see browser):
```bash
pnpm test:e2e:headed
```

See `docs/TESTING.md` for detailed testing documentation.

---

## 📚 Next Steps

After setup is complete:

1. **Read Documentation**:
   - `docs/PROJECT_OVERVIEW.md` - Project concept and vision
   - `docs/ARCHITECTURE.md` - System architecture
   - `docs/PROJECT_PRIORITIES.md` - Feature priorities

2. **Explore Codebase**:
   - Start with `src/app/page.tsx` (landing page)
   - Check `src/components/` for reusable components
   - Review `src/lib/` for utility functions

3. **Run the App**:
   - Sign up for an account
   - Create a test story
   - Explore the feed

4. **Make Your First Change**:
   - Pick a small feature to modify
   - Make changes
   - Test locally
   - Check tests still pass

---

## 🆘 Getting Help

### Documentation

- **Architecture**: `docs/ARCHITECTURE.md`
- **Features**: `docs/features/` directory
- **Deployment**: `docs/DEPLOYMENT.md`
- **Testing**: `docs/TESTING.md`

### Common Resources

- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Tailwind CSS Docs**: [tailwindcss.com/docs](https://tailwindcss.com/docs)
- **TypeScript Docs**: [typescriptlang.org/docs](https://www.typescriptlang.org/docs)

### Debugging Tips

1. **Check Browser Console**: Open DevTools (F12) → Console tab
2. **Check Terminal**: Look for errors in `pnpm dev` output
3. **Check Supabase Dashboard**: Verify database and storage setup
4. **Check Network Tab**: See API requests and responses
5. **Use TypeScript**: Fix type errors first, they often reveal logic errors

---

## ✅ Setup Checklist

Use this checklist to verify your setup:

- [ ] Node.js 18+ installed
- [ ] pnpm (or npm) installed
- [ ] Repository cloned
- [ ] Dependencies installed (`pnpm install`)
- [ ] `.env.local` file created
- [ ] Supabase project created
- [ ] Supabase credentials added to `.env.local`
- [ ] Database migrations run (all 4 migrations)
- [ ] Storage buckets created (`stories` and `avatars`)
- [ ] Dev server starts (`pnpm dev`)
- [ ] Landing page loads (http://localhost:3000)
- [ ] Can sign up for account
- [ ] Can sign in
- [ ] Can access `/feed` page
- [ ] Can create a story
- [ ] No errors in browser console
- [ ] No errors in terminal

---

**Last Updated**: 2025-01-15  
**Status**: ✅ Complete - Ready for development

