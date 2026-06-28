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

  // Create the tray manager — owns all window lifecycle.
  // Factories forward TrayManager's callbacks to the window creators.
  trayManager = new TrayManager(
    (callbacks) => createMainWindow(callbacks),
    (callbacks) => createPopupWindow(callbacks),
  )

  // Register all IPC handlers (task + tag + window)
  registerIpcHandlers(trayManager)

  // Initialize tray + create main window
  trayManager.init()

  // macOS dock click → show main window
  app.on('activate', () => {
    trayManager?.showMainWindow()
  })
}).catch((err) => {
  console.error('Fatal: app startup failed:', err)
  const { dialog } = require('electron')
  dialog.showErrorBox(
    'Startup Failed',
    `The application failed to start:\n\n${err instanceof Error ? err.message : String(err)}\n\nPlease check the logs and restart.`,
  )
  app.quit()
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
