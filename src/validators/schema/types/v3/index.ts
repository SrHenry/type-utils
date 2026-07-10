import type Generics from '../../../../Generics/index.ts'
import type { ConstructorSignature, TypeGuard } from '../../../../TypeGuards/types/index.ts'
import type { ArrayRule } from '../../../rules/Array/index.ts'
import type { NumberRule } from '../../../rules/Number/index.ts'
import type { ObjectRule } from '../../../rules/Object/index.ts'
import type { RecordRule } from '../../../rules/Record/index.ts'
import type { StringRule } from '../../../rules/String/index.ts'
import type { StandardSchemaV1 } from '../../../standard-schema/types.ts'
import type {
    All as AllRules,
    Custom as CustomRule,
    RuleStruct,
} from '../../../rules/types/index.ts'

export type BaseStruct<T extends Generics.BaseTypes | 'custom', U> = {
    type: T
    schema: TypeGuard<U>
    optional: boolean
}

export namespace V3 {
    export type RequiredPartialStruct = {
        optional: false
    }
    export type OptionalPartialStruct = {
        optional: true
    }

    export type RequirefyStruct<S extends Struct> = Omit<S, 'optional'> & RequiredPartialStruct
    export type OptionalizeStruct<S extends Struct> = Omit<S, 'optional'> & OptionalPartialStruct

    export type PrimitiveStruct<
        Rules extends CustomRule<any[], string, Generics.PrimitiveType> = CustomRule<
            any[],
            string,
            Generics.PrimitiveType
        >,
    > = BaseStruct<'primitive', Generics.PrimitiveType> & WithRulesStruct<Rules>
    export type AnyStruct<
        Rules extends CustomRule<any[], string, any> = CustomRule<any[], string, any>,
    > = BaseStruct<'any', any> & WithRulesStruct<Rules>
    export type UndefinedStruct<
        Rules extends CustomRule<any[], string, undefined> = CustomRule<any[], string, undefined>,
    > = BaseStruct<'undefined', undefined> & WithRulesStruct<Rules>
    export type NullStruct<
        Rules extends CustomRule<any[], string, null> = CustomRule<any[], string, null>,
    > = BaseStruct<'null', null> & WithRulesStruct<Rules>
    export type BooleanStruct<
        Rules extends CustomRule<any[], string, boolean> = CustomRule<any[], string, boolean>,
    > = BaseStruct<'boolean', boolean> & WithRulesStruct<Rules>
    export type NumberStruct<
        Rules extends CustomRule<any[], string, number> = CustomRule<any[], string, number>,
    > = BaseStruct<'number', number> & WithRulesStruct<NumberRule | Rules>
    export type BigIntStruct<
        Rules extends CustomRule<any[], string, bigint> = CustomRule<any[], string, bigint>,
    > = BaseStruct<'bigint', bigint> & WithRulesStruct<NumberRule | Rules>
    export type StringStruct<
        Rules extends CustomRule<any[], string, string> = CustomRule<any[], string, string>,
    > = BaseStruct<'string', string> & WithRulesStruct<StringRule | Rules>
    export type SymbolStruct<
        Rules extends CustomRule<any[], string, symbol> = CustomRule<any[], string, symbol>,
    > = BaseStruct<'symbol', symbol> & WithRulesStruct<Rules>

    export type WithRulesStruct<Rule extends AllRules<any[], string, any>> = {
        rules: RuleStruct<Rule>[]
    }

    export type MapToStructs<Types extends any[]> = Types extends []
        ? []
        : Types extends [infer T0, ...infer TRest]
          ? [GenericStruct<T0, true> | CustomStruct<T0> | StructType, ...MapToStructs<TRest>]
          : (GenericStruct<any, true> | CustomStruct<any> | StructType)[]

    export type TUnion<Types extends any[]> = Types extends []
        ? never
        : Types extends [infer T0, ...infer TRest]
          ? TRest extends []
              ? T0
              : T0 | TUnion<TRest>
          : any
    export type TIntersection<Types extends any[]> = Types extends []
        ? never
        : Types extends [infer T0, ...infer TRest]
          ? TRest extends []
              ? T0
              : T0 & TIntersection<TRest>
          : any

    export type ExactExtends<TSource, TCompare, TValueIfTrue = TSource, TValueIfFalse = never> =
        Exclude<TSource, TCompare> extends never ? TValueIfTrue : TValueIfFalse
    export type IsExactExtension<TSource, TCompare> = ExactExtends<TSource, TCompare, true, false>

    type UnionOrIntersectionPartialStruct<Types extends any[]> = {
        types: MapToStructs<Types>
    }

    type EnumPartialStruct<T extends Generics.PrimitiveType = any> = {
        types: ((
            | StringStruct
            | NumberStruct
            | BigIntStruct
            | BooleanStruct
            | SymbolStruct
            | NullStruct
            | UndefinedStruct
        ) &
            Generics.WrapInObject<Generics.GetPrimitiveTag<T>, 'type'> &
            RequiredPartialStruct)[]
    }

