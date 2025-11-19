/**
 * Event Tracking Utility
 * 
 * Helper functions for recording platform events (page views, feature usage, errors, performance metrics).
 */

export type EventType = 'page_view' | 'feature_used' | 'error' | 'performance' | 'user_action' | 'api_call' | 'database_query'
export type EventSeverity = 'info' | 'warning' | 'error' | 'critical'

export interface EventData {
  event_type: EventType
  event_name: string
  user_id?: string | null
  session_id?: string
  metadata?: Record<string, any>
  severity?: EventSeverity
  duration_ms?: number
  status_code?: number
  error_message?: string
  error_stack?: string
}

/**
 * Record a platform event
 * 
 * This function silently fails if event recording fails (to not break user experience).
 */
export async function recordEvent(data: EventData): Promise<void> {
  try {
    // Get session ID from sessionStorage (if available)
    let sessionId: string | undefined
    if (typeof window !== 'undefined') {
      sessionId = sessionStorage.getItem('session_id') || undefined
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        sessionStorage.setItem('session_id', sessionId)
      }
    }

    const response = await fetch('/api/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...data,
        session_id: sessionId || data.session_id,
      }),
    })

    if (!response.ok) {
      // Silently fail - don't break user experience
      console.debug('Failed to record event:', data.event_name)
    }
  } catch (error) {
    // Silently fail - don't break user experience
    console.debug('Error recording event:', error)
  }
}

/**
 * Record a page view event
 */
export async function recordPageView(page: string, metadata?: Record<string, any>): Promise<void> {
  await recordEvent({
    event_type: 'page_view',
    event_name: `page_viewed_${page}`,
    metadata: {
      page,
      ...metadata,
    },
    severity: 'info',
  })
}

/**
 * Record a feature usage event
 */
export async function recordFeatureUsed(feature: string, metadata?: Record<string, any>): Promise<void> {
  await recordEvent({
    event_type: 'feature_used',
    event_name: `feature_used_${feature}`,
    metadata: {
      feature,
      ...metadata,
    },
    severity: 'info',
  })
}

/**
 * Record an error event
 */
export async function recordError(
  errorName: string,
  errorMessage: string,
  errorStack?: string,
  severity: EventSeverity = 'error',
  metadata?: Record<string, any>
): Promise<void> {
  await recordEvent({
    event_type: 'error',
    event_name: `error_${errorName}`,
    error_message: errorMessage,
    error_stack: errorStack,
    severity,
    metadata: {
      error_name: errorName,
      ...metadata,
    },
  })
}

/**
 * Record a performance event
 */
export async function recordPerformance(
  operation: string,
  durationMs: number,
  metadata?: Record<string, any>
): Promise<void> {
  await recordEvent({
    event_type: 'performance',
    event_name: `performance_${operation}`,
    duration_ms: durationMs,
    metadata: {
      operation,
      ...metadata,
    },
    severity: 'info',
  })
}

/**
 * Record a user action event
 */
export async function recordUserAction(action: string, metadata?: Record<string, any>): Promise<void> {
  await recordEvent({
    event_type: 'user_action',
    event_name: `user_action_${action}`,
    metadata: {
      action,
      ...metadata,
    },
    severity: 'info',
  })
}

/**
 * Record an API call event
 */
export async function recordApiCall(
  endpoint: string,
  method: string,
  statusCode: number,
  durationMs?: number,
  metadata?: Record<string, any>
): Promise<void> {
  await recordEvent({
    event_type: 'api_call',
    event_name: `api_call_${method}_${endpoint}`,
    status_code: statusCode,
    duration_ms: durationMs,
    severity: statusCode >= 400 ? 'error' : 'info',
    metadata: {
      endpoint,
      method,
      ...metadata,
    },
  })
}

