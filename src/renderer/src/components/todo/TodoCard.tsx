import { useState } from 'react'
import { TodoCheckbox } from './TodoCheckbox'
import { FrequencyBadge } from './FrequencyBadge'
import { useCompleteTask } from '../../hooks/useCompleteTask'
import type { TaskWithTags } from '@shared/task'

interface TodoCardProps {
  task: TaskWithTags
  onEdit: (task: TaskWithTags) => void
  onDelete: (task: TaskWithTags) => void
}

function formatDate(dateStr: string | null): string | null {
  if (!dateStr) return null
  const date = new Date(dateStr + 'T00:00:00')
  if (isNaN(date.getTime())) return dateStr

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const diffDays = Math.round(
    (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  )

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Tomorrow'
  if (diffDays === -1) return 'Yesterday'

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

export function TodoCard({ task, onEdit, onDelete }: TodoCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const { toggleComplete, isPending } = useCompleteTask()

  const dateDisplay = formatDate(task.scheduled_date ?? task.deadline)
  const dateLabel = task.frequency === 'deadline' && dateDisplay
    ? `Due ${dateDisplay}`
    : dateDisplay

  return (
    <div
      className={[
        'group p-4 bg-white border border-neutral-200 rounded-smooth transition-colors',
        'hover:border-neutral-300',
        task.completed && 'opacity-80',
      ].join(' ')}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <TodoCheckbox
          checked={task.completed}
          frequency={task.frequency}
          onChange={() => toggleComplete(task)}
          disabled={isPending}
        />

        {/* Content */}
        <div className="min-w-0 flex-1">
          {/* Title */}
          <h3
            className={[
              'font-medium text-neutral-900',
              task.completed && 'line-through text-neutral-400',
            ].join(' ')}
          >
            {task.title}
          </h3>

          {/* Description */}
          {task.description && (
            <p
              className={[
                'mt-0.5 text-sm text-neutral-500 line-clamp-2',
                task.completed && 'line-through text-neutral-400',
              ].join(' ')}
            >
              {task.description}
            </p>
          )}

          {/* Badge row */}
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            <FrequencyBadge frequency={task.frequency} />

            {/* Tags (rendered as simple chips until Phase 5 TagBadge) */}
            {task.tags.map((tag) => (
              <span
                key={tag.id}
                className="text-xs text-neutral-400"
                style={{ color: tag.color }}
              >
                #{tag.name}
              </span>
            ))}

            {/* Date */}
            {dateLabel && (
              <span className="text-xs text-neutral-400">{dateLabel}</span>
            )}

            {/* Counter */}
            {task.counter > 0 && (
              <span className="text-xs text-neutral-400 tabular-nums">
                &middot; {task.counter}&times;
              </span>
            )}
          </div>
        </div>

        {/* Actions — visible on hover */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button
            type="button"
            onClick={() => onEdit(task)}
            className="h-7 px-2 text-xs text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-smooth transition-colors"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(task)}
            className="h-7 px-2 text-xs text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-smooth transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
