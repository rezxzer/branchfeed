# Project Priorities - Essential Features Only

ეს დოკუმენტაცია განსაზღვრავს პროექტის პრიორიტეტებს - მხოლოდ ძირითადი ფუნქციები, ზედმეტების გარეშე.

> 📖 **Detailed MVP scope described in `docs/ESSENTIAL_FEATURES.md`** – this file only defines priority order.

---

## 🎯 Core Principles

1. **MVP First**: Build minimum viable product first
2. **Essential Only**: Remove all non-essential features
3. **One Feature at a Time**: Complete one feature before starting another
4. **Document as You Go**: Document each feature when completed

---

## ✅ Phase 1: Foundation (Weeks 1-2)

### Database Setup

- [x] Users/Profiles table
- [x] Stories table (core BranchFeed feature - branching narratives)
- [x] Story nodes table (branch points)
- [x] User story progress table (path tracking)
- [x] Likes table
- [x] Comments table
- [x] Basic relationships (user → stories → nodes)
- [x] RLS policies (with `do $$ ... end $$;` block syntax)
- [x] Indexes for performance
- [x] Triggers (likes count, updated_at timestamps)
- [x] Profile creation trigger (automatic on signup)

### Authentication

- [x] Email/Password sign up
- [x] Email/Password sign in
- [x] Sign out
- [x] User session management
- [x] Protected routes (server-side)
- [x] User profile creation (automatic via database trigger)

### Basic UI Components

- [x] Header/Navigation
- [x] Button component (Primary, Secondary, Outline, Ghost, Danger variants)
- [x] Card component
- [x] Form components (Input, Textarea, Label)
- [ ] Select component (not yet created - needed for Phase 2)
- [x] Loading states (Spinner)
- [ ] Skeleton loader (not yet created - Phase 3)
- [x] Error states
- [x] Language switcher button (5 languages: Georgian, English, German, Russian, French)

### Landing Page

- [x] Home page
- [x] Sign up / Sign in pages
- [x] Basic routing

**Status**: ✅ **COMPLETED** (2025-01-15)

**Notes:**
- All Phase 1 features implemented and tested
- Build passing, TypeScript no errors, linting passed
- See `docs/PROJECT_STATUS.md` for detailed status and known issues
- Profile creation trigger migration applied to Supabase

---

## ✅ Phase 2: Core Features (Weeks 3-4)

### Branching Model (Core BranchFeed Feature)

- [x] Story/Post branching structure (stories + nodes)
- [x] Branch node creation (A/B choices)
- [x] Path tracking system
- [x] Path depth limit (3-5 steps max)
- [x] Story tree visualization (basic)

### Story Player with A/B Choices

- [x] Story player component
- [x] A/B choice buttons (see UI_STYLE_GUIDE.md)
- [x] Path progress bar (Step X of Y)
- [x] Branch selection handling
- [x] Next story node loading
- [x] Path history tracking

### Create Posts (Branching Stories)

- [x] Create story page
- [x] Story form (title, description, media)
- [x] Media upload (images/videos, 9:16 aspect)
- [x] Branch creation (add A/B choices)
- [x] Story validation
- [x] Story creation API

### View Posts (Feed)

- [x] Feed page
- [x] Story card component (see UI_STYLE_GUIDE.md)
- [x] Story list display
- [x] Infinite scroll (basic)
- [x] Story detail page with branching
- [x] Path viewer (see all paths)

### Basic Interactions

- [x] Like/React functionality
- [x] Comment functionality
- [x] View count
- [x] Share button (basic - copy link with path)

**Status**: ✅ **COMPLETED** (2025-01-15)

---

## ✅ Phase 3: Polish (Weeks 5-6)

### Error Handling

- [x] User-friendly error messages
- [x] Error boundaries
- [x] Retry mechanisms
- [x] Network error handling

### Loading States

- [x] Skeleton loaders
- [x] Loading spinners
- [x] Progress indicators ✅ (Completed 2025-01-15)

### Responsive Design

