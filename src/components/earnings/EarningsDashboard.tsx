'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { ErrorState } from '@/components/ui/ErrorState'
import { Button } from '@/components/ui/Button'

interface EarningsData {
  earnings: {
    creator_id: string
    total_earnings: number
    pending_earnings: number
    paid_earnings: number
  }
  history: Array<{
    id: string
    story_id: string | null
    earnings_type: string
    amount: number
    status: string
    created_at: string
    metadata: any
  }>
  payouts: Array<{
    id: string
    amount: number
    status: string
    requested_at: string
    processed_at: string | null
    completed_at: string | null
  }>
  stories: Array<{
    id: string
    title: string
    earnings: {
      total: number
      views: { count: number; earnings: number }
      likes: { count: number; earnings: number }
      shares: { count: number; earnings: number }
      comments: { count: number; earnings: number }
    }
  }>
  totalPotentialEarnings: number
}

export function EarningsDashboard() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [data, setData] = useState<EarningsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/signin')
      return
    }

    const fetchEarnings = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch('/api/earnings')
        
        if (!response.ok) {
          throw new Error('Failed to fetch earnings')
        }

        const earningsData = await response.json()
        setData(earningsData)
      } catch (err) {
        console.error('Error fetching earnings:', err)
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchEarnings()
  }, [isAuthenticated, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <ErrorState
          title="Failed to load earnings"
          message={error.message}
          retryLabel="Retry"
          onRetry={() => window.location.reload()}
        />
      </div>
    )
  }

  if (!data) {
    return null
  }

  const { earnings, history, payouts, stories, totalPotentialEarnings } = data

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Creator Earnings
          </h1>
          <p className="text-gray-400">
            Track your earnings from story performance
          </p>
        </div>

        {/* Earnings Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6">
          <Card variant="default" className="bg-gray-800/50 border-gray-700/50">
            <div className="p-4">
              <div className="text-sm text-gray-400 mb-1">Total Earnings</div>
              <div className="text-2xl font-bold text-white">
                ${earnings.total_earnings.toFixed(2)}
              </div>
            </div>
          </Card>

          <Card variant="default" className="bg-gray-800/50 border-gray-700/50">
            <div className="p-4">
              <div className="text-sm text-gray-400 mb-1">Pending</div>
              <div className="text-2xl font-bold text-yellow-400">
                ${earnings.pending_earnings.toFixed(2)}
              </div>
            </div>
          </Card>

          <Card variant="default" className="bg-gray-800/50 border-gray-700/50">
            <div className="p-4">
              <div className="text-sm text-gray-400 mb-1">Paid Out</div>
              <div className="text-2xl font-bold text-green-400">
                ${earnings.paid_earnings.toFixed(2)}
              </div>
            </div>
          </Card>
        </div>

        {/* Potential Earnings from Stories */}
        {stories.length > 0 && (
          <Card variant="default" className="bg-gray-800/50 border-gray-700/50 mb-6">
            <div className="p-6">
              <h2 className="text-xl font-bold text-white mb-4">
                Potential Earnings by Story
              </h2>
              <div className="mb-4 p-4 bg-gray-900/50 rounded-lg">
                <div className="text-sm text-gray-400 mb-1">Total Potential</div>
                <div className="text-2xl font-bold text-brand-cyan">
                  ${totalPotentialEarnings.toFixed(2)}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Based on current story metrics (views, likes, shares, comments)
                </p>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {stories.map((story) => (
                  <div
                    key={story.id}
                    className="p-4 bg-gray-900/50 rounded-lg border border-gray-700/50"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-white font-medium truncate flex-1">
                        {story.title}
                      </h3>
                      <div className="text-lg font-bold text-brand-cyan ml-4">
                        ${story.earnings.total.toFixed(2)}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div>
                        <span className="text-gray-400">Views:</span>{' '}
                        <span className="text-white">{story.earnings.views.count}</span>
                        <span className="text-gray-500 ml-1">
                          (${story.earnings.views.earnings.toFixed(3)})
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Likes:</span>{' '}
                        <span className="text-white">{story.earnings.likes.count}</span>
                        <span className="text-gray-500 ml-1">
                          (${story.earnings.likes.earnings.toFixed(2)})
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Shares:</span>{' '}
                        <span className="text-white">{story.earnings.shares.count}</span>
                        <span className="text-gray-500 ml-1">
                          (${story.earnings.shares.earnings.toFixed(2)})
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Comments:</span>{' '}
                        <span className="text-white">{story.earnings.comments.count}</span>
                        <span className="text-gray-500 ml-1">
                          (${story.earnings.comments.earnings.toFixed(3)})
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Earnings History */}
        {history.length > 0 && (
          <Card variant="default" className="bg-gray-800/50 border-gray-700/50 mb-6">
            <div className="p-6">
              <h2 className="text-xl font-bold text-white mb-4">
                Earnings History (Last 30 Days)
              </h2>
              <div className="space-y-2">
                {history.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg border border-gray-700/50"
                  >
                    <div className="flex-1">
                      <div className="text-sm font-medium text-white capitalize">
                        {entry.earnings_type}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(entry.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-white">
                        ${entry.amount.toFixed(2)}
                      </div>
                      <div
                        className={`text-xs ${
                          entry.status === 'paid'
                            ? 'text-green-400'
                            : entry.status === 'pending'
                            ? 'text-yellow-400'
                            : 'text-gray-400'
                        }`}
                      >
                        {entry.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Payouts */}
        {payouts.length > 0 && (
          <Card variant="default" className="bg-gray-800/50 border-gray-700/50">
            <div className="p-6">
              <h2 className="text-xl font-bold text-white mb-4">Recent Payouts</h2>
              <div className="space-y-2">
                {payouts.map((payout) => (
                  <div
                    key={payout.id}
                    className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg border border-gray-700/50"
                  >
                    <div className="flex-1">
                      <div className="text-sm font-medium text-white">
                        ${payout.amount.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-400">
                        Requested: {new Date(payout.requested_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`text-xs font-medium capitalize ${
                          payout.status === 'completed'
                            ? 'text-green-400'
                            : payout.status === 'processing'
                            ? 'text-yellow-400'
                            : payout.status === 'pending'
                            ? 'text-gray-400'
                            : 'text-red-400'
                        }`}
                      >
                        {payout.status}
                      </div>
                      {payout.completed_at && (
                        <div className="text-xs text-gray-500">
                          {new Date(payout.completed_at).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {history.length === 0 && payouts.length === 0 && (
          <Card variant="default" className="bg-gray-800/50 border-gray-700/50">
            <div className="p-6 text-center">
              <p className="text-gray-400 mb-4">
                No earnings history yet. Start creating stories to earn!
              </p>
              <Button
                variant="primary"
                onClick={() => router.push('/create')}
              >
                Create Your First Story
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}

