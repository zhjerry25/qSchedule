import { useState } from 'react'
import { useUIStore } from '../../stores/ui-store'
import { useTasks } from '../../hooks/useTasks'
import { useTaskMutations } from '../../hooks/useTaskMutations'
import { VIEW_LABELS } from '../../lib/constants'
import { TodoCard } from '../todo/TodoCard'
import { TodoForm } from '../todo/TodoForm'
import { QuickAddInput } from '../todo/QuickAddInput'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { EmptyState } from '../ui/EmptyState'
import type { TaskWithTags } from '@shared/task'

export function CardStream() {
  const activeView = useUIStore((s) => s.activeView)
  const selectedTagIds = useUIStore((s) => s.selectedTagIds)
  const openCreateDialog = useUIStore((s) => s.openCreateDialog)

  const { tasks, isLoading, isError, error } = useTasks(activeView, selectedTagIds)
  const { deleteTask } = useTaskMutations()

  // ── Local UI state ──
  const [editingTask, setEditingTask] = useState<TaskWithTags | null>(null)
  const [deletingTask, setDeletingTask] = useState<TaskWithTags | null>(null)

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
          description={error?.message || 'An unexpected error occurred'}
        />
      </main>
    )
  }

  // ── Empty or Data ──
  return (
    <main className="flex-1 overflow-y-auto bg-neutral-50">
      <div className="max-w-2xl mx-auto px-6 py-4 space-y-4">
        {/* Quick-add input — always visible */}
        <QuickAddInput />

        {/* Task list or empty state */}
        {tasks.length === 0 ? (
          <EmptyState
            title={`No tasks for ${VIEW_LABELS[activeView]}`}
            description="Create a new task to get started"
            action={{
              label: 'Create Task',
              onClick: openCreateDialog,
            }}
          />
        ) : (
          <div className="space-y-2">
            {tasks.map((task) => (
              <TodoCard
                key={task.id}
                task={task}
                onEdit={setEditingTask}
                onDelete={setDeletingTask}
              />
            ))}
          </div>
        )}
      </div>

      {/* Edit dialog */}
      <TodoForm
        open={editingTask !== null}
        onOpenChange={(open) => {
          if (!open) setEditingTask(null)
        }}
        task={editingTask ?? undefined}
      />

      {/* Delete confirmation */}
      <ConfirmDialog
        open={deletingTask !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingTask(null)
        }}
        title="Delete Task"
        description={
          deletingTask
            ? `Delete "${deletingTask.title}"? This action cannot be undone.`
            : ''
        }
        variant="danger"
        confirmLabel="Delete"
        loading={deleteTask.isPending}
        onConfirm={() => {
          if (deletingTask) {
            deleteTask.mutate(deletingTask.id)
            setDeletingTask(null)
          }
        }}
      />
    </main>
  )
}
