# Deployment Preparation Guide - BranchFeed

ეს დოკუმენტაცია არის step-by-step guide production deployment-ისთვის მომზადებაში.

**Last Updated**: 2025-01-15

---

## 📋 Overview

ეს guide დაგეხმარებათ production deployment-ისთვის მომზადებაში. იგი მოიცავს:

1. **Pre-Deployment Verification** - Code quality, tests, build
2. **Environment Setup** - Environment variables configuration
3. **Supabase Production Setup** - Database, storage, migrations
4. **Vercel Deployment** - Step-by-step deployment process
5. **Post-Deployment Verification** - Testing and monitoring

---

## ✅ Step 1: Pre-Deployment Verification

### 1.1 Code Quality Checks

გაუშვით შემდეგი commands:

```bash
# TypeScript type checking
pnpm typecheck

# Linting
pnpm lint

# Build test
pnpm build
```

**Expected Results:**
- ✅ TypeScript: No errors
- ✅ Linting: No errors (warnings acceptable if documented)
- ✅ Build: Successful build with no errors

**If errors occur:**
- Fix TypeScript errors
- Fix linting errors
- Review build errors and fix

### 1.2 Manual Testing

**Test in Browser (localhost:3000):**

- [ ] Sign up flow works
- [ ] Sign in flow works
- [ ] Sign out works
- [ ] Feed page loads stories
- [ ] Story creation works (upload media, create branches)
- [ ] Story viewing works (play media, make choices)
- [ ] Like/Unlike works
- [ ] Comment creation works
- [ ] Share functionality works
- [ ] Profile page displays correctly
- [ ] Settings page works
- [ ] Admin dashboard works (if admin user)
- [ ] No console errors in browser DevTools

**Test Edge Cases:**
- [ ] Empty states display correctly
- [ ] Error states display correctly
- [ ] Loading states display correctly
- [ ] Responsive design works (mobile, tablet, desktop)

### 1.3 Git Status

```bash
# Check git status
git status

# Ensure all changes are committed
git add .
git commit -m "Pre-deployment: Final changes"

# Push to repository
git push origin main
```

**Verify:**
- [ ] All changes are committed
- [ ] No uncommitted files
- [ ] Code is pushed to repository
- [ ] `.env.local` is NOT committed (should be in `.gitignore`)

---

## 🔧 Step 2: Environment Variables Setup

