import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth/requireUser'
import { createCheckoutSession } from '@/lib/stripe/billing'
import { z } from 'zod'

const checkoutSchema = z.object({
  plan: z.enum(['plus']),
  interval: z.enum(['weekly', 'monthly']).optional(),
})

export async function POST(request: NextRequest) {
  const { user, error: authError } = await requireUser()
  if (authError) return authError

  try {
    const body = await request.json()
    const validated = checkoutSchema.parse(body)

    const priceId =
      validated.interval === 'monthly'
        ? process.env.STRIPE_PLUS_MONTHLY_PRICE_ID!
        : process.env.STRIPE_PLUS_WEEKLY_PRICE_ID!

    const session = await createCheckoutSession(
      user.id,
      user.email!,
      priceId,
      7 // 7-day trial
    )

    return NextResponse.json({ url: session.url })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Checkout error:', error)
    return NextResponse.json({ error: 'Failed to create checkout' }, { status: 500 })
  }
}
