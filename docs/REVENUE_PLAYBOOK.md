# BranchFeed Revenue & Monetization Playbook

This document serves as the strategic and operational guide for BranchFeed's revenue streams, monetization features, and phased rollout plans. It covers payments, subscriptions, VIP tiers, in-app currency (Coins), and advertising systems.

> ⚠️ **Current Status (2025-01-XX)**: All monetization features described in this document (Payments, VIP tiers, Coins, Advertising) are currently **planned/architectural** and **NOT live in production**. Nothing in this document should be considered active until a separate "go live" decision is documented in `docs/OPERATIONS_PLAYBOOK.md` or this document.

> 📋 **Scope**: This playbook focuses exclusively on revenue and monetization. For general operations (domains, Git, environments), see `docs/OPERATIONS_PLAYBOOK.md`.

---

## A. Introduction

### What is This Document?

The BranchFeed Revenue & Monetization Playbook is a strategic guide that documents:

- **Planned revenue streams** (subscriptions, one-time purchases, coins, advertising)
- **Phased rollout strategy** for monetization features
- **Operational procedures** for payment systems, VIP tiers, and advertising
- **Compliance considerations** and change management for revenue features

### Current Status

As of 2025-01-XX, all monetization features are in **planning/architectural phase**:

- ❌ No live Stripe payments
- ❌ No active VIP subscriptions
- ❌ No Coins economy in production
- ❌ No advertising system deployed

This document describes the **intended strategy** and **rollout plan** for when these features are ready to go live.

### Document Maintenance

- **Owner**: Rezi (Project Owner)
- **Version**: 1.0
- **Last Updated**: 2025-01-XX
- **Update Policy**: Update when revenue strategy changes, new monetization features are planned, or pricing/tier structures are modified.

---

## B. Revenue Overview

BranchFeed's monetization strategy focuses on four primary revenue streams:

### 1. Stripe Subscriptions (VIP / Membership Tiers)

**Purpose**: Recurring monthly revenue from premium membership subscriptions.

**Function in BranchFeed**:
- Users subscribe to one of three membership tiers (Supporter, Pro, VIP)
- Each tier provides different levels of access, limits, and features
- Monthly recurring billing through Stripe
- Primary revenue stream for sustainable growth

**Key Features**:
- Tier-based access control
- Monthly subscription management
- Upgrade/downgrade/cancel flows
- Feature gating based on subscription status

### 2. One-time Purchases (Packs, Add-ons)

**Purpose**: Additional revenue from non-recurring purchases.

**Function in BranchFeed**:
- Users can purchase one-time packages (extra coins, feature packs, add-ons)
- Purchased through Stripe one-time payment flow
- Immediate access to purchased items
- Complements subscription model

**Key Features**:
- One-time payment processing
- Instant delivery of purchased items
- Purchase history tracking
- No recurring commitment

### 3. Coins (In-app Currency)

**Purpose**: Virtual currency system for microtransactions and premium content access.

**Function in BranchFeed**:
- Users purchase Coins bundles through Stripe
- Coins are spent within the app to unlock:
  - Premium branches/paths
  - Boosts and special features
  - Future perks and enhancements
- Creates engagement and additional revenue layer

**Key Features**:
- Virtual currency with no cash-out option
- Bundle-based purchase system
- In-app spending mechanics
- Balance tracking and transaction history

### 4. Internal Ads / Sponsored Stories

**Purpose**: Revenue from internal advertising inventory.

**Function in BranchFeed**:
- Admin-controlled sponsored content (stories, branches, paths)
- Featured/promoted content within the feed
- Internal inventory management (no external ad networks initially)
- Future expansion to external ad networks (v2+)

**Key Features**:
- Admin panel for campaign management
- Clear "Sponsored" labeling
- Analytics and performance tracking
- User experience preservation (non-intrusive)

---

## C. Phased Rollout Plan

The monetization features will be rolled out in phases to ensure proper testing, compliance, and user experience.

### Phase 0: Design Only

**Status**: Current phase (as of 2025-01-XX)

**What's Included**:
- Architecture and design documentation
- Database schema planning
- UI/UX mockups and wireframes
- Integration planning (Stripe, payment flows)

