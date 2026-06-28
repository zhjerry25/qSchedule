import { Tray, Menu, app, nativeImage, BrowserWindow, screen } from 'electron'
import type { NativeImage } from 'electron'
import { deflateSync } from 'zlib'
import type { MainWindowCallbacks } from '../windows/main-window'
import type { PopupWindowCallbacks } from '../windows/popup-window'
import { positionPopupNearTray } from '../windows/popup-window'

// ── Programmatic Tray Icon Generation ──

/**
 * Generate a 22×22 template tray icon (black circle with a simple
 * dot at center — a minimal "active/ready" indicator).
 *
 * Uses raw pixel buffer → PNG encoding with zlib, so no external
 * asset files or dependencies are needed.
 */
function createTrayIcon(): NativeImage {
  const size = 22
  const rawSize = size * size * 4
  const raw = Buffer.alloc(rawSize, 0)

  // Draw a filled circle (centered, radius 8)
  const cx = size / 2
  const cy = size / 2
  const outerR = 8
  const innerR = 5 // hollow inner circle to create a ring

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - cx
      const dy = y - cy
      const d2 = dx * dx + dy * dy
      // Ring: inside outer circle, outside inner circle
      if (d2 <= outerR * outerR && d2 >= innerR * innerR) {
        const idx = (y * size + x) * 4
        raw[idx] = 0 // R
        raw[idx + 1] = 0 // G
        raw[idx + 2] = 0 // B
        raw[idx + 3] = 255 // A
      }
    }
  }

  // Build PNG filter rows: 1 filter byte (0 = None) + RGBA pixels per row
  const rowBytes = size * 4
  const filteredRows: Buffer[] = []
  for (let y = 0; y < size; y++) {
    const filterByte = Buffer.alloc(1, 0) // filter: None
    const row = raw.subarray(y * rowBytes, (y + 1) * rowBytes)
    filteredRows.push(Buffer.concat([filterByte, row]))
  }
  const imageData = Buffer.concat(filteredRows)

  // Compress with zlib/deflate
  const compressed = deflateSync(imageData)

  // ── Build PNG file ──
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])

  // IHDR: width(4) height(4) bitDepth(1) colorType(1=RGBA=6) compress(0) filter(0) interlace(0)
  const ihdrData = Buffer.alloc(13)
  ihdrData.writeUInt32BE(size, 0) // width
  ihdrData.writeUInt32BE(size, 4) // height
  ihdrData[8] = 8 // bit depth
  ihdrData[9] = 6 // color type: RGBA
  ihdrData[10] = 0 // compression
  ihdrData[11] = 0 // filter
  ihdrData[12] = 0 // interlace
  const ihdr = createPngChunk('IHDR', ihdrData)

  // IDAT: compressed image data
  const idat = createPngChunk('IDAT', compressed)

  // IEND: empty
  const iend = createPngChunk('IEND', Buffer.alloc(0))

  const pngBuffer = Buffer.concat([signature, ihdr, idat, iend])
  const icon = nativeImage.createFromBuffer(pngBuffer)
  icon.setTemplateImage(true)

  return icon
}

/** Build a single PNG chunk: length(4) + type(4) + data + CRC(4). */
function createPngChunk(type: string, data: Buffer): Buffer {
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length, 0)

  const typeBuffer = Buffer.from(type, 'ascii')
  const crcInput = Buffer.concat([typeBuffer, data])

  // CRC-32
  const crc = crc32(crcInput)
  const crcBuffer = Buffer.alloc(4)
  crcBuffer.writeUInt32BE(crc >>> 0, 0)

  return Buffer.concat([length, typeBuffer, data, crcBuffer])
}

/** CRC-32 implementation for PNG chunk validation. */
function crc32(buf: Buffer): number {
  let crc = 0xffffffff
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff]! ^ (crc >>> 8)
  }
  return crc ^ 0xffffffff
}

const crcTable: number[] = (() => {
  const table: number[] = []
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    }
    table[n] = c
  }
  return table
})()

// ── TrayManager ──

const CLICK_INTERVAL_MS = 300

