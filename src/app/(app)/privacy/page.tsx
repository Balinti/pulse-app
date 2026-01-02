'use client'

import { AppShell } from '@/components/AppShell'
import { DangerZone } from '@/components/DangerZone'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import { Download, Shield } from 'lucide-react'

export default function PrivacyPage() {
  const router = useRouter()

  const handleExport = async () => {
    const response = await fetch('/api/data/export', {
      method: 'POST',
    })

    if (response.ok) {
      const data = await response.json()
      if (data.download_url) {
        window.open(data.download_url, '_blank')
      } else {
        // Fallback: download JSON directly
        const blob = new Blob([JSON.stringify(data, null, 2)], {
          type: 'application/json',
        })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `pulse-export-${Date.now()}.json`
        a.click()
      }
    } else {
      alert('Failed to export data')
    }
  }

  const handleDeleteAccount = async () => {
    const response = await fetch('/api/data/delete-account', {
      method: 'POST',
    })

    if (response.ok) {
      alert('Account deleted successfully')
      router.push('/login')
    } else {
      alert('Failed to delete account')
    }
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Privacy & Data</h1>
          <p className="text-muted-foreground">Your data, your control</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <CardTitle>Our Privacy Commitment</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              <strong>Metadata-only calendar integration:</strong> We only store meeting start/end
              times and derive metrics like meeting count and duration. We never see event titles,
              descriptions, or attendee emails.
            </p>
            <p>
              <strong>Non-clinical tool:</strong> Pulse is not therapy or medical advice. If you're
              experiencing a mental health crisis, please contact a licensed professional or crisis
              hotline.
            </p>
            <p>
              <strong>Data minimization:</strong> We only collect what's needed to provide value.
              You can export or delete your data at any time.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Export Your Data</CardTitle>
            <CardDescription>
              Download all your data in JSON format
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleExport} className="gap-2">
              <Download className="h-4 w-4" />
              Export data
            </Button>
          </CardContent>
        </Card>

        <DangerZone onDeleteAccount={handleDeleteAccount} />
      </div>
    </AppShell>
  )
}
