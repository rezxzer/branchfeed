/**
 * Stories API Route
 * 
 * Creates a new story with subscription limit checking.
 * Note: This is a pre-check endpoint. Actual story creation happens client-side.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { checkSubscriptionLimit, getUserMonthlyStories } from '@/lib/subscription-checks';
import { getTierLimits } from '@/lib/stripe';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();

    if (!supabase) {
      return NextResponse.json(
        { error: 'Service unavailable' },
        { status: 503 }
      );
    }

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { nodesCount } = body as { nodesCount?: number };

    // Check subscription limit for story creation
    const limitCheck = await checkSubscriptionLimit(profile.id, 'create_story');
    if (!limitCheck.allowed) {
      return NextResponse.json(
        {
          error: limitCheck.reason || 'Monthly story creation limit reached',
          limitExceeded: true,
          remaining: limitCheck.remaining,
        },
        { status: 403 }
      );
    }

    // Check branch limits if nodesCount is provided
    if (nodesCount !== undefined) {
      const { data: subscription } = await supabase
        .from('user_subscriptions')
        .select('tier, status')
        .eq('user_id', profile.id)
        .eq('status', 'active')
        .single();

      const tier = subscription?.tier || null;
      const limits = getTierLimits(tier);
      
      if (limits.maxBranchesPerStory !== -1 && nodesCount > limits.maxBranchesPerStory) {
        return NextResponse.json(
          {
            error: `Maximum ${limits.maxBranchesPerStory} branches per story allowed for your subscription tier`,
            limitExceeded: true,
            maxBranches: limits.maxBranchesPerStory,
          },
          { status: 403 }
        );
      }
    }

    // Get current monthly story count for response
    const monthlyStories = await getUserMonthlyStories(profile.id);
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('tier, status')
      .eq('user_id', profile.id)
      .eq('status', 'active')
      .single();

    const tier = subscription?.tier || null;
    const limits = getTierLimits(tier);

    return NextResponse.json({
      allowed: true,
      monthlyStories,
      monthlyLimit: limits.monthlyStories === -1 ? 'Unlimited' : limits.monthlyStories,
      maxBranchesPerStory: limits.maxBranchesPerStory === -1 ? 'Unlimited' : limits.maxBranchesPerStory,
    });
  } catch (error: any) {
    console.error('Error in stories API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

