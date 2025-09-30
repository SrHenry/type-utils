import { isFunction } from './isFunction'

/**
 * @author marcuspoehls <marcus@futurestud.io>
 * Determine whether the given `input` is an async function.
 *
 * @param {*} input
 *
 * @returns {Boolean}
 */
function __isAsyncFunction(input: any): boolean {
    const AsyncFunction = (async () => {}).constructor

    return (
        isFunction(input) &&
        AsyncFunction.name === 'AsyncFunction' &&
        input instanceof AsyncFunction
    )
}

export function isAsyncFunction(input: any): input is (...args: any[]) => Promise<any> {
    return __isAsyncFunction(input)
}
