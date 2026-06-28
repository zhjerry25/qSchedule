import { useState, useEffect } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Input } from '../ui/Input'
import { Textarea } from '../ui/Textarea'
import { DatePicker } from '../todo/DatePicker'
import { TagInput } from '../tags/TagInput'
import { useGanttMutations } from '../../hooks/useGanttMutations'
import { useGanttTasks } from '../../hooks/useGanttTasks'
import { useTags } from '../../hooks/useTags'
import { useTagMutations } from '../../hooks/useTagMutations'
import { assignColor } from '../../lib/color-palette'
import { tagApi } from '../../lib/ipc'
import { useI18n } from '../../i18n'
import type { TaskWithTags } from '@shared/task'
import type { Tag } from '@shared/tag'

interface GanttFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task?: TaskWithTags | null
}

export function GanttForm({ open, onOpenChange, task }: GanttFormProps) {
  const isEdit = task !== undefined && task !== null
  const { createGanttTask, updateGanttTask } = useGanttMutations()
  const { tasks: ganttTasks } = useGanttTasks([])
  const { tags: allTags } = useTags()
  const { createTag } = useTagMutations()
  const queryClient = useQueryClient()
  const { t } = useI18n()

  // Load existing tags when editing
  const { data: existingTags = [] } = useQuery({
    queryKey: task?.id
      ? (['tags', 'for-task', task.id] as const)
      : (['tags', 'for-task'] as const),
    queryFn: () => {
      if (!task) return []
      return tagApi.getForTask(task.id)
    },
    enabled: isEdit && open,
  })

  // ── Form state ──
  const [title, setTitle] = useState('')
  const [startDate, setStartDate] = useState<string | null>(null)
  const [endDate, setEndDate] = useState<string | null>(null)
  const [milestoneDate, setMilestoneDate] = useState<string | null>(null)
  const [isMilestone, setIsMilestone] = useState(false)
  const [parentId, setParentId] = useState<string | null>(null)
  const [description, setDescription] = useState('')
  const [selectedTags, setSelectedTags] = useState<Tag[]>([])
  const [tagError, setTagError] = useState<string | null>(null)

  // ── Reset form on open / task change ──
  useEffect(() => {
    if (open) {
      setTitle(task?.title ?? '')
      setStartDate(task?.start_date ?? null)
      setEndDate(task?.end_date ?? null)
      setMilestoneDate(task?.milestone_date ?? null)
      setIsMilestone(task?.is_milestone ?? false)
      setParentId(task?.parent_id ?? null)
      setDescription(task?.description ?? '')
      setSelectedTags([])
      setTagError(null)
    }
  }, [open, task])

  // ── Sync tags from DB when editing ──
  useEffect(() => {
    if (isEdit && existingTags.length > 0) {
      setSelectedTags(existingTags)
    }
  }, [isEdit, existingTags])

  // ── Derived ──
  const titleValid = title.trim().length > 0
  const isPending = createGanttTask.isPending || updateGanttTask.isPending || createTag.isPending

  // Parent task options (exclude self in edit mode)
  const parentOptions = ganttTasks.filter(
    (t) => !isEdit || t.id !== task!.id,
  )

  // ── Tag helpers ──
  const handleCreateTag = async (name: string): Promise<Tag> => {
    const color = assignColor(name)
    return await createTag.mutateAsync({ name, color })
  }

  async function syncTags(
    taskId: string,
    oldTags: Tag[],
    newTags: Tag[],
  ): Promise<void> {
    const oldIds = new Set(oldTags.map((t) => t.id))
    const newIds = new Set(newTags.map((t) => t.id))

    for (const tag of newTags) {
      if (!oldIds.has(tag.id)) {
        await tagApi.addToTask(taskId, tag.id)
      }
    }
    for (const tag of oldTags) {
      if (!newIds.has(tag.id)) {
        await tagApi.removeFromTask(taskId, tag.id)
      }
    }
  }

  // ── Submit ──
  const handleSubmit = async () => {
    if (!titleValid) return
    setTagError(null)

    // Validate date range (skip for milestones — only start_date needed)
    if (!isMilestone && startDate && endDate && startDate > endDate) return

    try {
      if (isEdit) {
        await updateGanttTask.mutateAsync({
          id: task!.id,
          input: {
            title: title.trim(),
            description: description.trim() || undefined,
            start_date: startDate,
            end_date: endDate,
            milestone_date: isMilestone ? milestoneDate : null,
            is_milestone: isMilestone,
            parent_id: parentId,
          },
        })
        // Diff and sync tags
        try {
          await syncTags(task!.id, existingTags, selectedTags)
        } catch (err) {
          setTagError(
            t.error.tagSyncFailed.replace('{error}', err instanceof Error ? err.message : ''),
          )
        }
      } else {
        const newTask = await createGanttTask.mutateAsync({
          id: crypto.randomUUID(),
          title: title.trim(),
          kind: 'gantt',
          frequency: 'once', // Gantt tasks don't repeat; frequency is a schema constraint
          description: description.trim() || undefined,
          start_date: startDate,
          end_date: endDate,
          milestone_date: isMilestone ? milestoneDate : null,
          is_milestone: isMilestone,
          parent_id: parentId,
        })
        // Assign all selected tags to the new task
        try {
          for (const tag of selectedTags) {
            await tagApi.addToTask(newTask.id, tag.id)
          }
        } catch (err) {
          setTagError(
            t.error.tagAssignFailed.replace('{error}', err instanceof Error ? err.message : ''),
          )
        }
      }

      // Refresh task lists to show updated tags
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      onOpenChange(false)
    } catch {
      // Task-level mutation errors are surfaced via mutation.error below.
    }
  }

  // ── Error display ──
  const mutationError =
    createGanttTask.error?.message ?? updateGanttTask.error?.message ?? null

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/20 data-[state=open]:animate-in data-[state=closed]:animate-out" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-smooth shadow-lg p-6 focus:outline-none max-h-[90vh] overflow-y-auto">
          <Dialog.Title className="text-lg font-semibold text-neutral-900">
            {isEdit ? t.gantt.editTask : t.gantt.newTask}
          </Dialog.Title>

          <div className="mt-4 space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                {t.gantt.title}
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t.gantt.titlePlaceholder}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && titleValid) {
                    e.preventDefault()
                    handleSubmit()
                  }
                }}
              />
            </div>

            {/* Milestone toggle */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isMilestone}
                onChange={(e) => {
                  setIsMilestone(e.target.checked)
                }}
                disabled={isPending}
                className="h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-400"
              />
              <span className="text-sm font-medium text-neutral-700">
                {t.gantt.milestone}
              </span>
            </label>

            {/* Date range */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  {t.gantt.startDate}
                </label>
                <DatePicker
                  value={startDate}
                  onChange={setStartDate}
                  placeholder={t.todo.pickDate}
                  disabled={isPending}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  {t.gantt.endDate}
                </label>
                <DatePicker
                  value={endDate}
                  onChange={setEndDate}
                  placeholder={t.todo.pickDate}
                  disabled={isPending}
                  minDate={startDate ? new Date(startDate + 'T00:00:00') : undefined}
                />
              </div>
            </div>

            {/* Milestone date — only when milestone is checked */}
            {isMilestone && (
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  {t.gantt.milestoneDate || 'Milestone Date'}
                </label>
                <DatePicker
                  value={milestoneDate}
                  onChange={setMilestoneDate}
                  placeholder={t.todo.pickDate}
                  disabled={isPending}
                />
              </div>
            )}

            {/* Parent task selector */}
            {parentOptions.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  {t.gantt.parentTask}
                </label>
                <select
                  value={parentId ?? ''}
                  onChange={(e) => setParentId(e.target.value || null)}
                  disabled={isPending}
                  className="w-full h-9 px-3 text-sm rounded-smooth border border-neutral-200 bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:border-transparent disabled:opacity-50"
                >
                  <option value="">{t.gantt.noParent}</option>
                  {parentOptions.map((pt) => (
                    <option key={pt.id} value={pt.id}>
                      {pt.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                {t.gantt.description}{' '}
                <span className="text-neutral-400 font-normal">{t.todo.optional}</span>
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t.gantt.descriptionPlaceholder}
                disabled={isPending}
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                {t.gantt.tags}{' '}
                <span className="text-neutral-400 font-normal">{t.todo.optional}</span>
              </label>
              <TagInput
                value={selectedTags}
                onChange={setSelectedTags}
                existingTags={allTags}
                onCreateTag={handleCreateTag}
              />
            </div>

            {/* Mutation error */}
            {mutationError && (
              <p className="text-sm text-rose-500 bg-rose-50 px-3 py-2 rounded-smooth">
                {mutationError}
              </p>
            )}

            {/* Tag sync warning */}
            {tagError && (
              <p className="text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-smooth">
                {tagError}
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className="inline-flex items-center justify-center h-9 px-4 text-sm font-medium text-neutral-700 bg-neutral-100 rounded-smooth hover:bg-neutral-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 disabled:opacity-50"
            >
              {t.gantt.cancel}
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!titleValid || isPending}
              className="inline-flex items-center justify-center h-9 px-4 text-sm font-medium text-white bg-neutral-900 rounded-smooth hover:bg-neutral-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 disabled:opacity-50"
            >
              {isPending ? t.gantt.saving : isEdit ? t.gantt.save : t.gantt.create}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
