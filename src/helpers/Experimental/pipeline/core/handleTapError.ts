import type { TapOptions } from '../types/interfaces/HasTap.ts'
import type { TapAsyncOptions } from '../types/interfaces/HasTapAsync.ts'

export function handleTapError(error: unknown, options?: TapOptions | TapAsyncOptions): void {
  options?.catch?.(error)
  if (options?.swallow === false) throw error
}
