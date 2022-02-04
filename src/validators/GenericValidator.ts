import { Generics } from '../Generics'
import { AND } from '../helpers'
import {
    ensureInstanceOf,
    ensureInterface,
    GetTypeGuard,
    imprintMessage,
    imprintMessageFormator,
    imprintMetadata,
    is,
    retrieveMessage,
    retrieveMessageFormator,
    retrieveMetadata,
    TypeGuard,
} from '../TypeGuards/GenericTypeGuards'
import { TypeGuardError } from '../TypeGuards/TypeErrors'
import * as _Rules from './Rules'

export namespace Validators {
    export type OptionalKeys<T> = keyof Generics.OmitNever<{
        [K in keyof T]-?: T[K] extends NonNullable<T[K]> ? never : K
    }>
    export type RequiredKeys<T> = keyof Omit<T, OptionalKeys<T>>

    /** @internal */
    export type __neverifyOptional<T> = {
        [K in keyof T]: undefined extends T[K] ? K : never
    }

    export type RequiredProps<T> = Omit<T, OptionalKeys<T>>
    export type OptionalProps<T> = Pick<T, OptionalKeys<T>>

    export type ValidatorMap<T> = {
        [K in keyof T]: TypeGuard<T[K]>
    }

    export type ValidatorArgs<T> = {
        validators: ValidatorMap<T>
        required?: Array<keyof T>
        optional?: Array<keyof T>
    }

    export type UnpackSchema<T extends ValidatorMap<any>> = T extends ValidatorMap<infer U>
        ? Sanitize<U>
        : never

    export type Unpack<T extends ValidatorMap<any>> = T extends ValidatorMap<infer U>
        ? Sanitize<U>
        : never

    export type Sanitize<T> = {
        [K in RequiredKeys<T>]-?: T[K]
    } & {
        [P in OptionalKeys<T>]+?: Exclude<T[P], undefined>
    }

    export abstract class BaseValidator {
        public static validateProperties<T, U>(
            arg: T,
            { validators, required = [], optional = [] }: ValidatorArgs<U>
        ): U {
            const o = ensureInstanceOf(arg, Object) as Record<string, unknown>

            if (required.length === 0 && optional.length === 0) {
                for (const [prop, validator] of Object.entries<TypeGuard>(validators)) {
                    if (!(prop in o)) throw new TypeGuardError(`Property ${prop} is not defined`, o)

                    if (!validator(o[prop]))
                        throw new TypeGuardError(
                            `Property '${prop}' failed validation`,
                            o[prop],
                            validator
                        )
                }

                return o as U
            }

            for (const key of required) {
                if (!(key in o))
                    throw new TypeGuardError(`Missing required key ${key}`, o, validators[key])

                if (!validators[key](o[key as keyof typeof o]))
                    throw new TypeGuardError(
                        `Invalid value for key ${key}`,
                        o[key as keyof typeof o],
                        validators[key]
                    )
            }
            for (const key of optional) {
                if (key in o) {
                    if (!validators[key](o[key as keyof typeof o]))
                        throw new TypeGuardError(
                            `Invalid value for key ${key}`,
                            o[key as keyof typeof o],
                            validators[key]
                        )
                }
            }

            return o as U
        }

        public static hasValidProperties<T>(arg: unknown, vargs: ValidatorArgs<T>): arg is T {
            try {
                this.validateProperties(arg, vargs)

                return true
            } catch {
                return false
            }
        }

        public static validatePropertiesAsync<T, U>(
            arg: T,
            { validators, required = [], optional = [] }: ValidatorArgs<U>
        ): Promise<U> {
            return new Promise((resolve, reject) => {
                try {
                    resolve(this.validateProperties(arg, { validators, required, optional }))
                } catch (e: unknown) {
                    reject(e)
                }
            })
        }

        public static isValidArray<T>(arg: unknown, args: ValidatorArgs<T>): arg is Array<T> {
            try {
                this.validateArray(arg, args)

                return true
            } catch {
                return false
            }
        }

        public static validateArray<T, U>(arg: T, args: ValidatorArgs<U>): U[] {
            if (!Array.isArray(arg)) throw new TypeGuardError(`Invalid type for array`, arg, Array)

            for (const item of arg) {
                this.validateProperties(item, args)
            }

            return arg as U[]
        }

        public static extractWithFallback<T, U>(arg: T, args: ValidatorArgs<U>): U | undefined
        public static extractWithFallback<T, U>(arg: T, args: ValidatorArgs<U>, defaultValue: U): U
        public static extractWithFallback<T, U>(arg: T, args: TypeGuard<U>, defaultValue: U): U
        public static extractWithFallback<T, U>(arg: T, args: TypeGuard<U>): U | undefined

        public static extractWithFallback<T, U>(
            arg: T,
            args: ValidatorArgs<U> | TypeGuard<U>,
            defaultValue: U | undefined = undefined
        ): U | undefined {
            if (typeof args === 'function') return is(arg, args) ? arg : defaultValue ?? void 0
            return this.hasValidProperties(arg, args) ? arg : defaultValue ?? void 0
        }

