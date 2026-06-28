import { ipcMain } from 'electron'
import { Channels } from '@shared/ipc-channels'
import { taskRepository } from '../repository/task-repository'
import type { TaskFilter, CreateTaskInput, UpdateTaskInput } from '@shared/task'

export function registerTaskHandlers(): void {
  ipcMain.handle(Channels.TASK_LIST, (_event, filter: TaskFilter = {}) => {
    try {
      const tasks = taskRepository.findAll(filter)
      return { data: tasks }
    } catch (err) {
      return {
        error: err instanceof Error ? err.message : 'Unknown error listing tasks',
      }
    }
  })

  ipcMain.handle(Channels.TASK_GET_BY_ID, (_event, id: string) => {
    try {
      const task = taskRepository.findById(id)
      return { data: task }
    } catch (err) {
      return {
        error:
          err instanceof Error ? err.message : 'Unknown error getting task',
      }
    }
  })

  ipcMain.handle(Channels.TASK_CREATE, (_event, input: CreateTaskInput) => {
    try {
      const task = taskRepository.create(input)
      return { data: task }
    } catch (err) {
      return {
        error:
          err instanceof Error ? err.message : 'Unknown error creating task',
      }
    }
  })

  ipcMain.handle(
    Channels.TASK_UPDATE,
    (_event, { id, input }: { id: string; input: UpdateTaskInput }) => {
      try {
        const task = taskRepository.update(id, input)
        return { data: task }
      } catch (err) {
        return {
          error:
            err instanceof Error ? err.message : 'Unknown error updating task',
        }
      }
    },
  )

  ipcMain.handle(Channels.TASK_DELETE, (_event, id: string) => {
    try {
      taskRepository.remove(id)
      return { data: undefined }
    } catch (err) {
      return {
        error:
          err instanceof Error ? err.message : 'Unknown error deleting task',
      }
    }
  })

  ipcMain.handle(Channels.TASK_COMPLETE, (_event, id: string) => {
    try {
      const task = taskRepository.complete(id)
      return { data: task }
    } catch (err) {
      return {
        error:
          err instanceof Error
            ? err.message
            : 'Unknown error completing task',
      }
    }
  })

  ipcMain.handle(Channels.TASK_UNCOMPLETE, (_event, id: string) => {
    try {
      const task = taskRepository.uncomplete(id)
      return { data: task }
    } catch (err) {
      return {
        error:
          err instanceof Error
            ? err.message
            : 'Unknown error uncompleting task',
      }
    }
  })

  ipcMain.handle(Channels.TASK_GET_TODAY, () => {
    try {
      const tasks = taskRepository.getTodayTasks()
      return { data: tasks }
    } catch (err) {
      return {
        error:
          err instanceof Error
            ? err.message
            : 'Unknown error getting today tasks',
      }
    }
  })
}
