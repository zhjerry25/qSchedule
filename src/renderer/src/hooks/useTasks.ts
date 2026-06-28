import { useQuery } from '@tanstack/react-query'
import { taskApi } from '../lib/ipc'
import { applyDynamicReset } from '../lib/task-transforms'

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
