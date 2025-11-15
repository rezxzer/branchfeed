# System Architecture - BranchFeed

ეს დოკუმენტაცია აღწერს BranchFeed-ის სისტემის არქიტექტურას, tech stack-ს, project structure-ს, data flow-ს და key architectural decisions-ებს.

**Last Updated**: 2025-01-15

---

## 🛠️ Tech Stack

### Frontend

- **Framework**: Next.js 15 (App Router)
  - Server Components by default
  - Client Components for interactivity (`'use client'`)
  - File-based routing
  - Built-in API routes (not used - using Supabase directly)
- **Language**: TypeScript 5.5+
  - Strict mode enabled
  - Path aliases: `@/*` → `./src/*`
- **Styling**: Tailwind CSS 3.4+
  - Utility-first CSS
  - Custom design tokens (colors, gradients, shadows)
  - Responsive design (mobile-first)
- **UI Components**: Custom components built with Tailwind
  - Reusable components in `src/components/ui/`
  - Feature-specific components in `src/components/[feature]/`

### Backend & Services

- **Database**: Supabase PostgreSQL
  - Row Level Security (RLS) policies
  - Real-time subscriptions
  - PostgreSQL functions and triggers
- **Authentication**: Supabase Auth
  - Email/Password authentication
  - Session management via cookies
  - Server-side and client-side auth helpers
- **Storage**: Supabase Storage
  - `stories` bucket for story media (images/videos)
  - `avatars` bucket for user profile pictures
  - Public read access, authenticated write access
- **API**: Direct Supabase client calls (no Next.js API routes)
  - Server-side: `createServerSupabaseClient`
  - Client-side: `createClientClient`

### Development Tools

- **Package Manager**: pnpm (workspace support)
- **Testing**:
  - Jest + React Testing Library (unit/component tests)
  - Playwright (E2E tests)
- **Linting**: ESLint (Next.js config)
- **Type Checking**: TypeScript compiler

---

## 📁 Project Structure

```
branch/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx            # Landing page (/)
│   │   ├── feed/               # Feed page (/feed)
│   │   ├── create/             # Story creation (/create)
│   │   ├── story/[id]/         # Story detail (/story/:id)
│   │   ├── profile/[id]/      # User profile (/profile/:id)
│   │   ├── settings/           # Settings page (/settings)
│   │   ├── signin/             # Sign in page (/signin)
│   │   ├── signup/             # Sign up page (/signup)
│   │   ├── layout.tsx          # Root layout
│   │   └── globals.css         # Global styles
│   │
│   ├── components/             # React components
│   │   ├── ui/                 # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Skeleton.tsx
│   │   │   └── ...
│   │   ├── feed/               # Feed-related components
│   │   ├── story/               # Story-related components
│   │   ├── create/             # Story creation components
│   │   ├── profile/            # Profile components
│   │   ├── settings/           # Settings components
│   │   └── landing/            # Landing page components
│   │
│   ├── lib/                    # Utilities and helpers
│   │   ├── supabase/           # Supabase client setup
│   │   │   ├── client.ts       # Client-side Supabase client
│   │   │   └── server.ts       # Server-side Supabase client
│   │   ├── auth.ts             # Authentication utilities
│   │   ├── stories.ts          # Story-related functions (client)
│   │   ├── stories.server.ts   # Story-related functions (server)
│   │   ├── likes.ts            # Like/unlike functions
│   │   ├── comments.ts         # Comment functions
│   │   ├── share.ts             # Share functions
│   │   ├── avatars.ts          # Avatar upload functions
│   │   └── utils.ts            # General utilities
│   │
│   ├── hooks/                  # Custom React hooks
│   │   ├── useAuth.ts          # Authentication hook
│   │   ├── useStory.ts         # Story data hook
│   │   ├── useFeed.ts          # Feed data hook
│   │   ├── useLike.ts          # Like functionality hook
│   │   ├── useComments.ts      # Comments hook
│   │   ├── usePathTracking.ts  # Path tracking hook
│   │   ├── useProfile.ts       # Profile data hook
│   │   ├── useCreateStory.ts   # Story creation hook
│   │   ├── useSwipe.ts         # Swipe gesture hook
│   │   └── useTranslation.ts   # i18n translation hook
│   │
│   ├── types/                  # TypeScript type definitions
│   │   ├── index.ts            # Core types (Story, Profile, etc.)
│   │   ├── create.ts           # Story creation types
│   │   └── jest-dom.d.ts       # Jest DOM matchers
│   │
│   └── middleware.ts           # Next.js middleware (session refresh)
│
├── supabase/
│   └── migrations/             # SQL migration files
│       ├── YYYYMMDD_description.sql
│       └── ...
│
├── e2e/                        # E2E tests (Playwright)
│   ├── auth.spec.ts
│   ├── story-creation.spec.ts
│   ├── story-interaction.spec.ts
│   └── profile.spec.ts
│
├── docs/                       # Documentation
│   ├── features/               # Feature documentation
│   ├── PROJECT_PRIORITIES.md
│   ├── PROJECT_STATUS.md
│   └── ...
│
├── .cursorrules                # Cursor AI rules
├── .env.example                # Environment variables template
├── next.config.js              # Next.js configuration
├── tailwind.config.js          # Tailwind configuration
├── tsconfig.json               # TypeScript configuration
└── package.json                # Dependencies and scripts
```

