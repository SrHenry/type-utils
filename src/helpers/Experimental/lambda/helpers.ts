import type { Func } from '../../../types/Func'
import type { AsLambda, Lambda } from '../../../types/Lambda'
import { __lambda__ } from './constants'

export function isLambda<Fn extends Func<any[], any>>(fn: unknown): fn is AsLambda<Fn>
export function isLambda<TParams extends any[], TReturn extends any>(
    fn: unknown
): fn is Lambda<TParams, TReturn>
export function isLambda(fn: unknown): fn is Lambda<any[], any>

export function isLambda(fn: unknown): fn is Lambda<any[], any> {
    return typeof fn === 'function' && __lambda__ in fn && !!fn[__lambda__]
}
