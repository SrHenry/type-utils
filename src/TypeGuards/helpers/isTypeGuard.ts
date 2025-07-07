import { TypeGuard } from '../types'
import { hasTypeGuardMetadata } from './hasTypeGuardMetadata'
import { isUnaryFunction } from './isUnaryFunction'

export const isTypeGuard = <T = any>(value: unknown): value is TypeGuard<T> =>
    !!value && (hasTypeGuardMetadata(value) || isUnaryFunction(value))
