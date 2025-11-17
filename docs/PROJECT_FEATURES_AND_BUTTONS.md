# Project Features & Buttons Documentation - BranchFeed

ეს დოკუმენტაცია აღწერს პროექტში არსებულ ყველა ფუნქციას, ღილაკს და action-ს.

**Last Updated**: 2025-01-15

---

## 📋 Table of Contents

1. [Header Navigation](#header-navigation)
2. [Landing Page](#landing-page)
3. [Authentication Pages](#authentication-pages)
4. [Feed Page](#feed-page)
5. [Story Detail Page](#story-detail-page)
6. [Create Story Page](#create-story-page)
7. [Profile Page](#profile-page)
8. [Settings Page](#settings-page)
9. [Admin Dashboard](#admin-dashboard)
10. [Footer](#footer)

---

## 🧭 Header Navigation

**Location**: `src/components/Header.tsx`  
**Route**: ყველა გვერდზე (except auth pages)

### Navigation Links (Desktop & Mobile)

#### Authenticated Users

1. **🌿 Logo (BranchFeed)**
   - **Action**: Navigate to `/` (redirects to `/feed` if authenticated)
   - **Location**: Left side of header
   - **Type**: Link

2. **Feed**
   - **Action**: Navigate to `/feed`
   - **Route**: `/feed`
   - **Type**: Link
   - **Condition**: Only visible when authenticated
   - **Active State**: Highlighted when on `/feed`

3. **Create**
   - **Action**: Navigate to `/create`
   - **Route**: `/create`
   - **Type**: Link
   - **Condition**: Only visible when authenticated
   - **Active State**: Highlighted when on `/create`

4. **👑 Admin**
   - **Action**: Navigate to `/admin`
   - **Route**: `/admin`
   - **Type**: Link
   - **Condition**: Only visible when user has admin role
   - **Active State**: Highlighted when on any `/admin/*` route
   - **Color**: Yellow accent

5. **Features**
   - **Action**: Smooth scroll to `#features` section (if on `/`) or navigate to `/#features`
   - **Type**: Link with onClick handler
   - **Condition**: Only visible when NOT authenticated

6. **About**
   - **Action**: Navigate to `/about`
   - **Route**: `/about`
   - **Type**: Link
   - **Active State**: Highlighted when on `/about`

### Right Side Actions

#### Language Switcher
- **Component**: `LanguageSwitcher`
- **Action**: Change application language
- **Available Languages**: English, Georgian, Russian, German, French
- **Type**: Dropdown/Button
- **Location**: Right side of header

#### Authentication Buttons (Not Authenticated)

1. **Sign In**
   - **Action**: Navigate to `/signin`
   - **Route**: `/signin`
   - **Type**: Link
   - **Style**: Text link

2. **Sign Up**
   - **Action**: Navigate to `/signup`
   - **Route**: `/signup`
   - **Type**: Button (primary variant)
   - **Style**: Primary button with shadow

#### User Menu (Authenticated)

**Trigger Button**:
- **Action**: Toggle user menu dropdown
- **Type**: Button
- **Content**: User avatar (or initial) + username/email
- **Location**: Right side of header

**Menu Items**:

1. **Profile**
   - **Action**: Navigate to `/profile` (current user's profile)
   - **Route**: `/profile`
   - **Type**: Link
   - **Icon**: None

2. **Settings**
   - **Action**: Navigate to `/settings`
   - **Route**: `/settings`
   - **Type**: Link
   - **Icon**: None

3. **👑 Admin** (if admin)
   - **Action**: Navigate to `/admin`
   - **Route**: `/admin`
   - **Type**: Link
   - **Condition**: Only visible when user has admin role
   - **Color**: Yellow accent

4. **Sign Out**
   - **Action**: Sign out user and redirect to `/`
   - **Type**: Button
   - **Style**: Destructive (red text)

### Mobile Menu

- **Trigger**: Hamburger menu button (mobile only)
- **Action**: Toggle mobile navigation menu
- **Content**: Same navigation links as desktop, stacked vertically

---

## 🏠 Landing Page

**Route**: `/`  
**Location**: `src/app/page.tsx`

### Components

1. **HeroSection**
   - **Purpose**: Main landing section with CTA
   - **Buttons**:
     - **Get Started** / **Sign Up**: Navigate to `/signup`
     - **Learn More**: Smooth scroll to Features section

2. **FeaturesSection**
   - **Purpose**: Showcase platform features
   - **ID**: `features` (for anchor links)
   - **Actions**: None (display only)

### Redirect Logic

- **If authenticated**: Automatically redirects to `/feed`
- **If not authenticated**: Shows landing page

---

## 🔐 Authentication Pages

### Sign In Page

**Route**: `/signin`  
**Location**: `src/app/signin/page.tsx`

#### Form Fields

1. **Email Input**
   - **Type**: Email input
   - **Required**: Yes
   - **Validation**: Email format

2. **Password Input**
   - **Type**: Password input
   - **Required**: Yes
   - **Show/Hide**: Toggle button available

#### Buttons

1. **Sign In**
   - **Action**: Submit form and authenticate user
   - **Type**: Submit button (primary)
   - **On Success**: Redirect to `/feed` or `redirectTo` query param

2. **Sign Up Link**
   - **Action**: Navigate to `/signup`
   - **Type**: Link
   - **Text**: "Don't have an account? Sign up"

3. **Back to Home**
   - **Action**: Navigate to `/`
   - **Type**: Link (in header)

### Sign Up Page

**Route**: `/signup`  
**Location**: `src/app/signup/page.tsx`

#### Form Fields

1. **Email Input**
   - **Type**: Email input
   - **Required**: Yes
   - **Validation**: Email format

2. **Password Input**
   - **Type**: Password input
   - **Required**: Yes
   - **Validation**: Strong password regex
   - **Show/Hide**: Toggle button available

3. **Confirm Password Input**
   - **Type**: Password input
   - **Required**: Yes
   - **Validation**: Must match password

4. **Username Input** (optional)
   - **Type**: Text input
   - **Required**: No
   - **Auto-generated**: If not provided

#### Buttons

1. **Sign Up**
   - **Action**: Submit form, create account, and authenticate
   - **Type**: Submit button (primary)
   - **On Success**: Redirect to `/feed` or `redirectTo` query param

2. **Sign In Link**
   - **Action**: Navigate to `/signin`
   - **Type**: Link
   - **Text**: "Already have an account? Sign in"

3. **Back to Home**
   - **Action**: Navigate to `/`
   - **Type**: Link (in header)

---

## 📰 Feed Page

**Route**: `/feed`  
**Location**: `src/app/feed/page.tsx`  
**Access**: Authenticated users only

### Features

1. **Story Cards Grid**
   - **Component**: `StoryCard`
   - **Action**: Click to navigate to `/story/[id]`
   - **Content**: Story thumbnail, title, author, stats

2. **Infinite Scroll**
   - **Action**: Automatically load more stories when scrolling
   - **Trigger**: Scroll to bottom
   - **Loading State**: Spinner at bottom

3. **Empty State**
   - **Condition**: No stories available
   - **Message**: "No stories yet"
   - **Action**: Link to `/create` to create first story

### Story Card Actions

1. **Card Click**
   - **Action**: Navigate to story detail page
   - **Route**: `/story/[id]`

2. **Author Click**
   - **Action**: Navigate to author profile
   - **Route**: `/profile/[id]`

---

## 📖 Story Detail Page

**Route**: `/story/[id]`  
**Location**: `src/app/story/[id]/page.tsx`  
**Access**: Public (authenticated users can interact)

### Story Information Section

1. **Author Avatar & Username**
   - **Action**: Navigate to author profile
   - **Route**: `/profile/[authorId]`
   - **Type**: Link

2. **Story Title**
   - **Type**: Display only

3. **Story Description**
   - **Type**: Display only

4. **Subscription Badge** (if author has subscription)
   - **Type**: Badge display
   - **Content**: Subscription tier (Supporter, Pro, VIP)

### Story Stats Bar

**Component**: `StoryStatsBar`

- **Likes Count**: Display only
- **Views Count**: Display only
- **Comments Count**: Display only

### Path Progress

**Component**: `PathProgress`

- **Purpose**: Show current position in story path
- **Content**: Visual progress indicator (e.g., "Step 2 of 5")
- **Path Display**: Shows current path (e.g., "A → B → A")
- **Type**: Display only

### Story Player

**Component**: `StoryPlayer`

- **Purpose**: Play story media (video/image)
- **Features**:
  - **Fullscreen Mode**: Toggle fullscreen
  - **Swipe Gestures**: 
    - Swipe right = Choice A
    - Swipe left = Choice B
  - **Poster Image**: Shows thumbnail before play
  - **Controls**: Play, pause, volume, fullscreen

### Choice Buttons

**Component**: `ChoiceButtons`

- **Purpose**: Make A/B choice to continue story
- **Buttons**:
  1. **Choice A Button**
     - **Action**: Select choice A and navigate to next node
     - **Type**: Button (primary variant)
     - **Label**: From `choiceA.label` or "A"
     - **Condition**: Only visible if not at max depth and has children

  2. **Choice B Button**
     - **Action**: Select choice B and navigate to next node
     - **Type**: Button (secondary variant)
     - **Label**: From `choiceB.label` or "B"
     - **Condition**: Only visible if not at max depth and has children

- **End of Path State**:
  - **Condition**: Reached max depth or no more choices
  - **Message**: "You've reached the end of this path!"
  - **Action**: Restart story (navigate to `/story/[id]` without path)

### Interaction Buttons

**Component**: `InteractionButtons`

1. **Like Button** ❤️
   - **Action**: Toggle like on story
   - **Type**: Button with icon
   - **State**: Shows liked/unliked state
   - **Count**: Displays like count
   - **Error Handling**: Shows subscription limit error if exceeded

2. **Comment Button** 💬
   - **Action**: Scroll to comment section
   - **Type**: Button with icon
   - **Count**: Displays comment count (if > 0)

3. **Share Button** 🔗
   - **Action**: Share story link
   - **Type**: Button with icon
   - **Behavior**:
     - Mobile: Native share dialog
     - Desktop: Copy link to clipboard
   - **Success**: Toast notification

4. **Report Button** 🚩
   - **Action**: Open report modal
   - **Type**: Icon button
   - **Component**: `ReportButton`
   - **Content Type**: "story"

5. **Views Count** 👁️
   - **Type**: Display only
   - **Content**: Total view count

### Comment Section

**Component**: `CommentSection`

1. **Comment Input**
   - **Type**: Textarea
   - **Placeholder**: "Write a comment..."
   - **Character Limit**: Configurable (default from env)
   - **Character Counter**: Shows remaining characters

2. **Post Comment Button**
   - **Action**: Submit comment
   - **Type**: Submit button
   - **Validation**: Required, max length
   - **Error Handling**: Shows subscription limit error if exceeded

3. **Comments List**
   - **Type**: List of comments
   - **Content**: Author, comment text, timestamp
   - **Actions**: None (display only)

### Additional Features

1. **Story Tree Viewer** (lazy loaded)
   - **Purpose**: Visualize entire story tree
   - **Type**: Expandable section
   - **Action**: Toggle expand/collapse

2. **Path Viewer** (lazy loaded)
   - **Purpose**: View all possible paths
   - **Type**: Expandable section
   - **Action**: Toggle expand/collapse

3. **Share Story Button** (lazy loaded)
   - **Action**: Open share modal
   - **Type**: Button
   - **Features**: Copy link, share to social media

---

## ✏️ Create Story Page

**Route**: `/create`  
**Location**: `src/app/create/page.tsx`  
**Access**: Authenticated users only

### Step Indicator

**Steps**: 3 steps total

1. **Step 1: Root Story** (current step highlighted)
2. **Step 2: Branches** (connected line)
3. **Step 3: Preview** (connected line)

### Step 1: Root Story Form

**Component**: `RootStoryForm`

#### Form Fields

1. **Title Input**
   - **Type**: Text input
   - **Required**: Yes
   - **Placeholder**: "Enter story title"

2. **Description Textarea**
   - **Type**: Textarea
   - **Required**: No
   - **Placeholder**: "Enter story description (optional)"

3. **Media Upload**
   - **Type**: File input
   - **Accepted Types**: Video (mp4, webm) or Image (jpg, png, gif)
   - **Max Size**: Configurable
   - **Preview**: Shows uploaded media preview
   - **Upload Progress**: Progress bar during upload

#### Buttons

1. **Next** / **Continue**
   - **Action**: Validate and proceed to Step 2
   - **Type**: Submit button (primary)
   - **Validation**: Title and media required

### Step 2: Branch Nodes Form

**Component**: `BranchNodesForm`

#### Features

1. **Add Branch Node Button**
   - **Action**: Add new branch node
   - **Type**: Button
   - **Max Depth**: 5 levels (configurable)

2. **Branch Node Editor** (for each node)
   - **Fields**:
     - **Content**: Textarea (node description)
     - **Choice A Label**: Text input
     - **Choice B Label**: Text input
     - **Media Upload**: File input (optional)
   - **Actions**:
     - **Delete Node**: Remove branch node
     - **Edit Node**: Edit node fields

3. **Back Button**
   - **Action**: Return to Step 1
   - **Type**: Button (outline)

4. **Next** / **Continue**
   - **Action**: Validate and proceed to Step 3
   - **Type**: Submit button (primary)
   - **Validation**: At least one branch node required

### Step 3: Preview

**Component**: `StoryPreview`

#### Features

1. **Story Preview**
   - **Content**: Shows root story and all branches
   - **Type**: Display only

2. **Back Button**
   - **Action**: Return to Step 2
   - **Type**: Button (outline)

3. **Publish Button**
   - **Action**: Create story and publish
   - **Type**: Button (primary)
   - **Loading State**: Shows loading spinner
   - **On Success**: 
     - Show success toast
     - Redirect to `/story/[id]` (new story)
   - **Error Handling**: 
     - Shows subscription limit error if exceeded
     - Shows validation errors
     - Shows upload errors

### Upload Progress

- **Component**: Progress bar
- **Shown**: During media upload
- **Content**: Percentage and file name

---

## 👤 Profile Page

**Route**: `/profile/[id]` or `/profile` (current user)  
**Location**: `src/app/profile/[id]/page.tsx`  
**Access**: Public (view), Authenticated (edit own profile)

### Profile Header

1. **Avatar**
   - **Type**: Image or initial circle
   - **Action**: None (display only)

2. **Username**
   - **Type**: Display only
   - **Content**: User's username or email

3. **Subscription Badge** (if user has subscription)
   - **Type**: Badge
   - **Content**: Subscription tier

4. **Bio** (if available)
   - **Type**: Display only

5. **Settings Button** (if own profile)
   - **Action**: Navigate to `/settings`
   - **Type**: Button (outline)
   - **Condition**: Only visible on own profile

### Profile Stats

**Grid**: 3 columns

1. **Stories Count**
   - **Type**: Stat card
   - **Content**: Number of stories created
   - **Color**: Brand cyan

2. **Total Likes**
   - **Type**: Stat card
   - **Content**: Total likes received
   - **Color**: Brand plum

3. **Total Views**
   - **Type**: Stat card
   - **Content**: Total views received
   - **Color**: Brand iris

### Stories Section

1. **Stories Grid**
   - **Component**: Story cards
   - **Action**: Click to navigate to `/story/[id]`
   - **Layout**: Responsive grid

2. **Empty State**
   - **Condition**: No stories
   - **Message**: "No stories yet" (own profile) or "No stories" (other profile)
   - **Action**: Link to `/create` (if own profile)

---

## ⚙️ Settings Page

**Route**: `/settings`  
**Location**: `src/app/settings/page.tsx`  
**Access**: Authenticated users only

### Tabs

**Component**: `SettingsPageClient`

1. **Profile Tab** (default)
   - **Route**: `/settings?tab=profile`
   - **Content**: Profile settings form

2. **Language Tab**
   - **Route**: `/settings?tab=language`
   - **Content**: Language selection

3. **Subscription Tab**
   - **Route**: `/settings?tab=subscription`
   - **Content**: Subscription management

### Profile Tab

**Component**: `ProfileSettings`

#### Form Fields

1. **Username Input**
   - **Type**: Text input
   - **Required**: No
   - **Validation**: Unique username check

2. **Bio Textarea**
   - **Type**: Textarea
   - **Required**: No
   - **Placeholder**: "Tell us about yourself"

3. **Avatar Upload**
   - **Type**: File input
   - **Accepted Types**: Image (jpg, png, gif)
   - **Preview**: Shows current/uploaded avatar
   - **Max Size**: Configurable

#### Buttons

1. **Save Changes**
   - **Action**: Submit form and update profile
   - **Type**: Submit button (primary)
   - **On Success**: Show success toast

2. **Cancel**
   - **Action**: Reset form to original values
   - **Type**: Button (outline)

### Language Tab

**Component**: `LanguageSettings`

#### Features

1. **Language Selector**
   - **Type**: Select dropdown
   - **Options**: English, Georgian, Russian, German, French
   - **Action**: Change language immediately
   - **Persistence**: Saved to user preferences

### Subscription Tab

**Component**: `SubscriptionSettings`

#### Features

1. **Current Subscription Display**
   - **Content**: Current tier, status, renewal date
   - **Type**: Card display

2. **Upgrade Button** (if free tier)
   - **Action**: Navigate to Stripe checkout
   - **Type**: Button (primary)
   - **Route**: External (Stripe)

3. **Manage Subscription Button** (if subscribed)
   - **Action**: Open Stripe customer portal
   - **Type**: Button (outline)
   - **Route**: External (Stripe)

4. **Cancel Subscription Button** (if subscribed)
   - **Action**: Cancel subscription
   - **Type**: Button (destructive)
   - **Confirmation**: Modal confirmation required

5. **Payment History**
   - **Component**: `PaymentHistory`
   - **Content**: List of past payments
   - **Type**: Table/list display

---

## 👑 Admin Dashboard

**Route**: `/admin`  
**Location**: `src/app/admin/page.tsx`  
**Access**: Admin users only

### Sidebar Navigation

**Component**: `AdminSidebar`

1. **📊 Overview**
   - **Route**: `/admin`
   - **Action**: Navigate to admin dashboard
   - **Type**: Link

2. **👥 Users**
   - **Route**: `/admin/users`
   - **Action**: Navigate to users management
   - **Type**: Link

3. **🛡️ Moderation**
   - **Route**: `/admin/moderation`
   - **Action**: Navigate to content moderation
   - **Type**: Link

4. **📈 Analytics**
   - **Route**: `/admin/analytics`
   - **Action**: Navigate to analytics dashboard
   - **Type**: Link

5. **⚙️ Settings**
   - **Route**: `/admin/settings`
   - **Action**: Navigate to admin settings
   - **Type**: Link

### Overview Page

**Content**: Admin statistics cards

- Total Users
- Active Users
- Total Stories
- Total Posts
- Total Likes
- Total Views

### Users Page

**Route**: `/admin/users`

#### Features

1. **Users List**
   - **Type**: Table
   - **Columns**: Username, Email, Role, Status, Actions

2. **User Actions** (per user)
   - **View**: Navigate to `/admin/users/[id]`
   - **Suspend**: Suspend user account
   - **Ban**: Ban user account
   - **Change Role**: Change user role (admin/user)

3. **User Detail Page**
   - **Route**: `/admin/users/[id]`
   - **Content**: User details, stories, actions

### Moderation Page

**Route**: `/admin/moderation`

#### Features

1. **Reported Content List**
   - **Type**: Table/list
   - **Columns**: Content type, Content ID, Reason, Reporter, Actions

2. **Moderation Actions**
   - **View Content**: Navigate to content
   - **Delete Content**: Delete reported content
   - **Dismiss Report**: Dismiss report (no action)

3. **Bulk Actions**
   - **Bulk Delete**: Delete multiple content items
   - **Bulk Dismiss**: Dismiss multiple reports

### Analytics Page

**Route**: `/admin/analytics`

#### Features

1. **Charts & Graphs**
   - User growth over time
   - Story creation trends
   - Engagement metrics
   - Content statistics

2. **Date Range Selector**
   - **Type**: Date picker
   - **Action**: Filter analytics by date range

3. **Export Button**
   - **Action**: Export analytics data
   - **Type**: Button
   - **Format**: CSV/JSON

### Settings Page

**Route**: `/admin/settings`

#### Features

1. **System Settings Form**
   - **Fields**: Various system configuration options
   - **Save Button**: Submit form

2. **Reset Button**
   - **Action**: Reset to defaults
   - **Type**: Button (outline)

---

## 🔗 Footer

**Location**: `src/components/Footer.tsx`  
**Route**: ყველა გვერდზე

### Links

1. **About**
   - **Action**: Navigate to `/about`
   - **Route**: `/about`
   - **Type**: Link

2. **Features**
   - **Action**: Navigate to `/#features`
   - **Route**: `/#features`
   - **Type**: Link

3. **Create account**
   - **Action**: Navigate to `/signup`
   - **Route**: `/signup`
   - **Type**: Link (emerald accent)

### Content

- **Brand Name**: "BranchFeed"
- **Tagline**: "Interactive branching video stories"
- **Copyright**: Not displayed (minimal footer)

---

## 📱 Responsive Behavior

### Mobile (< 768px)

- **Header**: Hamburger menu instead of desktop nav
- **User Menu**: Full-width dropdown
- **Story Cards**: Single column
- **Forms**: Full-width inputs
- **Buttons**: Full-width on mobile

### Tablet (768px - 1024px)

- **Header**: Collapsed navigation
- **Story Cards**: 2 columns
- **Forms**: Responsive layout

### Desktop (> 1024px)

- **Header**: Full navigation visible
- **Story Cards**: 3+ columns
- **Forms**: Optimal width layout

---

## 🎨 Button Types & Variants

### Button Variants

1. **Primary** (`variant="primary"`)
   - **Use**: Main actions (Sign Up, Publish, Save)
   - **Color**: Brand cyan gradient
   - **Style**: Solid with shadow

2. **Secondary** (`variant="secondary"`)
   - **Use**: Secondary actions
   - **Color**: Brand iris
   - **Style**: Solid

3. **Outline** (`variant="outline"`)
   - **Use**: Alternative actions (Cancel, Back)
   - **Color**: Gray border
   - **Style**: Outlined

4. **Ghost** (`variant="ghost"`)
   - **Use**: Tertiary actions (Comment, Share)
   - **Color**: Transparent with hover
   - **Style**: No border

5. **Destructive** (`variant="destructive"`)
   - **Use**: Dangerous actions (Delete, Cancel Subscription)
   - **Color**: Red
   - **Style**: Solid red

### Button Sizes

1. **Small** (`size="sm"`)
   - **Use**: Compact spaces, icon buttons

2. **Medium** (`size="md"`) - Default
   - **Use**: Standard buttons

3. **Large** (`size="lg"`)
   - **Use**: Prominent CTAs

---

## 🔔 Toast Notifications

**Component**: `ToastProvider`

### Toast Types

1. **Success** (green)
   - **Use**: Successful actions (Story created, Profile updated)

2. **Error** (red)
   - **Use**: Errors (Upload failed, Limit exceeded)

3. **Info** (blue)
   - **Use**: Informational messages (Link copied)

4. **Warning** (yellow)
   - **Use**: Warnings (Subscription expiring)

---

## 🚫 Error States

### Common Error Scenarios

1. **404 Not Found**
   - **Page**: `src/app/not-found.tsx`
   - **Action**: Link to home

2. **500 Server Error**
   - **Page**: `src/app/error.tsx`
   - **Action**: Retry button

3. **Subscription Limit Exceeded**
   - **Display**: Toast notification
   - **Message**: "Daily limit reached. Upgrade your subscription."
   - **Action**: Link to subscription settings

4. **Authentication Required**
   - **Action**: Redirect to `/signin` with `redirectTo` query param

5. **Admin Access Required**
   - **Action**: Redirect to `/` with error message

---

## 🔗 Related Documentation

- **Header Navigation**: `docs/features/header-navigation.md`
- **Story Detail Page**: `docs/features/story-detail-page.md`
- **Create Story Page**: `docs/features/create-story-page.md`
- **Profile Page**: `docs/features/profile-page.md`
- **Settings Page**: `docs/features/settings-page.md`
- **Admin Dashboard**: `docs/features/admin-dashboard.md`
- **UI Components**: `docs/UI_STYLE_GUIDE.md`

---

**Status**: Complete Documentation

**Last Updated**: 2025-01-15

