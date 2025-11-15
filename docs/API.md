# API Documentation - BranchFeed

ეს დოკუმენტაცია აღწერს BranchFeed-ის API functions-ებს, hooks-ებს და Supabase client usage-ს.

**Last Updated**: 2025-01-15

---

## 📋 Overview

BranchFeed uses **Supabase** as its backend. All API calls are made directly through Supabase client (no Next.js API routes).

**Architecture**:
- **Server-side**: `createServerSupabaseClient()` - For Server Components
- **Client-side**: `createClientClient()` - For Client Components
- **Functions**: Located in `src/lib/` directory
- **Hooks**: Located in `src/hooks/` directory

---

## 🔐 Authentication API

### Server-Side Functions

#### `getCurrentUser()`

Get current authenticated user (server-side).

**Location**: `src/lib/auth.ts`

**Usage**:
```typescript
import { getCurrentUser } from '@/lib/auth'

// In Server Component
export default async function Page() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/signin')
  }
  // ...
}
```

**Returns**: `Promise<User | null>`

**Throws**: Never throws (returns `null` on error)

---

### Client-Side Functions

#### `signIn(email, password)`

Sign in with email and password.

**Location**: `src/lib/auth.ts`

**Usage**:
```typescript
import { signIn } from '@/lib/auth'

try {
  await signIn('user@example.com', 'password123')
  // User is now signed in
} catch (error) {
  // Handle error
}
```

**Parameters**:
- `email` (string) - User email
- `password` (string) - User password

**Returns**: `Promise<AuthResponse>`

**Throws**: `Error` if sign in fails

---

#### `signUp(email, password)`

Sign up with email and password.

**Location**: `src/lib/auth.ts`

**Usage**:
```typescript
import { signUp } from '@/lib/auth'

try {
  await signUp('user@example.com', 'password123')
  // User account created (may require email confirmation)
} catch (error) {
  // Handle error
}
```

**Parameters**:
- `email` (string) - User email
- `password` (string) - User password (min 8 characters)

**Returns**: `Promise<AuthResponse>`

**Throws**: `Error` if sign up fails

**Note**: Profile is automatically created via database trigger.

---

#### `signOut()`

Sign out current user.

**Location**: `src/lib/auth.ts`

**Usage**:
```typescript
import { signOut } from '@/lib/auth'

try {
  await signOut()
  // User is now signed out
} catch (error) {
  // Handle error
}
```

**Returns**: `Promise<void>`

**Throws**: `Error` if sign out fails

---

#### `getCurrentUserClient()`

Get current authenticated user (client-side).

**Location**: `src/lib/auth.ts`

**Usage**:
```typescript
import { getCurrentUserClient } from '@/lib/auth'

const user = await getCurrentUserClient()
if (user) {
  console.log('User ID:', user.id)
}
```

**Returns**: `Promise<User | null>`

**Throws**: Never throws (returns `null` on error)

---

## 📖 Stories API

### Client-Side Functions

#### `createStory(data)`

Create a root story with branch nodes.

**Location**: `src/lib/stories.ts`

**Usage**:
```typescript
import { createStory } from '@/lib/stories'
import type { CreateStoryData } from '@/types/create'

const storyData: CreateStoryData = {
  root: {
    title: 'My Story',
    description: 'Story description',
    media: imageFile, // File object
  },
  nodes: [
    {
      choiceA: {
        label: 'Go left',
        content: 'You chose left',
        media: imageFileA,
      },
      choiceB: {
        label: 'Go right',
        content: 'You chose right',
        media: imageFileB,
      },
    },
  ],
}

const storyId = await createStory(storyData)
```

**Parameters**:
- `data` (CreateStoryData) - Story creation data

**Returns**: `Promise<string>` - Story ID

**Throws**: `Error` if creation fails

**Process**:
1. Upload root media to Supabase Storage
2. Create story record in database
3. Upload node media files
4. Create branch nodes in database
5. Return story ID

---

#### `getStoryByIdClient(storyId)`

Get story by ID (client-side).

**Location**: `src/lib/stories.ts`

**Usage**:
```typescript
import { getStoryByIdClient } from '@/lib/stories'

const story = await getStoryByIdClient('story-uuid')
if (story) {
  console.log('Story title:', story.title)
}
```

**Parameters**:
- `storyId` (string) - Story ID

**Returns**: `Promise<Story | null>`

**Throws**: Never throws (returns `null` on error)

