'use client'

import { useEffect, useState } from 'react'
import { AppShell } from '@/components/AppShell'
import { WorkingHoursForm } from '@/components/WorkingHoursForm'
import { CalendarConnectButton } from '@/components/CalendarConnectButton'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import type { Profile } from '@/types'

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isCalendarConnected, setIsCalendarConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const meRes = await fetch('/api/me')
        if (meRes.ok) {
          const data = await meRes.json()
          setProfile(data.profile)
        }

        // Check calendar connection (simplified - would need actual API endpoint)
        // For now, assuming not connected
        setIsCalendarConnected(false)
      } catch (error) {
        console.error('Error fetching settings:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleSaveWorkingHours = async (data: {
    timezone: string
    workday_start_local: string
    workday_end_local: string
    workdays: number[]
  }) => {
    // In a real implementation, you'd have a PATCH /api/profile endpoint
    console.log('Save working hours:', data)
    alert('Working hours saved!')
  }

  const handleConnectCalendar = () => {
    window.location.href = '/api/integrations/google/start'
  }

  const handleDisconnectCalendar = async () => {
    const response = await fetch('/api/integrations/google/disconnect', {
      method: 'POST',
    })

    if (response.ok) {
      setIsCalendarConnected(false)
      alert('Calendar disconnected')
    }
  }

  const handleSyncCalendar = async () => {
    const response = await fetch('/api/integrations/google/sync', {
      method: 'POST',
    })

    if (response.ok) {
      alert('Calendar synced successfully!')
    } else {
      alert('Failed to sync calendar')
    }
  }

  if (isLoading || !profile) {
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
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your Pulse preferences</p>
        </div>

        <WorkingHoursForm
          initialData={{
            timezone: profile.timezone,
            workday_start_local: profile.workday_start_local,
            workday_end_local: profile.workday_end_local,
            workdays: profile.workdays,
          }}
          onSave={handleSaveWorkingHours}
        />

        <Card>
          <CardHeader>
            <CardTitle>Calendar Integration</CardTitle>
            <CardDescription>
              Connect your Google Calendar for meeting load insights (metadata only, we never
              see event titles or descriptions)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CalendarConnectButton
              isConnected={isCalendarConnected}
              onConnect={handleConnectCalendar}
              onDisconnect={handleDisconnectCalendar}
              onSync={handleSyncCalendar}
            />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
