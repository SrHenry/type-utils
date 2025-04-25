import { AsyncFunc, Func } from './Func'

/**
 * wraps an value in a Promise or the return value of a function
 */
export type Async<T> = T extends Promise<any>
    ? T
    : T extends Func<infer Params, infer RT>
    ? RT extends Promise<infer WrappedType>
        ? AsyncFunc<Params, WrappedType>
        : AsyncFunc<Params, RT>
    : Promise<T>
