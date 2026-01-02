import { NextRequest, NextResponse } from 'next/server'
import { exchangeCodeForTokens } from '@/lib/google/oauth'
import { encrypt } from '@/lib/privacy/crypto'
import { createClient } from '@/lib/supabase/server'
import { google } from 'googleapis'
import { getOAuth2Client } from '@/lib/google/oauth'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')

  if (!code || !state) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/settings?error=missing_params`
    )
  }

  // Extract user ID from state
  const [userId] = state.split(':')

  try {
    const tokens = await exchangeCodeForTokens(code)

    if (!tokens.access_token || !tokens.refresh_token) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/settings?error=no_tokens`
      )
    }

    // Get Google user info to get stable google_sub
    const oauth2Client = getOAuth2Client()
    oauth2Client.setCredentials(tokens)
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client })
    const { data: userInfo } = await oauth2.userinfo.get()

    if (!userInfo.id) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/settings?error=no_user_info`
      )
    }

    // Encrypt tokens
    const accessTokenEnc = encrypt(tokens.access_token)
    const refreshTokenEnc = encrypt(tokens.refresh_token!)

    const expiresAt = new Date(Date.now() + (tokens.expiry_date || 3600 * 1000))

    const supabase = await createClient()

    // Upsert calendar account
    const { error } = await supabase.from('calendar_accounts').upsert(
      {
        user_id: userId,
        provider: 'google',
        google_sub: userInfo.id,
        access_token_enc: accessTokenEnc,
        refresh_token_enc: refreshTokenEnc,
        token_expires_at: expiresAt.toISOString(),
        scopes: tokens.scope?.split(' ') || [],
      },
      { onConflict: 'provider,google_sub' }
    )

    if (error) {
      console.error('Error saving calendar account:', error)
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/settings?error=save_failed`
      )
    }

    // Log audit event
    await supabase.from('audit_events').insert({
      user_id: userId,
      type: 'calendar_connected',
      meta: { provider: 'google' },
    })

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/settings?connected=google`
    )
  } catch (error) {
    console.error('OAuth callback error:', error)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/settings?error=oauth_failed`
    )
  }
}