    export type EnumStruct<
        T extends Generics.PrimitiveType = any,
        Rules extends CustomRule<any[], string, Generics.PrimitiveType> = CustomRule<
            any[],
            string,
            Generics.PrimitiveType
        >,
    > = BaseStruct<'enum', T> & EnumPartialStruct<T> & WithRulesStruct<Rules>

    export type UnionStruct<
        Types extends any[],
        Rules extends CustomRule<any[], string, any> = CustomRule<any[], string, any>,
    > = BaseStruct<'union', TUnion<Types>> &
        UnionOrIntersectionPartialStruct<Types> &
        WithRulesStruct<Rules>

    export type IntersectionStruct<
        Types extends any[],
        Rules extends CustomRule<any[], string, any> = CustomRule<any[], string, any>,
    > = BaseStruct<'intersection', TIntersection<Types>> &
        UnionOrIntersectionPartialStruct<Types> &
        WithRulesStruct<Rules>

    export type ObjectTree<T extends {}> = {
        tree: {
            [K in keyof T]: V3.GenericStruct<T[K]> | V3.StructType
        }
    }

    export type ObjectStruct<
        T extends {},
        Rules extends CustomRule<any[], string, T> = CustomRule<any[], string, T>,
    > = BaseStruct<'object', T> & ObjectTree<T> & WithRulesStruct<ObjectRule | Rules>

    export type ClassInstanceRef<T extends {}, ClassNameStr = string> = {
        constructor: ConstructorSignature<T>
        className: ClassNameStr
    }

    export type ClassInstanceStruct<
        T extends {},
        ClassNameStr = string,
        Rules extends CustomRule<any[], string, T> = CustomRule<any[], string, T>,
    > = BaseStruct<'object', T> &
        // biome-ignore lint/complexity/noBannedTypes: {} as generic constraint for non-nullish is idiomatic TS
        ObjectTree<{}> &
        ClassInstanceRef<T, ClassNameStr> &
        WithRulesStruct<Rules>

    export type ArrayEntries<U> = {
        entries: V3.GenericStruct<U>
    }

    export type ArrayStruct<
        U,
        Rules extends CustomRule<any[], string, U[]> = CustomRule<any[], string, U[]>,
    > = BaseStruct<'object', U[]> & ArrayEntries<U> & WithRulesStruct<ArrayRule | Rules>

    export type RecordMetadata<T extends {}> = {
        keyMetadata:
            | V3.StringStruct
            | V3.NumberStruct
            | V3.SymbolStruct
            | V3.EnumStruct<PropertyKey>
            | (V3.CustomStruct<string> & { kind: 'string' })
        valueMetadata: V3.GenericStruct<T[keyof T]> | V3.StructType
    }

    export type RecordStruct<
        K extends PropertyKey = string,
        T = any,
        Rules extends CustomRule<any[], string, Record<K, T>> = CustomRule<
            any[],
            string,
            Record<K, T>
        >,
    > = BaseStruct<'record', Record<K, T>> &
        RecordMetadata<Record<K, T>> &
        WithRulesStruct<RecordRule | Rules>

    export type TupleMetadata<T extends readonly [...any]> = {
        elements: TupleToStructMap<T>
    }
    export type TupleToTypeGuardMap<T extends readonly [...any]> = T extends readonly [
        infer T0,
        ...infer TRest,
    ]
        ? readonly [TypeGuard<T0>, ...TupleToTypeGuardMap<TRest>]
        : T

    export type TupleToStructMap<T extends readonly [...any]> = T extends readonly [
        infer T0,
        ...infer TRest,
    ]
        ? readonly [V3.GenericStruct<T0>, ...TupleToStructMap<TRest>]
        : T

    export type TypeGuardTupleUnwrap<T extends readonly [...any]> = T extends readonly [
        infer T0,
        ...infer TRest,
    ]
        ? T0 extends TypeGuard<infer U>
            ? [U, ...TypeGuardTupleUnwrap<TRest>]
            : T0 extends StandardSchemaV1<infer U, any>
              ? [U, ...TypeGuardTupleUnwrap<TRest>]
              : [T0, ...TypeGuardTupleUnwrap<TRest>]
        : T

    export type TupleStruct<
        T extends readonly [...any],
        Rules extends CustomRule<any[], string, T> = CustomRule<any[], string, T>,
    > = BaseStruct<'tuple', T> & TupleMetadata<T> & WithRulesStruct<Rules>

    export type CustomStruct<
        T,
        Rules extends CustomRule<any[], string, T> = CustomRule<any[], string, T>,
    > = Prettify<
        BaseStruct<'custom', T> & {
            /** kind of the custom struct's value mapped */
            kind?: string
            /** context metadata for the custom struct */
            context?: Record<string, any> | null
        } & WithRulesStruct<Rules>
    >

