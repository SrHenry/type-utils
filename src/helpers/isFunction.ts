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
export function isFunction(input: any): input is (...args: unknown[]) => unknown {
    return typeof input === 'function'
}