- [x] Mobile layout
- [x] Tablet layout
- [x] Desktop layout
- [x] Touch interactions ✅ (Completed 2025-01-15)

### Basic Testing

- [x] Component tests
- [x] Integration tests
- [x] E2E tests (critical flows) ✅ (Completed 2025-01-15 - Playwright setup)

**Status**: ✅ **COMPLETED** (2025-01-15)
**Completed**: Error Handling ✅, Loading States ✅, Responsive Design ✅, Testing ✅

---

## ❌ Features to REMOVE (Not in MVP)

### Advanced Features (Remove for MVP)

- ❌ Advanced analytics
- ❌ Complex filtering (multiple filter types)
- ❌ Multiple feed types (For You, Trending, Following)
- ❌ Premium features (unless core to MVP)
- ❌ Admin dashboard (unless needed)
- ❌ Chat system (unless core feature)
- ❌ Stories (unless core feature)
- ❌ Advanced search (basic search is enough)
- ❌ Multiple subscription tiers (one tier is enough)
- ❌ Ad management system
- ❌ Complex moderation tools
- ❌ Advanced notifications
- ❌ Social features (followers, following - unless core)

### Nice-to-Have (Add Later)

- ⏳ Video autoplay on scroll
- ⏳ Image lightbox
- ⏳ Link restrictions
- ⏳ Keyboard shortcuts
- ⏳ Advanced animations
- ⏳ Dark/light theme toggle

---

## 📊 Priority Matrix

| Feature                | Priority    | Phase | Status |
| ---------------------- | ----------- | ----- | ------ |
| Database Setup         | 🔴 Critical | 1     | ⬜     |
| Authentication         | 🔴 Critical | 1     | ⬜     |
| Branching Model        | 🔴 Critical | 2     | ⬜     |
| Story Player (A/B)     | 🔴 Critical | 2     | ⬜     |
| Create Stories         | 🔴 Critical | 2     | ⬜     |
| View Stories (Feed)    | 🔴 Critical | 2     | ⬜     |
| Like/React             | 🟡 High     | 2     | ⬜     |
| Comments               | 🟡 High     | 2     | ⬜     |
| Error Handling         | 🟡 High     | 3     | ⬜     |
| Loading States         | 🟢 Medium   | 3     | ⬜     |
| Responsive Design      | 🟢 Medium   | 3     | ⬜     |
| Testing                | 🟢 Medium   | 3     | ⬜     |

---

## 🚫 What NOT to Build (Yet)

### Don't Build These Until MVP is Complete:

- Advanced search
- Multiple feed types
- Premium features
- Admin dashboard
- Chat system
- Stories
- Analytics dashboard
- Complex filtering
- Social features (unless core)

### Why?

- **Focus**: MVP should be simple and focused
- **Time**: These features take time away from core functionality
- **Complexity**: They add unnecessary complexity
- **Testing**: More features = more testing needed

---

## ✅ Definition of Done

A feature is "Done" when:

- [ ] Code is written and tested
- [ ] TypeScript errors are fixed
- [ ] Linting passes
- [ ] Documentation is updated
- [ ] Feature works in browser
- [ ] Error handling is implemented
- [ ] Loading states are added

---

## 📝 Notes

- **Start with Phase 1**: Don't skip to Phase 2 until Phase 1 is complete
- **One Feature at a Time**: Complete one feature fully before starting another
- **Test as You Go**: Don't wait until the end to test
- **Document as You Go**: Update documentation when you add features
- **Ask Questions**: If unsure if a feature is essential, check this document first
- **BranchFeed Core**: Remember - branching stories are the core feature, not just regular posts with comments

---

## 📚 Related Documentation

- **`docs/ESSENTIAL_FEATURES.md`**: Detailed MVP scope and feature list
- **`docs/PROJECT_OVERVIEW.md`**: Full BranchFeed concept and vision
- **`docs/UI_STYLE_GUIDE.md`**: BranchFeed-specific UI components (Choice Buttons, Story Cards)

---

## 🔄 Updates

- **Last Updated**: [Date]
- **Next Review**: [Date]
- **Changes**: Log all priority changes here
