# Deployment Guide

This guide covers deploying BranchFeed to production.

**Status**: ✅ **Ready for Deployment**  
**Last Updated**: 2025-01-15

> 📖 **For detailed production deployment instructions, see `docs/PRODUCTION_DEPLOYMENT.md`**  
> 📋 **For quick checklist, see `docs/DEPLOYMENT_CHECKLIST.md`**

---

## 📋 Pre-Deployment Checklist

### 1. Supabase Setup

- [ ] Create Supabase project (production)
- [ ] Run all migrations from `supabase/migrations/` in Supabase SQL Editor
- [ ] Create `stories` storage bucket (see `docs/STORAGE_SETUP_INSTRUCTIONS.md`)
- [ ] Configure storage policies (public read, authenticated upload)
- [ ] Verify RLS policies are enabled on all tables
- [ ] Test authentication flow (sign up, sign in, sign out)

### 2. Environment Variables

Required environment variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Where to find these:**
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings** → **API**
4. Copy **Project URL** and **anon/public key**

### 3. Code Quality

- [ ] All tests pass: `pnpm test`
- [ ] TypeScript checks pass: `pnpm typecheck`
- [ ] Linting passes: `pnpm lint`
- [ ] Build succeeds: `pnpm build`
- [ ] No console errors in browser

### 4. Database Migrations

Verify all migrations are applied:

- [ ] `20250115_01_add_profile_creation_trigger.sql` - Profile creation trigger
- [ ] `20250115_02_add_storage_bucket_and_policies.sql` - Storage setup
- [ ] `20250115_03_add_view_count_function.sql` - View count function

**How to verify:**
1. Go to Supabase Dashboard → **SQL Editor**
2. Run: `SELECT * FROM pg_migrations;` (if migration tracking table exists)
3. Or manually check:
   - Functions: `SELECT routine_name FROM information_schema.routines WHERE routine_schema = 'public';`
   - Tables: `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';`
   - Storage buckets: Check in **Storage** section

---

## 🚀 Deployment Options

### Option 1: Vercel (Recommended)

**Why Vercel:**
- Optimized for Next.js
- Automatic deployments on git push
- Preview deployments for PRs
- Built-in environment variable management
- Free tier available

**Steps:**

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click **Add New Project**
   - Import your GitHub repository
   - Select the repository

3. **Configure Project**
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (default)
   - **Build Command**: `pnpm build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)
   - **Install Command**: `pnpm install` (auto-detected)

4. **Add Environment Variables**
   - Go to **Settings** → **Environment Variables**
   - Add:
     - `NEXT_PUBLIC_SUPABASE_URL` = `https://your-project.supabase.co`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `your-anon-key-here`
   - Select **Production**, **Preview**, and **Development** environments

5. **Deploy**
   - Click **Deploy**
   - Wait for build to complete
   - Your app will be live at `https://your-project.vercel.app`

6. **Custom Domain (Optional)**
   - Go to **Settings** → **Domains**
   - Add your custom domain
   - Follow DNS configuration instructions

### Option 2: Other Platforms

#### Netlify

1. Connect GitHub repository
2. Build settings:
   - Build command: `pnpm build`
   - Publish directory: `.next`
3. Add environment variables
4. Deploy

#### Self-Hosted (Docker)

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN corepack enable pnpm && pnpm build

# Production image
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

---

## 🔍 Post-Deployment Verification

### 1. Smoke Tests

Test these critical flows:

- [ ] **Homepage loads**: Visit root URL
- [ ] **Sign up works**: Create a test account
- [ ] **Sign in works**: Sign in with test account
- [ ] **Feed loads**: Navigate to `/feed`
- [ ] **Story creation**: Create a test story
- [ ] **Story viewing**: View a story and make choices
- [ ] **Profile page**: View user profile

### 2. Database Verification

- [ ] New user profile created automatically (check `profiles` table)
- [ ] Story creation works (check `stories` and `story_nodes` tables)
- [ ] Media upload works (check Supabase Storage)
- [ ] Path tracking works (check `user_story_progress` table)

### 3. Performance Checks

- [ ] Page load times are acceptable (< 3s)
- [ ] Images load correctly
- [ ] No console errors
- [ ] Mobile responsive design works

---

## 🔧 Environment-Specific Configuration

### Development

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://dev-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=dev-anon-key
```

### Staging/Preview

Use separate Supabase project for staging:
- Allows testing without affecting production data
- Can reset database for testing
- Safe to test migrations

### Production

Use production Supabase project:
- Real user data
- Never reset database
- Production-grade security

---

## 🐛 Troubleshooting

### Build Fails

**Error**: `Module not found`
- **Solution**: Run `pnpm install` locally, commit `pnpm-lock.yaml`

**Error**: `TypeScript errors`
- **Solution**: Run `pnpm typecheck` locally, fix all errors

**Error**: `Environment variables missing`
- **Solution**: Add all required variables in Vercel dashboard

### Runtime Errors

**Error**: `Supabase client is null`
- **Solution**: Check environment variables are set correctly

**Error**: `Storage bucket not found`
- **Solution**: Create `stories` bucket in Supabase Storage

**Error**: `RLS policy violation`
- **Solution**: Verify RLS policies are enabled and correct

### Database Issues

**Error**: `Foreign key constraint violation`
- **Solution**: Ensure profile creation trigger is working

**Error**: `Function not found`
- **Solution**: Run migration `20250115_03_add_view_count_function.sql`

---

## 📊 Monitoring

### Recommended Tools

1. **Vercel Analytics** (built-in)
   - Page views
   - Performance metrics
   - Error tracking

2. **Supabase Dashboard**
   - Database performance
   - API usage
   - Storage usage

3. **Error Tracking** (Future)
   - Sentry
   - LogRocket
   - Bugsnag

---

## 🔄 Continuous Deployment

### Automatic Deployments

**Vercel** automatically deploys:
- **Production**: On push to `main` branch
- **Preview**: On push to any other branch or PR

### Manual Deployment

If needed, trigger manual deployment:
1. Go to Vercel dashboard
2. Select project
3. Click **Redeploy**

---

## 🔐 Security Checklist

- [ ] Environment variables are not exposed in client code
- [ ] RLS policies are enabled on all tables
- [ ] Storage policies restrict access appropriately
- [ ] No secrets in `NEXT_PUBLIC_*` variables
- [ ] HTTPS enabled (automatic on Vercel)
- [ ] CORS configured correctly (if needed)

---

## 📚 Related Documentation

- **Setup**: `docs/NEW_PROJECT_SETUP.md`
- **Operations**: `docs/OPERATIONS_PLAYBOOK.md`
- **Storage Setup**: `docs/STORAGE_SETUP_INSTRUCTIONS.md`
- **Migrations**: `supabase/migrations/README.md`

---

**Last Updated**: 2025-01-15

