export type LengthOfTuple<T extends any[]> = T extends { length: infer L } ? L : never
export type DropFirstInTuple<T extends any[]> = ((...args: T) => any) extends (
    arg: any,
    ...rest: infer U
) => any
    ? U
    : T
export type LastInTuple<T extends any[]> = T[LengthOfTuple<DropFirstInTuple<T>>]
export type FirstInTuple<T extends any[]> = T[0]

export type Values<T> = T[keyof T]

export type OmitFirstItemFromTuple<T extends any[]> = T extends [any, ...infer rest]
    ? [...rest]
    : never

// A utility type to extract a subset of a tuple based on provided indices
export type TupleSubset<T extends any[], Indices extends number[]> = {
    [K in keyof Indices]: K extends keyof Indices
        ? Indices[K] extends keyof T
            ? T[Indices[K]]
            : never
        : never
}

export namespace TupleTools {
    export type IsNegative<T extends number> = `${T}` extends `-${string}` ? true : false

    export type TupleSplit<
        T,
        N extends number,
        O extends readonly any[] = readonly [],
    > = O['length'] extends N
        ? [O, T]
        : T extends readonly [infer F, ...infer R]
          ? TupleSplit<readonly [...R], N, readonly [...O, F]>
          : [O, T]

    export type TakeFirst<T extends readonly any[], N extends number> = TupleSplit<T, N>[0]

    export type SkipFirst<T extends readonly any[], N extends number> = TupleSplit<T, N>[1]

    // Utility type to create a tuple of a given length
    export type CreateTuple<L extends number, T = any, _ extends any[] = []> = _['length'] extends L
        ? _
        : CreateTuple<L, T, [..._, T]>

    // Add type
    export type Add<A extends number, B extends number> = [
        ...CreateTuple<A>,
        ...CreateTuple<B>,
    ]['length']

    // Subtract type
    export type Subtract<A extends number, B extends number> =
        CreateTuple<A> extends [...CreateTuple<B>, ...infer Rest] ? Rest['length'] : never

    export type FlipSign<T extends number> = `${T}` extends `-${infer U extends number}` // If T is a negative number
        ? U // Remove the '-' sign
        : T extends 0 // Handle the special case of 0
          ? 0
          : `-${T}` extends `${infer U extends number}` // If T is a positive number
            ? U // Add a '-' sign (TypeScript infers this as a negative literal)
            : never // Should not happen for valid numbers

    export type ParseNegativeIndex<T extends readonly any[], N extends number> =
        IsNegative<N> extends true ? Subtract<T['length'], FlipSign<N>> : N

    export type TupleSlice<
        T extends readonly any[],
        S extends number,
        E extends number = T['length'],
    > = TupleTools.SkipFirst<
        TupleTools.TakeFirst<T, TupleTools.ParseNegativeIndex<T, E>>,
        TupleTools.ParseNegativeIndex<T, S>
    >

    export type GreaterThanSize<T extends readonly any[], N extends number> = IsNegative<
        Subtract<N, T['length']>
    >

    export type MergeTuples<T extends readonly (readonly any[])[]> = T[number] extends readonly []
        ? []
        : T extends readonly [
                infer FirstTuple extends readonly any[],
                ...infer RestTuples extends readonly (readonly any[])[],
            ]
          ? FirstTuple extends readonly [infer Head, ...infer Tail]
              ? [
                    [Head, ...ExtractHeads<RestTuples>],
                    ...MergeTuples<[Tail, ...ExtractTails<RestTuples>]>,
                ]
              : []
          : []

    // Auxiliares para extrair os elementos da mesma posição nas outras tuplas
    type ExtractHeads<T extends readonly (readonly any[])[]> = T extends readonly [
        infer First extends readonly any[],
        ...infer Rest extends readonly (readonly any[])[],
    ]
        ? [First[0], ...ExtractHeads<Rest>]
        : []

    type ExtractTails<T extends readonly (readonly any[])[]> = T extends readonly [
        infer First extends readonly any[],
        ...infer Rest extends readonly (readonly any[])[],
    ]
        ? [First extends readonly [any, ...infer T] ? T : [], ...ExtractTails<Rest>]
        : []
}

export type TupleSlice<
    T extends readonly any[],
    S extends number,
    E extends number = T['length'],
> = TupleTools.TupleSlice<T, S, E>

export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
    k: infer I
) => void
    ? I
    : never
export type LastInUnion<U> =
    UnionToIntersection<U extends any ? (x: U) => 0 : never> extends (x: infer L) => 0 ? L : never

export type UnionToTuple<T, Last = LastInUnion<T>> = [T] extends [never]
    ? []
    : [...UnionToTuple<Exclude<T, Last>>, Last]

export type WrapTuple<T extends readonly any[], KName extends string = 'type'> = {
    [K in keyof T]: { [P in KName]: T[K] }
}

export type TupleToUnion<T extends readonly any[]> = T[number] extends any ? T[number] : never
