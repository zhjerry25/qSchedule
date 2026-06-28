import { ipcMain } from 'electron'
import { Channels } from '@shared/ipc-channels'
import { tagRepository } from '../repository/tag-repository'

export function registerTagHandlers(): void {
  ipcMain.handle(Channels.TAG_LIST, () => {
    try {
      const tags = tagRepository.findAll()
      return { data: tags }
    } catch (err) {
      return {
        error:
          err instanceof Error ? err.message : 'Unknown error listing tags',
      }
    }
  })

  ipcMain.handle(Channels.TAG_GET_BY_ID, (_event, id: string) => {
    try {
      const tag = tagRepository.findById(id)
      return { data: tag }
    } catch (err) {
      return {
        error:
          err instanceof Error ? err.message : 'Unknown error getting tag',
      }
    }
  })

  ipcMain.handle(
    Channels.TAG_CREATE,
    (_event, { name, color }: { name: string; color: string }) => {
      try {
        const tag = tagRepository.create(name, color)
        return { data: tag }
      } catch (err) {
        return {
          error:
            err instanceof Error ? err.message : 'Unknown error creating tag',
        }
      }
    },
  )

  ipcMain.handle(
    Channels.TAG_UPDATE,
    (_event, { id, name }: { id: string; name: string }) => {
      try {
        const tag = tagRepository.update(id, name)
        return { data: tag }
      } catch (err) {
        return {
          error:
            err instanceof Error ? err.message : 'Unknown error updating tag',
        }
      }
    },
  )

  ipcMain.handle(Channels.TAG_DELETE, (_event, id: string) => {
    try {
      tagRepository.remove(id)
      return { data: undefined }
    } catch (err) {
      return {
        error:
          err instanceof Error ? err.message : 'Unknown error deleting tag',
      }
    }
  })

  ipcMain.handle(
    Channels.TAG_ADD_TO_TASK,
    (_event, { taskId, tagId }: { taskId: string; tagId: string }) => {
      try {
        tagRepository.addTagToTask(taskId, tagId)
        return { data: undefined }
      } catch (err) {
        return {
          error:
            err instanceof Error
              ? err.message
              : 'Unknown error adding tag to task',
        }
      }
    },
  )

  ipcMain.handle(
    Channels.TAG_REMOVE_FROM_TASK,
    (_event, { taskId, tagId }: { taskId: string; tagId: string }) => {
      try {
        tagRepository.removeTagFromTask(taskId, tagId)
        return { data: undefined }
      } catch (err) {
        return {
          error:
            err instanceof Error
              ? err.message
              : 'Unknown error removing tag from task',
        }
      }
    },
  )

  ipcMain.handle(Channels.TAG_GET_FOR_TASK, (_event, taskId: string) => {
    try {
      const tags = tagRepository.getTagsForTask(taskId)
      return { data: tags }
    } catch (err) {
      return {
        error:
          err instanceof Error
            ? err.message
            : 'Unknown error getting tags for task',
      }
    }
  })
}
