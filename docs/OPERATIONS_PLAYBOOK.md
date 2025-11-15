# BranchFeed Operations Playbook

This document serves as the operational guide for BranchFeed project decisions, configurations, and future changes. It covers domains, hosting, branding, payments, Git strategy, environments, and deployment procedures.

> **მოკლე აღწერა (KA)**  
> ეს ფაილი არის BranchFeed-ის ოპერაციული რუკა. აქ წერია:
> - რა დომენი გვინდა, სად იქნება ჰოსტინგი და როგორ ვუშვებთ deploy-ს (local → preview → production);
> - როგორ ვგეგმავთ Stripe გადახდებს, VIP დონეებს, coins-ს და შიდა რეკლამის სისტემას;
> - რას ვაკეთებთ, თუ მომავალში შევცვლით პროექტის სახელს ან დომენს (rebranding / rename);
> - რა უნდა შევამოწმოთ, როცა ვაკეთებთ დიდ ცვლილებას (domain, payments, env, და ა.შ.).
>
> ამ ფაილიდან არაფერი ავტომატურად არ სრულდება – ეს მხოლოდ გზამკვლევია ჩემთვის და მომავალში გუნდისთვის.

> ⚠️ **Important**: This file is an **operational guide only** and does **NOT affect runtime behavior**. It documents current decisions and provides procedures for future operational changes.

---

## 1. Introduction

### What is This Document?

The BranchFeed Operations Playbook is a living document that captures:

- **Current operational decisions** (domains, branding, payment strategy, Git workflow)
- **Procedures for future changes** (rebranding, domain migration, new payment systems)
- **Checklists and guidelines** for major operational updates

### Scope

This playbook covers:

- ✅ Domain and DNS configuration
- ✅ Project identity and branding
- ✅ Payment and monetization strategy
- ✅ Git repository and branching model
- ✅ Environment setup and deployment flow
- ✅ Major feature rollouts (payments, VIP, ads)
- ✅ Rebranding procedures
- ✅ Change management checklists

### What This Document Does NOT Cover

- ❌ Code implementation details (see `docs/features/` for feature documentation)
- ❌ Development rules (see `.cursorrules` and `docs/PROJECT_PRIORITIES.md`)
- ❌ Database schema changes (see `docs/DATABASE.md` or migration files)
- ❌ API documentation (see `docs/API.md`)

### Document Maintenance

- **Owner**: Rezi (Project Owner)
- **Version**: 1.0
- **Last Updated**: 2025-01-XX
- **Update Policy**: This document should be updated when major operational decisions change (domain, branding, payment strategy, environment setup). See Section 9 for maintenance guidelines.

---

## 2. Project Identity & Naming

### Current Identity

- **Project Name**: BranchFeed
- **Status**: v1 - Current name will remain for v1 release
- **Repository**: `branchfeed` (or very similar name on GitHub)

### Brand Elements

The following elements currently use "BranchFeed" branding:

- `README.md` (project name, description)
- `package.json` (name, description)
- Vercel project name
- Supabase project name/notes
- SEO configurations (site name, default title, default description, Open Graph)
- Logo, favicon, app icons
- UI texts where the name is mentioned
- Social links (YouTube/TikTok/Instagram/email if applicable)

### Future Rebranding (v2+)

If project name/branding needs to change in the future, see **Section 7: Renaming / Rebranding Playbook** for detailed procedures.

---

## 3. Domains & DNS Strategy

### Production Domain

**Target Domain**: `branchfeed.app`

This is the primary production domain. If this domain is not available, consider these alternatives:

- `trybranchfeed.com`
- `branchfeed.live`

#### Domain Purchase Checklist

If the target domain is not yet purchased:

1. **Choose a Registrar**
   - Options: Namecheap, Cloudflare, Google Domains alternative, etc.
   - Recommendation: Cloudflare (good pricing, easy DNS management)

2. **Purchase the Domain**
   - Register `branchfeed.app` (or alternative)
   - Ensure privacy protection is enabled
   - Set expiration reminders

3. **Configure Nameservers for Vercel**
   - In Vercel dashboard: Add domain → Follow DNS configuration instructions
   - Update nameservers in domain registrar to point to Vercel

4. **Set Up SSL / HTTPS**
   - Vercel automatically provisions SSL certificates
   - Verify HTTPS is working after DNS propagation

