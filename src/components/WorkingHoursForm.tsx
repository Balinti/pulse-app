'use client'

import { useState } from 'react'
import { Button } from './ui/button'
import { Label } from './ui/label'
import { Input } from './ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card'

interface WorkingHoursFormProps {
  initialData: {
    timezone: string
    workday_start_local: string
    workday_end_local: string
    workdays: number[]
  }
  onSave: (data: {
    timezone: string
    workday_start_local: string
    workday_end_local: string
    workdays: number[]
  }) => Promise<void>
}

const WEEKDAYS = [
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
  { value: 7, label: 'Sun' },
]

export function WorkingHoursForm({ initialData, onSave }: WorkingHoursFormProps) {
  const [timezone, setTimezone] = useState(initialData.timezone)
  const [startTime, setStartTime] = useState(initialData.workday_start_local.slice(0, 5))
  const [endTime, setEndTime] = useState(initialData.workday_end_local.slice(0, 5))
  const [workdays, setWorkdays] = useState<number[]>(initialData.workdays)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const toggleWorkday = (day: number) => {
    if (workdays.includes(day)) {
      setWorkdays(workdays.filter((d) => d !== day))
    } else {
      setWorkdays([...workdays, day].sort())
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await onSave({
        timezone,
        workday_start_local: `${startTime}:00`,
        workday_end_local: `${endTime}:00`,
        workdays,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Working Hours</CardTitle>
        <CardDescription>
          Set your typical work schedule for calendar insights
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="timezone">Timezone</Label>
            <Input
              id="timezone"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              placeholder="America/Los_Angeles"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start">Start time</Label>
              <Input
                id="start"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="end">End time</Label>
              <Input
                id="end"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label>Work days</Label>
            <div className="mt-2 flex gap-2">
              {WEEKDAYS.map((day) => (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => toggleWorkday(day.value)}
                  className={`rounded-md px-3 py-2 text-sm ${
                    workdays.includes(day.value)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </div>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
