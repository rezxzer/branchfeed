# Deployment Checklist - BranchFeed

Quick checklist for production deployment.

**Last Updated**: 2025-01-15

---

## ✅ Pre-Deployment

### Code Quality
- [ ] `pnpm typecheck` - No TypeScript errors
- [ ] `pnpm lint` - No linting errors
- [ ] `pnpm build` - Build succeeds
- [ ] `pnpm test` - All tests pass
- [ ] Code committed and pushed to GitHub

### Supabase Production Setup
- [ ] Production Supabase project created
- [ ] `supabase/sql/init.sql` - Initial schema applied
- [ ] `20250115_01_add_profile_creation_trigger.sql` - Applied
- [ ] `20250115_02_add_storage_bucket_and_policies.sql` - Applied
- [ ] `20250115_03_add_view_count_function.sql` - Applied
- [ ] `20250115_04_add_avatars_bucket_and_policies.sql` - Applied
- [ ] `stories` storage bucket created (public)
- [ ] `avatars` storage bucket created (public)
- [ ] Migration verification script run (see `supabase/migrations/verify_migrations.sql`)
- [ ] API credentials copied (URL and anon key)

### Environment Variables
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Production URL ready
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Production anon key ready

---

## 🚀 Deployment

### Vercel Setup
- [ ] Repository pushed to GitHub
- [ ] Vercel account created/signed in
- [ ] Project imported from GitHub
- [ ] Framework preset: Next.js (auto-detected)
- [ ] Build command: `pnpm build` (auto-detected)
- [ ] Environment variables added:
  - [ ] `NEXT_PUBLIC_SUPABASE_URL` (Production, Preview, Development)
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Production, Preview, Development)
- [ ] Deploy button clicked
- [ ] Build completed successfully

---

## 🔍 Post-Deployment Verification

### Basic Functionality
- [ ] Homepage loads (`/`)
- [ ] Sign up works (creates account)
- [ ] Sign in works (authenticates)
- [ ] Feed page loads (`/feed`)
- [ ] Create story works (`/create`)
- [ ] Story viewing works (`/story/[id]`)
- [ ] Profile page works (`/profile/[id]`)
- [ ] Settings page works (`/settings`)

### Database Verification
- [ ] New user profile created automatically (check `profiles` table)
- [ ] Story creation saves to database (check `stories` table)
- [ ] Branch nodes created (check `story_nodes` table)
- [ ] Media upload works (check `stories` storage bucket)
- [ ] Path tracking works (check `user_story_progress` table)
- [ ] Like functionality works (check `likes` table)
- [ ] Comment functionality works (check `comments` table)

### Storage Verification
- [ ] Story media uploads to `stories` bucket
- [ ] Avatar uploads to `avatars` bucket
- [ ] Media files are publicly accessible
- [ ] File URLs work correctly

### Performance
- [ ] Page load time < 3 seconds
- [ ] Images load correctly
- [ ] No failed network requests
- [ ] Mobile responsive design works
- [ ] No console errors

### Error Monitoring
- [ ] Vercel logs checked (no errors)
- [ ] Browser console checked (no errors)
- [ ] Supabase logs checked (no errors)

---

## 📊 Monitoring Setup

### Vercel Analytics
- [ ] Web Analytics enabled in Vercel Dashboard
- [ ] Analytics tab accessible

### Supabase Monitoring
- [ ] Database performance monitoring accessible
- [ ] API usage monitoring accessible
- [ ] Storage usage monitoring accessible

---

## 🔐 Security Verification

- [ ] Environment variables not exposed in client code
- [ ] RLS policies enabled on all tables
- [ ] Storage policies restrict access appropriately
- [ ] HTTPS enabled (automatic on Vercel)
- [ ] No secrets in `NEXT_PUBLIC_*` variables

---

## 📝 Notes

**Deployment Date**: _______________

**Deployed By**: _______________

**Production URL**: _______________

**Supabase Project**: _______________

**Issues Encountered**: 
- 

**Resolved**: 
- 

---

## 🆘 Quick Troubleshooting

**Build fails?**
- Check TypeScript errors: `pnpm typecheck`
- Check linting errors: `pnpm lint`
- Verify environment variables are set

**Runtime errors?**
- Check Vercel logs
- Check browser console
- Verify Supabase credentials

**Database errors?**
- Run migration verification script
- Check RLS policies
- Verify storage buckets exist

---

**See `docs/PRODUCTION_DEPLOYMENT.md` for detailed instructions.**

