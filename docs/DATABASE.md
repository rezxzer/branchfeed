# Database Schema - BranchFeed

ეს დოკუმენტაცია აღწერს BranchFeed-ის database schema-ს, tables-ებს, relationships-ებს, indexes-ებს, functions-ებს, triggers-ებს და RLS policies-ებს.

**Last Updated**: 2025-01-15

---

## 📊 Overview

BranchFeed uses **Supabase PostgreSQL** as its database. The schema is designed to support:

- **User Management**: Profiles with authentication
- **Branching Stories**: Root stories with branch nodes (A/B choices)
- **Path Tracking**: User journey through branching narratives
- **Interactions**: Likes, comments, views
- **Media Storage**: References to Supabase Storage URLs
- **Subscriptions**: Premium subscription tiers (Phase 0 - Test Mode Only)
- **Payments**: Payment transaction history (Phase 0 - Test Mode Only)

---

## 🗄️ Tables

### 1. `profiles`

User profiles table. Automatically created when a user signs up (via trigger).

**Schema**:
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE,
  avatar_url TEXT,
  bio TEXT,
  language_preference TEXT DEFAULT 'en' 
    CHECK (language_preference IN ('ka', 'en', 'de', 'ru', 'fr')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Columns**:
- `id` (UUID, PK) - References `auth.users.id`
- `username` (TEXT, UNIQUE, NOT NULL) - Unique username
- `email` (TEXT, UNIQUE) - User email (from auth.users)
- `avatar_url` (TEXT, NULLABLE) - URL to avatar image in Supabase Storage
- `bio` (TEXT, NULLABLE) - User biography
- `language_preference` (TEXT, DEFAULT 'en') - Preferred language (ka, en, de, ru, fr)
- `created_at` (TIMESTAMPTZ) - Profile creation timestamp
- `updated_at` (TIMESTAMPTZ) - Last update timestamp

**Indexes**:
- `idx_profiles_username` - On `username` (for fast username lookups)
- `idx_profiles_email` - On `email` (for fast email lookups)
- `idx_profiles_updated_at` - On `updated_at DESC` (for active users queries in analytics)
- `idx_profiles_banned_at` - On `banned_at` WHERE `banned_at IS NOT NULL` (for banned users queries)
- `idx_profiles_suspended_until` - On `suspended_until` WHERE `suspended_until IS NOT NULL` (for suspended users queries)

**RLS Policies**:
- **Public read**: Anyone can read profiles
- **Authenticated update**: Users can update their own profile
- **Authenticated insert**: Only via trigger (automatic on signup)

**Triggers**:
- `handle_new_user()` - Automatically creates profile when user signs up (see Migrations)

---

### 2. `stories`

Root stories table. Contains the starting point of branching narratives.

**Schema**:
```sql
CREATE TABLE stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  media_url TEXT,
  media_type TEXT CHECK (media_type IN ('image', 'video')),
  is_root BOOLEAN DEFAULT TRUE,
  max_depth INTEGER DEFAULT 5 
    CHECK (max_depth >= 1 AND max_depth <= 10),
  branches_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Columns**:
- `id` (UUID, PK) - Story ID
- `author_id` (UUID, FK → profiles.id) - Story author
- `title` (TEXT, NOT NULL) - Story title
- `description` (TEXT, NULLABLE) - Story description
- `media_url` (TEXT, NULLABLE) - URL to root story media (image/video)
- `media_type` (TEXT, CHECK) - 'image' or 'video'
- `is_root` (BOOLEAN, DEFAULT TRUE) - Always true for root stories
- `max_depth` (INTEGER, DEFAULT 5) - Maximum path depth (1-10)
- `branches_count` (INTEGER, DEFAULT 0) - Count of branch nodes (cached)
- `likes_count` (INTEGER, DEFAULT 0) - Count of likes (cached, updated via trigger)
- `views_count` (INTEGER, DEFAULT 0) - Count of views (updated via function)
- `created_at` (TIMESTAMPTZ) - Story creation timestamp
- `updated_at` (TIMESTAMPTZ) - Last update timestamp

**Indexes**:
- `idx_stories_author_id` - On `author_id` (for author's stories queries)
- `idx_stories_is_root_created_at` - On `(is_root, created_at DESC)` WHERE `is_root = TRUE` (for feed queries - composite index for better performance)
- `idx_stories_views_count` - On `views_count DESC` (for popular stories queries)
- `idx_stories_author_created` - On `(author_id, created_at DESC)` (for author's stories with sorting)

**RLS Policies**:
- **Public read**: Anyone can read stories
- **Authenticated insert**: Authenticated users can create stories
- **Owner update/delete**: Users can update/delete their own stories

**Functions**:
- `increment_story_views(UUID)` - Atomically increments `views_count` (see Migrations)

**Triggers**:
- `update_story_likes_count()` - Updates `likes_count` when likes are added/removed
- `update_updated_at_column()` - Updates `updated_at` on row update

---

### 3. `story_nodes`

Branch nodes table. Contains A/B choice points in branching stories.

**Schema**:
```sql
CREATE TABLE story_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  parent_node_id UUID REFERENCES story_nodes(id) ON DELETE CASCADE,
  choice_label TEXT CHECK (choice_label IN ('A', 'B')) NOT NULL,
  content TEXT,
  media_url TEXT,
  media_type TEXT CHECK (media_type IN ('image', 'video')),
  depth INTEGER NOT NULL CHECK (depth >= 0),
  choice_a_label TEXT DEFAULT 'A',
  choice_a_content TEXT,
  choice_b_label TEXT DEFAULT 'B',
  choice_b_content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Columns**:
- `id` (UUID, PK) - Node ID
- `story_id` (UUID, FK → stories.id) - Parent story
- `parent_node_id` (UUID, FK → story_nodes.id, NULLABLE) - Parent node (NULL for root-level nodes)
- `choice_label` (TEXT, CHECK) - 'A' or 'B' (which choice this node represents)
- `content` (TEXT, NULLABLE) - Node content text
- `media_url` (TEXT, NULLABLE) - URL to node media (image/video)
- `media_type` (TEXT, CHECK) - 'image' or 'video'
- `depth` (INTEGER, NOT NULL) - Depth in tree (0 = root level, 1 = first choice, etc.)
- `choice_a_label` (TEXT, DEFAULT 'A') - Label for choice A (e.g., "Go left")
- `choice_a_content` (TEXT, NULLABLE) - Content for choice A
- `choice_b_label` (TEXT, DEFAULT 'B') - Label for choice B (e.g., "Go right")
- `choice_b_content` (TEXT, NULLABLE) - Content for choice B
- `created_at` (TIMESTAMPTZ) - Node creation timestamp

**Indexes**:
- `idx_story_nodes_story_id` - On `story_id` (for story's nodes queries)
- `idx_story_nodes_parent` - On `(story_id, parent_node_id)` (for parent-child queries)
- `idx_story_nodes_choice_label` - On `(story_id, parent_node_id, choice_label)` (for path navigation)
- `idx_story_nodes_story_parent_choice` - On `(story_id, parent_node_id, choice_label)` (for efficient path navigation)
- `idx_story_nodes_story_depth` - On `(story_id, depth)` (for story tree visualization)

**RLS Policies**:
- **Public read**: Anyone can read story nodes
- **Authenticated insert**: Authenticated users can create nodes (for their own stories)
- **Owner update/delete**: Users can update/delete nodes for their own stories

**Tree Structure**:
```
Story (root)
  └── Node 1 (depth: 0, parent: NULL)
      ├── Node 2 (depth: 1, parent: Node 1, choice: 'A')
      │   ├── Node 4 (depth: 2, parent: Node 2, choice: 'A')
      │   └── Node 5 (depth: 2, parent: Node 2, choice: 'B')
      └── Node 3 (depth: 1, parent: Node 1, choice: 'B')
          ├── Node 6 (depth: 2, parent: Node 3, choice: 'A')
          └── Node 7 (depth: 2, parent: Node 3, choice: 'B')
```

---

### 4. `user_story_progress`

User path tracking table. Tracks each user's journey through branching stories.

**Schema**:
```sql
CREATE TABLE user_story_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  path TEXT[] DEFAULT ARRAY[]::TEXT[] 
    CHECK (array_length(path, 1) <= 10),
  current_depth INTEGER DEFAULT 0 CHECK (current_depth >= 0),
  last_node_id UUID REFERENCES story_nodes(id) ON DELETE SET NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, story_id)
);
```

**Columns**:
- `id` (UUID, PK) - Progress record ID
- `user_id` (UUID, FK → profiles.id) - User
- `story_id` (UUID, FK → stories.id) - Story
- `path` (TEXT[], DEFAULT []) - Array of choices ('A' or 'B'), max length 10
- `current_depth` (INTEGER, DEFAULT 0) - Current depth in path
- `last_node_id` (UUID, FK → story_nodes.id, NULLABLE) - Last visited node
- `completed` (BOOLEAN, DEFAULT FALSE) - Whether user completed the story
- `created_at` (TIMESTAMPTZ) - Progress creation timestamp
- `updated_at` (TIMESTAMPTZ) - Last update timestamp

**Constraints**:
- `UNIQUE(user_id, story_id)` - One progress record per user per story

**Indexes**:
- `idx_user_story_progress_user_story` - On `(user_id, story_id)` (for user's progress queries)
- `idx_user_story_progress_story_id` - On `story_id` (for story statistics)
- `idx_user_story_progress_story_completed` - On `(story_id, completed)` WHERE `completed = true` (for completion rate analytics)
- `idx_user_story_progress_user_updated` - On `(user_id, updated_at DESC)` (for user's progress with sorting)

**RLS Policies**:
- **Authenticated read**: Users can read their own progress
- **Authenticated insert**: Users can create progress records
- **Owner update**: Users can update their own progress

**Example Path**:
```sql
-- User chose: A → B → A
path = ARRAY['A', 'B', 'A']
current_depth = 3
```

---

### 5. `likes`

Story likes table. Tracks which users liked which stories.

**Schema**:
```sql
CREATE TABLE likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT likes_story_user_unique UNIQUE(story_id, user_id),
  CONSTRAINT likes_story_id_not_null CHECK (story_id IS NOT NULL)
);
```

**Columns**:
- `id` (UUID, PK) - Like record ID
- `story_id` (UUID, FK → stories.id) - Liked story
- `user_id` (UUID, FK → profiles.id) - User who liked
- `created_at` (TIMESTAMPTZ) - Like timestamp

**Constraints**:
- `UNIQUE(story_id, user_id)` - One like per user per story
- `CHECK (story_id IS NOT NULL)` - Story ID must be provided

**Indexes**:
- `idx_likes_story_id` - On `story_id` (for story's likes count)
- `idx_likes_user_id` - On `user_id` (for user's liked stories)
- `idx_likes_story_user` - On `(story_id, user_id)` (for like status check)

**RLS Policies**:
- **Public read**: Anyone can read likes (for like counts)
- **Authenticated insert**: Authenticated users can like stories
- **Owner delete**: Users can unlike (delete their own likes)

**Triggers**:
- `update_story_likes_count()` - Updates `stories.likes_count` when likes are added/removed

---

### 6. `comments`

Story comments table. Comments can be on stories or specific nodes.

**Schema**:
```sql
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  node_id UUID REFERENCES story_nodes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT comments_story_or_node 
    CHECK (story_id IS NOT NULL OR node_id IS NOT NULL)
);
```

**Columns**:
- `id` (UUID, PK) - Comment ID
- `story_id` (UUID, FK → stories.id, NULLABLE) - Story being commented on
- `node_id` (UUID, FK → story_nodes.id, NULLABLE) - Node being commented on (future feature)
- `user_id` (UUID, FK → profiles.id) - Comment author
- `content` (TEXT, NOT NULL) - Comment text (max 500 characters, enforced in application)
- `created_at` (TIMESTAMPTZ) - Comment creation timestamp
- `updated_at` (TIMESTAMPTZ) - Last update timestamp

**Constraints**:
- `CHECK (story_id IS NOT NULL OR node_id IS NOT NULL)` - Must comment on story or node

**Indexes**:
- `idx_comments_story_id` - On `story_id` (for story's comments - basic lookup)
- `idx_comments_story_created` - On `(story_id, created_at DESC)` (for story's comments with sorting - composite index for better performance)
- `idx_comments_user_created` - On `(user_id, created_at DESC)` (for user's comments with sorting)
- `idx_comments_node_id` - On `node_id` (for node's comments, future feature)

**RLS Policies**:
- **Public read**: Anyone can read comments
- **Authenticated insert**: Authenticated users can add comments
- **Owner update/delete**: Users can update/delete their own comments

**Triggers**:
- `update_story_comments_count()` - Updates `stories.comments_count` when comments are added/removed (if implemented)

---

### 7. `user_subscriptions`

User subscription table. Stores Stripe subscription information for premium tiers.

**Schema**:
```sql
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  tier TEXT NOT NULL CHECK (tier IN ('supporter', 'pro', 'vip')),
  status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'trialing', 'incomplete', 'incomplete_expired')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  canceled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);
```

**Columns**:
- `id` (UUID, PK) - Subscription record ID
- `user_id` (UUID, FK → profiles.id) - User
- `stripe_customer_id` (TEXT, UNIQUE) - Stripe customer ID
- `stripe_subscription_id` (TEXT, UNIQUE) - Stripe subscription ID
- `tier` (TEXT, CHECK) - Subscription tier: 'supporter', 'pro', or 'vip'
- `status` (TEXT, CHECK) - Stripe subscription status
- `current_period_start` (TIMESTAMPTZ) - Current billing period start
- `current_period_end` (TIMESTAMPTZ) - Current billing period end
- `cancel_at_period_end` (BOOLEAN) - Whether subscription will cancel at period end
- `canceled_at` (TIMESTAMPTZ) - Cancellation timestamp
- `created_at` (TIMESTAMPTZ) - Subscription creation timestamp
- `updated_at` (TIMESTAMPTZ) - Last update timestamp

**Constraints**:
- `UNIQUE(user_id)` - One subscription per user

**Indexes**:
- `idx_user_subscriptions_user_id` - On `user_id` (for user's subscription queries)
- `idx_user_subscriptions_stripe_customer_id` - On `stripe_customer_id` (for Stripe webhook lookups)
- `idx_user_subscriptions_stripe_subscription_id` - On `stripe_subscription_id` (for Stripe webhook lookups)
- `idx_user_subscriptions_status` - On `status` (for active subscriptions queries)
- `idx_user_subscriptions_tier` - On `tier` (for tier-based analytics)

**RLS Policies**:
- **Authenticated read**: Users can read their own subscription
- **Admin read**: Admins can read all subscriptions

**Triggers**:
- `update_subscription_updated_at()` - Updates `updated_at` on row update

**Status**: Phase 0 (Test Mode Only) - See `REVENUE_PLAYBOOK.md` for details

---

### 8. `payment_history`

Payment transaction history table. Tracks all payment transactions (subscriptions, one-time purchases, coins).

**Schema**:
```sql
CREATE TABLE payment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES user_subscriptions(id) ON DELETE SET NULL,
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_invoice_id TEXT,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  status TEXT NOT NULL CHECK (status IN ('succeeded', 'pending', 'failed', 'refunded')),
  payment_type TEXT NOT NULL CHECK (payment_type IN ('subscription', 'one_time', 'coins')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB
);
```

**Columns**:
- `id` (UUID, PK) - Payment record ID
- `user_id` (UUID, FK → profiles.id) - User who made payment
- `subscription_id` (UUID, FK → user_subscriptions.id) - Related subscription (if applicable)
- `stripe_payment_intent_id` (TEXT, UNIQUE) - Stripe payment intent ID
- `stripe_invoice_id` (TEXT) - Stripe invoice ID
- `amount` (INTEGER) - Payment amount in cents (e.g., 499 = $4.99)
- `currency` (TEXT, DEFAULT 'usd') - Currency code
- `status` (TEXT, CHECK) - Payment status: 'succeeded', 'pending', 'failed', 'refunded'
- `payment_type` (TEXT, CHECK) - Payment type: 'subscription', 'one_time', or 'coins'
- `created_at` (TIMESTAMPTZ) - Payment timestamp
- `metadata` (JSONB) - Additional Stripe metadata

**Indexes**:
- `idx_payment_history_user_id` - On `user_id` (for user's payment history)
- `idx_payment_history_subscription_id` - On `subscription_id` (for subscription payments)
- `idx_payment_history_stripe_payment_intent_id` - On `stripe_payment_intent_id` (for Stripe webhook lookups)
- `idx_payment_history_status` - On `status` (for payment status queries)
- `idx_payment_history_created_at` - On `created_at DESC` (for chronological sorting)

**RLS Policies**:
- **Authenticated read**: Users can read their own payment history
- **Admin read**: Admins can read all payment history

**Status**: Phase 0 (Test Mode Only) - See `REVENUE_PLAYBOOK.md` for details

---

## 🔗 Relationships

### Entity Relationship Diagram

```
profiles (1) ──→ (many) stories
  │                    │
  │                    ├──→ (many) story_nodes
  │                    │
  │                    ├──→ (many) likes
  │                    │
  │                    └──→ (many) comments
  │
  ├──→ (many) user_story_progress ──→ (1) stories
  │
  └──→ (many) likes ──→ (1) stories
```

### Foreign Key Relationships

1. **profiles → stories** (one-to-many)
   - `stories.author_id` → `profiles.id`
   - Cascade delete: Deleting profile deletes all their stories

2. **stories → story_nodes** (one-to-many)
   - `story_nodes.story_id` → `stories.id`
   - Cascade delete: Deleting story deletes all its nodes

3. **story_nodes → story_nodes** (self-referential, one-to-many)
   - `story_nodes.parent_node_id` → `story_nodes.id`
   - Cascade delete: Deleting parent node deletes all child nodes

4. **profiles → user_story_progress** (one-to-many)
   - `user_story_progress.user_id` → `profiles.id`
   - Cascade delete: Deleting profile deletes all their progress

5. **stories → user_story_progress** (one-to-many)
   - `user_story_progress.story_id` → `stories.id`
   - Cascade delete: Deleting story deletes all progress records

6. **profiles → likes** (one-to-many)
   - `likes.user_id` → `profiles.id`
   - Cascade delete: Deleting profile deletes all their likes

7. **stories → likes** (one-to-many)
   - `likes.story_id` → `stories.id`
   - Cascade delete: Deleting story deletes all likes

8. **profiles → comments** (one-to-many)
   - `comments.user_id` → `profiles.id`
   - Cascade delete: Deleting profile deletes all their comments

9. **stories → comments** (one-to-many)
   - `comments.story_id` → `stories.id`
   - Cascade delete: Deleting story deletes all comments

10. **story_nodes → comments** (one-to-many, future feature)
    - `comments.node_id` → `story_nodes.id`
    - Cascade delete: Deleting node deletes all comments on it

---

## 🔐 Row Level Security (RLS)

All tables have RLS enabled. Policies use `do $$ ... end $$;` block syntax for idempotency.

### Policy Patterns

1. **Public Read**: Anyone can read public content
   ```sql
   CREATE POLICY "Public read" ON table_name
   FOR SELECT USING (true);
   ```

2. **Authenticated Insert**: Only authenticated users can create
   ```sql
   CREATE POLICY "Authenticated insert" ON table_name
   FOR INSERT WITH CHECK (auth.role() = 'authenticated');
   ```

3. **Owner Update/Delete**: Users can only modify their own data
   ```sql
   CREATE POLICY "Owner update" ON table_name
   FOR UPDATE USING (auth.uid() = author_id);
   ```

### Storage Policies

Storage buckets have separate RLS policies:

**`stories` bucket**:
- Public read access (anyone can view story media)
- Authenticated upload (only authenticated users can upload)
- Users can update/delete their own uploads

**`avatars` bucket**:
- Public read access (anyone can view avatars)
- Authenticated upload (only authenticated users can upload)
- Users can update/delete their own avatars (in their user folder)

See `supabase/migrations/20250115_02_add_storage_bucket_and_policies.sql` and `20250115_04_add_avatars_bucket_and_policies.sql` for detailed policies.

---

## ⚡ Functions

### 1. `handle_new_user()`

Automatically creates a profile when a new user signs up.

**Location**: `supabase/migrations/20250115_01_add_profile_creation_trigger.sql`

**Function**:
```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Generate username from email
  -- Insert profile
  -- Handle username conflicts
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Trigger**: `on_auth_user_created` on `auth.users` table

---

### 2. `increment_story_views(UUID)`

Atomically increments story view count.

**Location**: `supabase/migrations/20250115_03_add_view_count_function.sql`

**Function**:
```sql
CREATE OR REPLACE FUNCTION increment_story_views(story_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE stories
  SET views_count = views_count + 1,
      updated_at = NOW()
  WHERE id = story_id;
END;
$$;
```

**Usage**:
```sql
SELECT increment_story_views('story-uuid-here');
```

**Permissions**: `GRANT EXECUTE ON FUNCTION increment_story_views(UUID) TO authenticated;`

---

### 3. `update_story_likes_count()`

Updates `stories.likes_count` when likes are added/removed.

**Trigger Function**: Automatically called by trigger

**Location**: Defined in initial schema (if implemented)

---

### 4. `update_updated_at_column()`

Updates `updated_at` timestamp on row update.

**Trigger Function**: Automatically called by trigger

**Location**: Defined in initial schema (if implemented)

---

## 🔄 Triggers

### 1. `on_auth_user_created`

**Table**: `auth.users`  
**Event**: `AFTER INSERT`  
**Function**: `handle_new_user()`

Automatically creates a profile when a new user signs up.

---

### 2. `update_story_likes_count_trigger`

**Table**: `likes`  
**Event**: `AFTER INSERT OR DELETE`  
**Function**: `update_story_likes_count()`

Updates `stories.likes_count` when likes are added/removed.

---

### 3. `update_updated_at_trigger`

**Table**: Multiple tables  
**Event**: `BEFORE UPDATE`  
**Function**: `update_updated_at_column()`

Updates `updated_at` timestamp on row update.

---

## 📦 Storage Buckets

### 1. `stories` Bucket

**Purpose**: Store story media (images/videos)

**Setup**:
1. Create bucket in Supabase Dashboard → Storage
2. Name: `stories` (exactly, lowercase)
3. Public: ✅ YES
4. File size limit: 10 MB (recommended)
5. Allowed MIME types: `image/*, video/*` (optional)

**Policies**: See `supabase/migrations/20250115_02_add_storage_bucket_and_policies.sql`

**File Structure**:
```
stories/
  ├── {timestamp}-{random}.jpg
  ├── {timestamp}-{random}.mp4
  └── ...
```

---

### 2. `avatars` Bucket

**Purpose**: Store user profile avatars

**Setup**:
1. Create bucket in Supabase Dashboard → Storage
2. Name: `avatars` (exactly, lowercase)
3. Public: ✅ YES
4. File size limit: 5 MB (recommended)
5. Allowed MIME types: `image/*` (optional)

**Policies**: See `supabase/migrations/20250115_04_add_avatars_bucket_and_policies.sql`

**File Structure**:
```
avatars/
  ├── {user_id}/
  │   ├── {timestamp}.jpg
  │   └── ...
  └── ...
```

---

## 📝 Migrations

Migrations are located in `supabase/migrations/` directory.

**Naming Convention**: `YYYYMMDD_NN_description.sql`

**Migration Files**:
1. `20250115_01_add_profile_creation_trigger.sql` - Profile creation trigger
2. `20250115_02_add_storage_bucket_and_policies.sql` - Stories bucket policies
3. `20250115_03_add_view_count_function.sql` - View count increment function
4. `20250115_04_add_avatars_bucket_and_policies.sql` - Avatars bucket policies

**Running Migrations**:
1. Copy migration SQL content
2. Open Supabase Dashboard → SQL Editor
3. Paste and run
4. Verify using verification queries in migration file

See `supabase/migrations/README.md` for migration guidelines.

---

## 🔍 Common Queries

### Get User's Stories

```sql
SELECT * FROM stories 
WHERE author_id = 'user-uuid' 
ORDER BY created_at DESC;
```

### Get Story with Nodes

```sql
SELECT 
  s.*,
  json_agg(
    json_build_object(
      'id', sn.id,
      'parent_node_id', sn.parent_node_id,
      'choice_label', sn.choice_label,
      'content', sn.content,
      'depth', sn.depth
    )
  ) as nodes
FROM stories s
LEFT JOIN story_nodes sn ON sn.story_id = s.id
WHERE s.id = 'story-uuid'
GROUP BY s.id;
```

### Get User's Progress for Story

```sql
SELECT * FROM user_story_progress
WHERE user_id = 'user-uuid' 
  AND story_id = 'story-uuid';
```

### Get Story Likes Count

```sql
SELECT 
  s.id,
  s.title,
  s.likes_count,
  COUNT(l.id) as actual_likes_count
FROM stories s
LEFT JOIN likes l ON l.story_id = s.id
WHERE s.id = 'story-uuid'
GROUP BY s.id;
```

### Get Story Comments

```sql
SELECT 
  c.*,
  p.username,
  p.avatar_url
FROM comments c
JOIN profiles p ON p.id = c.user_id
WHERE c.story_id = 'story-uuid'
ORDER BY c.created_at DESC;
```

---

## 🚀 Performance Considerations

### Indexes

All foreign keys and frequently queried columns are indexed:
- Foreign keys: `author_id`, `story_id`, `user_id`, `parent_node_id`
- Sort columns: `created_at` (DESC for recent stories)
- Filter columns: `is_root` (for feed queries)

### Cached Counts

- `stories.likes_count` - Updated via trigger (not real-time, but fast)
- `stories.views_count` - Updated via function (atomic increment)
- `stories.comments_count` - Can be updated via trigger (if implemented)

### Query Optimization

- Use `SELECT` with specific columns (not `SELECT *`)
- Use indexes for WHERE clauses
- Use `LIMIT` for pagination
- Use `ORDER BY` with indexed columns

---

## 🔒 Security Best Practices

1. **RLS Enabled**: All tables have RLS enabled
2. **Policy Testing**: Test policies with different user roles
3. **Input Validation**: Validate input in application layer (database constraints are backup)
4. **SQL Injection**: Use parameterized queries (Supabase client handles this)
5. **Storage Security**: Public read, authenticated write for media files

---

## 📚 Related Documentation

- **Setup**: `docs/SETUP.md` - Database setup instructions
- **Architecture**: `docs/ARCHITECTURE.md` - System architecture overview
- **Migrations**: `supabase/migrations/README.md` - Migration guidelines
- **Storage**: `docs/STORAGE_SETUP_INSTRUCTIONS.md` - Storage bucket setup

---

**Last Updated**: 2025-01-15  
**Status**: ✅ Complete - All tables, relationships, and policies documented

# Database

> Improvements (2025-01):
>
> - Profiles: Make `profiles.email` NOT NULL (aligned with auth.users) and ensure updates on email change via trigger.
> - Story Nodes: Change `choice_label` to an enum type `choice_label_t AS ENUM ('A','B')` to enforce data integrity.
> - Triggers: Add defensive checks with `RAISE EXCEPTION` and clear error codes/messages for invariant violations.
> - Audit Logs: Introduce `audit_logs` table to track user/admin actions (actor_id, action, target_type/id, details, created_at).

## Views (Analytics Basics)

- `user_engagement_view`: Aggregates per-user metrics (stories_viewed, likes, comments, avg_completion) from transactional tables; read-only; refreshed on schedule if materialized.
  - Use indexes on source tables and keep view simple for real-time reads.

---

