import { BrowserWindow, screen } from 'electron'
import { join } from 'path'

const POPUP_WIDTH = 320
const POPUP_HEIGHT = 480
const POPUP_MAX_HEIGHT = 520

export interface PopupWindowCallbacks {
  onBlur: () => void
}

/**
 * Create the frameless popup window shown near the tray icon.
 * Not shown initially — call win.show() after positioning.
 */
export function createPopupWindow(callbacks: PopupWindowCallbacks): BrowserWindow {
  const win = new BrowserWindow({
    width: POPUP_WIDTH,
    height: POPUP_HEIGHT,
    maxHeight: POPUP_MAX_HEIGHT,
    show: false,
    title: 'qSchedule',
    frame: false,
    resizable: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    hasShadow: true,
    ...(process.platform === 'darwin' ? { type: 'panel' as const } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: true,
    },
  })

  win.on('blur', () => {
    callbacks.onBlur()
  })

  // Load popup renderer
  if (process.env.ELECTRON_RENDERER_URL) {
    // Use URL constructor to safely join base URL with path
    // Handles both http://localhost:5173 and http://localhost:5173/
    const url = new URL('popup.html', process.env.ELECTRON_RENDERER_URL).href
    win.loadURL(url)
  } else {
    win.loadFile(join(__dirname, '../renderer/popup.html'))
  }

  return win
}

/**
 * Position the popup window centered below the tray icon.
 * Falls back to top-center of primary display if tray bounds are invalid.
 */
export function positionPopupNearTray(
  win: BrowserWindow,
  trayBounds: Electron.Rectangle,
): void {
  const popupSize = { width: POPUP_WIDTH, height: POPUP_HEIGHT }

  // Validate tray bounds — can be empty/invalid in some edge cases
  const hasValidBounds =
    trayBounds.width > 0 &&
    trayBounds.height > 0 &&
    trayBounds.x >= 0 &&
    trayBounds.y >= 0

  let x: number
  let y: number

  if (hasValidBounds) {
    // Center horizontally relative to tray icon
    x = Math.round(trayBounds.x + trayBounds.width / 2 - popupSize.width / 2)
    // Position below the tray icon (with 4px gap)
    y = Math.round(trayBounds.y + trayBounds.height + 4)
  } else {
    // Fallback: center of primary display's top edge, below menu bar
    const primaryDisplay = screen.getPrimaryDisplay()
    const { workArea } = primaryDisplay
    x = Math.round(workArea.x + workArea.width / 2 - popupSize.width / 2)
    y = Math.round(workArea.y + 4)
  }

  // Clamp to display bounds
  const cursorPoint = hasValidBounds
    ? { x: trayBounds.x, y: trayBounds.y }
    : { x, y }
  const display = screen.getDisplayNearestPoint(cursorPoint)
  const { x: screenX, y: screenY, width: screenW, height: screenH } =
    display.workArea

  // Horizontal clamp
  if (x + popupSize.width > screenX + screenW) {
    x = screenX + screenW - popupSize.width - 8
  }
  if (x < screenX) {
    x = screenX + 8
  }

  // Vertical clamp — if it would go below the work area, position above the tray
  if (y + popupSize.height > screenY + screenH) {
    if (hasValidBounds) {
      y = Math.round(trayBounds.y - popupSize.height - 4)
    } else {
      y = screenY + screenH - popupSize.height - 8
    }
  }

  win.setBounds({ x, y, width: popupSize.width, height: popupSize.height })
}
