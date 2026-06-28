import { BrowserWindow } from 'electron'
import { join } from 'path'

export interface MainWindowCallbacks {
  onClosePrevented: () => void
}

/**
 * Create the main application window.
 * Close is intercepted to hide instead of quit — the tray keeps the app alive.
 */
export function createMainWindow(callbacks: MainWindowCallbacks): BrowserWindow {
  const win = new BrowserWindow({
    width: 1100,
    height: 720,
    minWidth: 800,
    minHeight: 500,
    show: false,
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      preload: join(__dirname, '../../preload/index.js'),
      sandbox: false,
    },
  })

  win.on('ready-to-show', () => {
    win.show()
  })

  win.on('close', (e) => {
    e.preventDefault()
    win.hide()
    callbacks.onClosePrevented()
  })

  // Load renderer
  if (process.env.ELECTRON_RENDERER_URL) {
    win.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    win.loadFile(join(__dirname, '../../renderer/index.html'))
  }

  return win
}
