/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */

import type { GetTypeGuard, TypeGuard } from '../../../TypeGuards/types'
import type { AsLambda, Lambda, LambdaTypeGuard } from '../../../types/Lambda'

import { curry } from '../curry'
import { __lambda__ } from './constants'
import { isLambda } from './helpers'

export * from './helpers'

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

export function lambda<TGuard extends TypeGuard<any>>(
    guard: TGuard
): LambdaTypeGuard<GetTypeGuard<TGuard>>
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
