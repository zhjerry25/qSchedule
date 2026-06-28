import { TodoCheckbox } from '../todo/TodoCheckbox'
import { TagList } from '../tags/TagList'
import { FREQUENCY_COLORS } from '../../lib/constants'
import { useI18n } from '../../i18n'
import type { Frequency, TaskWithTags } from '@shared/task'

interface FrequencyCardProps {
  frequency: Frequency
  tasks: TaskWithTags[]
  onEdit: (task: TaskWithTags) => void
  onDelete: (task: TaskWithTags) => void
  onToggleComplete: (task: TaskWithTags) => void
  isCompleting: boolean
}

/**
 * A card/panel grouping tasks of a single frequency.
 * Used inside SectionPanel for the whiteboard/dashboard layout.
 */
export function FrequencyCard({
  frequency,
  tasks,
  onEdit,
  onDelete,
  onToggleComplete,
  isCompleting,
}: FrequencyCardProps) {
  const { t } = useI18n()
  const colors = FREQUENCY_COLORS[frequency]

  return (
    <div className="bg-white border border-neutral-200 rounded-smooth overflow-hidden">
      {/* Colored accent stripe + header */}
      <div className={['h-1', colors.dot].join(' ')} />
      <div className="px-4 py-2 flex items-center gap-2 border-b border-neutral-100">
        <span className="text-xs font-semibold text-neutral-700">
          {t.frequency[frequency]}
        </span>
        <span className="text-[10px] text-neutral-400 tabular-nums">
          {tasks.length}
        </span>
      </div>

      {/* Task list */}
      <div className="px-2 py-1 max-h-[240px] overflow-y-auto">
        {tasks.length === 0 ? (
          <p className="text-xs text-neutral-300 italic px-2 py-3 text-center">
            {t.empty.noTasks}
          </p>
        ) : (
          <div className="space-y-0.5">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={[
                  'group flex items-center gap-2 px-2 py-1.5 rounded-smooth',
                  'hover:bg-neutral-50 transition-colors',
                  task.completed && 'opacity-60',
                ].join(' ')}
              >
                <TodoCheckbox
                  checked={task.completed}
                  frequency={task.frequency}
                  onChange={() => onToggleComplete(task)}
                  disabled={isCompleting}
                />
                <div className="flex-1 min-w-0">
                  <span
                    className={[
                      'text-sm text-neutral-800 truncate block',
                      task.completed && 'line-through text-neutral-400',
                    ].join(' ')}
                  >
                    {task.title}
                  </span>
                  {task.description && (
                    <span className="text-[11px] text-neutral-400 truncate block mt-0.5">
                      {task.description}
                    </span>
                  )}
                </div>
                <TagList tags={task.tags.slice(0, 2)} />
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button
                    type="button"
                    onClick={() => onEdit(task)}
                    className="h-6 px-1.5 text-[10px] text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-smooth transition-colors"
                  >
                    {t.todo.edit}
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(task)}
                    className="h-6 px-1.5 text-[10px] text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-smooth transition-colors"
                  >
                    {t.todo.delete}
                  </button>
                </div>
                {task.counter > 0 && (
                  <span className="text-[10px] text-neutral-400 tabular-nums shrink-0">
                    {task.counter}&times;
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
