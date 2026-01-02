'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppShell } from '@/components/AppShell'
import { CheckInForm } from '@/components/CheckInForm'
import { format } from 'date-fns'

export default function CheckinPage() {
  const router = useRouter()
  const [tags, setTags] = useState<Array<{ slug: string; label: string }>>([])
  const [todayCheckin, setTodayCheckin] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  const today = format(new Date(), 'yyyy-MM-dd')

  useEffect(() => {
    async function fetchData() {
      try {
        const [tagsRes, checkinRes] = await Promise.all([
          fetch('/api/tags'),
          fetch(`/api/checkins/${today}`),
        ])

        if (tagsRes.ok) {
          const data = await tagsRes.json()
          setTags(data.tags)
        }

        if (checkinRes.ok) {
          const data = await checkinRes.json()
          setTodayCheckin(data)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [today])

  const handleSubmit = async (data: {
    energy: number
    stress: number
    tag_slugs: string[]
    note: string
  }) => {
    const response = await fetch('/api/checkins', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date_local: today,
        ...data,
      }),
    })

    if (response.ok) {
      router.push('/dashboard')
      router.refresh()
    } else {
      const error = await response.json()
      alert(`Error: ${error.error}`)
    }
  }

  if (isLoading) {
    return (
      <AppShell>
        <div>Loading...</div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Daily Check-in</h1>
          <p className="text-muted-foreground">
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </p>
        </div>

        <CheckInForm
          onSubmit={handleSubmit}
          tags={tags}
          initialData={
            todayCheckin
              ? {
                  energy: todayCheckin.energy,
                  stress: todayCheckin.stress,
                  tag_slugs: todayCheckin.tag_slugs,
                  note: todayCheckin.note || '',
                }
              : undefined
          }
        />
      </div>
    </AppShell>
  )
}