**What's Disabled**:
- No payment processing
- No subscription management
- No Coins system
- No advertising features

**Next Phase Requirements**:
- [ ] Complete architecture documentation
- [ ] Database schema finalized
- [ ] UI/UX designs approved
- [ ] Integration approach documented

---

### Phase 1: Stripe Test Mode (Internal + Test Users)

**Status**: Not started

**What's Included**:
- Stripe integration with test keys only
- Payment UI visible but clearly marked "Test Mode"
- Subscription flows (test transactions)
- VIP tier structure (test data)
- Webhook handlers (test mode)
- Internal team testing

**What's Disabled**:
- ❌ No real money transactions
- ❌ No public user payments
- ❌ No live Stripe keys
- ❌ No Coins purchases
- ❌ No advertising system

**Next Phase Requirements**:
- [ ] All test transactions working correctly
- [ ] Webhook handling verified
- [ ] Database schema tested
- [ ] RLS policies verified
- [ ] Error handling tested
- [ ] Internal team validation complete

---

### Phase 2: Live Subscriptions (Limited Rollout)

**Status**: Not started

**What's Included**:
- Live Stripe keys (production)
- Real subscription payments
- VIP tier subscriptions active
- Upgrade/downgrade/cancel flows
- Payment history and receipts
- Limited user rollout (beta users or percentage-based)

**What's Disabled**:
- ❌ Coins economy not yet active
- ❌ One-time purchases not yet active
- ❌ Advertising system not yet active
- ❌ Full public rollout (limited to beta/percentage)

**Next Phase Requirements**:
- [ ] Terms of Service updated
- [ ] Privacy Policy updated
- [ ] Refund policy documented
- [ ] Tax/compliance consultation completed
- [ ] Payment monitoring in place
- [ ] Support process for payment issues
- [ ] Beta user feedback collected
- [ ] No critical payment issues reported

---

### Phase 3: Coins Economy + VIP Features Expansion

**Status**: Not started

**What's Included**:
- Coins purchase system (Stripe bundles)
- Coins spending mechanics
- Premium branch/path unlocking
- Boosts and special features
- Expanded VIP tier benefits
- One-time purchase packs
- Transaction history and balance tracking

**What's Disabled**:
- ❌ Advertising system not yet active
- ❌ External ad networks not integrated

**Next Phase Requirements**:
- [ ] Coins anti-abuse protections implemented
- [ ] Rate limits configured
- [ ] Fraud detection mechanisms in place
- [ ] Age verification/restrictions (if applicable)
- [ ] Terms updated for Coins usage
- [ ] UX clearly explains Coins rules
- [ ] No cash-out policy clearly communicated
- [ ] Transaction audit logs working

---

### Phase 4: Internal Ads / Sponsored Stories

**Status**: Not started

**What's Included**:
- Admin panel for sponsored content management
- Sponsored Stories feature
- Sponsored Paths/Branches feature
- Campaign management interface
- Analytics and performance tracking
- Clear "Sponsored" labeling in UI

**What's Disabled**:
- ❌ External ad networks (Google Ads, etc.) - future consideration only

**Next Phase Requirements**:
- [ ] Moderation rules documented
- [ ] "Sponsored" labeling implemented in UI and code
- [ ] Basic analytics (impressions/clicks) working
- [ ] Admin panel fully functional
- [ ] User experience guidelines followed
- [ ] Terms updated for advertising

---

## D. Stripe & Payments Strategy

### Primary Payment Provider

**Provider**: Stripe (primary and only payment provider for v1)

**Rationale**:
- Industry-standard payment processing
- Strong developer tools and documentation
- Built-in subscription management
- Webhook reliability
- International payment support

### Environment Separation

**Critical Rule**: Test keys and live keys must be strictly separated:

- **Dev/Staging Environment**:
  - Uses Stripe test keys only
  - Test mode transactions
  - No real money involved
  - Environment variable: `STRIPE_SECRET_KEY_TEST`

- **Production Environment**:
  - Uses Stripe live keys only
  - Real transactions
  - Real revenue
  - Environment variable: `STRIPE_SECRET_KEY_LIVE`

