import { ipcMain } from 'electron'
import { Channels } from '@shared/ipc-channels'
import { settingsRepository } from '../repository/settings-repository'
import { wrapHandler } from './helper'

/**
 * Register IPC handlers for settings read/write.
 */
export function registerSettingsHandlers(
  onLanguageChange?: (locale: string) => void,
): void {
  ipcMain.handle(Channels.SETTINGS_GET, wrapHandler(
    (_event, key: string) => settingsRepository.get(key),
  ))

  ipcMain.handle(Channels.SETTINGS_SET, wrapHandler(
    (_event, { key, value }: { key: string; value: string }) => {
      settingsRepository.set(key, value)
      if (key === 'language' && onLanguageChange) {
        onLanguageChange(value)
      }
    },
  ))
}
