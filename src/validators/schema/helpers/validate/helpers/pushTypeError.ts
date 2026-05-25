import type { ValidationContext } from '../ValidationContext.ts'

export function pushTypeError(
    ctx: ValidationContext,
    message: string,
    overrides?: Record<string, unknown>
): void {
    ctx.pushNewError({
        message,
        context: {
            structMetadata: ctx.metadata,
            expectedType: ctx.metadata.type,
            actualType: typeof ctx.arg,
            ...overrides,
        },
    })
}
