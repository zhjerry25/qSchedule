import { TagBadge } from './TagBadge'
import type { TagBasic } from '@shared/task'

interface TagListProps {
  tags: TagBasic[]
  removable?: boolean
  onRemove?: (tag: TagBasic) => void
  className?: string
}

/**
 * Horizontal wrapping list of TagBadge components.
 * Returns null when there are no tags (no empty container rendered).
 */
export function TagList({
  tags,
  removable = false,
  onRemove,
  className = '',
}: TagListProps) {
  if (tags.length === 0) return null

  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
      {tags.map((tag) => (
        <TagBadge
          key={tag.id}
          tag={tag}
          removable={removable}
          onRemove={onRemove ? () => onRemove(tag) : undefined}
        />
      ))}
    </div>
  )
}
