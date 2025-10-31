export namespace Generics {
    export const TypeOfTagPrimitives = [
        'string',
        'number',
        'bigint',
        'boolean',
        'symbol',
        'undefined',
    ] as const
    export const Primitives = [...TypeOfTagPrimitives, 'null'] as const
    export const TypeOfTag = [...TypeOfTagPrimitives, 'object', 'function'] as const

    export const BaseTypes = [
        ...Generics.TypeOfTag,
        'null',
        'enum',
        'primitive',
        'union',
        'intersection',
        'record',
        'tuple',
        'any',
    ] as const

    export declare type TypeOfTag = (typeof TypeOfTag)[number]

    export declare type BaseTypes =
        | TypeOfTag
        | 'null'
        | 'enum'
        | 'primitive'
        | 'union'
        | 'intersection'
        | 'record'
        | 'tuple'
        | 'any'

    export declare interface GenericObject<T = any> {
        [key: string]: T
    }
    export declare type PrimitiveType =
        | string
        | number
        | bigint
        | boolean
        | symbol
        | null
        | undefined
    export declare type Primitives = (typeof Primitives)[number]

    export declare type GetPrimitiveTag<T extends PrimitiveType> = T extends string
        ? 'string'
        : T extends number
        ? 'number'
        : T extends bigint
        ? 'bigint'
        : T extends boolean
        ? 'boolean'
        : T extends symbol
        ? 'symbol'
        : T extends null
        ? 'null'
        : T extends undefined
        ? 'undefined'
        : never
    export declare type FinalType = FinalType[] | PrimitiveType
    export declare type IsFunction<T> = T extends Function ? T : never
    export declare type IsNotFunction<T> = T extends Function ? never : T
    export type FunctionPropertyNames<T> = {
        // [P in keyof T]: Generics.IsFunction<P>
        [P in keyof T]: T[P] extends Function ? P : never
    }[keyof T]
    export type ConstructorPropertyNames<T> = {
        [P in keyof T]: T[P] extends new (...args: any[]) => any ? P : never
    }[keyof T]
    export type OmitConstructors<T> = Omit<T, ConstructorPropertyNames<T>>
    export type FunctionProperties<T> = Pick<T, FunctionPropertyNames<T>>
    export type PropertyType<T, K extends keyof T> = T[K]
    export declare type Functionless<T> = Omit<T, FunctionPropertyNames<T>>
    export declare type SafeProperty<T> = T extends FinalType
        ? T
        : T extends IsNotFunction<T>
        ? SafeJSON<T>
        : never

    declare type _NestedObjects<T> = {
        [P in keyof T]: T[P] extends object ? P : never
    }[keyof T]
    declare type _PrimitivesOf<T> = {
        [P in keyof T]: T[P] extends FinalType ? P : never
    }[keyof T]

    export declare type NestedObjects<T> = Omit<T, _NestedObjects<T>>
    export declare type PrimitivesOf<T> = Omit<T, _PrimitivesOf<T>>

    export declare type NeverProps<T> = {
        [P in keyof T]: T[P] extends never ? P : never
    }[keyof T]
    export declare type OmitNever<T> = Omit<T, NeverProps<T>>

    export declare type NeveredType<T> = {
        [P in keyof T]: SafeProperty<T[P]>
    }

    export declare type SafeJSON<T> = OmitNever<NeveredType<T>>
    export type ExtractFunctions<T> = FunctionProperties<T>

    export type IsUnion<T> = [T] extends [UnionToIntersection<T>] ? false : true

    export type UnionToIntersection<T> = (T extends any ? (x: T) => void : never) extends (
        x: infer R
    ) => void
        ? R
        : never

    export type InferReadonlyTuple<T> = T extends readonly [...infer Elements] ? Elements : never

    export function safeJSON<T = GenericObject>(obj: T): SafeJSON<T> {
        return JSON.parse(JSON.stringify(obj))
    }

    export namespace V2 {
        export function safeJSON<T = GenericObject>(obj: T): T & SafeJSON<T> {
            return JSON.parse(JSON.stringify(obj))
        }
    }
}

export default Generics
