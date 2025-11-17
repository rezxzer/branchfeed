# Post-Deployment Checklist - BranchFeed

ეს დოკუმენტაცია არის checklist იმისთვის რა უნდა გაკეთდეს deployment-ის შემდეგ.

**Deployment URL**: https://branchfeed.vercel.app  
**Last Updated**: 2025-01-15

---

## ✅ Deployment Status

- ✅ Code pushed to GitHub
- ✅ Vercel auto-deployment successful
- ✅ Site is live at https://branchfeed.vercel.app
- ✅ Feed page is accessible
- ✅ Stories are displaying

---

## ⚠️ რა უნდა გაკეთდეს ახლა

### 1. Environment Variables Setup (CRITICAL)

**Vercel Dashboard → Settings → Environment Variables**

დაამატეთ შემდეგი environment variables:

#### Required Variables (5)

1. **NEXT_PUBLIC_APP_URL**
   - Value: `https://branchfeed.vercel.app`
   - Environments: ✅ Production, ✅ Preview, ✅ Development

2. **NEXT_PUBLIC_SUPABASE_URL**
   - Value: Your production Supabase project URL
   - Get from: Supabase Dashboard → Settings → API
   - Environments: ✅ Production, ✅ Preview, ✅ Development

3. **NEXT_PUBLIC_SUPABASE_ANON_KEY**
   - Value: Your production Supabase anon key
   - Get from: Supabase Dashboard → Settings → API
   - Environments: ✅ Production, ✅ Preview, ✅ Development

4. **SUPABASE_SERVICE_ROLE**
   - Value: Your production Supabase service role key
   - Get from: Supabase Dashboard → Settings → API
   - ⚠️ Keep secret! Server-side only
   - Environments: ✅ Production, ✅ Preview, ✅ Development

5. **NEXT_PUBLIC_MAX_COMMENT_LENGTH**
   - Value: `500`
   - Environments: ✅ Production, ✅ Preview, ✅ Development

#### Stripe Variables (6 - if using subscriptions)

6. **STRIPE_SECRET_KEY_TEST**
   - Value: Your Stripe test secret key (starts with `sk_test_`)
   - Get from: Stripe Dashboard → Developers → API keys
   - Environments: ✅ Production, ✅ Preview, ✅ Development

7. **STRIPE_PUBLISHABLE_KEY_TEST**
   - Value: Your Stripe test publishable key (starts with `pk_test_`)
   - Get from: Stripe Dashboard → Developers → API keys
   - Environments: ✅ Production, ✅ Preview, ✅ Development

8. **STRIPE_PRICE_ID_SUPPORTER**
   - Value: Your Stripe test price ID for Supporter tier
   - Get from: Stripe Dashboard → Products
   - Environments: ✅ Production, ✅ Preview, ✅ Development

9. **STRIPE_PRICE_ID_PRO**
   - Value: Your Stripe test price ID for Pro tier
   - Get from: Stripe Dashboard → Products
   - Environments: ✅ Production, ✅ Preview, ✅ Development

10. **STRIPE_PRICE_ID_VIP**
    - Value: Your Stripe test price ID for VIP tier
    - Get from: Stripe Dashboard → Products
    - Environments: ✅ Production, ✅ Preview, ✅ Development

11. **STRIPE_WEBHOOK_SECRET_TEST**
    - Value: Your Stripe test webhook secret (starts with `whsec_`)
    - Get from: Stripe Dashboard → Developers → Webhooks (after configuring webhook)
    - Environments: ✅ Production, ✅ Preview, ✅ Development

**After adding variables:**
- [ ] Redeploy in Vercel (or wait for next auto-deployment)
- [ ] Verify variables are set correctly

---

### 2. Supabase Production Setup (CRITICAL)

