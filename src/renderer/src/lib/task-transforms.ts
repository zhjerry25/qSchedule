import { isToday, isThisWeek } from './date-utils'
import type { TaskWithTags } from '@shared/task'

/**
 * Apply dynamic reset: daily/weekly tasks whose completed_at date is stale
 * are shown as incomplete in the UI. This NEVER mutates the database —
 * `completed` and `counter` remain true values in SQLite.
 */
export function applyDynamicReset(tasks: TaskWithTags[]): TaskWithTags[] {
  return tasks
    .filter((task) => {
      // Hide completed "once" tasks from previous days
      if (task.frequency === 'once' && task.completed && task.completed_at) {
        return isToday(task.completed_at)
      }
      // Hide completed "deadline" tasks from previous days
      if (task.frequency === 'deadline' && task.completed && task.completed_at) {
        return isToday(task.completed_at)
      }
      return true
    })
    .map((task) => {
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
