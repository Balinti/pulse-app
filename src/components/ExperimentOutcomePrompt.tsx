'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card'
import { Button } from './ui/button'

interface ExperimentOutcomePromptProps {
  experiment: {
    title: string
  }
  date: string
  onOutcome: (outcome: 'better' | 'same' | 'worse') => Promise<void>
}

export function ExperimentOutcomePrompt({
  experiment,
  date,
  onOutcome
}: ExperimentOutcomePromptProps) {
  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="text-base">How did it go?</CardTitle>
        <CardDescription>
          You tried "{experiment.title}" on {date}. Did you feel better the next day?
        </CardDescription>
      </CardHeader>
      <CardContent className="flex gap-2">
        <Button
          onClick={() => onOutcome('better')}
          variant="outline"
          className="flex-1"
        >
          Better
        </Button>
        <Button
          onClick={() => onOutcome('same')}
          variant="outline"
          className="flex-1"
        >
          Same
        </Button>
        <Button
          onClick={() => onOutcome('worse')}
          variant="outline"
          className="flex-1"
        >
          Worse
        </Button>
      </CardContent>
    </Card>
  )
}
