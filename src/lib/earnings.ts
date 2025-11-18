/**
 * Creator Earnings Calculation
 * 
 * This module provides functions for calculating creator earnings
 * based on story performance metrics.
 */

// Earnings rates (in USD per action)
// These are configurable and can be adjusted based on platform revenue
export const EARNINGS_RATES = {
  view: 0.001, // $0.001 per view
  like: 0.01, // $0.01 per like
  share: 0.02, // $0.02 per share
  comment: 0.005, // $0.005 per comment
  subscription: 0.1, // $0.10 per subscription (if user subscribes after viewing story)
  bonus: 0.0, // Bonus earnings (manual adjustments)
} as const

export type EarningsType = keyof typeof EARNINGS_RATES

/**
 * Calculate earnings for a story based on its metrics
 * @param views - Number of views
 * @param likes - Number of likes
 * @param shares - Number of shares
 * @param comments - Number of comments
 * @returns Total earnings amount
 */
export function calculateStoryEarnings(
  views: number,
  likes: number,
  shares: number,
  comments: number
): number {
  const viewEarnings = views * EARNINGS_RATES.view
  const likeEarnings = likes * EARNINGS_RATES.like
  const shareEarnings = shares * EARNINGS_RATES.share
  const commentEarnings = comments * EARNINGS_RATES.comment

  return Math.round((viewEarnings + likeEarnings + shareEarnings + commentEarnings) * 100) / 100
}

/**
 * Calculate earnings breakdown for a story
 * @param views - Number of views
 * @param likes - Number of likes
 * @param shares - Number of shares
 * @param comments - Number of comments
 * @returns Earnings breakdown by type
 */
export function calculateEarningsBreakdown(
  views: number,
  likes: number,
  shares: number,
  comments: number
) {
  return {
    views: {
      count: views,
      rate: EARNINGS_RATES.view,
      earnings: Math.round(views * EARNINGS_RATES.view * 100) / 100,
    },
    likes: {
      count: likes,
      rate: EARNINGS_RATES.like,
      earnings: Math.round(likes * EARNINGS_RATES.like * 100) / 100,
    },
    shares: {
      count: shares,
      rate: EARNINGS_RATES.share,
      earnings: Math.round(shares * EARNINGS_RATES.share * 100) / 100,
    },
    comments: {
      count: comments,
      rate: EARNINGS_RATES.comment,
      earnings: Math.round(comments * EARNINGS_RATES.comment * 100) / 100,
    },
    total: calculateStoryEarnings(views, likes, shares, comments),
  }
}

