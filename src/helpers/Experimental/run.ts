import { isPromise } from '../../helpers/isPromise'
import { AsyncFunc, Func } from '../../types/Func'
import { AsyncLambda, Lambda } from '../../types/Lambda'
import { AsyncResult, ErrorResult, Result, SucessfulResult } from '../../types/Result'
import { lambda } from './lambda'

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
    const resolver = (...params: any[]): Result<any> | AsyncResult<any> => {
        try {
            const result = callback(...params)
            if (isPromise(result))
                return result
                    .then(value => [null, value] as SucessfulResult)
                    .catch(error => [error, null] as ErrorResult)
            return [null, result]
        } catch (error) {
            return [error as Error, null]
        }
    }

    if (!callback || typeof callback !== 'function') throw new Error('callback must be a function')

    if (params.length !== 0) return resolver(...params)

    return lambda(resolver)
}
