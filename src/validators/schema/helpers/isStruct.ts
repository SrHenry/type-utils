import Generics from '../../../Generics'
import { isTypeGuard } from '../../../TypeGuards/helpers'
import { TypeGuard } from '../../../TypeGuards/types'
import { GenericStruct } from '../types'

export function isStruct(struct: unknown): struct is GenericStruct<any>
export function isStruct<T, IsGeneric extends true | false = true>(
    struct: unknown,
    schema: TypeGuard<T>
): struct is GenericStruct<T, IsGeneric>
export function isStruct<T>(struct: unknown, schema: TypeGuard<T>): struct is GenericStruct<T>
export function isStruct(struct: unknown, schema?: TypeGuard): struct is GenericStruct<any>

export function isStruct(struct: unknown, schema?: TypeGuard): struct is GenericStruct<any> {
    if (!struct || typeof struct !== 'object') return false
    if (!('type' in struct) || !Generics.BaseTypes.includes((struct as any)?.type)) return false
    if (!('optional' in struct) || typeof (struct as any)?.optional !== 'boolean') return false
    if (!('schema' in struct) || !isTypeGuard((struct as any).schema)) return false
    if (!!schema && (struct as any).schema !== schema) return false

    return true
}
