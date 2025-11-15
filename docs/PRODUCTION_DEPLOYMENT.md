# BranchFeed Production Deployment Guide

**Last Updated**: 2025-01-15  
**Status**: ✅ Ready for Production  
**Purpose**: Operational deployment plan for BranchFeed MVP

---

## 🌍 Environments & URLs

### Environment Overview

BranchFeed uses **three environments** with separate Supabase projects:

| Environment | URL | Supabase Project | Purpose |
|------------|-----|------------------|---------|
| **Local** | `http://localhost:3000` | Local or Dev/Stage | Development |
| **Dev/Preview** | `branchfeed-git-dev-{hash}.vercel.app` | Dev/Stage | Testing & Preview |
| **Production** | `https://branchfeed.app` (or `*.vercel.app`) | Production | Live Application |

### Environment Details

#### 1. Local Development

- **URL**: `http://localhost:3000`
- **Supabase Project**: Dev/Stage project (or local Supabase instance)
- **Purpose**: 
  - Local development and testing
  - Feature development
  - Debugging

**Configuration**:
- Uses `.env.local` file
- Environment variables point to Dev/Stage Supabase project

#### 2. Dev/Preview (Vercel Previews)

- **URL**: `branchfeed-git-dev-{hash}.vercel.app` (auto-generated)
- **Supabase Project**: Dev/Stage project
- **Purpose**:
  - Preview deployments for pull requests
  - Testing before production
  - Staging environment

**Configuration**:
- Automatically created by Vercel on push to non-main branches
- Uses Vercel Preview environment variables
- Points to Dev/Stage Supabase project

**When it deploys**:
- Push to `dev` branch → Preview deployment
- Open Pull Request → Preview deployment
- Push to any feature branch → Preview deployment

#### 3. Production

- **URL**: `https://branchfeed.app` (target domain) or `https://branchfeed.vercel.app` (temporary)
- **Supabase Project**: Production project
- **Purpose**:
  - Live application for end users
  - Production data and storage

**Configuration**:
- Uses Vercel Production environment variables
- Points to Production Supabase project
- Custom domain configured (when available)

**When it deploys**:
- Push to `main` branch → Production deployment
- Manual redeploy from Vercel dashboard

---

## ✅ Pre-Deployment Checklist

### 1. Code Quality Checks

Run all checks locally before pushing to `main`:

```bash
# TypeScript type checking
pnpm typecheck

# Linting
pnpm lint

# Build test
pnpm build
```

**✅ All checks must pass before deployment**

### 2. Smoke Test Checklist

Based on `docs/SMOKE_TEST_CHECKLIST.md`, verify critical flows:

#### Authentication
- [ ] Sign up works (creates profile automatically)
- [ ] Sign in works
- [ ] Sign out works
- [ ] Protected routes redirect to signin

#### Feed Page
- [ ] Feed page loads without errors
- [ ] Stories display correctly (or empty state shows)
- [ ] Story cards are clickable and navigate correctly
- [ ] Loading states work (skeleton loaders)
- [ ] Sort controls work

#### Story Detail Page
- [ ] Story page loads correctly
- [ ] Media displays (images/videos)
- [ ] Choice buttons work (A/B selection)
- [ ] Path progress updates correctly
- [ ] Like/Share/Comment buttons work
- [ ] Comments section works

#### Create Story Flow
- [ ] Create page loads
- [ ] Root story form works (title, description, media upload)
- [ ] Branch nodes form works (A/B choices)
- [ ] Preview step shows correct data
- [ ] Publish creates story and redirects correctly
- [ ] Error messages are user-friendly

#### Profile Page
- [ ] Profile page loads
- [ ] Own profile shows "Settings" button
- [ ] Other user's profile doesn't show "Settings"
- [ ] Stories grid displays correctly
- [ ] Empty state shows if no stories

### 3. Environment Variables Check

Verify all required environment variables are set:

**Required Variables**:
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon public key

**Check Supabase Projects**:
- [ ] Dev/Stage Supabase project exists and is configured
- [ ] Production Supabase project exists and is configured
- [ ] Storage buckets created (`stories`, `avatars`)
- [ ] RLS policies enabled
- [ ] Migrations applied

**Check Vercel Environment Variables**:
- [ ] Production environment: Points to Production Supabase
- [ ] Preview environment: Points to Dev/Stage Supabase
- [ ] Development environment: Points to Dev/Stage Supabase

### 4. Database Migrations

