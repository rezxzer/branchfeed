/**
 * Stripe Integration
 * 
 * Handles Stripe payment processing and subscription management.
 * Status: Phase 0 (Test Mode Only)
 */

import Stripe from 'stripe';

// Initialize Stripe client
// Use test key in development, live key in production
const getStripeKey = (): string | null => {
  const isProduction = process.env.NODE_ENV === 'production';
  const testKey = process.env.STRIPE_SECRET_KEY_TEST;
  const liveKey = process.env.STRIPE_SECRET_KEY_LIVE;

  if (isProduction && liveKey) {
    return liveKey;
  }

  if (testKey) {
    return testKey;
  }

  // Return null during build if keys are not set (allows build to succeed)
  // Actual usage will check for null and throw error
  return null;
};

// Initialize Stripe instance (lazy initialization)
let stripeInstance: Stripe | null = null;

export const getStripe = (): Stripe => {
  if (!stripeInstance) {
    const key = getStripeKey();
    if (!key) {
      throw new Error('Stripe secret key not configured. Set STRIPE_SECRET_KEY_TEST or STRIPE_SECRET_KEY_LIVE');
    }
    stripeInstance = new Stripe(key, {
      apiVersion: '2025-10-29.clover',
      typescript: true,
    });
  }
  return stripeInstance;
};

// Export stripe for backward compatibility (will throw if not initialized)
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return getStripe()[prop as keyof Stripe];
  },
});

// Subscription Tiers Configuration
export const SUBSCRIPTION_TIERS = {
  supporter: {
    name: 'Supporter',
    priceId: process.env.STRIPE_PRICE_ID_SUPPORTER || '', // Set in env
    monthlyPrice: 4.99,
    features: [
      'Basic daily action limits',
      'Standard branch creation limits',
      'Basic features access',
    ],
  },
  pro: {
    name: 'Pro',
    priceId: process.env.STRIPE_PRICE_ID_PRO || '', // Set in env
    monthlyPrice: 9.99,
    features: [
      'Increased daily action limits',
      'More branch creation slots',
      'Priority support (future)',
      'Ad-free experience (future)',
    ],
  },
  vip: {
    name: 'VIP',
    priceId: process.env.STRIPE_PRICE_ID_VIP || '', // Set in env
    monthlyPrice: 19.99,
    features: [
      'Maximum daily limits',
      'Unlimited branch creation',
      'Exclusive features',
      'Early access to new features',
      'Premium support',
    ],
  },
} as const;

export type SubscriptionTier = keyof typeof SUBSCRIPTION_TIERS;

// Check if Stripe is in test mode
export const isStripeTestMode = (): boolean => {
  const key = getStripeKey();
  if (!key) {
    // Default to test mode if key not configured (for build)
    return true;
  }
  return key.startsWith('sk_test_');
};

// Get subscription tier limits
export const getTierLimits = (tier: SubscriptionTier | null) => {
  const defaultLimits = {
    dailyViews: 50,
    dailyLikes: 20,
    dailyComments: 10,
    monthlyStories: 5,
    maxBranchesPerStory: 5,
  };

  switch (tier) {
    case 'supporter':
      return {
        ...defaultLimits,
        dailyViews: 100,
        dailyLikes: 50,
        dailyComments: 25,
        monthlyStories: 10,
        maxBranchesPerStory: 10,
      };
    case 'pro':
      return {
        ...defaultLimits,
        dailyViews: 500,
        dailyLikes: 200,
        dailyComments: 100,
        monthlyStories: 50,
        maxBranchesPerStory: 20,
      };
    case 'vip':
      return {
        dailyViews: -1, // Unlimited
        dailyLikes: -1, // Unlimited
        dailyComments: -1, // Unlimited
        monthlyStories: -1, // Unlimited
        maxBranchesPerStory: -1, // Unlimited
      };
    default:
      return defaultLimits;
  }
};

