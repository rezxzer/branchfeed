# New Project Setup Guide - BranchFeed

> ⚠️ **Note**: This document is specific to **BranchFeed** project. For future projects, use this as a template and replace placeholders.

ეს დოკუმენტაცია განკუთვნილია BranchFeed პროექტის დასაწყებად Cursor-თან ერთად.

---

## 📋 Table of Contents

1. [Cursor AI Rules & Priorities](#cursor-ai-rules--priorities)
2. [Essential Features Only](#essential-features-only)
3. [Documentation Structure](#documentation-structure)
4. [Next Steps](#next-steps)

---

## 1. Cursor AI Rules & Priorities

### `.cursorrules` File (Root Directory)

შექმენით `.cursorrules` ფაილი პროექტის root-ში:

```markdown
# Cursor AI Rules for BranchFeed

## Language & Communication

- **Code & Comments**: All code (variables, functions, comments, UI strings) must be in English
- **Chat Responses**: All chat responses must be in Georgian
- **Documentation**: Markdown files can be in Georgian or English, but consistent
- **No Georgian in Code/SQL/Filenames**: Code, file names and SQL must not contain Georgian characters

## Security

- **Sensitive Data**: No API keys, secrets, or personal info in code
- **Environment Variables**: Use `.env` files for all secrets (`.env.example` for template)
- **RLS Policies**: Always use Row Level Security for database tables
- **No Hardcoded Secrets**: Never hardcode API keys or secrets
- **No Secrets in NEXT_PUBLIC_***: Never expose secrets in `NEXT_PUBLIC_*` environment variables

## Supabase Rules

- **SQL Changes**: All database changes must be done via SQL (Supabase SQL Editor)
- **RLS Policies**: RLS policies must always use `do $$ ... end $$;` style (block syntax)
- **No Secrets in Public**: Never expose secrets in `NEXT_PUBLIC_*` environment variables

## File Structure

- **Strict Structure**: Follow existing structure (src/app, src/components, etc.)
- **Git**: All changes must be committed with descriptive messages
- **Small Commits**: Atomic, small changes - no large commits
- **.gitignore**: Always check .gitignore before committing

## Code Quality

- **TypeScript**: All code must be TypeScript (no `any` types unless absolutely necessary)
- **Error Handling**: All async operations must have try/catch
- **Testing**: All new components/functions must be testable
- **Consistency**: Follow design system strictly
- **Linting**: Run linter before committing

## Priority Order (CRITICAL)

1. **Follow `docs/PROJECT_PRIORITIES.md`**: Only build features in priority order
2. **Phase 1 First**: Complete Phase 1 before starting Phase 2
3. **One Feature at a Time**: Complete one feature fully before starting another
4. **Essential Only**: Don't add features not in priorities document

## Component Rules

- **Reusable Components**: Create reusable components in `src/components/`
- **Server vs Client**: Use Server Components by default, Client only for interactivity
- **Naming**: PascalCase for components, camelCase for variables
- **Props**: Always use TypeScript interfaces
- **No `any` Types**: Use proper types for all props and data

## Documentation

- **Update Docs**: Always update relevant docs when adding features
- **Code Comments**: Add comments for complex logic
- **README**: Keep README.md updated with setup instructions
- **Feature Docs**: Document each feature in `docs/features/`

## Error Handling

- **User-Friendly**: All errors must show user-friendly messages
- **Try/Catch**: All async operations must have try/catch
- **Error Boundaries**: Use error boundaries for React components
- **Logging**: Log errors for debugging (but not in production)

## Testing

- **Test as You Go**: Don't wait until the end to test
- **Component Tests**: Test components with React Testing Library
- **Integration Tests**: Test critical flows
- **E2E Tests**: Test user journeys

## Performance

- **Optimize Images**: Use Next.js Image component
- **Code Splitting**: Use dynamic imports for large components
- **Lazy Loading**: Lazy load components when possible
- **Bundle Size**: Keep bundle size small

## Accessibility

- **Semantic HTML**: Use proper HTML elements
- **ARIA Labels**: Add ARIA labels for screen readers
- **Keyboard Navigation**: Ensure keyboard accessibility
- **Color Contrast**: Ensure sufficient color contrast

## Before Starting Any Task

1. ✅ Check `docs/PROJECT_PRIORITIES.md` - Is this feature in priorities?
2. ✅ Check `docs/DOCUMENTATION_STRUCTURE.md` - Do I need to document this?
3. ✅ Check `docs/ESSENTIAL_FEATURES.md` and `docs/PROJECT_OVERVIEW.md` - Keep BranchFeed concept (branching stories)
4. ✅ Check existing code - Is there similar code I can reuse?
5. ✅ Plan the implementation - What components/functions do I need?

## When Completing a Task

1. ✅ Code is written and tested
2. ✅ TypeScript errors are fixed
3. ✅ Linting passes
4. ✅ Documentation is updated
5. ✅ Feature works in browser
6. ✅ Error handling is implemented
7. ✅ Loading states are added (if needed)

## What NOT to Do

- ❌ Don't add features not in `PROJECT_PRIORITIES.md`
- ❌ Don't skip Phase 1 to work on Phase 2
- ❌ Don't use `any` types
- ❌ Don't commit without testing
- ❌ Don't skip documentation
- ❌ Don't hardcode secrets
- ❌ Don't ignore TypeScript errors
- ❌ Don't ignore linting errors

## Prompt Template

Always start prompts with:

```
Follow .cursorrules, docs/PROJECT_PRIORITIES.md, and docs/DOCUMENTATION_STRUCTURE.md strictly.

[Your request here]
```
```

### Cursor Prompt Template

ყოველთვის იწყებოდეს prompt-ები ასე:

```
Follow .cursorrules, docs/PROJECT_PRIORITIES.md, and docs/DOCUMENTATION_STRUCTURE.md strictly.

[Your request here]
```

> 📝 **Note**: The `.cursorrules` template above is synchronized with the actual `.cursorrules` file in the BranchFeed project root. For future projects, update this template accordingly.

---

## 2. Essential Features Only

### Core Features (MVP - Must Have)

1. **Authentication**

   - Email/Password or Magic Link
   - User session management
   - Protected routes

2. **Database Schema**

   - Users/Profiles table
   - Posts table
   - Basic relationships

3. **Main Pages**

   - Home/Feed page
   - Create Post page
   - Profile page
   - Post Detail page

4. **Basic Functionality**
   - Create posts
   - View posts
   - Like/React
   - Comments

### Features to REMOVE (Not Essential)

❌ **Remove These Features** (unless specifically needed):

- Advanced analytics
- Complex filtering
- Multiple feed types
- Premium features (unless core to MVP)
- Admin dashboard (unless needed)
- Chat system (unless core feature)
- Stories (unless core feature)
- Advanced search (basic search is enough)
- Multiple subscription tiers (one tier is enough for MVP)

### Priority Order

1. **Phase 1: Foundation** (Week 1-2)

   - Database setup
   - Authentication
   - Basic UI components
   - Landing page

2. **Phase 2: Core Features** (Week 3-4)

   - Create posts
   - View posts (Feed)
   - Basic interactions (like, comment)

3. **Phase 3: Polish** (Week 5-6)
   - Error handling
   - Loading states
   - Responsive design
   - Basic testing

---

## 3. Documentation Structure

### Required Documentation Files

#### Root Level

```
.cursorrules              # Cursor AI rules (REQUIRED)
README.md                 # Project overview, setup instructions
.env.example              # Environment variables template
```

#### `docs/` Directory Structure

```
docs/
├── PROJECT_PRIORITIES.md          # Feature priorities (REQUIRED)
├── DOCUMENTATION_STRUCTURE.md     # Documentation guide (REQUIRED)
├── ARCHITECTURE.md                # System architecture
├── SETUP.md                       # Development setup
├── API.md                         # API documentation
├── DATABASE.md                    # Database schema
└── DEPLOYMENT.md                  # Deployment guide
```

### Documentation Template

#### `docs/PROJECT_PRIORITIES.md`

```markdown
# Project Priorities

## Phase 1: Foundation (Weeks 1-2)

- [ ] Database setup
- [ ] Authentication
- [ ] Basic UI components

## Phase 2: Core Features (Weeks 3-4)

- [ ] Create posts
- [ ] View posts
- [ ] Basic interactions

## Phase 3: Polish (Weeks 5-6)

- [ ] Error handling
- [ ] Loading states
- [ ] Testing
```

#### `docs/DOCUMENTATION_STRUCTURE.md`

```markdown
# Documentation Structure

## Required Documentation

1. **ARCHITECTURE.md**: System architecture, tech stack
2. **SETUP.md**: Development environment setup
3. **API.md**: API endpoints and usage
4. **DATABASE.md**: Database schema and relationships
5. **DEPLOYMENT.md**: Deployment instructions

## Feature Documentation

- Create `docs/features/[feature-name].md` for each major feature
- Include: Overview, Implementation, Testing, Future improvements

## Component Documentation

- Create `docs/components/[component-name].md` for complex components
- Include: Props, Usage, Examples
```

---

## 4. Next Steps

### Step 1: Create `.cursorrules`

```bash
# Create .cursorrules file in root
touch .cursorrules
# Add content from section 1 above
```

### Step 2: Create Priority Documentation

```bash
# Create docs/PROJECT_PRIORITIES.md
# List only essential features
# Remove all non-essential features
```

### Step 3: Create Documentation Structure

```bash
# Create docs/DOCUMENTATION_STRUCTURE.md
# Define what documentation is needed
# Create template files
```

### Step 4: Clean Up Existing Project

```bash
# Remove non-essential features
# Keep only MVP features
# Update documentation
```

### Step 5: Start Fresh

```bash
# Create new branch or new project
# Follow priorities strictly
# Document as you go
```

---

## Quick Checklist

- [ ] `.cursorrules` file created
- [ ] `docs/PROJECT_PRIORITIES.md` created with essential features only
- [ ] `docs/DOCUMENTATION_STRUCTURE.md` created
- [ ] Non-essential features removed or marked as "Future"
- [ ] README.md updated with setup instructions
- [ ] `.env.example` created
- [ ] Database schema documented
- [ ] API endpoints documented

---

## Notes

- **Start Simple**: Build MVP first, add features later
- **Document as You Go**: Don't wait until the end to document
- **Follow Priorities**: Don't add features that aren't in priorities
- **Ask Questions**: If unsure about a feature, check priorities first
- **BranchFeed Specific**: This guide is tailored for BranchFeed project. For other projects, replace placeholders (BranchFeed → [Project Name], Georgian → [Your Language])