5. **Verify Domain Configuration**
   - Test apex domain: `https://branchfeed.app`
   - Test www subdomain: `https://www.branchfeed.app` (should redirect to apex)
   - Verify redirects are working correctly

### www vs Apex Domain

**Canonical Domain**: `https://branchfeed.app` (apex)

**Redirect Strategy**:
- `https://www.branchfeed.app` → 301 redirect to `https://branchfeed.app`
- Always use apex domain as canonical in SEO configurations

**Configuration**:
- In Vercel: Set `branchfeed.app` as primary domain
- Configure `www.branchfeed.app` as redirect to apex
- Update all internal links and SEO metadata to use apex domain

### Staging / Preview Domains

**Current Strategy** (v1):

- **Production**: `https://branchfeed.app`
- **Preview/Staging**: Use Vercel default preview URLs
  - Format: `branchfeed-git-dev-{hash}.vercel.app`
  - Automatically generated for each preview deployment

**Future Strategy** (v2+):

- Add dedicated staging domain: `staging.branchfeed.app`
- Configure as Vercel alias for `dev` branch deployments
- Steps to migrate:
  1. Purchase/configure `staging.branchfeed.app` subdomain
  2. Add as alias in Vercel for `dev` branch
  3. Update environment variables to use staging domain
  4. Update internal documentation

### Domain Selection Guidelines

When choosing a domain (if alternatives are needed):

- **Brand Alignment**: Should reflect "BranchFeed" or branching story concept
- **Length**: Keep it short and memorable (preferably under 15 characters)
- **Extension**: Prefer `.app`, `.com`, or `.live` for tech products
- **Availability**: Check social media handle availability for consistency
- **SEO**: Consider keyword relevance if applicable

---

## 4. GitHub Repository & Branching Model

### Repository Naming

**Current/Planned Name**: `branchfeed`

- GitHub repository: `https://github.com/{username}/branchfeed`
- If rebranding occurs, see Section 7 for repo renaming procedure

### Branch Strategy

**Model**: Simple structured branching

```
main (production-ready, stable)
  ↑
dev (integration branch, pre-production)
  ↑
feature/* (temporary feature branches)
```

#### Branch Rules

1. **`main` Branch**
   - Contains stable, production-ready code
   - Only merged from `dev` after smoke tests pass
   - Protected branch (requires PR review)
   - Auto-deploys to production (`branchfeed.app`)

2. **`dev` Branch**
   - Integration branch for pre-production testing
   - Feature branches merge here first
   - Used for staging/preview deployments
   - Must pass smoke tests before merging to `main`

3. **`feature/*` Branches**
   - Temporary branches for specific features
   - Naming: `feature/description` (e.g., `feature/payment-integration`)
   - Must use Pull Requests for merging
   - Delete after merge

#### Merge Flow

```
feature/xyz → dev (via PR)
dev → main (via PR, after smoke tests)
```

### Releases & Versioning

**Versioning Strategy**: Semantic Versioning (SemVer)

- Format: `MAJOR.MINOR.PATCH` (e.g., `v0.1.0`, `v0.2.0`, `v1.0.0`)
- **MAJOR**: Breaking changes, major rebranding
- **MINOR**: New features, backward compatible
- **PATCH**: Bug fixes, small improvements

**Tagging**:
- Use Git tags for versions: `git tag v0.1.0`
- Push tags: `git push --tags`
- Optional: Create GitHub Releases for major versions

### Pull Request Process

**PR Requirements**:

- ✅ All significant changes require Pull Request
- ✅ PR description must include:
  - Summary of changes
  - Checklist of completed items (lint/test/smoke)
- ✅ Self-review: Author must verify:
  - Linting passes
  - Tests pass (if applicable)
  - Smoke test completed
- ✅ Minimum one approval before merge (if team grows)

**PR Template** (recommended):

```markdown
## Summary
Brief description of changes

## Checklist
- [ ] Linting passes
- [ ] Tests pass
- [ ] Smoke test completed
- [ ] Documentation updated (if needed)
```

---

## 5. Environments & Deployment Flow

### Environment Setup

**Three-Tier Environment Strategy**:

1. **Local Development**
   - Developer's local machine
   - Uses local Supabase instance or dev Supabase project
   - Environment: `.env.local`

2. **Preview/Staging**
   - Vercel preview builds
   - Uses Dev/Stage Supabase project
   - Environment: Vercel preview environment variables
   - URLs: `branchfeed-git-dev-{hash}.vercel.app`

