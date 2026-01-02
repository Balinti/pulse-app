'use client'

import { useEffect, useState } from 'react'
import { AppShell } from '@/components/AppShell'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Check } from 'lucide-react'
import type { Entitlements } from '@/types'

export default function BillingPage() {
  const [entitlements, setEntitlements] = useState<Entitlements | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const meRes = await fetch('/api/me')
        if (meRes.ok) {
          const data = await meRes.json()
          setEntitlements(data.entitlements)
        }
      } catch (error) {
        console.error('Error fetching entitlements:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleUpgrade = async (interval: 'weekly' | 'monthly') => {
    const response = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan: 'plus', interval }),
    })

    if (response.ok) {
      const data = await response.json()
      window.location.href = data.url
    } else {
      alert('Failed to create checkout session')
    }
  }

  const handleManageBilling = async () => {
    const response = await fetch('/api/stripe/portal', {
      method: 'POST',
    })

    if (response.ok) {
      const data = await response.json()
      window.location.href = data.url
    } else {
      alert('Failed to open billing portal')
    }
  }

  if (isLoading) {
    return (
      <AppShell>
        <div>Loading...</div>
      </AppShell>
    )
  }

  const isPlusUser = entitlements?.plan === 'plus'

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Billing</h1>
          <p className="text-muted-foreground">
            Current plan: <span className="font-semibold">{entitlements?.plan === 'plus' ? 'Pulse Plus' : 'Free'}</span>
          </p>
        </div>

        {isPlusUser && (
          <Card>
            <CardHeader>
              <CardTitle>Manage Subscription</CardTitle>
              <CardDescription>
                Update payment method, view invoices, or cancel subscription
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleManageBilling}>
                Manage billing
              </Button>
            </CardContent>
          </Card>
        )}

        {!isPlusUser && (
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Pulse Plus - Weekly</CardTitle>
                <div className="text-3xl font-bold">$5.99<span className="text-lg font-normal text-muted-foreground">/week</span></div>
                <CardDescription>7-day free trial</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    Calendar metadata insights
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    Smart recommendations
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    Unlimited experiments
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    30-day history
                  </li>
                </ul>
                <Button onClick={() => handleUpgrade('weekly')} className="w-full">
                  Start free trial
                </Button>
              </CardContent>
            </Card>

            <Card className="border-primary">
              <CardHeader>
                <div className="mb-2 w-fit rounded-full bg-primary px-2 py-1 text-xs text-primary-foreground">
                  BEST VALUE
                </div>
                <CardTitle>Pulse Plus - Monthly</CardTitle>
                <div className="text-3xl font-bold">$19.99<span className="text-lg font-normal text-muted-foreground">/month</span></div>
                <CardDescription>7-day free trial • Save 17%</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    Calendar metadata insights
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    Smart recommendations
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    Unlimited experiments
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    30-day history
                  </li>
                </ul>
                <Button onClick={() => handleUpgrade('monthly')} className="w-full">
                  Start free trial
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AppShell>
  )
}
