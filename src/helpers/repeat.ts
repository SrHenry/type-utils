import { Func } from '../types/Func'

export function repeat<TFuncShape extends Func<any[], any>>(fn: TFuncShape, times: number): void
export function repeat<TFuncShape extends Func<any[], any>>(fn: TFuncShape, times: bigint): void
export function repeat<TFuncShape extends Func<any[], any>>(
    fn: TFuncShape,
    times: number | bigint
): void

export function repeat<TFuncShape extends Func<any[], any>>(
    fn: TFuncShape,
    times: number | bigint
) {
    if (times <= 0) throw new Error('`times` must be greater than 0')

    times = BigInt(times)
    for (let c = BigInt('0'); c < times; ++c) fn()
}
