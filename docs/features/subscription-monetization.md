# Subscription & Monetization System - BranchFeed

## 📋 Overview

- **What**: Premium subscription tiers and payment integration system
- **Purpose**: Enable monetization through subscription tiers (Supporter, Pro, VIP) with Stripe integration
- **Location**: 
  - Database: `user_subscriptions`, `payment_history` tables
  - API Routes: `/api/stripe/*`, `/api/subscriptions/*`
  - Components: `SubscriptionSettings`, `PaymentHistory`, `SubscriptionBadge`
  - Utilities: `src/lib/stripe.ts`, `src/lib/subscription-limits.ts`, `src/lib/subscription-checks.ts`
- **Phase**: Phase 4 (Expansion) - Phase 0 (Test Mode Only)

## 🎯 Features

### Subscription Tiers

- **Supporter**: Basic premium features
- **Pro**: Enhanced premium features
- **VIP**: Maximum premium features

### Payment Integration

- Stripe checkout flow (test mode support)
- Stripe webhook handling (subscription lifecycle events)
- Payment history tracking
- Subscription management (upgrade, downgrade, cancel)

### Subscription Limits Enforcement

- Daily view limits (based on tier)
- Daily like limits (based on tier)
- Daily comment limits (based on tier)
- Monthly story creation limits (based on tier)
- Branch limits per story (based on tier)

### UI Components

- Subscription settings page
- Tier cards with pricing
- Payment history display
- Subscription badge (profile page)
- Error handling with upgrade prompts

## 📐 System Architecture

```
Subscription System
├── Database Layer
│   ├── user_subscriptions (subscription records)
│   └── payment_history (payment transactions)
├── API Layer
│   ├── /api/stripe/create-checkout (checkout session)
│   ├── /api/stripe/webhook (Stripe events)
│   ├── /api/subscriptions/current (get subscription)
│   ├── /api/subscriptions/[id]/cancel (cancel subscription)
│   └── /api/subscriptions/payments (payment history)
├── Business Logic
│   ├── subscription-limits.ts (tier limits configuration)
│   └── subscription-checks.ts (limit checking logic)
├── Client Components
│   ├── SubscriptionSettings (settings page)
│   ├── PaymentHistory (payment history display)
│   └── SubscriptionBadge (profile badge)
└── Hooks
    └── useSubscription (subscription state management)
```

## 🎨 UI Components

### Subscription Settings Page

- Current subscription status display
- Tier cards with features and pricing
- Subscribe/Upgrade/Cancel buttons
- Payment history section
- Test mode indicator

### Subscription Badge

- Displays user's current tier
- Compact and full variants
- Optional label display

### Payment History

- Transaction list with status
- Amount, date, payment type
- Filtering and sorting

## 🔧 Implementation

### Database Schema

#### `user_subscriptions` Table

```sql
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  tier TEXT NOT NULL CHECK (tier IN ('supporter', 'pro', 'vip')),
  status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'trialing', 'incomplete', 'incomplete_expired')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  canceled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);
```

#### `payment_history` Table

```sql
CREATE TABLE payment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES user_subscriptions(id) ON DELETE SET NULL,
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_invoice_id TEXT,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  status TEXT NOT NULL CHECK (status IN ('succeeded', 'pending', 'failed', 'refunded')),
  payment_type TEXT NOT NULL CHECK (payment_type IN ('subscription', 'one_time', 'coins')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB
);
```

### Subscription Limits Configuration

```typescript
// src/lib/subscription-limits.ts
export const SUBSCRIPTION_TIERS = {
  free: {
    dailyViews: 10,
    dailyLikes: 5,
    dailyComments: 3,
    monthlyStories: 1,
    maxBranchesPerStory: 3,
  },
  supporter: {
    dailyViews: 50,
    dailyLikes: 25,
    dailyComments: 15,
    monthlyStories: 5,
    maxBranchesPerStory: 5,
  },
  pro: {
    dailyViews: 200,
    dailyLikes: 100,
    dailyComments: 60,
    monthlyStories: 20,
    maxBranchesPerStory: 10,
  },
  vip: {
    dailyViews: -1, // Unlimited
    dailyLikes: -1,
    dailyComments: -1,
    monthlyStories: -1,
    maxBranchesPerStory: -1,
  },
};
```

### Subscription Limit Checking

```typescript
// src/lib/subscription-checks.ts
export async function checkSubscriptionLimit(
  userId: string,
  action: 'view' | 'like' | 'comment' | 'story' | 'branch',
  additionalData?: { nodesCount?: number }
): Promise<LimitCheckResult> {
  // Fetch user subscription
  // Get tier limits
  // Check current usage
  // Return allowed/remaining/reason
}
```

### API Routes

#### Create Checkout Session

```typescript
// POST /api/stripe/create-checkout
// Creates Stripe checkout session for subscription
// Returns checkout URL
```

#### Stripe Webhook

```typescript
// POST /api/stripe/webhook
// Handles Stripe events:
// - customer.subscription.created
// - customer.subscription.updated
// - customer.subscription.deleted
// - invoice.payment_succeeded
// - invoice.payment_failed
```

#### Get Current Subscription

```typescript
// GET /api/subscriptions/current
// Returns user's current subscription details
```

#### Cancel Subscription

```typescript
// POST /api/subscriptions/[id]/cancel
// Cancels user's subscription via Stripe
```

#### Get Payment History

```typescript
// GET /api/subscriptions/payments
// Returns user's payment history
```

### Client Components

#### Subscription Settings

```tsx
// src/components/settings/SubscriptionSettings.tsx
<SubscriptionSettings userId={userId} />
```

#### Payment History

```tsx
// src/components/settings/PaymentHistory.tsx
<PaymentHistory userId={userId} />
```

