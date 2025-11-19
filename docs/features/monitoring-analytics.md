# Monitoring & Analytics System - BranchFeed

ეს დოკუმენტაცია აღწერს Monitoring & Analytics System-ის იმპლემენტაციას BranchFeed-ში.

---

> ✅ **სტატუსი: COMPLETED** (2025-01-15) — Monitoring & Analytics System სრულად იმპლემენტირებულია და მუშაობს.
>
> **Implementation Status**: ყველა core feature დასრულებულია:
> - ✅ Event tracking database table
> - ✅ Event recording API
> - ✅ Monitoring dashboard for admins
> - ✅ Real-time metrics updates
> - ✅ Error tracking integration
> - ✅ Performance metrics tracking
> - ✅ i18n support (5 languages)

## 📋 Overview

Monitoring & Analytics System არის პლატფორმა, რომელიც საშუალებას აძლევს:
- **Track user actions** - page views, feature usage, user interactions
- **Monitor errors** - error events with stack traces and metadata
- **Track performance** - API response times, operation durations
- **Analyze usage** - feature usage patterns, popular pages
- **Real-time monitoring** - live dashboard for admins

**Admin Route**: `/admin/monitoring` (protected route, admin-only access)

**Status**: ✅ **COMPLETED** - Monitoring & Analytics System fully implemented (2025-01-15)

---

## 🚦 Phase & Priorities

Monitoring & Analytics System არის **Post-MVP** ფუნქცია, რომელიც **სრულად იმპლემენტირებულია** (2025-01-15).

### ✅ Implementation Complete

ყველა core feature დასრულებულია:
- ✅ Database migration (`platform_events` table with RLS policies)
- ✅ Event recording API (`/api/events`)
- ✅ Admin monitoring API (`/api/admin/monitoring`)
- ✅ Monitoring dashboard component (`MonitoringDashboardClient`)
- ✅ Event tracking utility functions (`src/lib/events.ts`)
- ✅ Real-time auto-refresh (30 seconds)
- ✅ i18n support (Georgian, English, German, Russian, French)

---

## 🎯 Features

### Event Tracking

#### Event Types

1. **page_view** - Page views
2. **feature_used** - Feature usage (e.g., "search_used", "filter_applied")
3. **error** - Error events (with error message and stack trace)
4. **performance** - Performance metrics (with duration in milliseconds)
5. **user_action** - User interactions (e.g., "story_liked", "comment_posted")
6. **api_call** - API calls (with status code and duration)
7. **database_query** - Database queries (with duration)

#### Event Severity Levels

- **info** - Informational events (default)
- **warning** - Warning events
- **error** - Error events
- **critical** - Critical errors

---

### Admin Monitoring Dashboard

**Route**: `/admin/monitoring`  
**Component**: `src/components/admin/MonitoringDashboardClient.tsx`

**Features**:
- Real-time event statistics
- Error tracking and display
- Performance metrics
- Event counts by type
- Recent events list
- Auto-refresh (every 30 seconds)
- Time period selection (1h, 24h, 7d, 30d)

**Access**: Admin only (requires `canViewAnalytics` permission)

---

## 🗄️ Database Schema

### `platform_events` Table

**Migration**: `supabase/migrations/20250115_34_add_event_tracking.sql`

**Columns**:
- `id` (UUID, PRIMARY KEY)
- `event_type` (TEXT, CHECK: 'page_view' | 'feature_used' | 'error' | 'performance' | 'user_action' | 'api_call' | 'database_query')
- `event_name` (TEXT, NOT NULL)
- `user_id` (UUID, FOREIGN KEY → profiles.id, nullable)
- `session_id` (TEXT, nullable)
- `metadata` (JSONB, DEFAULT '{}'::jsonb)
- `severity` (TEXT, CHECK: 'info' | 'warning' | 'error' | 'critical')
- `duration_ms` (INTEGER, nullable)
- `status_code` (INTEGER, nullable)
- `error_message` (TEXT, nullable)
- `error_stack` (TEXT, nullable)
- `created_at` (TIMESTAMPTZ, DEFAULT NOW())

