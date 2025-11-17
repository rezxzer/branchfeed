# Smoke Test Checklist

> Updates (2025-01):
>
> - Cross-Browser: Validate on latest Chrome, Firefox, Safari (desktop + mobile emulation) basic flows (auth, feed, story view).
> - Error Pages: Test custom error pages (404, 500) and ensure consistent layout and translations.

---

## 📋 Test Scenarios

### 1. Authentication Flow

#### Sign Up
- [ ] Navigate to `/signup`
- [ ] Fill valid email, password (min 6 chars)
- [ ] Submit form
- [ ] **Expected**: Redirects to `/feed`, user is authenticated
- [ ] **Expected**: Header shows user avatar/profile menu

#### Sign In
- [ ] Navigate to `/signin`
- [ ] Fill valid credentials
- [ ] Submit form
- [ ] **Expected**: Redirects to `/feed`, user is authenticated

#### Sign Out
- [ ] Click user menu in header
- [ ] Click "Sign Out"
- [ ] **Expected**: Redirects to `/`, user is signed out

#### Protected Routes
- [ ] While signed out, navigate to `/feed`
- [ ] **Expected**: Redirects to `/signin`
- [ ] While signed out, navigate to `/create`
- [ ] **Expected**: Redirects to `/signin`
- [ ] While signed out, navigate to `/profile/[id]`
- [ ] **Expected**: Redirects to `/signin`

---

### 2. Feed Page (`/feed`)

#### Page Load
- [ ] Navigate to `/feed`
- [ ] **Expected**: Page loads without errors
- [ ] **Expected**: Header visible with Feed, Create, Language switcher, Profile
- [ ] **Expected**: "Feed" title visible

#### Loading State
- [ ] On initial load
- [ ] **Expected**: Skeleton loaders appear (6 cards)
- [ ] **Expected**: Shimmer animation visible

#### Empty State
- [ ] If no stories in database
- [ ] **Expected**: EmptyState component appears
- [ ] **Expected**: Icon (📖), title, description visible
- [ ] **Expected**: "Create Story" button visible (if own profile)

#### Stories Display
- [ ] If stories exist
- [ ] **Expected**: Grid layout (1 column mobile, 2 tablet, 3 desktop)
- [ ] **Expected**: Story cards show thumbnail, title, author, stats
- [ ] **Expected**: Gaps are consistent (gap-4 mobile, gap-5 tablet, gap-6 desktop)

#### Story Card Interaction
- [ ] Click on any story card
- [ ] **Expected**: Navigates to `/story/[id]`
- [ ] **Expected**: URL changes correctly
- [ ] Hover over story card
- [ ] **Expected**: Border changes to cyan (`hover:border-brand-cyan/50`)
- [ ] **Expected**: Shadow elevation (`hover:shadow-level-2`)

#### Sort Controls
- [ ] Click sort dropdown
- [ ] **Expected**: Options visible (Recent, Popular, Trending)
- [ ] Change sort option
- [ ] **Expected**: Stories reorder correctly

#### Load More
- [ ] Scroll to bottom (if hasMore)
- [ ] **Expected**: "Load More" button visible
- [ ] Click "Load More"
- [ ] **Expected**: More stories load
- [ ] **Expected**: Loading spinner appears on button

---

### 3. Story Detail Page (`/story/[id]`)

#### Page Load
- [ ] Navigate to `/story/[id]` (valid story ID)
- [ ] **Expected**: Page loads without errors
- [ ] **Expected**: Story info visible (author, title, description)

#### Story Player Section
- [ ] **Expected**: PathProgress visible at top ("Step X of Y", "Path: ...")
- [ ] **Expected**: MediaDisplay visible in center (9:16 aspect ratio)
- [ ] **Expected**: Media loads with spinner, then displays
- [ ] **Expected**: ChoiceButtons visible below media (if not at max depth)

#### Initial State (No Path Selected)
- [ ] **Expected**: PathProgress shows "Step 1 of 5", "Path: Start"
- [ ] **Expected**: Root story media displayed
- [ ] **Expected**: Choice A and Choice B buttons visible
- [ ] **Expected**: Comments section at bottom
- [ ] **Expected**: Story Tree section at bottom
- [ ] **Expected**: All Paths section at bottom

#### Choice Selection
- [ ] Click Choice A button
- [ ] **Expected**: Button shows active state (scale animation)
- [ ] **Expected**: Loading spinner appears in MediaDisplay
- [ ] **Expected**: PathProgress updates ("Step 2 of 5", "Path: A")
- [ ] **Expected**: New node media loads in same Story Player (no page reload)
- [ ] **Expected**: Smooth scroll to top
- [ ] Click Choice B button
- [ ] **Expected**: Same behavior as Choice A

