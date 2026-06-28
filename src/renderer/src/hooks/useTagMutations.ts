import { useMutation, useQueryClient } from '@tanstack/react-query'
import { tagApi } from '../lib/ipc'
import type { Tag } from '@shared/tag'

/**
 * Create and delete tag mutations.
 * - createTag invalidates ['tags'] so autocomplete and filter refresh.
 * - deleteTag also invalidates ['tasks'] because CASCADE removes
 *   the deleted tag from all task_tags assignments.
 */
export function useTagMutations() {
  const queryClient = useQueryClient()

  const createTag = useMutation({
    mutationFn: ({ name, color }: { name: string; color: string }) =>
      tagApi.create(name, color),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] })
    },
  })

  const deleteTag = useMutation({
    mutationFn: (id: string) => tagApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] })
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['tasks', 'counts'] })
    },
  })

  return {
    createTag,
    deleteTag,
  }
}

// Re-export Tag for convenience
export type { Tag }
