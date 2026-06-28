import { useQuery } from '@tanstack/react-query'
import { taskApi } from '../lib/ipc'
import { applyDynamicReset } from '../lib/task-transforms'
import type { TaskWithTags } from '@shared/task'

/**
 * Fetch today's tasks with dynamic reset applied in the select transform.
 * Query key uses ['tasks'] prefix so useCompleteTask's optimistic updates
 * and cache invalidations automatically match this query.
 */
export function useTodayTasks() {
  const result = useQuery({
    queryKey: ['tasks', 'today'],
    queryFn: () => taskApi.getToday(),
    select: applyDynamicReset,
  })

  return {
    tasks: result.data ?? [],
    isLoading: result.isLoading,
    isError: result.isError,
    error: result.error as Error | null,
  }
}
