import { ipcMain } from 'electron'
import { Channels } from '@shared/ipc-channels'
import { tagRepository } from '../repository/tag-repository'
import { wrapHandler } from './helper'
import { tagCreateSchema } from '@shared/validation'

export function registerTagHandlers(): void {
  ipcMain.handle(Channels.TAG_LIST, wrapHandler(
    () => tagRepository.findAll(),
  ))

  ipcMain.handle(Channels.TAG_GET_BY_ID, wrapHandler(
    (_event, id: string) => tagRepository.findById(id),
  ))

  ipcMain.handle(Channels.TAG_CREATE, wrapHandler(
    (_event, payload) => tagRepository.create(payload.name, payload.color),
    tagCreateSchema,
  ))

  ipcMain.handle(Channels.TAG_UPDATE, wrapHandler(
    (_event, { id, name }: { id: string; name: string }) =>
      tagRepository.update(id, name),
  ))

  ipcMain.handle(Channels.TAG_DELETE, wrapHandler(
    (_event, id: string) => { tagRepository.remove(id) },
  ))

  ipcMain.handle(Channels.TAG_ADD_TO_TASK, wrapHandler(
    (_event, { taskId, tagId }: { taskId: string; tagId: string }) =>
      tagRepository.addTagToTask(taskId, tagId),
  ))

  ipcMain.handle(Channels.TAG_REMOVE_FROM_TASK, wrapHandler(
    (_event, { taskId, tagId }: { taskId: string; tagId: string }) =>
      tagRepository.removeTagFromTask(taskId, tagId),
  ))

  ipcMain.handle(Channels.TAG_GET_FOR_TASK, wrapHandler(
    (_event, taskId: string) => tagRepository.getTagsForTask(taskId),
  ))
}
