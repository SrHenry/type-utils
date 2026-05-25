import type { ValidationContext } from './ValidationContext.ts'

import { ensureInterface } from '../../../../TypeGuards/helpers/ensureInterface.ts'
import { getValidatorMessage } from '../../../../TypeGuards/helpers/getValidatorMessage.ts'
import { hasValidatorMessage } from '../../../../TypeGuards/helpers/hasValidatorMessage.ts'
import { TypeGuardError } from '../../../../TypeGuards/TypeErrors.ts'

export function validateWithoutMetadata(ctx: ValidationContext): void {
    try {
        ensureInterface(ctx.arg, ctx.schema)
    } catch (e) {
        if (!(e instanceof TypeGuardError)) throw e

        let { message } = e

        // biome-ignore lint/style/noNonNullAssertion: hasValidatorMessage() guarantees existence
        if (hasValidatorMessage(ctx.schema)) message = getValidatorMessage(ctx.schema)!

        ctx.pushNewError({
            message,
            context: {
                hasStructMetadata: false,
            },
        })
    }
}
