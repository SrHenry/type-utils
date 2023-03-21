import type { Func } from './Func'

export type NoParamsLambda<ReturnType = void> = Lambda<[], ReturnType>
export type Lambda0<ReturnType = void> = NoParamsLambda<ReturnType>

export type OneParamLambda<Param1 = any, ReturnType = void> = Lambda<[Param1], ReturnType>
export type Lambda1<Param1 = any, ReturnType = void> = OneParamLambda<Param1, ReturnType>

export type TwoParamsLambda<Param1 = any, Param2 = any, ReturnType = void> = Lambda<
    [Param1, Param2],
    ReturnType
>
export type Lambda2<Param1 = any, Param2 = any, ReturnType = void> = TwoParamsLambda<
    Param1,
    Param2,
    ReturnType
>

export type ThreeParamsLambda<Param1 = any, Param2 = any, Param3 = any, ReturnType = void> = Lambda<
    [Param1, Param2, Param3],
    ReturnType
>
export type Lambda3<
    Param1 = any,
    Param2 = any,
    Param3 = any,
    ReturnType = void
> = ThreeParamsLambda<Param1, Param2, Param3, ReturnType>

export type FourParamsLambda<
    Param1 = any,
    Param2 = any,
    Param3 = any,
    Param4 = any,
    ReturnType = void
> = Lambda<[Param1, Param2, Param3, Param4], ReturnType>
export type Lambda4<
    Param1 = any,
    Param2 = any,
    Param3 = any,
    Param4 = any,
    ReturnType = void
> = FourParamsLambda<Param1, Param2, Param3, Param4, ReturnType>

export type FiveParamsLambda<
    Param1 = any,
    Param2 = any,
    Param3 = any,
    Param4 = any,
    Param5 = any,
    ReturnType = void
> = Lambda<[Param1, Param2, Param3, Param4, Param5], ReturnType>
export type Lambda5<
    Param1 = any,
    Param2 = any,
    Param3 = any,
    Param4 = any,
    Param5 = any,
    ReturnType = void
> = FiveParamsLambda<Param1, Param2, Param3, Param4, Param5, ReturnType>

interface ILambda<Params extends any[] = [], ReturnType = void> {
    invoke: (...args: Params) => ReturnType
}
interface ILambdaTypeGuard<Type = any> {
    invoke: (arg: unknown) => arg is Type
}

export type Lambda<Params extends any[] = [], ReturnType = void> = Func<Params, ReturnType> &
    ILambda<Params, ReturnType>

export type AsLambda<TFunc extends Func<any[], any>> = TFunc & {
    invoke: TFunc
}

export type LambdaTypeGuard<T> = ((value: unknown) => value is T) & ILambdaTypeGuard<T>

export type AsyncLambda<Params extends any[] = [], ReturnType = void> = Lambda<
    Params,
    Promise<ReturnType>
>
