import { isPromise } from '../../helpers/isPromise.ts'
import type { AsyncFunc, Func } from '../../types/Func.ts'
import type { AsyncLambda, Lambda } from '../../types/Lambda.ts'
import type { AsyncResult, Result } from '../../types/Result.ts'
import { lambda } from './lambda/index.ts'
import { err, ok } from '../../validators/helpers/result.ts'

export function run<TParams extends any[], ReturnType>(
    callback: AsyncFunc<TParams, ReturnType>
): AsyncLambda<TParams, Result<ReturnType>>

export function run<TParams extends any[], ReturnType>(
    callback: Func<TParams, ReturnType>
): Lambda<TParams, Result<ReturnType>>

export function run<TParams extends any[], ReturnType>(
    callback: AsyncFunc<TParams, ReturnType>,
    ...params: TParams
): AsyncResult<ReturnType>

export function run<TParams extends any[], ReturnType>(
    callback: Func<TParams, ReturnType>,
    ...params: TParams
): Result<ReturnType>

export function run(
    callback: Func<any[], any>,
    ...params: any[]
): Lambda<any[], Result<any> | AsyncResult<any>> | Result<any> | AsyncResult<any> {
    // biome-ignore lint/suspicious/noShadow: currying pattern — inner param fills outer's slot
    const resolver = (...params: any[]): Result<any> | AsyncResult<any> => {
        try {
            const result = callback(...params)
            if (isPromise(result))
                return result.then(value => ok(value)).catch(error => err(error as Error))
            return ok(result)
        } catch (error) {
            return err(error as Error)
        }
    }

    if (!callback || typeof callback !== 'function') throw new Error('callback must be a function')

    if (params.length !== 0) return resolver(...params)

    return lambda(resolver)
}
