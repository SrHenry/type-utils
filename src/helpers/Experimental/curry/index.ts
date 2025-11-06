import type { Func } from '../../../types/Func'
import type { Curried, Lambda } from '../../../types/Lambda'

import { isLambda } from '../lambda/helpers'
import { __curried__, __length__, __partialApply__, NO_ARG } from './constants'
import { getParametersLength, isCurried } from './helpers'

export * from './helpers'

function addInvoke(fn: CallableFunction) {
    return Object.defineProperty(fn, 'invoke', {
        enumerable: false,
        configurable: false,
        writable: false,
        value: fn,
    }) as unknown as Lambda
}

function addSignature(fn: CallableFunction) {
    return Object.defineProperty(fn, __curried__, {
        enumerable: false,
        configurable: false,
        writable: false,
        value: true,
    }) as unknown as Lambda
}
function addPartialApplySignature(fn: CallableFunction) {
    return Object.defineProperty(fn, __partialApply__, {
        enumerable: false,
        configurable: false,
        writable: false,
        value: true,
    }) as unknown as Lambda
}

function addCustomLength(fn: CallableFunction): Lambda

/**
 * @param fn
 * @param length if negative number is passed, its ammount will be subtracted to the given function length
 */
function addCustomLength(fn: CallableFunction, length: number): Lambda

function addCustomLength(fn: CallableFunction, length: number | null = null) {
    if (length === null) length = fn.length
    else if (length < 0) length += fn.length

    return Object.defineProperty(fn, __length__, {
        enumerable: false,
        configurable: false,
        writable: true,
        value: length,
    }) as unknown as Lambda
}

export function curry<TFunc extends Func<any[], any>>(fn: TFunc): Curried<TFunc, false>
export function curry<TFunc extends Func<any[], any>>(
    fn: TFunc,
    partialApply: true
): Curried<TFunc, true>
export function curry<TFunc extends Func<any[], any>>(
    fn: TFunc,
    partialApply: false
): Curried<TFunc, false>
export function curry<TFunc extends Func<any[], any>, partialApply extends boolean>(
    fn: TFunc,
    partialApply: partialApply
): Curried<TFunc, partialApply>

/**
 * @ignore
 */
export function curry(fn: CallableFunction, partialApply: boolean, args: any[]): CallableFunction

export function curry(
    this: any,
    fn: CallableFunction,
    partialApply: boolean = false,
    args: any[] = []
) {
    if (isCurried(fn)) return fn

    // const paramsLength = getParametersLength(fn) ?? this?.length ?? fn.length
    const paramsLength = getParametersLength(fn) ?? fn.length

    if (paramsLength < 2) return fn

    if (!partialApply) {
        if (args.length >= paramsLength) return fn(...args)

        function curried(arg: any = NO_ARG) {
            if (arg === NO_ARG) return curried

            return curry(fn, partialApply, [...args, arg])
        }

        if (isLambda(fn)) addInvoke(curried)

        addSignature(curried)
        addCustomLength(curried, paramsLength - args.length)

        return curried
    }

    function curriedPartialApply(...innerArgs: any[]) {
        if (innerArgs.length >= paramsLength) return fn(...innerArgs)

        function partialApply(...deepArgs: any[]) {
            return curriedPartialApply(...innerArgs, ...deepArgs)
        }

        if (isLambda(fn)) addInvoke(partialApply)

        addSignature(partialApply)
        addPartialApplySignature(partialApply)
        addCustomLength(partialApply, paramsLength - innerArgs.length)

        return partialApply
    }

    if (isLambda(fn)) addInvoke(curriedPartialApply)

    addSignature(curriedPartialApply)
    addPartialApplySignature(curriedPartialApply)
    addCustomLength(curriedPartialApply, paramsLength - args.length)

    return curriedPartialApply(...args)
}
