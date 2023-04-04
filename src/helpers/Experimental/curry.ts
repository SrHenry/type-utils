import { Func } from '../../types/Func'
import type { Curried, CurriedFunc, CurriedLambda, Lambda } from '../../types/Lambda'
import { isLambda } from './lambda'

const NO_ARG = Symbol('NO_ARG')
const __curried__ = Symbol(`[[${curry.name}]]`)
const __partialApply__ = Symbol(`[[${curry.name}\`partialApply]]`)

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

export function isCurried<TLambda extends Lambda<any[], any>>(
    fn: unknown
): fn is CurriedLambda<TLambda, boolean>
export function isCurried<TFunc extends Func<any[], any>>(
    fn: unknown
): fn is CurriedFunc<TFunc, boolean>
export function isCurried<TParams extends any[], TReturn extends any>(
    fn: unknown
): fn is Curried<Func<TParams, TReturn>, boolean>
export function isCurried(fn: unknown): fn is Curried<Func<any[], any>, boolean>
export function isCurried(fn: unknown): boolean {
    return typeof fn === 'function' && __curried__ in fn && !!fn[__curried__]
}

export function isPartialApply<TLambda extends Lambda<any[], any>>(
    fn: unknown
): fn is CurriedLambda<TLambda, true>
export function isPartialApply<TFunc extends Func<any[], any>>(
    fn: unknown
): fn is CurriedFunc<TFunc, true>
export function isPartialApply<TParams extends any[], TReturn extends any>(
    fn: unknown
): fn is Curried<Func<TParams, TReturn>, true>
export function isPartialApply(fn: unknown): fn is Curried<Func<any[], any>, true>
export function isPartialApply(fn: unknown): boolean {
    return typeof fn === 'function' && __partialApply__ in fn && !!fn[__partialApply__]
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
export function curry(fn: CallableFunction, partialApply: boolean = false) {
    if (isCurried(fn)) return fn

    if (fn.length < 2) return fn

    if (!partialApply) {
        const args = [] as any[]

        function curried(arg: any = NO_ARG) {
            if (arg === NO_ARG) return curried

            args.push(arg)

            if (args.length >= fn.length) return fn(...args)

            return curried
        }

        if (isLambda(fn)) addInvoke(curried)

        return addSignature(curried)
    }

    function curriedPartialApply(...args: any[]) {
        //if (args.length == 0) throw new Error('curried function called with no arguments')

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
