# Admin Dashboard - BranchFeed

ეს დოკუმენტაცია აღწერს Admin Dashboard-ის იმპლემენტაციას BranchFeed-ში.

---

## 📋 Overview

Admin Dashboard არის პლატფორმის მართვის ინსტრუმენტი, რომელიც საშუალებას აძლევს ადმინისტრატორებს:
- მართონ მომხმარებლები
- მოდერირებენ კონტენტს (stories, posts)
- ხედავენ analytics და statistics
- კონტროლირებენ პლატფორმის settings

**Route**: `/admin` (protected route, admin-only access)

**Status**: ⚠️ **Not in MVP** - This is a Phase 3+ feature. See `PROJECT_PRIORITIES.md` for priority order.

---

## 🚦 Phase & Priorities

Admin Dashboard არის **Phase 3+** ფუნქცია და არ ეკუთვნის საწყის MVP-ს.

- სანამ `PROJECT_PRIORITIES.md`-ში Phase 1 და Phase 2 არ იქნება დასრულებული (Database, Auth, Feed, Branching Stories),
  **არ უნდა შეიქმნას**:
  - `/admin` როუტები
  - Admin UI კომპონენტები
  - Admin-საჭირო SQL ცხრილები და RLS პოლიტიკები

ამ დოკუმენტის მიზანია **დაგეგმვა** და არა იმპლემენტაცია საწყის ეტაპზე.

როდესაც მივალთ Phase 3 ეტაპზე, Cursor ამ დოკზე დაყრდნობით შექმნის საჭირო კოდს და SQL-ს.

---

## 🎯 Features

### Core Features (Phase 3+)

1. **Platform Statistics**
   - Total users count
   - Active users (last 24h, 7d, 30d)
   - Total stories/posts count
   - Engagement metrics
   - Revenue statistics (if monetization enabled)

2. **User Management**
   - View all users
   - Search/filter users
   - View user details
   - Suspend/ban users
   - Assign admin roles
   - View user activity

3. **Content Moderation**
   - View reported content
   - Review stories/posts
   - Delete inappropriate content
   - Ban content creators
   - Content approval workflow

4. **Analytics Dashboard**
   - Platform growth metrics
   - Content performance
   - User engagement trends
   - Popular stories/paths
   - Branching analytics

### Branching Analytics (BranchFeed-სპეციფიკური)

Admin Dashboard-ის ანალიტიკის ნაწილი აუცილებლად უნდა ითვალისწინებდეს BranchFeed-ის უნიკალურობას:

- **Path Popularity** – რომელი გზები (paths) არის ყველაზე ხშირად არჩეული

- **Drop-off Points** – რომელ ნაბიჯზე ტოვებენ მომხმარებლები branching story-ს

- **Story Completion Rate** – რამდენმა მომხმარებელმა დაიტოვა story სრული დასრულებით

- **A/B Variants Comparison** – ერთი და იმავე root story-ზე რომელი არჩევანი უკეთ მუშაობს (engagement, completion)

ამ მეტრიკებისთვის საჭირო იქნება:

- დამატებითი ცხრილები (მაგ. `story_paths`, `story_path_events`) – აღწერილი იქნება `DATABASE.md`-ში

- სპეციალური aggregation queries, რომლებსაც UI-ში Charts/Graphs სექცია გამოიყენებს.

5. **System Settings**
   - Platform configuration
   - Feature flags
   - Maintenance mode
   - Email templates
   - Notification settings

---

## 🔐 Admin Roles & Permissions

### Admin Role Levels

1. **Super Admin**
   - Full access to all features
   - Can manage other admins
   - System settings access
   - Database access (read-only recommended)

2. **Admin**
   - User management
   - Content moderation
   - Analytics access
   - Cannot manage other admins

3. **Moderator**
   - Content moderation only
   - View reports
   - Delete content
   - Cannot manage users

4. **Support**
   - View user information
   - View content
   - Limited actions
   - Cannot delete or ban

### Permission System

