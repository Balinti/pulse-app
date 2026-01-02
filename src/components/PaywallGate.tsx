'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Lock } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface PaywallGateProps {
  title?: string
  description?: string
  children?: React.ReactNode
}

export function PaywallGate({
  title = 'Upgrade to Pulse Plus',
  description = 'This feature requires Pulse Plus. Upgrade to unlock calendar insights, smart recommendations, and unlimited experiments.',
  children
}: PaywallGateProps) {
  const router = useRouter()

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Lock className="h-5 w-5 text-muted-foreground" />
          <CardTitle>{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {children}
        <Button onClick={() => router.push('/billing')} className="mt-4">
          Upgrade to Plus
        </Button>
      </CardContent>
    </Card>
  )
}
