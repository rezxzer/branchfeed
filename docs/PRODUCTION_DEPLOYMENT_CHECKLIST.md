# Production Deployment Checklist - BranchFeed

ეს დოკუმენტაცია არის comprehensive checklist production deployment-ისთვის.

**Last Updated**: 2025-01-15

---

## 📋 Pre-Deployment Checklist

### 1. Code Quality ✅

- [x] TypeScript checks pass: `pnpm typecheck`
- [x] Linting passes: `pnpm lint`
- [x] Build succeeds: `pnpm build`
- [x] All tests pass: `pnpm test` (if applicable)
- [ ] No console errors in browser (manual testing)
- [ ] No TypeScript errors in production build
- [ ] No linting warnings (or acceptable warnings documented)

### 2. Environment Variables Review

#### Required Variables (Production)

- [ ] `NEXT_PUBLIC_APP_URL` - Production app URL (e.g., `https://branchfeed.com`)
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Production Supabase project URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Production Supabase anonymous key
- [ ] `SUPABASE_SERVICE_ROLE` - Production Supabase service role key (server-side only)
- [ ] `NEXT_PUBLIC_MAX_COMMENT_LENGTH` - Max comment length (default: 500)

#### Stripe Variables (Test Mode - Phase 0)

**IMPORTANT**: All Stripe features are in TEST MODE. Do not enable production Stripe until ready.

- [ ] `STRIPE_SECRET_KEY_TEST` - Stripe test secret key
- [ ] `STRIPE_PUBLISHABLE_KEY_TEST` - Stripe test publishable key
- [ ] `STRIPE_PRICE_ID_SUPPORTER` - Stripe test price ID for Supporter tier
- [ ] `STRIPE_PRICE_ID_PRO` - Stripe test price ID for Pro tier
- [ ] `STRIPE_PRICE_ID_VIP` - Stripe test price ID for VIP tier
- [ ] `STRIPE_WEBHOOK_SECRET_TEST` - Stripe test webhook secret

#### Stripe Variables (Production - DO NOT ENABLE YET)

- [ ] `STRIPE_SECRET_KEY_LIVE` - **DO NOT SET** until ready for live payments
- [ ] `STRIPE_PUBLISHABLE_KEY_LIVE` - **DO NOT SET** until ready for live payments
- [ ] `STRIPE_WEBHOOK_SECRET_LIVE` - **DO NOT SET** until ready for live payments

**Note**: Production Stripe keys should only be enabled after:
1. All features are tested thoroughly
2. Payment flows are verified
3. Webhook endpoints are configured
4. Security review is completed
5. Legal/compliance review (if applicable)

### 3. Supabase Production Setup

- [ ] Create production Supabase project
- [ ] Run all migrations from `supabase/migrations/` in production Supabase SQL Editor
- [ ] Verify all tables exist:
  - [ ] `profiles`
  - [ ] `stories`
  - [ ] `story_nodes`
  - [ ] `user_story_progress`
  - [ ] `story_likes`
  - [ ] `comments`
  - [ ] `user_subscriptions` (Phase 0 - Monetization)
  - [ ] `payment_history` (Phase 0 - Monetization)
- [ ] Verify all RLS policies are enabled
- [ ] Verify all indexes are created
- [ ] Verify all triggers are created
- [ ] Create `stories` storage bucket (see `docs/STORAGE_SETUP_INSTRUCTIONS.md`)
- [ ] Configure storage policies (public read, authenticated upload)
- [ ] Test authentication flow (sign up, sign in, sign out)
- [ ] Test story creation flow
- [ ] Test media upload flow

### 4. Database Migrations Review

Verify all migrations are applied in production:

- [ ] `20250115_01_add_profile_creation_trigger.sql` - Profile creation trigger
- [ ] `20250115_02_add_storage_bucket_and_policies.sql` - Storage setup
- [ ] `20250115_03_add_view_count_function.sql` - View count function
- [ ] `20250115_04_add_comments_count_trigger.sql` - Comments count trigger
- [ ] `20250115_05_add_performance_indexes.sql` - Performance indexes
- [ ] `20250115_16_add_subscriptions_schema.sql` - Subscription schema (Phase 0)

**How to verify:**
1. Go to Supabase Dashboard → **SQL Editor**
2. Run: `SELECT routine_name FROM information_schema.routines WHERE routine_schema = 'public';` (check functions)
3. Run: `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';` (check tables)
4. Check Storage section for buckets

### 5. Security Review

