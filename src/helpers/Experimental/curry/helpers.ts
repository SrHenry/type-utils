import type { Func } from '../../../types/Func'
import type { Curried, CurriedFunc, CurriedLambda, Lambda } from '../../../types/Lambda'

import { __curried__, __partialApply__ } from './constants'

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
