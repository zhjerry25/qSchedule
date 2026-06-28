import type {
  Task,
  TaskWithTags,
  TaskFilter,
  CreateTaskInput,
  UpdateTaskInput,
} from '@shared/task'
import type { Tag } from '@shared/tag'

interface IpcResult<T> {
  data?: T
  error?: string
}

export interface IpcApi {
  task: {
    list(filter?: TaskFilter): Promise<IpcResult<TaskWithTags[]>>
    getById(id: string): Promise<IpcResult<TaskWithTags | null>>
    create(input: CreateTaskInput): Promise<IpcResult<Task>>
    update(id: string, input: UpdateTaskInput): Promise<IpcResult<Task>>
    delete(id: string): Promise<IpcResult<void>>
    complete(id: string): Promise<IpcResult<Task>>
    uncomplete(id: string): Promise<IpcResult<Task>>
    getToday(): Promise<IpcResult<TaskWithTags[]>>
  }
  tag: {
    list(): Promise<IpcResult<Tag[]>>
    getById(id: string): Promise<IpcResult<Tag | null>>
    create(name: string, color: string): Promise<IpcResult<Tag>>
    update(id: string, name: string): Promise<IpcResult<Tag>>
    delete(id: string): Promise<IpcResult<void>>
    addToTask(taskId: string, tagId: string): Promise<IpcResult<void>>
    removeFromTask(taskId: string, tagId: string): Promise<IpcResult<void>>
    getForTask(taskId: string): Promise<IpcResult<Tag[]>>
  }
  window: {
    openMain(): Promise<IpcResult<void>>
    closePopup(): Promise<IpcResult<void>>
  }
}

declare global {
  interface Window {
    api: IpcApi
  }
}
