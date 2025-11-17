# Vercel Deployment Execution Guide - BranchFeed

ეს დოკუმენტაცია არის step-by-step execution guide Vercel-ზე production deployment-ისთვის.

**Last Updated**: 2025-01-15

---

## 📋 Prerequisites

გადაამოწმეთ რომ:

- [ ] Code quality checks pass (`pnpm typecheck`, `pnpm lint`, `pnpm build`)
- [ ] All changes are committed and pushed to GitHub
- [ ] Production Supabase project is created
- [ ] All migrations are run in production Supabase
- [ ] Storage buckets are created (`stories`, `avatars`)
- [ ] Environment variables list is prepared

**See `docs/DEPLOYMENT_PREPARATION_GUIDE.md` for detailed preparation steps.**

---

## 🚀 Step-by-Step Deployment

### Step 1: Verify Pre-Deployment Checks

გაუშვით შემდეგი commands:

```bash
# Navigate to project directory
cd C:\Users\Pc\Projects\branch

# TypeScript check
pnpm typecheck

# Linting
pnpm lint

# Build test
pnpm build
```

**Expected Results:**
- ✅ TypeScript: No errors
- ✅ Linting: No errors (warnings acceptable)
- ✅ Build: Successful build

**If errors occur, fix them before proceeding.**

---

### Step 2: Commit and Push to GitHub

```bash
# Check git status
git status

# Add all changes (if any)
git add .

# Commit changes
git commit -m "Production deployment: Ready for Vercel"

# Push to GitHub
git push origin main
```

**Verify:**
- [ ] All changes are committed
- [ ] Code is pushed to GitHub
- [ ] `.env.local` is NOT committed (should be in `.gitignore`)

---

### Step 3: Create Vercel Account (if not exists)

