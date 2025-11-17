# Testing & Quality Assurance Checklist - BranchFeed

ეს დოკუმენტაცია არის comprehensive testing checklist production deployment-ის წინ.

**Last Updated**: 2025-01-15

---

## 📋 Pre-Production Testing Checklist

### 1. Automated Testing ✅

#### Unit Tests (Jest)

- [x] Jest configured and working
- [x] Test scripts in package.json
- [x] Component tests: Button, Skeleton, FeedControls
- [x] Utility tests: cn (utils)
- [ ] Run all unit tests: `pnpm test`
- [ ] All unit tests pass
- [ ] Coverage report generated: `pnpm test:coverage`
- [ ] Coverage meets goals (80%+ for utilities, 70%+ for components)

**Current Coverage:**
- ✅ Button component - Variants, sizes, interactions, disabled state
- ✅ Skeleton component - Variants, custom dimensions, styling
- ✅ FeedControls component - Sort dropdown functionality
- ✅ Utils (cn) - Class name merging and conditional classes

#### Integration Tests

- [ ] Feed page integration test
- [ ] Story creation flow integration test
- [ ] Authentication flow integration test
- [ ] Profile page integration test
- [ ] Comment system integration test
- [ ] Like system integration test

#### E2E Tests (Playwright) ✅

- [x] Playwright configured and working
- [x] E2E test scripts in package.json
- [x] Authentication flow tests (`e2e/auth.spec.ts`)
- [x] Story creation flow tests (`e2e/story-creation.spec.ts`)
- [x] Story interaction flow tests (`e2e/story-interaction.spec.ts`)
- [x] Profile flow tests (`e2e/profile.spec.ts`)
- [ ] Run all E2E tests: `pnpm test:e2e`
- [ ] All E2E tests pass
- [ ] E2E tests run in CI/CD pipeline

**E2E Test Scenarios:**
- ✅ User sign up with valid credentials
- ✅ User sign up validation (invalid email, weak password)
- ✅ User sign in with valid credentials
- ✅ User sign in validation (invalid credentials)
- ✅ Protected route redirects
- ✅ Navigate to create page
- ✅ Fill root story form
- ✅ Step indicator display
- ✅ Proceed to branches step
- ✅ Form validation errors
- ✅ View feed page
- ✅ Click on story card
- ✅ View story player
- ✅ See choice buttons (A/B)
- ✅ Click choice button
- ✅ See interaction buttons (like, comment, share)
- ✅ See path progress indicator
- ✅ Navigate to profile page
- ✅ Navigate to settings page
- ✅ View profile settings form
- ✅ Edit username
- ✅ See avatar upload section
- ✅ View own stories

---

### 2. Manual Testing

#### Critical User Flows

**Authentication Flow:**
- [ ] Sign up with valid email and password
- [ ] Sign up with invalid email (validation error)
- [ ] Sign up with weak password (validation error)
- [ ] Sign in with valid credentials
- [ ] Sign in with invalid credentials (error message)
- [ ] Sign out functionality
- [ ] Protected routes redirect to sign in when not authenticated
- [ ] Session persistence (refresh page, still logged in)
- [ ] Session expiration handling

**Story Creation Flow:**
- [ ] Navigate to create page (authenticated)
- [ ] Fill root story form (title, description, media)
- [ ] Upload image (9:16 aspect ratio validation)
- [ ] Upload video (9:16 aspect ratio validation)
- [ ] Form validation errors display correctly
- [ ] Step indicator shows current step
- [ ] Proceed to branches step
- [ ] Add branch nodes (A/B choices)
- [ ] Add media to branch nodes
- [ ] Preview story before publishing
- [ ] Publish story successfully
- [ ] Story appears in feed after publishing
- [ ] Subscription limit checking (monthly stories, branch limits)
- [ ] Error handling for limit exceeded

**Story Viewing & Interaction Flow:**
- [ ] View feed page
- [ ] Story cards display correctly
- [ ] Click on story card navigates to detail page
- [ ] Story player displays root story
- [ ] Choice buttons (A/B) are visible and clickable
- [ ] Click choice button navigates to next node
- [ ] Path progress indicator updates
- [ ] Like button works (toggle like/unlike)
- [ ] Like count updates correctly
- [ ] Comment section displays
- [ ] Add comment successfully
- [ ] Comment appears in comment list
- [ ] Share button works (copy link)
- [ ] View count increments
- [ ] Subscription limit checking (views, likes, comments)
- [ ] Error handling for limit exceeded

**Profile & Settings Flow:**
- [ ] Navigate to own profile page
- [ ] View profile information (username, bio, avatar)
- [ ] View own stories on profile
- [ ] Navigate to settings page
- [ ] Edit profile (username, bio)
- [ ] Upload avatar image
- [ ] Change language preference
- [ ] View subscription settings
- [ ] View payment history
- [ ] Subscription badge displays on profile

