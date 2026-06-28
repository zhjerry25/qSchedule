import { getDatabase } from '../database/connection'

export const settingsRepository = {
  get(key: string): string | null {
    const db = getDatabase()
    const row = db.prepare(
      'SELECT value FROM settings WHERE key = ?',
    ).get(key) as { value: string } | undefined
    return row?.value ?? null
  },

  set(key: string, value: string): void {
    const db = getDatabase()
    db.prepare(
      'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
    ).run(key, value)
  },
}