1. Go to [vercel.com](https://vercel.com)
2. Click **Sign Up**
3. Choose **Continue with GitHub** (recommended)
4. Authorize Vercel to access your GitHub account
5. Complete account setup

---

### Step 4: Import Project to Vercel

1. In Vercel Dashboard, click **Add New Project**
2. You'll see your GitHub repositories
3. Find and click **Import** next to your `branch` repository
4. Click **Import** to proceed

---

### Step 5: Configure Project Settings

Vercel should auto-detect Next.js. Verify these settings:

**Framework Preset:**
- ✅ **Next.js** (auto-detected)

**Build Settings:**
- **Root Directory**: `./` (default - leave as is)
- **Build Command**: `pnpm build` (auto-detected - verify)
- **Output Directory**: `.next` (auto-detected - verify)
- **Install Command**: `pnpm install` (auto-detected - verify)

**Node.js Version:**
- **Node.js Version**: `18.x` or `20.x` (auto-selected)

**Important**: Don't click **Deploy** yet! We need to add environment variables first.

---

### Step 6: Add Environment Variables

**Before deploying, add all required environment variables:**

1. In the project configuration page, scroll to **Environment Variables** section
2. Click **Add** for each variable below

#### Required Variables (Production)

Add these one by one:

1. **NEXT_PUBLIC_APP_URL**
   - **Value**: `https://your-domain.vercel.app` (or your custom domain)
   - **Environments**: ✅ Production, ✅ Preview, ✅ Development

2. **NEXT_PUBLIC_SUPABASE_URL**
   - **Value**: Your production Supabase project URL (e.g., `https://xxxxx.supabase.co`)
   - **Environments**: ✅ Production, ✅ Preview, ✅ Development

3. **NEXT_PUBLIC_SUPABASE_ANON_KEY**
   - **Value**: Your production Supabase anon key
   - **Environments**: ✅ Production, ✅ Preview, ✅ Development

4. **SUPABASE_SERVICE_ROLE**
   - **Value**: Your production Supabase service role key (⚠️ Keep secret!)
   - **Environments**: ✅ Production, ✅ Preview, ✅ Development
   - **Note**: This is server-side only, never expose to client

5. **NEXT_PUBLIC_MAX_COMMENT_LENGTH**
   - **Value**: `500` (or your preferred value)
   - **Environments**: ✅ Production, ✅ Preview, ✅ Development

#### Stripe Variables (Test Mode - Phase 0)

**IMPORTANT**: All Stripe features are in TEST MODE. Do not enable production Stripe until ready.

6. **STRIPE_SECRET_KEY_TEST**
   - **Value**: Your Stripe test secret key (starts with `sk_test_`)
   - **Environments**: ✅ Production, ✅ Preview, ✅ Development

7. **STRIPE_PUBLISHABLE_KEY_TEST**
   - **Value**: Your Stripe test publishable key (starts with `pk_test_`)
   - **Environments**: ✅ Production, ✅ Preview, ✅ Development

8. **STRIPE_PRICE_ID_SUPPORTER**
   - **Value**: Your Stripe test price ID for Supporter tier (starts with `price_`)
   - **Environments**: ✅ Production, ✅ Preview, ✅ Development

9. **STRIPE_PRICE_ID_PRO**
   - **Value**: Your Stripe test price ID for Pro tier (starts with `price_`)
   - **Environments**: ✅ Production, ✅ Preview, ✅ Development

10. **STRIPE_PRICE_ID_VIP**
    - **Value**: Your Stripe test price ID for VIP tier (starts with `price_`)
    - **Environments**: ✅ Production, ✅ Preview, ✅ Development

11. **STRIPE_WEBHOOK_SECRET_TEST**
    - **Value**: Your Stripe test webhook secret (starts with `whsec_`)
    - **Environments**: ✅ Production, ✅ Preview, ✅ Development
    - **Note**: You'll get this after configuring webhook endpoint

#### Optional Variables (Recommended for Production)

12. **NEXT_PUBLIC_SENTRY_DSN** (if using Sentry)
    - **Value**: Your Sentry DSN (e.g., `https://xxxxx@sentry.io/xxxxx`)
    - **Environments**: ✅ Production, ✅ Preview, ✅ Development

13. **NEXT_PUBLIC_GA_ID** (if using Google Analytics)
    - **Value**: Your Google Analytics Measurement ID (e.g., `G-XXXXXXXXXX`)
    - **Environments**: ✅ Production, ✅ Preview, ✅ Development

**After adding all variables:**
- [ ] Double-check each variable name (no typos)
- [ ] Double-check each variable value
- [ ] Verify correct environments are selected
- [ ] All required variables are added

---

### Step 7: Deploy to Vercel

1. Scroll to bottom of configuration page
2. Click **Deploy** button
3. Wait for build to complete (2-5 minutes)

**Monitor Build Logs:**
- Watch for TypeScript errors
- Watch for build errors
- Watch for environment variable errors
- ⚠️ Warnings are acceptable (if documented)

**Build Success Indicators:**
- ✅ "Build Completed" message
- ✅ "Ready" status
- ✅ Deployment URL is available

**If Build Fails:**
- Check build logs for errors
- Fix errors in code
- Commit and push fixes
- Redeploy

---

### Step 8: Verify Deployment

After successful deployment:

1. **Get Deployment URL**
   - Vercel will show: `https://your-project.vercel.app`
   - Click the URL to open in browser

2. **Basic Functionality Test**
   - [ ] Home page loads
   - [ ] Sign up works
   - [ ] Sign in works
   - [ ] Feed page loads
   - [ ] Story creation works
   - [ ] Story viewing works
   - [ ] No console errors

3. **Check Browser Console**
   - Open DevTools (F12)
   - Check Console tab for errors
   - Check Network tab for failed requests

---

### Step 9: Configure Stripe Webhook (if using Stripe)

**After deployment, configure Stripe webhook:**

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/test/webhooks)
2. Click **Add endpoint**
3. **Endpoint URL**: `https://your-project.vercel.app/api/stripe/webhook`
4. **Events to send**: Select:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click **Add endpoint**
6. Copy **Signing secret** (starts with `whsec_`)
7. Go back to Vercel → **Settings** → **Environment Variables**
8. Update `STRIPE_WEBHOOK_SECRET_TEST` with the new webhook secret
9. Redeploy (or wait for next deployment)

---

### Step 10: Configure Custom Domain (Optional)

1. In Vercel Dashboard, go to **Settings** → **Domains**
2. Click **Add Domain**
3. Enter your domain (e.g., `branchfeed.com`)
4. Follow DNS configuration instructions:
   - Add CNAME record pointing to Vercel
   - Or add A record (if using apex domain)
5. Wait for DNS propagation (up to 48 hours)
6. Vercel will automatically configure SSL certificate

---

### Step 11: Post-Deployment Verification

**Comprehensive Testing:**

1. **Authentication**
   - [ ] Sign up new user
   - [ ] Sign in existing user
   - [ ] Sign out
   - [ ] Session persists on page refresh

2. **Story Features**
   - [ ] Create new story
   - [ ] Upload media (image/video)
   - [ ] Create branches
   - [ ] Publish story
   - [ ] View story
   - [ ] Make choices (A/B)
   - [ ] Navigate through branches

3. **Interactions**
   - [ ] Like/Unlike story
   - [ ] Add comment
   - [ ] Share story
   - [ ] View profile
   - [ ] Edit profile (settings)

4. **Admin Features** (if admin user)
   - [ ] Access admin dashboard
   - [ ] View users
   - [ ] View moderation queue
   - [ ] View analytics

5. **Performance**
   - [ ] Page load times are acceptable
   - [ ] Media loads correctly
   - [ ] No slow queries

6. **Mobile Testing**
   - [ ] Test on mobile device
   - [ ] Responsive design works
   - [ ] Touch interactions work

