import type { TypeGuard } from '../types/index.ts'

import { __validator_message__ } from './constants.ts'
import { getMetadata } from './getMetadata.ts'

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
