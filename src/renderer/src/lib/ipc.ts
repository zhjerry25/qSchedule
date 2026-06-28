import type {
  Task,
  TaskWithTags,
  TaskFilter,
  CreateTaskInput,
  UpdateTaskInput,
} from '@shared/task'
import type { Tag } from '@shared/tag'

/**
 * Unwrap the { data, error } envelope from every IPC handler.
 * Throws if `error` is present so TanStack Query and callers
 * can handle rejections naturally.
 */
async function unwrap<T>(
  promise: Promise<{ data?: T; error?: string }>,
): Promise<T> {
  const result = await promise
  if (result.error !== undefined && result.error !== null) {
    throw new Error(result.error)
  }
  return result.data as T
}

export const taskApi = {
  list: (filter: TaskFilter = {}) =>
    unwrap<TaskWithTags[]>(window.api.task.list(filter)),
  getById: (id: string) =>
    unwrap<TaskWithTags | null>(window.api.task.getById(id)),
  create: (input: CreateTaskInput) =>
    unwrap<Task>(window.api.task.create(input)),
  update: (id: string, input: UpdateTaskInput) =>
    unwrap<Task>(window.api.task.update(id, input)),
  delete: (id: string) =>
    unwrap<void>(window.api.task.delete(id)),
  complete: (id: string) =>
    unwrap<Task>(window.api.task.complete(id)),
  uncomplete: (id: string) =>
    unwrap<Task>(window.api.task.uncomplete(id)),
  getToday: () =>
    unwrap<TaskWithTags[]>(window.api.task.getToday()),
}

export const tagApi = {
  list: () =>
    unwrap<Tag[]>(window.api.tag.list()),
  getById: (id: string) =>
    unwrap<Tag | null>(window.api.tag.getById(id)),
  create: (name: string, color: string) =>
    unwrap<Tag>(window.api.tag.create(name, color)),
  update: (id: string, name: string) =>
    unwrap<Tag>(window.api.tag.update(id, name)),
  delete: (id: string) =>
    unwrap<void>(window.api.tag.delete(id)),
  addToTask: (taskId: string, tagId: string) =>
    unwrap<void>(window.api.tag.addToTask(taskId, tagId)),
  removeFromTask: (taskId: string, tagId: string) =>
    unwrap<void>(window.api.tag.removeFromTask(taskId, tagId)),
  getForTask: (taskId: string) =>
    unwrap<Tag[]>(window.api.tag.getForTask(taskId)),
}

export const windowApi = {
  openMain: () => unwrap<void>(window.api.window.openMain()),
  closePopup: () => unwrap<void>(window.api.window.closePopup()),
}
