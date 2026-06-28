import { useMutation, useQueryClient } from '@tanstack/react-query'
import { taskApi } from '../lib/ipc'
import type { CreateTaskInput, UpdateTaskInput, Task } from '@shared/task'

export function useTaskMutations() {
  const queryClient = useQueryClient()

  const createTask = useMutation({
    mutationFn: (input: CreateTaskInput) => taskApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  const updateTask = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTaskInput }) =>
      taskApi.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  const deleteTask = useMutation({
    mutationFn: (id: string) => taskApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  return { createTask, updateTask, deleteTask } as const
}