- [ ] All RLS policies are enabled on all tables
- [ ] No secrets in `NEXT_PUBLIC_*` environment variables
- [ ] `SUPABASE_SERVICE_ROLE` is only used server-side
- [ ] Stripe webhook signature verification is enabled
- [ ] API routes have proper authentication checks
- [ ] Admin routes are protected (admin role check)
- [ ] CORS is properly configured (if applicable)
- [ ] Rate limiting is configured (if applicable)

### 6. Performance Review

- [ ] Image optimization is enabled (next/image)
- [ ] Code splitting is implemented (dynamic imports)
- [ ] Lazy loading is used for non-critical components
- [ ] Database indexes are created for frequently queried columns
- [ ] Bundle size is optimized
- [ ] API routes are optimized (caching where appropriate)

### 7. Monitoring & Error Tracking

**See `docs/MONITORING_ANALYTICS_SETUP.md` for comprehensive setup guide.**

**Quick Checklist:**
- [ ] Error tracking is configured (Sentry recommended, or Vercel built-in)
- [ ] Analytics is configured (Vercel Analytics enabled, Google Analytics optional)
- [ ] Performance monitoring is set up (Vercel Analytics, Supabase Dashboard)
- [ ] Logging is configured (Vercel logs, Supabase logs, server-side logging)
- [ ] Alerts are set up for critical errors (Vercel, Supabase, Sentry)
- [ ] Dashboards are accessible and tested

### 8. Testing

**See `docs/TESTING_QA_CHECKLIST.md` for comprehensive testing checklist.**

**Quick Checklist:**
- [ ] Run all automated tests: `pnpm test` and `pnpm test:e2e`
- [ ] All tests pass
- [ ] Manual testing of all critical flows (see TESTING_QA_CHECKLIST.md)
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Mobile device testing (iOS, Android)
- [ ] Responsive design testing
- [ ] Performance testing (Lighthouse, WebPageTest)
- [ ] Security testing (authentication, RLS, input validation)
- [ ] Accessibility testing (WCAG AA compliance)

### 9. Documentation

**See `docs/DOCUMENTATION_REVIEW_CHECKLIST.md` for comprehensive documentation review.**

**Quick Checklist:**
- [ ] All documentation is up-to-date
- [ ] API documentation is complete
- [ ] Deployment guide is reviewed
- [ ] Environment variables are documented
- [ ] Known issues are documented (if any)
- [ ] All outdated information is updated
- [ ] All cross-references work

---

## 🚀 Deployment Steps

### Step 1: Prepare Repository

- [ ] All changes are committed
- [ ] All changes are pushed to main branch
- [ ] No sensitive data in code
- [ ] `.env.local` is in `.gitignore`
- [ ] `node_modules` is in `.gitignore`

### Step 2: Deploy to Vercel (Recommended)

