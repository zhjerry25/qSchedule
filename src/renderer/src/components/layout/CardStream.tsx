import { useQuery } from '@tanstack/react-query'
import { useUIStore } from '../../stores/ui-store'
import { taskApi } from '../../lib/ipc'
import { VIEW_LABELS, FREQUENCY_LABELS } from '../../lib/constants'
import { EmptyState } from '../ui/EmptyState'

export function CardStream() {
  const activeView = useUIStore((s) => s.activeView)
  const selectedTagIds = useUIStore((s) => s.selectedTagIds)
  const openCreateDialog = useUIStore((s) => s.openCreateDialog)

  const {
    data: tasks,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['tasks', activeView, selectedTagIds],
    queryFn: () =>
      taskApi.list({
        kind: 'todo',
        view: activeView,
        tagIds: selectedTagIds.length > 0 ? selectedTagIds : undefined,
      }),
  })

  // ── Loading ──
  if (isLoading) {
    return (
      <main className="flex-1 flex items-center justify-center bg-neutral-50">
        <p className="text-sm text-neutral-400">Loading...</p>
      </main>
    )
  }

  // ── Error ──
  if (isError) {
    return (
      <main className="flex-1 flex items-center justify-center bg-neutral-50">
        <EmptyState
          title="Something went wrong"
          description={(error as Error)?.message || 'An unexpected error occurred'}
        />
      </main>
    )
  }

  // ── Empty ──
  if (!tasks || tasks.length === 0) {
    return (
      <main className="flex-1 flex items-center justify-center bg-neutral-50">
        <EmptyState
          title={`No tasks for ${VIEW_LABELS[activeView]}`}
          description="Create a new task to get started"
          action={{
            label: 'Create Task',
            onClick: openCreateDialog,
          }}
        />
      </main>
    )
  }

  // ── Data ──
  return (
    <main className="flex-1 overflow-y-auto bg-neutral-50">
      <div className="max-w-2xl mx-auto px-6 py-4 space-y-2">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="p-4 bg-white border border-neutral-200 rounded-smooth"
          >
            <div className="flex items-start gap-3">
              {/* Completion indicator */}
              <span
                className={[
                  'mt-0.5 w-4 h-4 rounded-full border-2 flex-shrink-0',
                  task.completed
                    ? 'bg-neutral-900 border-neutral-900'
                    : 'border-neutral-300',
                ].join(' ')}
              />

              <div className="min-w-0 flex-1">
                <h3
                  className={[
                    'font-medium text-neutral-900',
                    task.completed && 'line-through text-neutral-400',
                  ].join(' ')}
                >
                  {task.title}
                </h3>
                <p className="mt-1 text-xs text-neutral-400">
                  {FREQUENCY_LABELS[task.frequency]}
                  {task.tags.length > 0 && (
                    <>
                      {' '}
                      &middot;{' '}
                      {task.tags.map((t) => t.name).join(', ')}
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
