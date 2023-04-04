/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */

import type { TypeGuard } from '../../TypeGuards'
import { Func } from '../../types/Func'
import type { AsLambda, Lambda, LambdaTypeGuard } from '../../types/Lambda'
import { curry } from './curry'

function addInvoke<TFunc extends (...args: any) => any>(fn: TFunc): AsLambda<TFunc> {
    return Object.defineProperty(fn, 'invoke', {
        enumerable: false,
        configurable: false,
        writable: false,
        value: fn,
    }) as unknown as AsLambda<TFunc>
}

function addCurry<TFunc extends (...args: any) => any>(fn: TFunc): AsLambda<TFunc> {
    return Object.defineProperty(fn, 'curry', {
        enumerable: false,
        configurable: false,
        writable: false,
        value: (partialApply = false) => curry(fn, partialApply),
    }) as unknown as AsLambda<TFunc>
}

function addSignature<TFunc extends (...args: any) => any>(fn: TFunc): AsLambda<TFunc> {
    return Object.defineProperty(fn, __lambda__, {
        enumerable: false,
        configurable: false,
        writable: false,
        value: true,
    }) as unknown as AsLambda<TFunc>
}

export function isLambda<Fn extends Func<any[], any>>(fn: unknown): fn is AsLambda<Fn>
export function isLambda<TParams extends any[], TReturn extends any>(
    fn: unknown
): fn is Lambda<TParams, TReturn>
export function isLambda(fn: unknown): fn is Lambda<any[], any>

export function isLambda(fn: unknown): fn is Lambda<any[], any> {
    return typeof fn === 'function' && __lambda__ in fn && !!fn[__lambda__]
}

export const __lambda__ = Symbol(`[[${lambda.name}]]`)

export function lambda<T>(guard: TypeGuard<T>): LambdaTypeGuard<T>
export function lambda<TFunc extends (...args: any) => any>(lambda: TFunc): AsLambda<TFunc>
export function lambda(lambda: Function): Lambda<any[], any>

export function lambda<TFunc extends (...args: any) => any>(lambda: TFunc): AsLambda<TFunc> {
    try {
        if (isLambda<TFunc>(lambda)) return lambda

        addSignature(lambda)
        addInvoke(lambda)

        if (lambda.length > 1) addCurry(lambda)

        return lambda as AsLambda<TFunc>
    } catch (e) {
        console.error('failed lambda', { e })
        throw e
    }
}
