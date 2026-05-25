import type { PipeTransform } from '../types/PipeTransform.ts'

export function isPipeTransform(value: unknown): value is PipeTransform<unknown> {
    return typeof value === 'function' && typeof (value as any).depipe === 'function'
}
