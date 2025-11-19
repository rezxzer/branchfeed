# User Feedback System - BranchFeed

ეს დოკუმენტაცია აღწერს User Feedback System-ის იმპლემენტაციას BranchFeed-ში.

---

> ✅ **სტატუსი: COMPLETED** (2025-01-15) — User Feedback System სრულად იმპლემენტირებულია და მუშაობს.
>
> **Implementation Status**: ყველა core feature დასრულებულია:
> - ✅ User feedback submission form
> - ✅ Feedback database table with RLS policies
> - ✅ Admin feedback dashboard
> - ✅ Feedback management (status, priority, admin notes)
> - ✅ Feedback statistics
> - ✅ i18n support (5 languages)

## 📋 Overview

User Feedback System არის პლატფორმა, რომელიც საშუალებას აძლევს მომხმარებლებს:
- გაგზავნონ feedback (bug reports, feature requests, improvements, general feedback)
- დააფასონ პლატფორმა (rating 1-5)
- ნახონ საკუთარი feedback submissions (თუ authenticated არიან)

და ადმინისტრატორებს:
- ხედავენ ყველა feedback submission-ს
- მართავენ feedback status-ს (pending, reviewed, in_progress, resolved, dismissed)
- დააყენებენ priority-ს (low, medium, high, critical)
- დაწერენ admin notes
- ხედავენ feedback statistics

**User Route**: `/feedback` (public - anonymous feedback allowed)  
**Admin Route**: `/admin/feedback` (protected route, admin-only access)

**Status**: ✅ **COMPLETED** - User Feedback System fully implemented (2025-01-15)

---

## 🚦 Phase & Priorities

User Feedback System არის **Post-MVP** ფუნქცია, რომელიც **სრულად იმპლემენტირებულია** (2025-01-15).

### ✅ Implementation Complete

ყველა core feature დასრულებულია:
- ✅ Database migration (`user_feedback` table with RLS policies)
- ✅ User feedback API routes (`/api/feedback`)
- ✅ Admin feedback API routes (`/api/admin/feedback`, `/api/admin/feedback/stats`)
- ✅ Feedback form component (`FeedbackForm`)
- ✅ Feedback page (`/feedback`)
- ✅ Admin feedback dashboard (`/admin/feedback`)
- ✅ Feedback management components (`FeedbackList`, `FeedbackStats`)
- ✅ i18n support (Georgian, English, German, Russian, French)

---

## 🎯 Features

### User Features

#### 1. Feedback Submission Form

**Component**: `src/components/feedback/FeedbackForm.tsx`

**Features**:
- Feedback type selection (bug, feature, improvement, general, other)
- Category field (optional text input)
- Title field (required)
- Description field (required, textarea)
- Rating selector (1-5 stars, optional)
- Anonymous submission support (no authentication required)
- Form validation
- Loading states
- Success/error toasts

**Usage**:
```tsx
<FeedbackForm userId={user?.id || null} />
```

#### 2. Feedback Page

**Route**: `/feedback`  
**Component**: `src/app/feedback/page.tsx` (Server Component)  
**Client Component**: `src/components/feedback/FeedbackPageClient.tsx`

**Features**:
- Displays feedback submission form
- Option to view user's own feedback submissions (if authenticated)
- Anonymous feedback support

**Access**: Public (no authentication required)

---

### Admin Features

#### 1. Admin Feedback Dashboard

**Route**: `/admin/feedback`  
**Component**: `src/app/admin/feedback/page.tsx` (Server Component)  
**Client Component**: `src/components/admin/FeedbackManagementClient.tsx`

**Features**:
- Feedback statistics (total, pending, resolved, average rating)
- Feedback list with pagination
- Filtering (status, type, priority, category)
- Sorting (by date, status, priority)
- Inline editing (status, priority, admin notes)
- User information display (username, avatar, anonymous indicator)

**Access**: Admin only (requires `canModerateContent` permission)

#### 2. Feedback Statistics

**Component**: `src/components/admin/FeedbackStats.tsx`

**Displays**:
- Total feedback count
- Pending feedback count
- Resolved feedback count
- Average rating

#### 3. Feedback List

**Component**: `src/components/admin/FeedbackList.tsx`

**Features**:
- Displays feedback items in card format
- Shows feedback type, category, title, description
- Shows user information (if authenticated) or "Anonymous"
- Shows status and priority badges
- Shows rating (if provided)
- Shows admin notes (if any)
- Inline editing for status, priority, and admin notes
- Save/Cancel buttons for editing
- Timestamps (created, resolved)

---

## 🗄️ Database Schema

### `user_feedback` Table

**Migration**: `supabase/migrations/20250115_33_add_user_feedback.sql`

