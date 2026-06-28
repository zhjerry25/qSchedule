import { useTodayTasks } from '../../hooks/useTodayTasks'
import { useCompleteTask } from '../../hooks/useCompleteTask'
import { TodoCheckbox } from '../todo/TodoCheckbox'
import { FrequencyBadge } from '../todo/FrequencyBadge'
import { TagList } from '../tags/TagList'
import type { TaskWithTags } from '@shared/task'

// ── Compact Task Row ──

function CompactTodoCard({ task }: { task: TaskWithTags }) {
  const { toggleComplete, isPending } = useCompleteTask()

  return (
    <div
      className={[
        'flex items-center gap-2 px-1 py-1.5 rounded-smooth',
        'hover:bg-neutral-50 transition-colors',
        task.completed && 'opacity-60',
      ].join(' ')}
    >
      <TodoCheckbox
        checked={task.completed}
        frequency={task.frequency}
        onChange={() => toggleComplete(task)}
        disabled={isPending}
      />
      <span
        className={[
          'flex-1 text-sm text-neutral-800 truncate',
          task.completed && 'line-through text-neutral-400',
        ].join(' ')}
      >
        {task.title}
      </span>
      <FrequencyBadge frequency={task.frequency} />
      <TagList tags={task.tags.slice(0, 2)} />
      {task.counter > 0 && (
        <span className="text-[10px] text-neutral-400 tabular-nums shrink-0">
          {task.counter}&times;
        </span>
      )}
    </div>
  )
}

// ── Skeleton ──

function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-0.5 mt-1 animate-pulse">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-2 px-1 py-1.5">
          <div className="h-5 w-5 rounded-full bg-neutral-200 shrink-0" />
          <div className="flex-1 h-3.5 rounded bg-neutral-200" />
          <div className="h-5 w-12 rounded-full bg-neutral-200 shrink-0" />
        </div>
      ))}
    </div>
  )
}

// ── Empty State ──

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <span className="text-2xl">&#x2714;</span>
      <p className="text-sm text-neutral-500 mt-2">All clear for today</p>
    </div>
  )
}

// ── Error State ──

function ErrorMessage() {
  return (
    <div className="py-8 text-center">
      <p className="text-sm text-red-500">Could not load tasks</p>
    </div>
  )
}

// ── List ──

export function TodayTaskList() {
  const { tasks, isLoading, isError } = useTodayTasks()

  if (isLoading) return <LoadingSkeleton />
  if (isError) return <ErrorMessage />
  if (tasks.length === 0) return <EmptyState />

  return (
    <div className="flex flex-col gap-0.5 mt-1">
      {tasks.map((task) => (
        <CompactTodoCard key={task.id} task={task} />
      ))}
    </div>
  )
}
