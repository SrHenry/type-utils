import type { GetTypeGuard, TypeGuard } from '../../../../TypeGuards/types'
import type { Func } from '../../../../types/Func'

export type OptionalizeTypeGuard<T extends TypeGuard<any | any[]>> = TypeGuard<
    GetTypeGuard<T> | undefined
>
export type TypeGuardFactory<Args extends any[] = any[], T = any> = Func<Args, TypeGuard<T>>
export type OptionalizeTypeGuardFactory<Factory extends TypeGuardFactory> =
    Factory extends TypeGuardFactory<infer Args, infer Type>
        ? TypeGuardFactory<Args, Type | undefined>
        : never

export type OptionalizedTypeGuardFactory<Factory extends TypeGuardFactory> = Factory & {
    optional: OptionalizeTypeGuardFactory<Factory>
}

export type TypeGuardFactoryParameters<T extends TypeGuardFactory> = T extends TypeGuardFactory<
    infer Args,
    any
>
    ? Args
    : never
export type TypeGuardFactoryType<T extends TypeGuardFactory> = T extends TypeGuardFactory<
    any[],
    infer Type
>
    ? Type
    : never
