import type { TypeGuard } from '../types'

import { __validator_message__ } from './constants'
import { getMetadata } from './getMetadata'

export function getValidatorMessage(from: unknown): string | undefined
export function getValidatorMessage<T>(from: unknown, defaultValue: T): string | T

export function getValidatorMessage<T>(from: unknown, defaultValue?: T): string | T | undefined {
    return (
        getMetadata(
            __validator_message__,
            from,
            (arg => typeof arg === 'string') as TypeGuard<string>
        ) ?? defaultValue
    )
}
