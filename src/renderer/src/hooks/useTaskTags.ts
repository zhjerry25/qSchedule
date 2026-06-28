import { useMutation, useQueryClient } from '@tanstack/react-query'
import { tagApi } from '../lib/ipc'

/**
 * Add / remove tags from tasks.
 * Both invalidate ['tasks'] and ['tasks', 'counts'] so
 * the card stream and sidebar counts reflect updated tag assignments.
 */
export function useTaskTags() {
  const queryClient = useQueryClient()

  const addTag = useMutation({
    mutationFn: ({ taskId, tagId }: { taskId: string; tagId: string }) =>
      tagApi.addToTask(taskId, tagId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['tasks', 'counts'] })
    },
  })

  const removeTag = useMutation({
    mutationFn: ({ taskId, tagId }: { taskId: string; tagId: string }) =>
      tagApi.removeFromTask(taskId, tagId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['tasks', 'counts'] })
    },
  })

  return {
    addTag,
    removeTag,
  }
}
