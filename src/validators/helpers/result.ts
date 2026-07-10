import type { Result } from '../../types/Result.ts'

export function ok<TValue>(value: TValue): [null, TValue] {
    return [null, value]
}

export function err<TError extends Error>(error: TError): [TError, null] {
    return [error, null]
}

export function isOk<TValue, TError extends Error>(
    result: Result<TValue, TError>
): result is [null, TValue] {
    assertResultShape(result)
    const [errSlot] = result as [unknown, unknown]
    return errSlot === null
}

export function isErr<TValue, TError extends Error>(
    result: Result<TValue, TError>
): result is [TError, null] {
    assertResultShape(result)
    const [errSlot] = result as [unknown, unknown]
    return errSlot !== null
}

function assertResultShape(result: unknown): asserts result is [unknown, unknown] {
    if (!Array.isArray(result) || result.length !== 2) {
        throw new TypeError(
            `Expected a Result tuple of length 2, got ${result === null ? 'null' : typeof result}`
        )
    }
    const [errSlot, valSlot] = result as [unknown, unknown]

    if (!(errSlot === null || errSlot instanceof Error)) {
        throw new TypeError(
            `Invalid Result shape: error slot must be null or an Error instance, got ${typeof errSlot}`
        )
    }

    if (errSlot instanceof Error && valSlot !== null) {
        throw new TypeError(
            'Invalid Result shape: error slot is an Error but value slot is not null — expected [Error, null]'
        )
    }
}