```typescript
// src/types/admin.ts
export type AdminRole = 'super_admin' | 'admin' | 'moderator' | 'support';

export interface AdminPermissions {
  canManageUsers: boolean;
  canModerateContent: boolean;
  canViewAnalytics: boolean;
  canManageAdmins: boolean;
  canAccessSettings: boolean;
  canDeleteContent: boolean;
  canBanUsers: boolean;
}

export const rolePermissions: Record<AdminRole, AdminPermissions> = {
  super_admin: {
    canManageUsers: true,
    canModerateContent: true,
    canViewAnalytics: true,
    canManageAdmins: true,
    canAccessSettings: true,
    canDeleteContent: true,
    canBanUsers: true,
  },
  admin: {
    canManageUsers: true,
    canModerateContent: true,
    canViewAnalytics: true,
    canManageAdmins: false,
    canAccessSettings: false,
    canDeleteContent: true,
    canBanUsers: true,
  },
  moderator: {
    canManageUsers: false,
    canModerateContent: true,
    canViewAnalytics: false,
    canManageAdmins: false,
    canAccessSettings: false,
    canDeleteContent: true,
    canBanUsers: false,
  },
  support: {
    canManageUsers: false,
    canModerateContent: false,
    canViewAnalytics: false,
    canManageAdmins: false,
    canAccessSettings: false,
    canDeleteContent: false,
    canBanUsers: false,
  },
};
```

---

## 👑 First Admin Creation (Manual Only)

საწყის ვერსიაში ადმინების შექმნა უნდა იყოს მხოლოდ **ხელით (manual)** და არა UI-დან:

- პირველი `super_admin` იწერება Supabase-ში **SQL სკრიპტით** (`DATABASE.md`-ში იქნება ზუსტი მაგალითი)

- ჩვეულებრივი მომხმარებლისთვის **არ არსებობს UI**, სადაც თვითონ გადაიქცევა ადმინად

- Admin როლის მინიჭება / შეცვლა ხდება მხოლოდ:
  - ხელით SQL-სკრიპტით
  - ან სპეციალური internal admin-ინსტრუმენტით (მომავალში)

მნიშვნელოვანია, რომ:

- საჯარო API-სა და UI-ში **არ იყოს** „Become admin" ან მსგავსი გზები

- ყველა admin ცვლილება უნდა ჩაიწეროს `admin_audit_logs` ცხრილში (ვინ, ვის, როდის).

---

## 📐 Page Layout

### Structure

```
┌─────────────────────────────────────┐
│  Admin Header                       │
│  [Logo] Admin Dashboard             │
│  [User] [Logout]                    │
├─────────────────────────────────────┤
│  Sidebar Navigation                 │
│  [Overview]                         │
│  [Users]                            │
│  [Moderation]                       │
│  [Analytics]                        │
│  [Settings]                         │
├─────────────────────────────────────┤
│  Main Content Area                  │
│  [Stats Cards]                      │
│  [Data Tables]                      │
│  [Charts/Graphs]                    │
└─────────────────────────────────────┘
```

### Layout Components

1. **AdminHeader** - Logo, title, user info, logout
2. **AdminSidebar** - Navigation menu (Overview, Users, Moderation, Analytics, Settings)
3. **AdminContent** - Main content area with tabs/sections
4. **StatsCards** - Platform statistics cards
5. **DataTables** - User/content tables with filters
6. **Charts** - Analytics charts and graphs

---

## 🎨 UI Components

### AdminHeader Component

```typescript
// src/components/admin/AdminHeader.tsx
'use client';

import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';

export function AdminHeader() {
  const { user, signOut } = useAuth();
  const { t } = useTranslation();
  
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900">
            {t('admin.dashboard.title')}
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{user?.email}</span>
          <button
            onClick={signOut}
            className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
          >
            {t('admin.logout')}
          </button>
        </div>
      </div>
    </header>
  );
}
```

**UI Style** (see `UI_STYLE_GUIDE.md`):
- Header: `bg-white border-b border-gray-200`
- Title: `text-2xl font-bold`
- Logout button: Ghost button style

### AdminSidebar Component

```typescript
// src/components/admin/AdminSidebar.tsx
'use client';

import { usePathname } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import { useAdminPermissions } from '@/hooks/useAdminPermissions';

export function AdminSidebar() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const { permissions } = useAdminPermissions();
  
  const menuItems = [
    { id: 'overview', label: t('admin.sidebar.overview'), path: '/admin', icon: '📊' },
    { id: 'users', label: t('admin.sidebar.users'), path: '/admin/users', icon: '👥', requires: permissions.canManageUsers },
    { id: 'moderation', label: t('admin.sidebar.moderation'), path: '/admin/moderation', icon: '🛡️', requires: permissions.canModerateContent },
    { id: 'analytics', label: t('admin.sidebar.analytics'), path: '/admin/analytics', icon: '📈', requires: permissions.canViewAnalytics },
    { id: 'settings', label: t('admin.sidebar.settings'), path: '/admin/settings', icon: '⚙️', requires: permissions.canAccessSettings },
  ].filter(item => item.requires !== false);
  
  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.id}>
              <a
                href={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  pathname === item.path
                    ? 'bg-primary-50 text-primary-700 font-semibold'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
```

