/**
 * Stripe Webhook Handler
 * 
 * Handles Stripe webhook events for subscription updates.
 * Status: Phase 0 (Test Mode Only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { stripe, isStripeTestMode } from '@/lib/stripe';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    // Get webhook secret (test or live)
    const webhookSecret = isStripeTestMode()
      ? process.env.STRIPE_WEBHOOK_SECRET_TEST
      : process.env.STRIPE_WEBHOOK_SECRET_LIVE;

    if (!webhookSecret) {
      console.error('Stripe webhook secret not configured');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Get Supabase client
    const supabase = await createServerSupabaseClient();
    if (!supabase) {
      console.error('Supabase client unavailable');
      return NextResponse.json(
        { error: 'Service unavailable' },
        { status: 503 }
      );
    }

    // Handle different event types
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(supabase, subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCanceled(supabase, subscription);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentSucceeded(supabase, invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(supabase, invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed', details: error.message },
      { status: 500 }
    );
  }
}

// Helper functions for webhook event handling
async function handleSubscriptionUpdate(supabase: any, subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const subscriptionId = subscription.id;
  const status = subscription.status;
  const tier = subscription.metadata?.tier || 'supporter'; // Default to supporter if not set

  // Map Stripe status to our status
  const statusMap: Record<string, string> = {
    active: 'active',
    canceled: 'canceled',
    past_due: 'past_due',
    trialing: 'trialing',
    incomplete: 'incomplete',
    incomplete_expired: 'incomplete_expired',
  };

  const mappedStatus = statusMap[status] || 'incomplete';

  // Find user by customer ID
  const { data: subscriptionData } = await supabase
    .from('user_subscriptions')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (!subscriptionData) {
    console.error('User not found for customer:', customerId);
    return;
  }

  // Update subscription
  const sub = subscription as any; // Type assertion for Stripe subscription properties
  await supabase
    .from('user_subscriptions')
    .update({
      stripe_subscription_id: subscriptionId,
      tier: tier as any,
      status: mappedStatus,
      current_period_start: sub.current_period_start ? new Date(sub.current_period_start * 1000).toISOString() : null,
      current_period_end: sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null,
      cancel_at_period_end: sub.cancel_at_period_end || false,
      canceled_at: sub.canceled_at ? new Date(sub.canceled_at * 1000).toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', subscriptionData.user_id);
}

async function handleSubscriptionCanceled(supabase: any, subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  const { data: subscriptionData } = await supabase
    .from('user_subscriptions')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (!subscriptionData) {
    return;
  }

  await supabase
    .from('user_subscriptions')
    .update({
      status: 'canceled',
      canceled_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', subscriptionData.user_id);
}

async function handlePaymentSucceeded(supabase: any, invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;
  const amount = invoice.amount_paid;
  const currency = invoice.currency;

  const { data: subscriptionData } = await supabase
    .from('user_subscriptions')
    .select('user_id, id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (!subscriptionData) {
    return;
  }

  // Record payment in payment_history
  const inv = invoice as any; // Type assertion for Stripe invoice properties
  const paymentIntentId = typeof inv.payment_intent === 'string' 
    ? inv.payment_intent 
    : inv.payment_intent?.id || null;
  const subscriptionId = typeof inv.subscription === 'string'
    ? inv.subscription
    : inv.subscription?.id || null;

  await supabase
    .from('payment_history')
    .insert({
      user_id: subscriptionData.user_id,
      subscription_id: subscriptionData.id,
      stripe_payment_intent_id: paymentIntentId,
      stripe_invoice_id: invoice.id,
      amount: amount,
      currency: currency,
      status: 'succeeded',
      payment_type: 'subscription',
      metadata: {
        invoice_id: invoice.id,
        subscription_id: subscriptionId,
      },
    });
}

async function handlePaymentFailed(supabase: any, invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  const { data: subscriptionData } = await supabase
    .from('user_subscriptions')
    .select('user_id, id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (!subscriptionData) {
    return;
  }

  // Update subscription status to past_due
  await supabase
    .from('user_subscriptions')
    .update({
      status: 'past_due',
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', subscriptionData.user_id);

  // Record failed payment
  const failureReason = (invoice as any).last_payment_error?.message || 'Unknown';

  await supabase
    .from('payment_history')
    .insert({
      user_id: subscriptionData.user_id,
      subscription_id: subscriptionData.id,
      stripe_invoice_id: invoice.id,
      amount: invoice.amount_due,
      currency: invoice.currency,
      status: 'failed',
      payment_type: 'subscription',
      metadata: {
        invoice_id: invoice.id,
        failure_reason: failureReason,
      },
    });
}

