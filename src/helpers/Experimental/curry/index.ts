import type { Func } from '../../../types/Func'
import type { Curried, Lambda } from '../../../types/Lambda'

import { isLambda } from '../lambda/helpers'
import { __curried__, __partialApply__, NO_ARG } from './constants'
import { isCurried } from './helpers'

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

export function curry(fn: CallableFunction, partialApply: boolean = false, args: any[] = []) {
    if (isCurried(fn)) return fn

    if (fn.length < 2) return fn

    if (!partialApply) {
        if (args.length >= fn.length) return fn(...args)

        function curried(arg: any = NO_ARG) {
            if (arg === NO_ARG) return curried

            return curry(fn, partialApply, [...args, arg])
        }

        if (isLambda(fn)) addInvoke(curried)

        return addSignature(curried)
    }

    function curriedPartialApply(...args: any[]) {
        if (args.length >= fn.length) return fn(...args)

        function partialApply(...args2: any[]) {
            return curriedPartialApply(...args.concat(args2))
        }

        if (isLambda(fn)) addInvoke(partialApply)

        addSignature(partialApply)
        addPartialApplySignature(partialApply)

        return partialApply
    }

    if (isLambda(fn)) addInvoke(curriedPartialApply)

    addSignature(curriedPartialApply)
    addPartialApplySignature(curriedPartialApply)

    return curriedPartialApply
}