#### Subscription Badge

```tsx
// src/components/ui/SubscriptionBadge.tsx
<SubscriptionBadge variant="compact" showLabel={false} />
```

### Hooks

#### useSubscription Hook

```typescript
// src/hooks/useSubscription.ts
const { subscription, loading, error, refresh } = useSubscription();
```

## 📊 Subscription Limits Enforcement

### Daily View Limits

- **Enforced in**: `/api/stories/[id]/view`
- **Check**: Before incrementing view count
- **Error**: 403 Forbidden with remaining count
- **Client handling**: Toast notification with upgrade prompt

### Daily Like Limits

- **Enforced in**: `/api/stories/[id]/like`
- **Check**: Before adding like (not removing)
- **Error**: 403 Forbidden with remaining count
- **Client handling**: Toast notification with upgrade prompt

### Daily Comment Limits

- **Enforced in**: `/api/comments`
- **Check**: Before creating comment
- **Error**: 403 Forbidden with remaining count
- **Client handling**: Toast notification with upgrade prompt

### Monthly Story Creation Limits

- **Enforced in**: `/api/stories` (pre-check)
- **Check**: Before story creation (in `useCreateStory` hook)
- **Error**: Limit exceeded with remaining count
- **Client handling**: Error display with upgrade button

### Branch Limits Per Story

- **Enforced in**: `/api/stories` (pre-check)
- **Check**: Before story creation (nodes count)
- **Error**: Limit exceeded with max branches info
- **Client handling**: Error display with upgrade button

## 🌐 Internationalization (i18n)

Translation keys needed:

```json
{
  "subscription": {
    "title": "Subscription",
    "current": "Current Plan",
    "upgrade": "Upgrade",
    "cancel": "Cancel Subscription",
    "tiers": {
      "supporter": "Supporter",
      "pro": "Pro",
      "vip": "VIP"
    },
    "limits": {
      "dailyViews": "Daily Views",
      "dailyLikes": "Daily Likes",
      "dailyComments": "Daily Comments",
      "monthlyStories": "Monthly Stories",
      "maxBranches": "Max Branches per Story"
    }
  }
}
```

## ✅ Requirements Checklist

- [x] Database schema (user_subscriptions, payment_history)
- [x] Stripe integration (test mode support)
- [x] API routes (checkout, webhook, subscription management)
- [x] Subscription limits configuration
- [x] Subscription limit checking logic
- [x] UI components (settings, payment history, badge)
- [x] Hooks (useSubscription)
- [x] Error handling (user-friendly messages, upgrade prompts)
- [x] Integration into actions (views, likes, comments, story creation)
- [x] Settings page integration
- [x] Profile page integration (badge)
- [x] URL parameter support (`?tab=subscription`)

## 🔄 Future Enhancements

- Creator earnings system
- Ad system integration
- One-time purchases
- Coins/virtual currency
- Gift subscriptions
- Family/team plans
- Usage analytics dashboard
- Subscription tier comparison page
- Promo codes and discounts

## 📝 Notes

### Test Mode

- **All Stripe features are TEST MODE ONLY** until explicitly enabled in production
- Test mode is determined by `STRIPE_SECRET_KEY_TEST` vs `STRIPE_SECRET_KEY_LIVE`
- Test mode indicator shown in UI
- See `REVENUE_PLAYBOOK.md` for production activation strategy

### Subscription Limits

- Limits are enforced server-side for security
- Client-side error handling provides user-friendly messages
- Remaining counts are displayed in error messages
- Upgrade prompts link to subscription settings page

### Webhook Security

- Webhook signature verification required
- Uses Stripe webhook secret from environment variables
- Handles idempotency for duplicate events

### RLS Policies

- Users can read their own subscription
- Admins can read all subscriptions
- Payment history follows same rules

## 🔗 Related Documentation

- **Database Schema**: `docs/DATABASE.md` (user_subscriptions, payment_history tables)
- **Revenue Strategy**: `docs/REVENUE_PLAYBOOK.md`
- **Project Priorities**: `docs/PROJECT_PRIORITIES.md` (Phase 4: Monetization)
- **Stripe Configuration**: `src/lib/stripe.ts`
- **Subscription Limits**: `src/lib/subscription-limits.ts`
- **Subscription Checks**: `src/lib/subscription-checks.ts`

## 📊 Version History

| Version | Date | Changes |
| --- | --- | --- |
| 0.1 | 2025-01-15 | Initial implementation (Phase 0 - Test Mode Only) |
| 0.2 | 2025-01-15 | Added subscription limits enforcement |
| 0.3 | 2025-01-15 | Added error handling and upgrade prompts |
| 0.4 | 2025-01-15 | Added views limit error handling |

## 🚨 Important Notes

1. **Test Mode Only**: All Stripe features are in test mode. Do not enable production mode until:
   - All features are tested thoroughly
   - Payment flows are verified
   - Webhook endpoints are configured
   - Security review is completed

2. **Environment Variables**: Required Stripe environment variables:
   - `STRIPE_SECRET_KEY_TEST` (test mode)
   - `STRIPE_PUBLISHABLE_KEY_TEST` (test mode)
   - `STRIPE_PRICE_ID_SUPPORTER` (test mode)
   - `STRIPE_PRICE_ID_PRO` (test mode)
   - `STRIPE_PRICE_ID_VIP` (test mode)
   - `STRIPE_WEBHOOK_SECRET_TEST` (test mode)

3. **Migration**: Database migration file: `supabase/migrations/20250115_16_add_subscriptions_schema.sql`

4. **Limits Configuration**: Limits are configured in `src/lib/subscription-limits.ts` and can be adjusted per tier.