**Production Supabase**:
- [ ] All migrations applied (check `supabase/migrations/` directory)
- [ ] Tables exist: `profiles`, `stories`, `story_nodes`, `user_story_progress`, `likes`, `comments`
- [ ] Functions exist: `handle_new_user`, `increment_story_views`
- [ ] Triggers exist: `on_auth_user_created`, `likes_count_trigger`
- [ ] Storage buckets exist: `stories`, `avatars`
- [ ] RLS policies enabled on all tables

**Verification Query** (run in Supabase SQL Editor):

```sql
-- Quick verification
SELECT 
  'Tables' as check_type,
  COUNT(*) as count
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('profiles', 'stories', 'story_nodes', 'user_story_progress', 'likes', 'comments');

SELECT 
  'Storage Buckets' as check_type,
  COUNT(*) as count
FROM storage.buckets 
WHERE name IN ('stories', 'avatars');
```

### 5. Git Status

Before pushing to `main`:

- [ ] All changes committed
- [ ] No uncommitted files
- [ ] Branch is up to date with remote
- [ ] Ready to merge to `main`

---

## 🚀 Deployment Flow (GitHub + Vercel)

### Overview

```
Local Development
    ↓
GitHub Repository (branchfeed)
    ↓
Vercel (Auto-deploy)
    ↓
Production URL (branchfeed.app)
```

### Step-by-Step Process

#### Step 1: Local → GitHub

1. **Commit all changes**:
   ```bash
   git add .
   git commit -m "Description of changes"
   ```

2. **Push to feature branch** (if working on feature):
   ```bash
   git push origin feature-branch-name
   ```

3. **Merge to `dev` branch** (for preview/testing):
   ```bash
   git checkout dev
   git merge feature-branch-name
   git push origin dev
   ```
   - **Result**: Vercel automatically creates preview deployment
   - **URL**: `branchfeed-git-dev-{hash}.vercel.app`
   - **Supabase**: Dev/Stage project

4. **Merge to `main` branch** (for production):
   ```bash
   git checkout main
   git merge dev  # or feature-branch-name
   git push origin main
   ```
   - **Result**: Vercel automatically deploys to production
   - **URL**: `https://branchfeed.app` (or `*.vercel.app`)
   - **Supabase**: Production project

#### Step 2: Vercel Auto-Deployment

**What happens automatically**:

1. **On push to `dev` branch**:
   - Vercel detects push
   - Creates preview deployment
   - Uses Preview environment variables
   - Builds and deploys
   - Generates preview URL
   - **No manual action required**

2. **On push to `main` branch**:
   - Vercel detects push
   - Creates production deployment
   - Uses Production environment variables
   - Builds and deploys
   - Updates production URL
   - **No manual action required**

**Monitor deployment**:
- Go to Vercel Dashboard → **Deployments**
- Watch build logs in real-time
- Check for build errors

#### Step 3: Verify Deployment

After deployment completes:

1. **Check Vercel Dashboard**:
   - [ ] Build status: ✅ Success
   - [ ] No build errors
   - [ ] Deployment URL is live

2. **Check Production URL**:
   - [ ] Site loads without errors
   - [ ] No console errors (browser DevTools)
   - [ ] Authentication works

---

## 🧪 Post-Deployment Smoke Test

After production deployment, run these **critical scenarios**:

### 1. Authentication Flow

**Test Sign Up**:
1. Navigate to production URL
2. Click "Sign Up"
3. Fill email and password
4. Submit form
5. **Expected**: Redirects to `/feed`, profile created automatically

**Test Sign In**:
1. Sign in with existing account
2. **Expected**: Redirects to `/feed`, authenticated

**Test Sign Out**:
1. Click user menu → "Sign Out"
2. **Expected**: Redirects to home, signed out

### 2. Feed Page

1. Navigate to `/feed`
2. **Expected**: 
   - Page loads without errors
   - Stories display (or empty state)
   - Story cards are clickable
   - No console errors

### 3. Story Detail Page

1. Click on any story card
2. **Expected**:
   - Story page loads
   - Media displays correctly
   - Choice buttons work (if applicable)
   - Like/Share/Comment buttons work

### 4. Create Story Flow

1. Navigate to `/create`
2. Fill root story form (title, media)
3. Add branch nodes (A/B choices)
4. Click "Publish Story"
5. **Expected**:
   - Story created successfully
   - Redirects to story detail page
   - Story visible in feed

### 5. Profile Page