**UI Style**:
- Sidebar: `w-64 bg-white border-r`
- Active item: `bg-primary-50 text-primary-700`
- Inactive item: `text-gray-700 hover:bg-gray-100`

### StatsCards Component

```typescript
// src/components/admin/StatsCards.tsx
'use client';

interface StatsCardsProps {
  stats: {
    totalUsers: number;
    activeUsers: number;
    totalStories: number;
    totalPosts: number;
    totalLikes: number;
    totalViews: number;
  };
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <div className="text-sm text-gray-500 mb-2">Total Users</div>
        <div className="text-3xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</div>
      </div>
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <div className="text-sm text-gray-500 mb-2">Active Users (24h)</div>
        <div className="text-3xl font-bold text-gray-900">{stats.activeUsers.toLocaleString()}</div>
      </div>
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <div className="text-sm text-gray-500 mb-2">Total Stories</div>
        <div className="text-3xl font-bold text-gray-900">{stats.totalStories.toLocaleString()}</div>
      </div>
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <div className="text-sm text-gray-500 mb-2">Total Posts</div>
        <div className="text-3xl font-bold text-gray-900">{stats.totalPosts.toLocaleString()}</div>
      </div>
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <div className="text-sm text-gray-500 mb-2">Total Likes</div>
        <div className="text-3xl font-bold text-gray-900">{stats.totalLikes.toLocaleString()}</div>
      </div>
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <div className="text-sm text-gray-500 mb-2">Total Views</div>
        <div className="text-3xl font-bold text-gray-900">{stats.totalViews.toLocaleString()}</div>
      </div>
    </div>
  );
}
```

**UI Style** (see `UI_STYLE_GUIDE.md`):
- Cards: `bg-white rounded-2xl border border-gray-200 shadow-sm`
- Grid: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`

---

## 🔧 Implementation

### Admin Dashboard Route

```typescript
// app/admin/page.tsx
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { isAdmin } from '@/lib/admin';
import { AdminDashboardClient } from '@/components/admin/AdminDashboardClient';
import { getAdminStats } from '@/lib/api/admin';

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();
  
  // Check if user is admin
  if (!user || !(await isAdmin(user.id))) {
    redirect('/');
  }
  
  // Fetch admin statistics
  const stats = await getAdminStats();
  
  return <AdminDashboardClient stats={stats} />;
}
```

### Admin Access Control Hook

```typescript
// src/hooks/useAdminPermissions.ts
'use client';

import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';
import { getAdminPermissions } from '@/lib/api/admin';

export function useAdminPermissions() {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<AdminPermissions | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (user) {
      getAdminPermissions(user.id)
        .then(setPermissions)
        .catch(() => setPermissions(null))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);
  
  return { permissions, loading, isAdmin: permissions !== null };
}
```

### Admin Dashboard Client Component

```typescript
// src/components/admin/AdminDashboardClient.tsx
'use client';

import { AdminHeader } from './AdminHeader';
import { AdminSidebar } from './AdminSidebar';
import { StatsCards } from './StatsCards';
import { UserManagement } from './UserManagement';
import { ContentModeration } from './ContentModeration';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { AdminSettings } from './AdminSettings';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

interface AdminDashboardClientProps {
  stats: {
    totalUsers: number;
    activeUsers: number;
    totalStories: number;
    totalPosts: number;
    totalLikes: number;
    totalViews: number;
  };
}

