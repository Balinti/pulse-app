'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card'
import { Button } from './ui/button'
import { Clock, CheckCircle } from 'lucide-react'

interface ExperimentDetailProps {
  experiment: {
    slug: string
    title: string
    duration_seconds: number
    steps: string[]
    category: string
  }
  onStart: () => Promise<void>
  onComplete: () => Promise<void>
  onSkip: () => Promise<void>
  todayStatus?: 'started' | 'completed' | 'skipped' | null
}

export function ExperimentDetail({
  experiment,
  onStart,
  onComplete,
  onSkip,
  todayStatus,
}: ExperimentDetailProps) {
  const [isLoading, setIsLoading] = useState(false)
  const durationMinutes = Math.round(experiment.duration_seconds / 60)

  const handleAction = async (action: () => Promise<void>) => {
    setIsLoading(true)
    try {
      await action()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{experiment.title}</CardTitle>
        <CardDescription className="flex items-center gap-2">
          <Clock className="h-3 w-3" />
          {durationMinutes} minutes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="mb-3 font-semibold">Steps:</h3>
          <ol className="space-y-2">
            {experiment.steps.map((step, index) => (
              <li key={index} className="flex gap-2">
                <span className="font-medium text-muted-foreground">{index + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {todayStatus === 'completed' && (
          <div className="flex items-center gap-2 rounded-md bg-green-50 p-3 text-sm text-green-900">
            <CheckCircle className="h-4 w-4" />
            Completed today
          </div>
        )}

        {todayStatus === 'started' && (
          <div className="flex items-center gap-2 rounded-md bg-blue-50 p-3 text-sm text-blue-900">
            <Clock className="h-4 w-4" />
            Started today
          </div>
        )}

        <div className="flex gap-2">
          {todayStatus !== 'completed' && (
            <>
              <Button
                onClick={() => handleAction(onComplete)}
                disabled={isLoading}
                className="flex-1"
              >
                {todayStatus === 'started' ? 'Mark complete' : 'Start & complete'}
              </Button>
              {todayStatus !== 'started' && (
                <Button
                  onClick={() => handleAction(onSkip)}
                  disabled={isLoading}
                  variant="outline"
                >
                  Skip today
                </Button>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
