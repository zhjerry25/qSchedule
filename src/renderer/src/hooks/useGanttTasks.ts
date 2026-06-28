import { useQuery } from '@tanstack/react-query'
import { taskApi } from '../lib/ipc'

// ── useGanttTasks ──

export function useGanttTasks(tagIds: string[]) {
  const result = useQuery({
    queryKey: ['tasks', 'gantt', tagIds],
    queryFn: () =>
      taskApi.list({
        kind: 'gantt',
        tagIds: tagIds.length > 0 ? tagIds : undefined,
      }),
  })

  return {
    tasks: result.data ?? [],
    isLoading: result.isLoading,
    isError: result.isError,
    error: result.error as Error | null,
  }
}