1. **Import Project**
   - [ ] Go to [vercel.com](https://vercel.com)
   - [ ] Click **Add New Project**
   - [ ] Import GitHub repository
   - [ ] Select the repository

2. **Configure Project**
   - [ ] Framework Preset: Next.js (auto-detected)
   - [ ] Root Directory: `./` (default)
   - [ ] Build Command: `pnpm build` (auto-detected)
   - [ ] Output Directory: `.next` (auto-detected)
   - [ ] Install Command: `pnpm install` (auto-detected)

3. **Add Environment Variables**
   - [ ] Go to **Settings** → **Environment Variables**
   - [ ] Add all required variables (see section 2)
   - [ ] Select **Production**, **Preview**, and **Development** environments
   - [ ] Verify all variables are set correctly

4. **Deploy**
   - [ ] Click **Deploy**
   - [ ] Wait for build to complete
   - [ ] Verify deployment is successful
   - [ ] Test production URL

### Step 3: Post-Deployment Verification

- [ ] Production URL is accessible
- [ ] Authentication works (sign up, sign in, sign out)
- [ ] Story creation works
- [ ] Story viewing works
- [ ] Branching navigation works
- [ ] Like/Unlike works
- [ ] Comment creation works
- [ ] Share functionality works
- [ ] Profile viewing works
- [ ] Settings page works
- [ ] Subscription flow works (test mode)
- [ ] No console errors
- [ ] No 404 errors
- [ ] No 500 errors

### Step 4: Monitoring Setup

**See `docs/MONITORING_ANALYTICS_SETUP.md` for detailed setup instructions.**

**Quick Checklist:**
- [ ] Error tracking is working (Sentry or Vercel built-in)
- [ ] Analytics is tracking (Vercel Analytics enabled)
- [ ] Performance monitoring is active (Vercel Analytics, Supabase)
- [ ] Alerts are configured (Vercel, Supabase, Sentry)
- [ ] Logs are accessible (Vercel, Supabase)
- [ ] Dashboards are tested and accessible

---

## 🔄 Rollback Plan

If deployment fails or issues are discovered:

1. **Immediate Actions**
   - [ ] Notify users (status page, banner, Slack/Twitter)
   - [ ] Revert to previous deployment in Vercel
   - [ ] Check error logs
   - [ ] Identify root cause

2. **Investigation**
   - [ ] Review deployment logs
   - [ ] Check environment variables
   - [ ] Verify database connectivity
   - [ ] Test critical flows

3. **Fix & Redeploy**
   - [ ] Fix identified issues
   - [ ] Test fixes locally
   - [ ] Redeploy to production
   - [ ] Verify fixes work

---

## 📝 Post-Deployment Tasks

### Immediate (First 24 Hours)

- [ ] Monitor error logs
- [ ] Monitor performance metrics
- [ ] Check user feedback
- [ ] Verify all critical flows work
- [ ] Test on different devices/browsers

### Short-term (First Week)

- [ ] Review analytics data
- [ ] Optimize based on performance metrics
- [ ] Address any user-reported issues
- [ ] Update documentation based on findings
- [ ] Plan next iteration

### Long-term (Ongoing)

- [ ] Regular security audits
- [ ] Performance optimization
- [ ] Feature updates based on user feedback
- [ ] Database optimization
- [ ] Monitoring improvements

---

## 🔐 Security Checklist

- [ ] All RLS policies are enabled
- [ ] No secrets in client-side code
- [ ] API routes have authentication checks
- [ ] Admin routes are protected
- [ ] Stripe webhook signature verification
- [ ] Environment variables are secure
- [ ] HTTPS is enabled
- [ ] CORS is properly configured
- [ ] Rate limiting is configured (if applicable)

---

## 📊 Performance Checklist

- [ ] Image optimization enabled
- [ ] Code splitting implemented
- [ ] Lazy loading used
- [ ] Database indexes created
- [ ] Bundle size optimized
- [ ] API routes optimized
- [ ] Caching configured (where appropriate)

---

## 🧪 Testing Checklist

- [ ] All critical flows tested
- [ ] Cross-browser testing done
- [ ] Mobile device testing done
- [ ] Responsive design verified
- [ ] Error handling tested
- [ ] Loading states verified
- [ ] Edge cases tested

---

## 📚 Documentation Checklist

- [ ] All documentation updated
- [ ] API documentation complete
- [ ] Deployment guide reviewed
- [ ] Environment variables documented
- [ ] Known issues documented

---

## ⚠️ Important Notes

1. **Stripe Test Mode**: All Stripe features are in TEST MODE. Do not enable production Stripe until ready.

2. **Environment Variables**: Never commit `.env.local` to git. Always use Vercel's environment variable management.

3. **Database Migrations**: Always test migrations in a development environment before applying to production.

4. **Security**: Regularly review and update security measures. Keep dependencies up-to-date.

5. **Monitoring**: Set up monitoring and alerts before going live. Monitor closely in the first 24-48 hours.

---

## 🔗 Related Documentation

- **Post-Deployment Checklist**: `docs/POST_DEPLOYMENT_CHECKLIST.md` ⭐ **Use this after deployment is successful**
- **Vercel Deployment Execution**: `docs/VERCEL_DEPLOYMENT_EXECUTION.md` ⭐ **Use this for actual Vercel deployment execution**
- **Deployment Preparation Guide**: `docs/DEPLOYMENT_PREPARATION_GUIDE.md` ⭐ **Use this for step-by-step deployment preparation**
- **Documentation Review**: `docs/DOCUMENTATION_REVIEW_CHECKLIST.md` ⭐ **Use this for documentation review**
- **Testing & QA Checklist**: `docs/TESTING_QA_CHECKLIST.md` ⭐ **Use this for comprehensive testing**
- **Monitoring & Analytics Setup**: `docs/MONITORING_ANALYTICS_SETUP.md` ⭐ **Use this for monitoring setup**
- **Deployment Guide**: `docs/DEPLOYMENT.md`
- **Production Deployment**: `docs/PRODUCTION_DEPLOYMENT.md`
- **Operations Playbook**: `docs/OPERATIONS_PLAYBOOK.md`
- **Performance Monitoring**: `docs/PERFORMANCE_MONITORING.md`
- **Testing Guide**: `docs/TESTING.md`

---

**Status**: Ready for Production Deployment (Phase 0 - Test Mode Only)

**Last Updated**: 2025-01-15

