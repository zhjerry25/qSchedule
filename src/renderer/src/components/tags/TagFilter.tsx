import { useState } from 'react'
import { useTags } from '../../hooks/useTags'
import { useTagMutations } from '../../hooks/useTagMutations'
import { useUIStore } from '../../stores/ui-store'
import { useI18n } from '../../i18n'
import { ConfirmDialog } from '../ui/ConfirmDialog'

interface TagFilterProps {
  className?: string
}

/**
 * Sidebar checkbox list for OR-logic tag filtering.
 * Each row shows a colored indicator and tag name.
 * Clicking toggles the tag in Zustand's selectedTagIds.
 */
export function TagFilter({ className = '' }: TagFilterProps) {
  const { tags, isLoading, isError } = useTags()
  const { deleteTag } = useTagMutations()
  const selectedTagIds = useUIStore((s) => s.selectedTagIds)
  const toggleTagFilter = useUIStore((s) => s.toggleTagFilter)
  const { t } = useI18n()
  const [deletingTagId, setDeletingTagId] = useState<string | null>(null)

  // ── Loading state ──
  if (isLoading) {
    return (
      <div className={`mt-2 space-y-1 ${className}`}>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-7 bg-neutral-100 rounded-smooth animate-pulse"
          />
        ))}
      </div>
    )
  }

  // ── Error state ──
  if (isError) {
    return (
      <p className={`mt-2 text-xs text-rose-500 italic ${className}`}>
        {t.tag.failedToLoad}
      </p>
    )
  }

  // ── Empty state ──
  if (tags.length === 0) {
    return (
      <p className={`mt-2 text-xs text-neutral-300 italic ${className}`}>
        {t.tag.noTags}
      </p>
    )
  }

  // ── Tag list ──
  return (
    <div className={`mt-2 space-y-0.5 ${className}`}>
      {tags.map((tag) => {
        const isSelected = selectedTagIds.includes(tag.id)
        return (
          <button
            key={tag.id}
            type="button"
            onClick={() => toggleTagFilter(tag.id)}
            className={`group flex items-center gap-2 w-full px-3 py-1.5 rounded-smooth text-left transition-colors cursor-pointer ${
              isSelected
                ? 'bg-neutral-100 text-neutral-800'
                : 'text-neutral-600 hover:bg-neutral-50'
            }`}
          >
            {/* Color indicator */}
            <span
              className={`inline-block w-2.5 h-2.5 rounded-full flex-shrink-0 transition-transform ${
                isSelected ? 'ring-2 ring-offset-1 ring-neutral-400' : ''
              }`}
              style={{ backgroundColor: tag.color }}
            />
            {/* Tag name */}
            <span className="text-sm truncate">{tag.name}</span>
            {/* Checkmark when selected */}
            {isSelected && (
              <svg
                className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0"
                viewBox="0 0 16 16"
                fill="currentColor"
              >
                <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z" />
              </svg>
            )}
            {/* Delete button — visible on row hover */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setDeletingTagId(tag.id)
              }}
              className="ml-auto w-5 h-5 flex items-center justify-center rounded-full text-neutral-300 hover:text-rose-500 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
              aria-label={t.tag.deleteTag}
            >
              ×
            </button>
          </button>
        )
      })}

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        open={deletingTagId !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingTagId(null)
        }}
        title={t.tag.deleteTag}
        description={
          deletingTagId
            ? t.tag.deleteTagConfirm.replace(
                '{name}',
                tags.find((t) => t.id === deletingTagId)?.name ?? '',
              )
            : ''
        }
        variant="danger"
        confirmLabel={t.todo.delete}
        loading={deleteTag.isPending}
        onConfirm={() => {
          if (deletingTagId) {
            deleteTag.mutate(deletingTagId)
            setDeletingTagId(null)
          }
        }}
      />
    </div>
  )
}
