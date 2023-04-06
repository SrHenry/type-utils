export const sleep = (milliseconds: number, onfulfilled?: () => any) => {
    return new Promise<void>(resolve => setTimeout(() => resolve(), milliseconds)).then(onfulfilled)
}

/**
 * A function that removes its last element of an array-like list and
 *
 * @template {T extends Array<U>} T - An array-like object type
 * @template U Arbitrary unknown type of the array-like object
 *
 * @param {T} list The list to remove the last element of it
 *
 * @returns {T} The list without the last element of it
 */
export const removeLastElement = <T extends Array<U>, U>(list: T): T => {
    list.pop()

    return list
}

/**
 * Number rounder string formatter
 * @param n the number to format
 * @param precision the decimal part output size
 */
export const round = (n: number, precision: number = 0): string => {
    let integer = Math.floor(n)
    let r = n - integer
    for (let c = 0; c < precision; c++) r *= 10

    r = Math.floor(r)

    let r_s = String(r)
    for (let c = 0; c < precision - r_s.length; c++) r_s = '0'.concat(r_s)

    for (let c = precision; c < 0; c++) integer = Math.floor(integer / 10)

    if (/^0+$/.test(r_s)) return String(integer)

    return String(integer).concat('.').concat(r_s)
}

/**
 * A function that converts a Date Object into string wiht MySQL date format
 *
 * @param { Date } date optional Date Object to format into MySQL date format
 *
 * @returns { string } The MySQL formatted date string
 */
export const getDateTimeStringAsDB = function (date: Date = new Date(Date.now())): string {
    return String(date.toISOString().split('T').join(' ').split('.')[0])
}

/**
 * Logic gate 'AND' to many inputs.
 *
 * @param values input list of argument values.
 *
 * @returns result of nested 'AND' Logic gate.
 */
export const AND = (...values: any[]) => {
    for (const v of values) if (!v) return false

    return true
}

/**
 * Logic gate 'OR' to many inputs.
 *
 * @param values input list of argument values.
 *
 * @returns result of nested 'OR' Logic gate.
 */
export const OR = (...values: any[]) => {
    for (const value of values) if (!!value) return true
    return false
}

/**
 * Logic gate 'NOT'.
 *
 * @param value input value.
 *
 * @returns result of 'NOT' Logic gate.
 */
export function NOT(value: any): boolean
/**
 * Logic gate 'NOT'.
 *
 * @param values input list of argument values.
 *
 * @returns result of 'NOT' Logic gate.
 */
export function NOT(...values: any[]): boolean[]

export function NOT(...values: any[]) {
    return values.length > 1 ? values.map(v => !v) : !(values[0] ?? true)
}

/**
 * Logic gate 'NAND' (Not AND) to many inputs.
 * It applies 'AND' to all values then apply 'NOT' for the result.
 *
 * @param values input list of argument values.
 *
 * @returns result of nested 'NAND' Logic gate.
 */
export const NAND = (...values: any[]) => NOT(AND(...values))

/**
 * Logic gate 'NOR' (Not OR) to many inputs.
 * It applies 'OR' to all values then apply 'NOT' for the result.
 *
 * @param values input list of argument values.
 *
 * @returns result of nested 'NOR' Logic gate.
 */
export const NOR = (...values: any[]) => NOT(OR(...values))

/**
 * Logic gate 'XOR' (eXclusive OR) to many inputs.
 * Returns true if only one of the inputs are true, false otherwise.
 *
 * @param values input list of argument values.
 *
 * @returns result of 'XOR' Logic gate.
 */
export const XOR = (...values: any[]) => values.filter(v => !!v).length === 1

/**
 * Logic gate 'XNOR' (eXclusive Not OR) to many inputs.
 * Returns false if only one of the inputs are true, true otherwise.
 * Same as applying 'XOR' then 'NOT'.
 *
 * @param values input list of argument values.
 *
 * @returns result of 'XNOR' Logic gate.
 */
export const XNOR = (...values: any[]) => NOT(XOR(...values))

/**
 * @author marcuspoehls <marcus@futurestud.io>
 *
 * Determine whether the given `input` is a function.
 *
 * @param {*} input
 *
 * @returns {Boolean}
 *
 * @example
 * isFunction('no') // false
 *
 * isFunction(() => {}) // true
 * isFunction(function () {}) // true
 */
export function isFunction(input: any): input is Function {
    return typeof input === 'function'
}

const AsyncFunction = (async () => {}).constructor

/**
 * @author marcuspoehls <marcus@futurestud.io>
 * Determine whether the given `input` is an async function.
 *
 * @param {*} input
 *
 * @returns {Boolean}
 */
function __isAsyncFunction(input: any): boolean {
    return (
        isFunction(input) &&
        AsyncFunction.name === 'AsyncFunction' &&
        input instanceof AsyncFunction
    )
}

/**
 * @author marcuspoehls <marcus@futurestud.io>
 *
 * Determine whether the given `promise` is a Promise.
 *
 * @param {T} promise
 *
 * @returns {Boolean}
 *
 * @example
 * isPromise('no') // false
 * isPromise(new Promise(() => {})) // true
 */
export function isPromise<T = any>(promise: any): promise is Promise<T> {
    return promise instanceof Promise
}

export function isAsyncFunction(input: any): input is (...args: any[]) => Promise<any> {
    return __isAsyncFunction(input)
}

export function arrayToObject<O>(
    array: Array<readonly [keyof O | string | symbol | number, O[keyof O] | any]>
): O
export function arrayToObject<T extends Array<readonly [string | symbol, any]>>(
    array: T
): Record<T[number][0], T[number][1]>

export function arrayToObject<O, T extends Array<readonly [string | symbol, any]>>(
    array: T
): O | Record<T[number][0], T[number][1]> {
    return array.reduce((acc, [key, value]) => Object.assign(acc, { [key]: value }), {}) as
        | O
        | Record<T[number][0], T[number][1]>
}

export function omit<T, K extends (keyof T)[]>(from: T, keys: K): Omit<T, K[number]> {
    if (keys.length === 0 || keys.every(key => !(key in <object>from)))
        return from as Omit<T, K[number]>

    return arrayToObject(
        Object.entries(from as {}).filter(([key]) => !keys.includes(key as keyof T))
    )
}

/**
 * Decorator
 * @param _
 * @param _2
 * @param descriptor
 * @returns
 */
export function AutoBind(
    _: any,
    _2: string | symbol,
    descriptor: PropertyDescriptor
): PropertyDescriptor {
    const originalMethod: Function = descriptor.value
    return {
        configurable: true,
        enumerable: false,
        get() {
            return originalMethod.bind(this)
        },
    }
}
