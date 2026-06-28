import { useQuery } from '@tanstack/react-query'
import { taskApi } from '../lib/ipc'
import { todayISO, isToday, isThisWeek } from '../lib/date-utils'
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

export function useTasks(tagIds: string[]) {
  const result = useQuery({
    queryKey: ['tasks', 'all', tagIds],
    queryFn: () =>
      taskApi.list({
        kind: 'todo',
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

      // Today: daily tasks + once/deadline tasks due today or overdue
      const todayCount = reset.filter((t) => {
        if (t.frequency === 'daily') return true
        if (t.frequency === 'weekly') return false
        // once / deadline: scheduled_date today or in the past (overdue)
        const refDate = t.scheduled_date ?? t.deadline
        if (refDate) return refDate <= today
        return false
      }).length

      // Week: weekly tasks + once/deadline tasks due later this week (after today)
      const weekCount = reset.filter((t) => {
        if (t.frequency === 'weekly') return true
        if (t.frequency === 'daily') return false // already counted in Today
        // once / deadline: scheduled_date this week, but after today
        const refDate = t.scheduled_date ?? t.deadline
        if (refDate && refDate > today && isThisWeek(refDate)) return true
        return false
      }).length

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
