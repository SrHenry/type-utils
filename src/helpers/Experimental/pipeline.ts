/* eslint-disable @typescript-eslint/no-explicit-any */

import type { AsyncFunc, Func1 } from '../../types/Func'

type Unpipable = null | void | undefined | never

type Pipe<T> = <U>(this: any, fn: Func1<T, U>) => U extends Unpipable ? U : U & Pipable<U>

type AsyncPipe<T> = <U>(this: any, fn: Func1<Awaited<T>, U>) => Promise<U> & Pipable<Promise<U>>

type Depipe<T> = (this: any) => T

interface HasPipe<T> {
    readonly pipe: Pipe<T>
}
interface HasPipeAsync<T> {
    readonly pipeAsync: AsyncPipe<Awaited<T>>
}
interface HasDepipe<T> {
    readonly depipe: Depipe<T>
}

interface BasePipable<T> extends HasPipe<T>, HasDepipe<T> {}
interface BaseAsyncPipable<T> extends BasePipable<T>, HasPipeAsync<T> {}

export type Pipable<T> = T extends Unpipable
    ? T
    : T extends Promise<any>
    ? BaseAsyncPipable<T>
    : BasePipable<T>

export type GetPipeline<T> = T & Pipable<T>
export type GetAsyncPipeline<T> = GetPipeline<Promise<T>>

type GetPipeFn = {
    <T>(rvalue: T): Pipe<typeof rvalue>
    (): Pipe<void>
}
type caller = keyof Pipable<Promise<any>>

function applyPipeline<Callback extends Func1<any, any>, RValue>(
    cb: Callback,
    rvalue: RValue,
    thisObject: caller
) {
    return pipeline<ReturnType<Callback>, RValue>(cb).apply(thisObject, [rvalue])
}

const getPipeFn: GetPipeFn = <T>(rvalue?: T): Pipe<typeof rvalue> =>
    function pipe(this: caller, cb) {
        return applyPipeline(cb, rvalue, this)
    } as Pipe<typeof rvalue>

function addPipe<RValue>(rvalue: RValue | Promise<RValue>) {
    return Object.defineProperty(Object(rvalue), 'pipe', {
        configurable: true,
        enumerable: false,
        get: () => getPipeFn(rvalue),
    })
}

function addPipeAsync<RValue>(rvalue: RValue | Promise<RValue>) {
    return Object.defineProperty(Object(rvalue), 'pipeAsync', {
        configurable: true,
        enumerable: false,
        get: () => getPipeFn(rvalue),
    })
}
function addDepipe<RValue>(rvalue: RValue | Promise<RValue>) {
    return Object.defineProperty(Object(rvalue), 'depipe', {
        configurable: true,
        enumerable: false,
        get: () => depipe.bind(null, rvalue),
    })
}

function pipeline(): HasPipe<void>
function pipeline<RValue, Arg = never>(cb: Func1<Arg, RValue>): Func1<Arg, GetPipeline<RValue>>
function pipeline<RValue, Arg = never>(
    cb: AsyncFunc<[Arg], RValue>
): Func1<Arg, GetAsyncPipeline<RValue>>

function pipeline<RValue extends {}, Arg>(this: caller, cb?: Func1<Arg, RValue | Promise<RValue>>) {
    if (!cb) return { pipe: getPipeFn() }

    return function (this: any, arg0: Arg) {
        let rvalue: RValue | Promise<RValue>

        if (arg0 instanceof Promise) {
            rvalue = arg0.then(r => cb.apply(this, [r]))
            rvalue = addPipeAsync(rvalue)
        } else {
            rvalue = cb.apply(this, [arg0])
            if (rvalue === null || rvalue === undefined) return rvalue
            if (rvalue instanceof Promise) rvalue = addPipeAsync(rvalue)
        }
        rvalue = addPipe(rvalue)
        rvalue = addDepipe(rvalue)

        return rvalue
    }
}

export function pipe<RValue>(arg: RValue): GetPipeline<RValue> {
    return pipeline((o: RValue) => o)(arg)
}

const _pipeline = () => pipeline()
export { _pipeline as pipeline }

export function depipe<RValue>(arg: (RValue & BasePipable<RValue>) | null): RValue | null
export function depipe<RValue>(arg: (RValue & BasePipable<RValue>) | undefined): RValue | undefined
export function depipe<RValue>(
    arg: (RValue & BasePipable<RValue>) | null | undefined
): RValue | null | undefined
export function depipe<RValue>(arg: RValue & BasePipable<RValue>): RValue

export function depipe<RValue>(arg: (RValue & BaseAsyncPipable<RValue>) | null): RValue | null
export function depipe<RValue>(
    arg: (RValue & BaseAsyncPipable<RValue>) | undefined
): RValue | undefined
export function depipe<RValue>(
    arg: (RValue & BaseAsyncPipable<RValue>) | null | undefined
): RValue | null | undefined
export function depipe<RValue>(arg: RValue & BaseAsyncPipable<RValue>): RValue

export function depipe<RValue>(arg: RValue): RValue

export function depipe<RValue>(arg: RValue | GetPipeline<RValue>): RValue {
    arg = Object.defineProperty(Object(arg), 'pipe', {
        configurable: true,
        enumerable: false,
        get: () => void 0,
    })
    arg = Object.defineProperty(Object(arg), 'pipeAsync', {
        configurable: true,
        enumerable: false,
        get: () => void 0,
    })
    arg = Object.defineProperty(Object(arg), 'depipe', {
        configurable: true,
        enumerable: false,
        get: () => void 0,
    })

    if ([String, Number, Boolean, Symbol, BigInt].some(primitive => arg instanceof primitive))
        return <RValue>arg?.valueOf()

    return <RValue>arg
}

export function enpipe<TValue extends {}>(value: TValue): Pipe<TValue> {
    return <Pipe<TValue>>pipe(value).pipe
}
