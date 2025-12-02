import type { TypeGuard } from '../../../TypeGuards'
import type { Fn } from '../../../types/Func'
import type { Custom } from '../../rules/types'

export type FluentOptionalSchema<
    T,
    TRules extends { [x: string]: Fn<any[], any> } = {},
    TCalledRules extends [...(keyof TRules)[]] = []
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
            ...Custom<any[], string, undefined | T>[]
        ]
    >(
        ...rules: TCustomRules
    ): FluentOptionalSchema<undefined | T, TRules, TCalledRules>
}