3. **Production**
   - Main branch deployments
   - Uses Production Supabase project
   - Environment: Vercel production environment variables
   - URL: `https://branchfeed.app`

### Supabase Projects

**Two-Project Strategy**:

1. **Dev/Stage Supabase Project**
   - Used for: Local development + Preview/Staging deployments
   - Environment variables:
     - `NEXT_PUBLIC_SUPABASE_URL` (dev project URL)
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (dev project anon key)
   - Database: Can be reset/recreated for testing

2. **Production Supabase Project**
   - Used for: Main branch / Production deployments only
   - Environment variables:
     - `NEXT_PUBLIC_SUPABASE_URL` (production project URL)
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (production project anon key)
   - Database: Production data, never reset

**Configuration Differences**:

| Setting | Dev/Stage | Production |
|---------|-----------|------------|
| Supabase Project | Separate dev project | Separate prod project |
| Stripe Keys | Test mode keys | Live keys |
| Analytics | Test/Dev tracking | Production tracking |
| Error Reporting | Verbose logging | Production-level logging |
| Feature Flags | All features enabled | Controlled rollout |

### Deployment Flow

**Visual Flow**:

```
┌─────────────────┐
│  Local Commit   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Push to        │
│  feature/*      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐      ┌──────────────────┐
│  Vercel Preview │ ◄─── │  Auto-deploy     │
│  (feature)      │      │  on push         │
└────────┬────────┘      └──────────────────┘
         │
         ▼
┌─────────────────┐
│  Merge to dev   │
│  (via PR)       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐      ┌──────────────────┐
│  Staging Tests  │ ◄─── │  Smoke tests     │
│  (preview URLs) │      │  on dev branch   │
└────────┬────────┘      └──────────────────┘
         │
         ▼
┌─────────────────┐
│  Merge to main  │
│  (via PR)       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐      ┌──────────────────┐
│  Production     │ ◄─── │  Auto-deploy     │
│  branchfeed.app│      │  to production   │
└─────────────────┘      └──────────────────┘
```

**Deployment Checklist** (Production):

Before merging `dev` → `main`:

- [ ] All smoke tests pass on staging
- [ ] Environment variables verified (production Supabase, live Stripe keys)
- [ ] Database migrations tested on staging
- [ ] RLS policies verified
- [ ] No breaking changes without migration path
- [ ] Documentation updated (if needed)
- [ ] Feature flags configured (if applicable)

---

## 6. Major Feature Rollouts

### Payment System (Stripe)

> **Current Status (2025-01-XX)**: Payments, VIP და Coins ჯერ არქიტექტურის დონეზეა მხოლოდ – კოდში და პროდაქშენში *ჯერ არ არის ჩართული*. ეს სექცია აღწერს მომავალ გეგმას, როგორ გავუშვებთ სწორად, როცა მივალთ ამ ფაზამდე.

**Provider**: Stripe (primary payment provider)

**Payment Types** (long-term plan):

1. **Subscriptions**
   - Monthly plans for Premium/VIP features
   - Tiers: Starter / Pro / VIP
   - Recurring billing

2. **One-time Payments**
   - One-time purchaseable packages
   - Extra coins, packs, add-ons
   - Non-recurring

3. **In-app Currency (Coins)**
   - BranchFeed Coins system
   - Used to unlock:
     - Specific branches / premium paths
     - Extra features (extra slots, more branch saves, etc.)

**Rollout Phases**:

#### Phase 1: Stripe Test Mode / Sandbox
- **Status**: Internal testing only
- **Environment**: Dev/Staging Supabase + Stripe test keys
- **Scope**: No real users, internal team testing
- **Checklist**:
  - [ ] Stripe test account created
  - [ ] Test products/subscriptions configured
  - [ ] Test payment flow implemented
  - [ ] Webhook handlers tested (test mode)
  - [ ] Database schema for payments ready

#### Phase 2: Public Beta with Test Mode
- **Status**: UI visible, but test environment
- **Environment**: Preview/Staging with test Stripe keys
- **Scope**: Public can see payment UI, but all transactions are test
- **UI**: "Test Mode" label visible
- **Checklist**:
  - [ ] Payment UI implemented
  - [ ] Test mode indicator visible
  - [ ] Test transactions working
  - [ ] Webhook handling verified
  - [ ] User feedback collected

