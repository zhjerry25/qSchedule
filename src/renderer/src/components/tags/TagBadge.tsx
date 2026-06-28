import type { TagBasic } from '@shared/task'

interface TagBadgeProps {
  tag: TagBasic
  removable?: boolean
  onRemove?: () => void
  className?: string
}

/**
 * Single colored chip displaying a tag name.
 * When `removable` is true, an × button appears for removing the tag.
 */
export function TagBadge({
  tag,
  removable = false,
  onRemove,
  className = '',
}: TagBadgeProps) {
  const backgroundColor = tag.color || '#E5E5E5'

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-neutral-700 select-none ${className}`}
      style={{ backgroundColor }}
    >
      {tag.name}
      {removable && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onRemove?.()
          }}
          className="ml-0.5 inline-flex items-center justify-center w-3.5 h-3.5 rounded-full text-neutral-500 hover:text-rose-600 hover:bg-black/10 transition-colors"
          aria-label={`Remove tag ${tag.name}`}
        >
          ×
        </button>
      )}
    </span>
  )
}