**Columns**:
- `id` (UUID, PRIMARY KEY)
- `user_id` (UUID, FOREIGN KEY → profiles.id, nullable - for anonymous feedback)
- `feedback_type` (TEXT, CHECK: 'bug' | 'feature' | 'improvement' | 'general' | 'other')
- `category` (TEXT, nullable)
- `title` (TEXT, NOT NULL)
- `description` (TEXT, NOT NULL)
- `rating` (INTEGER, CHECK: 1-5, nullable)
- `status` (TEXT, DEFAULT 'pending', CHECK: 'pending' | 'reviewed' | 'in_progress' | 'resolved' | 'dismissed')
- `priority` (TEXT, DEFAULT 'medium', CHECK: 'low' | 'medium' | 'high' | 'critical')
- `admin_notes` (TEXT, nullable)
- `resolved_at` (TIMESTAMPTZ, nullable)
- `created_at` (TIMESTAMPTZ, DEFAULT NOW())
- `updated_at` (TIMESTAMPTZ, DEFAULT NOW())

**Indexes**:
- `idx_user_feedback_user_id` on `user_id`
- `idx_user_feedback_status` on `status`
- `idx_user_feedback_type` on `feedback_type`
- `idx_user_feedback_created_at` on `created_at`

**Triggers**:
- `trigger_update_user_feedback_updated_at` - Updates `updated_at` on row update

**RLS Policies**:
- Users can insert their own feedback (or anonymous feedback)
- Users can read their own feedback
- Users can update their own *pending* feedback
- Admins can read all feedback (using `is_admin(auth.uid())`)
- Admins can update all feedback (using `is_admin(auth.uid())`)
- Admins can delete feedback (using `is_admin(auth.uid())`)

---

## 🔌 API Routes

### User Feedback API

#### `POST /api/feedback`

**Purpose**: Submit new feedback

**Request Body**:
```typescript
{
  feedback_type: 'bug' | 'feature' | 'improvement' | 'general' | 'other'
  category?: string
  title: string
  description: string
  rating?: number (1-5)
}
```

**Response**:
```typescript
{
  success: boolean
  feedback?: {
    id: string
    // ... feedback fields
  }
  error?: string
}
```

**Access**: Public (anonymous feedback allowed)

#### `GET /api/feedback`

**Purpose**: Fetch user's own feedback (if authenticated) or all feedback (if admin)

**Query Parameters**:
- `page` (number, default: 1)
- `limit` (number, default: 20)
- `status` (string, optional filter)
- `type` (string, optional filter)
- `priority` (string, optional filter)
- `category` (string, optional filter)
- `sort` (string, default: 'created_at')
- `order` ('asc' | 'desc', default: 'desc')

**Response**:
```typescript
{
  feedback: Feedback[]
  total: number
  page: number
  limit: number
  totalPages: number
}
```

**Access**: Authenticated users (own feedback) or admins (all feedback)

---

### Admin Feedback API

#### `GET /api/admin/feedback`

**Purpose**: Fetch all feedback with filtering, sorting, and pagination

**Query Parameters**:
- `page` (number, default: 1)
- `limit` (number, default: 20)
- `status` (string, optional filter)
- `type` (string, optional filter)
- `priority` (string, optional filter)
- `category` (string, optional filter)
- `sort` (string, default: 'created_at')
- `order` ('asc' | 'desc', default: 'desc')

**Response**:
```typescript
{
  feedback: Feedback[]
  total: number
  page: number
  limit: number
  totalPages: number
}
```

**Access**: Admin only (requires `canModerateContent` permission)

#### `PUT /api/admin/feedback`

**Purpose**: Update feedback (status, priority, admin notes)

**Request Body**:
```typescript
{
  id: string
  status?: 'pending' | 'reviewed' | 'in_progress' | 'resolved' | 'dismissed'
  priority?: 'low' | 'medium' | 'high' | 'critical'
  admin_notes?: string
}
```

**Response**:
```typescript
{
  success: boolean
  feedback?: Feedback
  error?: string
}
```

**Access**: Admin only (requires `canModerateContent` permission)

#### `GET /api/admin/feedback/stats`

**Purpose**: Fetch feedback statistics

**Response**:
```typescript
{
  total: number
  pending: number
  status: {
    pending: number
    reviewed: number
    in_progress: number
    resolved: number
    dismissed: number
  }
  type: {
    bug: number
    feature: number
    improvement: number
    general: number
    other: number
  }
  priority: {
    low: number
    medium: number
    high: number
    critical: number
  }
  averageRating: number | null
}
```

**Access**: Admin only (requires `canViewAnalytics` permission)

---

## 🎨 UI Components

### User Components

#### `FeedbackForm`

**Location**: `src/components/feedback/FeedbackForm.tsx`

**Props**:
```typescript
{
  userId: string | null
  onSuccess?: () => void
}
```

**Features**:
- Form fields for feedback submission
- Rating selector (1-5 stars)
- Form validation
- Loading states
- Success/error toasts

#### `FeedbackPageClient`

**Location**: `src/components/feedback/FeedbackPageClient.tsx`

**Props**:
```typescript
{
  userId: string | null
}
```

**Features**:
- Displays feedback form
- Option to view user's submissions (if authenticated)

---

### Admin Components

#### `FeedbackManagementClient`

**Location**: `src/components/admin/FeedbackManagementClient.tsx`

**Features**:
- Integrates `AdminHeader` and `AdminSidebar`
- Displays `FeedbackStats` component
- Displays filters (status, type, priority, category)
- Displays `FeedbackList` component
- Handles pagination
- Handles feedback updates

