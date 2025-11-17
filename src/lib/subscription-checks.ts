/**
 * Subscription Limits Checking (Server-Side)
 * 
 * Server-side functions for checking subscription tier limits.
 * Used in API routes to enforce limits.
 */

import { createServerSupabaseClient } from './supabase/server';
import { getTierLimits, type SubscriptionTier } from './stripe';
import { canPerformAction } from './subscription-limits';

/**
 * Get user's subscription tier
 */
export async function getUserSubscriptionTier(userId: string): Promise<SubscriptionTier | null> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return null;

  const { data: subscription } = await supabase
    .from('user_subscriptions')
    .select('tier, status')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single();

  return subscription?.tier || null;
}

/**
 * Get user's daily usage counts
 */
export async function getUserDailyUsage(userId: string): Promise<{
  dailyViews: number;
  dailyLikes: number;
  dailyComments: number;
}> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return { dailyViews: 0, dailyLikes: 0, dailyComments: 0 };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayISO = today.toISOString();

  // Get daily views (from user_story_progress)
  const { count: viewsCount } = await supabase
    .from('user_story_progress')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('last_viewed_at', todayISO);

  // Get daily likes (from story_likes)
  const { count: likesCount } = await supabase
    .from('story_likes')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', todayISO);

  // Get daily comments (from comments)
  const { count: commentsCount } = await supabase
    .from('comments')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', todayISO);

  return {
    dailyViews: viewsCount || 0,
    dailyLikes: likesCount || 0,
    dailyComments: commentsCount || 0,
  };
}

/**
 * Get user's monthly story count
 */
export async function getUserMonthlyStories(userId: string): Promise<number> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return 0;

  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const firstDayISO = firstDayOfMonth.toISOString();

  const { count } = await supabase
    .from('stories')
    .select('*', { count: 'exact', head: true })
    .eq('author_id', userId)
    .eq('is_root', true)
    .gte('created_at', firstDayISO);

  return count || 0;
}

/**
 * Check if user can perform an action based on subscription limits
 */
export async function checkSubscriptionLimit(
  userId: string,
  action: 'view' | 'like' | 'comment' | 'create_story' | 'add_branch',
  additionalData?: {
    currentBranches?: number;
  }
): Promise<{ allowed: boolean; reason?: string; remaining?: number }> {
  const tier = await getUserSubscriptionTier(userId);
  const usage = await getUserDailyUsage(userId);
  const monthlyStories = await getUserMonthlyStories(userId);

  return canPerformAction(tier, action, {
    ...usage,
    monthlyStories,
    ...additionalData,
  });
}

