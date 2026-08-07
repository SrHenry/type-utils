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

/**
 * Optional args shared between the 3-positional-arg form and the options-object
 * form of `ValidateFn`. Modelled here as an exported shared type so callers
 * inside `validate*` helpers and the public `validate` overloads cannot drift.
 */
export type ValidateOptionalArgs<Name extends string = string, Parent = unknown> = {
    name?: Name
    parent?: Parent
}

export type ValidationContext<T = unknown, TMetadata extends V3.StructType = V3.StructType> = {
    arg: unknown
    schema: TypeGuard<T>
    metadata: TMetadata
    name: string | undefined
    parent: unknown
    errors: ValidationError[]
    pushNewError: PushNewError
}

/**
 * Shared recursive validate-callback contract. Generic over the guarded value
 * type `T` and the `Parent` type. The three overloads model the actual call
 * shapes that exist in the codebase: 2-arg, 3-arg with options, and 4-arg with
 * positional name + parent. Hoisted here so the per-helper declarations
 * cannot drift. Used by every `validate*` helper in this folder.
 *
 * Default `T = unknown` matches the recursive-context call shape inside
 * helpers — they always re-invoke with `ctx.schema` whose `T` is structurally
 * erased as the schema is recursed into.
 */
export interface ValidateFn<T = unknown, Parent = unknown> {
    (arg: unknown, schema: TypeGuard<T>): Result<unknown, ValidationErrors>
    <Name extends string>(
        arg: unknown,
        schema: TypeGuard<T>,
        options: ValidateOptionalArgs<Name, Parent>
    ): Result<unknown, ValidationErrors>
    <Name extends string>(
        arg: unknown,
        schema: TypeGuard<T>,
        name: Name,
        parent: Parent
    ): Result<unknown, ValidationErrors>
}

/**
 * Shared sentinel marking the absence of a parent in the validate() call graph.
 * Must be the same Symbol identity across `SchemaValidator.ts` and
 * `validateDefault.ts` — a fresh `Symbol(...)` per file is never identity-equal.
 * Consumers should reference its type as `typeof NO_PARENT`.
 */
export const NO_PARENT = Symbol('SchemaValidator::validate::NO_PARENT')
