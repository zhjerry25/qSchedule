import { ipcMain } from 'electron'
import { registerTaskHandlers } from './task-handlers'
import { registerTagHandlers } from './tag-handlers'
import { registerWindowHandlers } from './window-handlers'
import { registerSettingsHandlers } from './settings-handlers'
import type { TrayManager } from '../tray/tray-manager'

let registered = false

export function registerIpcHandlers(trayManager: TrayManager): void {
  if (registered) return
  registered = true

  registerTaskHandlers()
  registerTagHandlers()
  registerWindowHandlers(trayManager)
  registerSettingsHandlers((locale) => {
    trayManager.setLocale(locale)
    trayManager.rebuildMenu()
  })
}
