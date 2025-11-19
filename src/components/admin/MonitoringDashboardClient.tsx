/**
 * Monitoring Dashboard Client Component
 * 
 * Displays real-time monitoring data: events, errors, performance metrics.
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { AdminHeader } from './AdminHeader'
import { AdminSidebar } from './AdminSidebar'
import { Spinner } from '@/components/ui/Spinner'
import { Select } from '@/components/ui/Select'
import { logError } from '@/lib/logger'

interface MonitoringData {
  period: string
  startDate: string
  endDate: string
  summary: {
    totalEvents: number
    errorCount: number
    errorRate: number
    eventCountsByType: Record<string, number>
  }
  eventStats: Array<{
    event_type: string
    event_name: string
    count: number
    avg_duration_ms: number
    error_count: number
  }>
  errorEvents: Array<{
    id: string
    event_name: string
    severity: string
    error_message: string
    created_at: string
    metadata: Record<string, any>
  }>
  performanceMetrics: Record<string, { count: number; avgDuration: number }>
  recentEvents: Array<{
    id: string
    event_type: string
    event_name: string
    severity: string
    created_at: string
    metadata: Record<string, any>
  }>
}

export function MonitoringDashboardClient() {
  const { t } = useTranslation()
  const [data, setData] = useState<MonitoringData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [period, setPeriod] = useState('24h')
  const [autoRefresh, setAutoRefresh] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/admin/monitoring?period=${period}`)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Failed to fetch monitoring data (${response.status})`)
      }

      const result = await response.json()
      
      // If result has error field, handle it
      if (result.error) {
        throw new Error(result.error)
      }
      
      setData(result)
    } catch (err) {
      logError('Error fetching monitoring data', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch monitoring data')
    } finally {
      setLoading(false)
    }
  }, [period])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      fetchData()
    }, 30000)

    return () => clearInterval(interval)
  }, [autoRefresh, fetchData])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500/20 text-red-400 border-red-500/50'
      case 'error':
        return 'bg-red-500/10 text-red-300 border-red-500/30'
      case 'warning':
        return 'bg-yellow-500/10 text-yellow-300 border-yellow-500/30'
      default:
        return 'bg-blue-500/10 text-blue-300 border-blue-500/30'
    }
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <AdminHeader />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  {t('admin.monitoring.title') || 'Real-time Monitoring'}
                </h1>
                <p className="text-gray-400">
                  {t('admin.monitoring.description') || 'Monitor platform events, errors, and performance metrics in real-time.'}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                >
                  <option value="1h">{t('admin.monitoring.period.1h') || 'Last Hour'}</option>
                  <option value="24h">{t('admin.monitoring.period.24h') || 'Last 24 Hours'}</option>
                  <option value="7d">{t('admin.monitoring.period.7d') || 'Last 7 Days'}</option>
                  <option value="30d">{t('admin.monitoring.period.30d') || 'Last 30 Days'}</option>
                </Select>
                <label className="flex items-center gap-2 text-gray-300">
                  <input
                    type="checkbox"
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-brand-cyan focus:ring-brand-cyan"
                  />
                  <span className="text-sm">{t('admin.monitoring.autoRefresh') || 'Auto-refresh'}</span>
                </label>
              </div>
            </div>
          </div>

          {loading && !data && (
            <div className="flex justify-center items-center py-12">
              <Spinner size="lg" />
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 mb-6">
              <p className="text-red-400 font-semibold mb-2">{error}</p>
              {error.includes('Failed to fetch') && (
                <p className="text-sm text-gray-400">
                  {t('admin.monitoring.migrationHint') || 'Note: Make sure the database migration has been run. Run the migration file: supabase/migrations/20250115_34_add_event_tracking.sql'}
                </p>
              )}
            </div>
          )}

          {data && (
            <>
              {/* Empty State - No events yet */}
              {data.summary.totalEvents === 0 && !loading && (
                <div className="bg-gray-800/80 backdrop-blur-lg rounded-2xl border border-gray-600/50 shadow-level-1 p-12 text-center mb-6">
                  <p className="text-gray-300 mb-2">
                    {t('admin.monitoring.noEvents') || 'No events recorded yet'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {t('admin.monitoring.noEventsHint') || 'Events will appear here once they are recorded. Make sure event tracking is enabled in your application.'}
                  </p>
                </div>
              )}

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="bg-gray-800/80 backdrop-blur-lg rounded-2xl border border-gray-600/50 shadow-level-1 p-6">
                  <p className="text-sm text-gray-300 mb-1">{t('admin.monitoring.totalEvents') || 'Total Events'}</p>
                  <p className="text-3xl font-bold text-white">{data.summary.totalEvents.toLocaleString()}</p>
                </div>
                <div className="bg-gray-800/80 backdrop-blur-lg rounded-2xl border border-gray-600/50 shadow-level-1 p-6">
                  <p className="text-sm text-gray-300 mb-1">{t('admin.monitoring.errors') || 'Errors'}</p>
                  <p className="text-3xl font-bold text-red-400">{data.summary.errorCount.toLocaleString()}</p>
                </div>
                <div className="bg-gray-800/80 backdrop-blur-lg rounded-2xl border border-gray-600/50 shadow-level-1 p-6">
                  <p className="text-sm text-gray-300 mb-1">{t('admin.monitoring.errorRate') || 'Error Rate'}</p>
                  <p className="text-3xl font-bold text-white">{data.summary.errorRate.toFixed(2)}%</p>
                </div>
                <div className="bg-gray-800/80 backdrop-blur-lg rounded-2xl border border-gray-600/50 shadow-level-1 p-6">
                  <p className="text-sm text-gray-300 mb-1">{t('admin.monitoring.eventTypes') || 'Event Types'}</p>
                  <p className="text-3xl font-bold text-white">{Object.keys(data.summary.eventCountsByType).length}</p>
                </div>
              </div>

              {/* Event Counts by Type */}
              <div className="bg-gray-800/80 backdrop-blur-lg rounded-2xl border border-gray-600/50 shadow-level-1 p-6 mb-6">
                <h2 className="text-xl font-semibold text-white mb-4">
                  {t('admin.monitoring.eventCountsByType') || 'Event Counts by Type'}
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                  {Object.entries(data.summary.eventCountsByType).map(([type, count]) => (
                    <div key={type} className="text-center">
                      <p className="text-sm text-gray-400 mb-1">{type}</p>
                      <p className="text-2xl font-bold text-white">{count.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Error Events */}
              {data.errorEvents.length > 0 && (
                <div className="bg-gray-800/80 backdrop-blur-lg rounded-2xl border border-gray-600/50 shadow-level-1 p-6 mb-6">
                  <h2 className="text-xl font-semibold text-white mb-4">
                    {t('admin.monitoring.recentErrors') || 'Recent Errors'}
                  </h2>
                  <div className="space-y-3">
                    {data.errorEvents.slice(0, 10).map((event) => (
                      <div
                        key={event.id}
                        className={`p-4 rounded-lg border ${getSeverityColor(event.severity)}`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-semibold text-white">{event.event_name}</p>
                            <p className="text-sm text-gray-400 mt-1">
                              {new Date(event.created_at).toLocaleString()}
                            </p>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(event.severity)}`}>
                            {event.severity}
                          </span>
                        </div>
                        {event.error_message && (
                          <p className="text-sm text-gray-300 mt-2">{event.error_message}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Performance Metrics */}
              {Object.keys(data.performanceMetrics).length > 0 && (
                <div className="bg-gray-800/80 backdrop-blur-lg rounded-2xl border border-gray-600/50 shadow-level-1 p-6 mb-6">
                  <h2 className="text-xl font-semibold text-white mb-4">
                    {t('admin.monitoring.performanceMetrics') || 'Performance Metrics'}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(data.performanceMetrics).map(([type, metrics]) => (
                      <div key={type} className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
                        <p className="text-sm text-gray-400 mb-2">{type}</p>
                        <p className="text-lg font-semibold text-white">
                          {metrics.avgDuration}ms
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {metrics.count} {t('admin.monitoring.samples') || 'samples'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Events */}
              <div className="bg-gray-800/80 backdrop-blur-lg rounded-2xl border border-gray-600/50 shadow-level-1 p-6">
                <h2 className="text-xl font-semibold text-white mb-4">
                  {t('admin.monitoring.recentEvents') || 'Recent Events'}
                </h2>
                <div className="space-y-2">
                  {data.recentEvents.slice(0, 20).map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg border border-gray-700/50"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(event.severity)}`}>
                          {event.event_type}
                        </span>
                        <span className="text-sm text-gray-300">{event.event_name}</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(event.created_at).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}

