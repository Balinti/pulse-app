import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth/requireUser'
import { createClient } from '@/lib/supabase/server'
import { getEntitlements } from '@/lib/db/queries'
import { calculateTrends } from '@/lib/insights/metrics'
import { generateInsights } from '@/lib/insights/heuristics'
import { subDays, format } from 'date-fns'
import type { WeeklyInsights } from '@/types'

export async function GET(request: NextRequest) {
  const { user, error: authError } = await requireUser()
  if (authError) return authError

  const { searchParams } = new URL(request.url)
  const ending = searchParams.get('ending') || format(new Date(), 'yyyy-MM-dd')

  const endDate = new Date(ending)
  const startDate = subDays(endDate, 6)

  const fromStr = format(startDate, 'yyyy-MM-dd')
  const toStr = format(endDate, 'yyyy-MM-dd')

  const entitlements = await getEntitlements(user.id)
  const supabase = await createClient()

  // Get check-ins for the week
  const { data: checkins } = await supabase
    .from('checkins')
    .select('*')
    .eq('user_id', user.id)
    .gte('date_local', fromStr)
    .lte('date_local', toStr)
    .order('date_local', { ascending: false })

  // Get calendar metrics for the week (if Plus user)
  const { data: calendarMetrics } = await supabase
    .from('calendar_daily_metrics')
    .select('*')
    .eq('user_id', user.id)
    .gte('date_local', fromStr)
    .lte('date_local', toStr)
    .order('date_local', { ascending: false })

  const trends = calculateTrends(checkins || [])
  const insights = generateInsights(
    checkins || [],
    calendarMetrics || [],
    entitlements.canAccessCalendarMetrics
  )

  const response: WeeklyInsights = {
    range: {
      from: fromStr,
      to: toStr,
    },
    trends,
    insights,
  }

  return NextResponse.json(response)
}
