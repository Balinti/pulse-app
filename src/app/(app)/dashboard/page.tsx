import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/AppShell'
import { StatCard } from '@/components/StatCard'
import { TrendChart } from '@/components/TrendChart'
import { ExperimentCard } from '@/components/ExperimentCard'
import { Battery, TrendingUp } from 'lucide-react'
import { format, subDays } from 'date-fns'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get today's check-in
  const today = format(new Date(), 'yyyy-MM-dd')
  const { data: todayCheckin } = await supabase
    .from('checkins')
    .select('*')
    .eq('user_id', user.id)
    .eq('date_local', today)
    .single()

  // Get last 7 days check-ins for chart
  const sevenDaysAgo = format(subDays(new Date(), 6), 'yyyy-MM-dd')
  const { data: recentCheckins } = await supabase
    .from('checkins')
    .select('*')
    .eq('user_id', user.id)
    .gte('date_local', sevenDaysAgo)
    .order('date_local', { ascending: true })

  // Get today's recommendation
  const recommendationRes = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/recommendations/today?date_local=${today}`,
    { headers: { cookie: '' }, cache: 'no-store' }
  )
  const recommendation = recommendationRes.ok ? await recommendationRes.json() : null

  const chartData = recentCheckins?.map((c) => ({
    date: c.date_local.slice(5), // MM-DD
    energy: c.energy,
    stress: c.stress,
  })) || []

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back to Pulse</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <StatCard
            title="Today's Check-in"
            value={todayCheckin ? 'Complete' : 'Not yet'}
            icon={Battery}
            description={
              todayCheckin
                ? `Energy: ${todayCheckin.energy}/10 • Stress: ${todayCheckin.stress}/10`
                : 'Take 10 seconds to check in'
            }
          />
          <StatCard
            title="7-Day Streak"
            value={recentCheckins?.length || 0}
            icon={TrendingUp}
            description="Check-ins this week"
          />
        </div>

        {!todayCheckin && (
          <Link href="/checkin">
            <Button size="lg" className="w-full">
              Check in now
            </Button>
          </Link>
        )}

        {chartData.length > 0 && <TrendChart data={chartData} />}

        {recommendation?.recommended && (
          <div>
            <h2 className="mb-4 text-xl font-semibold">Recommended for you</h2>
            <ExperimentCard
              experiment={{
                slug: recommendation.recommended.experiment_slug,
                title: recommendation.recommended.experiment_slug.replace(/-/g, ' '),
                duration_seconds: 120,
                category: 'recommended',
              }}
              recommended
              recommendationReason={recommendation.recommended.reason}
            />
          </div>
        )}
      </div>
    </AppShell>
  )
}