    export type GenericStruct<
        T = any,
        UnionOrIntersection extends 'union' | 'intersection' | true | false = true,
        Rules extends CustomRule<any[], string, any> = CustomRule<any[], string, any>,
        // biome-ignore lint/complexity/noBannedTypes: Function used in conditional type for type-level dispatch
    > = T extends Function
        ? AnyStruct<Rules> & { schema: TypeGuard<T> }
        : | Struct<T, Rules>
          | CustomStruct<T, Rules>
          | (UnionOrIntersection extends false
                ? never
                : UnionOrIntersection extends 'union'
                  ? T extends any[]
                      ? UnionStruct<T, Rules>
                      : never
                  : UnionOrIntersection extends 'intersection'
                    ? T extends any[]
                        ? IntersectionStruct<T, Rules>
                        : never
                    : T extends any[]
                      ? UnionStruct<T, Rules> | IntersectionStruct<T, Rules>
                      : never)

    export type AsPrimitiveStruct<
        T extends Generics.PrimitiveType,
        Rules extends CustomRule<any[], string, Generics.PrimitiveType> = CustomRule<
            any[],
            string,
            Generics.PrimitiveType
        >,
    > =
        IsExactExtension<Generics.PrimitiveType, T> extends true
            ? PrimitiveStruct<Rules>
            : IsExactExtension<T, undefined> extends true
              ? UndefinedStruct<Rules>
              : IsExactExtension<T, null> extends true
                ? NullStruct<Rules>
                : IsExactExtension<T, boolean> extends true
                  ? BooleanStruct<Rules>
                  : IsExactExtension<T, bigint> extends true
                    ? BigIntStruct<Rules>
                    : IsExactExtension<T, number> extends true
                      ? NumberStruct<Rules>
                      : IsExactExtension<T, string> extends true
                        ? StringStruct<Rules>
                        : IsExactExtension<T, symbol> extends true
                          ? SymbolStruct<Rules>
                          : never

    export type Struct<
        T = any,
        Rules extends CustomRule<any[], string, any> = CustomRule<any[], string, any>,
    > = T extends Generics.PrimitiveType
        ? EnumStruct<T, Rules> | IsExactExtension<T, undefined> extends true
            ? UndefinedStruct<Rules>
            : IsExactExtension<T, null> extends true
              ? NullStruct<Rules>
              : IsExactExtension<T, boolean> extends true
                ? BooleanStruct<Rules>
                : IsExactExtension<T, bigint> extends true
                  ? BigIntStruct<Rules>
                  : IsExactExtension<T, number> extends true
                    ? NumberStruct<Rules>
                    : IsExactExtension<T, string> extends true
                      ? StringStruct<Rules>
                      : IsExactExtension<T, symbol> extends true
                        ? SymbolStruct<Rules>
                        : never
        : T extends readonly [...any]
          ? TupleStruct<T, Rules>
          : T extends (infer U)[]
            ? ArrayStruct<U, Rules>
            : // biome-ignore lint/complexity/noBannedTypes: {} used in conditional type for object detection
              T extends {}
              ? | ObjectStruct<T, Rules>
                | RecordStruct<keyof T, T[keyof T], Rules>
                | ClassInstanceStruct<T, Rules>
              : never

    export type StructType<
        Rules extends CustomRule<any[], string, any> = CustomRule<any[], string, any>,
    > =
        | PrimitiveStruct<Rules>
        | AnyStruct<Rules>
        | UndefinedStruct<Rules>
        | NullStruct<Rules>
        | BooleanStruct<Rules>
        | NumberStruct<Rules>
        | BigIntStruct<Rules>
        | StringStruct<Rules>
        | SymbolStruct<Rules>
        | EnumStruct<Generics.PrimitiveType, Rules>
        | UnionStruct<any[], Rules>
        | IntersectionStruct<any[], Rules>
        | ObjectStruct<any, Rules>
        | ArrayStruct<any, Rules>
        | RecordStruct<string, any, Rules>
        | ClassInstanceStruct<any, Rules>
        | TupleStruct<any[], Rules>
        | CustomStruct<any, Rules>

    export type FromStruct<T extends Struct<any>> = T extends Struct<infer U> ? U : never
    export type FromUnionStruct<T extends UnionStruct<any>> =
        T extends UnionStruct<infer U> ? TUnion<U> : never
    export type FromIntersectionStruct<T extends IntersectionStruct<any>> =
        T extends IntersectionStruct<infer U> ? TIntersection<U> : never

    export type FromRecordStruct<T extends RecordStruct<any, any>> =
        T extends RecordStruct<infer K, infer T> ? Record<K, T> : never

    export type FromClassInstanceStruct<T extends ClassInstanceStruct<any>> =
        T extends ClassInstanceStruct<infer U> ? U : never

    export type FromTupleStruct<T extends TupleStruct<any>> =
        T extends TupleStruct<infer U> ? U : never
}

export type TUnion<Types extends any[]> = V3.TUnion<Types>
export type TIntersection<Types extends any[]> = V3.TIntersection<Types>
export type TypeGuardTupleUnwrap<T extends readonly [...any]> = V3.TypeGuardTupleUnwrap<T>
