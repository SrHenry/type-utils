export interface CallWithTransform<TArgs extends any[]> {
    <R>(fn: (...args: TArgs) => R): R
    __callWithArgs: TArgs
}

export function callWith<TArgs extends any[]>(...args: TArgs): CallWithTransform<TArgs> {
    const transform = <R>(fn: (...args: any[]) => R): R => fn(...args)
    ;(transform as any).__callWithArgs = args
    return transform as CallWithTransform<TArgs>
}

export function isCallWithTransform(value: unknown): value is CallWithTransform<any[]> {
    return typeof value === 'function' && '__callWithArgs' in (value as any)
}