export function AdminDashboardClient({ stats }: AdminDashboardClientProps) {
  const pathname = usePathname();
  
  const renderContent = () => {
    if (pathname === '/admin') {
      return <StatsCards stats={stats} />;
    }
    if (pathname === '/admin/users') {
      return <UserManagement />;
    }
    if (pathname === '/admin/moderation') {
      return <ContentModeration />;
    }
    if (pathname === '/admin/analytics') {
      return <AnalyticsDashboard />;
    }
    if (pathname === '/admin/settings') {
      return <AdminSettings />;
    }
    return <StatsCards stats={stats} />;
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
```

---

## 📊 Database Schema

### Admin Tables

```sql
-- Admin roles table
CREATE TABLE admin_roles (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'admin', 'moderator', 'support')),
  permissions JSONB, -- Custom permissions override
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Audit logs for admin actions
CREATE TABLE admin_audit_logs (
  id UUID PRIMARY KEY,
  admin_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL, -- 'user_banned', 'content_deleted', 'role_assigned', etc.
  target_type TEXT, -- 'user', 'story', 'post', etc.
  target_id UUID,
  details JSONB, -- Additional action details
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Content reports (for moderation)
CREATE TABLE content_reports (
  id UUID PRIMARY KEY,
  reporter_id UUID REFERENCES profiles(id),
  content_type TEXT NOT NULL CHECK (content_type IN ('story', 'post', 'comment')),
  content_id UUID NOT NULL,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  admin_id UUID REFERENCES profiles(id), -- Admin who handled the report
  created_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP
);
```

> ℹ️ **შენიშვნა**
>
> Admin-თან დაკავშირებული ცხრილები (`admin_roles`, `admin_audit_logs`, `content_reports` და branching analytics ცხრილები)
> დეტალურად აიწერება `docs/DATABASE.md`-ში და მათი მიგრაციები შესრულდება მხოლოდ მაშინ,
> როცა პროექტი მივა Phase 3 ეტაპზე.

---

## 🛡️ Security Layer (Server-Only Admin)

Admin Dashboard-სთვის დაცვა უნდა იყოს მრავალშრიანი:

1. **Route Protection (Next.js დონე)**
   - `/admin` და მისი ქვერგვეთები დაცულია server component-ებიდან `isAdmin()` შემოწმებით
   - არ გამოიყენება client-side `redirect` როგორც ერთადერთი დაცვა

2. **Server-Only API**
   - ყველა admin ქმედება (ban, delete, approve) უნდა ხდებოდეს მხოლოდ
     `/api/admin/...` server route-ებიდან
   - client-იდან არ ხდება პირდაპირ Supabase სქემა/ცხრილებზე წვდომა

3. **RLS + SQL Functions**
   - RLS პოლიტიკები ეფუძნება `is_admin(auth.uid())` და `has_admin_permission(...)` ფუნქციებს
   - ყველა პოლიტიკა და ფუნქცია უნდა იყოს `do $$ ... end $$;` ბლოკში, როგორც აღწერილია `.cursorrules` და `DATABASE.md` დოკებში

4. **Audit Logging**
   - ყველა მნიშვნელოვანი admin ქმედება (user_banned, content_deleted, role_changed და ა.შ.)
     უნდა ჩაიწეროს `admin_audit_logs` ცხრილში
   - ეს არის პლატფორმის უსაფრთხოების „შავი ყუთი".

---

## 🔐 RLS Policies for Admin

### Admin Access Control

```sql
-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_roles
    WHERE admin_roles.user_id = is_admin.user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check admin permissions
CREATE OR REPLACE FUNCTION has_admin_permission(
  user_id UUID,
  permission TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
  user_perms JSONB;
BEGIN
  SELECT role, permissions INTO user_role, user_perms
  FROM admin_roles
  WHERE admin_roles.user_id = has_admin_permission.user_id;
  
  IF user_role IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check role-based permissions
  -- (Implementation depends on permission system)
  
  RETURN TRUE; -- Simplified for MVP
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### RLS Policies

```sql
-- Admin can view all profiles (for user management)
CREATE POLICY "Admins can view all profiles"
ON profiles FOR SELECT
TO authenticated
USING (
  is_admin(auth.uid())
);

-- Admin can view all stories (for moderation)
CREATE POLICY "Admins can view all stories"
ON stories FOR SELECT
TO authenticated
USING (
  is_admin(auth.uid())
);

-- Admin can delete content (for moderation)
CREATE POLICY "Admins can delete stories"
ON stories FOR DELETE
TO authenticated
USING (
  is_admin(auth.uid()) AND has_admin_permission(auth.uid(), 'canDeleteContent')
);
```

> ⚠️ **Important**: All RLS policies must use `do $$ ... end $$;` block syntax as per `.cursorrules`. See `docs/DATABASE.md` for detailed RLS policy examples.

---

## 🌐 Internationalization (i18n)

### Translation Keys

Add to translation files (see `features/i18n-language-switcher.md`):

```json
{
  "admin": {
    "dashboard": {
      "title": "Admin Dashboard"
    },
    "sidebar": {
      "overview": "Overview",
      "users": "Users",
      "moderation": "Moderation",
      "analytics": "Analytics",
      "settings": "Settings"
    },
    "stats": {
      "totalUsers": "Total Users",
      "activeUsers": "Active Users",
      "totalStories": "Total Stories",
      "totalPosts": "Total Posts",
      "totalLikes": "Total Likes",
      "totalViews": "Total Views"
    },
    "logout": "Logout"
  }
}
```

**Georgian translations**:
```json
{
  "admin": {
    "dashboard": {
      "title": "ადმინისტრატორის პანელი"
    },
    "sidebar": {
      "overview": "მიმოხილვა",
      "users": "მომხმარებლები",
      "moderation": "მოდერაცია",
      "analytics": "ანალიტიკა",
      "settings": "პარამეტრები"
    }
  }
}
```

---

## 🎨 Related Documentation

- **UI Components**: See `UI_STYLE_GUIDE.md` for:
  - Button styles (Primary, Secondary, Outline, Ghost, Danger)
  - Card components
  - Table components
  - Modal styles
  
- **i18n**: See `features/i18n-language-switcher.md` for:
  - Translation file structure
  - How to use translations in components
  - Translation keys naming convention

- **Database**: See `docs/DATABASE.md` (to be created) for:
  - Admin tables schema
  - RLS policies
  - Admin functions

---

## ✅ Requirements Checklist

- [ ] Admin roles system implemented
- [ ] Admin access control (isAdmin check)
- [ ] AdminHeader component created
- [ ] AdminSidebar component created
- [ ] StatsCards component created
- [ ] UserManagement component created
- [ ] ContentModeration component created
- [ ] AnalyticsDashboard component created
- [ ] AdminSettings component created
- [ ] Admin dashboard route (`/admin`) implemented
- [ ] Admin permissions hook implemented
- [ ] RLS policies for admin access
- [ ] Admin audit logging
- [ ] Content reporting system
- [ ] i18n translations added
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Error handling
- [ ] Loading states

---

## 🔄 Future Enhancements

- **Advanced Analytics**: 
  - Real-time charts
  - Export data (CSV, PDF)
  - Custom date ranges
  - Branching story analytics (path popularity, completion rates)

- **Advanced Moderation**:
  - AI-powered content filtering
  - Automated moderation rules
  - Bulk actions
  - Moderation queue

- **User Management**:
  - Bulk user actions
  - User import/export
  - Advanced search and filters
  - User activity timeline

- **System Monitoring**:
  - Server health monitoring
  - Error tracking
  - Performance metrics
  - Database statistics

---

## 📝 Notes

> ⚠️ **მნიშვნელოვანი დაზუსტება (Admin ≠ MVP)**
>
> სანამ `ESSENTIAL_FEATURES.md`-ში ჩამოთვლილი ფუნქციები (Auth, Feed, Branching Stories, Profile) სრულად არ იმუშავებს Production დონეზე,
> Admin Dashboard-ზე **არ ვიწყებთ კოდს**:
> - არ ვქმნით `/admin` გვერდს
> - არ ვამატებთ Admin კომპონენტებს
> - არ ვუშვებთ Admin ცხრილების მიგრაციებს Supabase-ზე
>
> ამ ეტაპზე Admin Dashboard არის მხოლოდ **დაგეგმარებული დოკუმენტაცია** მომავალი ფაზებისთვის.

- **Not in MVP**: Admin dashboard is Phase 3+ feature (see `PROJECT_PRIORITIES.md`)
- **Access Control**: Only users with admin roles can access `/admin` route
- **Security**: All admin actions should be logged in audit_logs table
- **RLS Policies**: Admin RLS policies must follow `do $$ ... end $$;` block syntax
- **BranchFeed Specific**: Admin dashboard should include branching story analytics (path popularity, completion rates)

---

**Last Updated**: 2025-01-XX  
**Version**: 1.0  
**Status**: Phase 3+ (Not in MVP)

