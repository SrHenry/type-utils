import type { TypeGuard } from '../../../TypeGuards/index.ts'
import type { Fn, ThrowFn } from '../../../types/Func.ts'
import type { Result } from '../../../types/Result.ts'
import type { Custom } from '../../rules/types/index.ts'
import type { ValidationErrors } from '../../ValidationErrors.ts'
import type { StandardSchemaV1 } from '../../standard-schema/types.ts'

export type FluentOptionalSchema<
    T,
    // biome-ignore lint/complexity/noBannedTypes: {} used as default for rules record type
    TRules extends { [x: string]: Fn<any[], any> } = {},
    TCalledRules extends [...(keyof TRules)[]] = [],
    TUsedCustomRules extends [...Custom<any[], string, T>[]] = [],
> = TypeGuard<undefined | T> & {
    [K in Exclude<keyof TRules, TCalledRules[number]>]: Fn<
        Parameters<TRules[K]>,
        FluentOptionalSchema<T, TRules, [...TCalledRules, K], TUsedCustomRules>
    >
} & {
    use<Args extends [...any], RuleName extends string>(
        rule: Custom<Args, RuleName, T>
    ): FluentOptionalSchema<T, TRules, TCalledRules, [...TUsedCustomRules, typeof rule]>
    use<TCustomRules extends [Custom<any[], string, T>, ...Custom<any[], string, T>[]]>(
        ...rules: TCustomRules
    ): FluentOptionalSchema<T, TRules, TCalledRules, [...TUsedCustomRules, ...typeof rules]>
    validator(throwOnError?: true): ThrowFn<ValidationErrors, [arg: unknown], undefined | T> & {
        validate: ThrowFn<ValidationErrors, [arg: unknown], undefined | T>
    }
    validator(throwOnError: false): Fn<[arg: unknown], Result<undefined | T, ValidationErrors>> & {
        validate: Fn<[arg: unknown], Result<undefined | T, ValidationErrors>>
    }
    validator(throwOnError: boolean): Fn<
        [arg: unknown],
        (undefined | T) | Result<undefined | T, ValidationErrors>
    > & {
        validate: Fn<[arg: unknown], (undefined | T) | Result<undefined | T, ValidationErrors>>
    }
} & {
    toStandardSchema(): StandardSchemaV1<undefined | T, undefined | T>
}
