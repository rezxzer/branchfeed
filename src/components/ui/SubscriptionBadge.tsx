/**
 * Subscription Badge Component
 * 
 * Displays user's subscription tier badge.
 */

'use client';

import { useSubscription } from '@/hooks/useSubscription';
import { SUBSCRIPTION_TIERS } from '@/lib/stripe';

interface SubscriptionBadgeProps {
  variant?: 'default' | 'compact';
  showLabel?: boolean;
}

export function SubscriptionBadge({ variant = 'default', showLabel = true }: SubscriptionBadgeProps) {
  const { subscription, loading, tier } = useSubscription();

  if (loading || !subscription || !tier) {
    return null;
  }

  const isActive = subscription.status === 'active';
  if (!isActive) {
    return null; // Don't show badge if subscription is not active
  }

  const plan = SUBSCRIPTION_TIERS[tier];
  const tierColors = {
    supporter: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
    pro: 'bg-purple-500/20 text-purple-400 border-purple-500/50',
    vip: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
  };

  if (variant === 'compact') {
    return (
      <span
        className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${tierColors[tier]}`}
        title={plan.name}
      >
        {tier.toUpperCase()}
      </span>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${tierColors[tier]}`}>
      <span className="text-sm font-semibold">{plan.name}</span>
      {showLabel && (
        <span className="text-xs opacity-75">Member</span>
      )}
    </div>
  );
}

