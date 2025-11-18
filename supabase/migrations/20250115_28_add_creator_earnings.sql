-- Migration: Add creator earnings tracking
-- Date: 2025-01-15
-- Description: Creates tables for tracking creator earnings based on story performance

-- Create creator_earnings table (aggregated earnings per creator)
CREATE TABLE IF NOT EXISTS creator_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  total_earnings DECIMAL(10, 2) NOT NULL DEFAULT 0.00, -- Total earnings in USD
  pending_earnings DECIMAL(10, 2) NOT NULL DEFAULT 0.00, -- Earnings pending payout
  paid_earnings DECIMAL(10, 2) NOT NULL DEFAULT 0.00, -- Earnings already paid out
  last_calculated_at TIMESTAMPTZ DEFAULT NOW(), -- Last time earnings were calculated
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(creator_id)
);

COMMENT ON TABLE creator_earnings IS 
  'Aggregated earnings per creator. Updated based on story performance metrics.';

COMMENT ON COLUMN creator_earnings.total_earnings IS 
  'Total earnings accumulated by the creator (pending + paid).';

COMMENT ON COLUMN creator_earnings.pending_earnings IS 
  'Earnings that are pending payout (not yet paid to creator).';

COMMENT ON COLUMN creator_earnings.paid_earnings IS 
  'Earnings that have been paid out to the creator.';

-- Create earnings_history table (detailed earnings transactions)
CREATE TABLE IF NOT EXISTS earnings_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  story_id UUID REFERENCES stories(id) ON DELETE SET NULL, -- Story that generated earnings
  earnings_type TEXT NOT NULL CHECK (earnings_type IN ('view', 'like', 'share', 'comment', 'subscription', 'bonus')),
  amount DECIMAL(10, 2) NOT NULL, -- Earnings amount in USD
  period_start TIMESTAMPTZ, -- Period start for this earnings entry
  period_end TIMESTAMPTZ, -- Period end for this earnings entry
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
  payout_id UUID, -- Reference to payout record (if paid)
  metadata JSONB, -- Additional metadata (story title, metrics, etc.)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE earnings_history IS 
  'Detailed history of earnings transactions per creator. Used for tracking and payout processing.';

COMMENT ON COLUMN earnings_history.earnings_type IS 
  'Type of earnings: view, like, share, comment, subscription, bonus.';

COMMENT ON COLUMN earnings_history.amount IS 
  'Earnings amount in USD for this transaction.';

COMMENT ON COLUMN earnings_history.status IS 
  'Earnings status: pending (not paid), paid (payout completed), cancelled (earnings cancelled).';

-- Create creator_payouts table (payout records)
CREATE TABLE IF NOT EXISTS creator_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL, -- Payout amount in USD
  currency TEXT NOT NULL DEFAULT 'usd',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  payout_method TEXT, -- Payment method (stripe, bank_transfer, etc.)
  payout_reference TEXT, -- External payout reference (Stripe transfer ID, etc.)
  earnings_ids UUID[], -- Array of earnings_history IDs included in this payout
  requested_at TIMESTAMPTZ DEFAULT NOW(), -- When payout was requested
  processed_at TIMESTAMPTZ, -- When payout was processed
  completed_at TIMESTAMPTZ, -- When payout was completed
  failure_reason TEXT, -- Reason for failure if status is 'failed'
  metadata JSONB, -- Additional payout metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE creator_payouts IS 
  'Payout records for creators. Tracks payout requests and processing status.';

COMMENT ON COLUMN creator_payouts.earnings_ids IS 
  'Array of earnings_history IDs that are included in this payout.';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_creator_earnings_creator_id ON creator_earnings(creator_id);
CREATE INDEX IF NOT EXISTS idx_earnings_history_creator_id ON earnings_history(creator_id);
CREATE INDEX IF NOT EXISTS idx_earnings_history_story_id ON earnings_history(story_id);
CREATE INDEX IF NOT EXISTS idx_earnings_history_status ON earnings_history(status);
CREATE INDEX IF NOT EXISTS idx_earnings_history_created_at ON earnings_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_creator_payouts_creator_id ON creator_payouts(creator_id);
CREATE INDEX IF NOT EXISTS idx_creator_payouts_status ON creator_payouts(status);
CREATE INDEX IF NOT EXISTS idx_creator_payouts_created_at ON creator_payouts(created_at DESC);

