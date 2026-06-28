import { ipcMain } from 'electron'
import { Channels } from '@shared/ipc-channels'
import type { TrayManager } from '../tray/tray-manager'

/**
 * Register IPC handlers for window operations.
 * Receives the TrayManager instance via dependency injection.
 */
export function registerWindowHandlers(trayManager: TrayManager): void {
  ipcMain.handle(Channels.WINDOW_OPEN_MAIN, () => {
    try {
      trayManager.showMainWindow()
      trayManager.hidePopup()
      return { data: undefined }
    } catch (err) {
      return {
        error: err instanceof Error ? err.message : 'Unknown error in window:open-main',
      }
    }
  })

  ipcMain.handle(Channels.WINDOW_CLOSE_POPUP, () => {
    try {
      trayManager.hidePopup()
      return { data: undefined }
    } catch (err) {
      return {
        error: err instanceof Error ? err.message : 'Unknown error in window:close-popup',
      }
    }
  })
}
