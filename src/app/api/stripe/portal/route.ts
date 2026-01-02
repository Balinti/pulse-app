import { NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth/requireUser'
import { getSubscription } from '@/lib/db/queries'
import { createPortalSession } from '@/lib/stripe/billing'

export async function POST() {
  const { user, error: authError } = await requireUser()
  if (authError) return authError

  const subscription = await getSubscription(user.id)

  if (!subscription || !subscription.stripe_customer_id) {
    return NextResponse.json({ error: 'No subscription found' }, { status: 404 })
  }

  try {
    const session = await createPortalSession(subscription.stripe_customer_id)
    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Portal error:', error)
    return NextResponse.json(
      { error: 'Failed to create portal session' },
      { status: 500 }
    )
  }
}
