import { ipcMain } from 'electron'
import { Channels } from '@shared/ipc-channels'
import { wrapHandler } from './helper'
import type { TrayManager } from '../tray/tray-manager'

/**
 * Register IPC handlers for window operations.
 * Receives the TrayManager instance via dependency injection.
 */
export function registerWindowHandlers(trayManager: TrayManager): void {
  ipcMain.handle(Channels.WINDOW_OPEN_MAIN, wrapHandler(() => {
    trayManager.showMainWindow()
    trayManager.hidePopup()
  }))

  ipcMain.handle(Channels.WINDOW_CLOSE_POPUP, wrapHandler(() => {
    trayManager.hidePopup()
  }))

  ipcMain.handle(Channels.WINDOW_SET_POPUP_HEIGHT, wrapHandler(
    (_event, height: number) => {
      trayManager.setPopupHeight(height)
    },
  ))
}