export class TrayManager {
  private tray: Tray | null = null
  private mainWindow: BrowserWindow | null = null
  private popupWindow: BrowserWindow | null = null
  private clickTimer: ReturnType<typeof setTimeout> | null = null
  private suppressPopupBlur = false

  constructor(
    private createMainWin: (callbacks: MainWindowCallbacks) => BrowserWindow,
    private createPopupWin: (callbacks: PopupWindowCallbacks) => BrowserWindow,
  ) {}

  // ── Initialization ──

  init(): void {
    // Create the main window eagerly (same as before)
    this.mainWindow = this.createMainWin({
      onClosePrevented: () => {
        // Main window was closed → hidden. Tray keeps the app alive.
      },
    })

    // Create tray icon
    this.tray = new Tray(createTrayIcon())
    this.tray.setToolTip('Time Planner')

    // Tray click: single vs double-click detection via 300ms timer
    this.tray.on('click', (_event, bounds) => {
      if (this.clickTimer) {
        // Second click within 300ms → double-click
        clearTimeout(this.clickTimer)
        this.clickTimer = null
        this.handleDoubleClick()
      } else {
        // First click → wait to see if a second click follows
        this.clickTimer = setTimeout(() => {
          this.clickTimer = null
          this.handleSingleClick(bounds)
        }, CLICK_INTERVAL_MS)
      }
    })

    // Right-click context menu
    this.tray.on('right-click', () => {
      this.tray?.popUpContextMenu(this.buildContextMenu())
    })

    // Re-create tray if it disappears (e.g. after Explorer restart on Windows)
    // Not typically needed on macOS but harmless to keep.
  }

  // ── Window Management ──

  showMainWindow(): void {
    this.suppressPopupBlur = true
    if (this.mainWindow) {
      this.mainWindow.show()
      this.mainWindow.focus()
    }
    this.hidePopup()
  }

  hidePopup(): void {
    if (this.popupWindow && !this.popupWindow.isDestroyed()) {
      this.popupWindow.hide()
    }
  }

  /** Toggle the popup: show near tray if hidden, hide if visible. */
  togglePopup(bounds: Electron.Rectangle): void {
    if (this.popupWindow && !this.popupWindow.isDestroyed() && this.popupWindow.isVisible()) {
      this.popupWindow.hide()
      return
    }

    // Lazy-create popup on first toggle
    if (!this.popupWindow || this.popupWindow.isDestroyed()) {
      this.popupWindow = this.createPopupWin({
        onBlur: () => {
          // Delay to allow suppressPopupBlur flag to be checked
          setTimeout(() => {
            if (!this.suppressPopupBlur && this.popupWindow && !this.popupWindow.isDestroyed()) {
              this.popupWindow.hide()
            }
            this.suppressPopupBlur = false
          }, 100)
        },
      })
    }

    positionPopupNearTray(this.popupWindow, bounds)
    this.popupWindow.show()
  }

  // ── Blur Suppression (for "Open App" flow) ──

  isPopupBlurSuppressed(): boolean {
    return this.suppressPopupBlur
  }

  resetPopupBlurSuppress(): void {
    this.suppressPopupBlur = false
  }

  // ── Tray Click Handlers ──

  private handleSingleClick(bounds: Electron.Rectangle): void {
    this.togglePopup(bounds)
  }

  private handleDoubleClick(): void {
    this.showMainWindow()
  }

  // ── Context Menu ──

  private buildContextMenu(): Menu {
    return Menu.buildFromTemplate([
      {
        label: 'Open Main',
        click: () => this.showMainWindow(),
      },
      {
        label: "Today's Tasks",
        click: () => {
          // Use tray bounds if available, otherwise fall back to primary display
          const bounds = this.tray?.getBounds() ?? { x: 0, y: 0, width: 0, height: 0 }
          this.togglePopup(bounds)
        },
      },
      { type: 'separator' },
      {
        label: 'Quit',
        click: () => {
          app.quit()
        },
      },
    ])
  }

  // ── Lifecycle ──

  destroy(): void {
    if (this.clickTimer) {
      clearTimeout(this.clickTimer)
      this.clickTimer = null
    }
    this.tray?.destroy()
    this.tray = null
    this.mainWindow = null
    this.popupWindow = null
  }
}
