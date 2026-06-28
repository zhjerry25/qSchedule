import { useQuery } from '@tanstack/react-query'
import { tagApi } from '../lib/ipc'
import type { Tag } from '@shared/tag'

/**
 * Fetch all tags. Used by TagFilter (sidebar) and TagInput (autocomplete).
 */
export function useTags(): {
  tags: Tag[]
  isLoading: boolean
  isError: boolean
  error: Error | null
} {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['tags'],
    queryFn: () => tagApi.list(),
  })

  return {
    tags: data ?? [],
    isLoading,
    isError,
    error,
  }
}