        public static validate<T, U>(arg: T, schema: TypeGuard<U>): U {
            return ensureInterface(arg, schema)
        }

        public static isValid<T>(arg: unknown, schema: TypeGuard<T>): arg is T {
            return schema(arg)
        }
    }

    export const validator = BaseValidator

    export namespace Schema {
        type Optionalize<T> = {
            [K in keyof T]: T[K] extends () => TypeGuard<any | any[]>
                ? (...args: Parameters<T[K]>) => OptionalizeTypeGuard<ReturnType<T[K]>>
                : T[K]
        }

        type OptionalizeTypeGuard<T extends TypeGuard<any | any[]>> = TypeGuard<
            GetTypeGuard<T> | undefined
        >
        type OptionalizeTypeGuardClosure<
            T extends TypeGuardClosure<ClosureGuard, ClosureArgs>,
            ClosureGuard = any,
            ClosureArgs extends any[] = any[]
        > = TypeGuardClosure<GetTypeGuard<ReturnType<T> | undefined>, Parameters<T>>

        type TypeGuardClosure<T = any, Params extends any[] = any[]> = (
            ...args: Params
        ) => TypeGuard<T>

        type optionalCircular = Optionalize<
            Omit<
                typeof Schema,
                | 'optional'
                | 'string'
                | 'array'
                | 'object'
                | 'and'
                | 'or'
                | 'asEnum'
                | 'useSchema'
                | 'SchemaStruct'
                | 'Struct'
                | 'getStructMetadata'
            >
        > & {
            string(): TypeGuard<string>
            string(rules: Rules.String[]): TypeGuard<string>
            string<T extends string>(matches: T): TypeGuard<T>
            string(regex: RegExp): TypeGuard<string>

            array(): OptionalizeTypeGuard<TypeGuard<any[]>>
            array(rules: Rules.Array[]): OptionalizeTypeGuard<TypeGuard<any[]>>
            array<T>(
                rules: Rules.Array[],
                schema: TypeGuard<T>
            ): OptionalizeTypeGuard<TypeGuard<T[]>>
            array<T>(schema: TypeGuard<T>): OptionalizeTypeGuard<TypeGuard<T[]>>

            object(): TypeGuard<Record<any, any>>
            object(tree: {}): TypeGuard<{}>
            object<T>(tree: Validators.ValidatorMap<T>): TypeGuard<Sanitize<T>>

            and<T1, T2>(
                guard1: TypeGuard<T1>,
                guard2: TypeGuard<T2>
            ): OptionalizeTypeGuard<TypeGuard<T1 & T2>>
            and<T1, T2, T3>(
                guard1: TypeGuard<T1>,
                guard2: TypeGuard<T2>,
                guard3: TypeGuard<T3>
            ): OptionalizeTypeGuard<TypeGuard<T1 & T2 & T3>>
            and<T1, T2, T3, T4>(
                guard1: TypeGuard<T1>,
                guard2: TypeGuard<T2>,
                guard3: TypeGuard<T3>,
                guard4: TypeGuard<T4>
            ): OptionalizeTypeGuard<TypeGuard<T1 & T2 & T3 & T4>>
            and<T1, T2, T3, T4, T5>(
                guard1: TypeGuard<T1>,
                guard2: TypeGuard<T2>,
                guard3: TypeGuard<T3>,
                guard4: TypeGuard<T4>,
                guard5: TypeGuard<T5>
            ): OptionalizeTypeGuard<TypeGuard<T1 & T2 & T3 & T4 & T5>>
            and<T extends TypeGuard<any>>(
                ...args: T[]
            ): OptionalizeTypeGuard<TypeGuard<GetTypeGuard<Generics.UnionToIntersection<T>>>>

            or<T1, T2>(
                guard1: TypeGuard<T1>,
                guard2: TypeGuard<T2>
            ): OptionalizeTypeGuard<TypeGuard<T1 | T2>>
            or<T1, T2, T3>(
                guard1: TypeGuard<T1>,
                guard2: TypeGuard<T2>,
                guard3: TypeGuard<T3>
            ): OptionalizeTypeGuard<TypeGuard<T1 | T2 | T3>>
            or<T1, T2, T3, T4>(
                guard1: TypeGuard<T1>,
                guard2: TypeGuard<T2>,
                guard3: TypeGuard<T3>,
                guard4: TypeGuard<T4>
            ): OptionalizeTypeGuard<TypeGuard<T1 | T2 | T3 | T4>>
            or<T1, T2, T3, T4, T5>(
                guard1: TypeGuard<T1>,
                guard2: TypeGuard<T2>,
                guard3: TypeGuard<T3>,
                guard4: TypeGuard<T4>,
                guard5: TypeGuard<T5>
            ): OptionalizeTypeGuard<TypeGuard<T1 | T2 | T3 | T4 | T5>>
            or<T extends TypeGuard<any>>(
                ...args: T[]
            ): OptionalizeTypeGuard<TypeGuard<GetTypeGuard<T>>>

            asEnum<T extends Generics.PrimitiveType>(
                values: T[]
            ): OptionalizeTypeGuard<TypeGuard<T>>
            useSchema<T>(schema: TypeGuard<T>): OptionalizeTypeGuard<TypeGuard<T>>
        }

