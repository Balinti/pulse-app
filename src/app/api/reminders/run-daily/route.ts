import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { sendDailyReminder } from '@/lib/email/postmark'
import { getTodayLocal } from '@/lib/utils/dates'

export async function POST(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  const expectedAuth = `Bearer ${process.env.CRON_SECRET}`

  if (authHeader !== expectedAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()

  // Get all users with reminder time set
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, email, timezone, checkin_reminder_time_local')
    .not('checkin_reminder_time_local', 'is', null)

  if (error) {
    console.error('Error fetching profiles:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!profiles || profiles.length === 0) {
    return NextResponse.json({ ok: true, emails_sent: 0 })
  }

  let emailsSent = 0

  for (const profile of profiles) {
    try {
      const todayLocal = getTodayLocal(profile.timezone)

      // Check if user already checked in today
      const { data: checkin } = await supabase
        .from('checkins')
        .select('id')
        .eq('user_id', profile.id)
        .eq('date_local', todayLocal)
        .single()

      if (checkin) {
        // Already checked in today, skip
        continue
      }

      // Send reminder
      if (profile.email) {
        await sendDailyReminder(profile.email, '')
        emailsSent++
      }
    } catch (error) {
      console.error(`Error sending reminder to ${profile.email}:`, error)
    }
  }

  return NextResponse.json({ ok: true, emails_sent: emailsSent })
}
