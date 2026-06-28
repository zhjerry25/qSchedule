import { useState, useRef, useCallback } from 'react'
import { TagBadge } from './TagBadge'
import type { Tag } from '@shared/tag'

interface TagInputProps {
  /** Currently selected tags */
  value: Tag[]
  /** Called when selected tags change (add or remove) */
  onChange: (tags: Tag[]) => void
  /** All existing tags from the DB, for autocomplete */
  existingTags: Tag[]
  /** Called when the user wants to create a new tag. Returns the created Tag. */
  onCreateTag: (name: string) => Promise<Tag>
  className?: string
}

/**
 * Free-text input with autocomplete dropdown for selecting existing tags
 * or creating new ones. The parent (e.g. TodoForm) owns all mutation logic
 * via the `onCreateTag` callback — this component is purely presentational.
 */
export function TagInput({
  value,
  onChange,
  existingTags,
  onCreateTag,
  className = '',
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // ── Derived ──
  const trimmed = inputValue.trim()
  const suggestions = trimmed
    ? existingTags.filter(
        (t) =>
          t.name.toLowerCase().includes(trimmed.toLowerCase()) &&
          !value.some((vt) => vt.id === t.id),
      )
    : []

  const exactMatch = suggestions.some(
    (t) => t.name.toLowerCase() === trimmed.toLowerCase(),
  )

  const isDropdownOpen = trimmed.length > 0

  // ── Handlers ──
  const addTag = useCallback(
    (tag: Tag) => {
      if (!value.some((vt) => vt.id === tag.id)) {
        onChange([...value, tag])
      }
      setInputValue('')
      inputRef.current?.focus()
    },
    [value, onChange],
  )

  const removeTag = useCallback(
    (tag: Tag) => {
      onChange(value.filter((vt) => vt.id !== tag.id))
    },
    [value, onChange],
  )

  const removeLastTag = useCallback(() => {
    if (value.length > 0) {
      onChange(value.slice(0, -1))
    }
  }, [value, onChange])

  const handleSelectExisting = useCallback(
    (tag: Tag) => {
      addTag(tag)
    },
    [addTag],
  )

  const handleCreateNew = useCallback(async () => {
    if (!trimmed || isCreating) return
    setIsCreating(true)
    try {
      const newTag = await onCreateTag(trimmed)
      addTag(newTag)
    } catch {
      // onCreateTag error is handled by the parent's mutation
    } finally {
      setIsCreating(false)
    }
  }, [trimmed, isCreating, onCreateTag, addTag])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        if (!trimmed) return

        // Prefer exact match over creating a new tag
        const match = existingTags.find(
          (t) => t.name.toLowerCase() === trimmed.toLowerCase(),
        )
        if (match && !value.some((vt) => vt.id === match.id)) {
          addTag(match)
        } else if (!match) {
          handleCreateNew()
        }
      } else if (e.key === 'Backspace' && inputValue === '') {
        removeLastTag()
      }
    },
    [trimmed, existingTags, value, addTag, handleCreateNew, inputValue, removeLastTag],
  )

  const handleBlur = useCallback(() => {
    // Delay to allow click events on dropdown items to fire first
    setTimeout(() => {
      setInputValue('')
    }, 150)
  }, [])

  // ── Render ──
  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Input area */}
      <div
        className="flex flex-wrap items-center gap-1.5 w-full min-h-[36px] px-3 py-1.5 border border-neutral-200 rounded-smooth bg-white focus-within:border-neutral-400 focus-within:ring-1 focus-within:ring-neutral-300 transition-colors cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((tag) => (
          <TagBadge
            key={tag.id}
            tag={tag}
            removable
            onRemove={() => removeTag(tag)}
          />
        ))}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder={value.length === 0 ? 'Add tags...' : ''}
          className="flex-1 min-w-[80px] outline-none text-sm bg-transparent text-neutral-900 placeholder:text-neutral-400"
          disabled={isCreating}
        />
      </div>

      {/* Autocomplete dropdown */}
      {isDropdownOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-smooth shadow-lg z-50 max-h-48 overflow-y-auto">
          {suggestions.map((tag) => (
            <button
              key={tag.id}
              type="button"
              onMouseDown={(e) => e.preventDefault()} // prevent blur on input
              onClick={() => handleSelectExisting(tag)}
              className="flex items-center gap-2 w-full text-left px-3 py-1.5 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
            >
              <span
                className="inline-block w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: tag.color }}
              />
              <span className="truncate">{tag.name}</span>
            </button>
          ))}

          {/* "Create new" option when no exact match exists */}
          {!exactMatch && trimmed && (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleCreateNew}
              disabled={isCreating}
              className="flex items-center gap-2 w-full text-left px-3 py-1.5 text-sm text-neutral-500 hover:bg-neutral-50 border-t border-neutral-100 transition-colors disabled:opacity-50"
            >
              <span className="inline-flex items-center justify-center w-3 h-3 flex-shrink-0 text-neutral-400">
                +
              </span>
              <span className="truncate">
                {isCreating
                  ? 'Creating...'
                  : `Create "${trimmed}"`}
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}