        export type GetSchemaStruct<T extends TypeGuard> = GetStruct<GetTypeGuard<T>>

        export type GetStruct<T> = T extends Array<infer Inner>
            ? GetStruct<Inner>[]
            : T extends Generics.PrimitiveType
            ? Struct<Generics.GetPrimitiveTag<T>, T>
            : T extends Function
            ? never
            : {
                  [K in keyof T]: GetStruct<T[K]>
              }

        type BaseTypes =
            | typeof Generics.TypeOfTag[number]
            | 'enum'
            | 'primitive'
            | 'union'
            | 'intersection'
            | 'any'

        type BaseStruct<T extends BaseTypes, U> = {
            type: T
            schema: TypeGuard<U>
            optional: boolean
            // tree?: {
            //     [K in keyof U]: BaseStruct<U[K] extends Generics.PrimitiveType ? Generics.GetPrimitiveTag<U[K]> : "object", U[K]>
            // }
        }

        type OptionalPropertyNames<T> = {
            [K in keyof T]-?: {} extends { [P in K]: T[K] } ? K : never
        }[keyof T]

        type SpreadProperties<L, R, K extends keyof L & keyof R> = {
            [P in K]: L[P] | Exclude<R[P], undefined>
        }

        type Id<T> = T extends infer U ? { [K in keyof U]: U[K] } : never

        type SpreadTwo<L, R> = Id<
            Pick<L, Exclude<keyof L, keyof R>> &
                Pick<R, Exclude<keyof R, OptionalPropertyNames<R>>> &
                Pick<R, Exclude<OptionalPropertyNames<R>, keyof L>> &
                SpreadProperties<L, R, OptionalPropertyNames<R> & keyof L>
        >

        type Spread<A extends readonly [...any]> = A extends [infer L, ...infer R]
            ? SpreadTwo<L, Spread<R>>
            : unknown

        // type Foo = Spread<[{ a: string }, { a?: number }]>

        export type ObjectTree<T> = {
            tree: {
                [K in keyof T]: Struct<
                    T[K] extends Generics.PrimitiveType ? Generics.GetPrimitiveTag<T[K]> : 'object',
                    T[K]
                >
            }
        }
        export type ObjectStruct<T> = Spread<
            [
                {
                    [K1 in keyof BaseStruct<'object', T>]: BaseStruct<'object', T>[K1]
                } & {
                    [K2 in keyof ObjectTree<T>]: ObjectTree<T>[K2]
                }
            ]
        >

        export type Struct<T extends BaseTypes, U> = U extends Generics.PrimitiveType
            ? T extends 'enum'
                ? BaseStruct<'enum', U>
                : T extends 'primitive'
                ? BaseStruct<'primitive', Generics.PrimitiveType>
                : T extends 'union'
                ? BaseStruct<'union', U> & {
                      tree: Struct<
                          U extends Generics.PrimitiveType ? Generics.GetPrimitiveTag<U> : 'object',
                          U
                      >[]
                  }
                : T extends 'intersection'
                ? BaseStruct<'intersection', U> & {
                      tree: Struct<
                          U extends Generics.PrimitiveType ? Generics.GetPrimitiveTag<U> : 'object',
                          U
                      >[]
                  }
                : T extends 'any'
                ? BaseStruct<'any', any>
                : T extends 'undefined'
                ? BaseStruct<'undefined', undefined>
                : T extends 'null'
                ? BaseStruct<'null', null>
                : U extends boolean
                ? BaseStruct<'boolean', boolean>
                : BaseStruct<T, U> & {
                      tree?: undefined
                  }
            : U extends Array<infer V>
            ? BaseStruct<'object', U> & {
                  entries: Struct<
                      V extends Generics.PrimitiveType ? Generics.GetPrimitiveTag<V> : 'object',
                      V
                  >
              }
            : U extends Function
            ? BaseStruct<'function', U>
            : U extends object
            ? ObjectStruct<U>
            : never

        const isOptional = (rule: Rules.All): rule is Rules.optional =>
            rule[0] in Rules.keys && rule[0] === Rules.keys.optional
        const isRequired = (rule: Rules.All): rule is Exclude<Rules.All, Rules.optional> =>
            !isOptional(rule)
        const branchIfOptional = (arg: unknown, rules: Rules.All[]) =>
            rules.some(isOptional)
                ? Rules.getRule(rules.find(isOptional)![0]).call(null, arg)
                : false

