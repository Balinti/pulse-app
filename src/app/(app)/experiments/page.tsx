'use client'

import { useEffect, useState } from 'react'
import { AppShell } from '@/components/AppShell'
import { ExperimentCard } from '@/components/ExperimentCard'
import { PaywallGate } from '@/components/PaywallGate'
import type { Experiment, Entitlements } from '@/types'

export default function ExperimentsPage() {
  const [experiments, setExperiments] = useState<Experiment[]>([])
  const [entitlements, setEntitlements] = useState<Entitlements | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [experimentsRes, meRes] = await Promise.all([
          fetch('/api/experiments'),
          fetch('/api/me'),
        ])

        if (experimentsRes.ok) {
          const data = await experimentsRes.json()
          setExperiments(data.experiments)
        }

        if (meRes.ok) {
          const data = await meRes.json()
          setEntitlements(data.entitlements)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
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

  const isFreeTier = entitlements?.plan === 'free'
  const experimentLimit = entitlements?.experimentLimit || 3
  const displayedExperiments = isFreeTier
    ? experiments.slice(0, experimentLimit)
    : experiments

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Experiments</h1>
          <p className="text-muted-foreground">
            2-minute practices to prevent burnout
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {displayedExperiments.map((experiment) => (
            <ExperimentCard key={experiment.slug} experiment={experiment} />
          ))}
        </div>

        {isFreeTier && experiments.length > experimentLimit && (
          <PaywallGate
            title="Unlock all experiments"
            description={`You're viewing ${experimentLimit} of ${experiments.length} experiments. Upgrade to Pulse Plus to access all experiments.`}
          />
        )}
      </div>
    </AppShell>
  )
}
