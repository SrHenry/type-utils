import { Func, Func1 } from '../types/Func'

const NULL = Symbol('NULL')

/**
 * Returns a generator that yields numbers from `0` to `size - 1` (inclusive).
 * @param size The size of the range, the number of iterations of the generator.
 */
export function range(size: number): Generator<number>

/**
 * Returns a generator that yields numbers from `start` to `end` (inclusive).
 *
 * @param start The start of the range.
 * @param end The end of the range.
 */
export function range(start: number, end: number): Generator<number>

/**
 * Returns a generator that yields numbers from `start` to `end` (inclusive) by `step` steps.
 *
 * @param start The start of the range.
 * @param end The end of the range.
 * @param step The step to increment the range by.
 */
export function range(start: number, end: number, step: number): Generator<number>

/**
 * Returns a generator that yields values from a given callback passing the numbers in the range from `start` to `end` (inclusive).
 *
 * @param start The start of the range.
 * @param end The end of the range.
 * @param map The callback to map the values in the range.
 */
export function range<TMapReturn>(
    start: number,
    end: number,
    map: Func1<number, Exclude<TMapReturn, void>>
): Generator<TMapReturn>

/**
 * Returns a generator that yields values from a given callback passing the numbers in the range from `start` to `end` (inclusive).
 *
 * @param start The start of the range.
 * @param end The end of the range.
 * @param map The callback to map the values in the range.
 * @param step The step to increment the range by.
 */
export function range<TMapReturn>(
    start: number,
    end: number,
    map: Func<[number], Exclude<TMapReturn, void>>,
    step: number
): Generator<TMapReturn>

export function* range(
    start_or_size: number,
    end: number | symbol = NULL,
    step_or_map: number | Func<[number], unknown> | symbol = NULL,
    step: number = 1
) {
    if (end === NULL) {
        if (start_or_size < 0) yield* range(0, start_or_size + 1, step)
        else yield* range(0, start_or_size - 1, step)

        return
    }

    if (typeof end !== 'number') throw new Error('Invalid range end! Must be a number.')

    if (typeof step_or_map === 'number') {
        step = step_or_map
        step_or_map = NULL
    }

    if (step === 0) throw new Error('Invalid range step! Must be different from zero.')

    const runner = typeof step_or_map === 'function' ? step_or_map : (v: number) => v

    step = Math.abs(step)

    if (end < start_or_size)
        for (; start_or_size >= end; start_or_size -= step) yield runner(start_or_size)
    else for (; start_or_size <= end; start_or_size += step) yield runner(start_or_size)
}