---

### Step 12: Set Up Monitoring

**Vercel Analytics:**
1. Go to Vercel Dashboard → **Analytics**
2. Enable Vercel Analytics (if not already enabled)
3. Monitor page views and performance

**Sentry (if configured):**
1. Verify errors are being tracked
2. Set up alerts for critical errors

**Google Analytics (if configured):**
1. Verify tracking is working
2. Check real-time reports

**See `docs/MONITORING_ANALYTICS_SETUP.md` for detailed setup.**

---

## 🔄 Automatic Deployments

After initial deployment, Vercel will automatically deploy:

- **On push to `main` branch** → Production deployment
- **On push to other branches** → Preview deployment
- **On Pull Request** → Preview deployment

**To trigger new deployment:**
```bash
git add .
git commit -m "Your changes"
git push origin main
```

Vercel will automatically:
1. Detect the push
2. Start new build
3. Deploy when build completes

---

## 🚨 Troubleshooting

### Build Fails

**Common Issues:**

1. **TypeScript Errors**
   - Fix TypeScript errors locally
   - Commit and push fixes
   - Redeploy

2. **Missing Environment Variables**
   - Check Vercel Dashboard → **Settings** → **Environment Variables**
   - Add missing variables
   - Redeploy

3. **Build Timeout**
   - Optimize build process
   - Check for large dependencies
   - Contact Vercel support if needed

### Deployment Fails

**Common Issues:**

1. **Database Connection Errors**
   - Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
   - Verify `NEXT_PUBLIC_SUPABASE_ANON_KEY` is correct
   - Check Supabase project is active

2. **Storage Errors**
   - Verify storage buckets exist
   - Verify storage policies are configured
   - Check bucket names match code

3. **Authentication Errors**
   - Verify Supabase Auth is enabled
   - Check RLS policies are correct
   - Verify service role key is set

### Production Issues

**Common Issues:**

1. **404 Errors**
   - Check routes are correct
   - Verify file structure matches routes
   - Check middleware configuration

2. **500 Errors**
   - Check Vercel function logs
   - Check Supabase logs
   - Review error messages

3. **Media Not Loading**
   - Verify storage bucket policies
   - Check media URLs are correct
   - Verify CORS settings

**See `docs/OPERATIONS_PLAYBOOK.md` for detailed troubleshooting.**

---

## 📊 Deployment Checklist

### Pre-Deployment
- [ ] Code quality checks pass
- [ ] All changes committed and pushed
- [ ] Production Supabase project ready
- [ ] All migrations run
- [ ] Storage buckets created

### Vercel Setup
- [ ] Vercel account created
- [ ] Project imported
- [ ] Build settings verified
- [ ] All environment variables added
- [ ] Variable values verified

### Deployment
- [ ] Initial deployment successful
- [ ] Build logs show no errors
- [ ] Deployment URL accessible

### Post-Deployment
- [ ] Basic functionality tested
- [ ] Authentication works
- [ ] Story features work
- [ ] No console errors
- [ ] Mobile testing completed

### Monitoring
- [ ] Vercel Analytics enabled
- [ ] Sentry configured (if using)
- [ ] Google Analytics configured (if using)
- [ ] Alerts set up

---

## 🔗 Related Documentation

- **Deployment Preparation Guide**: `docs/DEPLOYMENT_PREPARATION_GUIDE.md` ⭐
- **Production Deployment Checklist**: `docs/PRODUCTION_DEPLOYMENT_CHECKLIST.md` ⭐
- **Deployment Guide**: `docs/DEPLOYMENT.md`
- **Monitoring Setup**: `docs/MONITORING_ANALYTICS_SETUP.md`
- **Operations Playbook**: `docs/OPERATIONS_PLAYBOOK.md`

---

## ⚠️ Important Notes

1. **Never commit `.env.local`** - It's in `.gitignore` for a reason
2. **Stripe Test Mode** - All Stripe features are in TEST MODE until explicitly enabled
3. **Environment Variables** - Double-check all variable names and values
4. **Database Migrations** - Always run migrations in production Supabase before deployment
5. **Storage Buckets** - Ensure buckets and policies are configured correctly
6. **Monitoring** - Set up monitoring before going live
7. **Backup** - Ensure you have backups of production database

---

## 🎯 Quick Reference

**Deployment URL Format:**
- Production: `https://your-project.vercel.app`
- Preview: `https://your-project-git-branch-username.vercel.app`

**Vercel Dashboard:**
- [vercel.com/dashboard](https://vercel.com/dashboard)

**Supabase Dashboard:**
- [app.supabase.com](https://app.supabase.com)

**Stripe Dashboard:**
- [dashboard.stripe.com](https://dashboard.stripe.com)

---

**Status**: Ready for Execution

**Last Updated**: 2025-01-15

