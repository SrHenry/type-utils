/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */

import type { TypeGuard } from '../../TypeGuards'
import type { AsLambda, Lambda, LambdaTypeGuard } from '../../types/Lambda'

export function lambda<T>(guard: TypeGuard<T>): LambdaTypeGuard<T>
export function lambda<TFunc extends (...args: any) => any>(lambda: TFunc): AsLambda<TFunc>
export function lambda(lambda: Function): Lambda<any[], any>

export function lambda<TFunc extends (...args: any) => any>(lambda: TFunc): AsLambda<TFunc> {
    try {
        if ('invoke' in lambda && typeof lambda.invoke === 'function')
            return lambda as unknown as AsLambda<TFunc>

        return Object.defineProperty(lambda, 'invoke', {
            enumerable: false,
            configurable: false,
            writable: false,
            value: lambda,
        }) as unknown as AsLambda<TFunc>
    } catch (e) {
        console.error('failed lambda', { e })
        throw e
    }
}
