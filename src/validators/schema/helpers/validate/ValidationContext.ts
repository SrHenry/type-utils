import type { TypeGuard } from '../../../../TypeGuards/types/index.ts'
import type { Result } from '../../../../types/Result.ts'
import type { V3 } from '../../types/index.ts'
import type { ValidationArgs, ValidationError } from '../../../ValidationError.ts'
import type { ValidationErrors } from '../../../ValidationErrors.ts'

type ValidationArgsStaticValues = 'name' | 'parent' | 'schema' | 'value'

export type PushNewError = {
    <TContext extends {}>(
        args: Omit<ValidationArgs<any, any, any, any, TContext>, ValidationArgsStaticValues>
    ): void
    (args: Omit<ValidationArgs<any, any, any, any, null>, ValidationArgsStaticValues>): void
    <TMessage extends string>(message: TMessage): void
    (args: string | Omit<ValidationArgs<any, any, any, any>, ValidationArgsStaticValues>): void
}

export type ValidationContext<TMetadata extends V3.StructType = V3.StructType> = {
    arg: unknown
    schema: TypeGuard<any>
    metadata: TMetadata
    name: string | undefined
    parent: unknown
    errors: ValidationError[]
    pushNewError: PushNewError
}

/**
 * Shared recursive validate-callback contract. Hoisted here so the per-helper
 * declarations cannot drift. Used by every `validate*` helper in this folder.
 */
export type ValidateFn = (
    arg: unknown,
    schema: TypeGuard<any>,
    ...args: any[]
) => Result<unknown, ValidationErrors>

/**
 * Shared sentinel marking the absence of a parent in the validate() call graph.
 * Must be the same Symbol identity across `SchemaValidator.ts` and
 * `validateDefault.ts` — a fresh `Symbol(...)` per file is never identity-equal.
 * Consumers should reference its type as `typeof NO_PARENT`.
 */
export const NO_PARENT = Symbol('SchemaValidator::validate::NO_PARENT')