**Status Check**: Until `docs/OPERATIONS_PLAYBOOK.md` explicitly states "payments ready / go live", all Stripe integrations are considered **test-only status**.

### Pricing & Plans

**High-Level Structure**:

#### Tier 1: Supporter / Starter
- **Pricing**: Lower monthly fee (example: $4.99/month)
- **Limits**: Basic daily action limits (views, likes, comments)
- **Features**: Standard branch creation limits, basic features
- **Target**: Casual users, new members

#### Tier 2: Pro
- **Pricing**: Mid-range monthly fee (example: $9.99/month)
- **Limits**: Increased daily action limits
- **Features**: More branch creation slots, priority support (future), ad-free experience (future)
- **Target**: Active creators, power users

#### Tier 3: VIP
- **Pricing**: Premium monthly fee (example: $19.99/month)
- **Limits**: Maximum daily limits
- **Features**: Unlimited branch creation, exclusive features, early access, premium support
- **Target**: Professional creators, top users

**Tier Differences** (examples):
- Daily action limits (views, likes, comments per day)
- Branch creation limits (number of branches per month)
- Ad-free viewing (future feature)
- Additional branch save slots
- Priority in featured listings (future)
- Custom branding options (future)
- Early access to new features

**Note**: Exact pricing and limits will be determined during Phase 1 testing and market research.

### Webhooks & Reliability

**Operational Principles**:

- **Webhook Endpoints**: Must be reliable and handle all Stripe events
- **Retry Logic**: Implement automatic retry for failed webhook deliveries
- **Idempotency**: Ensure webhook handlers are idempotent (same event processed multiple times = same result)
- **Monitoring**: Track webhook delivery success rates
- **Error Handling**: Log all webhook failures and alert on critical issues
- **Database Updates**: Webhook handlers must update database atomically

