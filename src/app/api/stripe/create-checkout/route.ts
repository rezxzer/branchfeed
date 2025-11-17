/**
 * Stripe Checkout Session API
 * 
 * Creates a Stripe checkout session for subscription purchase.
 * Status: Phase 0 (Test Mode Only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { stripe, SUBSCRIPTION_TIERS, isStripeTestMode } from '@/lib/stripe';
import type { SubscriptionTier } from '@/types/subscription';

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

    // Parse request body
    const body = await request.json();
    const { tier } = body as { tier: SubscriptionTier };

    if (!tier || !['supporter', 'pro', 'vip'].includes(tier)) {
      return NextResponse.json(
        { error: 'Invalid subscription tier' },
        { status: 400 }
      );
    }

    // Get subscription plan
    const plan = SUBSCRIPTION_TIERS[tier];
    if (!plan.priceId) {
      return NextResponse.json(
        { error: 'Subscription tier not configured. Please set Stripe price IDs in environment variables.' },
        { status: 500 }
      );
    }

    // Get or create Stripe customer
    const { data: profile } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', user.id)
      .single();

    // Check if user already has a Stripe customer ID
    const { data: existingSubscription } = await supabase
      .from('user_subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single();

    let customerId = existingSubscription?.stripe_customer_id;

    if (!customerId) {
      // Create Stripe customer
      const customer = await stripe.customers.create({
        email: profile?.email || user.email || undefined,
        metadata: {
          user_id: user.id,
        },
      });
      customerId = customer.id;

      // Store customer ID in database (if subscription exists, update it; otherwise create new)
      await supabase
        .from('user_subscriptions')
        .upsert({
          user_id: user.id,
          stripe_customer_id: customerId,
          tier,
          status: 'incomplete',
        }, {
          onConflict: 'user_id',
        });
    }

    // Create checkout session
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: plan.priceId,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/settings?subscription=success`,
      cancel_url: `${baseUrl}/settings?subscription=canceled`,
      metadata: {
        user_id: user.id,
        tier,
        test_mode: isStripeTestMode().toString(),
      },
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
      testMode: isStripeTestMode(),
    });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session', details: error.message },
      { status: 500 }
    );
  }
}