### 2.1 Create Production Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click **New Project**
3. Fill in project details:
   - **Name**: `branchfeed-production` (or your preferred name)
   - **Database Password**: Strong password (save it!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Select appropriate plan
4. Click **Create new project**
5. Wait for project to be created (2-3 minutes)

### 2.2 Get Supabase Credentials

1. In Supabase Dashboard, go to **Settings** → **API**
2. Copy the following:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **service_role key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (⚠️ Keep secret!)

### 2.3 Prepare Environment Variables

Create a list of all environment variables you'll need in Vercel:

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

#### Optional Variables (Recommended for Production)

```bash
# Error Tracking (Sentry)
NEXT_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/project-id

# Analytics (Google Analytics)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

**Note**: See `env.example` for complete list.

---

## 🗄️ Step 3: Supabase Production Setup

### 3.1 Run Database Migrations

1. Go to Supabase Dashboard → **SQL Editor**
2. Open each migration file from `supabase/migrations/` in order:
   - `20250115_01_add_profile_creation_trigger.sql`
   - `20250115_02_add_storage_bucket_and_policies.sql`
   - `20250115_03_add_view_count_function.sql`
   - `20250115_04_add_avatars_bucket_and_policies.sql`
   - `20250115_05_add_story_stats_fields.sql`
   - `20250115_06_create_story_likes_table.sql`
   - `20250115_07_add_admin_system.sql`
   - `20250115_08_add_platform_settings.sql`
   - `20250115_09_add_description_to_content_reports.sql`
   - `20250115_10_verify_admin_functions.sql`
   - `20250115_11_add_user_ban_suspend.sql`
   - `20250115_12_add_banned_users_rls_policies.sql`
   - `20250115_13_add_comments_count_trigger.sql`
   - `20250115_14_add_total_story_views_function.sql`
   - `20250115_15_add_performance_indexes.sql`
   - `20250115_16_add_subscriptions_schema.sql`
3. Copy and paste each migration into SQL Editor
4. Click **Run** for each migration
5. Verify no errors occur

**Verification Queries:**

```sql
-- Check tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check functions exist
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
ORDER BY routine_name;

-- Check RLS policies
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;
```

### 3.2 Create Storage Buckets

1. Go to Supabase Dashboard → **Storage**
2. Create `stories` bucket:
   - Click **New bucket**
   - **Name**: `stories`
   - **Public bucket**: ✅ Yes (for public read access)
   - **File size limit**: 50 MB (or your preferred limit)
   - **Allowed MIME types**: `video/*,image/*`
   - Click **Create bucket**
3. Create `avatars` bucket:
   - Click **New bucket**
   - **Name**: `avatars`
   - **Public bucket**: ✅ Yes (for public read access)
   - **File size limit**: 5 MB (or your preferred limit)
   - **Allowed MIME types**: `image/*`
   - Click **Create bucket`

### 3.3 Verify Storage Policies

Storage policies should be created by migration `20250115_02_add_storage_bucket_and_policies.sql` and `20250115_04_add_avatars_bucket_and_policies.sql`.

**Verify:**
1. Go to **Storage** → **Policies**
2. Check that policies exist for both buckets:
   - Public read access
   - Authenticated upload access

### 3.4 Test Authentication

1. Go to Supabase Dashboard → **Authentication** → **Users**
2. Create a test user (or use sign up in your app)
3. Verify user is created
4. Test sign in/sign out in your app

---

## 🚀 Step 4: Vercel Deployment

### 4.1 Create Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub account (recommended)
3. Authorize Vercel to access your GitHub repositories

### 4.2 Import Project

1. In Vercel Dashboard, click **Add New Project**
2. Select your GitHub repository
3. Click **Import**

### 4.3 Configure Project

**Framework Preset:**
- ✅ Next.js (auto-detected)

**Build Settings:**
- **Root Directory**: `./` (default)
- **Build Command**: `pnpm build` (auto-detected)
- **Output Directory**: `.next` (auto-detected)
- **Install Command**: `pnpm install` (auto-detected)

**Environment Variables:**
- Click **Environment Variables**
- Add all variables from Step 2.3
- Select environments: **Production**, **Preview**, **Development**
- Click **Save** for each variable

**Important**: 
- Add variables one by one
- Double-check each value
- Ensure no typos in variable names

### 4.4 Deploy

1. Click **Deploy**
2. Wait for build to complete (2-5 minutes)
3. Monitor build logs for errors
4. If build succeeds, you'll see **Ready** status

**Build Logs to Check:**
- ✅ Build successful
- ✅ No TypeScript errors
- ✅ No build errors
- ⚠️ Warnings are acceptable (if documented)

### 4.5 Configure Custom Domain (Optional)

1. Go to **Settings** → **Domains**
2. Add your custom domain (e.g., `branchfeed.com`)
3. Follow DNS configuration instructions
4. Wait for DNS propagation (up to 48 hours)

---

## ✅ Step 5: Post-Deployment Verification

### 5.1 Basic Functionality Tests

**Test on Production URL:**

- [ ] Home page loads
- [ ] Sign up works
- [ ] Sign in works
- [ ] Sign out works
- [ ] Feed page loads stories
- [ ] Story creation works
- [ ] Story viewing works
- [ ] Branching navigation works
- [ ] Like/Unlike works
- [ ] Comment creation works
- [ ] Share functionality works
- [ ] Profile page works
- [ ] Settings page works
- [ ] Admin dashboard works (if admin user)

### 5.2 Error Checking

**Browser DevTools Console:**
- [ ] No JavaScript errors
- [ ] No network errors (404, 500, etc.)
- [ ] No CORS errors
- [ ] No authentication errors

**Network Tab:**
- [ ] API requests succeed
- [ ] Media files load correctly
- [ ] No failed requests

### 5.3 Performance Check

**Lighthouse Audit:**
1. Open production URL in Chrome
2. Open DevTools → **Lighthouse**
3. Run audit for:
   - Performance
   - Accessibility
   - Best Practices
   - SEO
4. Review scores and fix critical issues

**Expected Scores:**
- Performance: > 80
- Accessibility: > 90
- Best Practices: > 90
- SEO: > 80

### 5.4 Mobile Testing

**Test on Mobile Device:**
- [ ] Responsive design works
- [ ] Touch interactions work
- [ ] Media playback works
- [ ] Forms are usable
- [ ] Navigation is accessible

### 5.5 Cross-Browser Testing

**Test in Multiple Browsers:**
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

---

## 📊 Step 6: Monitoring Setup

### 6.1 Vercel Analytics

1. Go to Vercel Dashboard → **Analytics**
2. Enable Vercel Analytics (if not already enabled)
3. Monitor:
   - Page views
   - Performance metrics
   - Error rates

### 6.2 Error Tracking (Sentry)

**If using Sentry:**

1. Go to [sentry.io](https://sentry.io)
2. Create project (if not already created)
3. Get DSN from Sentry dashboard
4. Add `NEXT_PUBLIC_SENTRY_DSN` to Vercel environment variables
5. Redeploy application
6. Verify errors are being tracked

**See `docs/MONITORING_ANALYTICS_SETUP.md` for detailed setup.**

### 6.3 Google Analytics (Optional)

**If using Google Analytics:**

1. Go to [Google Analytics](https://analytics.google.com)
2. Create property (if not already created)
3. Get Measurement ID (e.g., `G-XXXXXXXXXX`)
4. Add `NEXT_PUBLIC_GA_ID` to Vercel environment variables
5. Redeploy application
6. Verify analytics are tracking

---

## 🔄 Step 7: Rollback Plan

### 7.1 If Deployment Fails

**Immediate Actions:**
1. Check Vercel build logs for errors
2. Fix errors in code
3. Commit and push fixes
4. Redeploy

### 7.2 If Production Issues Occur

**Rollback Steps:**
1. Go to Vercel Dashboard → **Deployments**
2. Find last working deployment
3. Click **⋯** → **Promote to Production**
4. Notify users (if needed):
   - Status page
   - Social media
   - Email (if applicable)

**See `docs/DEPLOYMENT.md` for detailed rollback plan.**

---

## 📝 Step 8: Documentation Update

### 8.1 Update Deployment Status

- [ ] Update `docs/PROJECT_STATUS.md` with deployment date
- [ ] Update `docs/PRODUCTION_DEPLOYMENT_CHECKLIST.md` with completed items
- [ ] Document any issues encountered and solutions

### 8.2 Update Environment Variables

- [ ] Document production environment variables (without values)
- [ ] Update `env.example` if new variables were added
- [ ] Document any environment-specific configurations

---

## 🎯 Quick Reference Checklist

### Pre-Deployment
- [ ] Code quality checks pass
- [ ] Manual testing completed
- [ ] Git status clean
- [ ] All changes committed and pushed

### Environment Setup
- [ ] Production Supabase project created
- [ ] Supabase credentials obtained
- [ ] Environment variables list prepared
- [ ] Stripe test keys obtained (if using)

### Supabase Setup
- [ ] All migrations run successfully
- [ ] Storage buckets created
- [ ] Storage policies verified
- [ ] Authentication tested

### Vercel Deployment
- [ ] Vercel account created
- [ ] Project imported
- [ ] Environment variables added
- [ ] Deployment successful

### Post-Deployment
- [ ] Basic functionality tested
- [ ] Error checking completed
- [ ] Performance checked
- [ ] Mobile testing completed
- [ ] Cross-browser testing completed

### Monitoring
- [ ] Vercel Analytics enabled
- [ ] Sentry configured (if using)
- [ ] Google Analytics configured (if using)

### Documentation
- [ ] Deployment status updated
- [ ] Environment variables documented
- [ ] Issues and solutions documented

---

## 🔗 Related Documentation

- **Production Deployment Checklist**: `docs/PRODUCTION_DEPLOYMENT_CHECKLIST.md` ⭐
- **Deployment Guide**: `docs/DEPLOYMENT.md`
- **Monitoring Setup**: `docs/MONITORING_ANALYTICS_SETUP.md`
- **Testing Checklist**: `docs/TESTING_QA_CHECKLIST.md`
- **Operations Playbook**: `docs/OPERATIONS_PLAYBOOK.md`

---

## ⚠️ Important Notes

1. **Stripe Test Mode**: All Stripe features are in TEST MODE. Do not enable production Stripe until ready.

2. **Environment Variables**: Never commit `.env.local` or production environment variables to Git.

3. **Database Migrations**: Always run migrations in order. Never skip migrations.

4. **Storage Buckets**: Ensure storage policies are correctly configured for security.

5. **RLS Policies**: Verify all RLS policies are enabled on all tables.

6. **Monitoring**: Set up monitoring before going live to catch issues early.

7. **Backup**: Ensure you have backups of production database before major changes.

---

## 🆘 Troubleshooting

### Build Fails

**Common Issues:**
- TypeScript errors → Fix type errors
- Missing environment variables → Add missing variables
- Build timeout → Optimize build process

### Deployment Fails

**Common Issues:**
- Environment variables missing → Add all required variables
- Database connection errors → Verify Supabase credentials
- Storage errors → Verify storage buckets and policies

### Production Issues

**Common Issues:**
- Authentication not working → Verify Supabase credentials
- Media not loading → Verify storage bucket policies
- API errors → Check server logs in Vercel

**See `docs/OPERATIONS_PLAYBOOK.md` for detailed troubleshooting.**

---

**Status**: Ready for Use

**Last Updated**: 2025-01-15