**Key Events to Handle**:
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`
- `charge.refunded`

### Refunds & Disputes

**Operational Approach**:

- **Refund Policy**: Will be documented in Terms of Service (separate legal document)
- **Dispute Handling**: Process will be defined in Terms of Service
- **Operational Notes**:
  - Refunds should be processed through Stripe dashboard or API
  - Refund reasons should be logged
  - User account status should be updated accordingly
  - Communication with user is required for refunds

**Legal Disclaimer**: This playbook is **not a legal document**. All refund rules, dispute procedures, and legal terms must be defined in separate Terms of Service and Privacy Policy documents, reviewed by legal counsel.

---

## E. VIP / Membership Tiers

### Tier Structure

BranchFeed will offer three membership tiers with distinct benefits and pricing.

#### Tier 1: Supporter / Starter

**Daily Limits** (examples):
- Views: Standard limit (e.g., 100 views/day)
- Likes: Standard limit (e.g., 50 likes/day)
- Comments: Standard limit (e.g., 30 comments/day)

**Branch Creation Limits**:
- Basic limit (e.g., 5 branches/month)

**Additional Features**:
- Standard features access
- Basic support
- Community access

**Future Features** (planned):
- Basic analytics
- Standard templates

---

#### Tier 2: Pro

**Daily Limits** (examples):
- Views: Increased limit (e.g., 500 views/day)
- Likes: Increased limit (e.g., 200 likes/day)
- Comments: Increased limit (e.g., 100 comments/day)

**Branch Creation Limits**:
- More slots (e.g., 20 branches/month)

**Additional Features**:
- Priority support (future)
- Ad-free experience (future)
- Advanced analytics (future)
- More branch save slots

**Future Features** (planned):
- Custom themes
- Advanced templates
- Priority placement in feed

---

#### Tier 3: VIP

**Daily Limits** (examples):
- Views: Maximum limit (e.g., unlimited or very high cap)
- Likes: Maximum limit (e.g., unlimited or very high cap)
- Comments: Maximum limit (e.g., unlimited or very high cap)

**Branch Creation Limits**:
- Unlimited branches

**Additional Features**:
- Exclusive features
- Early access to new features
- Premium support
- Maximum branch save slots
- Custom branding options (future)

**Future Features** (planned):
- White-label options
- API access (future)
- Custom integrations

---

### Rules & Constraints

#### User Communication

- **Clear Tier Descriptions**: Users must clearly understand what each tier provides
- **Feature Comparison**: UI should show side-by-side comparison of tier benefits
- **Transparent Limits**: All limits (daily, monthly) must be clearly displayed
- **Terms Documentation**: Tier benefits documented in Terms of Service

#### Upgrade, Downgrade, Cancel

**Upgrade Flow**:
- User can upgrade at any time
- Immediate access to new tier features
- Prorated billing adjustment (if applicable)
- Next billing cycle reflects new tier price

**Downgrade Flow**:
- User can downgrade at any time
- Access to higher tier features continues until current billing period ends
- Next billing cycle reflects new tier price
- User should be notified of feature loss before downgrade completes

**Cancel Flow**:
- User can cancel subscription at any time
- Access continues until end of current billing period
- No refund for current period (unless Terms specify otherwise)
- Account reverts to free tier after cancellation
- User data preserved (no deletion)

**Fair Treatment**:
- No sudden feature removal mid-cycle (except for violations)
- Clear communication about billing changes
- Grace period for payment failures (configurable)
- No hidden fees or charges

#### Legal Documentation

**Separate Legal Documents Required**:
- Terms of Service (subscription terms, cancellation policy)
- Privacy Policy (data handling, payment information)
- Refund Policy (refund eligibility, process)
- Cookie Policy (if applicable)

**This Playbook**: Contains only technical/product logic. Legal terms are documented separately and must be reviewed by legal counsel before going live.

---

## F. Coins Economy

### Overview

**Coins** are BranchFeed's in-app virtual currency system that allows users to make microtransactions and unlock premium content.

**Purchase Method**: Users buy Coins bundles through Stripe (one-time payments)

**Usage**: Coins are spent within the app to:
- Unlock premium branches/paths
- Purchase boosts and special features
- Access future perks and enhancements
- Buy temporary upgrades

### No Cash-Out Policy

**Critical Rule**: Coins **cannot be converted back to real money**.

- Coins are for in-app use only
- No refunds for Coins purchases (unless Terms specify otherwise)
- No exchange to fiat currency
- No transfer between users
- Coins balance is non-transferable

**User Communication**: This policy must be clearly communicated:
- During Coins purchase flow
- In Terms of Service
- In UI tooltips and help text
- Before first Coins purchase

### Anti-Abuse / Safety Measures

#### Rate Limits

**Per Account Limits**:
- Maximum Coins purchase per day (e.g., $X worth)
- Maximum Coins purchase per month (e.g., $Y worth)
- Maximum Coins spending per day (e.g., Z coins)

**Per Transaction Limits**:
- Minimum purchase amount
- Maximum purchase amount per transaction

#### Fraud Detection

**High-Level Approach**:
- Monitor for unusual purchase patterns
- Flag rapid successive purchases
- Track purchase velocity
- Verify payment method legitimacy
- Check for suspicious account activity

**Implementation Notes**:
- Fraud detection logic should be implemented before Phase 3
- Integration with Stripe's fraud detection tools
- Manual review process for flagged transactions

#### Minor Protection

**Age Restrictions** (architectural plan):
- Age verification required for Coins purchases
- Minimum age requirement (e.g., 18+ or parental consent)
- Parental controls (future consideration)
- Age-gated content restrictions

**Compliance**:
- Follow local regulations for age restrictions
- COPPA compliance (if applicable)
- GDPR considerations for minors
- Terms must specify age requirements

### Before Coins Go Live Checklist

**Database & Infrastructure**:
- [ ] Database schema for Coins transactions finalized
- [ ] Audit logs table for all Coins operations
- [ ] Balance tracking system implemented
- [ ] Transaction history system ready

**Security & Abuse Protection**:
- [ ] Rate limits configured and tested
- [ ] Fraud detection mechanisms in place
- [ ] Abuse protection rules documented
- [ ] Monitoring and alerting configured

**Legal & Compliance**:
- [ ] Terms of Service updated (Coins usage, no cash-out policy)
- [ ] Privacy Policy updated (transaction data handling)
- [ ] Age restrictions clearly documented
- [ ] Legal review completed

**User Experience**:
- [ ] UI clearly explains Coins purchase process
- [ ] UI clearly explains Coins spending options
- [ ] "No cash-out" policy prominently displayed
- [ ] Help documentation for Coins system
- [ ] Transaction history visible to users
- [ ] Balance display clear and accurate

---

## G. Advertising & Sponsored Content

### Strategy: Internal Ads First

**Phase 1 Approach**: Internal advertising system only

- **Sponsored Stories**: Admin-controlled featured stories
- **Sponsored Paths/Branches**: Admin-controlled promoted branching paths
- **Internal Inventory**: BranchFeed's own advertising space
- **No External Networks**: Google Ads, Facebook Ads, etc. are future consideration only (v2+)

**Rationale**:
- Full control over ad content and placement
- Better user experience (non-intrusive)
- Higher revenue per impression (no network fees)
- Easier moderation and compliance

### Rules & Guidelines

#### Clear Labeling

**Requirement**: Every sponsored piece of content must be clearly labeled:

- **UI Label**: "Sponsored" badge/label visible on all sponsored content
- **Code Implementation**: Sponsored flag in database and UI components
- **Consistency**: Same labeling style across all sponsored content types
- **Accessibility**: Label readable by screen readers

#### User Experience Priority

**Principles**:
- Ads should not be overly aggressive or intrusive
- Sponsored content should feel native to the platform
- User experience takes priority over ad revenue
- No auto-playing video ads (unless user-initiated)
- No pop-ups or overlays that block content

**Guidelines**:
- Maximum sponsored content ratio (e.g., 1 sponsored per 5 organic)
- Clear visual distinction (but not jarring)
- Relevant content only (no random ads)
- Easy to skip/dismiss if user chooses

### Before Ads Go Live Checklist

**Moderation & Content Rules**:
- [ ] Moderation rules documented (what's allowed/prohibited)
- [ ] Content guidelines for sponsored stories
- [ ] Approval process for sponsored content
- [ ] Prohibited content categories defined

**Technical Implementation**:
- [ ] "Sponsored" labeling implemented in UI
- [ ] "Sponsored" flag in database schema
- [ ] Admin panel for campaign management
- [ ] Content scheduling system (if applicable)

**Analytics & Tracking**:
- [ ] Basic analytics implemented (impressions, clicks)
- [ ] Performance tracking dashboard
- [ ] Reporting system for advertisers (future)
- [ ] Privacy-compliant tracking (GDPR considerations)

**Legal & Compliance**:
- [ ] Terms updated for advertising
- [ ] Privacy Policy updated (ad tracking)
- [ ] Cookie policy (if ad tracking uses cookies)
- [ ] Legal review for advertising compliance

---

## H. Compliance & Legal (High-Level)

### Important Disclaimer

**This Document is NOT a Legal Document**

This playbook provides **operational and product strategy** only. It does **not** constitute legal advice, terms of service, or compliance documentation.

**Legal Requirements**: Before any monetization features go live, separate legal documents must be created and reviewed by qualified legal counsel.

### Legal Topics to Cover (Separate Documents)

The following topics must be addressed in separate legal documents (Terms of Service, Privacy Policy, etc.):

#### Age Restrictions & Underage Protection
- Minimum age requirements for payments
- Parental consent requirements (if applicable)
- COPPA compliance (if applicable)
- Age verification processes

#### Refund Rules & Cancellations
- Refund eligibility criteria
- Refund process and timelines
- Cancellation policies
- Prorated refunds (if applicable)
- No-refund policies (where applicable, e.g., Coins)

#### Data Protection & Privacy
- Payment information handling
- Transaction data storage
- User financial data protection
- GDPR compliance (if applicable)
- Data retention policies

#### Anti-Money Laundering / Fraud Checks
- Identity verification requirements
- Transaction monitoring
- Suspicious activity reporting
- KYC (Know Your Customer) procedures (if applicable)

#### Tax & Invoicing
- Tax collection responsibilities
- Invoice generation
- VAT handling (if applicable)
- Sales tax (if applicable)
- International tax considerations

### Pre-Launch Legal Requirements

**Before Phase 2 (Live Subscriptions)**:
- [ ] Legal consultation scheduled/completed
- [ ] Terms of Service drafted and reviewed
- [ ] Privacy Policy drafted and reviewed
- [ ] Refund Policy documented
- [ ] Tax consultation completed (if applicable)
- [ ] Compliance review completed

**Ongoing**:
- Regular legal review as features expand
- Update legal documents when policies change
- Monitor regulatory changes
- Maintain compliance with payment regulations

---

## I. Change Management for Revenue

### When to Update This Document

Update this playbook when:
- Pricing changes (subscription plans, Coins bundles)
- New revenue channels are added (new VIP tier, new ad format)
- Existing plans/tiers are modified or disabled
- Monetization strategy shifts
- Rollout phases are adjusted

### Documentation Requirements

**For Any Revenue Change**:

1. **Update `CHANGELOG.md`**
   - Document what changed
   - When it changed
   - Why it changed (brief reason)

2. **Update This Document (`docs/REVENUE_PLAYBOOK.md`)**
   - Update relevant sections
   - Add to "Decision Log" (see below)
   - Update phase status if applicable

3. **Additional Actions** (as needed):
   - Update Terms of Service (if pricing/features changed)
   - Send user communication (email, in-app notification)
   - Update UI banners/notifications
   - Update help documentation

### Decision Log

This subsection tracks major revenue-related decisions over time.

**Format**: Date – Description of change

**Example Entries**:
- `2025-05-XX – Updated VIP Tier 2 (Pro) benefits: Added ad-free experience and priority support`
- `2025-06-XX – Introduced new Coins bundle: "Starter Pack" (100 Coins for $4.99)`
- `2025-07-XX – Discontinued Tier 1 (Supporter) plan, merged features into free tier`

### Change Management Table

| What Changed | Where to Document | Extra Actions |
|--------------|------------------|---------------|
| Pricing update (subscription) | `CHANGELOG.md` + This doc (Decision Log) | Terms update, User email, UI banner |
| New VIP tier added | `CHANGELOG.md` + This doc (Section E) | Terms update, Feature announcement |
| Coins bundle price change | `CHANGELOG.md` + This doc (Decision Log) | Terms update (if needed), UI update |
| Plan/tier discontinued | `CHANGELOG.md` + This doc (Decision Log) | User email, Migration plan, Terms update |
| New ad format introduced | `CHANGELOG.md` + This doc (Section G) | Terms update, User notification (if visible) |
| Refund policy change | `CHANGELOG.md` + Terms of Service | User email, Support team briefing |

### Communication Strategy

**For Pricing Changes**:
- Advance notice to existing subscribers (e.g., 30 days)
- Clear explanation of changes
- Grandfathering options (if applicable)
- Migration path for affected users

**For New Features**:
- Feature announcement
- Help documentation
- In-app tooltips/guides
- Support team training

**For Discontinued Plans**:
- Advance notice to affected users
- Migration options
- Timeline for changes
- Support during transition

---

## Appendix: Quick Reference

### Current Status Summary

- **Phase**: Phase 0 (Design Only)
- **Stripe Integration**: Not implemented
- **VIP Tiers**: Not active
- **Coins Economy**: Not active
- **Advertising**: Not active
- **Go-Live Decision**: Pending

### Key Documents

- **This Document**: `docs/REVENUE_PLAYBOOK.md` (revenue strategy)
- **Operations**: `docs/OPERATIONS_PLAYBOOK.md` (general operations)
- **Legal Documents**: Terms of Service, Privacy Policy (to be created)
- **Change Log**: `CHANGELOG.md` (change history)

### Next Steps

1. Complete Phase 0 design and architecture
2. Begin Phase 1 (Stripe test mode) implementation
3. Legal consultation and document creation
4. User testing and feedback collection
5. Proceed to Phase 2 only after all Phase 1 requirements met

---

**Last Updated**: 2025-01-XX  
**Version**: 1.0  
**Status**: Planning Phase - Not Live

