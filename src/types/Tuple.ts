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
