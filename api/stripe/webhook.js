// Vercel serverless function — handles Stripe webhooks
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { buffer } from 'micro'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const supabase = createClient(
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Disable body parsing — Stripe needs the raw body for signature verification
export const config = { api: { bodyParser: false } }

// Map Stripe price IDs to tier names
const TIER_MAP = {
  [process.env.STRIPE_PRICE_PREMIUM]: 'premium',
  [process.env.STRIPE_PRICE_PRO]: 'pro',
}

async function upsertSubscription(subscription) {
  const customerId = subscription.customer
  const priceId = subscription.items.data[0]?.price?.id
  const tier = TIER_MAP[priceId] || 'free'

  // Find user by Stripe customer ID
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single()

  if (!profile) {
    console.error(`No profile found for Stripe customer ${customerId}`)
    return
  }

  const subData = {
    user_id: profile.id,
    stripe_subscription_id: subscription.id,
    stripe_price_id: priceId,
    tier,
    status: subscription.status === 'active' || subscription.status === 'trialing' ? 'active' : subscription.status,
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    cancel_at_period_end: subscription.cancel_at_period_end,
  }

  // Upsert based on stripe_subscription_id
  const { error } = await supabase
    .from('subscriptions')
    .upsert(subData, { onConflict: 'stripe_subscription_id' })

  if (error) console.error('Subscription upsert error:', error)
}

async function deleteSubscription(subscription) {
  const { error } = await supabase
    .from('subscriptions')
    .update({ status: 'canceled', tier: 'free' })
    .eq('stripe_subscription_id', subscription.id)

  if (error) console.error('Subscription delete error:', error)
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const sig = req.headers['stripe-signature']
  const rawBody = await buffer(req)

  let event
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message)
    return res.status(400).json({ error: 'Invalid signature' })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object
      if (session.subscription) {
        const subscription = await stripe.subscriptions.retrieve(session.subscription)
        await upsertSubscription(subscription)
      }
      break
    }
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      await upsertSubscription(event.data.object)
      break
    case 'customer.subscription.deleted':
      await deleteSubscription(event.data.object)
      break
    default:
      // Unhandled event type
      break
  }

  return res.status(200).json({ received: true })
}
