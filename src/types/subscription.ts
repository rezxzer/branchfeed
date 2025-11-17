/**
 * Subscription Types
 * 
 * TypeScript types for subscription system
 */

export type SubscriptionTier = 'supporter' | 'pro' | 'vip';

export type SubscriptionStatus =
  | 'active'
  | 'canceled'
  | 'past_due'
  | 'trialing'
  | 'incomplete'
  | 'incomplete_expired';

export interface UserSubscription {
  id: string;
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  canceled_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaymentHistory {
  id: string;
  user_id: string;
  subscription_id: string | null;
  stripe_payment_intent_id: string | null;
  stripe_invoice_id: string | null;
  amount: number; // in cents
  currency: string;
  status: 'succeeded' | 'pending' | 'failed' | 'refunded';
  payment_type: 'subscription' | 'one_time' | 'coins';
  created_at: string;
  metadata: Record<string, any> | null;
}

export interface SubscriptionPlan {
  tier: SubscriptionTier;
  name: string;
  priceId: string;
  monthlyPrice: number;
  features: string[];
}

