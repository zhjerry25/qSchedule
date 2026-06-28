import { contextBridge, ipcRenderer } from 'electron'
import type { TaskFilter, CreateTaskInput, UpdateTaskInput } from '@shared/task'
import { Channels } from '@shared/ipc-channels'

const api = {
  task: {
    list: (filter?: TaskFilter) =>
      ipcRenderer.invoke(Channels.TASK_LIST, filter ?? {}),
    getById: (id: string) =>
      ipcRenderer.invoke(Channels.TASK_GET_BY_ID, id),
    create: (input: CreateTaskInput) =>
      ipcRenderer.invoke(Channels.TASK_CREATE, input),
    update: (id: string, input: UpdateTaskInput) =>
      ipcRenderer.invoke(Channels.TASK_UPDATE, { id, input }),
    delete: (id: string) =>
      ipcRenderer.invoke(Channels.TASK_DELETE, id),
    complete: (id: string) =>
      ipcRenderer.invoke(Channels.TASK_COMPLETE, id),
    uncomplete: (id: string) =>
      ipcRenderer.invoke(Channels.TASK_UNCOMPLETE, id),
    getToday: () =>
      ipcRenderer.invoke(Channels.TASK_GET_TODAY),
  },

  tag: {
    list: () =>
      ipcRenderer.invoke(Channels.TAG_LIST),
    getById: (id: string) =>
      ipcRenderer.invoke(Channels.TAG_GET_BY_ID, id),
    create: (name: string, color: string) =>
      ipcRenderer.invoke(Channels.TAG_CREATE, { name, color }),
    update: (id: string, name: string) =>
      ipcRenderer.invoke(Channels.TAG_UPDATE, { id, name }),
    delete: (id: string) =>
      ipcRenderer.invoke(Channels.TAG_DELETE, id),
    addToTask: (taskId: string, tagId: string) =>
      ipcRenderer.invoke(Channels.TAG_ADD_TO_TASK, { taskId, tagId }),
    removeFromTask: (taskId: string, tagId: string) =>
      ipcRenderer.invoke(Channels.TAG_REMOVE_FROM_TASK, { taskId, tagId }),
    getForTask: (taskId: string) =>
      ipcRenderer.invoke(Channels.TAG_GET_FOR_TASK, taskId),
  },

  window: {
    openMain: () => ipcRenderer.invoke(Channels.WINDOW_OPEN_MAIN),
    closePopup: () => ipcRenderer.invoke(Channels.WINDOW_CLOSE_POPUP),
  },
}

contextBridge.exposeInMainWorld('api', api)

export type IpcApi = typeof api
