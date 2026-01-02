'use client'

import { useState } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card'
import { AlertTriangle } from 'lucide-react'

interface DangerZoneProps {
  onDeleteAccount: () => Promise<void>
}

export function DangerZone({ onDeleteAccount }: DangerZoneProps) {
  const [isConfirming, setIsConfirming] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await onDeleteAccount()
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Card className="border-destructive">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <CardTitle>Danger Zone</CardTitle>
        </div>
        <CardDescription>
          Permanently delete your account and all data. This action cannot be undone.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!isConfirming ? (
          <Button
            onClick={() => setIsConfirming(true)}
            variant="destructive"
            className="w-full"
          >
            Delete account
          </Button>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-destructive">
              Are you sure? This will delete all your data permanently.
            </p>
            <div className="flex gap-2">
              <Button
                onClick={handleDelete}
                disabled={isDeleting}
                variant="destructive"
                className="flex-1"
              >
                {isDeleting ? 'Deleting...' : 'Yes, delete everything'}
              </Button>
              <Button
                onClick={() => setIsConfirming(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
