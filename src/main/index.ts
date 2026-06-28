import { app } from 'electron'
import { runMigrations } from './database/migrations'
import { registerIpcHandlers } from './ipc'
import { closeDatabase } from './database/connection'
import { TrayManager } from './tray/tray-manager'
import { createMainWindow } from './windows/main-window'
import { createPopupWindow } from './windows/popup-window'

let trayManager: TrayManager | null = null

app.whenReady().then(() => {
  // Initialize database and run migrations
  runMigrations()

  // Create the tray manager — owns all window lifecycle
  trayManager = new TrayManager(
    () =>
      createMainWindow({
        onClosePrevented: () => {
          // Main window was closed → hidden to tray. Nothing extra needed.
        },
      }),
    () =>
      createPopupWindow({
        onBlur: () => {
          setTimeout(() => {
            if (trayManager && !trayManager.isPopupBlurSuppressed()) {
              trayManager.hidePopup()
            }
            trayManager?.resetPopupBlurSuppress()
          }, 100)
        },
      }),
  )

  // Register all IPC handlers (task + tag + window + ping)
  registerIpcHandlers(trayManager)

  // Initialize tray + create main window
  trayManager.init()

  // macOS dock click → show main window
  app.on('activate', () => {
    trayManager?.showMainWindow()
  })
})

app.on('window-all-closed', () => {
  // On macOS the app stays alive in the tray
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', () => {
  trayManager?.destroy()
  trayManager = null
  closeDatabase()
})
