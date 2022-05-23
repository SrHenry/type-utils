import Generics from '../../Generics'
import type { BaseTypes } from './types'

/** @see {@link BaseTypes} */
export const baseTypes = [
    ...Generics.TypeOfTag,
    'enum',
    'primitive',
    'union',
    'intersection',
    'any',
] as const

export { BaseTypes }
