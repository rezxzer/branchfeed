# Implementation Order (Single Source of Truth)

Use this file to quickly see the recommended sequence and open the right doc.

Status legend: ✅ done, 🔄 in-progress, ⏭ next, ⏳ later

## 0) Strategy & Scope First
1. `docs/PROJECT_PRIORITIES.md` ✅
2. `docs/PROJECT_OVERVIEW.md` ✅
3. `docs/ESSENTIAL_FEATURES.md` ✅
4. `docs/DATABASE.md` ✅
5. `docs/ARCHITECTURE.md` ✅

## 1) Core Product (Stories → Feed → Profile)
6. `docs/features/story-player-component.md` ✅ (fullscreen, poster, debounce)
7. `docs/features/feed-page.md` ✅ (debounced loadMore)
8. `docs/features/profile-page.md` ✅ (Intl.NumberFormat, tabs configurable)
9. `docs/features/comment-system.md` ✅ (MAX_COMMENT_LENGTH env, date-fns relative, comments_count trigger, character counter)
10. `docs/features/share-system.md` ✅ (base URL via NEXT_PUBLIC_APP_URL, path validation)

## 2) Access & UX Foundations
11. `docs/features/authentication.md` ✅ (middleware refresh, profile insert)
12. `docs/features/auth-pages.md` ✅ (strong password regex, redirectTo preservation)
13. `docs/features/header-navigation.md` ✅ (Features smooth-scroll, admin conditional)
14. `docs/features/error-states.md` ✅ (`app/error.tsx`, `app/not-found.tsx`)
15. `docs/UI_STYLE_GUIDE.md` ✅ (dark/light toggle, gradients fallback)

## 3) Phase 3+ (Admin & Settings)
16. `docs/features/admin-dashboard.md` ✅ (empty states, aggregated RPC, bulk actions, moderation UX)
17. `docs/features/system-settings.md` ✅ (API GET/PATCH, client wired)

## 4) Operations & Quality
18. `docs/OPERATIONS_PLAYBOOK.md` ✅ (Post-Rebrand SEO, release branches)
19. `docs/DEPLOYMENT.md` ✅ (rollback notify users, secrets rotation)
20. `docs/PERFORMANCE_MONITORING.md` ✅ (alerts Slack/Email, SSR tips)
21. `docs/SMOKE_TEST_CHECKLIST.md` ✅ (cross-browser, custom error page)
22. `docs/TESTING.md` ✅ (headless default, measurable coverage)
23. `docs/FEATURES_TO_DOCUMENT.md` ✅ (dynamic table, dependencies)

### Current Focus
- ✅ **All Phase 1-4 features completed!**
- ✅ **All documented features implemented!**
- ✅ **Production Deployment Preparation completed!**
- ⏳ **Next Steps**: 
  - Production deployment (follow `PROJECT_PRIORITIES.md` and `PRODUCTION_DEPLOYMENT_CHECKLIST.md`)
  - Set up monitoring and analytics (see `MONITORING_ANALYTICS_SETUP.md`)
  - Run comprehensive testing (see `TESTING_QA_CHECKLIST.md`)
  - Monitor and optimize performance
  - Add new features based on user feedback

Notes:
- Always align with `docs/PROJECT_PRIORITIES.md` when picking the next task.
- Keep docs as living documents; update status/versions at the bottom of each file.
- **Last Updated**: 2025-01-15