        function isFollowingRules<CustomRule extends Rules.Custom>(
            arg: unknown,
            rules: Rules.Custom<CustomRule[1], CustomRule[0]>[]
        ): boolean
        function isFollowingRules<Args extends any[], RuleName extends string>(
            arg: unknown,
            rules: Rules.Custom<Args, RuleName>[]
        ): boolean
        function isFollowingRules(arg: unknown, rules: Rules.Default[]): boolean
        function isFollowingRules(arg: unknown, rules: unknown[]): boolean {
            return AND(
                ...rules
                    .filter(Rules.isRule)
                    .filter(isRequired)
                    .map(r => {
                        const [rule, args, handler] = r

                        if (Rules.isCustomHandler(handler)) {
                            return handler(arg).call(null, ...args)
                        } else {
                            return Rules.getRule<Rules.Default[0], Rule>(
                                rule as Rules.Default[0]
                            ).call(null, arg, ...args)
                        }
                    })
            )
        }

        const _hasOptionalProp = (schema: TypeGuard): boolean => {
            const hasFlag = (o: any): o is { __optional__: boolean } => '__optional__' in o

            return hasFlag(schema)
        }

        const getRuleMessages = (rules: Rules.Default[]) =>
            rules
                .map(([rule, args]) => ({ rule: Rules.getRule(rule), args }))
                .map(({ rule, args }) => `${retrieveMessageFormator(rule)(...args)}`)

        function enpipeRuleMessageIntoGuard<T>(prepend: string, guard: TypeGuard<T>): typeof guard
        function enpipeRuleMessageIntoGuard<T>(
            prepend: string,
            guard: TypeGuard<T>,
            rules: Rules.Default[]
        ): typeof guard
        function enpipeRuleMessageIntoGuard<T>(
            prepend: string,
            guard: TypeGuard<T>,
            rules?: Rules.Default[]
        ) {
            const message = getRuleMessages(rules ?? [])
                .map(msg => `& ${msg}`)
                .join('')

            if (Rules.getRule('String.nonEmpty')(message))
                return imprintMessage(`${prepend} ${message}`, guard)

            return imprintMessage(prepend, guard)
        }

        const __metadata__ = Symbol('__metadata__')

        function enpipeSchemaStructIntoGuard<T, U extends BaseTypes>(
            struct: Struct<U, T>,
            guard: TypeGuard<T>
        ): typeof guard {
            return imprintMetadata(__metadata__, struct, guard)
        }

        export function getStructMetadata<T extends BaseTypes, U>(
            guard: TypeGuard<U>
        ): Struct<T, U> {
            return retrieveMetadata(__metadata__, guard)
        }

        export function number(rules: Rules.Number[] = []): TypeGuard<number> {
            const guard = (arg: unknown): arg is number =>
                branchIfOptional(arg, rules) ||
                (typeof arg === 'number' && isFollowingRules(arg, rules))

            return enpipeSchemaStructIntoGuard(
                { type: 'number', schema: guard, optional: false },
                enpipeRuleMessageIntoGuard('number', guard, rules)
            )
        }

        type Exact<T> = Rules.Custom<[to: T], '__Custom.exact__'>
        const exactFormator = (to: unknown) => Rules.template(`exact '${to}'`)
        const exact = <T>(to: T): Exact<T> => [
            '__Custom.exact__',
            [to],
            imprintMessageFormator(exactFormator, subject => arg => subject === arg),
        ]

        export function string(): TypeGuard<string>
        export function string(rules: Rules.String[]): TypeGuard<string>
        export function string<T extends string>(matches: T): TypeGuard<T>
        export function string(regex: RegExp): TypeGuard<string>

        export function string(rules: Rules.String[] | string | RegExp = []): TypeGuard<string> {
            if (typeof rules === 'string') {
                const guard = (arg: unknown): arg is string =>
                    typeof arg === 'string' && isFollowingRules(arg, [exact(rules)])

                return enpipeSchemaStructIntoGuard(
                    { type: 'string', schema: guard, optional: false },
                    imprintMessage(`string & ${exactFormator(rules)}`, guard)
                )
            }

            if (rules instanceof RegExp) {
                const rules_arr = [Rules.String.regex(rules)]
                const guard = (arg: unknown): arg is string =>
                    typeof arg === 'string' && isFollowingRules(arg, rules_arr)

                return enpipeSchemaStructIntoGuard(
                    { type: 'string', schema: guard, optional: false },
                    enpipeRuleMessageIntoGuard('string', guard, rules_arr)
                )
            }

            const guard = (arg: unknown): arg is string =>
                branchIfOptional(arg, rules) ||
                (typeof arg === 'string' && isFollowingRules(arg, rules))

            return enpipeSchemaStructIntoGuard(
                { type: 'string', schema: guard, optional: false },
                enpipeRuleMessageIntoGuard('string', guard, rules)
            ) //TODO: Checkpoint
        }

        export function optional(): optionalCircular {
            const wrapOptional =
                <T extends TypeGuardClosure>(fn: T): OptionalizeTypeGuardClosure<T> =>
                (...args: Parameters<T>) => {
                    const closure = (arg: unknown): arg is GetTypeGuard<ReturnType<T>> =>
                        Rules.getRule('optional')(arg) || fn(...args)(arg)

                    closure['__optional__'] = true

                    return enpipeSchemaStructIntoGuard(
                        { ...getStructMetadata(fn(...args)), optional: true },
                        imprintMessage(retrieveMessage(fn(...args)), closure)
                    )
                }

            return Array.from(Object.entries(Schema))
                .filter(
                    (
                        entry
                    ): entry is [
                        string,
                        Exclude<typeof entry[1], typeof optional | typeof getStructMetadata>
                    ] => {
                        const [, exported] = entry
                        return exported !== optional && exported !== getStructMetadata
                    }
                )
                .reduce<optionalCircular>(
                    (obj, [key, exp]) =>
                        Object.assign(obj, { [key]: wrapOptional(exp) }) as optionalCircular,
                    {} as optionalCircular
                )
        }

