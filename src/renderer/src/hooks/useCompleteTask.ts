import { useMutation, useQueryClient } from '@tanstack/react-query'
import { taskApi } from '../lib/ipc'
import type { TaskWithTags } from '@shared/task'

export function useCompleteTask() {
  const queryClient = useQueryClient()

  const completeMutation = useMutation({
    mutationFn: (id: string) => taskApi.complete(id),
    onMutate: async (id) => {
      // Cancel outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ['tasks'] })

      // Snapshot current state for rollback
      const previousQueries = queryClient.getQueriesData({
        queryKey: ['tasks'],
      })

      // Optimistically update all task query caches
      queryClient.setQueriesData<TaskWithTags[]>(
        { queryKey: ['tasks'] },
        (old) => {
          if (!Array.isArray(old)) return old
          return old.map((t) =>
            t.id === id
              ? {
                  ...t,
                  completed: true,
                  completed_at: new Date().toISOString(),
                  counter: t.counter + 1,
                }
              : t,
          )
        },
      )

      return { previousQueries }
    },
    onError: (_err, _id, context) => {
      // Roll back to pre-mutation snapshot
      if (context?.previousQueries) {
        for (const [key, data] of context.previousQueries) {
          queryClient.setQueryData(key, data)
        }
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  const uncompleteMutation = useMutation({
    mutationFn: (id: string) => taskApi.uncomplete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] })

      const previousQueries = queryClient.getQueriesData({
        queryKey: ['tasks'],
      })

      queryClient.setQueriesData<TaskWithTags[]>(
        { queryKey: ['tasks'] },
        (old) => {
          if (!Array.isArray(old)) return old
          return old.map((t) =>
            t.id === id
              ? { ...t, completed: false, completed_at: null }
              : t,
          )
        },
      )

      return { previousQueries }
    },
    onError: (_err, _id, context) => {
      if (context?.previousQueries) {
        for (const [key, data] of context.previousQueries) {
          queryClient.setQueryData(key, data)
        }
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  const toggleComplete = (task: TaskWithTags) => {
    if (task.completed) {
      uncompleteMutation.mutate(task.id)
    } else {
      completeMutation.mutate(task.id)
    }
  }

  return {
    toggleComplete,
    isPending: completeMutation.isPending || uncompleteMutation.isPending,
  }
}
