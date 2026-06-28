import { ipcMain } from 'electron'
import { registerTaskHandlers } from './task-handlers'
import { registerTagHandlers } from './tag-handlers'

let registered = false

export function registerIpcHandlers(): void {
  if (registered) return
  registered = true

  // Legacy ping (kept for Phase 1 verification)
  ipcMain.handle('ping', () => 'pong')

  registerTaskHandlers()
  registerTagHandlers()
}