        export function useSchema<T>(schema: TypeGuard<T>): TypeGuard<T> {
            return schema
        }

        export function object(): TypeGuard<Record<any, any>>
        export function object(tree: {}): TypeGuard<{}>
        export function object<T>(tree: Validators.ValidatorMap<T>): TypeGuard<Sanitize<T>>
        export function object<T>(
            tree?: Validators.ValidatorMap<T> | {}
        ): TypeGuard<Sanitize<T> | Record<any, any> | {}> {
            const isBlankObject = (arg: unknown): arg is {} =>
                typeof arg === 'object' && !!arg && Object.keys(arg).length === 0
            if (!tree || isBlankObject(tree)) {
                const guard = (arg: unknown): arg is Record<any, any> | {} =>
                    typeof arg === 'object'

                return enpipeSchemaStructIntoGuard(
                    { type: 'object', schema: guard, optional: false, tree: {} },
                    enpipeRuleMessageIntoGuard('object', guard)
                )
            }

            const keys = Object.keys(tree) as (keyof T)[]

            const optional = keys.filter(key => _hasOptionalProp(tree[key as keyof typeof tree]))
            const required = keys.filter(key => !_hasOptionalProp(tree[key as keyof typeof tree]))

            const config: ValidatorArgs<T> = { validators: tree, required, optional }

            const guard = (arg: unknown): arg is Sanitize<T> =>
                branchIfOptional(arg, []) ||
                Validators.BaseValidator.hasValidProperties(arg, config)

            const message =
                '{ ' +
                Object.entries(tree)
                    .map(
                        ([k, v]) =>
                            `${k}${optional.some(key => key === k) ? '?' : ''}: ${retrieveMessage(
                                v
                            )}`
                    )
                    .join(', ') +
                ' }'

            const metadata = {
                type: 'object' as const,
                schema: guard,
                optional: false,
                // ObjectConstructor interface is weird, it requires a length property if you annotate entries method overload
                tree: Object.entries<TypeGuard<Sanitize<T>[keyof Sanitize<T>]>>(
                    tree as unknown as Validators.ValidatorMap<Sanitize<T>> & { length: number }
                )
                    .map(([k, v]) => ({ [k]: getStructMetadata(v) }))
                    .reduce((acc, item) => Object.assign(acc, item), {}),
            } as Struct<'object', Sanitize<T>>

            return enpipeSchemaStructIntoGuard(metadata, enpipeRuleMessageIntoGuard(message, guard))
        }

        export function array(): TypeGuard<any[]>
        export function array(rules: Rules.Array[]): TypeGuard<any[]>
        export function array<T>(rules: Rules.Array[], schema: TypeGuard<T>): TypeGuard<T[]>
        export function array<T>(schema: TypeGuard<T>): TypeGuard<T[]>
        export function array<T>(
            rules?: Rules.Array[] | TypeGuard<T> | null | undefined,
            schema?: TypeGuard<T>
        ): TypeGuard<T[]>

        export function array<T>(
            rules: Rules.Array[] | TypeGuard<T> | null | undefined = void 0,
            _schema: TypeGuard<T> = any()
        ): TypeGuard<T[]> {
            if (!rules || typeof rules === 'function') {
                _schema = rules ?? _schema
                const guard = (arg: unknown): arg is T[] =>
                    Array.isArray(arg) && arg.every(item => _schema(item))

                return enpipeSchemaStructIntoGuard(
                    {
                        type: 'object',
                        schema: guard,
                        optional: false,
                        entries: getStructMetadata(_schema),
                    },
                    enpipeRuleMessageIntoGuard(`Array<${retrieveMessage(_schema)}>`, guard)
                )
            }

            const guard = (arg: unknown): arg is T[] =>
                branchIfOptional(arg, rules) ||
                (Array.isArray(arg) &&
                    isFollowingRules(arg, rules) &&
                    arg.every(item => _schema(item)))

            return enpipeSchemaStructIntoGuard(
                {
                    type: 'object',
                    schema: guard,
                    optional: false,
                    entries: getStructMetadata(_schema),
                },
                enpipeRuleMessageIntoGuard(`Array<${retrieveMessage(_schema)}>`, guard, rules)
            )
        }

        export function boolean(): TypeGuard<boolean> {
            const guard = (arg: unknown): arg is boolean =>
                branchIfOptional(arg, []) || typeof arg === 'boolean'

            return enpipeSchemaStructIntoGuard(
                { type: 'boolean', schema: guard, optional: false },
                enpipeRuleMessageIntoGuard('boolean', guard)
            )
        }

