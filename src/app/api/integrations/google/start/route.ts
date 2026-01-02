import { NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth/requireUser'
import { generateAuthUrl } from '@/lib/google/oauth'
import { randomBytes } from 'crypto'

export async function GET() {
  const { user, error: authError } = await requireUser()
  if (authError) return authError

  // Generate state token (in production, store in session/database)
  const state = `${user.id}:${randomBytes(16).toString('hex')}`

  const authUrl = generateAuthUrl(state)

  return NextResponse.redirect(authUrl)
}