#### 2.1 Create Production Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click **New Project**
3. Fill in:
   - **Name**: `branchfeed-production`
   - **Database Password**: Strong password (save it!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Select appropriate plan
4. Click **Create new project**
5. Wait for project to be created (2-3 minutes)

#### 2.2 Run Database Migrations

1. Go to Supabase Dashboard → **SQL Editor**
2. Run all 16 migrations from `supabase/migrations/` in order:
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

3. Verify migrations:
   ```sql
   -- Check tables
   SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;
   
   -- Check functions
   SELECT routine_name FROM information_schema.routines WHERE routine_schema = 'public' ORDER BY routine_name;
   ```

#### 2.3 Create Storage Buckets

1. Go to Supabase Dashboard → **Storage**
2. Create `stories` bucket:
   - Name: `stories`
   - Public: ✅ Yes
   - File size limit: 50 MB
   - Allowed MIME types: `video/*,image/*`
3. Create `avatars` bucket:
   - Name: `avatars`
   - Public: ✅ Yes
   - File size limit: 5 MB
   - Allowed MIME types: `image/*`

**Storage policies should be created by migrations.**

#### 2.4 Get Supabase Credentials

1. Go to Supabase Dashboard → **Settings** → **API**
2. Copy:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **service_role key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (⚠️ Keep secret!)

3. Add these to Vercel environment variables (see section 1)

---

### 3. Post-Deployment Testing

**Test on https://branchfeed.vercel.app:**

#### Basic Functionality
- [ ] Home page loads
- [ ] Sign up works (create test account)
- [ ] Sign in works
- [ ] Sign out works
- [ ] Feed page loads stories
- [ ] Story cards display correctly
- [ ] Story creation works
- [ ] Media upload works
- [ ] Story viewing works
- [ ] Branching navigation works (A/B choices)
- [ ] Like/Unlike works
- [ ] Comment creation works
- [ ] Share functionality works
- [ ] Profile page works
- [ ] Settings page works
- [ ] Admin dashboard works (if admin user)

#### Error Checking
- [ ] No console errors (F12 → Console)
- [ ] No network errors (F12 → Network)
- [ ] No 404 errors
- [ ] No 500 errors
- [ ] No authentication errors

#### Performance
- [ ] Page load times are acceptable
- [ ] Media loads correctly
- [ ] No slow queries

#### Mobile Testing
- [ ] Test on mobile device
- [ ] Responsive design works
- [ ] Touch interactions work

---

### 4. Stripe Webhook Configuration (if using subscriptions)

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/test/webhooks)
2. Click **Add endpoint**
3. **Endpoint URL**: `https://branchfeed.vercel.app/api/stripe/webhook`
4. **Events to send**:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click **Add endpoint**
6. Copy **Signing secret** (starts with `whsec_`)
7. Add to Vercel: `STRIPE_WEBHOOK_SECRET_TEST`
8. Redeploy

---

### 5. Monitoring Setup

#### Vercel Analytics
- [ ] Enable Vercel Analytics in Vercel Dashboard
- [ ] Monitor page views and performance

#### Sentry (Optional - Recommended)
- [ ] Create Sentry project
- [ ] Get DSN
- [ ] Add `NEXT_PUBLIC_SENTRY_DSN` to Vercel
- [ ] Redeploy
- [ ] Verify errors are being tracked

#### Google Analytics (Optional)
- [ ] Create Google Analytics property
- [ ] Get Measurement ID (e.g., `G-XXXXXXXXXX`)
- [ ] Add `NEXT_PUBLIC_GA_ID` to Vercel
- [ ] Redeploy
- [ ] Verify tracking is working

**See `docs/MONITORING_ANALYTICS_SETUP.md` for detailed setup.**

---

### 6. Custom Domain (Optional)

1. Go to Vercel Dashboard → **Settings** → **Domains**
2. Click **Add Domain**
3. Enter your domain (e.g., `branchfeed.com`)
4. Follow DNS configuration instructions
5. Wait for DNS propagation (up to 48 hours)
6. SSL certificate will be automatically configured

---

## 📊 Current Status

### ✅ Completed
- Code deployed to Vercel
- Site is live
- Feed page working
- Stories displaying

### ⚠️ To Do
- [ ] Add environment variables to Vercel
- [ ] Create production Supabase project
- [ ] Run all 16 migrations
- [ ] Create storage buckets
- [ ] Test all functionality
- [ ] Configure Stripe webhook (if using)
- [ ] Set up monitoring
- [ ] Configure custom domain (optional)

---

## 🔗 Quick Links

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Supabase Dashboard**: https://app.supabase.com
- **Stripe Dashboard**: https://dashboard.stripe.com
- **Live Site**: https://branchfeed.vercel.app

---

## 📝 Next Steps

1. **Priority 1**: Add environment variables to Vercel
2. **Priority 2**: Create production Supabase project and run migrations
3. **Priority 3**: Test all functionality
4. **Priority 4**: Set up monitoring
5. **Priority 5**: Configure Stripe webhook (if using subscriptions)

---

**Status**: Deployment Successful - Configuration Needed

**Last Updated**: 2025-01-15