**Feed & Navigation Flow:**
- [ ] Feed page loads stories
- [ ] Infinite scroll works (load more stories)
- [ ] Sort by recent/popular/trending works
- [ ] Story cards display correctly
- [ ] Navigation links work (Feed, Create, Profile, Settings)
- [ ] Header displays correctly
- [ ] Language switcher works
- [ ] Sign out from header menu

**Admin Flow (if applicable):**
- [ ] Admin dashboard accessible (admin role only)
- [ ] User management works
- [ ] Content moderation works
- [ ] Analytics dashboard displays
- [ ] Reports management works

---

### 3. Cross-Browser Testing

Test on multiple browsers:

**Desktop Browsers:**
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

**Mobile Browsers:**
- [ ] Chrome (Android)
- [ ] Safari (iOS)
- [ ] Firefox (Android)

**Test Scenarios per Browser:**
- [ ] Authentication flow works
- [ ] Story creation works
- [ ] Story viewing works
- [ ] Branching navigation works
- [ ] Like/comment/share works
- [ ] Profile page works
- [ ] Settings page works
- [ ] Responsive design works
- [ ] No console errors
- [ ] No visual bugs

---

### 4. Mobile Device Testing

**iOS Devices:**
- [ ] iPhone (latest iOS)
- [ ] iPad (latest iOS)

**Android Devices:**
- [ ] Android phone (latest Android)
- [ ] Android tablet (latest Android)

**Test Scenarios:**
- [ ] Touch interactions work
- [ ] Responsive layout displays correctly
- [ ] Media upload works (camera, gallery)
- [ ] Keyboard navigation works
- [ ] Scrolling works smoothly
- [ ] No layout issues
- [ ] Performance is acceptable

---

### 5. Responsive Design Testing

**Breakpoints:**
- [ ] Mobile (< 640px)
- [ ] Tablet (640px - 1024px)
- [ ] Desktop (> 1024px)

**Test Scenarios:**
- [ ] Layout adapts correctly
- [ ] Navigation menu works (mobile hamburger menu)
- [ ] Forms are usable on mobile
- [ ] Images/videos scale correctly
- [ ] Text is readable
- [ ] Buttons are tappable
- [ ] No horizontal scrolling
- [ ] No content overflow

---

### 6. Performance Testing

**Page Load Performance:**
- [ ] Home page loads < 3 seconds
- [ ] Feed page loads < 3 seconds
- [ ] Story detail page loads < 3 seconds
- [ ] Create page loads < 3 seconds
- [ ] Profile page loads < 3 seconds

**Interaction Performance:**
- [ ] Like button responds < 500ms
- [ ] Comment submission responds < 1 second
- [ ] Story creation responds < 2 seconds
- [ ] Media upload progress visible
- [ ] Navigation is smooth (no lag)

**Bundle Size:**
- [ ] Initial bundle size < 500KB (gzipped)
- [ ] Code splitting works (dynamic imports)
- [ ] Images optimized (next/image)
- [ ] No unnecessary dependencies

**Database Performance:**
- [ ] Feed queries < 500ms
- [ ] Story detail queries < 500ms
- [ ] User profile queries < 500ms
- [ ] Indexes are used (check query plans)

**Tools:**
- [ ] Lighthouse score > 90 (Performance)
- [ ] WebPageTest results acceptable
- [ ] Chrome DevTools Performance tab
- [ ] Network tab (check request sizes)

---

### 7. Security Testing

**Authentication Security:**
- [ ] Passwords are hashed (not stored in plain text)
- [ ] Session tokens are secure
- [ ] Protected routes require authentication
- [ ] Sign out invalidates session
- [ ] Password validation is enforced

**API Security:**
- [ ] RLS policies are enabled on all tables
- [ ] Users can only access their own data
- [ ] Admin routes require admin role
- [ ] API routes validate authentication
- [ ] No sensitive data in API responses

**Input Validation:**
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (input sanitization)
- [ ] File upload validation (type, size)
- [ ] Comment length validation
- [ ] Username validation

**Environment Variables:**
- [ ] No secrets in `NEXT_PUBLIC_*` variables
- [ ] Service role key is server-side only
- [ ] Stripe keys are secure
- [ ] Environment variables are not exposed

**Storage Security:**
- [ ] Storage policies restrict access
- [ ] Public read, authenticated upload
- [ ] File type validation
- [ ] File size limits

---

### 8. Accessibility Testing

**WCAG AA Compliance:**
- [ ] Color contrast meets WCAG AA (4.5:1 for text)
- [ ] ARIA labels on interactive elements
- [ ] Keyboard navigation works
- [ ] Screen reader compatibility
- [ ] Focus indicators visible
- [ ] Form labels associated correctly
- [ ] Error messages are accessible
- [ ] Loading states are announced

