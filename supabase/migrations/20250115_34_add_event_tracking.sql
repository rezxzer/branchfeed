-- Migration: Add event tracking system for monitoring and analytics
-- Date: 2025-01-15
-- Description: Creates platform_events table for tracking user actions, feature usage, errors, and performance metrics

-- Create platform_events table
CREATE TABLE IF NOT EXISTS platform_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL CHECK (event_type IN (
    'page_view',
    'feature_used',
    'error',
    'performance',
    'user_action',
    'api_call',
    'database_query'
  )),
  event_name TEXT NOT NULL,
  user_id UUID,
  session_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  severity TEXT CHECK (severity IN ('info', 'warning', 'error', 'critical')),
  duration_ms INTEGER,
  status_code INTEGER,
  error_message TEXT,
  error_stack TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT fk_platform_events_user FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE SET NULL
);

COMMENT ON TABLE platform_events IS 'Event tracking table for monitoring user actions, feature usage, errors, and performance metrics.';
COMMENT ON COLUMN platform_events.event_type IS 'Type of event: page_view, feature_used, error, performance, user_action, api_call, database_query.';
COMMENT ON COLUMN platform_events.event_name IS 'Name/identifier of the event (e.g., "feed_page_viewed", "story_created", "api_error").';
COMMENT ON COLUMN platform_events.user_id IS 'User who triggered the event (nullable for anonymous events).';
COMMENT ON COLUMN platform_events.session_id IS 'Session identifier for tracking user sessions.';
COMMENT ON COLUMN platform_events.metadata IS 'Additional event data as JSON (e.g., page URL, feature name, query params).';
COMMENT ON COLUMN platform_events.severity IS 'Severity level: info, warning, error, critical.';
COMMENT ON COLUMN platform_events.duration_ms IS 'Event duration in milliseconds (for performance events).';
COMMENT ON COLUMN platform_events.status_code IS 'HTTP status code (for API events).';
COMMENT ON COLUMN platform_events.error_message IS 'Error message (for error events).';
COMMENT ON COLUMN platform_events.error_stack IS 'Error stack trace (for error events).';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_platform_events_type ON platform_events(event_type);
CREATE INDEX IF NOT EXISTS idx_platform_events_name ON platform_events(event_name);
CREATE INDEX IF NOT EXISTS idx_platform_events_user_id ON platform_events(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_platform_events_created_at ON platform_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_platform_events_severity ON platform_events(severity) WHERE severity IN ('error', 'critical');
CREATE INDEX IF NOT EXISTS idx_platform_events_type_created ON platform_events(event_type, created_at DESC);

-- Enable RLS
ALTER TABLE platform_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DO $$
BEGIN
  -- Users can read their own events
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'platform_events' AND policyname = 'Users can read own events') THEN
    CREATE POLICY "Users can read own events" ON platform_events FOR SELECT TO authenticated USING (auth.uid() = user_id);
  END IF;

  -- Anyone (authenticated or anonymous via service role) can create events
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'platform_events' AND policyname = 'Anyone can create events') THEN
    CREATE POLICY "Anyone can create events" ON platform_events FOR INSERT TO authenticated WITH CHECK (true);
  END IF;

  -- Admins can read all events
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'platform_events' AND policyname = 'Admins can read all events') THEN
    CREATE POLICY "Admins can read all events" ON platform_events FOR SELECT TO authenticated USING (is_admin(auth.uid()));
  END IF;

  -- Admins can delete old events (for cleanup)
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'platform_events' AND policyname = 'Admins can delete events') THEN
    CREATE POLICY "Admins can delete events" ON platform_events FOR DELETE TO authenticated USING (is_admin(auth.uid()));
  END IF;
END $$;

-- Create function to clean up old events (keep last 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_events()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM platform_events
  WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$;

COMMENT ON FUNCTION cleanup_old_events IS 'Deletes events older than 90 days. Should be called periodically by a cron job.';

-- Create function to get event statistics
CREATE OR REPLACE FUNCTION get_event_stats(
  p_event_type TEXT DEFAULT NULL,
  p_start_date TIMESTAMPTZ DEFAULT NULL,
  p_end_date TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE (
  event_type TEXT,
  event_name TEXT,
  count BIGINT,
  avg_duration_ms NUMERIC,
  error_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    pe.event_type,
    pe.event_name,
    COUNT(*)::BIGINT as count,
    AVG(pe.duration_ms)::NUMERIC as avg_duration_ms,
    COUNT(*) FILTER (WHERE pe.severity IN ('error', 'critical'))::BIGINT as error_count
  FROM platform_events pe
  WHERE
    (p_event_type IS NULL OR pe.event_type = p_event_type)
    AND (p_start_date IS NULL OR pe.created_at >= p_start_date)
    AND (p_end_date IS NULL OR pe.created_at <= p_end_date)
  GROUP BY pe.event_type, pe.event_name
  ORDER BY count DESC;
END;
$$;

COMMENT ON FUNCTION get_event_stats IS 'Returns event statistics grouped by event type and name for the specified date range.';