**Indexes**:
- `idx_platform_events_type` on `event_type`
- `idx_platform_events_name` on `event_name`
- `idx_platform_events_user_id` on `user_id` (WHERE user_id IS NOT NULL)
- `idx_platform_events_created_at` on `created_at DESC`
- `idx_platform_events_severity` on `severity` (WHERE severity IN ('error', 'critical'))
- `idx_platform_events_type_created` on `event_type, created_at DESC`

**Functions**:
- `get_event_stats()` - Returns event statistics grouped by type and name
- `cleanup_old_events()` - Deletes events older than 90 days (for cleanup)

**RLS Policies**:
- Users can read their own events
- Anyone (authenticated) can create events
- Admins can read all events (using `is_admin(auth.uid())`)
- Admins can delete events (using `is_admin(auth.uid())`)

---

## 🔌 API Routes

### Event Recording API

#### `POST /api/events`

**Purpose**: Record a platform event

**Request Body**:
```typescript
{
  event_type: 'page_view' | 'feature_used' | 'error' | 'performance' | 'user_action' | 'api_call' | 'database_query'
  event_name: string
  user_id?: string | null
  session_id?: string
  metadata?: Record<string, any>
  severity?: 'info' | 'warning' | 'error' | 'critical'
  duration_ms?: number
  status_code?: number
  error_message?: string
  error_stack?: string
}
```

**Response**:
```typescript
{
  success: boolean
  event?: PlatformEvent
}
```

**Access**: Public (silently fails if recording fails)

#### `GET /api/events`

**Purpose**: Fetch events (admin only)

**Query Parameters**:
- `event_type` (string, optional filter)
- `event_name` (string, optional filter)
- `severity` (string, optional filter)
- `user_id` (string, optional filter)
- `start_date` (string, ISO date, optional)
- `end_date` (string, ISO date, optional)
- `limit` (number, default: 100)
- `offset` (number, default: 0)

**Response**:
```typescript
{
  events: PlatformEvent[]
  total: number
  limit: number
  offset: number
}
```

**Access**: Admin only

---

### Admin Monitoring API

#### `GET /api/admin/monitoring`

**Purpose**: Get real-time monitoring data

**Query Parameters**:
- `period` (string, default: '24h') - '1h' | '24h' | '7d' | '30d'

**Response**:
```typescript
{
  period: string
  startDate: string
  endDate: string
  summary: {
    totalEvents: number
    errorCount: number
    errorRate: number
    eventCountsByType: Record<string, number>
  }
  eventStats: Array<{
    event_type: string
    event_name: string
    count: number
    avg_duration_ms: number
    error_count: number
  }>
  errorEvents: Array<PlatformEvent>
  performanceMetrics: Record<string, { count: number; avgDuration: number }>
  recentEvents: Array<PlatformEvent>
}
```

**Access**: Admin only (requires `canViewAnalytics` permission)

---

## 🎨 UI Components

### MonitoringDashboardClient

**Location**: `src/components/admin/MonitoringDashboardClient.tsx`

**Features**:
- Summary cards (Total Events, Errors, Error Rate, Event Types)
- Event counts by type
- Recent errors display
- Performance metrics
- Recent events list
- Auto-refresh toggle
- Time period selector

---

## 🛠️ Utility Functions

### Event Recording Utilities

**Location**: `src/lib/events.ts`

**Functions**:
- `recordEvent(data: EventData)` - Record any event
- `recordPageView(page: string, metadata?)` - Record page view
- `recordFeatureUsed(feature: string, metadata?)` - Record feature usage
- `recordError(errorName, errorMessage, errorStack?, severity?, metadata?)` - Record error
- `recordPerformance(operation: string, durationMs: number, metadata?)` - Record performance metric
- `recordUserAction(action: string, metadata?)` - Record user action
- `recordApiCall(endpoint, method, statusCode, durationMs?, metadata?)` - Record API call

