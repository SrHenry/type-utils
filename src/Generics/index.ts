import { TypeOfTag } from "typescript"

export namespace Generics
{
    export const Primitives = ["string", "number", "boolean", "symbol", "null", "undefined"] as const;
    export const TypeOfTag = [...Primitives, "bigint", "object", "function"] as const;
    export declare interface GenericObject<T = any> { [key: string]: T }
    export declare type PrimitiveType = string | number | boolean | symbol | null | undefined
    export declare type Primitives = Extract<TypeOfTag, typeof Primitives[number]>
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
    export declare type SafeProperty<T> = T extends FinalType ? T : T extends IsNotFunction<T> ? SafeJSON<T> : never

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

    export type UnionToIntersection<T> =
        (T extends any ? (x: T) => any : never) extends
        (x: infer R) => any ? R : never

    export function safeJSON<T = GenericObject>(obj: T): SafeJSON<T>
    {
        return JSON.parse(JSON.stringify(obj))
    }

    export namespace V2
    {
        export function safeJSON<T = GenericObject>(obj: T): T & SafeJSON<T>
        {
            return JSON.parse(JSON.stringify(obj))
        }

    }
}

export default Generics
