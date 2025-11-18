/**
 * Creator Earnings - Server-Side Functions
 * 
 * This module provides server-side functions for recording creator earnings
 * based on story performance events (views, likes, shares, comments).
 */

import { createAdminSupabaseClient } from './supabase/admin'
import { EARNINGS_RATES, type EarningsType } from './earnings'

/**
 * Record earnings for a creator based on a story performance event
 * @param creatorId - Creator's user ID
 * @param storyId - Story ID that generated the earnings
 * @param earningsType - Type of earnings (view, like, share, comment)
 * @param metadata - Additional metadata (story title, etc.)
 * @returns Promise<boolean> - True if earnings were recorded successfully
 */
export async function recordEarnings(
  creatorId: string,
  storyId: string,
  earningsType: EarningsType,
  metadata?: Record<string, any>
): Promise<boolean> {
  try {
    const adminSupabase = createAdminSupabaseClient()
    
    if (!adminSupabase) {
      console.warn('Admin Supabase client not available. Earnings recording skipped.')
      return false
    }

    // Get earnings rate for this type
    const earningsRate = EARNINGS_RATES[earningsType]
    
    if (earningsRate <= 0) {
      // No earnings for this type (e.g., bonus with 0 rate)
      return true
    }

    // Calculate earnings amount (single event = 1 * rate)
    const amount = Math.round(earningsRate * 100) / 100

    // Record earnings in earnings_history
    const { error: historyError } = await adminSupabase
      .from('earnings_history')
      .insert({
        creator_id: creatorId,
        story_id: storyId,
        earnings_type: earningsType,
        amount,
        status: 'pending',
        metadata: metadata || null,
      } as never)

    if (historyError) {
      console.error(`Error recording earnings for ${earningsType}:`, historyError)
      return false
    }

    // The trigger will automatically update creator_earnings table
    return true
  } catch (error) {
    console.error(`Error in recordEarnings for ${earningsType}:`, error)
    return false
  }
}

/**
 * Record earnings for multiple events (batch operation)
 * @param earnings - Array of earnings records
 * @returns Promise<number> - Number of earnings successfully recorded
 */
export async function recordEarningsBatch(
  earnings: Array<{
    creatorId: string
    storyId: string
    earningsType: EarningsType
    metadata?: Record<string, any>
  }>
): Promise<number> {
  try {
    const adminSupabase = createAdminSupabaseClient()
    
    if (!adminSupabase) {
      console.warn('Admin Supabase client not available. Earnings recording skipped.')
      return 0
    }

    // Prepare earnings records
    const earningsRecords = earnings.map((earning) => {
      const earningsRate = EARNINGS_RATES[earning.earningsType]
      const amount = earningsRate > 0 ? Math.round(earningsRate * 100) / 100 : 0

      return {
        creator_id: earning.creatorId,
        story_id: earning.storyId,
        earnings_type: earning.earningsType,
        amount,
        status: 'pending' as const,
        metadata: earning.metadata || null,
      }
    }).filter((record) => record.amount > 0) // Filter out zero-amount earnings

    if (earningsRecords.length === 0) {
      return 0
    }

    // Insert all earnings records
    const { error, count } = await adminSupabase
      .from('earnings_history')
      .insert(earningsRecords as never)
      .select()

    if (error) {
      console.error('Error recording earnings batch:', error)
      return 0
    }

    return count || earningsRecords.length
  } catch (error) {
    console.error('Error in recordEarningsBatch:', error)
    return 0
  }
}

/**
 * Get story author ID for earnings recording
 * @param storyId - Story ID
 * @returns Promise<string | null> - Creator's user ID or null if not found
 */
export async function getStoryAuthorId(storyId: string): Promise<string | null> {
  try {
    const adminSupabase = createAdminSupabaseClient()
    
    if (!adminSupabase) {
      return null
    }

    const { data, error } = await adminSupabase
      .from('stories')
      .select('author_id')
      .eq('id', storyId)
      .single()

    if (error || !data) {
      console.error('Error fetching story author:', error)
      return null
    }

    return (data as { author_id: string }).author_id
  } catch (error) {
    console.error('Error in getStoryAuthorId:', error)
    return null
  }
}

