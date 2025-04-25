export type SucessfulResult<TValue = unknown> = [null, TValue]
export type ErrorResult<TError extends Error = Error> = [TError, null]
export type Result<TValue = unknown, TError extends Error = Error> =
    | SucessfulResult<TValue>
    | ErrorResult<TError>
export type AsyncResult<TValue = unknown, TError extends Error = Error> = Promise<
    Result<TValue, TError>
>
