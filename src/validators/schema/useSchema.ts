import type { TypeGuard } from '../../TypeGuards/GenericTypeGuards'

export function useSchema<T>(schema: TypeGuard<T>): TypeGuard<T> {
    return schema
}
