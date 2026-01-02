'use client'

import { useState } from 'react'
import { SliderField } from './SliderField'
import { TagPicker } from './TagPicker'
import { Button } from './ui/button'
import { Label } from './ui/label'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'

interface CheckInFormProps {
  onSubmit: (data: {
    energy: number
    stress: number
    tag_slugs: string[]
    note: string
  }) => Promise<void>
  tags: Array<{ slug: string; label: string }>
  initialData?: {
    energy: number
    stress: number
    tag_slugs: string[]
    note: string
  }
}

export function CheckInForm({ onSubmit, tags, initialData }: CheckInFormProps) {
  const [energy, setEnergy] = useState(initialData?.energy ?? 5)
  const [stress, setStress] = useState(initialData?.stress ?? 5)
  const [selectedTags, setSelectedTags] = useState<string[]>(initialData?.tag_slugs ?? [])
  const [note, setNote] = useState(initialData?.note ?? '')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await onSubmit({ energy, stress, tag_slugs: selectedTags, note })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>How are you feeling today?</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <SliderField
            label="Energy"
            value={energy}
            onChange={setEnergy}
            min={0}
            max={10}
          />

          <SliderField
            label="Stress"
            value={stress}
            onChange={setStress}
            min={0}
            max={10}
          />

          <div>
            <Label>What's contributing? (optional)</Label>
            <TagPicker
              tags={tags}
              selectedTags={selectedTags}
              onChange={setSelectedTags}
            />
          </div>

          <div>
            <Label htmlFor="note">Note (optional)</Label>
            <textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="mt-2 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              rows={3}
              placeholder="Any additional thoughts..."
            />
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Saving...' : 'Save check-in'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