#### Phase 3: Live Payments (Production)
- **Status**: Real revenue, production Stripe keys
- **Environment**: Production with live Stripe keys
- **Scope**: Full monetization active
- **Gates** (separate documentation needed):
  - [ ] Compliance (GDPR, data protection)
  - [ ] Tax handling (VAT, sales tax)
  - [ ] Accounting integration
  - [ ] Refund policy documented
  - [ ] Terms of Service updated
  - [ ] Privacy Policy updated

### VIP / Membership System

**Tier Structure** (long-term plan):

1. **Tier 1: Supporter / Starter**
   - Basic features
   - Limited daily actions
   - Basic branch creation limits

2. **Tier 2: Pro**
   - Increased daily limits
   - More branch creation slots
   - Priority support (future)
   - Ad-free experience (future)

3. **Tier 3: VIP**
   - Maximum daily limits
   - Unlimited branch creation
   - Exclusive features
   - Early access to new features
   - Premium support

**General Differences Between Tiers**:
- Daily action limits (views, likes, comments)
- Branch creation limits
- Ad-free viewing (future)
- Additional branch save slots
- Priority in featured listings (future)
- Custom branding options (future)

**Implementation Notes**:
- Tier information stored in `profiles` table
- Subscription status tracked via Stripe
- Feature flags control tier-based access
- UI shows tier badges/indicators

### Advertising System (Future)

> **Current Status (2025-01-XX)**: რეკლამის სისტემა ამ ეტაპზე მხოლოდ სამომავლო გეგმაა. ჯერ არც UI, არც backend, არც ინტეგრაციები არ არის production-ში. ეს სექცია არის სტარტინგ-გეგმა, როცა მივალთ Ads ფაზამდე.

**Planned**: Internal promo/advertising system

**Strategy**:

1. **Internal Promo Slots**
   - Featured stories within BranchFeed
   - Sponsored branches/paths
   - Promoted content in feed

2. **Admin Panel Management**
   - Admin-controlled "Sponsored Story" module
   - Admin-controlled "Sponsored Path" module
   - Campaign management interface

3. **Future Expansion**
   - External Ad Network integration (v2+)
   - Priority: Internal advertising first (own inventory)
   - External networks considered for v2/v3

**Implementation Approach**:
- Database: `sponsored_stories` / `sponsored_paths` tables
- Admin UI: Content moderation panel extension
- UI: Clear "Sponsored" labels
- Analytics: Track sponsored content performance

### Feature Flags Strategy

**Purpose**: Gradual rollout of major features

**Flow**:

1. **Development**
   - Feature implemented with feature flag
   - Flag defaults to `false` (disabled)

2. **Staging**
   - Feature enabled in staging environment
   - Testing and validation

3. **Production Rollout**
   - Feature flag enabled for specific user segments (optional)
   - Gradual rollout (e.g., 10% → 50% → 100%)
   - Monitor metrics and errors

4. **Full Release**
   - Feature flag removed (feature always on)
   - Code cleanup

**Feature Flag Implementation** (high-level):
- Environment variable: `NEXT_PUBLIC_FEATURE_XYZ_ENABLED`
- Or: Database-driven feature flags table
- UI: Feature only visible if flag enabled
- Backend: Feature logic gated by flag check

### Backups & Recovery (High-Level)

- Supabase automatic backups გამოვიყენებთ როგორც მთავარ მექანიზმს.

- დიდ ოპერაციულ ცვლილებებამდე (დიდი მიგრაცია, ახალი payment სისტემა, domain ან branding შეცვლა) რეკომენდებულია:
  - გავაკეთოთ manual backup / export;
  - ჩავწეროთ `CHANGELOG.md`-ში, რომ „backup taken before X change".

- Rollback-ისას ამ დოკუმენტში (`docs/OPERATIONS_PLAYBOOK.md`) უნდა ჩაიწეროს:
  - რა ვერსიაზე დავბრუნდით;
  - რომელი backup-იდან მოხდა აღდგენა;
  - რა იყო rollback-ის მიზეზი (მოკლე აღწერა).

---

## 7. Renaming / Rebranding Playbook

### When to Use This Section

Use this procedure when:
- Project name changes (e.g., "BranchFeed" → "NewName")
- Complete rebranding is needed
- Domain changes (covered in Section 3)
- Major identity shift

### Rebranding Checklist

#### 1. Code & Configuration Files

