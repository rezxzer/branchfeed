# Deployment Guide

> Updates (2025-01):
>
> - Rollback Plan: Include "Notify Users" step during downtime (status page, banner, Slack/Twitter).
> - Environment Variables: Add "Secrets Rotation Policy" (e.g., quarterly rotation; rotate on incident; document owners).

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

#### Required Variables (Production)

```bash
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE=your-service-role-key-here
NEXT_PUBLIC_MAX_COMMENT_LENGTH=500
```

#### Stripe Variables (Test Mode - Phase 0)

**IMPORTANT**: All Stripe features are in TEST MODE. Do not enable production Stripe until ready.

```bash
STRIPE_SECRET_KEY_TEST=sk_test_...
STRIPE_PUBLISHABLE_KEY_TEST=pk_test_...
STRIPE_PRICE_ID_SUPPORTER=price_...
STRIPE_PRICE_ID_PRO=price_...
STRIPE_PRICE_ID_VIP=price_...
STRIPE_WEBHOOK_SECRET_TEST=whsec_...
```

**Where to find Supabase credentials:**
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings** → **API**
4. Copy **Project URL** and **anon/public key**
5. Copy **service_role key** (server-side only, keep secret!)

**See `docs/PRODUCTION_DEPLOYMENT_CHECKLIST.md` for complete environment variables checklist.**

### 3. Code Quality

- [ ] All tests pass: `pnpm test`
- [ ] TypeScript checks pass: `pnpm typecheck`
- [ ] Linting passes: `pnpm lint`
- [ ] Build succeeds: `pnpm build`
- [ ] No console errors in browser

### 4. Database Migrations

Verify all migrations are applied (in order):

- [ ] `20250115_01_add_profile_creation_trigger.sql` - Profile creation trigger
- [ ] `20250115_02_add_storage_bucket_and_policies.sql` - Stories storage bucket setup
- [ ] `20250115_03_add_view_count_function.sql` - View count function
- [ ] `20250115_04_add_avatars_bucket_and_policies.sql` - Avatars storage bucket setup
- [ ] `20250115_05_add_story_stats_fields.sql` - Story statistics fields
- [ ] `20250115_06_create_story_likes_table.sql` - Story likes table
- [ ] `20250115_07_add_admin_system.sql` - Admin system (roles, permissions)
- [ ] `20250115_08_add_platform_settings.sql` - Platform settings table
- [ ] `20250115_09_add_description_to_content_reports.sql` - Content reports enhancement
- [ ] `20250115_10_verify_admin_functions.sql` - Admin functions verification
- [ ] `20250115_11_add_user_ban_suspend.sql` - User ban/suspend functionality
- [ ] `20250115_12_add_banned_users_rls_policies.sql` - Banned users RLS policies
- [ ] `20250115_13_add_comments_count_trigger.sql` - Comments count trigger
- [ ] `20250115_14_add_total_story_views_function.sql` - Total story views function
- [ ] `20250115_15_add_performance_indexes.sql` - Performance indexes
- [ ] `20250115_16_add_subscriptions_schema.sql` - Subscription schema (Phase 0 - Monetization)

**How to verify:**
1. Go to Supabase Dashboard → **SQL Editor**
2. Run: `SELECT routine_name FROM information_schema.routines WHERE routine_schema = 'public';` (check functions)
3. Run: `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';` (check tables)
4. Check Storage section for buckets (`stories`, `avatars`)
5. See `supabase/migrations/README.md` for detailed migration information

**See `docs/PRODUCTION_DEPLOYMENT_CHECKLIST.md` for complete deployment checklist.**  
**See `docs/DEPLOYMENT_PREPARATION_GUIDE.md` for step-by-step deployment preparation guide.**

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

- **Production Deployment Checklist**: `docs/PRODUCTION_DEPLOYMENT_CHECKLIST.md` ⭐ **Use this for production deployment**
- **Setup**: `docs/NEW_PROJECT_SETUP.md`
- **Operations**: `docs/OPERATIONS_PLAYBOOK.md`
- **Storage Setup**: `docs/STORAGE_SETUP_INSTRUCTIONS.md`
- **Migrations**: `supabase/migrations/README.md`
- **Performance Monitoring**: `docs/PERFORMANCE_MONITORING.md`

---

**Last Updated**: 2025-01-15

