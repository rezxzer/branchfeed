-- Subscription System Schema
-- This migration creates tables for Stripe subscription management
-- Status: Phase 0 (Design/Architecture) - Test mode only

-- ============================================
-- User Subscriptions Table
-- ============================================

CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
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
  UNIQUE(user_id) -- One active subscription per user
);

-- ============================================
-- Indexes for Performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_customer_id ON public.user_subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_subscription_id ON public.user_subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON public.user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_tier ON public.user_subscriptions(tier);

-- ============================================
-- Payment History Table (for tracking transactions)
-- ============================================

CREATE TABLE IF NOT EXISTS public.payment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.user_subscriptions(id) ON DELETE SET NULL,
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_invoice_id TEXT,
  amount INTEGER NOT NULL, -- Amount in cents
  currency TEXT NOT NULL DEFAULT 'usd',
  status TEXT NOT NULL CHECK (status IN ('succeeded', 'pending', 'failed', 'refunded')),
  payment_type TEXT NOT NULL CHECK (payment_type IN ('subscription', 'one_time', 'coins')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB -- Additional Stripe metadata
);

-- ============================================
-- Indexes for Payment History
-- ============================================

CREATE INDEX IF NOT EXISTS idx_payment_history_user_id ON public.payment_history(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_subscription_id ON public.payment_history(subscription_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_stripe_payment_intent_id ON public.payment_history(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_status ON public.payment_history(status);
CREATE INDEX IF NOT EXISTS idx_payment_history_created_at ON public.payment_history(created_at DESC);

-- ============================================
-- Update Trigger for updated_at
-- ============================================

CREATE OR REPLACE FUNCTION public.update_subscription_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_user_subscriptions_updated_at ON public.user_subscriptions;
CREATE TRIGGER tr_user_subscriptions_updated_at
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_subscription_updated_at();

-- ============================================
-- RLS Policies
-- ============================================

-- Enable RLS
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;

-- User Subscriptions: Users can read their own subscription
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'user_subscriptions' 
    AND policyname = 'Users can read their own subscription'
  ) THEN
    CREATE POLICY "Users can read their own subscription"
      ON public.user_subscriptions
      FOR SELECT
      TO authenticated
      USING (user_id = auth.uid());
  END IF;
END $$;

-- Payment History: Users can read their own payment history
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'payment_history' 
    AND policyname = 'Users can read their own payment history'
  ) THEN
    CREATE POLICY "Users can read their own payment history"
      ON public.payment_history
      FOR SELECT
      TO authenticated
      USING (user_id = auth.uid());
  END IF;
END $$;

-- Admin can read all subscriptions (for admin dashboard)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'user_subscriptions' 
    AND policyname = 'Admins can read all subscriptions'
  ) THEN
    CREATE POLICY "Admins can read all subscriptions"
      ON public.user_subscriptions
      FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.admin_roles
          WHERE user_id = auth.uid()
          AND role = 'admin'
        )
      );
  END IF;
END $$;

-- Admin can read all payment history
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'payment_history' 
    AND policyname = 'Admins can read all payment history'
  ) THEN
    CREATE POLICY "Admins can read all payment history"
      ON public.payment_history
      FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.admin_roles
          WHERE user_id = auth.uid()
          AND role = 'admin'
        )
      );
  END IF;
END $$;

-- ============================================
-- Comments for Documentation
-- ============================================

COMMENT ON TABLE public.user_subscriptions IS 'Stores user subscription information from Stripe';
COMMENT ON TABLE public.payment_history IS 'Tracks payment transactions (subscriptions, one-time purchases, coins)';
COMMENT ON COLUMN public.user_subscriptions.tier IS 'Subscription tier: supporter, pro, or vip';
COMMENT ON COLUMN public.user_subscriptions.status IS 'Stripe subscription status: active, canceled, past_due, trialing, incomplete, incomplete_expired';
COMMENT ON COLUMN public.payment_history.amount IS 'Payment amount in cents (e.g., 499 = $4.99)';
COMMENT ON COLUMN public.payment_history.payment_type IS 'Type of payment: subscription, one_time, or coins';

