import { Generics } from "../Generics"
import { AND } from "../helpers"
import { ensureInstanceOf, ensureInterface, GetTypeGuard, is, TypeGuard } from "../TypeGuards/GenericTypeGuards"
import { TypeGuardError } from "../TypeGuards/TypeErrors"
import * as _Rules from "./Rules"

export namespace Validators
{
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
        validators: ValidatorMap<T>,
        required?: Array<keyof T>,
        optional?: Array<keyof T>,
    }

    export type UnpackSchema<T extends ValidatorMap<any>> = T extends ValidatorMap<infer U> ? Sanitize<U> : never

    export type Unpack<T extends ValidatorMap<any>> = T extends ValidatorMap<infer U> ? Sanitize<U> : never

    export type Sanitize<T> = {
        [K in RequiredKeys<T>]-?: T[K]
    } & {
            [P in OptionalKeys<T>]+?: Exclude<T[P], undefined>
        }

    export abstract class BaseValidator
    {
        public static validateProperties<T, U>(arg: T, { validators, required = [], optional = [] }: ValidatorArgs<U>): U
        {
            const o = ensureInstanceOf(arg, Object) as Record<string, unknown>

            if (required.length === 0 && optional.length === 0) {
                for (const [prop, validator] of Object.entries<TypeGuard>(validators)) {
                    if (!(prop in o))
                        throw new TypeGuardError(`Property ${prop} is not defined`, o)

                    if (!validator(o[prop]))
                        throw new TypeGuardError(`Property '${prop}' failed validation`, o[prop], validator)
                }

                return o as U
            }

            for (const key of required) {
                if (!(key in o))
                    throw new TypeGuardError(`Missing required key ${key}`, o, validators[key])

                if (!validators[key](o[key as keyof typeof o]))
                    throw new TypeGuardError(`Invalid value for key ${key}`, o[key as keyof typeof o], validators[key])
            }
            for (const key of optional) {
                if ((key in o)) {
                    if (!validators[key](o[key as keyof typeof o]))
                        throw new TypeGuardError(`Invalid value for key ${key}`, o[key as keyof typeof o], validators[key])
                }
            }

            return o as U
        }

        public static hasValidProperties<T>(arg: unknown, vargs: ValidatorArgs<T>): arg is T
        {
            try {
                this.validateProperties(arg, vargs)

                return true
            } catch {
                return false
            }
        }

        public static validatePropertiesAsync<T, U>(arg: T, { validators, required = [], optional = [] }: ValidatorArgs<U>): Promise<U>
        {
            return new Promise((resolve, reject) =>
            {
                try {
                    resolve(this.validateProperties(arg, { validators, required, optional }))
                } catch (e: unknown) {
                    reject(e)
                }
            })
        }

        public static isValidArray<T>(arg: unknown, args: ValidatorArgs<T>): arg is Array<T>
        {
            try {
                this.validateArray(arg, args)

                return true
            } catch {
                return false
            }
        }

        public static validateArray<T, U>(arg: T, args: ValidatorArgs<U>): U[]
        {
            if (!Array.isArray(arg))
                throw new TypeGuardError(`Invalid type for array`, arg, Array)

            for (const item of arg) {
                this.validateProperties(item, args)
            }

            return arg as U[]
        }

        public static extractWithFallback<T, U>(arg: T, args: ValidatorArgs<U>): U | undefined
        public static extractWithFallback<T, U>(arg: T, args: ValidatorArgs<U>, defaultValue: U): U
        public static extractWithFallback<T, U>(arg: T, args: TypeGuard<U>, defaultValue: U): U
        public static extractWithFallback<T, U>(arg: T, args: TypeGuard<U>): U | undefined

        public static extractWithFallback<T, U>(arg: T, args: ValidatorArgs<U> | TypeGuard<U>, defaultValue: U | undefined = undefined): U | undefined
        {
            if (typeof args === "function")
                return is(arg, args) ? arg : (defaultValue ?? void 0)
            return this.hasValidProperties(arg, args) ? arg : (defaultValue ?? void 0)
        }

        public static validate<T, U>(arg: T, schema: TypeGuard<U>): U
        {
            return ensureInterface(arg, schema)
        }

        public static isValid<T>(arg: unknown, schema: TypeGuard<T>): arg is T
        {
            return schema(arg)
        }
    }

    export const validator = BaseValidator

    export namespace Schema
    {
        type Optionalize<T> = {
            [K in keyof T]: T[K] extends () => TypeGuard<any | any[]> ? (...args: Parameters<T[K]>) => OptionalizeTypeGuard<ReturnType<T[K]>> : T[K]
        }

        type OptionalizeTypeGuard<T extends TypeGuard<any | any[]>> = TypeGuard<GetTypeGuard<T> | undefined>
        type OptionalizeTypeGuardClosure<T extends TypeGuardClosure<ClosureGuard, ClosureArgs>, ClosureGuard = any, ClosureArgs extends any[] = any[]> =
            TypeGuardClosure<GetTypeGuard<ReturnType<T> | undefined>, Parameters<T>>

        type TypeGuardClosure<T = any, Params extends any[] = any[]> = (...args: Params) => TypeGuard<T>

        type optionalCircular = Optionalize<Omit<typeof Schema, 'optional' | 'array' | 'and' | 'or' | 'asEnum' | 'useSchema'>> & {
            array(): OptionalizeTypeGuard<TypeGuard<any[]>>
            array(rules: Rules.Array[]): OptionalizeTypeGuard<TypeGuard<any[]>>
            array<T>(rules: Rules.Array[], schema: TypeGuard<T>): OptionalizeTypeGuard<TypeGuard<T[]>>
            array<T>(schema: TypeGuard<T>): OptionalizeTypeGuard<TypeGuard<T[]>>

            and<T1, T2>(guard1: TypeGuard<T1>, guard2: TypeGuard<T2>): OptionalizeTypeGuard<TypeGuard<T1 & T2>>
            and<T1, T2, T3>(guard1: TypeGuard<T1>, guard2: TypeGuard<T2>, guard3: TypeGuard<T3>): OptionalizeTypeGuard<TypeGuard<T1 & T2 & T3>>
            and<T1, T2, T3, T4>(guard1: TypeGuard<T1>, guard2: TypeGuard<T2>, guard3: TypeGuard<T3>, guard4: TypeGuard<T4>): OptionalizeTypeGuard<TypeGuard<T1 & T2 & T3 & T4>>
            and<T1, T2, T3, T4, T5>(guard1: TypeGuard<T1>, guard2: TypeGuard<T2>, guard3: TypeGuard<T3>, guard4: TypeGuard<T4>, guard5: TypeGuard<T5>): OptionalizeTypeGuard<TypeGuard<T1 & T2 & T3 & T4 & T5>>
            and<T extends TypeGuard<any>>(...args: T[]): OptionalizeTypeGuard<TypeGuard<GetTypeGuard<Generics.UnionToIntersection<T>>>>

            or<T1, T2>(guard1: TypeGuard<T1>, guard2: TypeGuard<T2>): OptionalizeTypeGuard<TypeGuard<T1 | T2>>
            or<T1, T2, T3>(guard1: TypeGuard<T1>, guard2: TypeGuard<T2>, guard3: TypeGuard<T3>): OptionalizeTypeGuard<TypeGuard<T1 | T2 | T3>>
            or<T1, T2, T3, T4>(guard1: TypeGuard<T1>, guard2: TypeGuard<T2>, guard3: TypeGuard<T3>, guard4: TypeGuard<T4>): OptionalizeTypeGuard<TypeGuard<T1 | T2 | T3 | T4>>
            or<T1, T2, T3, T4, T5>(guard1: TypeGuard<T1>, guard2: TypeGuard<T2>, guard3: TypeGuard<T3>, guard4: TypeGuard<T4>, guard5: TypeGuard<T5>): OptionalizeTypeGuard<TypeGuard<T1 | T2 | T3 | T4 | T5>>
            or<T extends TypeGuard<any>>(...args: T[]): OptionalizeTypeGuard<TypeGuard<GetTypeGuard<T>>>

            asEnum<T extends Generics.PrimitiveType>(values: T[]): OptionalizeTypeGuard<TypeGuard<T>>
            useSchema<T>(schema: TypeGuard<T>): OptionalizeTypeGuard<TypeGuard<T>>
        }

        const isOptional = (rule: Rules.All): rule is Rules.optional => rule[0] in Rules.keys && rule[0] === Rules.keys.optional
        const isRequired = (rule: Rules.All): rule is Exclude<Rules.All, Rules.optional> => !isOptional(rule)
        const branchIfOptional = (arg: unknown, rules: Rules.All[]) => (rules.some(isOptional) ? Rules.getRule(rules.find(isOptional)![0]).call(null, arg) : false)
        const isFollowingRules = (arg: unknown, rules: Rules.All[]) => AND(...(rules.filter(isRequired).map(([rule, args]) => Rules.getRule<typeof rule, Rule>(rule).call(null, arg, ...args))))

        const _hasOptionalProp = (schema: TypeGuard): boolean =>
        {
            const hasFlag = (o: any): o is { __optional__: boolean } => "__optional__" in o

            return hasFlag(schema)
        }

        export function number(rules: Rules.Number[] = []): TypeGuard<number>
        {

            return (arg: unknown): arg is number => branchIfOptional(arg, rules) || (
                typeof arg === "number" &&
                isFollowingRules(arg, rules)
            )
        }

        export function string<str extends string = string>(rules: Rules.String[] = []): TypeGuard<str>
        {
            return (arg: unknown): arg is str => branchIfOptional(arg, rules) || (
                typeof arg === "string" &&
                isFollowingRules(arg, rules)
            )
        }

        export function optional(): optionalCircular
        {
            const wrapOptional = <T extends TypeGuardClosure>(fn: T): OptionalizeTypeGuardClosure<T> =>
                (...args: Parameters<T>) =>
                {
                    const closure = (arg: unknown): arg is GetTypeGuard<ReturnType<T>> =>
                        Rules.getRule("optional")(arg) ||
                        fn(...args)(arg)

                    closure["__optional__"] = true

                    return closure
                }


            return Array.from(Object.entries(Schema))
                .filter((entry): entry is [string, Exclude<typeof entry[1], typeof optional>] =>
                {
                    const [, exported] = entry
                    return exported !== optional
                })
                .reduce<optionalCircular>((obj, [key, exp]) => Object.assign(obj, { [key]: wrapOptional(exp) }) as optionalCircular, {} as optionalCircular)
        }

        export function useSchema<T>(schema: TypeGuard<T>): TypeGuard<T>
        {
            return schema
        }

        export function object<T>(schema: Validators.ValidatorMap<T>): TypeGuard<Sanitize<T>>
        {
            const keys = Object.keys(schema) as (keyof T)[]

            const optional = keys.filter((key) => _hasOptionalProp(schema[key as keyof typeof schema]))
            const required = keys.filter((key) => !_hasOptionalProp(schema[key as keyof typeof schema]))

            const config: ValidatorArgs<T> = { validators: schema, required, optional }

            console.log(config)

            return (arg: unknown): arg is Sanitize<T> => branchIfOptional(arg, []) ||
                Validators.BaseValidator.hasValidProperties(arg, config)
        }

        export function array(): TypeGuard<any[]>
        export function array(rules: Rules.Array[]): TypeGuard<any[]>
        export function array<T>(rules: Rules.Array[], schema: TypeGuard<T>): TypeGuard<T[]>
        export function array<T>(schema: TypeGuard<T>): TypeGuard<T[]>
        export function array<T>(rules?: Rules.Array[] | TypeGuard<T> | null | undefined, schema?: TypeGuard<T>): TypeGuard<T[]>

        export function array<T>(rules: Rules.Array[] | TypeGuard<T> | null | undefined = void 0, _schema: TypeGuard<T> = any()): TypeGuard<T[]>
        {
            if (!rules || typeof rules === "function")
                return (arg: unknown): arg is T[] => Array.isArray(arg) && arg.every(item => _schema(item))

            return (arg: unknown): arg is T[] => branchIfOptional(arg, rules) ||
                (Array.isArray(arg) && isFollowingRules(arg, rules) &&
                    arg.every(item => _schema(item)))
        }

        export function boolean(): TypeGuard<boolean>
        {
            return (arg: unknown): arg is boolean => branchIfOptional(arg, []) || typeof arg === "boolean"
        }

        export function symbol(): TypeGuard<symbol>
        {
            return (arg: unknown): arg is symbol => branchIfOptional(arg, []) || typeof arg === "symbol"
        }

        export function asNull(): TypeGuard<null>
        {
            return (arg: unknown): arg is null => branchIfOptional(arg, []) || arg === null
        }

        // asEnum(["aa", "bb"])
        // asEnum(["Neutro", "Sempre", "Nunca", "Desconsiderar_Regras"])
        // asEnum([string(), boolean()])
        // asEnum([string(), boolean(), "aa"])

        export function asEnum<T extends Generics.PrimitiveType>(values: T[]): TypeGuard<T>
        // export function asEnum<T extends TypeGuard<U>, U>(values: T[]): TypeGuard<ResolveIfTypeGuard<T>>
        // export function asEnum<T extends Generics.PrimitiveType | TypeGuard<any>>(values: T[]): TypeGuard<ResolveIfTypeGuard<T>>

        // export function asEnum<T extends []>(values: T): TypeGuard<T[number]>
        // export function asEnum<T extends Generics.PrimitiveType | TypeGuard<any>>(values: T[]): TypeGuard<ResolveIfTypeGuard<T>>
        {
            return (arg: unknown): arg is T => branchIfOptional(arg, []) || primitive()(arg) && values.some(value => value === arg)
        }

        export function primitive(): TypeGuard<Generics.PrimitiveType>
        {
            return (arg: unknown): arg is Generics.PrimitiveType => branchIfOptional(arg, []) || (Generics.Primitives as readonly string[]).includes(typeof arg)
        }

        export function or<T1, T2>(guard1: TypeGuard<T1>, guard2: TypeGuard<T2>): TypeGuard<T1 | T2>
        export function or<T1, T2, T3>(guard1: TypeGuard<T1>, guard2: TypeGuard<T2>, guard3: TypeGuard<T3>): TypeGuard<T1 | T2 | T3>
        export function or<T1, T2, T3, T4>(guard1: TypeGuard<T1>, guard2: TypeGuard<T2>, guard3: TypeGuard<T3>, guard4: TypeGuard<T4>): TypeGuard<T1 | T2 | T3 | T4>
        export function or<T1, T2, T3, T4, T5>(guard1: TypeGuard<T1>, guard2: TypeGuard<T2>, guard3: TypeGuard<T3>, guard4: TypeGuard<T4>, guard5: TypeGuard<T5>): TypeGuard<T1 | T2 | T3 | T4 | T5>
        export function or<T extends TypeGuard<any>>(...args: T[]): TypeGuard<GetTypeGuard<T>>

        export function or<T extends TypeGuard<any>>(...args: T[]): TypeGuard<GetTypeGuard<T>>
        {
            return (arg: unknown): arg is GetTypeGuard<T> => args.some(typeGuard => typeGuard(arg))
        }

        export function and<T1, T2>(guard1: TypeGuard<T1>, guard2: TypeGuard<T2>): TypeGuard<T1 & T2>
        export function and<T1, T2, T3>(guard1: TypeGuard<T1>, guard2: TypeGuard<T2>, guard3: TypeGuard<T3>): TypeGuard<T1 & T2 & T3>
        export function and<T1, T2, T3, T4>(guard1: TypeGuard<T1>, guard2: TypeGuard<T2>, guard3: TypeGuard<T3>, guard4: TypeGuard<T4>): TypeGuard<T1 & T2 & T3 & T4>
        export function and<T1, T2, T3, T4, T5>(guard1: TypeGuard<T1>, guard2: TypeGuard<T2>, guard3: TypeGuard<T3>, guard4: TypeGuard<T4>, guard5: TypeGuard<T5>): TypeGuard<T1 & T2 & T3 & T4 & T5>
        export function and<T extends TypeGuard<any>>(...args: T[]): TypeGuard<GetTypeGuard<Generics.UnionToIntersection<T>>>

        export function and<T extends TypeGuard<any>>(...args: T[]): TypeGuard<GetTypeGuard<T>>
        {
            return (arg: unknown): arg is GetTypeGuard<T> => args.every(typeGuard => typeGuard(arg))
        }

        export function any(): TypeGuard<any>
        {
            return (_: unknown): _ is any => true
        }
    }

    export namespace Rules
    {
        export const keys = {
            "Number.nonZero": "__Number.nonZero__",
            "Number.max": "__Number.max__",
            "Number.min": "__Number.min__",

            "Array.max": "__Array.max__",
            "Array.min": "__Array.min__",
            "Array.unique": "__Array.unique__",

            "String.max": "__String.max__",
            "String.min": "__String.min__",
            "String.regex": "__String.regex__",
            "String.nonEmpty": "__String.nonEmpty__",

            optional: "__optional__",
        } as const
        type keys = typeof keys

        const max = (arg: number, n: number) => arg <= n
        const min = (arg: number, n: number) => arg >= n

        const equals = (a: any, b: any): boolean =>
        {
            if (a === b) return true
            if (typeof a !== "object" || typeof b !== "object") return false

            for (const key in a) {
                if (typeof b !== "object" || !(key in b)) return false
            }

            for (const key in b) {
                if (typeof a !== "object" || !(key in a)) return false
            }

            return [...new Set(Object.keys(a)).values()]
                .map(key =>
                {
                    return equals(a[key], b[key])
                }).every(bool => bool)
        }
        const count = (element: unknown, arr: unknown[]) =>
        {
            if (arr.length === 0) return 0

            return arr.filter(item => equals(item, element)).length
        }

        const bindings = {
            [keys["Number.nonZero"]]: (arg: number) => arg !== 0,
            [keys["Number.max"]]: max,
            [keys["Number.min"]]: min,

            [keys["Array.max"]]: (arg: unknown[], n: number) => max(arg.length, n),
            [keys["Array.min"]]: (arg: unknown[], n: number) => min(arg.length, n),
            [keys["Array.unique"]]: (arg: unknown[]) =>
                getRule("Array.max").call(null, arg, 0) ||
                arg.every((item, _, arr) => count(item, arr) === 1),

            [keys["String.max"]]: (arg: string, n: number) => max(arg.length, n),
            [keys["String.min"]]: (arg: string, n: number) => min(arg.length, n),
            [keys["String.regex"]]: (arg: string, regex: RegExp) => regex.test(arg),
            [keys["String.nonEmpty"]]: (arg: string) => getRule("Number.nonZero")?.(arg.length),

            [keys.optional]: (arg: unknown) => arg === void 0,
        } as const
        type bindings = typeof bindings

        export function getRule<T extends keyof keys>(name: T): bindings[keys[T]]
        export function getRule<T extends keyof keys, R extends Rule>(name: T): R

        export function getRule<T extends keyof bindings>(key: T): bindings[T]
        export function getRule<T extends keyof bindings, R extends Rule>(key: T): R

        export function getRule<T extends (keyof keys | keyof bindings)>(name: T): bindings[keys[keyof keys]] | bindings[keyof bindings]
        {
            const isRuleName = (str: unknown): str is keyof keys =>
                typeof str === "string" && str in keys

            const isKeyName = (str: unknown): str is keyof bindings =>
                typeof str === "string" && str in bindings

            if (is(name, isRuleName))
                return bindings[keys[name]]
            else if (is(name, isKeyName))
                return bindings[name]

            throw new Error(`Rule not found`)
        }

        export type optional = [rule: keys['optional'], args: []]
        export const optional = () => [keys['optional'], []] as optional

        export const Number = {
            nonZero: () => [keys['Number.nonZero'], []] as [rule: keys['Number.nonZero'], args: []],
            max: (n: number) => [keys['Number.max'], [n]] as [rule: keys['Number.max'], args: [n: number]],
            min: (n: number) => [keys['Number.min'], [n]] as [rule: keys['Number.min'], args: [n: number]],

            optional,
        } as const
        export type Number = ReturnType<typeof Rules.Number[keyof typeof Rules.Number]>

        export const String = {
            min: (n: number) => [keys['String.min'], [n]] as [rule: keys['String.min'], args: [n: number]],
            max: (n: number) => [keys['String.max'], [n]] as [rule: keys['String.max'], args: [n: number]],
            regex: (regex: RegExp) => [keys['String.regex'], [regex]] as [rule: keys['String.regex'], args: [regex: RegExp]],
            nonEmpty: () => [keys['String.nonEmpty'], []] as [rule: keys['String.nonEmpty'], args: []],

            optional,
        } as const
        export type String = ReturnType<typeof Rules.String[keyof typeof Rules.String]>

        export const Array = {
            min: (n: number) => [keys['Array.min'], [n]] as [rule: keys['Array.min'], args: [n: number]],
            max: (n: number) => [keys['Array.max'], [n]] as [rule: keys['Array.max'], args: [n: number]],
            unique: () => [keys['Array.unique'], []] as [rule: keys['Array.unique'], args: []],
            optional,
        } as const
        export type Array = ReturnType<typeof Rules.Array[keyof typeof Rules.Array]>

        export type All = Rules.String | Rules.Number | Rules.Array
    }
    export type Rule<Arg = any, Args = any> = (arg: Arg, ...args: Args[]) => boolean
}