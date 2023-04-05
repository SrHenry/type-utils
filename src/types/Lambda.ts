import { TypeGuard } from '../TypeGuards'
import type { Func } from './Func'
import { MergeObjects } from './index'

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

type CurriedLambdaLoop<
    TParams extends any[],
    TReturnType,
    spread extends boolean = false
> = TParams extends [infer TParam0, ...infer TRestParams]
    ? TRestParams extends []
        ? AsUncurryableLambda<CurryStepFunc<[TParam0], TReturnType, true>>
        : AsUncurryableLambda<
              spread extends true
                  ? _SpreadTParams<TParams, TReturnType, [], true>
                  : CurryStepFunc<[TParam0], CurriedLambdaLoop<TRestParams, TReturnType>, true>
          >
    : never

type CurriedFuncLoop<
    TParams extends any[],
    TReturnType,
    spread extends boolean = false
> = TParams extends [infer TParam0, ...infer TRestParams]
    ? TRestParams extends []
        ? CurryStepFunc<[TParam0], TReturnType, false>
        : spread extends true
        ? _SpreadTParams<TParams, TReturnType, [], false>
        : CurryStepFunc<[TParam0], CurriedFuncLoop<TRestParams, TReturnType>, false>
    : never

type _SpreadTParams<
    TParams extends any[],
    TReturn,
    TConsumedParams extends any[] = [],
    TIsLambda extends boolean = true
> = TParams extends [infer TParam0, ...infer TRestParams]
    ? TRestParams extends []
        ? CurryStepFunc<[...TConsumedParams, TParam0], TReturn, TIsLambda>
        : CurryStepFunc<
              [...TConsumedParams, TParam0],
              TIsLambda extends true
                  ? CurriedLambdaLoop<TRestParams, TReturn, true>
                  : CurriedFuncLoop<TRestParams, TReturn, true>,
              TIsLambda
          > &
              _SpreadTParams<TRestParams, TReturn, [...TConsumedParams, TParam0], TIsLambda>
    : { (): TReturn }

type CurryStepFunc<
    TParams extends any[],
    TReturn,
    TIsLambda extends boolean = false
> = TParams extends []
    ? { (): TReturn }
    : {
          (...args: TParams): TReturn
          (): TIsLambda extends true
              ? AsUncurryableLambda<CurryStepFunc<TParams, TReturn, true>>
              : CurryStepFunc<TParams, TReturn, false>
      }

export type CurriedLambda<
    TLambda extends Func<any[], any>,
    partialApply extends boolean = false
> = TLambda extends Func<infer TParams, infer TReturn>
    ? TParams extends [infer TParam0, ...infer TRestParams]
        ? TRestParams extends []
            ? TParam0 extends never
                ? AsUncurryableLambda<CurryStepFunc<[], TReturn, true>>
                : AsUncurryableLambda<CurryStepFunc<[TParam0], TReturn, true>>
            : AsUncurryableLambda<
                  partialApply extends true
                      ? _SpreadTParams<TParams, TReturn, [], true>
                      : CurryStepFunc<[TParam0], CurriedLambdaLoop<TRestParams, TReturn>, true>
              >
        : TParams extends []
        ? AsUncurryableLambda<CurryStepFunc<[], TReturn, true>>
        : never
    : never

export type CurriedFunc<
    TFunction extends Func<any[], any>,
    partialApply extends boolean = false
> = TFunction extends Func<infer TParams, infer TReturn>
    ? TParams extends [infer TParam0, ...infer TRestParams]
        ? TRestParams extends []
            ? TParam0 extends never
                ? CurryStepFunc<[], TReturn, false>
                : CurryStepFunc<[TParam0], TReturn, false>
            : partialApply extends true
            ? _SpreadTParams<TParams, TReturn, [], false>
            : CurryStepFunc<[TParam0], CurriedFuncLoop<TRestParams, TReturn, partialApply>, false>
        : TParams extends []
        ? CurryStepFunc<[], TReturn, false>
        : never
    : never

export type Curried<
    TOperand extends Func<any[], any>,
    partialApply extends boolean = false
> = TOperand extends AsLambda<infer TFunc>
    ? CurriedLambda<TFunc, partialApply>
    : CurriedFunc<TOperand, partialApply>

export type CurriedLambdaFn<TLambda extends Func<any[], any>> = {
    (): CurriedLambda<TLambda, false>
    <spread extends boolean>(partialApply: spread): CurriedLambda<TLambda, spread>
}

interface IUncurryableLambdaProps<TOrigFunc extends Func<any[], any>> {
    invoke: TOrigFunc
}

type ILambdaProps<TOrigFunc extends Func<any[], any>> = TOrigFunc extends Func<infer TParams, any>
    ? TParams extends [unknown, unknown, ...unknown[]]
        ? MergeObjects<
              IUncurryableLambdaProps<TOrigFunc>,
              {
                  curry: CurriedLambdaFn<TOrigFunc>
              }
          >
        : IUncurryableLambdaProps<TOrigFunc>
    : never

type ILambda<Params extends any[] = [], ReturnType = void> = ILambdaProps<Func<Params, ReturnType>>

interface ILambdaTypeGuard<Type = any> {
    invoke: (arg: unknown) => arg is Type
}

export type Lambda<Params extends any[] = [], ReturnType = void> = Func<Params, ReturnType> &
    ILambda<Params, ReturnType>
export type UncurryableLambda<Params extends any[] = [], ReturnType = void> = Func<
    Params,
    ReturnType
> &
    IUncurryableLambdaProps<Func<Params, ReturnType>>

export type AsLambda<TFunc extends Func<any[], any>> = TFunc & ILambdaProps<TFunc>
export type AsUncurryableLambda<TFunc extends Func<any[], any>> = TFunc &
    IUncurryableLambdaProps<TFunc>

export type LambdaTypeGuard<T> = ((value: unknown) => value is T) & ILambdaTypeGuard<T>

export type AsyncLambda<Params extends any[] = [], ReturnType = void> = Lambda<
    Params,
    Promise<ReturnType>
>

declare const a: ILambdaProps<(a: number, b: string, c: boolean, d: object) => symbol>
declare const b: ILambdaProps<(a: number) => symbol>
declare const x: ILambdaProps<() => symbol>

const cc = a.curry()
const c = a.curry(true)

c.invoke(1, '2', true, {})
c.invoke(1, '2', false).invoke({})
c.invoke(1, '2').invoke(true, {})
c.invoke(1, '2').invoke(true).invoke({})
c.invoke(1).invoke('2', true, {})
c.invoke(1).invoke('2', true).invoke({})
c.invoke(1).invoke('2').invoke(true, {})

c.invoke(1).invoke('2').invoke(true).invoke({})
cc.invoke(1).invoke('2').invoke(true).invoke({})

b.invoke(1)

x.invoke()

declare function lambda<T>(guard: TypeGuard<T>): LambdaTypeGuard<T>
declare function lambda<TFunc extends (...args: any) => any>(lambda: TFunc): AsLambda<TFunc>
declare function lambda(lambda: Function): Lambda<any[], any>

const f = lambda((a: number, b: string, c: boolean, d: object) => Symbol(`${a}${b}${c}${d}`))
const curried = f.curry()

curried(1)('2')(true).invoke({})

const ff = f.curry(true)

ff(1, '2', true, {})
ff(1, '2', true)({})
ff(1, '2')(true, {})
ff(1, '2')(true)({})
ff(1)('2', true, {})
ff(1)('2', true)({})
ff(1)('2')(true, {})
ff(1)('2')(true)({})
