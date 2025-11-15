# Features & Components to Document

ეს დოკუმენტაცია აჩვენებს რა ფუნქციები, გვერდები და კომპონენტები უნდა დოკუმენტირებული იყოს `docs/features/` დირექტორიაში.

---

## ✅ უკვე დოკუმენტირებული

### Phase 1 (Foundation) - ✅ დასრულებული

1. ✅ **Authentication System** - `docs/features/authentication.md`
2. ✅ **Landing Page** - `docs/features/landing-page.md`
3. ✅ **Sign Up / Sign In Pages** - `docs/features/auth-pages.md`
4. ✅ **Header / Navigation** - `docs/features/header-navigation.md`
5. ✅ **Form Components** - `docs/features/form-components.md`
6. ✅ **Button Component** - `docs/features/button-component.md`
7. ✅ **Card Component** - `docs/features/card-component.md`
8. ✅ **Loading States** - `docs/features/loading-states.md`
9. ✅ **Error States & Empty States** - `docs/features/error-states.md`
10. ✅ **i18n Language Switcher** - `docs/features/i18n-language-switcher.md`

### Phase 2+ (In Progress / Planned)

11. ✅ **Feed Page** - `docs/features/feed-page.md` (Phase 2)
12. ✅ **Admin Dashboard** - `docs/features/admin-dashboard.md` (Phase 3+)
13. ✅ **Profile Page** - `docs/features/profile-page.md`

---

## 📄 გვერდები (Pages) - უნდა დოკუმენტირებული იყოს

### Phase 1 (Foundation) - ✅ დასრულებული

1. ✅ **Landing Page / Home Page** (`/`) - `docs/features/landing-page.md`
2. ✅ **Sign Up Page** (`/signup`) - `docs/features/auth-pages.md`
3. ✅ **Sign In Page** (`/signin`) - `docs/features/auth-pages.md`

### Phase 2 (Core Features)

4. ✅ **Feed Page** (`/feed`) - `docs/features/feed-page.md`
   - Route: `/feed`
   - Features: Stories list, Pagination (Load More), Story/Post cards display
   - Components: StoryCard, PostCard, FeedContent, FeedControls
   - Status: MVP - Phase 2

5. ✅ **Create Story Page** (`/create`) - `docs/features/create-story-page.md`
   - Route: `/create`
   - Features: Root story creation, Branch node creation (A/B choices), Media upload (9:16 aspect), Story validation
   - Components: RootStoryForm, BranchNodesForm, MediaUploader, BranchCreator
   - Status: MVP - Phase 2 (Core BranchFeed feature)

6. ✅ **Story Detail Page** (`/story/[id]`) - `docs/features/story-detail-page.md`
   - Route: `/story/[id]` (dynamic route)
   - Features: Story player with A/B choices, Path progress indicator, Path tracking, Like/Comment/Share
   - Components: StoryPlayer, ChoiceButtons, PathProgress, InteractionButtons
   - Status: MVP - Phase 2 (Core BranchFeed feature)

7. ✅ **Post Detail Page** (`/post/[id]`) - `docs/features/post-detail-page.md`
   - Route: `/post/[id]` (dynamic route)
   - Features: Regular post display, Like/Comment/Share
   - Components: PostCard, InteractionButtons
   - Status: Phase 3+ (Regular Posts Feature)

8. ✅ **Settings Page** (`/settings`) - `docs/features/settings-page.md`
   - Route: `/settings`
   - Features: User settings, Profile editing, Language preference
   - Components: Settings form, Profile editor
   - Status: MVP - Phase 2

---

## 🧩 კომპონენტები (Components) - უნდა დოკუმენტირებული იყოს

### UI Components (Basic) - Phase 1 ✅ დასრულებული

1. ✅ **Button Component** - `docs/features/button-component.md`
2. ✅ **Card Component** - `docs/features/card-component.md`
3. ✅ **Form Components** - `docs/features/form-components.md`
4. ✅ **Loading States** - `docs/features/loading-states.md`
5. ✅ **Error States & Empty States** - `docs/features/error-states.md`
6. ✅ **Header / Navigation** - `docs/features/header-navigation.md`

### UI Components (Additional) - Phase 2+

7. ✅ **Modal Component** - `docs/features/modal-component.md`
   - Features: Basic modal, Close button, Overlay, Focus trap
   - Location: `src/components/ui/Modal.tsx`

### BranchFeed-Specific Components (Core) - Phase 2 ✅ დასრულებული

7. ✅ **Story Player Component** - `docs/features/story-player-component.md`
   - Features: Interactive story player, Media display (9:16), Loading/Error states
   - Location: `src/components/StoryPlayer.tsx`
   - Priority: 🔴 Critical

