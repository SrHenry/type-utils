import { asTypeGuard } from '../TypeGuards/helpers/asTypeGuard'

import { and } from '../validators/schema/and'
import { array } from '../validators/schema/array'
import { number } from '../validators/schema/number'
import { symbol } from '../validators/schema/symbol'
import { tuple } from '../validators/schema/tuple'

/** unique symbol representing a param not passed to `random` */
const NULL_PARAM = Symbol('[src/helpers/random] null param')

/// reusable schemas for this feature:
const nullParam = () =>
    and(
        symbol(),
        asTypeGuard((s: symbol) => s === NULL_PARAM, {
            kind: 'unique symbol',
            context: {
                symbol: NULL_PARAM,
            },
        })
    )
const maxGreaterThanMin = () =>
    asTypeGuard(([arg1, arg2]: [number, number]) => arg1 <= arg2, {
        kind: 'tuple[number, number]',
        context: {
            constraints: [
                {
                    name: 'greaterThan',
                    operands: ['$1', '$0'],
                    message: '$1 must be greater than $0',
                },
            ],
        },
    })
const arrayLike = () =>
    asTypeGuard<ArrayLike<unknown>>(
        (arg: unknown) =>
            typeof arg === 'object' &&
            arg !== null &&
            'length' in arg &&
            typeof arg.length === 'number' &&
            arg.length > 0 &&
            arg.length - 1 in arg,
        {
            kind: 'arrayLike',
            context: {
                constraints: [
                    {
                        name: '__not_empty',
                        operands: ['$'],
                    },
                ],
            },
        }
    )

/// param schemas (one for each signature):
const is_n = tuple(number().min(1), nullParam())
const is_min_max = and(tuple(number().min(1), number().min(2)), maxGreaterThanMin())
const is_from_Array = tuple(array<unknown>().min(1), nullParam())
const is_from_ArrayLike = tuple(arrayLike(), nullParam())

/** Returns a random number between `0` and `n` */
export function random(n: number): number
/** Returns a random number between `min` and `max` */
export function random(min: number, max: number): number
/** Returns a random element from an array */
export function random<const T>(from: T[]): T
/** Returns a random element from a list array-like */
export function random<const T>(from: ArrayLike<T>): T

export function random(
    min_or_n_or_list: number | ArrayLike<unknown>,
    max: number | typeof NULL_PARAM = NULL_PARAM
): number | unknown {
    if (max === NULL_PARAM) {
        if (is_n([min_or_n_or_list, max])) {
            const n = min_or_n_or_list as number

            return Math.floor(Math.random() * n)
        } else if (
            is_from_Array([min_or_n_or_list, max]) ||
            is_from_ArrayLike([min_or_n_or_list, max])
        ) {
            const from = min_or_n_or_list as ArrayLike<unknown>
            return from[Math.floor(Math.random() * from.length)]
        } else throw new TypeError('Invalid params!')
    } else if (is_min_max([min_or_n_or_list, max])) {
        const min = min_or_n_or_list as number
        return Math.floor(Math.random() * (max - min)) + min
    } else throw new TypeError('Invalid params!')
}
