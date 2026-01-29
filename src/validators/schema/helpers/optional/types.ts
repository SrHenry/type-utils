import type { GetTypeGuard, TypeGuard } from '../../../../TypeGuards/types'

export type OptionalizeTypeGuard<T extends TypeGuard<any | any[]>> = TypeGuard<
    GetTypeGuard<T> | undefined
>
export type TypeGuardFactory<Args extends any[] = any[], T = any> = (...args: Args) => TypeGuard<T>

export type OptionalizeTypeGuardFactory<Guarded, Params extends any[]> = (
    ...args: Params
) => TypeGuard<Guarded | undefined>

export type OptionalizedTypeGuardFactory<Guarded, Params extends any[]> = TypeGuardFactory<
    Params,
    Guarded
> & {
    optional: TypeGuardFactory<Params, Guarded | undefined>
}

export type TypeGuardFactoryParameters<T extends TypeGuardFactory> =
    T extends TypeGuardFactory<infer Args, any> ? Args : never
export type TypeGuardFactoryType<T extends TypeGuardFactory> =
    T extends TypeGuardFactory<any[], infer Type> ? Type : never
