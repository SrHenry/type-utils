import type { Predicate } from '../../types/Predicate.ts'
import type { TypeGuard } from '../types/index.ts'
import { __type_guard__ } from './constants.ts'
import { setMetadata } from './setMetadata.ts'

export const setAsTypeGuard = <T>(value: TypeGuard<T> | Predicate<T>) =>
    setMetadata(__type_guard__, true, value) as TypeGuard<T>