---

#### `getRootStoriesClient(limit, offset, sort)`

Get root stories for feed (client-side).

**Location**: `src/lib/stories.ts`

**Usage**:
```typescript
import { getRootStoriesClient } from '@/lib/stories'

// Get first 10 stories, sorted by recent
const stories = await getRootStoriesClient(10, 0, 'recent')

// Get next 10 stories (pagination)
const moreStories = await getRootStoriesClient(10, 10, 'recent')
```

**Parameters**:
- `limit` (number, default: 20) - Number of stories to fetch
- `offset` (number, default: 0) - Pagination offset
- `sort` ('recent' | 'popular' | 'trending', default: 'recent') - Sort order

**Returns**: `Promise<Story[]>`

**Throws**: Never throws (returns `[]` on error)

**Sort Options**:
- `'recent'` - Sort by `created_at DESC`
- `'popular'` - Sort by `likes_count DESC`
- `'trending'` - Sort by `views_count DESC` (future: engagement score)

---

#### `getStoryNodes(storyId)`

Get all nodes for a story.

**Location**: `src/lib/stories.ts`

**Usage**:
```typescript
import { getStoryNodes } from '@/lib/stories'

const nodes = await getStoryNodes('story-uuid')
// Returns array of all nodes in the story tree
```

**Parameters**:
- `storyId` (string) - Story ID

**Returns**: `Promise<StoryNode[]>`

**Throws**: Never throws (returns `[]` on error)

---

#### `getNodeByPath(storyId, path)`

Get node at specific path in story tree.

**Location**: `src/lib/stories.ts`

**Usage**:
```typescript
import { getNodeByPath } from '@/lib/stories'

// Get node at path: A → B → A
const node = await getNodeByPath('story-uuid', ['A', 'B', 'A'])
if (node) {
  console.log('Current node:', node.content)
}
```

**Parameters**:
- `storyId` (string) - Story ID
- `path` (('A' | 'B')[]) - Array of choices (e.g., `['A', 'B', 'A']`)

**Returns**: `Promise<StoryNode | null>`

**Throws**: Never throws (returns `null` on error)

**Path Navigation**:
- `[]` - Root story (returns `null`, use story data)
- `['A']` - First choice, option A
- `['A', 'B']` - First choice A, then choice B
- `['A', 'B', 'A']` - Path: A → B → A

---

#### `updateUserProgress(userId, storyId, path)`

Update user's progress in a story.

**Location**: `src/lib/stories.ts`

**Usage**:
```typescript
import { updateUserProgress } from '@/lib/stories'

await updateUserProgress('user-uuid', 'story-uuid', ['A', 'B', 'A'])
```

**Parameters**:
- `userId` (string) - User ID
- `storyId` (string) - Story ID
- `path` (('A' | 'B')[]) - Current path

**Returns**: `Promise<void>`

**Throws**: `Error` if update fails

**Behavior**:
- Creates progress record if doesn't exist
- Updates existing progress record
- Sets `current_depth` to `path.length`
- Updates `last_node_id` if path is valid

---

#### `getUserProgress(userId, storyId)`

Get user's progress for a story.

**Location**: `src/lib/stories.ts`

**Usage**:
```typescript
import { getUserProgress } from '@/lib/stories'

const progress = await getUserProgress('user-uuid', 'story-uuid')
if (progress) {
  console.log('Current path:', progress.path) // ['A', 'B', 'A']
  console.log('Current depth:', progress.current_depth) // 3
}
```

**Parameters**:
- `userId` (string) - User ID
- `storyId` (string) - Story ID

**Returns**: `Promise<UserStoryProgress | null>`

**Throws**: Never throws (returns `null` on error)

---

#### `incrementStoryViews(storyId)`

Increment story view count (atomic).

**Location**: `src/lib/stories.ts`

**Usage**:
```typescript
import { incrementStoryViews } from '@/lib/stories'

await incrementStoryViews('story-uuid')
// views_count incremented atomically
```

**Parameters**:
- `storyId` (string) - Story ID

**Returns**: `Promise<void>`

**Throws**: `Error` if increment fails

**Implementation**: Calls database function `increment_story_views(UUID)`

---

#### `uploadMedia(file, bucket, folder)`

Upload media file to Supabase Storage.

**Location**: `src/lib/stories.ts`

