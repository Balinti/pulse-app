'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'

interface TrendChartProps {
  data: Array<{ date: string; energy: number; stress: number }>
  title?: string
}

export function TrendChart({ data, title = '7-Day Trends' }: TrendChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={[0, 10]} />
            <Tooltip />
            <Line type="monotone" dataKey="energy" stroke="#10b981" strokeWidth={2} name="Energy" />
            <Line type="monotone" dataKey="stress" stroke="#ef4444" strokeWidth={2} name="Stress" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