**Usage Example**:
```typescript
import { recordPageView, recordError, recordFeatureUsed } from '@/lib/events'

// Record page view
await recordPageView('/feed', { sort: 'trending' })

// Record feature usage
await recordFeatureUsed('search', { query: 'adventure' })

// Record error
await recordError('API_ERROR', 'Failed to fetch stories', error.stack, 'error', { endpoint: '/api/stories' })
```

---

## 🔒 Security

### Row Level Security (RLS)

**User Policies**:
- Users can read their own events
- Anyone (authenticated) can create events

**Admin Policies**:
- Admins can read all events (using `is_admin(auth.uid())`)
- Admins can delete events (using `is_admin(auth.uid())`)

### API Security

- Event recording: Public (silently fails if recording fails)
- Event fetching: Admin only
- Monitoring data: Admin only (requires `canViewAnalytics` permission)

---

## 📝 Usage Examples

### Recording Events in Code

```typescript
// In a component
import { recordPageView, recordFeatureUsed } from '@/lib/events'

useEffect(() => {
  recordPageView('/feed')
}, [])

const handleSearch = async (query: string) => {
  await recordFeatureUsed('search', { query })
  // ... search logic
}
```

### Error Tracking

```typescript
import { recordError } from '@/lib/events'

try {
  // ... code that might fail
} catch (error) {
  await recordError(
    'FETCH_STORIES_ERROR',
    error.message,
    error.stack,
    'error',
    { endpoint: '/api/stories' }
  )
  // ... handle error
}
```

### Performance Tracking

```typescript
import { recordPerformance } from '@/lib/events'

const startTime = Date.now()
// ... operation
const duration = Date.now() - startTime
await recordPerformance('load_feed', duration, { storyCount: stories.length })
```

---

## 🧪 Testing

### Manual Testing Checklist

- [x] Events can be recorded via API
- [x] Admin can view monitoring dashboard
- [x] Auto-refresh works (updates every 30 seconds)
- [x] Time period selection works
- [x] Error events are displayed correctly
- [x] Performance metrics are calculated correctly
- [x] Event counts by type are accurate
- [x] RLS policies work correctly (users see only own, admins see all)
- [x] i18n translations work for all languages

---

## 🐛 Known Issues

None currently.

---

## 🔮 Future Enhancements

### Potential Improvements

1. **Event Aggregation**
   - Pre-aggregated event statistics table
   - Faster queries for large datasets

2. **Alerting System**
   - Email/Slack notifications for critical errors
   - Threshold-based alerts (error rate > 1%)

3. **Event Retention**
   - Configurable retention period
   - Automatic cleanup based on retention policy

4. **Advanced Analytics**
   - Event trends over time
   - User behavior analysis
   - Feature adoption metrics

5. **Export Functionality**
   - Export events to CSV/JSON
   - Scheduled reports

6. **Real-time WebSocket Updates**
   - Live event stream
   - Real-time dashboard updates

---

## 📚 Related Documentation

- **Admin Dashboard**: `docs/features/admin-dashboard.md`
- **Database Migrations**: `supabase/migrations/20250115_34_add_event_tracking.sql`
- **API Routes**: `src/app/api/events/route.ts`, `src/app/api/admin/monitoring/route.ts`
- **Components**: `src/components/admin/MonitoringDashboardClient.tsx`
- **Utilities**: `src/lib/events.ts`

---

## 🔄 Updates

- **2025-01-15**: Initial implementation completed
  - Database migration created
  - Event recording API implemented
  - Admin monitoring dashboard implemented
  - Event tracking utilities created
  - i18n support added
  - RLS policies configured
  - All features tested and working

---

**Last Updated**: 2025-01-15

