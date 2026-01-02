import { stripe } from './stripe'
import { createServiceClient } from '@/lib/supabase/server'

export async function createCheckoutSession(
  userId: string,
  userEmail: string,
  priceId: string,
  trialDays: number = 7
) {
  // Get or create Stripe customer
  const supabase = createServiceClient()

  let { data: subscription } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', userId)
    .single()

  let customerId: string

  if (subscription?.stripe_customer_id) {
    customerId = subscription.stripe_customer_id
  } else {
    const customer = await stripe.customers.create({
      email: userEmail,
      metadata: {
        user_id: userId,
      },
    })
    customerId = customer.id

    // Create subscription record
    await supabase.from('subscriptions').insert({
      user_id: userId,
      stripe_customer_id: customerId,
      plan: 'free',
      status: 'incomplete',
    })
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    client_reference_id: userId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    subscription_data: {
      trial_period_days: trialDays,
      metadata: {
        user_id: userId,
      },
    },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?canceled=true`,
  })

  return session
}

export async function createPortalSession(customerId: string) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing`,
  })

  return session
}
