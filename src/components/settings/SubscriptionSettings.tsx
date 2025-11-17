/**
 * Subscription Settings Component
 * 
 * Displays subscription tiers, current subscription status, and checkout flow.
 * Status: Phase 0 (Test Mode Only)
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/toast';
import { SUBSCRIPTION_TIERS, isStripeTestMode } from '@/lib/stripe';
import { PaymentHistory } from './PaymentHistory';
import type { SubscriptionTier, UserSubscription } from '@/types/subscription';

interface SubscriptionSettingsProps {
  userId: string;
}

export function SubscriptionSettings({ userId }: SubscriptionSettingsProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchSubscription();
  }, [userId]);

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/subscriptions/current');
      
      if (!response.ok) {
        throw new Error('Failed to fetch subscription');
      }

      const data = await response.json();
      setSubscription(data.subscription);
    } catch (error) {
      console.error('Error fetching subscription:', error);
      showToast('Failed to load subscription status', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (tier: SubscriptionTier) => {
    try {
      setCheckoutLoading(tier);
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create checkout session');
      }

      const { url } = await response.json();
      
      if (url) {
        // Redirect to Stripe Checkout
        window.location.href = url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error: any) {
      console.error('Error creating checkout:', error);
      showToast(error.message || 'Failed to start checkout process', 'error');
      setCheckoutLoading(null);
    }
  };

  const handleCancel = async () => {
    if (!subscription) return;

    if (!confirm('Are you sure you want to cancel your subscription? You will retain access until the end of your billing period.')) {
      return;
    }

    try {
      const response = await fetch(`/api/subscriptions/${subscription.id}/cancel`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to cancel subscription');
      }

      showToast('Subscription canceled. You will retain access until the end of your billing period.', 'success');
      fetchSubscription(); // Refresh subscription status
    } catch (error) {
      console.error('Error canceling subscription:', error);
      showToast('Failed to cancel subscription', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Spinner size="lg" />
      </div>
    );
  }

  const currentTier = subscription?.tier || null;
  const isActive = subscription?.status === 'active';

  return (
    <div className="space-y-6">
      {/* Test Mode Banner */}
      {isStripeTestMode() && (
        <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <span className="text-yellow-400">⚠️</span>
            <p className="text-sm text-yellow-300">
              <strong>Test Mode:</strong> All payment features are in test mode. No real charges will be made.
            </p>
          </div>
        </div>
      )}

      {/* Current Subscription Status */}
      {subscription && (
        <div className="bg-gray-800/50 rounded-2xl border border-gray-700/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">Current Subscription</h3>
              <p className="text-sm text-gray-300">
                {SUBSCRIPTION_TIERS[subscription.tier].name} - ${SUBSCRIPTION_TIERS[subscription.tier].monthlyPrice}/month
              </p>
            </div>
            <div className="text-right">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                isActive
                  ? 'bg-green-500/20 text-green-400'
                  : subscription.status === 'past_due'
                    ? 'bg-red-500/20 text-red-400'
                    : 'bg-gray-500/20 text-gray-400'
              }`}>
                {subscription.status.toUpperCase()}
              </span>
            </div>
          </div>

          {subscription.current_period_end && (
            <p className="text-sm text-gray-400 mb-4">
              {isActive ? 'Renews' : 'Expires'} on{' '}
              {new Date(subscription.current_period_end).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          )}

          {isActive && (
            <Button
              variant="danger"
              size="sm"
              onClick={handleCancel}
              className="mt-4"
            >
              Cancel Subscription
            </Button>
          )}
        </div>
      )}

      {/* Subscription Tiers */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">
          {subscription ? 'Upgrade or Change Plan' : 'Choose a Plan'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(SUBSCRIPTION_TIERS).map(([tierKey, plan]) => {
            const tier = tierKey as SubscriptionTier;
            const isCurrentTier = currentTier === tier;
            const isHigherTier = currentTier && 
              ['supporter', 'pro', 'vip'].indexOf(tier) > 
              ['supporter', 'pro', 'vip'].indexOf(currentTier);

            return (
              <div
                key={tier}
                className={`bg-gray-800/50 rounded-2xl border p-6 ${
                  isCurrentTier
                    ? 'border-brand-cyan/50 bg-brand-cyan/5'
                    : 'border-gray-700/50'
                }`}
              >
                <div className="mb-4">
                  <h4 className="text-xl font-bold text-white mb-2">{plan.name}</h4>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-white">${plan.monthlyPrice}</span>
                    <span className="text-gray-400">/month</span>
                  </div>
                </div>

                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-300">
                      <span className="text-brand-cyan mt-0.5">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={isCurrentTier ? 'outline' : 'primary'}
                  size="md"
                  fullWidth
                  onClick={() => handleSubscribe(tier)}
                  disabled={isCurrentTier || checkoutLoading !== null}
                  className={isCurrentTier ? 'cursor-not-allowed' : ''}
                >
                  {checkoutLoading === tier ? (
                    <>
                      <Spinner size="sm" className="mr-2" />
                      Processing...
                    </>
                  ) : isCurrentTier ? (
                    'Current Plan'
                  ) : isHigherTier ? (
                    'Upgrade'
                  ) : (
                    'Subscribe'
                  )}
                </Button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payment History */}
      <div className="mt-8">
        <PaymentHistory userId={userId} />
      </div>
    </div>
  );
}

