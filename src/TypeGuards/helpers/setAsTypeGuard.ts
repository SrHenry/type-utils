import { Predicate } from '../../types/Predicate'
import { TypeGuard } from '../types'
import { __type_guard__ } from './constants'
import { setMetadata } from './setMetadata'

export const setAsTypeGuard = <T>(value: TypeGuard<T> | Predicate<T>) =>
    setMetadata(__type_guard__, true, value) as TypeGuard<T>