- [ ] `README.md`
  - Update project name
  - Update description
  - Update screenshots/logos

- [ ] `package.json`
  - Update `name` field
  - Update `description` field
  - Update repository URL (if repo renamed)

- [ ] `.env.example`
  - Update any brand-specific variable names
  - Update default values if needed

#### 2. Hosting & Deployment

- [ ] **Vercel Project**
  - Rename project in Vercel dashboard
  - Update project settings
  - Verify deployments still work

- [ ] **Supabase Project**
  - Update project name/notes
  - Update any brand references in project description
  - Verify API keys remain valid

#### 3. SEO & Metadata

- [ ] **Next.js SEO Configuration**
  - Update `siteName` in SEO config
  - Update default `title` template
  - Update default `description`
  - Update Open Graph metadata
  - Update Twitter Card metadata

- [ ] **Favicon & App Icons**
  - Replace favicon
  - Replace app icons (if PWA)
  - Update manifest.json (if applicable)

#### 4. UI & Branding Assets

- [ ] **Logo**
  - Replace logo files
  - Update logo references in components
  - Update logo in header/navigation

- [ ] **UI Text**
  - Search for "BranchFeed" in codebase
  - Update all user-facing text
  - Update error messages
  - Update email templates (if applicable)

- [ ] **Social Links**
  - Update social media links (if changed)
  - Update social sharing metadata
  - Update social login branding (if applicable)

#### 5. Documentation

- [ ] `docs/OPERATIONS_PLAYBOOK.md` (this file)
  - Update all references to old name
  - Update project identity section

- [ ] `docs/PROJECT_OVERVIEW.md`
  - Update project name and description

- [ ] `docs/README.md` or main README
  - Update all brand references

- [ ] Other documentation files
  - Search and replace brand name in all docs

#### 6. External Services

- [ ] **GitHub Repository**
  - Rename repository (if needed)
  - Update repository description
  - Update repository topics/tags

- [ ] **Domain** (if changing)
  - See Section 3 for domain migration procedure

- [ ] **Social Media**
  - Update social media handles (if changed)
  - Update social media bios
  - Announce rebranding

#### 7. Database & Backend

- [ ] **Database Content**
  - Check for hardcoded brand names in database
  - Update any brand references in stored data (if applicable)
  - Update email templates in database (if stored)

- [ ] **API Responses**
  - Update any brand references in API responses
  - Update error messages

#### 8. Testing & Verification

- [ ] **Smoke Tests**
  - Verify app loads correctly
  - Verify all pages work
  - Verify SEO metadata updated
  - Verify social sharing works

- [ ] **Search & Replace Verification**
  - Global search for old brand name
  - Verify no missed references
  - Check case variations (e.g., "branchfeed", "BranchFeed", "BRANCHFEED")

#### 9. Communication

- [ ] **User Communication**
  - Announce rebranding (if public)
  - Update user-facing communications
  - Update support documentation

- [ ] **Team Communication**
  - Notify team members
  - Update internal documentation
  - Update onboarding materials

### Post-Rebranding

After rebranding is complete:

1. Update this playbook with new brand identity
2. Document the change in `CHANGELOG.md`
3. Verify all systems are working
4. Monitor for any missed references

---

## 8. Change Management Checklist

Use this checklist for any major operational change (domain migration, rebranding, new payment system, environment changes, etc.).

### Pre-Change Planning

- [ ] **Decision Documented**
  - Change reason documented
  - Impact assessment completed
  - Rollback plan defined (if applicable)

- [ ] **Stakeholder Approval**
  - Owner (Rezi) approval obtained
  - Team notified (if applicable)

### Implementation Checklist

#### Database & Migrations

- [ ] Database migrations tested on staging
- [ ] RLS policies updated (if needed)
- [ ] Data migration scripts tested (if applicable)
- [ ] Backup created before production changes

#### Environment Variables

- [ ] New environment variables documented in `.env.example`
- [ ] Staging environment variables updated
- [ ] Production environment variables updated
- [ ] Old/unused variables removed (if applicable)

#### Security & RLS

- [ ] RLS policies reviewed
- [ ] Authentication flows tested
- [ ] Authorization checks verified
- [ ] API keys rotated (if needed)

#### Payments & Integrations

- [ ] Payment provider configuration updated
- [ ] Webhook endpoints verified
- [ ] Test transactions completed
- [ ] Live transactions tested (if applicable)
- [ ] Refund process verified (if applicable)