8. ✅ **Choice Buttons Component** - `docs/features/choice-buttons-component.md`
   - Features: A/B choice buttons with gradient styling, Hover effects, Disabled states
   - Location: `src/components/ChoiceButtons.tsx`
   - Priority: 🔴 Critical

9. ✅ **Path Progress Component** - `docs/features/path-progress-component.md`
   - Features: Progress bar showing "Step X of Y", Path sequence display
   - Location: `src/components/PathProgress.tsx`
   - Priority: 🔴 Critical

10. ✅ **Branch Creator Component** - `docs/features/branch-creator-component.md`
    - Features: Create branch nodes, Add A/B choices, Set media for each choice
    - Location: `src/components/BranchCreator.tsx`
    - Priority: 🔴 Critical

### Interaction Components

11. ✅ **Like/React Component** - `docs/features/like-react-system.md`
    - Features: Like button, Like count, Toggle like, Optimistic updates
    - Status: ✅ დოკუმენტირებულია (Like/React System-ში)
    - Location: `src/components/LikeButton.tsx`

12. ✅ **Comment Component** - `docs/features/comment-system.md`
    - Features: Comment form, Comment list, Comment display, Reply functionality (optional for MVP)
    - Status: ✅ დოკუმენტირებულია (Comment System-ში)
    - Location: `src/components/CommentSection.tsx`, `src/components/Comment.tsx`

13. ✅ **Share Component** - `docs/features/share-system.md`
    - Features: Share button, Copy link with path, Share modal
    - Status: ✅ დოკუმენტირებულია (Share System-ში)
    - Location: `src/components/ShareButton.tsx`

### Media Components

14. ✅ **Media Uploader Component** - `docs/features/media-upload-system.md`
    - Features: Image upload, Video upload, 9:16 aspect ratio validation, Preview
    - Status: ✅ დოკუმენტირებულია (Media Upload System-ში)
    - Location: `src/components/MediaUploader.tsx`

15. ✅ **Media Display Component** - `docs/features/media-display-component.md`
    - Features: Image display, Video display, 9:16 aspect ratio, Responsive sizing
    - Status: ✅ დოკუმენტირებულია
    - Location: `src/components/MediaDisplay.tsx`

---

## 🔧 ფუნქციები (Features) - უნდა დოკუმენტირებული იყოს

### Authentication Features - Phase 1 ✅ დასრულებული

1. ✅ **Authentication System** - `docs/features/authentication.md`

### Branching Features (Core BranchFeed) - Phase 2 ✅ დასრულებული

2. ✅ **Branching Stories System** - `docs/features/branching-stories-system.md`
   - Features: Root story creation, Branch node creation, Story tree structure, Max depth (5 steps)
   - Location: `src/lib/stories.ts`, `src/hooks/useStory.ts`
   - Priority: 🔴 Critical (Phase 2 - Core feature!)

3. ✅ **Path Tracking System** - `docs/features/path-tracking-system.md`
   - Features: Track user journey, Save path sequence, Path loading, Completion tracking
   - Location: `src/lib/paths.ts`, `src/hooks/usePathTracking.ts`
   - Priority: 🔴 Critical (Phase 2)

### Interaction Features - Phase 2 ✅ დასრულებული

4. ✅ **Like/React System** - `docs/features/like-react-system.md`
   - Features: Like stories/posts, Unlike, Like count, Optimistic updates
   - Location: `src/lib/likes.ts`, `src/hooks/useLike.ts`
   - Priority: 🟡 High (Phase 2)

5. ✅ **Comment System** - `docs/features/comment-system.md`
   - Features: Add comments, View comments, Delete own comments, Comment count
   - Location: `src/lib/comments.ts`, `src/hooks/useComment.ts`
   - Priority: 🟡 High (Phase 2)

6. ✅ **Share System** - `docs/features/share-system.md`
   - Features: Copy link, Share with path, Share modal
   - Location: `src/lib/share.ts`, `src/hooks/useShare.ts`
   - Priority: 🟢 Medium (Phase 2)

### Media Features - Phase 2 ✅ დასრულებული

7. ✅ **Media Upload System** - `docs/features/media-upload-system.md`
   - Features: Image upload to Supabase Storage, Video upload, 9:16 aspect validation, Media preview
   - Location: `src/lib/storage.ts`, `src/hooks/useMediaUpload.ts`
   - Priority: 🔴 Critical (Phase 2)

---

## 📊 პრიორიტეტების სია

### 🔴 Critical Priority (Phase 1-2)

