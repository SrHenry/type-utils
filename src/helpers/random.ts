import type { Fn, Infer } from '../types/index.ts'
import type { FluentSchema } from '../validators/schema/types/FluentSchema.ts'

import { match } from '../match/index.ts'
import { array } from '../validators/schema/array.ts'
import { number } from '../validators/schema/number.ts'
import { symbol } from '../validators/schema/symbol.ts'
import { tuple } from '../validators/schema/tuple.ts'
import { $throw } from './throw.ts'
import { createInlineRule } from '../validators/rules/helpers/createInlineRule.ts'
import { object } from '../validators/schema/object.ts'
import { range } from './range.ts'

/** unique symbol representing a param not passed to `random` */
const NULL_PARAM = Symbol('[src/helpers/random] null param')

const nullParam = () =>
    symbol().use(
        createInlineRule(
            `Custom.Symbol.StrictEqual(${NULL_PARAM.description ?? 'NULL_PARAM'})`,
            s => s === NULL_PARAM
        )
    )

const arrayLike = () =>
    object({ length: number().min(1) }).use(
        createInlineRule(`Custom.Object.ArrayLike($0)`, o =>
            [...range(o.length)].every(i => i in o)
        )
    )

const is_n = () => tuple(number().min(1), nullParam()) as FluentSchema<[n: number, _: symbol]>
const is_min_max = () =>
    tuple(number().min(1), number().min(2)).use(
        createInlineRule(`Custom.Tuple.GreaterThan($1, $0)`, ([arg1, arg2]) => arg1 <= arg2)
    ) as FluentSchema<[min: number, max: number]>
const is_from_Array = () =>
    tuple(array<unknown>().min(1), nullParam()) as FluentSchema<[arr: unknown[], _: symbol]>
const is_from_ArrayLike = () =>
    tuple(arrayLike(), nullParam()) as FluentSchema<[arr: ArrayLike<unknown>, _: symbol]>

type RandomFnArgs =
    | Infer<ReturnType<typeof is_n>>
    | Infer<ReturnType<typeof is_min_max>>
    | Infer<ReturnType<typeof is_from_Array>>
    | Infer<ReturnType<typeof is_from_ArrayLike>>

const invoke =
    <TFn extends Fn<[...any[]], any>>(fn: TFn) =>
    <TArgs extends [...Parameters<TFn>, ...any[]]>(args: TArgs): ReturnType<TFn> =>
        fn(...args)

const getRandom = (n: number): number => Math.random() * n
const getRandomInt = (n: number): number => Math.floor(getRandom(Math.floor(n)))
const getRandomInRange = (min: number, max: number): number => getRandom(max - min) + min
const getRandomIntInRange = (min: number, max: number): number =>
    getRandomInRange(Math.floor(min), Math.floor(max))
const getRandomFromArrayLike = (from: ArrayLike<unknown>): unknown =>
    from[getRandomInt(from.length)]

/** Returns a random int number between `0` and `n` */
/** Returns a random int number between `min` and `max` */
export function random(min: number, max?: number): number
/** Returns a random element from an array */
/** Returns a random element from a list array-like */
export function random<const T>(from: ArrayLike<T>): T
export function random(
    min_or_n_or_list: number | ArrayLike<unknown>,
    max: number | typeof NULL_PARAM = NULL_PARAM
): number | unknown {
    const args = [min_or_n_or_list, max] as RandomFnArgs
    return match(args)
        .with(is_n(), invoke(getRandomInt))
        .with(is_min_max(), invoke(getRandomIntInRange))
        .with(is_from_Array(), invoke(getRandomFromArrayLike))
        .with(is_from_ArrayLike(), invoke(getRandomFromArrayLike))
        .default(() => $throw(new TypeError('Invalid params!')))
        .exec()
}
