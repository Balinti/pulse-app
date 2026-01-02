'use client'

import { useEffect, useState } from 'react'
import { AppShell } from '@/components/AppShell'
import { TrendChart } from '@/components/TrendChart'
import { InsightCard } from '@/components/InsightCard'
import { PaywallGate } from '@/components/PaywallGate'
import type { WeeklyInsights, Entitlements } from '@/types'
import { format } from 'date-fns'

export default function InsightsPage() {
  const [insights, setInsights] = useState<WeeklyInsights | null>(null)
  const [entitlements, setEntitlements] = useState<Entitlements | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const ending = format(new Date(), 'yyyy-MM-dd')
        const [insightsRes, meRes] = await Promise.all([
          fetch(`/api/insights/weekly?ending=${ending}`),
          fetch('/api/me'),
        ])

        if (insightsRes.ok) {
          const data = await insightsRes.json()
          setInsights(data)
        }

        if (meRes.ok) {
          const data = await meRes.json()
          setEntitlements(data.entitlements)
        }
      } catch (error) {
        console.error('Error fetching insights:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  if (isLoading) {
    return (
      <AppShell>
        <div>Loading...</div>
      </AppShell>
    )
  }

  const isPlusUser = entitlements?.canAccessCalendarMetrics

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Insights</h1>
          <p className="text-muted-foreground">
            Your patterns over the past week
          </p>
        </div>

        {insights && (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border p-4">
              <div className="text-sm text-muted-foreground">Average Energy</div>
              <div className="text-3xl font-bold">{insights.trends.energy_avg.toFixed(1)}/10</div>
            </div>
            <div className="rounded-lg border p-4">
              <div className="text-sm text-muted-foreground">Average Stress</div>
              <div className="text-3xl font-bold">{insights.trends.stress_avg.toFixed(1)}/10</div>
            </div>
          </div>
        )}

        {insights?.insights && insights.insights.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Patterns detected</h2>
            {insights.insights.map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </div>
        )}

        {!isPlusUser && (
          <PaywallGate
            title="Unlock calendar insights"
            description="Connect your calendar and upgrade to Pulse Plus to see how meeting load, after-hours work, and schedule gaps affect your energy and stress."
          />
        )}
      </div>
    </AppShell>
  )
}
