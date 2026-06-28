import { useState } from 'react'
import { useGanttTasks } from '../../hooks/useGanttTasks'
import { useGanttMutations } from '../../hooks/useGanttMutations'
import { useUIStore } from '../../stores/ui-store'
import { GanttPanel } from './GanttPanel'
import { EmptyState } from '../ui/EmptyState'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { useI18n } from '../../i18n'
import type { TaskWithTags } from '@shared/task'

export function GanttApp() {
  const selectedTagIds = useUIStore((s) => s.selectedTagIds)
  const openGanttForm = useUIStore((s) => s.openGanttForm)
  const { tasks, isLoading, isError } = useGanttTasks(selectedTagIds)
  const { deleteGanttTask, updateGanttTask } = useGanttMutations()
  const { t } = useI18n()

  const [deletingTask, setDeletingTask] = useState<TaskWithTags | null>(null)

  const handleAddTask = () => {
    openGanttForm()
  }

  const handleEditTask = (task: TaskWithTags) => {
    openGanttForm(task)
  }

  const handleDeleteTask = (task: TaskWithTags) => {
    setDeletingTask(task)
  }

  const handleConfirmDelete = async () => {
    if (!deletingTask) return
    try {
      await deleteGanttTask.mutateAsync(deletingTask.id)
    } catch {
      // Error surfaced via mutation state
    } finally {
      setDeletingTask(null)
    }
  }

  const handleUpdateTask = async (
    id: string,
    input: { start_date?: string | null; end_date?: string | null },
  ) => {
    try {
      await updateGanttTask.mutateAsync({ id, input })
    } catch {
      // Error surfaced via mutation state
    }
  }

  const handleCreateDependency = async (childId: string, parentId: string) => {
    try {
      await updateGanttTask.mutateAsync({ id: childId, input: { parent_id: parentId } })
    } catch {
      // Error surfaced via mutation state
    }
  }

  // ── Loading state ──
  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col">
        {/* Toolbar skeleton */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-200 bg-white">
          <div className="flex items-center gap-2">
            <div className="h-7 w-32 bg-neutral-100 rounded-smooth animate-pulse" />
            <div className="h-7 w-20 bg-neutral-100 rounded-smooth animate-pulse" />
          </div>
          <div className="h-8 w-28 bg-neutral-100 rounded-smooth animate-pulse" />
        </div>
        {/* Timeline skeleton */}
        <div className="flex-1 p-8 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-10 bg-neutral-100 rounded-smooth animate-pulse"
              style={{ width: `${40 + Math.random() * 50}%` }}
            />
          ))}
        </div>
      </div>
    )
  }

  // ── Error state ──
  if (isError) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <EmptyState
          title={t.gantt.errorLoading}
          description={t.error.somethingWentWrong}
        />
      </div>
    )
  }

  // ── Empty state ──
  if (tasks.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <EmptyState
          title={t.gantt.emptyTitle}
          description={t.gantt.emptyDesc}
          action={{
            label: t.gantt.createFirst,
            onClick: handleAddTask,
          }}
        />
      </div>
    )
  }

  // ── Gantt timeline view ──
  return (
    <>
      <GanttPanel
        tasks={tasks}
        onAddTask={handleAddTask}
        onEditTask={handleEditTask}
        onDeleteTask={handleDeleteTask}
        onUpdateTask={handleUpdateTask}
        onCreateDependency={handleCreateDependency}
      />
      <ConfirmDialog
        open={deletingTask !== null}
        onOpenChange={(open) => { if (!open) setDeletingTask(null) }}
        title={t.gantt.deleteTask}
        description={deletingTask
          ? t.gantt.deleteConfirm.replace('{title}', deletingTask.title)
          : ''}
        confirmLabel={t.todo.delete}
        onConfirm={handleConfirmDelete}
        variant="danger"
        loading={deleteGanttTask.isPending}
      />
    </>
  )
}