**Usage**:
```typescript
import { uploadMedia } from '@/lib/stories'

const file = event.target.files[0]
const publicUrl = await uploadMedia(file, 'stories')
console.log('Uploaded to:', publicUrl)
```

**Parameters**:
- `file` (File) - File to upload
- `bucket` (string, default: 'stories') - Storage bucket name
- `folder` (string, optional) - Folder path in bucket

**Returns**: `Promise<string>` - Public URL of uploaded file

**Throws**: `Error` if upload fails

**File Naming**: `{timestamp}-{random}.{ext}`

---

### Server-Side Functions

#### `getStoryById(storyId)`

Get story by ID (server-side).

**Location**: `src/lib/stories.server.ts`

**Usage**:
```typescript
import { getStoryById } from '@/lib/stories.server'

// In Server Component
export default async function StoryPage({ params }: { params: { id: string } }) {
  const story = await getStoryById(params.id)
  if (!story) {
    notFound()
  }
  return <StoryDetailPageClient story={story} />
}
```

**Parameters**:
- `storyId` (string) - Story ID

**Returns**: `Promise<Story | null>`

**Throws**: Never throws (returns `null` on error)

---

#### `getRootStories(limit, offset)`

Get root stories for feed (server-side).

**Location**: `src/lib/stories.server.ts`

**Usage**:
```typescript
import { getRootStories } from '@/lib/stories.server'

// In Server Component
export default async function FeedPage() {
  const stories = await getRootStories(20, 0)
  return <FeedPageClient initialStories={stories} />
}
```

**Parameters**:
- `limit` (number, default: 20) - Number of stories to fetch
- `offset` (number, default: 0) - Pagination offset

**Returns**: `Promise<Story[]>`

**Throws**: Never throws (returns `[]` on error)

---

## ❤️ Likes API

### `likeStory(storyId)`

Like a story.

**Location**: `src/lib/likes.ts`

**Usage**:
```typescript
import { likeStory } from '@/lib/likes'

try {
  await likeStory('story-uuid')
  // Story liked successfully
} catch (error) {
  // Handle error (e.g., already liked)
}
```

**Parameters**:
- `storyId` (string) - Story ID

**Returns**: `Promise<void>`

**Throws**: `Error` if like fails

**Behavior**:
- Idempotent: If already liked, does nothing (no error)
- Updates `stories.likes_count` via trigger

---

### `unlikeStory(storyId)`

Unlike a story.

**Location**: `src/lib/likes.ts`

**Usage**:
```typescript
import { unlikeStory } from '@/lib/likes'

try {
  await unlikeStory('story-uuid')
  // Story unliked successfully
} catch (error) {
  // Handle error
}
```

**Parameters**:
- `storyId` (string) - Story ID

**Returns**: `Promise<void>`

**Throws**: `Error` if unlike fails

**Behavior**:
- Updates `stories.likes_count` via trigger

---

### `getLikeStatus(storyId)`

Get like status for a story (whether current user liked it and total likes).

**Location**: `src/lib/likes.ts`

**Usage**:
```typescript
import { getLikeStatus } from '@/lib/likes'

const status = await getLikeStatus('story-uuid')
console.log('Is liked:', status.isLiked)
console.log('Likes count:', status.likesCount)
```

**Parameters**:
- `storyId` (string) - Story ID

**Returns**: `Promise<LikeStatus>`

**Interface**:
```typescript
interface LikeStatus {
  isLiked: boolean
  likesCount: number
}
```

**Throws**: Never throws (returns default values on error)

**Behavior**:
- Returns `{ isLiked: false, likesCount: 0 }` if not authenticated
- Returns cached `likes_count` from `stories` table

---

## 💬 Comments API

### `addComment(storyId, content)`

Add a comment to a story.

**Location**: `src/lib/comments.ts`

**Usage**:
```typescript
import { addComment } from '@/lib/comments'

try {
  const comment = await addComment('story-uuid', 'Great story!')
  console.log('Comment ID:', comment.id)
} catch (error) {
  // Handle error (e.g., content too long)
}
```

**Parameters**:
- `storyId` (string) - Story ID
- `content` (string) - Comment text (max 500 characters)

**Returns**: `Promise<Comment>`

**Throws**: `Error` if comment fails

**Validation**:
- Content must not be empty (after trim)
- Content must not exceed 500 characters

---

### `deleteComment(commentId)`

Delete a comment (only own comments).

**Location**: `src/lib/comments.ts`

