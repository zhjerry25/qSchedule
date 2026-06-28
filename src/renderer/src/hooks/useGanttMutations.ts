import { useMutation, useQueryClient } from '@tanstack/react-query'
import { taskApi } from '../lib/ipc'
import type { CreateTaskInput, UpdateTaskInput } from '@shared/task'

// ── useGanttMutations ──

export function useGanttMutations() {
  const queryClient = useQueryClient()

  const createGanttTask = useMutation({
    mutationFn: (input: CreateTaskInput) =>
      taskApi.create({ ...input, kind: 'gantt' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', 'gantt'] })
    },
  })

  const updateGanttTask = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTaskInput }) =>
      taskApi.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', 'gantt'] })
    },
  })

  const deleteGanttTask = useMutation({
    mutationFn: (id: string) => taskApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', 'gantt'] })
    },
  })

  return { createGanttTask, updateGanttTask, deleteGanttTask }
}