**Tools:**
- [ ] Lighthouse Accessibility score > 90
- [ ] axe DevTools (no violations)
- [ ] Keyboard-only navigation test
- [ ] Screen reader test (NVDA/JAWS/VoiceOver)

**Test Scenarios:**
- [ ] Navigate entire app with keyboard only
- [ ] All interactive elements are focusable
- [ ] Focus order is logical
- [ ] Error messages are announced
- [ ] Loading states are announced
- [ ] Form validation errors are accessible

---

### 9. Error Handling Testing

**Network Errors:**
- [ ] Offline mode handling
- [ ] Slow network handling
- [ ] Request timeout handling
- [ ] API error responses
- [ ] Error messages are user-friendly

**Form Validation Errors:**
- [ ] Required field validation
- [ ] Email format validation
- [ ] Password strength validation
- [ ] File upload validation
- [ ] Comment length validation
- [ ] Error messages display correctly

**Edge Cases:**
- [ ] Empty feed (no stories)
- [ ] Empty profile (no stories)
- [ ] Invalid story ID
- [ ] Invalid user ID
- [ ] Deleted content handling
- [ ] Subscription limit exceeded
- [ ] Payment failure handling

**Error Boundaries:**
- [ ] React error boundaries catch errors
- [ ] Error fallback UI displays
- [ ] Error logging works
- [ ] User can retry after error

---

### 10. Subscription & Monetization Testing (Phase 0 - Test Mode)

**Subscription Flow:**
- [ ] View subscription tiers
- [ ] Subscribe to tier (test mode)
- [ ] Stripe checkout works (test mode)
- [ ] Webhook receives events
- [ ] Subscription status updates
- [ ] Payment history displays
- [ ] Cancel subscription works

**Subscription Limits:**
- [ ] Daily view limits enforced
- [ ] Daily like limits enforced
- [ ] Daily comment limits enforced
- [ ] Monthly story creation limits enforced
- [ ] Branch limits per story enforced
- [ ] Error messages display correctly
- [ ] Upgrade prompts work

**Test Mode:**
- [ ] Test mode indicator displays
- [ ] Test Stripe keys work
- [ ] Test payment cards work
- [ ] Production Stripe keys are NOT set

---

### 11. Data Integrity Testing

**Database Integrity:**
- [ ] Foreign key constraints work
- [ ] Cascade deletes work correctly
- [ ] Unique constraints enforced
- [ ] Check constraints enforced
- [ ] Triggers fire correctly
- [ ] Indexes improve performance

**Data Consistency:**
- [ ] Story likes count matches actual likes
- [ ] Story comments count matches actual comments
- [ ] Story views count increments correctly
- [ ] User profile data is consistent
- [ ] Subscription data is consistent

---

### 12. Integration Testing

**Supabase Integration:**
- [ ] Authentication works
- [ ] Database queries work
- [ ] Storage uploads work
- [ ] Storage downloads work
- [ ] RLS policies work
- [ ] Triggers work

**Stripe Integration (Test Mode):**
- [ ] Checkout session creation works
- [ ] Webhook events received
- [ ] Subscription updates work
- [ ] Payment history recorded

---

## 📊 Testing Coverage Goals

### Current Coverage

**Unit/Component Tests:**
- ✅ Button component
- ✅ Skeleton component
- ✅ FeedControls component
- ✅ Utils (cn)

**E2E Tests:**
- ✅ Authentication flow
- ✅ Story creation flow
- ✅ Story interaction flow
- ✅ Profile flow

### Target Coverage

- **Unit Tests**: 80%+ coverage for utilities and pure functions
- **Component Tests**: 70%+ coverage for reusable components
- **Integration Tests**: Critical user flows covered
- **E2E Tests**: All critical paths covered

---

## 🐛 Known Issues & Limitations

Document any known issues or limitations discovered during testing:

- [ ] Issue 1: [Description]
- [ ] Issue 2: [Description]
- [ ] Issue 3: [Description]

---

## ✅ Testing Sign-off

**Testing Completed By:** [Name]
**Date:** [Date]
**Environment:** [Development/Staging/Production]
**Browser/Device:** [List tested browsers/devices]

**Sign-off:**
- [ ] All automated tests pass
- [ ] All manual tests pass
- [ ] All critical flows tested
- [ ] Performance acceptable
- [ ] Security verified
- [ ] Accessibility verified
- [ ] Ready for production deployment

---

## 📚 Related Documentation

- **Testing Guide**: `docs/TESTING.md`
- **Production Deployment Checklist**: `docs/PRODUCTION_DEPLOYMENT_CHECKLIST.md`
- **Deployment Guide**: `docs/DEPLOYMENT.md`
- **E2E Tests**: `e2e/README.md`

---

**Status**: Ready for Testing

**Last Updated**: 2025-01-15