#### Monitoring & Logging

- [ ] Error monitoring configured
- [ ] Analytics tracking updated
- [ ] Logging levels appropriate
- [ ] Alerts configured (if applicable)

#### Documentation Updates

- [ ] `docs/OPERATIONS_PLAYBOOK.md` updated (this file)
- [ ] `docs/ARCHITECTURE.md` updated (if architecture changed)
- [ ] `CHANGELOG.md` entry added
- [ ] Feature documentation updated (if applicable)
- [ ] API documentation updated (if applicable)

### Post-Change Verification

- [ ] **Smoke Tests**
  - All critical paths tested
  - No breaking changes observed
  - Performance acceptable

- [ ] **Monitoring**
  - Error rates normal
  - No unusual traffic patterns
  - All integrations working

- [ ] **User Impact**
  - User-facing changes communicated (if needed)
  - Support documentation updated
  - Known issues documented (if any)

### Rollback Plan (if applicable)

- [ ] Rollback procedure documented
- [ ] Rollback tested (if possible)
- [ ] Team knows rollback steps

---

## 9. Document Maintenance

### When to Update This Document

Update this playbook when:

- ✅ Domain changes (purchase, migration, DNS updates)
- ✅ Branding/rebranding decisions
- ✅ Payment strategy changes (new providers, new payment types)
- ✅ Git/branching strategy changes
- ✅ Environment setup changes (new environments, Supabase projects)
- ✅ Major feature rollout procedures change
- ✅ New operational procedures established

### What NOT to Update Automatically

- ❌ **Do NOT** update this file for minor code changes
- ❌ **Do NOT** update for feature additions (unless they affect operations)
- ❌ **Do NOT** let AI/automation modify this file without Owner (Rezi) explicit approval

### Versioning

**Version Format**: `v{MAJOR}.{MINOR}`

- **MAJOR**: Significant operational changes (rebranding, domain migration, payment system overhaul)
- **MINOR**: Updates to procedures, new sections, clarifications

**Version History**:

- `v1.0` (2025-01-XX): Initial playbook creation

### Update Procedure

When updating this document:

1. **Get Approval**
   - Owner (Rezi) must approve operational changes
   - Document the decision/reason

2. **Update Document**
   - Make changes in appropriate sections
   - Update "Last Updated" date
   - Increment version if major change

3. **Update Related Docs**
   - Update `CHANGELOG.md` with operational change
   - Update `docs/ARCHITECTURE.md` if architecture affected
   - Notify team (if applicable)

4. **Commit**
   - Commit with clear message: `docs: update OPERATIONS_PLAYBOOK - {reason}`
   - Reference issue/decision if applicable

### Document Structure

This document is organized for easy navigation:

- **Sections 1-2**: Introduction and current identity
- **Sections 3-5**: Infrastructure (domains, Git, environments)
- **Sections 6-7**: Feature rollouts and rebranding
- **Sections 8-9**: Change management and maintenance

### Quick Reference: Where to Update What

| Change Type | Update Section |
|-------------|----------------|
| Domain purchase/migration | Section 3: Domains & DNS Strategy |
| Rebranding | Section 7: Renaming / Rebranding Playbook |
| Payment system changes | Section 6: Major Feature Rollouts → Payment System |
| Git strategy changes | Section 4: GitHub Repository & Branching Model |
| Environment changes | Section 5: Environments & Deployment Flow |
| New feature rollout | Section 6: Major Feature Rollouts |
| General operational change | Section 8: Change Management Checklist |

---

## Appendix: Quick Reference

### Current Configuration Summary

- **Project Name**: BranchFeed
- **Production Domain**: `branchfeed.app` (target)
- **Staging**: Vercel preview URLs (future: `staging.branchfeed.app`)
- **Repository**: `branchfeed` (GitHub)
- **Payment Provider**: Stripe
- **Supabase Projects**: 2 (Dev/Stage + Production)
- **Environments**: 3 (Local, Preview, Production)

### Key Contacts / Resources

- **Project Owner**: Rezi
- **Documentation**: `docs/` directory
- **Development Rules**: `.cursorrules`
- **Feature Priorities**: `docs/PROJECT_PRIORITIES.md`

---

**Last Updated**: 2025-01-XX  
**Version**: 1.0  
**Status**: Active - Operational Guide

