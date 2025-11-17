/**
 * Subscription Limits Helper
 * 
 * Helper functions for checking and enforcing subscription tier limits.
 */

import { getTierLimits, type SubscriptionTier } from './stripe';

export interface TierLimits {
  dailyViews: number;
  dailyLikes: number;
  dailyComments: number;
  monthlyStories: number;
  maxBranchesPerStory: number;
}

/**
 * Check if a value is within limits
 * -1 means unlimited
 */
export function isWithinLimit(value: number, limit: number): boolean {
  if (limit === -1) return true; // Unlimited
  return value < limit;
}

/**
 * Get remaining limit
 * Returns -1 if unlimited, otherwise returns remaining count
 */
export function getRemainingLimit(used: number, limit: number): number {
  if (limit === -1) return -1; // Unlimited
  return Math.max(0, limit - used);
}

/**
 * Check if user can perform an action based on tier limits
 */
export function canPerformAction(
  tier: SubscriptionTier | null,
  action: 'view' | 'like' | 'comment' | 'create_story' | 'add_branch',
  usage: {
    dailyViews?: number;
    dailyLikes?: number;
    dailyComments?: number;
    monthlyStories?: number;
    currentBranches?: number;
  }
): { allowed: boolean; reason?: string; remaining?: number } {
  const limits = getTierLimits(tier);

  switch (action) {
    case 'view':
      if (usage.dailyViews === undefined) {
        return { allowed: true };
      }
      const viewsRemaining = getRemainingLimit(usage.dailyViews, limits.dailyViews);
      return {
        allowed: isWithinLimit(usage.dailyViews, limits.dailyViews),
        reason: viewsRemaining === -1 ? undefined : `Daily view limit: ${limits.dailyViews}`,
        remaining: viewsRemaining,
      };

    case 'like':
      if (usage.dailyLikes === undefined) {
        return { allowed: true };
      }
      const likesRemaining = getRemainingLimit(usage.dailyLikes, limits.dailyLikes);
      return {
        allowed: isWithinLimit(usage.dailyLikes, limits.dailyLikes),
        reason: likesRemaining === -1 ? undefined : `Daily like limit: ${limits.dailyLikes}`,
        remaining: likesRemaining,
      };

    case 'comment':
      if (usage.dailyComments === undefined) {
        return { allowed: true };
      }
      const commentsRemaining = getRemainingLimit(usage.dailyComments, limits.dailyComments);
      return {
        allowed: isWithinLimit(usage.dailyComments, limits.dailyComments),
        reason: commentsRemaining === -1 ? undefined : `Daily comment limit: ${limits.dailyComments}`,
        remaining: commentsRemaining,
      };

    case 'create_story':
      if (usage.monthlyStories === undefined) {
        return { allowed: true };
      }
      const storiesRemaining = getRemainingLimit(usage.monthlyStories, limits.monthlyStories);
      return {
        allowed: isWithinLimit(usage.monthlyStories, limits.monthlyStories),
        reason: storiesRemaining === -1 ? undefined : `Monthly story limit: ${limits.monthlyStories}`,
        remaining: storiesRemaining,
      };

    case 'add_branch':
      if (usage.currentBranches === undefined) {
        return { allowed: true };
      }
      const branchesRemaining = getRemainingLimit(usage.currentBranches, limits.maxBranchesPerStory);
      return {
        allowed: isWithinLimit(usage.currentBranches, limits.maxBranchesPerStory),
        reason: branchesRemaining === -1 ? undefined : `Max branches per story: ${limits.maxBranchesPerStory}`,
        remaining: branchesRemaining,
      };

    default:
      return { allowed: true };
  }
}

/**
 * Format limit display text
 */
export function formatLimit(limit: number): string {
  if (limit === -1) return 'Unlimited';
  return limit.toString();
}

