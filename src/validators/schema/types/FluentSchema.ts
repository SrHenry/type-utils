import type { TypeGuard } from '../../../TypeGuards'
import type { Fn } from '../../../types/Func'
import type { Custom } from '../../rules/types'
import type { FluentOptionalSchema } from './FluentOptionalSchema'

export type FluentSchema<
    T,
    TRules extends { [x: string]: Fn<any[], any> } = {},
    TCalledRules extends [...(keyof TRules)[]] = []
> = TypeGuard<T> & {
    [K in Exclude<keyof TRules, TCalledRules[number]>]: Fn<
        Parameters<TRules[K]>,
        FluentSchema<T, TRules, [...TCalledRules, K]>
    >
} & {
    use<Args extends [...any], RuleName extends string>(
        rule: Custom<Args, RuleName, T>
    ): FluentSchema<T, TRules, TCalledRules>
    use<TCustomRules extends [Custom<any[], string, T>, ...Custom<any[], string, T>[]]>(
        ...rules: TCustomRules
    ): FluentSchema<T, TRules, TCalledRules>
} & {
    optional(): TypeGuard<undefined | T> & FluentOptionalSchema<T, TRules, TCalledRules>
}
