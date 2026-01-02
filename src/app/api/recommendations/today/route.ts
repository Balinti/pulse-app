import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth/requireUser'
import { createClient } from '@/lib/supabase/server'
import { getEntitlements, hasCalendarConnected } from '@/lib/db/queries'
import { generateRecommendation } from '@/lib/recommendations/rules'
import { addDays, format } from 'date-fns'

export async function GET(request: NextRequest) {
  const { user, error: authError } = await requireUser()
  if (authError) return authError

  const { searchParams } = new URL(request.url)
  const dateLocal = searchParams.get('date_local') || format(new Date(), 'yyyy-MM-dd')

  const entitlements = await getEntitlements(user.id)
  const hasCalendar = await hasCalendarConnected(user.id)

  const supabase = await createClient()

  // Get recent check-ins
  const { data: checkins } = await supabase
    .from('checkins')
    .select('*')
    .eq('user_id', user.id)
    .order('date_local', { ascending: false })
    .limit(7)

  // Get tomorrow's calendar metrics
  const tomorrow = format(addDays(new Date(dateLocal), 1), 'yyyy-MM-dd')
  const { data: tomorrowMetric } = await supabase
    .from('calendar_daily_metrics')
    .select('*')
    .eq('user_id', user.id)
    .eq('date_local', tomorrow)
    .single()

  const recommendation = await generateRecommendation(
    dateLocal,
    checkins || [],
    tomorrowMetric || null,
    entitlements.canAccessRecommendations,
    hasCalendar
  )

  return NextResponse.json(recommendation)
}
