import { useQuery } from '@tanstack/react-query'
import { taskApi } from '../lib/ipc'
import { todayISO, isToday, isThisWeek } from '../lib/date-utils'
import type { View } from '../lib/constants'
import type { TaskWithTags } from '@shared/task'

// ── Dynamic Reset Transform ──

/**
 * Apply dynamic reset: daily/weekly tasks whose completed_at date is stale
 * are shown as incomplete in the UI. This NEVER mutates the database —
 * `completed` and `counter` remain true values in SQLite.
 */
function applyDynamicReset(tasks: TaskWithTags[]): TaskWithTags[] {
  const today = todayISO()
  return tasks.map((task) => {
    if (!task.completed || !task.completed_at) return task

    if (task.frequency === 'daily' && !isToday(task.completed_at)) {
      return { ...task, completed: false, completed_at: null }
    }
    if (task.frequency === 'weekly' && !isThisWeek(task.completed_at)) {
      return { ...task, completed: false, completed_at: null }
    }
    return task
  })
}

// ── useTasks ──

export function useTasks(view: View, tagIds: string[]) {
  const result = useQuery({
    queryKey: ['tasks', view, tagIds],
    queryFn: () =>
      taskApi.list({
        kind: 'todo',
        view,
        tagIds: tagIds.length > 0 ? tagIds : undefined,
      }),
    select: applyDynamicReset,
  })

  return {
    tasks: result.data ?? [],
    isLoading: result.isLoading,
    isError: result.isError,
    error: result.error as Error | null,
  }
}

// ── useTaskCounts ──

export function useTaskCounts() {
  const result = useQuery({
    queryKey: ['tasks', 'counts'],
    queryFn: () => taskApi.list({ kind: 'todo' }),
    select: (tasks: TaskWithTags[]) => {
      const today = todayISO()
      const reset = applyDynamicReset(tasks)

      const todayCount = reset.filter((t) => t.scheduled_date === today).length
      const weekCount = reset.filter((t) => isThisWeek(t.scheduled_date)).length
      const allCount = reset.length

      return { today: todayCount, week: weekCount, all: allCount }
    },
  })

  return {
    today: result.data?.today ?? 0,
    week: result.data?.week ?? 0,
    all: result.data?.all ?? 0,
    isLoading: result.isLoading,
  }
}
