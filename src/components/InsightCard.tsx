import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card'
import { Lightbulb } from 'lucide-react'
import type { Insight } from '@/types'

interface InsightCardProps {
  insight: Insight
}

export function InsightCard({ insight }: InsightCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-3">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          <div className="flex-1">
            <CardTitle className="text-base">{insight.title}</CardTitle>
            <CardDescription className="mt-1">{insight.detail}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span
            className={`rounded-full px-2 py-0.5 ${
              insight.confidence === 'high'
                ? 'bg-green-100 text-green-700'
                : insight.confidence === 'medium'
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            {insight.confidence} confidence
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
