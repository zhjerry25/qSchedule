import type { IpcMainInvokeEvent } from 'electron'
import type { z } from 'zod'

/**
 * Wrap a repository call in try/catch, returning { data } or { error }.
 * Eliminates the repeated boilerplate across all IPC handlers.
 *
 * If a Zod schema is provided, the first argument after `event` is validated
 * before passing it to `fn`. Validation errors return { error } with a
 * descriptive message rather than throwing across the IPC boundary.
 */
export function wrapHandler<A extends any[], R>(
  fn: (event: IpcMainInvokeEvent, ...args: A) => R,
  schema?: z.ZodType<A[0]>,
): (event: IpcMainInvokeEvent, ...rawArgs: any[]) => { data?: R; error?: string } {
  return (event: IpcMainInvokeEvent, ...rawArgs: any[]): { data?: R; error?: string } => {
    try {
      const args: A = rawArgs as A
      if (schema && rawArgs.length > 0) {
        const parsed = schema.safeParse(rawArgs[0])
        if (!parsed.success) {
          const messages = parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ')
          return { error: `Validation error: ${messages}` }
        }
        args[0] = parsed.data
      }
      const data = fn(event, ...args)
      return { data }
    } catch (err) {
      return {
        error: err instanceof Error ? err.message : `Unknown error in handler`,
      }
    }
  }
}
