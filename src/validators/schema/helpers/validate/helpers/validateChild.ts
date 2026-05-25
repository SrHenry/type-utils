import type { TypeGuard } from '../../../../../TypeGuards/types/index.ts'
import { ValidationError } from '../../../../../validators/ValidationError.ts'
import { ValidationErrors } from '../../../../../validators/ValidationErrors.ts'
import { isInstanceOf } from '../../../../../TypeGuards/helpers/isInstanceOf.ts'

type ValidateFn = (this: unknown, arg: unknown, schema: TypeGuard<any>, ...args: any[]) => unknown

export function validateChild(
    validate: ValidateFn,
    mustNotThrowCtx: unknown,
    value: unknown,
    schema: TypeGuard<any>,
    name: string | undefined,
    parent: unknown,
    errors: ValidationError[]
): void {
    const result = validate.bind(mustNotThrowCtx)(value, schema, { name, parent })

    if (result instanceof ValidationErrors) {
        errors.push(...result.errors)
    } else if (
        Array.isArray(result) &&
        result.every((item): item is ValidationError => item instanceof ValidationError)
    ) {
        errors.push(...result)
    }
}

export function validateChildReturningResult(
    validate: ValidateFn,
    mustNotThrowCtx: unknown,
    value: unknown,
    schema: TypeGuard<any>,
    name: string | undefined,
    parent: unknown
): unknown {
    return validate.bind(mustNotThrowCtx)(value, schema, { name, parent })
}

export function collectErrorsFromResults(results: unknown[], errors: ValidationError[]): void {
    results.filter(isInstanceOf(ValidationErrors)).forEach(item => {
        errors.push(...item.errors)
    })
}