-- Enable RLS
ALTER TABLE creator_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE earnings_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_payouts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DO $$
BEGIN
  -- Creator Earnings: Creators can read their own earnings
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'creator_earnings' 
    AND policyname = 'Creators can read own earnings'
  ) THEN
    CREATE POLICY "Creators can read own earnings"
      ON creator_earnings
      FOR SELECT
      TO authenticated
      USING (creator_id = auth.uid());
  END IF;

  -- Earnings History: Creators can read their own earnings history
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'earnings_history' 
    AND policyname = 'Creators can read own earnings history'
  ) THEN
    CREATE POLICY "Creators can read own earnings history"
      ON earnings_history
      FOR SELECT
      TO authenticated
      USING (creator_id = auth.uid());
  END IF;

  -- Creator Payouts: Creators can read their own payouts
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'creator_payouts' 
    AND policyname = 'Creators can read own payouts'
  ) THEN
    CREATE POLICY "Creators can read own payouts"
      ON creator_payouts
      FOR SELECT
      TO authenticated
      USING (creator_id = auth.uid());
  END IF;

  -- System can insert/update earnings (via API/admin)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'creator_earnings' 
    AND policyname = 'System can manage earnings'
  ) THEN
    CREATE POLICY "System can manage earnings"
      ON creator_earnings
      FOR ALL
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'earnings_history' 
    AND policyname = 'System can manage earnings history'
  ) THEN
    CREATE POLICY "System can manage earnings history"
      ON earnings_history
      FOR ALL
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'creator_payouts' 
    AND policyname = 'System can manage payouts'
  ) THEN
    CREATE POLICY "System can manage payouts"
      ON creator_payouts
      FOR ALL
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- Function to update creator_earnings when earnings_history is inserted
CREATE OR REPLACE FUNCTION update_creator_earnings()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Insert or update creator_earnings
    INSERT INTO creator_earnings (creator_id, total_earnings, pending_earnings, last_calculated_at)
    VALUES (NEW.creator_id, NEW.amount, NEW.amount, NOW())
    ON CONFLICT (creator_id) DO UPDATE
    SET 
      total_earnings = creator_earnings.total_earnings + NEW.amount,
      pending_earnings = creator_earnings.pending_earnings + CASE WHEN NEW.status = 'pending' THEN NEW.amount ELSE 0 END,
      last_calculated_at = NOW(),
      updated_at = NOW();
    
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Handle status changes (pending -> paid)
    IF OLD.status = 'pending' AND NEW.status = 'paid' THEN
      UPDATE creator_earnings
      SET 
        pending_earnings = pending_earnings - OLD.amount,
        paid_earnings = paid_earnings + NEW.amount,
        updated_at = NOW()
      WHERE creator_id = NEW.creator_id;
    END IF;
    
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update creator_earnings
DROP TRIGGER IF EXISTS trigger_update_creator_earnings ON earnings_history;
CREATE TRIGGER trigger_update_creator_earnings
  AFTER INSERT OR UPDATE ON earnings_history
  FOR EACH ROW
  EXECUTE FUNCTION update_creator_earnings();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_creator_earnings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS trigger_creator_earnings_updated_at ON creator_earnings;
CREATE TRIGGER trigger_creator_earnings_updated_at
  BEFORE UPDATE ON creator_earnings
  FOR EACH ROW
  EXECUTE FUNCTION update_creator_earnings_updated_at();

DROP TRIGGER IF EXISTS trigger_creator_payouts_updated_at ON creator_payouts;
CREATE TRIGGER trigger_creator_payouts_updated_at
  BEFORE UPDATE ON creator_payouts
  FOR EACH ROW
  EXECUTE FUNCTION update_creator_earnings_updated_at();

-- Verification queries
-- SELECT table_name FROM information_schema.tables WHERE table_name IN ('creator_earnings', 'earnings_history', 'creator_payouts');
-- SELECT indexname FROM pg_indexes WHERE tablename IN ('creator_earnings', 'earnings_history', 'creator_payouts');