1. Navigate to `/profile/[userId]`
2. **Expected**:
   - Profile loads correctly
   - Stories grid displays
   - Settings button visible (if own profile)

**Total Time**: ~5-10 minutes

**If all pass**: ✅ Production deployment successful  
**If any fail**: See Rollback Plan below

---

## 🔄 Rollback Plan

If production deployment has issues, use one of these rollback methods:

### Method 1: Vercel Dashboard Rollback (Recommended)

**Fastest and safest method**:

1. Go to Vercel Dashboard → **Deployments**
2. Find the **previous working deployment**
3. Click **⋯** (three dots) on that deployment
4. Click **Promote to Production**
5. **Result**: Production URL immediately points to previous deployment
6. **Time**: ~30 seconds

**Advantages**:
- No code changes needed
- Instant rollback
- No Git history changes
- Can rollback again if needed

### Method 2: Git Revert + Redeploy

**If you need to fix the code**:

1. **Revert the problematic commit**:
   ```bash
   git checkout main
   git revert HEAD  # Reverts last commit
   git push origin main
   ```

2. **Vercel automatically redeploys**:
   - New deployment created
   - Production URL updated
   - **Time**: ~3-5 minutes (build time)

**Advantages**:
- Clean Git history
- Can fix and redeploy
- Good for code issues

### Method 3: Manual Redeploy Previous Version

**If you know the exact commit**:

1. Go to Vercel Dashboard → **Deployments**
2. Find deployment with working commit hash
3. Click **⋯** → **Redeploy**
4. **Result**: New deployment from that commit
5. **Time**: ~3-5 minutes (build time)

### Rollback Decision Tree

```
Production Issue Detected
    ↓
Is it a critical bug?
    ├─ YES → Use Method 1 (Vercel Dashboard Rollback) - Fastest
    └─ NO → Use Method 2 (Git Revert) - Clean history
```

### Post-Rollback Steps

After rollback:

1. **Verify production works**:
   - Run Post-Deployment Smoke Test again
   - Check critical flows

2. **Investigate issue**:
   - Check Vercel build logs
   - Check browser console errors
   - Check Supabase logs

3. **Fix issue**:
   - Fix in feature branch
   - Test in preview environment
   - Merge to `main` when ready

---

## 📋 Quick Reference

### Deployment Commands

```bash
# Local checks
pnpm typecheck
pnpm lint
pnpm build

# Git workflow
git add .
git commit -m "Description"
git push origin dev      # Preview deployment
git push origin main     # Production deployment
```

### Important URLs

- **Production**: `https://branchfeed.app` (or `*.vercel.app`)
- **Preview**: `branchfeed-git-dev-{hash}.vercel.app`
- **Vercel Dashboard**: `https://vercel.com/dashboard`
- **Supabase Dashboard**: `https://app.supabase.com`

### Environment Variables

**Production**:
- `NEXT_PUBLIC_SUPABASE_URL` → Production Supabase project
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` → Production Supabase anon key

**Preview/Dev**:
- `NEXT_PUBLIC_SUPABASE_URL` → Dev/Stage Supabase project
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` → Dev/Stage Supabase anon key

---

## 📚 Related Documentation

- **Smoke Test Checklist**: `docs/SMOKE_TEST_CHECKLIST.md` - Detailed test scenarios
- **Operations Playbook**: `docs/OPERATIONS_PLAYBOOK.md` - Environment strategy
- **Setup Guide**: `docs/SETUP.md` - Development setup
- **Database Guide**: `docs/DATABASE.md` - Database schema and migrations

---

## ✅ Deployment Checklist Summary

**Before Deployment**:
- [ ] Code quality checks pass (`pnpm typecheck`, `pnpm lint`, `pnpm build`)
- [ ] Smoke test checklist verified locally
- [ ] Environment variables configured in Vercel
- [ ] Supabase projects set up (Dev/Stage + Production)
- [ ] Database migrations applied to Production Supabase
- [ ] Storage buckets created in Production Supabase
- [ ] All changes committed to Git

**During Deployment**:
- [ ] Code pushed to `main` branch
- [ ] Vercel build successful
- [ ] No build errors in logs

**After Deployment**:
- [ ] Post-Deployment Smoke Test passed
- [ ] Production URL loads correctly
- [ ] Authentication works
- [ ] Feed page works
- [ ] Story creation works
- [ ] No console errors

---

**Last Updated**: 2025-01-15  
**Status**: ✅ Ready for Production Deployment