        export function symbol(): TypeGuard<symbol> {
            const guard = (arg: unknown): arg is symbol =>
                branchIfOptional(arg, []) || typeof arg === 'symbol'

            return enpipeSchemaStructIntoGuard(
                { type: 'symbol', schema: guard, optional: false },
                enpipeRuleMessageIntoGuard('symbol', guard)
            )
        }

        export function asUndefined(): TypeGuard<undefined> {
            const guard = (arg: unknown): arg is undefined =>
                branchIfOptional(arg, []) || arg === undefined

            return enpipeSchemaStructIntoGuard(
                { type: 'undefined', schema: guard, optional: false },
                enpipeRuleMessageIntoGuard('undefined', guard)
            )
        }

        export function asNull(): TypeGuard<null> {
            const guard = (arg: unknown): arg is null => branchIfOptional(arg, []) || arg === null

            return enpipeSchemaStructIntoGuard(
                { type: 'null', schema: guard, optional: false },
                enpipeRuleMessageIntoGuard('null', guard)
            )
        }

        // asEnum(["aa", "bb"])
        // asEnum(["Neutro", "Sempre", "Nunca", "Desconsiderar_Regras"])
        // asEnum([string(), boolean()])
        // asEnum([string(), boolean(), "aa"])

        export function asEnum<T extends Generics.PrimitiveType>(values: T[]): TypeGuard<T> {
            // export function asEnum<T extends TypeGuard<U>, U>(values: T[]): TypeGuard<ResolveIfTypeGuard<T>>
            // export function asEnum<T extends Generics.PrimitiveType | TypeGuard<any>>(values: T[]): TypeGuard<ResolveIfTypeGuard<T>>

            // export function asEnum<T extends []>(values: T): TypeGuard<T[number]>
            // export function asEnum<T extends Generics.PrimitiveType | TypeGuard<any>>(values: T[]): TypeGuard<ResolveIfTypeGuard<T>>
            const guard = (arg: unknown): arg is T =>
                branchIfOptional(arg, []) ||
                (primitive()(arg) && values.some(value => value === arg))

            return enpipeSchemaStructIntoGuard(
                { type: 'enum', schema: guard, optional: false } as Struct<'enum', T>,
                enpipeRuleMessageIntoGuard(`enum [ ${values.map(String).join(' | ')} ]`, guard)
            )
        }

        export function primitive(): TypeGuard<Generics.PrimitiveType> {
            const guard = (arg: unknown): arg is Generics.PrimitiveType =>
                branchIfOptional(arg, []) ||
                (Generics.Primitives as readonly string[]).includes(typeof arg)

            return enpipeSchemaStructIntoGuard(
                { type: 'primitive', schema: guard, optional: false },
                enpipeRuleMessageIntoGuard(
                    'primitive (string | number | boolean | symbol | null | undefined)',
                    guard
                )
            )
        }

        export function or<T1, T2>(guard1: TypeGuard<T1>, guard2: TypeGuard<T2>): TypeGuard<T1 | T2>
        export function or<T1, T2, T3>(
            guard1: TypeGuard<T1>,
            guard2: TypeGuard<T2>,
            guard3: TypeGuard<T3>
        ): TypeGuard<T1 | T2 | T3>
        export function or<T1, T2, T3, T4>(
            guard1: TypeGuard<T1>,
            guard2: TypeGuard<T2>,
            guard3: TypeGuard<T3>,
            guard4: TypeGuard<T4>
        ): TypeGuard<T1 | T2 | T3 | T4>
        export function or<T1, T2, T3, T4, T5>(
            guard1: TypeGuard<T1>,
            guard2: TypeGuard<T2>,
            guard3: TypeGuard<T3>,
            guard4: TypeGuard<T4>,
            guard5: TypeGuard<T5>
        ): TypeGuard<T1 | T2 | T3 | T4 | T5>
        export function or<T extends TypeGuard<any>>(...args: T[]): TypeGuard<GetTypeGuard<T>>

        export function or<T extends TypeGuard<any>>(...args: T[]): TypeGuard<GetTypeGuard<T>> {
            const guard = (arg: unknown): arg is GetTypeGuard<T> =>
                args.some(typeGuard => typeGuard(arg))

            return enpipeSchemaStructIntoGuard(
                {
                    type: 'union',
                    schema: guard,
                    optional: false,
                    tree: args.map(getStructMetadata),
                } as Struct<'union', GetTypeGuard<T>>,
                enpipeRuleMessageIntoGuard(`${args.map(retrieveMessage).join(' | ')}`, guard)
            )
        }

