// import type Generics from '../../../Generics/index.ts'
import type { TypeGuard } from '../../../TypeGuards/index.ts'
import type { Fn, ThrowFn } from '../../../types/Func.ts'
import type { Custom } from '../../rules/types/index.ts'
import type { ValidateReturn } from '../../SchemaValidator.ts'
import type { ValidationErrors } from '../../ValidationErrors.ts'
import type { StandardSchemaV1 } from '../../standard-schema/types.ts'
import type { FluentOptionalSchema } from './FluentOptionalSchema.ts'

// type AppendMessageMethod<
//     T,
//     TRules extends { [x: string]: Fn<any[], any> } = {},
//     TCalledRules extends [...(keyof TRules)[]] = []
// > = T extends Generics.PrimitiveType? (message:string)=>FluentSchema<T, TRules, TCalledRules>

export type FluentSchema<
    T,
    TRules extends { [x: string]: Fn<any[], any> } = {},
    TCalledRules extends [...(keyof TRules)[]] = [],
    TUsedCustomRules extends [...Custom<any[], string, T>[]] = [],
> = TypeGuard<T> & {
    [K in Exclude<keyof TRules, TCalledRules[number]>]: Fn<
        Parameters<TRules[K]>,
        FluentSchema<T, TRules, [...TCalledRules, K], TUsedCustomRules>
    >
} & {
    use<Args extends [...any], RuleName extends string>(
        rule: Custom<Args, RuleName, T>
    ): FluentSchema<T, TRules, TCalledRules, [...TUsedCustomRules, typeof rule]>
    use<TCustomRules extends [Custom<any[], string, T>, ...Custom<any[], string, T>[]]>(
        ...rules: TCustomRules
    ): FluentSchema<T, TRules, TCalledRules, [...TUsedCustomRules, ...typeof rules]>

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
  optional(): TypeGuard<undefined | T> &
    FluentOptionalSchema<T, TRules, TCalledRules, TUsedCustomRules>
  toStandardSchema(): StandardSchemaV1<T, T>
}