---

## 🎯 Key Architectural Decisions

### 1. Server Components by Default

**Decision**: Use Next.js Server Components by default, only use Client Components when needed.

**Rationale**:
- Better performance (less JavaScript sent to client)
- Better SEO (content rendered on server)
- Automatic code splitting
- Reduced bundle size

**When to use Client Components**:
- User interactions (onClick, onChange, etc.)
- Browser APIs (localStorage, window, etc.)
- React hooks (useState, useEffect, etc.)
- Real-time subscriptions

**Example**:
```typescript
// Server Component (default)
export default async function FeedPage() {
  const stories = await getStories() // Server-side data fetching
  return <FeedPageClient stories={stories} />
}

// Client Component (for interactivity)
'use client'
export function FeedPageClient({ stories }) {
  const [filter, setFilter] = useState('recent')
  // ... interactive logic
}
```

### 2. Direct Supabase Client Calls

**Decision**: Use Supabase client directly instead of Next.js API routes.

**Rationale**:
- Simpler architecture (no API layer)
- Better performance (direct database access)
- Type safety with Supabase TypeScript types
- Real-time subscriptions work out of the box

**Trade-offs**:
- RLS policies must be well-designed (security)
- Client-side code exposes Supabase URL and anon key (acceptable - public anyway)

### 3. Row Level Security (RLS) for All Tables

**Decision**: Enable RLS on all database tables and define policies for access control.

**Rationale**:
- Security at database level (defense in depth)
- Prevents unauthorized access even if application code has bugs
- Fine-grained access control per table

**Implementation**:
- All tables have RLS enabled
- Policies use `do $$ ... end $$;` block syntax (idempotent)
- Policies check `auth.uid()` for user identity

### 4. Optimistic Updates for Interactions

**Decision**: Update UI immediately before API confirmation for like/comment actions.

**Rationale**:
- Better user experience (instant feedback)
- Feels more responsive
- Rollback on error

**Example**:
```typescript
const handleLike = async () => {
  // Optimistic update
  setLiked(true)
  setLikeCount(prev => prev + 1)
  
  try {
    await likeStory(storyId)
  } catch (error) {
    // Rollback on error
    setLiked(false)
    setLikeCount(prev => prev - 1)
  }
}
```

### 5. Path Tracking in URL

**Decision**: Store story path in URL query parameter (`?path=A,B,A`) for shareable links.

**Rationale**:
- Deep linking support (share link with specific path)
- Browser back/forward navigation works
- Path can be restored from URL on page load

**Implementation**:
- Path stored in `usePathTracking` hook
- URL updated on each choice: `/story/:id?path=A,B`
- Path restored from URL on page load

### 6. Component-Based Architecture

**Decision**: Break UI into small, reusable components.

**Rationale**:
- Reusability
- Maintainability
- Testability
- Clear separation of concerns

**Component Hierarchy**:
```
Page (Server Component)
  └── PageClient (Client Component)
      ├── Feature Components
      │   ├── StoryPlayer
      │   ├── ChoiceButtons
      │   └── PathProgress
      └── UI Components
          ├── Button
          ├── Card
          └── Skeleton
```

