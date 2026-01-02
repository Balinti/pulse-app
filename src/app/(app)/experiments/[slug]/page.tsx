'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppShell } from '@/components/AppShell'
import { ExperimentDetail } from '@/components/ExperimentDetail'
import type { Experiment } from '@/types'
import { format } from 'date-fns'
import { use } from 'react'

export default function ExperimentDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [experiment, setExperiment] = useState<Experiment | null>(null)
  const [todayStatus, setTodayStatus] = useState<'started' | 'completed' | 'skipped' | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const today = format(new Date(), 'yyyy-MM-dd')

  useEffect(() => {
    async function fetchData() {
      try {
        const experimentsRes = await fetch('/api/experiments')
        if (experimentsRes.ok) {
          const data = await experimentsRes.json()
          const exp = data.experiments.find((e: Experiment) => e.slug === resolvedParams.slug)
          setExperiment(exp || null)
        }

        // Check if user has logged this experiment today
        // In a real implementation, you'd fetch experiment logs
      } catch (error) {
        console.error('Error fetching experiment:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [resolvedParams.slug])

  const handleStart = async () => {
    const response = await fetch('/api/experiment-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        experiment_slug: resolvedParams.slug,
        date_local: today,
        status: 'started',
      }),
    })

    if (response.ok) {
      setTodayStatus('started')
    }
  }

  const handleComplete = async () => {
    const response = await fetch('/api/experiment-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        experiment_slug: resolvedParams.slug,
        date_local: today,
        status: 'completed',
      }),
    })

    if (response.ok) {
      setTodayStatus('completed')
      router.push('/experiments')
    }
  }

  const handleSkip = async () => {
    const response = await fetch('/api/experiment-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        experiment_slug: resolvedParams.slug,
        date_local: today,
        status: 'skipped',
      }),
    })

    if (response.ok) {
      setTodayStatus('skipped')
      router.push('/experiments')
    }
  }

  if (isLoading) {
    return (
      <AppShell>
        <div>Loading...</div>
      </AppShell>
    )
  }

  if (!experiment) {
    return (
      <AppShell>
        <div>Experiment not found</div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl space-y-6">
        <ExperimentDetail
          experiment={experiment}
          onStart={handleStart}
          onComplete={handleComplete}
          onSkip={handleSkip}
          todayStatus={todayStatus}
        />
      </div>
    </AppShell>
  )
}
