import type { TypeGuard } from '../../../TypeGuards'
import type { Fn, ThrowFn } from '../../../types/Func'
import type { Custom } from '../../rules/types'
import type { ValidateReturn } from '../../SchemaValidator'
import type { ValidationErrors } from '../../ValidationErrors'

export type FluentOptionalSchema<
    T,
    TRules extends { [x: string]: Fn<any[], any> } = {},
    TCalledRules extends [...(keyof TRules)[]] = [],
> = TypeGuard<undefined | T> & {
    [K in Exclude<keyof TRules, TCalledRules[number]>]: Fn<
        Parameters<TRules[K]>,
        FluentOptionalSchema<undefined | T, TRules, [...TCalledRules, K]>
    >
} & {
    use<Args extends [...any], RuleName extends string>(
        rule: Custom<Args, RuleName, T>
    ): FluentOptionalSchema<T, TRules, TCalledRules>
    use<
        TCustomRules extends [
            Custom<any[], string, undefined | T>,
            ...Custom<any[], string, undefined | T>[],
        ],
    >(
        ...rules: TCustomRules
    ): FluentOptionalSchema<undefined | T, TRules, TCalledRules>

    validator(): ThrowFn<ValidationErrors, [arg: unknown], undefined | T> & {
        validate: ThrowFn<ValidationErrors, [arg: unknown], undefined | T>
    }
    validator(throwOnError: true): ThrowFn<ValidationErrors, [arg: unknown], undefined | T> & {
        validate: ThrowFn<ValidationErrors, [arg: unknown], undefined | T>
    }
    validator(throwOnError: false): Fn<[arg: unknown], ValidateReturn<undefined | T>> & {
        validate: ThrowFn<ValidationErrors, [arg: unknown], undefined | T>
    }
    validator(throwOnError: boolean): Fn<[arg: unknown], ValidateReturn<undefined | T>> & {
        validate: Fn<[arg: unknown], ValidateReturn<undefined | T>>
    }
}