#### `FeedbackStats`

**Location**: `src/components/admin/FeedbackStats.tsx`

**Props**:
```typescript
{
  stats: {
    total: number
    pending: number
    status: { ... }
    type: { ... }
    priority: { ... }
    averageRating: number | null
  }
}
```

**Features**:
- Displays 4 stat cards (Total, Pending, Resolved, Avg Rating)
- Dark theme styling
- Responsive grid layout

#### `FeedbackList`

**Location**: `src/components/admin/FeedbackList.tsx`

**Props**:
```typescript
{
  feedback: Feedback[]
  onUpdate: (id: string, updates: Partial<Feedback>) => Promise<void>
}
```

**Features**:
- Displays feedback items in card format
- Shows user information (username, avatar, anonymous)
- Shows status and priority badges
- Shows rating (if provided)
- Shows admin notes (if any)
- Inline editing for status, priority, admin notes
- Save/Cancel buttons
- Timestamps

---

## 🌐 Internationalization (i18n)

**Translation Keys**: Added to `src/hooks/useTranslation.ts`

**Languages Supported**: Georgian (ka), English (en), German (de), Russian (ru), French (fr)

**Key Groups**:
- `header.feedback` - Header link text
- `feedback.*` - User-facing feedback form and page text
- `admin.sidebar.feedback` - Admin sidebar link
- `admin.feedback.*` - Admin dashboard text
- `common.*` - Common UI elements (all, save, saving, edit, anonymous, created, resolved, etc.)

---

## 🔒 Security

### Row Level Security (RLS)

**User Policies**:
- Users can insert their own feedback (or anonymous feedback)
- Users can read their own feedback
- Users can update their own *pending* feedback only

**Admin Policies**:
- Admins can read all feedback (using `is_admin(auth.uid())`)
- Admins can update all feedback (using `is_admin(auth.uid())`)
- Admins can delete feedback (using `is_admin(auth.uid())`)

### API Security

- User feedback submission: Public (anonymous allowed)
- User feedback fetching: Authenticated (own feedback) or Admin (all feedback)
- Admin feedback management: Admin only (requires `canModerateContent` permission)
- Admin feedback stats: Admin only (requires `canViewAnalytics` permission)

---

## 📝 Usage Examples

### User Submitting Feedback

```tsx
// User visits /feedback page
// Fills out form:
// - Type: "bug"
// - Title: "Video not playing"
// - Description: "Videos don't play on mobile devices"
// - Rating: 2
// Clicks "Submit Feedback"
// Success toast appears
```

### Admin Managing Feedback

```tsx
// Admin visits /admin/feedback
// Sees statistics: Total: 25, Pending: 10, Resolved: 12, Avg Rating: 4.2
// Filters by status: "pending"
// Clicks "Edit" on a feedback item
// Changes status to "in_progress"
// Sets priority to "high"
// Adds admin note: "Investigating video playback issue"
// Clicks "Save"
// Feedback updated successfully
```

---

## 🧪 Testing

### Manual Testing Checklist

- [x] User can submit feedback (authenticated)
- [x] User can submit feedback (anonymous)
- [x] User can view own feedback submissions
- [x] Admin can view all feedback
- [x] Admin can filter feedback (status, type, priority, category)
- [x] Admin can sort feedback (by date, status, priority)
- [x] Admin can update feedback status
- [x] Admin can update feedback priority
- [x] Admin can add admin notes
- [x] Admin can view feedback statistics
- [x] RLS policies work correctly (users see only own, admins see all)
- [x] i18n translations work for all languages

---

## 🐛 Known Issues

None currently.

---

## 🔮 Future Enhancements

### Potential Improvements

1. **Email Notifications**
   - Notify admins when new feedback is submitted
   - Notify users when feedback status changes

2. **Feedback Categories**
   - Predefined categories (UI, Performance, Content, etc.)
   - Category-based routing to different teams

3. **Feedback Attachments**
   - Allow users to attach screenshots/files
   - Store in Supabase Storage

4. **Feedback Voting**
   - Allow users to upvote similar feedback
   - Show most requested features

5. **Feedback Analytics**
   - Track feedback trends over time
   - Identify common issues
   - Measure resolution time

6. **Feedback Templates**
   - Pre-filled templates for common issues
   - Quick submission for known problems

---

## 📚 Related Documentation

- **Admin Dashboard**: `docs/features/admin-dashboard.md`
- **Database Migrations**: `supabase/migrations/20250115_33_add_user_feedback.sql`
- **API Routes**: `src/app/api/feedback/route.ts`, `src/app/api/admin/feedback/route.ts`
- **Components**: `src/components/feedback/`, `src/components/admin/FeedbackManagementClient.tsx`

---

## 🔄 Updates

- **2025-01-15**: Initial implementation completed
  - Database migration created
  - User feedback form and page implemented
  - Admin feedback dashboard implemented
  - i18n support added
  - RLS policies configured
  - All features tested and working

---

**Last Updated**: 2025-01-15

