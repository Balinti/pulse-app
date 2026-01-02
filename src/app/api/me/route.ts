import { NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth/requireUser'
import { getProfile, getEntitlements } from '@/lib/db/queries'
import type { MeResponse } from '@/types'

export async function GET() {
  const { user, error } = await requireUser()
  if (error) return error

  const profile = await getProfile(user.id)
  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }

  const entitlements = await getEntitlements(user.id)

  const response: MeResponse = {
    user: {
      id: user.id,
      email: user.email!,
    },
    profile,
    entitlements,
  }

  return NextResponse.json(response)
}
