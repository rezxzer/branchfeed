import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { calculateEarningsBreakdown } from '@/lib/earnings'

export const fetchCache = 'force-no-store'
export const dynamic = 'force-dynamic'

/**
 * GET /api/earnings
 * 
 * Get creator earnings summary and history
 * Requires authentication
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    
    if (!supabase) {
      return NextResponse.json(
        { error: 'Service unavailable' },
        { status: 503 }
      )
    }

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get creator earnings summary
    const { data: earnings, error: earningsError } = await supabase
      .from('creator_earnings')
      .select('*')
      .eq('creator_id', user.id)
      .single()

    if (earningsError && earningsError.code !== 'PGRST116') {
      // PGRST116 is "not found" which is expected if no earnings yet
      console.error('Error fetching earnings:', earningsError)
      return NextResponse.json(
        { error: 'Failed to fetch earnings' },
        { status: 500 }
      )
    }

    // Get earnings history (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: history, error: historyError } = await supabase
      .from('earnings_history')
      .select('*')
      .eq('creator_id', user.id)
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(100)

    if (historyError) {
      console.error('Error fetching earnings history:', historyError)
    }

    // Get recent payouts
    const { data: payouts, error: payoutsError } = await supabase
      .from('creator_payouts')
      .select('*')
      .eq('creator_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)

    if (payoutsError) {
      console.error('Error fetching payouts:', payoutsError)
    }

    // Calculate earnings from stories (for display)
    const { data: stories, error: storiesError } = await supabase
      .from('stories')
      .select('id, title, views_count, likes_count, shares_count, comments_count, created_at')
      .eq('author_id', user.id)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(50)

    if (storiesError) {
      console.error('Error fetching stories:', storiesError)
    }

    // Calculate potential earnings from stories
    const storiesWithEarnings = (stories || []).map((story: any) => {
      const breakdown = calculateEarningsBreakdown(
        story.views_count || 0,
        story.likes_count || 0,
        story.shares_count || 0,
        story.comments_count || 0
      )
      return {
        ...story,
        earnings: breakdown,
      }
    })

    const totalPotentialEarnings = storiesWithEarnings.reduce(
      (sum: number, story: any) => sum + (story.earnings.total || 0),
      0
    )

    return NextResponse.json({
      earnings: earnings || {
        creator_id: user.id,
        total_earnings: 0,
        pending_earnings: 0,
        paid_earnings: 0,
      },
      history: history || [],
      payouts: payouts || [],
      stories: storiesWithEarnings,
      totalPotentialEarnings: Math.round(totalPotentialEarnings * 100) / 100,
    })
  } catch (error: any) {
    console.error('Error in GET /api/earnings:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