        export function and<T1, T2>(
            guard1: TypeGuard<T1>,
            guard2: TypeGuard<T2>
        ): TypeGuard<T1 & T2>
        export function and<T1, T2, T3>(
            guard1: TypeGuard<T1>,
            guard2: TypeGuard<T2>,
            guard3: TypeGuard<T3>
        ): TypeGuard<T1 & T2 & T3>
        export function and<T1, T2, T3, T4>(
            guard1: TypeGuard<T1>,
            guard2: TypeGuard<T2>,
            guard3: TypeGuard<T3>,
            guard4: TypeGuard<T4>
        ): TypeGuard<T1 & T2 & T3 & T4>
        export function and<T1, T2, T3, T4, T5>(
            guard1: TypeGuard<T1>,
            guard2: TypeGuard<T2>,
            guard3: TypeGuard<T3>,
            guard4: TypeGuard<T4>,
            guard5: TypeGuard<T5>
        ): TypeGuard<T1 & T2 & T3 & T4 & T5>
        export function and<T extends TypeGuard<any>>(
            ...args: T[]
        ): TypeGuard<GetTypeGuard<Generics.UnionToIntersection<T>>>

        export function and<T extends TypeGuard<any>>(...args: T[]): TypeGuard<GetTypeGuard<T>> {
            const guard = (arg: unknown): arg is GetTypeGuard<T> =>
                args.every(typeGuard => typeGuard(arg))

            return enpipeSchemaStructIntoGuard(
                {
                    type: 'intersection',
                    schema: guard,
                    optional: false,
                    tree: args.map(getStructMetadata),
                } as Struct<'intersection', GetTypeGuard<T>>,
                enpipeRuleMessageIntoGuard(`${args.map(retrieveMessage).join(' & ')}`, guard)
            )
        }

        export function any(): TypeGuard<any> {
            const guard = (_: unknown): _ is any => true

            return enpipeSchemaStructIntoGuard(
                { type: 'any', schema: guard, optional: false },
                enpipeRuleMessageIntoGuard('any', guard)
            )
        }
    }

    export namespace Rules {
        type OmitFirstItem<T extends any[]> = T extends [any, ...any[]] ? [...T[1]] : never
        export type RuleTuple = [
            rule: keys[keyof keys],
            args: OmitFirstItem<Parameters<bindings[keyof bindings]>>
        ]

        export const keys = {
            'Number.nonZero': '__Number.nonZero__',
            'Number.max': '__Number.max__',
            'Number.min': '__Number.min__',

            'Array.max': '__Array.max__',
            'Array.min': '__Array.min__',
            'Array.unique': '__Array.unique__',

            'String.max': '__String.max__',
            'String.min': '__String.min__',
            'String.regex': '__String.regex__',
            'String.nonEmpty': '__String.nonEmpty__',

            'optional': '__optional__',
        } as const
        type keys = typeof keys

        export const template = (message: string) => `[rule: ${message}]`
        export type MessageFormator = (...args: any[]) => string

        const max = (arg: number, n: number) => arg <= n
        const maxFormator = (n: number) => template(`max(${n})`)
        const arrayMaxFormator = (n: number) => template(`max ${n} items`)
        const stringMaxFormator = (n: number) => template(`max ${n} items`)

        const min = (arg: number, n: number) => arg >= n
        const minFormator = (n: number) => template(`min(${n})`)
        const arrayMinFormator = (n: number) => template(`min ${n} items`)
        const stringMinFormator = (n: number) => template(`min ${n} items`)

        const nonZero = (arg: number) => arg !== 0
        const nonZeroFormator = () => template(`!= 0`)

        const regexFormator = (regex: RegExp) => template(`matches ${regex}`)
        const nonEmptyFormator = () => template(`non empty`)

        const equals = (a: any, b: any): boolean => {
            if (a === b) return true
            if (typeof a !== 'object' || typeof b !== 'object') return false

            for (const key in a) {
                if (typeof b !== 'object' || !(key in b)) return false
            }

            for (const key in b) {
                if (typeof a !== 'object' || !(key in a)) return false
            }

            return [...new Set(Object.keys(a)).values()]
                .map(key => {
                    return equals(a[key], b[key])
                })
                .every(bool => bool)
        }
        const count = (element: unknown, arr: unknown[]) => {
            if (arr.length === 0) return 0

            return arr.filter(item => equals(item, element)).length
        }

        const unique = (arg: unknown[]) =>
            getRule('Array.max').call(null, arg, 0) ||
            arg.every((item, _, arr) => count(item, arr) === 1)
        const uniqueFormator = () => template(`unique items`)

        const bindings = {
            [keys['Number.nonZero']]: imprintMessageFormator(nonZeroFormator, nonZero),
            [keys['Number.max']]: imprintMessageFormator(maxFormator, max),
            [keys['Number.min']]: imprintMessageFormator(minFormator, min),

            [keys['Array.max']]: imprintMessageFormator(
                arrayMaxFormator,
                (arg: unknown[], n: number) => max(arg.length, n)
            ),
            [keys['Array.min']]: imprintMessageFormator(
                arrayMinFormator,
                (arg: unknown[], n: number) => min(arg.length, n)
            ),
            [keys['Array.unique']]: imprintMessageFormator(uniqueFormator, unique),

            [keys['String.max']]: imprintMessageFormator(
                stringMaxFormator,
                (arg: string, n: number) => max(arg.length, n)
            ),
            [keys['String.min']]: imprintMessageFormator(
                stringMinFormator,
                (arg: string, n: number) => min(arg.length, n)
            ),
            [keys['String.regex']]: imprintMessageFormator(
                regexFormator,
                (arg: string, regex: RegExp) => regex.test(arg)
            ),
            [keys['String.nonEmpty']]: imprintMessageFormator(nonEmptyFormator, (arg: string) =>
                getRule('Number.nonZero')?.(arg.length)
            ),

            [keys.optional]: (arg: unknown) => arg === void 0,
        } as const
        type bindings = typeof bindings

