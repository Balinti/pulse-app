'use client'

import { Button } from './ui/button'
import { Calendar, Loader2 } from 'lucide-react'
import { useState } from 'react'

interface CalendarConnectButtonProps {
  isConnected: boolean
  onConnect: () => void
  onDisconnect: () => Promise<void>
  onSync?: () => Promise<void>
}

export function CalendarConnectButton({
  isConnected,
  onConnect,
  onDisconnect,
  onSync,
}: CalendarConnectButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleDisconnect = async () => {
    setIsLoading(true)
    try {
      await onDisconnect()
    } finally {
      setIsLoading(false)
    }
  }

  const handleSync = async () => {
    if (!onSync) return
    setIsLoading(true)
    try {
      await onSync()
    } finally {
      setIsLoading(false)
    }
  }

  if (isConnected) {
    return (
      <div className="flex gap-2">
        {onSync && (
          <Button onClick={handleSync} disabled={isLoading} variant="outline">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Sync now'}
          </Button>
        )}
        <Button onClick={handleDisconnect} disabled={isLoading} variant="destructive">
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Disconnect'}
        </Button>
      </div>
    )
  }

  return (
    <Button onClick={onConnect} className="gap-2">
      <Calendar className="h-4 w-4" />
      Connect Google Calendar
    </Button>
  )
}
