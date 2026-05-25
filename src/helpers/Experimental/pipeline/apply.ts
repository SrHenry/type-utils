import type { Func } from '../../../types/Func.ts'
import type { CurryingTools } from './types/CurryingTools.ts'

import { curry } from '../curry/index.ts'
import { getParametersLength } from '../curry/helpers.ts'

export function apply<TFunc extends Func<any[], any>>(
    fn: TFunc,
    ...args: Parameters<TFunc>
): ReturnType<TFunc> extends Func<any[], infer R>
    ? (incoming: Parameters<ReturnType<TFunc>>[0]) => R
    : (incoming: any) => any

export function apply<TFunc extends Func<any[], any>, TArgs extends Partial<Parameters<TFunc>>>(
    fn: TFunc,
    ...args: TArgs
): (
    incoming: CurryingTools.CurriedFirstArg<TFunc, TArgs>
) => CurryingTools.CurriedReturn<TFunc, TArgs>

export function apply<TFunc extends Func<any[], any>, TArgs extends any[]>(
    fn: TFunc,
    ...args: TArgs
): (incoming: any) => any {
    const parameterCount = getParametersLength(fn) ?? fn.length
    if (args.length >= parameterCount) {
        const result = fn(...args)
        if (typeof result !== 'function') return (_incoming: unknown) => result
        return (incoming: unknown) => (result as CallableFunction)(incoming)
    }
    const curried = (curry(fn, true) as CallableFunction)(...args)
    return (incoming: unknown) => (curried as CallableFunction)(incoming)
}
