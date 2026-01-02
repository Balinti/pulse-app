import { NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth/requireUser'
import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/lib/db/queries'
import { decrypt } from '@/lib/privacy/crypto'
import { refreshAccessToken } from '@/lib/google/oauth'
import { fetchCalendarEvents, computeDailyMetrics } from '@/lib/google/calendar'
import { subDays, addDays, format, startOfDay } from 'date-fns'
import { encrypt } from '@/lib/privacy/crypto'

export async function POST() {
  const { user, error: authError } = await requireUser()
  if (authError) return authError

  const supabase = await createClient()

  // Get calendar account
  const { data: calendarAccount, error: accountError } = await supabase
    .from('calendar_accounts')
    .select('*')
    .eq('user_id', user.id)
    .eq('provider', 'google')
    .is('revoked_at', null)
    .single()

  if (accountError || !calendarAccount) {
    return NextResponse.json({ error: 'Calendar not connected' }, { status: 404 })
  }

  try {
    // Decrypt and refresh tokens if needed
    let accessToken = decrypt(calendarAccount.access_token_enc)
    const tokenExpiresAt = new Date(calendarAccount.token_expires_at)

    if (tokenExpiresAt < new Date()) {
      const refreshToken = decrypt(calendarAccount.refresh_token_enc)
      const newTokens = await refreshAccessToken(refreshToken)

      if (newTokens.access_token) {
        accessToken = newTokens.access_token

        // Update tokens in database
        await supabase
          .from('calendar_accounts')
          .update({
            access_token_enc: encrypt(accessToken),
            token_expires_at: new Date(
              Date.now() + (newTokens.expiry_date || 3600 * 1000)
            ).toISOString(),
          })
          .eq('id', calendarAccount.id)
      }
    }

    // Fetch events for last 14 days + next 14 days
    const today = startOfDay(new Date())
    const startDate = subDays(today, 14)
    const endDate = addDays(today, 14)

    const events = await fetchCalendarEvents(accessToken, startDate, endDate)

    // Get user profile for timezone and work hours
    const profile = await getProfile(user.id)
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Compute daily metrics for each day
    let daysUpserted = 0
    const currentDate = new Date(startDate)

    while (currentDate <= endDate) {
      const dateLocal = format(currentDate, 'yyyy-MM-dd')
      const dayEvents = events.filter((e) => {
        const eventDate = format(new Date(e.start), 'yyyy-MM-dd')
        return eventDate === dateLocal
      })

      const metrics = computeDailyMetrics(dayEvents, currentDate, profile)

      await supabase.from('calendar_daily_metrics').upsert(
        {
          user_id: user.id,
          date_local: dateLocal,
          ...metrics,
        },
        { onConflict: 'user_id,date_local' }
      )

      daysUpserted++
      currentDate.setDate(currentDate.getDate() + 1)
    }

    return NextResponse.json({ ok: true, days_upserted: daysUpserted })
  } catch (error) {
    console.error('Calendar sync error:', error)
    return NextResponse.json(
      { error: 'Failed to sync calendar' },
      { status: 500 }
    )
  }
}
