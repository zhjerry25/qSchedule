import { TodoCheckbox } from './TodoCheckbox'
import { FrequencyBadge } from './FrequencyBadge'
import { TagList } from '../tags/TagList'
import { formatSmartDate } from '../../lib/date-utils'
import { useI18n } from '../../i18n'
import type { TaskWithTags } from '@shared/task'

interface TodoCardProps {
  task: TaskWithTags
  onEdit: (task: TaskWithTags) => void
  onDelete: (task: TaskWithTags) => void
  onToggleComplete: (task: TaskWithTags) => void
  isCompleting: boolean
}

export function TodoCard({ task, onEdit, onDelete, onToggleComplete, isCompleting }: TodoCardProps) {
  const { t } = useI18n()
  const dateDisplay = formatSmartDate(task.scheduled_date ?? task.deadline)
  const dateLabel = task.frequency === 'deadline' && dateDisplay
    ? `${t.todo.due} ${dateDisplay}`
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
          onChange={() => onToggleComplete(task)}
          disabled={isCompleting}
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

            {/* Tags */}
            <TagList tags={task.tags} />

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
            {t.todo.edit}
          </button>
          <button
            type="button"
            onClick={() => onDelete(task)}
            className="h-7 px-2 text-xs text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-smooth transition-colors"
          >
            {t.todo.delete}
          </button>
        </div>
      </div>
    </div>
  )
}
