import { TypeGuard } from '../types/index.ts'
import { hasTypeGuardMetadata } from './hasTypeGuardMetadata.ts'
import { isUnaryFunction } from './isUnaryFunction.ts'

export const isTypeGuard = <T = any>(value: unknown): value is TypeGuard<T> =>
    !!value && (hasTypeGuardMetadata(value) || isUnaryFunction(value))
