import type { Func } from '../../../types/Func'
import type { Curried, CurriedFunc, CurriedLambda, Lambda } from '../../../types/Lambda'

import { __curried__, __length__, __partialApply__ } from './constants'

export function isCurried<TLambda extends Lambda<any[], any>>(
    fn: unknown
): fn is CurriedLambda<TLambda, boolean>
export function isCurried<TFunc extends Func<any[], any>>(
    fn: unknown
): fn is CurriedFunc<TFunc, boolean>
export function isCurried<TParams extends any[], TReturn extends any>(
    fn: unknown
): fn is Curried<Func<TParams, TReturn>, boolean>
export function isCurried(fn: unknown): fn is Curried<Func<any[], any>, boolean>
export function isCurried(fn: unknown): boolean {
    return typeof fn === 'function' && __curried__ in fn && !!fn[__curried__]
}

export function isPartialApply<TLambda extends Lambda<any[], any>>(
    fn: unknown
): fn is CurriedLambda<TLambda, true>
export function isPartialApply<TFunc extends Func<any[], any>>(
    fn: unknown
): fn is CurriedFunc<TFunc, true>
export function isPartialApply<TParams extends any[], TReturn extends any>(
    fn: unknown
): fn is Curried<Func<TParams, TReturn>, true>
export function isPartialApply(fn: unknown): fn is Curried<Func<any[], any>, true>
export function isPartialApply(fn: unknown): boolean {
    return typeof fn === 'function' && __partialApply__ in fn && !!fn[__partialApply__]
}

export function getParametersLength<TLambda extends Lambda<any[], any>>(
    fn: CurriedLambda<TLambda, true>
): number | null
export function getParametersLength<TFunc extends Func<any[], any>>(
    fn: CurriedFunc<TFunc, true>
): number | null
export function getParametersLength<TParams extends any[], TReturn extends any>(
    fn: Curried<Func<TParams, TReturn>, true>
): number | null
export function getParametersLength(fn: CallableFunction): number | null

export function getParametersLength(fn: any): number | null {
    return fn[__length__] ?? null
}