**Phase 1 - ✅ დასრულებული:**
- ✅ Authentication System
- ✅ Landing Page
- ✅ Sign Up/Sign In Pages
- ✅ Form Components
- ✅ Header/Navigation
- ✅ Button Component
- ✅ Card Component
- ✅ Loading States
- ✅ Error States

**Phase 2 - ✅ დასრულებული:**
- ✅ Feed Page
- ✅ Create Story Page
- ✅ Story Detail Page
- ✅ Story Player Component
- ✅ Choice Buttons Component
- ✅ Path Progress Component
- ✅ Branch Creator Component
- ✅ Branching Stories System
- ✅ Path Tracking System

**Phase 2 - In Progress:**
- ✅ **Media Upload System** - Phase 2 (🔴 Critical) - დასრულებული
- ✅ **Like/React System** - Phase 2 (🟡 High) - დასრულებული
- ✅ **Comment System** - Phase 2 (🟡 High) - დასრულებული

### 🟡 High Priority (Phase 2) - ✅ დასრულებული

- ✅ **Like/React System** - Phase 2 - დასრულებული
- ✅ **Comment System** - Phase 2 - დასრულებული

### 🟢 Medium Priority (Phase 2-3) - ✅ დასრულებული

- ✅ **Share System** - Phase 2 - დასრულებული
- ✅ **Settings Page** - Phase 2 - დასრულებული
- ✅ **Post Detail Page** - Phase 3+ - დასრულებული
- ✅ **Modal Component** - Phase 2 - დასრულებული

---

## 📝 დოკუმენტაციის შაბლონი

თითოეული feature/page/component-ისთვის უნდა შეიქმნას `docs/features/[feature-name].md` ფაილი შემდეგი სტრუქტურით:

```markdown
# [Feature Name] - BranchFeed

## 📋 Overview
- რა არის ეს feature/page/component
- რა არის მისი მიზანი
- Route (თუ page-ია) ან Location (თუ component-ია)

## 🎯 Features
- ძირითადი ფუნქციები
- რა უნდა გააკეთოს

## 📐 Layout / Structure
- Page layout (თუ page-ია)
- Component structure (თუ component-ია)
- ASCII diagram

## 🎨 UI Components
- რა UI კომპონენტები გამოიყენება
- UI styles (UI_STYLE_GUIDE.md-სთან კავშირი)

## 🔧 Implementation
- კოდის მაგალითები
- API calls
- Hooks
- Functions

## 📊 Database Schema
- რა ცხრილები გამოიყენება
- RLS policies (თუ საჭიროა)

## 🌐 Internationalization (i18n)
- Translation keys
- რა ტექსტები უნდა იყოს translatable

## ✅ Requirements Checklist
- [ ] Task 1
- [ ] Task 2
- ...

## 🔄 Future Enhancements
- რა შეიძლება დაემატოს მომავალში

## 📝 Notes
- მნიშვნელოვანი შენიშვნები
- Phase/Priority ინფორმაცია
```

---

## 🎯 რეკომენდაცია

**დოკუმენტაციის რიგითობა (პრიორიტეტის მიხედვით):**

1. **Phase 1 (Foundation):** ✅ დასრულებული
   - ✅ Authentication System
   - ✅ Landing Page
   - ✅ Sign Up/Sign In Pages
   - ✅ Form Components
   - ✅ Header/Navigation
   - ✅ Button Component
   - ✅ Card Component
   - ✅ Loading States
   - ✅ Error States

2. **Phase 2 (Core BranchFeed Features):**
   - ✅ Story Player Component ⭐ (Core!) - დასრულებული
   - ✅ Branching Stories System ⭐ (Core!) - დასრულებული
   - ✅ Path Tracking System ⭐ (Core!) - დასრულებული
   - ✅ Create Story Page ⭐ (Core!) - დასრულებული
   - ✅ Story Detail Page ⭐ (Core!) - დასრულებული
   - ✅ Choice Buttons Component ⭐ (Core!) - დასრულებული
   - ✅ Path Progress Component ⭐ (Core!) - დასრულებული
   - ✅ Branch Creator Component ⭐ (Core!) - დასრულებული
   - ✅ Feed Page - დასრულებული
   - ✅ Media Upload System - 🔴 Critical - დასრულებული
   - ✅ Like/React System - 🟡 High - დასრულებული
   - ✅ Comment System - 🟡 High - დასრულებული

3. **Phase 2-3 (Polish):** ✅ დასრულებული
   - ✅ Share System - დასრულებული
   - ✅ Settings Page - დასრულებული
   - ✅ Post Detail Page - დასრულებული
   - ✅ Modal Component - დასრულებული
   - ✅ Loading States - დასრულებული

---

**Last Updated**: 2025-01-XX  
**Status**: Planning document - Use this to track what needs to be documented

