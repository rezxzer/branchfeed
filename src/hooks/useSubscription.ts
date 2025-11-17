/**
 * useSubscription Hook
 * 
 * Hook for managing user subscription state and actions.
 */

import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import type { UserSubscription } from '@/types/subscription';

interface UseSubscriptionReturn {
  subscription: UserSubscription | null;
  loading: boolean;
  error: Error | null;
  isActive: boolean;
  tier: 'supporter' | 'pro' | 'vip' | null;
  refresh: () => Promise<void>;
}

export function useSubscription(): UseSubscriptionReturn {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSubscription = async () => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/subscriptions/current');
      
      if (!response.ok) {
        throw new Error('Failed to fetch subscription');
      }

      const data = await response.json();
      setSubscription(data.subscription);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, [user?.id]);

  const isActive = subscription?.status === 'active';
  const tier = subscription?.tier || null;

  return {
    subscription,
    loading,
    error,
    isActive,
    tier,
    refresh: fetchSubscription,
  };
}