---

## 🔄 Data Flow

### 1. Authentication Flow

```
User Action (Sign In)
  ↓
Client Component (SignInPage)
  ↓
useAuth hook → signIn()
  ↓
Supabase Auth API
  ↓
Session created → Cookie set
  ↓
Middleware refreshes session
  ↓
Protected route accessible
```

### 2. Story Creation Flow

```
User fills form (Client Component)
  ↓
useCreateStory hook
  ↓
Upload media to Supabase Storage
  ↓
Create story in database (stories table)
  ↓
Create branch nodes (story_nodes table)
  ↓
Redirect to story detail page
```

### 3. Story Viewing Flow

```
User navigates to /story/:id
  ↓
Server Component fetches story data
  ↓
StoryDetailPageClient renders
  ↓
useStory hook fetches nodes
  ↓
User makes choice (A or B)
  ↓
Path updated in URL and database
  ↓
Next node fetched and displayed
```

### 4. Feed Flow

```
User navigates to /feed
  ↓
Server Component checks auth
  ↓
FeedPageClient renders
  ↓
useFeed hook fetches stories
  ↓
Stories displayed in feed
  ↓
User scrolls → Load more (pagination)
  ↓
More stories fetched
```

---

## 🗄️ Database Architecture

### Core Tables

1. **profiles** - User profiles
   - `id` (UUID, FK → auth.users)
   - `username`, `bio`, `avatar_url`
   - `language_preference`

2. **stories** - Root stories
   - `id` (UUID, PK)
   - `author_id` (FK → profiles)
   - `title`, `description`
   - `media_url`, `media_type`
   - `max_depth` (default: 5)

3. **story_nodes** - Branch nodes
   - `id` (UUID, PK)
   - `story_id` (FK → stories)
   - `parent_id` (FK → story_nodes, nullable for root)
   - `choice_a_label`, `choice_a_content`, `choice_a_media_url`
   - `choice_b_label`, `choice_b_content`, `choice_b_media_url`
   - `depth` (0-5)

4. **user_story_progress** - Path tracking
   - `user_id` (FK → profiles)
   - `story_id` (FK → stories)
   - `path` (TEXT array: ['A', 'B', 'A'])
   - `current_node_id` (FK → story_nodes)
   - `completed` (BOOLEAN)

5. **likes** - Story likes
   - `user_id` (FK → profiles)
   - `story_id` (FK → stories)
   - Unique constraint on (user_id, story_id)

6. **comments** - Story comments
   - `id` (UUID, PK)
   - `user_id` (FK → profiles)
   - `story_id` (FK → stories)
   - `content` (TEXT)
   - `created_at` (TIMESTAMPTZ)

### Relationships

```
profiles (1) ──→ (many) stories
stories (1) ──→ (many) story_nodes
story_nodes (1) ──→ (many) story_nodes (parent-child)
stories (1) ──→ (many) user_story_progress
stories (1) ──→ (many) likes
stories (1) ──→ (many) comments
```

### RLS Policies

All tables have RLS enabled with policies:
- **Public read**: Anyone can read public content (stories, comments)
- **Authenticated write**: Only authenticated users can create/update
- **Owner write**: Users can only update/delete their own content

See `supabase/migrations/` for detailed policies.

---

## 🎨 Component Architecture

### UI Components (`src/components/ui/`)

Reusable, generic components:
- `Button` - Primary, Secondary, Outline, Ghost, Danger variants
- `Card` - Container with hover effects
- `Input` - Form input with label and error display
- `Textarea` - Multi-line text input
- `Skeleton` - Loading placeholder
- `Spinner` - Loading spinner
- `Progress` - Progress bar
- `Toast` - Notification system

### Feature Components

Feature-specific components organized by feature:
- `feed/` - FeedPageClient, StoryCard, FeedControls
- `story/` - StoryPlayer, ChoiceButtons, PathProgress, CommentSection
- `create/` - RootStoryForm, BranchNodesForm, StoryPreview
- `profile/` - ProfilePageClient
- `settings/` - ProfileSettings, LanguageSettings

### Component Patterns

