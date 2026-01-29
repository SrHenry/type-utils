// import type Generics from '../../../Generics'
import type { TypeGuard } from '../../../TypeGuards'
import type { Fn, ThrowFn } from '../../../types/Func'
import type { Custom } from '../../rules/types'
import type { ValidateReturn } from '../../SchemaValidator'
import type { ValidatorMessageMap } from '../../types'
import type { ValidationErrors } from '../../ValidationErrors'
import type { FluentOptionalSchema } from './FluentOptionalSchema'

// type AppendMessageMethod<
//     T,
//     TRules extends { [x: string]: Fn<any[], any> } = {},
//     TCalledRules extends [...(keyof TRules)[]] = []
// > = T extends Generics.PrimitiveType? (message:string)=>FluentSchema<T, TRules, TCalledRules>

export type FluentSchema<
    T,
    TRules extends { [x: string]: Fn<any[], any> } = {},
    TCalledRules extends [...(keyof TRules)[]] = [],
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

    message(messageMap: ValidatorMessageMap<T>): FluentSchema<T, TRules, TCalledRules>

    validator(): ThrowFn<ValidationErrors, [arg: unknown], T> & {
        validate: ThrowFn<ValidationErrors, [arg: unknown], T>
    }
    validator(throwOnError: true): ThrowFn<ValidationErrors, [arg: unknown], T> & {
        validate: ThrowFn<ValidationErrors, [arg: unknown], T>
    }
    validator(throwOnError: false): Fn<[arg: unknown], ValidateReturn<T>> & {
        validate: Fn<[arg: unknown], ValidateReturn<T>>
    }
    validator(throwOnError: boolean): Fn<[arg: unknown], ValidateReturn<T>> & {
        validate: Fn<[arg: unknown], ValidateReturn<T>>
    }
} & {
    optional(): TypeGuard<undefined | T> & FluentOptionalSchema<T, TRules, TCalledRules>
}