#### Keyboard Navigation
- [ ] Tab to Choice A button
- [ ] **Expected**: Focus ring visible (`focus:ring-2 focus:ring-brand-cyan`)
- [ ] Press Enter on Choice A
- [ ] **Expected**: Choice A selected (same as click)
- [ ] Press Space on Choice B
- [ ] **Expected**: Choice B selected (same as click)

#### End of Path State
- [ ] Navigate to max depth (e.g., Step 5 of 5)
- [ ] **Expected**: ChoiceButtons disappear
- [ ] **Expected**: "End of Path" state appears
- [ ] **Expected**: Icon (📖), title, description visible

#### Interactions
- [ ] Click Like button
- [ ] **Expected**: Like count increments
- [ ] **Expected**: Button shows liked state
- [ ] Click Share button
- [ ] **Expected**: Link copied to clipboard (or native share)
- [ ] **Expected**: Toast notification appears

#### Comments Section
- [ ] Scroll to comments section
- [ ] **Expected**: Comments list visible
- [ ] **Expected**: Add comment form visible
- [ ] Type comment and submit
- [ ] **Expected**: Comment appears in list
- [ ] **Expected**: Comment count increments

---

### 4. Create Story Page (`/create`)

#### Page Load
- [ ] Navigate to `/create`
- [ ] **Expected**: Page loads without errors
- [ ] **Expected**: Step indicator visible (1. Root, 2. Branches, 3. Preview)
- [ ] **Expected**: Step 1 (Root) is active

#### Root Story Form (Step 1)
- [ ] Fill title field
- [ ] **Expected**: Input works correctly
- [ ] Try to submit without title
- [ ] **Expected**: Error message: "Story title is required"
- [ ] Try to submit without media
- [ ] **Expected**: Error message: "Please upload an image or video for your story"
- [ ] Upload file > 10MB
- [ ] **Expected**: Error message: "File size must be less than 10MB"
- [ ] Upload invalid file type (.txt, .pdf)
- [ ] **Expected**: Error message: "Please upload an image (JPEG, PNG, WebP) or video (MP4, WebM) file"
- [ ] Upload valid image/video
- [ ] **Expected**: Media preview appears
- [ ] Fill all required fields and submit
- [ ] **Expected**: Moves to Step 2 (Branches)

#### Branch Nodes Form (Step 2)
- [ ] **Expected**: "Add Node" button visible
- [ ] Click "+ Add Node"
- [ ] **Expected**: New node form appears
- [ ] Fill Choice A and Choice B (optional)
- [ ] Try to submit without any nodes
- [ ] **Expected**: Form doesn't submit (validation prevents)
- [ ] Add at least one node and submit
- [ ] **Expected**: Moves to Step 3 (Preview)

#### Preview Step (Step 3)
- [ ] **Expected**: Root story preview visible
- [ ] **Expected**: Branch nodes preview visible
- [ ] **Expected**: "Back" button visible
- [ ] **Expected**: "Publish Story" button visible

#### Publish Flow
- [ ] Click "Publish Story"
- [ ] **Expected**: Button shows spinner and "Publishing..." text
- [ ] **Expected**: Button disabled during publish
- [ ] **Expected**: Upload progress indicator appears (if media uploads)
- [ ] **Expected**: Success toast appears: "Story created successfully!"
- [ ] **Expected**: After 500ms, redirects to `/story/[id]`
- [ ] **Expected**: New story page loads with created story

#### Error Handling
- [ ] Simulate network error (disable network)
- [ ] Try to publish
- [ ] **Expected**: Error message appears in red box
- [ ] **Expected**: Error icon (⚠️), title, description visible
- [ ] **Expected**: Publish button re-enabled (can retry)

---

### 5. Profile Page (`/profile/[id]`)

#### Own Profile
- [ ] Navigate to own profile (`/profile/[userId]`)
- [ ] **Expected**: Profile header visible (avatar, username, bio)
- [ ] **Expected**: "Settings" button visible
- [ ] **Expected**: Stats visible (Stories count, Total Likes, Total Views)
- [ ] **Expected**: Stories grid visible (if stories exist)
- [ ] Click "Settings" button
- [ ] **Expected**: Navigates to `/settings`

#### Other User's Profile
- [ ] Navigate to other user's profile
- [ ] **Expected**: Profile header visible
- [ ] **Expected**: "Settings" button NOT visible
- [ ] **Expected**: Stories grid visible (if stories exist)

#### Empty State
- [ ] If user has no stories
- [ ] **Expected**: EmptyState component appears
- [ ] **Expected**: "Create Story" button visible (if own profile)

#### Story Card Click
- [ ] Click on any story card in profile
- [ ] **Expected**: Navigates to `/story/[id]`
- [ ] **Expected**: Story detail page loads correctly

---

### 6. Settings Page (`/settings`)

#### Page Load
- [ ] Navigate to `/settings`
- [ ] **Expected**: Page loads without errors
- [ ] **Expected**: Settings tabs visible (Profile, Language, etc.)

