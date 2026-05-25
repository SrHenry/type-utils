import type { V3 } from '../../../types/index.ts'

export function isOptionalCheck(metadata: V3.StructType, arg: unknown): boolean {
    return metadata.optional && arg === undefined
}