**Usage**:
```typescript
import { deleteComment } from '@/lib/comments'

try {
  await deleteComment('comment-uuid')
  // Comment deleted successfully
} catch (error) {
  // Handle error (e.g., not owner)
}
```

**Parameters**:
- `commentId` (string) - Comment ID

**Returns**: `Promise<void>`

**Throws**: `Error` if deletion fails

**Security**: Only allows deleting own comments (enforced by RLS)

---

### `getComments(storyId)`

Get all comments for a story.

**Location**: `src/lib/comments.ts`

**Usage**:
```typescript
import { getComments } from '@/lib/comments'

const comments = await getComments('story-uuid')
comments.forEach(comment => {
  console.log(comment.content, 'by', comment.author.username)
})
```

**Parameters**:
- `storyId` (string) - Story ID

**Returns**: `Promise<Comment[]>`

**Throws**: Never throws (returns `[]` on error)

**Order**: Sorted by `created_at DESC` (newest first)

**Comment Interface**:
```typescript
interface Comment {
  id: string
  story_id: string | null
  node_id: string | null
  user_id: string
  content: string
  created_at: string
  updated_at: string
  author: {
    id: string
    username: string
    avatar_url: string | null
  }
}
```

---

## 🔗 Share API

### `copyStoryLink(storyId, path)`

Copy story link to clipboard (with optional path for deep linking).

**Location**: `src/lib/share.ts`

**Usage**:
```typescript
import { copyStoryLink } from '@/lib/share'

try {
  await copyStoryLink('story-uuid', ['A', 'B', 'A'])
  // Link copied to clipboard: /story/{id}?path=A,B,A
} catch (error) {
  // Handle error (e.g., clipboard API not available)
}
```

**Parameters**:
- `storyId` (string) - Story ID
- `path` (('A' | 'B')[], optional) - Current path for deep linking

**Returns**: `Promise<void>`

**Throws**: `Error` if copy fails

**URL Format**: `/story/{storyId}?path=A,B,A`

---

### `shareNative(storyId, path, title)`

Share using Web Share API (if available, falls back to copy link).

**Location**: `src/lib/share.ts`

**Usage**:
```typescript
import { shareNative } from '@/lib/share'

try {
  await shareNative('story-uuid', ['A', 'B'], 'My Story Title')
  // Native share dialog shown (mobile) or link copied (desktop)
} catch (error) {
  // Handle error
}
```

**Parameters**:
- `storyId` (string) - Story ID
- `path` (('A' | 'B')[], optional) - Current path
- `title` (string, optional) - Share title

**Returns**: `Promise<void>`

**Throws**: Never throws (falls back to copy link)

**Behavior**:
- Uses `navigator.share()` if available (mobile)
- Falls back to `copyStoryLink()` if not available (desktop)

---

### `shareToSocial(platform, storyId, path)`

Share to social media platform (opens share window).

**Location**: `src/lib/share.ts`

**Usage**:
```typescript
import { shareToSocial } from '@/lib/share'

await shareToSocial('twitter', 'story-uuid', ['A', 'B'])
// Opens Twitter share window
```

**Parameters**:
- `platform` ('twitter' | 'facebook' | 'linkedin') - Social platform
- `storyId` (string) - Story ID
- `path` (('A' | 'B')[], optional) - Current path

**Returns**: `Promise<void>`

**Throws**: `Error` if platform is unsupported

**Supported Platforms**:
- `'twitter'` - Twitter share
- `'facebook'` - Facebook share
- `'linkedin'` - LinkedIn share

---

## 👤 Profile API

### `uploadAvatar(file, userId)`

Upload avatar image to Supabase Storage.

**Location**: `src/lib/avatars.ts`

**Usage**:
```typescript
import { uploadAvatar } from '@/lib/avatars'

const file = event.target.files[0]
try {
  const avatarUrl = await uploadAvatar(file, 'user-uuid')
  // Update profile with avatarUrl
} catch (error) {
  // Handle error (e.g., file too large)
}
```

**Parameters**:
- `file` (File) - Image file (max 5MB)
- `userId` (string) - User ID

**Returns**: `Promise<string>` - Public URL of uploaded avatar

**Throws**: `Error` if upload fails

**Validation**:
- File must be an image (`file.type.startsWith('image/')`)
- File size must be ≤ 5MB

**File Structure**: `{userId}/avatar-{timestamp}.{ext}`

---

### `deleteAvatar(avatarUrl, userId)`

