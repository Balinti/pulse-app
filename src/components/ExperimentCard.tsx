import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card'
import { Button } from './ui/button'
import { Clock, CheckCircle } from 'lucide-react'
import Link from 'next/link'

interface ExperimentCardProps {
  experiment: {
    slug: string
    title: string
    duration_seconds: number
    category: string
  }
  recommended?: boolean
  recommendationReason?: string
}

export function ExperimentCard({
  experiment,
  recommended = false,
  recommendationReason
}: ExperimentCardProps) {
  const durationMinutes = Math.round(experiment.duration_seconds / 60)

  return (
    <Card className={recommended ? 'border-primary' : undefined}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{experiment.title}</CardTitle>
            <CardDescription className="mt-1 flex items-center gap-2">
              <Clock className="h-3 w-3" />
              {durationMinutes} min
              <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs">
                {experiment.category}
              </span>
            </CardDescription>
          </div>
          {recommended && (
            <span className="rounded-full bg-primary px-2 py-1 text-xs text-primary-foreground">
              Recommended
            </span>
          )}
        </div>
        {recommendationReason && (
          <p className="mt-2 text-sm text-muted-foreground">{recommendationReason}</p>
        )}
      </CardHeader>
      <CardContent>
        <Link href={`/experiments/${experiment.slug}`}>
          <Button variant="outline" className="w-full">
            View details
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
