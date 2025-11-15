# Documentation Structure Guide

ეს დოკუმენტაცია განსაზღვრავს რა დოკუმენტაცია უნდა შევქმნათ თავიდანვე პროექტისთვის.

---

## 📁 Required Documentation Files

### Root Level Files

#### `.cursorrules` (REQUIRED)

- **Purpose**: Cursor AI-ის წესები და პრიორიტეტები
- **Content**: Language rules, security, code quality, priorities
- **Location**: Project root
- **Status**: ⬜ Must create first

#### `README.md` (REQUIRED)

- **Purpose**: Project overview, setup instructions
- **Content**:
  - Project description
  - Tech stack
  - Setup instructions
  - Environment variables
  - Running the project
  - Contributing guidelines
- **Location**: Project root
- **Status**: ⬜ Must create first

#### `.env.example` (REQUIRED)

- **Purpose**: Environment variables template
- **Content**: All required environment variables (without values)
- **Location**: Project root
- **Status**: ⬜ Must create first

---

### `docs/` Directory Structure

```
docs/
├── PROJECT_PRIORITIES.md          # Feature priorities (REQUIRED)
├── DOCUMENTATION_STRUCTURE.md     # This file (REQUIRED)
├── PROJECT_OVERVIEW.md            # BranchFeed vision and concept (REQUIRED)
├── ESSENTIAL_FEATURES.md          # MVP features list (REQUIRED)
├── UI_STYLE_GUIDE.md              # UI style guide (REQUIRED)
├── FEATURES_TO_DOCUMENT.md        # List of features/pages/components to document
├── ARCHITECTURE.md                # System architecture
├── SETUP.md                       # Development setup
├── API.md                         # API documentation
├── DATABASE.md                    # Database schema
├── DEPLOYMENT.md                  # Deployment guide
└── features/                      # Feature documentation
    ├── i18n-language-switcher.md  # Internationalization feature
    ├── profile-page.md            # User profile page
    ├── admin-dashboard.md         # Admin dashboard (Phase 3+)
    ├── authentication.md          # Authentication system (Phase 1)
    ├── landing-page.md            # Landing page (Phase 1)
    ├── auth-pages.md              # Sign Up/Sign In pages (Phase 1)
    ├── header-navigation.md        # Header/Navigation (Phase 1)
    ├── form-components.md         # Form components (Phase 1)
    └── [feature-name].md
```

---

## 📄 Documentation Templates

### 1. `docs/ARCHITECTURE.md`

```markdown
# System Architecture

## Tech Stack

- **Framework**: [e.g., Next.js 15]
- **Language**: [e.g., TypeScript]
- **Database**: [e.g., Supabase PostgreSQL]
- **Styling**: [e.g., Tailwind CSS]
- **Auth**: [e.g., Supabase Auth]

## Project Structure
```

src/
├── app/ # Next.js pages
├── components/ # React components
├── lib/ # Utilities, helpers
├── hooks/ # Custom React hooks
└── types/ # TypeScript types

```

## Key Decisions
- Why this tech stack?
- Why this structure?
- Key architectural decisions

## Data Flow
- How data flows through the app
- API calls
- State management
```

### 2. `docs/SETUP.md`

```markdown
# Development Setup

## Prerequisites

- Node.js version
- Package manager (npm/pnpm/yarn)
- Database setup

## Installation

1. Clone repository
2. Install dependencies: `pnpm install`
3. Copy `.env.example` to `.env`
4. Fill in environment variables
5. Run migrations (if needed)
6. Start dev server: `pnpm dev`

## Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- (Add all required variables)

## Common Issues

- Issue 1: Solution
- Issue 2: Solution
```

### 3. `docs/API.md`

```markdown
# API Documentation

## Endpoints

### Authentication

- `POST /api/auth/signup`
- `POST /api/auth/signin`
- `POST /api/auth/signout`

### Posts

- `GET /api/posts` - Get all posts
- `POST /api/posts` - Create post
- `GET /api/posts/[id]` - Get post by ID
- `DELETE /api/posts/[id]` - Delete post

## Request/Response Examples

(Add examples for each endpoint)
```

### 4. `docs/DATABASE.md`

```markdown
# Database Schema

## Tables

### users

- `id` (uuid, primary key)
- `email` (text, unique)
- `created_at` (timestamp)

### posts

- `id` (uuid, primary key)
- `author_id` (uuid, foreign key → users)
- `title` (text)
- `content` (text)
- `created_at` (timestamp)

## Relationships

- users → posts (one-to-many)

## RLS Policies

- Users can read all public posts
- Users can only update/delete their own posts
```

### 5. `docs/DEPLOYMENT.md`

```markdown
# Deployment Guide

## Prerequisites

- Production database
- Environment variables set
- Domain configured

## Steps

1. Build: `pnpm build`
2. Test build locally
3. Deploy to [platform]
4. Set environment variables
5. Run migrations
6. Verify deployment

## Post-Deployment

- Check logs
- Test critical flows
- Monitor errors
```

### 6. `docs/features/[feature-name].md`