Delete avatar from Supabase Storage.

**Location**: `src/lib/avatars.ts`

**Usage**:
```typescript
import { deleteAvatar } from '@/lib/avatars'

await deleteAvatar('https://...', 'user-uuid')
// Avatar deleted
```

**Parameters**:
- `avatarUrl` (string) - Public URL of avatar
- `userId` (string) - User ID

**Returns**: `Promise<void>`

**Throws**: Never throws (logs error but doesn't fail)

---

## 🎣 React Hooks

### `useAuth()`

Authentication hook for client components.

**Location**: `src/hooks/useAuth.ts`

**Usage**:
```typescript
import { useAuth } from '@/hooks/useAuth'

function MyComponent() {
  const { user, loading, isAuthenticated, signUp, signIn, signOut } = useAuth()
  
  if (loading) return <Spinner />
  if (!isAuthenticated) return <SignInForm />
  
  return <div>Welcome, {user?.email}</div>
}
```

**Returns**:
```typescript
interface UseAuthReturn {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  signUp: (email: string, password: string) => Promise<AuthResult>
  signIn: (email: string, password: string) => Promise<AuthResult>
  signOut: () => Promise<void>
}
```

**Features**:
- Automatic session refresh
- Real-time auth state updates
- Loading state management

---

### `useStory(storyId, path)`

Story data hook for client components.

**Location**: `src/hooks/useStory.ts`

**Usage**:
```typescript
import { useStory } from '@/hooks/useStory'

function StoryPlayer({ storyId }: { storyId: string }) {
  const { story, currentNode, loading, error } = useStory(storyId, ['A', 'B'])
  
  if (loading) return <Skeleton />
  if (error) return <ErrorState />
  
  return (
    <div>
      <h1>{story?.title}</h1>
      {currentNode && <p>{currentNode.content}</p>}
    </div>
  )
}
```

**Parameters**:
- `storyId` (string) - Story ID
- `path` (('A' | 'B')[]) - Current path in story

**Returns**:
```typescript
interface UseStoryResult {
  story: Story | null
  currentNode: CurrentNode | null
  loading: boolean
  error: Error | null
}
```

**Behavior**:
- Fetches story data on mount
- Fetches current node based on path
- Updates when `storyId` or `path` changes

---

### `useFeed()`

Feed data hook with pagination and sorting.

**Location**: `src/hooks/useFeed.ts`

**Usage**:
```typescript
import { useFeed } from '@/hooks/useFeed'

function FeedPage() {
  const { stories, loading, hasMore, loadMore, sortBy, setSortBy } = useFeed()
  
  return (
    <div>
      <SortControls sortBy={sortBy} onSortChange={setSortBy} />
      {stories.map(story => (
        <StoryCard key={story.id} story={story} />
      ))}
      {hasMore && <button onClick={loadMore}>Load More</button>}
    </div>
  )
}
```

**Returns**:
```typescript
interface UseFeedReturn {
  stories: Story[]
  loading: boolean
  error: Error | null
  hasMore: boolean
  loadMore: () => void
  sortBy: 'recent' | 'popular' | 'trending'
  setSortBy: (sort: SortType) => void
}
```

**Features**:
- Automatic pagination (10 stories per page)
- Sort options: recent, popular, trending
- Infinite scroll support via `loadMore()`

---

### `useLike(storyId)`

Like functionality hook with optimistic updates.

**Location**: `src/hooks/useLike.ts`

**Usage**:
```typescript
import { useLike } from '@/hooks/useLike'

function LikeButton({ storyId }: { storyId: string }) {
  const { isLiked, likesCount, toggleLike, loading } = useLike(storyId)
  
  return (
    <button onClick={toggleLike} disabled={loading}>
      {isLiked ? '❤️' : '🤍'} {likesCount}
    </button>
  )
}
```

**Returns**:
```typescript
interface UseLikeReturn {
  isLiked: boolean
  likesCount: number
  toggleLike: () => Promise<void>
  loading: boolean
}
```

**Features**:
- Optimistic updates (UI updates immediately)
- Automatic rollback on error
- Loading state management

---

### `useComments(storyId)`

Comments hook with optimistic updates.

**Location**: `src/hooks/useComments.ts`

**Usage**:
```typescript
import { useComments } from '@/hooks/useComments'

function CommentSection({ storyId }: { storyId: string }) {
  const { comments, addComment, deleteComment, loading } = useComments(storyId)
  
  const handleAdd = async (content: string) => {
    await addComment(content)
  }
  
  return (
    <div>
      {comments.map(comment => (
        <Comment key={comment.id} comment={comment} onDelete={deleteComment} />
      ))}
    </div>
  )
}
```

**Returns**:
```typescript
interface UseCommentsReturn {
  comments: Comment[]
  addComment: (content: string) => Promise<void>
  deleteComment: (commentId: string) => Promise<void>
  loading: boolean
}
```

**Features**:
- Optimistic updates
- Automatic refresh after add/delete
- Loading state management

---

### `usePathTracking(storyId)`

Path tracking hook for story navigation.

**Location**: `src/hooks/usePathTracking.ts`

**Usage**:
```typescript
import { usePathTracking } from '@/hooks/usePathTracking'

function StoryPlayer({ storyId }: { storyId: string }) {
  const { currentPath, currentDepth, makeChoice, loadExistingPath, setPathFromUrl } = usePathTracking(storyId)
  
  useEffect(() => {
    loadExistingPath() // Load saved path on mount
  }, [])
  
  const handleChoice = async (choice: 'A' | 'B') => {
    await makeChoice(choice)
    // Path updated, URL updated, saved to database/localStorage
  }
  
  return (
    <div>
      <p>Current path: {currentPath.join(' → ')}</p>
      <p>Depth: {currentDepth}</p>
      <button onClick={() => handleChoice('A')}>Choice A</button>
      <button onClick={() => handleChoice('B')}>Choice B</button>
    </div>
  )
}
```

**Returns**:
```typescript
interface UsePathTrackingResult {
  currentPath: ('A' | 'B')[]
  currentDepth: number
  makeChoice: (choice: 'A' | 'B') => Promise<void>
  loadExistingPath: () => Promise<void>
  setPathFromUrl: (path: ('A' | 'B')[]) => void
}
```

**Features**:
- Automatic path saving (database + localStorage fallback)
- URL synchronization
- Path restoration from URL (for shared links)
- Path restoration from database/localStorage

---

### `useProfile(userId)`

Profile data hook.

**Location**: `src/hooks/useProfile.ts`

**Usage**:
```typescript
import { useProfile } from '@/hooks/useProfile'

function ProfilePage({ userId }: { userId: string }) {
  const { profile, updateProfile, loading } = useProfile(userId)
  
  if (loading) return <Skeleton />
  if (!profile) return <NotFound />
  
  return (
    <div>
      <h1>{profile.username}</h1>
      <p>{profile.bio}</p>
    </div>
  )
}
```

**Returns**:
```typescript
interface UseProfileReturn {
  profile: Profile | null
  updateProfile: (data: Partial<Profile>) => Promise<void>
  loading: boolean
}
```

---

### `useCreateStory()`

Story creation hook with progress tracking.

**Location**: `src/hooks/useCreateStory.ts`

**Usage**:
```typescript
import { useCreateStory } from '@/hooks/useCreateStory'

function CreateStoryForm() {
  const { createStory, loading, error, uploadProgress } = useCreateStory()
  
  const handleSubmit = async (data: CreateStoryData) => {
    try {
      const storyId = await createStory(data)
      router.push(`/story/${storyId}`)
    } catch (err) {
      // Handle error
    }
  }
  
  return (
    <form onSubmit={handleSubmit}>
      {uploadProgress && (
        <Progress value={uploadProgress.progress} />
      )}
      {/* Form fields */}
    </form>
  )
}
```

**Returns**:
```typescript
interface UseCreateStoryReturn {
  createStory: (data: CreateStoryData) => Promise<string>
  loading: boolean
  error: Error | null
  uploadProgress: CreateStoryProgress | null
}

interface CreateStoryProgress {
  stage: 'uploading' | 'creating' | 'complete'
  progress: number // 0-100
  message: string
}
```

**Features**:
- Progress tracking for media uploads
- Error handling
- Loading state management

---

### `useSwipe(handlers, options)`

Swipe gesture detection hook.

**Location**: `src/hooks/useSwipe.ts`

**Usage**:
```typescript
import { useSwipe } from '@/hooks/useSwipe'

function StoryPlayer() {
  const { touchHandlers } = useSwipe({
    onSwipeLeft: () => handleChoice('B'),
    onSwipeRight: () => handleChoice('A'),
  }, {
    threshold: 50, // Minimum swipe distance (pixels)
    velocity: 0.3, // Minimum swipe velocity
  })
  
  return (
    <div {...touchHandlers}>
      {/* Story content */}
    </div>
  )
}
```

**Parameters**:
- `handlers` (SwipeHandlers) - Swipe event handlers
- `options` (SwipeOptions, optional) - Swipe detection options

**Returns**:
```typescript
interface UseSwipeReturn {
  touchHandlers: {
    onTouchStart: (e: React.TouchEvent) => void
    onTouchEnd: (e: React.TouchEvent) => void
  }
}
```

---

### `useTranslation()`

Internationalization hook.

**Location**: `src/hooks/useTranslation.ts`

**Usage**:
```typescript
import { useTranslation } from '@/hooks/useTranslation'

function MyComponent() {
  const { t, locale, setLocale } = useTranslation()
  
  return (
    <div>
      <h1>{t('feed.title')}</h1>
      <button onClick={() => setLocale('ka')}>ქართული</button>
    </div>
  )
}
```

**Returns**:
```typescript
interface UseTranslationReturn {
  t: (key: string) => string
  locale: string
  setLocale: (locale: string) => void
}
```

**Supported Locales**: `'en'`, `'ka'`, `'de'`, `'ru'`, `'fr'`

---

## 🔧 Supabase Client Setup

### `createClientClient()`

Create Supabase client for client-side usage.

**Location**: `src/lib/supabase/client.ts`

**Usage**:
```typescript
import { createClientClient } from '@/lib/supabase/client'

const supabase = createClientClient()
const { data } = await supabase.from('stories').select('*')
```

**Returns**: `SupabaseClient`

**Note**: Uses `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from environment variables.

---

### `createServerSupabaseClient()`

Create Supabase client for server-side usage.

**Location**: `src/lib/supabase/server.ts`

**Usage**:
```typescript
import { createServerSupabaseClient } from '@/lib/supabase/server'

// In Server Component or Server Action
const supabase = await createServerSupabaseClient()
const { data } = await supabase.from('stories').select('*')
```

**Returns**: `Promise<SupabaseClient | null>`

**Note**: 
- Uses cookies for session management
- Returns `null` if environment variables are not set
- Automatically refreshes session

---

## 📊 Error Handling

### Common Error Patterns

All API functions follow consistent error handling:

1. **Authentication Errors**: Functions throw `Error` with message
2. **Not Found**: Functions return `null` or empty array (never throw)
3. **Database Errors**: Functions log error and return default value
4. **Network Errors**: Functions throw `Error` with descriptive message

### Error Types

```typescript
// Authentication required
throw new Error('User not authenticated')

// Resource not found
return null // or []

// Database error
console.error('Error:', error)
return null // or []

// Network error
throw new Error(`Failed to ${operation}: ${error.message}`)
```

---

## 🔄 Real-time Subscriptions

Supabase Realtime can be used for live updates:

```typescript
import { createClientClient } from '@/lib/supabase/client'

const supabase = createClientClient()

// Subscribe to story likes
const subscription = supabase
  .channel('story-likes')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'likes',
    filter: `story_id=eq.${storyId}`,
  }, (payload) => {
    console.log('New like:', payload.new)
    // Update UI
  })
  .subscribe()

// Unsubscribe
subscription.unsubscribe()
```

**Note**: Real-time subscriptions are not currently implemented in MVP, but can be added for Phase 2+.

---

## 📝 Type Definitions

All types are defined in `src/types/index.ts`:

- `Profile` - User profile
- `Story` - Root story
- `StoryNode` - Branch node
- `Comment` - Story comment
- `LikeStatus` - Like status
- `CreateStoryData` - Story creation data (in `src/types/create.ts`)

---

## 🚀 Performance Tips

1. **Use Server Components**: Fetch data server-side when possible
2. **Optimistic Updates**: Update UI immediately, sync with server
3. **Pagination**: Use `limit` and `offset` for large datasets
4. **Caching**: Supabase client caches responses automatically
5. **Indexes**: Database indexes are set up for common queries

---

## 🔗 Related Documentation

- **Database**: `docs/DATABASE.md` - Database schema and queries
- **Architecture**: `docs/ARCHITECTURE.md` - System architecture
- **Setup**: `docs/SETUP.md` - Development setup
- **Features**: `docs/features/` - Feature-specific documentation

---

**Last Updated**: 2025-01-15  
**Status**: ✅ Complete - All API functions and hooks documented

