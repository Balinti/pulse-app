'use client'

import { cn } from '@/lib/utils/cn'

interface TagPickerProps {
  tags: Array<{ slug: string; label: string }>
  selectedTags: string[]
  onChange: (tags: string[]) => void
}

export function TagPicker({ tags, selectedTags, onChange }: TagPickerProps) {
  const toggleTag = (slug: string) => {
    if (selectedTags.includes(slug)) {
      onChange(selectedTags.filter((t) => t !== slug))
    } else {
      onChange([...selectedTags, slug])
    }
  }

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {tags.map((tag) => {
        const isSelected = selectedTags.includes(tag.slug)
        return (
          <button
            key={tag.slug}
            type="button"
            onClick={() => toggleTag(tag.slug)}
            className={cn(
              'rounded-full px-3 py-1 text-sm transition-colors',
              isSelected
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            )}
          >
            {tag.label}
          </button>
        )
      })}
    </div>
  )
}