        export function getRule<T extends keyof keys>(name: T): bindings[keys[T]]
        export function getRule<T extends keyof keys, R extends Rule>(name: T): R

        export function getRule<T extends keyof bindings>(key: T): bindings[T]
        export function getRule<T extends keyof bindings, R extends Rule>(key: T): R

        export function getRule<T extends keyof keys | keyof bindings>(
            name: T
        ): bindings[keys[keyof keys]] | bindings[keyof bindings] {
            const isRuleName = (str: unknown): str is keyof keys =>
                typeof str === 'string' && str in keys

            const isKeyName = (str: unknown): str is keyof bindings =>
                typeof str === 'string' && str in bindings

            if (is(name, isRuleName)) return bindings[keys[name]]
            else if (is(name, isKeyName)) return bindings[name]

            throw new Error(`Rule not found`)
        }

        export function parseRule<R extends RuleTuple>(rule: R): bindings[typeof rule[0]]
        export function parseRule(rule: RuleTuple): bindings[keyof bindings] {
            return getRule(rule[0])
        }

        export type optional = [rule: keys['optional'], args: []]
        export const optional = () => [keys['optional'], []] as optional

        export const Number = {
            nonZero: () => [keys['Number.nonZero'], []] as [rule: keys['Number.nonZero'], args: []],
            max: (n: number) =>
                [keys['Number.max'], [n]] as [rule: keys['Number.max'], args: [n: number]],
            min: (n: number) =>
                [keys['Number.min'], [n]] as [rule: keys['Number.min'], args: [n: number]],

            optional,
        } as const
        export type Number = ReturnType<typeof Rules.Number[keyof typeof Rules.Number]>

        export const String = {
            min: (n: number) =>
                [keys['String.min'], [n]] as [rule: keys['String.min'], args: [n: number]],
            max: (n: number) =>
                [keys['String.max'], [n]] as [rule: keys['String.max'], args: [n: number]],
            regex: (regex: RegExp) =>
                [keys['String.regex'], [regex]] as [
                    rule: keys['String.regex'],
                    args: [regex: RegExp]
                ],
            nonEmpty: () =>
                [keys['String.nonEmpty'], []] as [rule: keys['String.nonEmpty'], args: []],

            optional,
        } as const
        export type String = ReturnType<typeof Rules.String[keyof typeof Rules.String]>

        export const Array = {
            min: (n: number) =>
                [keys['Array.min'], [n]] as [rule: keys['Array.min'], args: [n: number]],
            max: (n: number) =>
                [keys['Array.max'], [n]] as [rule: keys['Array.max'], args: [n: number]],
            unique: () => [keys['Array.unique'], []] as [rule: keys['Array.unique'], args: []],
            optional,
        } as const
        export type Array = ReturnType<typeof Rules.Array[keyof typeof Rules.Array]>

        export function isRule(rule: unknown): rule is Rules.All {
            if (!Schema.array()(rule)) return false

            const [r, args] = rule

            if (!Schema.string()(r)) return false
            if (!Schema.array()(args)) return false

            return true
        }
        export function isDefaultRule(rule: unknown): rule is Rules.All {
            if (!isRule(rule)) return false
            if (!(rule[0] in bindings)) return false

            return true
        }

        export const isCustomHandler = <Args extends any[] = unknown[]>(
            handler: unknown
        ): handler is CustomHandler<Args> =>
            typeof handler === 'function' &&
            typeof handler(void 0) === 'function' &&
            typeof handler(void 0)() === 'boolean'

        export const isCustom = <Args extends any[] = unknown[], RuleName extends string = string>(
            arg: [rule: string, args: any[], handler: (subject: unknown) => (...args: any[]) => any]
        ): arg is Custom<Args, RuleName> => {
            const [, , handler] = arg

            if (!isRule(arg)) return false
            if (!handler) return false

            if (!isCustomHandler(handler)) return false

            return true
        }
        export type CustomHandler<Args extends any[] = any[]> = (
            subject: unknown
        ) => (...args: Args) => boolean

        export type Custom<Args extends any[] = unknown[], RuleName extends string = string> = [
            rule: RuleName,
            args: Args,
            handler: CustomHandler<Args>
        ]

        export type Default = Rules.String | Rules.Number | Rules.Array
        export type All<Args extends any[] = unknown[], RuleName extends string = string> =
            | Rules.Default
            | Rules.Custom<Args, RuleName>

        parseRule(Number.nonZero())
    }
    export type Rule<Arg = any, Args = any> = (arg: Arg, ...args: Args[]) => boolean
}
