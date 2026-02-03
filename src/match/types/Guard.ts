export type Guard<TOut extends TIn = any, TIn = any> = (value: TIn) => value is TOut
