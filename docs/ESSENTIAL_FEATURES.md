# Essential Features Only - Filtered from BranchFeed

ეს დოკუმენტაცია აჩვენებს რა ფუნქციები არის ძირითადი (MVP) და რა უნდა ამოიღოთ.

---

## ✅ Essential Features (Keep)

### 1. Authentication

- ✅ Email/Password or Magic Link
- ✅ User session management
- ✅ Protected routes
- ✅ User profile creation

### 2. Posts

- ✅ Create posts (title, description, media)
- ✅ View posts (Feed page)
- ✅ Post detail page
- ✅ Delete own posts

### 3. Media

- ✅ Image upload
- ✅ Video upload (optional - can start with images only)
- ✅ Media display
- ✅ Media validation

### 4. Basic Interactions

- ✅ Like/React
- ✅ Comments
- ✅ View count
- ✅ Share (basic - copy link)

### 5. User Profile

- ✅ View profile
- ✅ Edit profile (username, bio, avatar)
- ✅ View user's posts

### 6. Branching Stories (Core BranchFeed Feature)

- ✅ Root story creation (starting point of branching narrative)
- ✅ Branch node creation (A/B choices at each step)
- ✅ Story tree structure (stories + nodes relationship)
- ✅ Max depth limit (3-5 steps maximum per path)
- ✅ Path tracking (user's journey through branches)
- ✅ Story player with A/B choice buttons
- ✅ Path progress indicator (Step X of Y)
- ✅ Next node loading based on user choice
- ✅ Path history (user can see their chosen path)

**How Branching Works:**

1. **Root Story**: Creator creates initial story post (video/image/text)
2. **Branch Nodes**: Creator adds 2 choices (A/B) that lead to different paths
3. **User Choice**: User selects A or B, sees next node in that path
4. **Path Depth**: Maximum 3-5 steps per path (prevents infinite branching)
5. **Path Tracking**: System tracks which path user took (e.g., A → B → A)
6. **Story Completion**: User reaches end of path or max depth

**Example Flow:**
```
Root: "What should I eat today?"
  ├─ Choice A: "Pizza" → Node A1: "Pizza video"
  │                      └─ Choice A: "Pepperoni" → Node A2: "Pepperoni video"
  │                      └─ Choice B: "Margherita" → Node A3: "Margherita video"
  │
  └─ Choice B: "Salad" → Node B1: "Salad video"
                        └─ Choice A: "Caesar" → Node B2: "Caesar video"
                        └─ Choice B: "Greek" → Node B3: "Greek video"
```

---

## ❌ Non-Essential Features (Remove)

### Advanced Feed Features

- ❌ Multiple feed types (For You, Trending, Following)
- ❌ Advanced filtering
- ❌ Time-based filters
- ❌ Hashtag filters
- ❌ Real-time updates (can add later)
- ❌ Infinite scroll (pagination is enough for MVP)

### Premium Features

- ❌ Premium subscriptions
- ❌ Link restrictions
- ❌ Advanced analytics
- ❌ Ad-free experience
- ❌ Multiple subscription tiers

### Social Features

- ❌ Followers/Following (unless core feature)
- ❌ User search
- ❌ User recommendations
- ❌ Social sharing (basic copy link is enough)

### Advanced UI

- ❌ Video autoplay on scroll
- ❌ Image lightbox (can add later)
- ❌ Keyboard shortcuts
- ❌ Advanced animations
- ❌ Dark/light theme toggle

### Internationalization (i18n)

- ✅ Language switcher button (REQUIRED)
- ✅ Supported languages: Georgian (ka), English (en), German (de), Russian (ru), French (fr)
- ✅ Language selection in header/navigation
- ✅ Language persistence (localStorage)

### Admin Features

- ❌ Admin dashboard
- ❌ Content moderation
- ❌ User management
- ❌ Analytics dashboard
- ❌ Ad management

### Other Features

- ❌ Chat system
- ❌ Stories
- ❌ Advanced search
- ❌ Notifications (can add later)
- ❌ Email notifications
- ❌ Push notifications

---

## 📊 Simplified Feature List

### MVP Features (Must Have)

1. **Authentication** - Sign up, sign in, sign out
2. **Create Branching Stories** - Root story + branch nodes with A/B choices
3. **Story Player** - Interactive player with A/B choice buttons
4. **View Stories** - Feed page with branching stories
5. **Path Tracking** - Track user's journey through branches
6. **Basic Interactions** - Like, comment, share
7. **User Profile** - View and edit profile

### Phase 2 Features (Add After MVP)

1. **Search** - Basic search functionality
2. **Notifications** - Basic notifications
3. **Follow System** - If social features are core
4. **Advanced UI** - Animations, lightbox, etc.

### Phase 3 Features (Nice to Have)

1. **Premium Features** - If monetization is needed
2. **Admin Dashboard** - If admin features are needed
3. **Advanced Analytics** - If analytics are needed

---

## 🎯 Simplified Database Schema

### Essential Tables Only

```sql
-- Users/Profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE,
  username TEXT UNIQUE,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP
);

-- Stories (Root stories - starting points of branching narratives)
CREATE TABLE stories (
  id UUID PRIMARY KEY,
  author_id UUID REFERENCES profiles(id),
  title TEXT,
  description TEXT,
  media_url TEXT, -- image or video
  media_type TEXT, -- 'image' or 'video'
  max_depth INTEGER DEFAULT 5, -- Maximum path depth (3-5 steps)
  created_at TIMESTAMP
);

-- Story Nodes (Branch points in the story tree)
CREATE TABLE story_nodes (
  id UUID PRIMARY KEY,
  story_id UUID REFERENCES stories(id),
  parent_node_id UUID REFERENCES story_nodes(id), -- NULL for root node
  choice_label TEXT, -- "A" or "B" or custom label
  content TEXT, -- Text content for this node
  media_url TEXT, -- Image or video for this node
  media_type TEXT, -- 'image' or 'video'
  depth INTEGER, -- Current depth in tree (0 = root, 1 = first choice, etc.)
  created_at TIMESTAMP
);

-- User Paths (Tracks user's journey through branching story)
CREATE TABLE user_paths (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  story_id UUID REFERENCES stories(id),
  path_sequence TEXT, -- JSON array: ["A", "B", "A"] or ["root", "A", "B"]
  current_node_id UUID REFERENCES story_nodes(id),
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Posts (Regular posts without branching - can be used for non-branching content)
CREATE TABLE posts (
  id UUID PRIMARY KEY,
  author_id UUID REFERENCES profiles(id),
  title TEXT,
  description TEXT,
  image_url TEXT,
  video_url TEXT,
  created_at TIMESTAMP
);

-- Likes (Works for both stories and posts)
CREATE TABLE likes (
  id UUID PRIMARY KEY,
  story_id UUID REFERENCES stories(id), -- Can be NULL if liking a post
  post_id UUID REFERENCES posts(id), -- Can be NULL if liking a story
  user_id UUID REFERENCES profiles(id),
  created_at TIMESTAMP,
  UNIQUE(story_id, user_id) WHERE story_id IS NOT NULL,
  UNIQUE(post_id, user_id) WHERE post_id IS NOT NULL
);

-- Comments (Works for both stories and posts)
CREATE TABLE comments (
  id UUID PRIMARY KEY,
  story_id UUID REFERENCES stories(id), -- Can be NULL if commenting on post
  post_id UUID REFERENCES posts(id), -- Can be NULL if commenting on story
  node_id UUID REFERENCES story_nodes(id), -- Optional: comment on specific node
  user_id UUID REFERENCES profiles(id),
  content TEXT,
  created_at TIMESTAMP
);
```

> 📝 **Note**: Branching schema is described above. For detailed database design, see `docs/DATABASE.md` (to be created). This file covers the essential MVP schema including branching stories structure.

### Removed Tables (Not in MVP)

- ❌ `follows` (unless core feature)
- ❌ `notifications` (can add later)
- ❌ `subscriptions` (unless core feature)
- ❌ `ads` (unless core feature)
- ❌ `stories` (unless core feature)
- ❌ `chat_rooms` (unless core feature)

---

## 📱 Simplified Pages

### Essential Pages Only

1. **`/`** - Landing page
2. **`/signin`** - Sign in page
3. **`/signup`** - Sign up page
4. **`/feed`** - Feed page (stories list)
5. **`/create`** - Create story page (with branching)
6. **`/story/[id]`** - Story detail page with branching player
7. **`/post/[id]`** - Post detail page (for non-branching posts)
8. **`/profile/[id]`** - User profile page
9. **`/settings`** - User settings page

### Removed Pages (Not in MVP)

- ❌ `/admin` - Admin dashboard
- ❌ `/premium` - Premium page
- ❌ `/chat` - Chat page
- ❌ `/stories` - Stories page
- ❌ `/discover` - Discover page (can merge with feed)
- ❌ `/trending` - Trending page (can merge with feed)
- ❌ `/search` - Search page (can add later)

---

## 🎨 Simplified UI Components

### Essential Components Only

1. **Button** - Button component with variants (Primary, Secondary, Outline, Ghost, Danger)
2. **Card** - Story card component
3. **Form** - Form components (input, textarea, select)
4. **Modal** - Basic modal component
5. **Story Player** - Interactive story player with A/B choice buttons
6. **Choice Buttons** - Branch choice buttons (A/B) with gradient styling
7. **Path Progress** - Progress bar showing current step in path
8. **Header** - Navigation header with language switcher
9. **Loading** - Loading spinner/skeleton
10. **Language Switcher** - Language selection button (Georgian, English, German, Russian, French)

### Removed Components (Not in MVP)

- ❌ `AdComponent` - Ad component
- ❌ `StoriesBar` - Stories bar
- ❌ `ChatRoom` - Chat room
- ❌ `AdminDashboard` - Admin dashboard
- ❌ `PremiumUpsell` - Premium upsell
- ❌ `ImageLightbox` - Image lightbox (can add later)
- ❌ `VideoPlayer` - Advanced video player (basic HTML5 video is enough)

---

## 🚀 Simplified Tech Stack

### Essential Only

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: Supabase PostgreSQL
- **Styling**: Tailwind CSS
- **Auth**: Supabase Auth
- **Storage**: Supabase Storage

### Removed (Not Needed for MVP)

- ❌ Framer Motion (can add later)
- ❌ Advanced animation libraries
- ❌ Complex state management (Context API is enough)
- ❌ Multiple UI libraries (stick to one)

---

## ✅ MVP Checklist

### Phase 1: Foundation

- [ ] Database setup (users, stories, story_nodes, user_paths, likes, comments)
- [ ] Authentication (sign up, sign in, sign out)
- [ ] Basic UI components (button, card, form, choice buttons)
- [ ] Landing page

### Phase 2: Core Features

- [ ] Create branching stories (root story + branch nodes)
- [ ] Story player component with A/B choice buttons
- [ ] Path tracking system (user journey through branches)
- [ ] View stories (Feed page)
- [ ] Story detail page with branching
- [ ] Path progress indicator (Step X of Y)
- [ ] Like functionality
- [ ] Comment functionality
- [ ] User profile page

### Phase 3: Polish

- [ ] Error handling
- [ ] Loading states
- [ ] Responsive design
- [ ] Basic testing

---

## 📝 Notes

- **Start Simple**: Build MVP first, add features later
- **One Feature at a Time**: Complete one feature fully before starting another
- **Test as You Go**: Don't wait until the end to test
- **Document as You Go**: Update documentation when you add features
- **Remove Complexity**: If a feature adds too much complexity, remove it from MVP

---

## 🔄 How This MVP Relates to Full BranchFeed Vision

This MVP document defines the **essential features only** for BranchFeed's initial release. It focuses on:

1. **Core Branching**: Basic branching stories with A/B choices (3-5 steps max)
2. **Essential Features**: Authentication, stories, interactions, profiles
3. **Simplified Scope**: Removed advanced features (analytics, premium, admin, etc.)

**What's Included:**
- ✅ Branching stories (core feature)
- ✅ Story player with choices
- ✅ Path tracking
- ✅ Basic interactions (like, comment, share)
- ✅ User profiles

**What's Excluded (for MVP):**
- ❌ Advanced analytics
- ❌ Premium features
- ❌ Admin dashboard
- ❌ Complex filtering
- ❌ Multiple feed types

**Full Vision**: See `docs/PROJECT_OVERVIEW.md` for complete BranchFeed vision and future features.

**Priority Order**: See `docs/PROJECT_PRIORITIES.md` for detailed phase-by-phase implementation plan.

# Essential Features

> Updates (2025-01)
>
> - Deployment Pipeline: Vercel + GitHub CI; preview deployments for PRs; protected envs.
> - Global Error Page: Provide `/error` route + `app/error.tsx` boundary; consistent UX/messages.
> - Toast Notifications: Standardize `Toast` component and usage guidelines (success/error/info) with i18n keys.
> - Timeline Estimates: Per phase high-level estimates for planning.

## Deployment Pipeline (MVP)
- Host on Vercel; auto-deploy `main` to production, branches to preview.
- Required checks: build, lint, basic smoke tests.
- Secrets via Vercel env; no secrets in repo.

## Global Error Page & Boundary
- `app/error.tsx` handles runtime errors with reset.
- `/error` static page for fallback navigation.
- Log non-PII details; guide users to retry or contact.

## Toast Component
- Variants: `success`, `error`, `info`.
- Usage: short messages (<80 chars), auto-dismiss 3–5s, accessible (role="status").
- i18n: `toast.common.saved`, `toast.common.failed`.

## Timeline (Estimates)
- Phase 1 (Foundation): 2–3 weeks
- Phase 2 (Core Features): 3–4 weeks
- Phase 3 (Growth/Settings): 3–5 weeks
- Phase 4 (Expansion): 4+ weeks (analytics, monetization)