```markdown
# [Feature Name]

## Overview

Brief description of the feature

## Implementation

- How it works
- Key components
- Key functions

## Usage

- How to use the feature
- Examples

## Related Documentation

- Link related UI components (from `UI_STYLE_GUIDE.md`)
- Link i18n keys (from i18n docs, e.g., `features/i18n-language-switcher.md`)

## Testing

- How to test
- Test cases

## 🧪 Testing & Verification Instructions

> **⚠️ CRITICAL: Testing & Verification Section Required**
>
> **ყველა feature დოკუმენტაციაში უნდა იყოს "🧪 Testing & Verification Instructions" სექცია**, რომელიც აღწერს:
>
> 1. **კონკრეტული ნაბიჯები** - რას უნდა დაჭიროს/გახსნას მომხმარებელმა
> 2. **რას უნდა ნახოს** - expected behavior თითოეულ ნაბიჯზე
> 3. **რას უნდა გამოგვიგზავნოს** - სქრინშოტი, console output, ან ტექსტური აღწერა
>
> **როცა მომხმარებელი გამიგზავნის სქრინშოტს ან ტექსტს**, AI Assistant უნდა:
> - დაუდასტუროს რომ feature მუშაობს ან არ მუშაობს
> - გაასწოროს bugs თუ არის
> - გააგრძელოს შემდეგი feature-ის იმპლემენტაცია
>
> ეს არის **სტანდარტული პროცესი** ყველა feature-ისთვის!

**Template:**

```markdown
## 🧪 Testing & Verification Instructions

> **⚠️ IMPORTANT**: ეს სექცია აღწერს კონკრეტულ ნაბიჯებს, რომელთა შემდეგაც უნდა შეამოწმო feature-ის მუშაობა. გთხოვ, გაგზავნო სქრინშოტი ან ტექსტური აღწერა, რომ დავადასტურო რომ მუშაობს ან არ მუშაობს.

### Manual Testing Steps

#### 1. [Feature Name] Basic Functionality

**ნაბიჯი 1**: [კონკრეტული ნაბიჯი - რას უნდა დაჭიროს/გახსნას]
**ნაბიჯი 2**: [შემდეგი ნაბიჯი]
**ნაბიჯი 3**: [და ა.შ.]

**რას უნდა ნახო**:
- [Expected behavior 1]
- [Expected behavior 2]
- [Expected behavior 3]

### What to Report

როცა შეამოწმებ, გთხოვ გამომიგზავნო:
1. **სქრინშოტი** [რა გვერდზე/component-ზე]
2. **ტექსტური აღწერა**: [რა დეტალები უნდა იყოს აღწერილი]
3. **Browser Console output** (თუ არის errors)

დავადასტურებ მუშაობს თუ არა და, თუ საჭიროა, გავასწორებ.
```

## Future Improvements

- What could be improved
- Planned enhancements
```

---

## 📝 Documentation Best Practices

### When to Document

1. **Before Starting**: Document architecture and setup
2. **While Building**: Document features as you build them
3. **After Completing**: Update documentation with final details

### What to Document

1. **Architecture**: System design, tech stack, structure
2. **Setup**: How to set up development environment
3. **Features**: Each major feature should have documentation
4. **API**: All API endpoints and usage
5. **Database**: Schema, relationships, policies
6. **Deployment**: How to deploy to production

### Documentation Quality

- **Clear**: Easy to understand
- **Complete**: All necessary information included
- **Up-to-date**: Keep documentation current
- **Examples**: Include code examples
- **Screenshots**: Add screenshots for UI features

---

## ✅ Documentation Checklist

### Initial Setup

- [ ] `.cursorrules` created
- [ ] `README.md` created
- [ ] `.env.example` created
- [ ] `docs/PROJECT_PRIORITIES.md` created
- [ ] `docs/DOCUMENTATION_STRUCTURE.md` created (this file)
- [ ] `docs/PROJECT_OVERVIEW.md` created
- [ ] `docs/ESSENTIAL_FEATURES.md` created
- [ ] `docs/UI_STYLE_GUIDE.md` created

### Core Documentation

- [ ] `docs/ARCHITECTURE.md` created
- [ ] `docs/SETUP.md` created
- [ ] `docs/API.md` created
- [ ] `docs/DATABASE.md` created
- [ ] `docs/DEPLOYMENT.md` created

### Feature Documentation

- [ ] Document each major feature in `docs/features/`
- [ ] **Include "🧪 Testing & Verification Instructions" section** in each feature doc
- [ ] Update documentation when features change
- [ ] Add examples and screenshots

---

## 🔄 Maintenance

### When to Update Documentation

1. **New Feature**: Document immediately after completion
2. **Feature Change**: Update relevant documentation
3. **Bug Fix**: Update if it affects documentation
4. **Architecture Change**: Update architecture docs
5. **Regular Review**: Review documentation monthly

### Documentation Review Process

1. Check if documentation is up-to-date
2. Verify all examples still work
3. Update outdated information
4. Add missing information
5. Remove obsolete documentation

---

## 📚 Additional Resources

- [Markdown Guide](https://www.markdownguide.org/)
- [Documentation Best Practices](https://www.writethedocs.org/guide/)
- [API Documentation Standards](https://swagger.io/specification/)

---

## 🎯 Goals

- **Clear**: Anyone can understand the project
- **Complete**: All necessary information is documented
- **Current**: Documentation is always up-to-date
- **Useful**: Documentation helps developers work efficiently
