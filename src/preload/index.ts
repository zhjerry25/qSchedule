import { contextBridge, ipcRenderer } from 'electron'
import type { TaskFilter, CreateTaskInput, UpdateTaskInput } from '@shared/task'

const api = {
  task: {
    list: (filter?: TaskFilter) =>
      ipcRenderer.invoke('task:list', filter ?? {}),
    getById: (id: string) =>
      ipcRenderer.invoke('task:get-by-id', id),
    create: (input: CreateTaskInput) =>
      ipcRenderer.invoke('task:create', input),
    update: (id: string, input: UpdateTaskInput) =>
      ipcRenderer.invoke('task:update', { id, input }),
    delete: (id: string) =>
      ipcRenderer.invoke('task:delete', id),
    complete: (id: string) =>
      ipcRenderer.invoke('task:complete', id),
    uncomplete: (id: string) =>
      ipcRenderer.invoke('task:uncomplete', id),
    getToday: () =>
      ipcRenderer.invoke('task:get-today'),
  },

  tag: {
    list: () =>
      ipcRenderer.invoke('tag:list'),
    getById: (id: string) =>
      ipcRenderer.invoke('tag:get-by-id', id),
    create: (name: string, color: string) =>
      ipcRenderer.invoke('tag:create', { name, color }),
    update: (id: string, name: string) =>
      ipcRenderer.invoke('tag:update', { id, name }),
    delete: (id: string) =>
      ipcRenderer.invoke('tag:delete', id),
    addToTask: (taskId: string, tagId: string) =>
      ipcRenderer.invoke('tag:add-to-task', { taskId, tagId }),
    removeFromTask: (taskId: string, tagId: string) =>
      ipcRenderer.invoke('tag:remove-from-task', { taskId, tagId }),
    getForTask: (taskId: string) =>
      ipcRenderer.invoke('tag:get-for-task', taskId),
  },

  window: {
    openMain: () => ipcRenderer.invoke('window:open-main'),
    closePopup: () => ipcRenderer.invoke('window:close-popup'),
  },

  ping: () => ipcRenderer.invoke('ping'),
}

contextBridge.exposeInMainWorld('api', api)

export type IpcApi = typeof api