#### Profile Settings
- [ ] **Expected**: Username field visible
- [ ] **Expected**: Bio field visible
- [ ] **Expected**: Avatar upload section visible
- [ ] Upload new avatar
- [ ] **Expected**: Progress indicator appears
- [ ] **Expected**: Avatar updates after upload
- [ ] **Expected**: Page refreshes to show new avatar

#### Language Settings
- [ ] **Expected**: Language options visible
- [ ] Change language
- [ ] **Expected**: UI text changes to selected language
- [ ] **Expected**: Language preference saved

---

### 7. Responsive Design

#### Mobile (< 640px)
- [ ] Test all pages on mobile viewport
- [ ] **Expected**: Single column layouts
- [ ] **Expected**: Mobile menu in header (if applicable)
- [ ] **Expected**: Touch-friendly button sizes
- [ ] **Expected**: Text readable (not too small)

#### Tablet (640px - 1024px)
- [ ] Test all pages on tablet viewport
- [ ] **Expected**: 2-column layouts where applicable
- [ ] **Expected**: Proper spacing and gaps

#### Desktop (> 1024px)
- [ ] Test all pages on desktop viewport
- [ ] **Expected**: 3-column layouts where applicable
- [ ] **Expected**: Proper spacing and gaps
- [ ] **Expected**: Hover effects work correctly

---

### 8. Error States

#### 404 Page
- [ ] Navigate to non-existent route (e.g., `/nonexistent`)
- [ ] **Expected**: 404 page appears
- [ ] **Expected**: "Go Home" and "Go to Feed" buttons visible
- [ ] Click "Go Home"
- [ ] **Expected**: Navigates to `/`

#### Network Errors
- [ ] Disable network
- [ ] Try to load feed
- [ ] **Expected**: ErrorState component appears
- [ ] **Expected**: Retry button visible
- [ ] Enable network and click Retry
- [ ] **Expected**: Data loads successfully

#### Invalid Story ID
- [ ] Navigate to `/story/invalid-id`
- [ ] **Expected**: ErrorState component appears
- [ ] **Expected**: "Story not found" message
- [ ] **Expected**: Retry or "Go Back" button visible

---

### 9. Loading States

#### Feed Page
- [ ] **Expected**: Skeleton loaders during initial load
- [ ] **Expected**: Spinner on "Load More" button when loading

#### Story Detail Page
- [ ] **Expected**: StoryDetailSkeleton during initial load
- [ ] **Expected**: MediaDisplay spinner while media loads
- [ ] **Expected**: ChoiceButtons disabled during node load

#### Create Story Page
- [ ] **Expected**: Upload progress indicator during publish
- [ ] **Expected**: Spinner on publish button during publish

---

### 10. Accessibility

#### Keyboard Navigation
- [ ] Tab through all interactive elements
- [ ] **Expected**: Focus visible on all elements
- [ ] **Expected**: Focus ring visible (`focus:ring-2`)
- [ ] **Expected**: Enter/Space activates buttons

#### Screen Reader
- [ ] Test with screen reader (if available)
- [ ] **Expected**: All buttons have aria-label
- [ ] **Expected**: Form inputs have labels
- [ ] **Expected**: Error messages announced

#### Color Contrast
- [ ] **Expected**: Text readable on all backgrounds
- [ ] **Expected**: Buttons have sufficient contrast
- [ ] **Expected**: Links distinguishable from text

---

## 🐛 Common Issues to Check

### UI/UX Bugs
- [ ] Misaligned padding/margins
- [ ] Inconsistent gaps between elements
- [ ] Text too small (text-xs) on mobile
- [ ] Hover effects not working
- [ ] Focus states missing
- [ ] Buttons not properly disabled during loading
- [ ] Error messages not user-friendly
- [ ] Loading states missing

### Functional Bugs
- [ ] Navigation not working
- [ ] Forms not submitting
- [ ] Media not loading
- [ ] API errors not handled
- [ ] Redirects not working
- [ ] State not persisting

---

## ✅ Pass Criteria

All critical paths must pass:
- ✅ Authentication (Sign Up, Sign In, Sign Out)
- ✅ Feed page loads and displays stories
- ✅ Story detail page loads and displays story
- ✅ Choice selection works (A/B buttons)
- ✅ Create story flow works end-to-end
- ✅ Profile page loads and displays user data
- ✅ Settings page works
- ✅ Responsive design works on all breakpoints
- ✅ Error states display correctly
- ✅ Loading states display correctly

---

## 📝 Notes

- Test on different browsers (Chrome, Firefox, Safari)
- Test on different devices (mobile, tablet, desktop)
- Test with slow network (throttle in DevTools)
- Test with no network (offline mode)
- Test with invalid data (empty forms, invalid IDs)

---

**Last Updated**: 2025-01-15

