export namespace Generics {
    export const Primitives = [
        'string',
        'number',
        'bigint',
        'boolean',
        'symbol',
        'null',
        'undefined',
        'bigint',
    ] as const
    export const TypeOfTag = [...Primitives, 'object', 'function'] as const
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
    export declare type Primitives = Extract<typeof TypeOfTag[number], typeof Primitives[number]>
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

    export type UnionToIntersection<T> = (T extends any ? (x: T) => any : never) extends (
        x: infer R
    ) => any
        ? R
        : never

    export function safeJSON<T = GenericObject>(obj: T): SafeJSON<T> {
        return JSON.parse(JSON.stringify(obj))
    }

    export namespace V2 {
        export function safeJSON<T = GenericObject>(obj: T): T & SafeJSON<T> {
            return JSON.parse(JSON.stringify(obj))
        }
    }
}

export type NoParamsFunc<ReturnType = void> = Func<[], ReturnType>

export type OneParamFunc<Param1 = any, ReturnType = void> = Func<[Param1], ReturnType>
export type TwoParamsFunc<Param1 = any, Param2 = any, ReturnType = void> = Func<
    [Param1, Param2],
    ReturnType
>
export type ThreeParamsFunc<Param1 = any, Param2 = any, Param3 = any, ReturnType = void> = Func<
    [Param1, Param2, Param3],
    ReturnType
>
export type FourParamsFunc<
    Param1 = any,
    Param2 = any,
    Param3 = any,
    Param4 = any,
    ReturnType = void
> = Func<[Param1, Param2, Param3, Param4], ReturnType>
export type FiveParamsFunc<
    Param1 = any,
    Param2 = any,
    Param3 = any,
    Param4 = any,
    Param5 = any,
    ReturnType = void
> = Func<[Param1, Param2, Param3, Param4, Param5], ReturnType>

export type Func<Params extends any[] = [], ReturnType = void> = (...args: Params) => ReturnType
export type AsyncFunc<Params extends any[] = [], ReturnType = void> = (
    ...args: Params
) => Promise<ReturnType>

export type Async<T> = T extends Func<infer Params, infer RT>
    ? AsyncFunc<Params, RT>
    : T extends Promise<any>
    ? T
    : Promise<T>

export type MaybeAsync<T> = T extends Func<any[], any>
    ? T | Async<T>
    : T extends Promise<any>
    ? T
    : Promise<T>

export default Generics