1. **Container/Presenter Pattern**:
   - Server Component (container) fetches data
   - Client Component (presenter) handles UI and interactions

2. **Compound Components**:
   - Components that work together (e.g., `CommentSection` + `Comment`)

3. **Render Props** (not used currently):
   - Could be used for flexible component composition

---

## 🔐 Security Architecture

### Authentication

- **Session Management**: Supabase Auth with HTTP-only cookies
- **Middleware**: Automatic session refresh on each request
- **Protected Routes**: Server-side redirect to `/signin` if not authenticated

### Authorization

- **Database Level**: RLS policies enforce access control
- **Application Level**: Server Components check auth before rendering
- **Client Level**: Client Components check auth for interactive features

### Data Validation

- **Client-side**: Form validation before submission
- **Server-side**: Database constraints (NOT NULL, CHECK, etc.)
- **Type Safety**: TypeScript types prevent invalid data structures

### Storage Security

- **Public Read**: Stories and avatars are publicly readable
- **Authenticated Write**: Only authenticated users can upload
- **User Isolation**: Users can only update/delete their own files (folder structure: `{user_id}/filename`)

---

## 📊 State Management

### Local State (useState)

Used for:
- Form inputs
- UI state (modals, dropdowns)
- Loading states
- Error states

### Server State (Data Fetching)

Used for:
- Stories, comments, likes (fetched from database)
- User profiles
- Real-time subscriptions (Supabase Realtime)

### URL State (Query Parameters)

Used for:
- Story path (`?path=A,B,A`)
- Feed filters (`?sort=recent`)
- Pagination (future)

### Persistent State

- **localStorage**: User preferences, path progress (fallback)
- **Database**: User profiles, story progress, likes, comments
- **Cookies**: Authentication session

---

## 🚀 Performance Optimizations

### 1. Server Components

- Content rendered on server (faster initial load)
- Less JavaScript sent to client
- Automatic code splitting

### 2. Image Optimization

- Next.js `<Image>` component
- Automatic image optimization
- Lazy loading

### 3. Code Splitting

- Automatic route-based code splitting
- Dynamic imports for heavy components

### 4. Database Indexes

- Indexes on foreign keys
- Indexes on frequently queried columns (created_at, author_id)

### 5. Caching

- Supabase client-side caching
- Next.js static generation (where applicable)

---

## 🧪 Testing Architecture

### Unit Tests (Jest)

- **Location**: `src/components/**/__tests__/`
- **Coverage**: UI components, utility functions
- **Run**: `pnpm test`

### Integration Tests (Jest + React Testing Library)

- **Location**: `src/components/**/__tests__/`
- **Coverage**: Component interactions, form submissions
- **Run**: `pnpm test`

### E2E Tests (Playwright)

- **Location**: `e2e/*.spec.ts`
- **Coverage**: Critical user flows (auth, story creation, interactions)
- **Run**: `pnpm test:e2e`

---

## 🌐 Internationalization (i18n)

### Implementation

- Custom `useTranslation` hook
- Translation files in `src/hooks/useTranslation.ts`
- Supported languages: English (en), Georgian (ka), German (de), Russian (ru), French (fr)

### Usage

```typescript
const { t } = useTranslation()
const title = t('feed.title')
```

### Language Preference

- Stored in `profiles.language_preference`
- Persisted in database
- Default: English

---

## 📝 Future Enhancements

### Planned Architecture Changes

1. **API Routes** (if needed):
   - Rate limiting
   - Custom business logic
   - Third-party integrations

2. **State Management Library** (if needed):
   - Zustand or Jotai for complex state
   - Currently using React hooks (sufficient for MVP)

3. **Caching Layer**:
   - Redis for session caching
   - CDN for static assets

4. **Real-time Features**:
   - WebSocket connections for live updates
   - Currently using Supabase Realtime (sufficient)

---

## 🔗 Related Documentation

- **Database Schema**: See `supabase/migrations/` for detailed schema
- **API Usage**: See `docs/features/` for feature-specific API usage
- **Deployment**: See `docs/DEPLOYMENT.md` for deployment architecture
- **Features**: See `docs/features/` for component and feature documentation

---

**Last Updated**: 2025-01-15  
**Status**: MVP Complete - Architecture stable for Phase 1-3

