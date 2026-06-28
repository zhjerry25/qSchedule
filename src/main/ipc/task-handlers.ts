import { ipcMain } from 'electron'
import { Channels } from '@shared/ipc-channels'
import { taskRepository } from '../repository/task-repository'
import { wrapHandler } from './helper'
import { createTaskInputSchema, updateTaskInputSchema } from '@shared/validation'
import type { TaskFilter } from '@shared/task'

export function registerTaskHandlers(): void {
  ipcMain.handle(Channels.TASK_LIST, wrapHandler(
    (_event, filter: TaskFilter = {}) => taskRepository.findAll(filter),
  ))

  ipcMain.handle(Channels.TASK_GET_BY_ID, wrapHandler(
    (_event, id: string) => taskRepository.findById(id),
  ))

  ipcMain.handle(Channels.TASK_CREATE, wrapHandler(
    (_event, input) => taskRepository.create(input),
    createTaskInputSchema,
  ))

  ipcMain.handle(Channels.TASK_UPDATE, wrapHandler(
    (_event, payload) => taskRepository.update(payload.id, payload.input),
    updateTaskInputSchema,
  ))

  ipcMain.handle(Channels.TASK_DELETE, wrapHandler(
    (_event, id: string) => { taskRepository.remove(id) },
  ))

  ipcMain.handle(Channels.TASK_COMPLETE, wrapHandler(
    (_event, id: string) => taskRepository.complete(id),
  ))

  ipcMain.handle(Channels.TASK_UNCOMPLETE, wrapHandler(
    (_event, id: string) => taskRepository.uncomplete(id),
  ))

  ipcMain.handle(Channels.TASK_GET_TODAY, wrapHandler(
    () => taskRepository.getTodayTasks(),
  ))
}
