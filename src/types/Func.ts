export type NoParamsFunc<ReturnType = void> = Func<[], ReturnType>
export type Func0<ReturnType = void> = NoParamsFunc<ReturnType>

export type OneParamFunc<Param1 = any, ReturnType = void> = Func<[Param1], ReturnType>
export type Func1<Param1 = any, ReturnType = void> = OneParamFunc<Param1, ReturnType>

export type TwoParamsFunc<Param1 = any, Param2 = any, ReturnType = void> = Func<
    [Param1, Param2],
    ReturnType
>
export type Func2<Param1 = any, Param2 = any, ReturnType = void> = TwoParamsFunc<
    Param1,
    Param2,
    ReturnType
>

export type ThreeParamsFunc<Param1 = any, Param2 = any, Param3 = any, ReturnType = void> = Func<
    [Param1, Param2, Param3],
    ReturnType
>
export type Func3<Param1 = any, Param2 = any, Param3 = any, ReturnType = void> = ThreeParamsFunc<
    Param1,
    Param2,
    Param3,
    ReturnType
>

export type FourParamsFunc<
    Param1 = any,
    Param2 = any,
    Param3 = any,
    Param4 = any,
    ReturnType = void
> = Func<[Param1, Param2, Param3, Param4], ReturnType>
export type Func4<
    Param1 = any,
    Param2 = any,
    Param3 = any,
    Param4 = any,
    ReturnType = void
> = FourParamsFunc<Param1, Param2, Param3, Param4, ReturnType>

export type FiveParamsFunc<
    Param1 = any,
    Param2 = any,
    Param3 = any,
    Param4 = any,
    Param5 = any,
    ReturnType = void
> = Func<[Param1, Param2, Param3, Param4, Param5], ReturnType>
export type Func5<
    Param1 = any,
    Param2 = any,
    Param3 = any,
    Param4 = any,
    Param5 = any,
    ReturnType = void
> = FiveParamsFunc<Param1, Param2, Param3, Param4, Param5, ReturnType>
export type Func6<
    Param1 = any,
    Param2 = any,
    Param3 = any,
    Param4 = any,
    Param5 = any,
    Param6 = any,
    ReturnType = void
> = Func<[Param1, Param2, Param3, Param4, Param5, Param6], ReturnType>
export type Func7<
    Param1 = any,
    Param2 = any,
    Param3 = any,
    Param4 = any,
    Param5 = any,
    Param6 = any,
    Param7 = any,
    ReturnType = void
> = Func<[Param1, Param2, Param3, Param4, Param5, Param6, Param7], ReturnType>

export type Func8<
    Param1 = any,
    Param2 = any,
    Param3 = any,
    Param4 = any,
    Param5 = any,
    Param6 = any,
    Param7 = any,
    Param8 = any,
    ReturnType = void
> = Func<[Param1, Param2, Param3, Param4, Param5, Param6, Param7, Param8], ReturnType>
export type Func9<
    Param1 = any,
    Param2 = any,
    Param3 = any,
    Param4 = any,
    Param5 = any,
    Param6 = any,
    Param7 = any,
    Param8 = any,
    Param9 = any,
    ReturnType = void
> = Func<[Param1, Param2, Param3, Param4, Param5, Param6, Param7, Param8, Param9], ReturnType>
export type Func10<
    Param1 = any,
    Param2 = any,
    Param3 = any,
    Param4 = any,
    Param5 = any,
    Param6 = any,
    Param7 = any,
    Param8 = any,
    Param9 = any,
    Param10 = any,
    ReturnType = void
> = Func<
    [Param1, Param2, Param3, Param4, Param5, Param6, Param7, Param8, Param9, Param10],
    ReturnType
>

export type Func<Params extends any[] = [], ReturnType = void> = (...args: Params) => ReturnType

export type AsyncFunc<Params extends any[] = [], ReturnType = void> = Func<
    Params,
    Promise<ReturnType>
>

export type Factory<Args extends any[], ReturnType> = Func<Args, ReturnType>

/** A wrapper for the `Parameters<T>` type helper */
export type Param<
    Index extends keyof Parameters<Fn>,
    Fn extends Func<any[], any>
> = Parameters<Fn>[Index]

/** Returns the first parameter of a function type */
export type Param0<Fn extends Func<any[], any>> = Param<0, Fn>
/** Returns the second parameter of a function type */
export type Param1<Fn extends Func<any[], any>> = Param<1, Fn>
/** Returns the third parameter of a function type */
export type Param2<Fn extends Func<any[], any>> = Param<2, Fn>
/** Returns the fourth parameter of a function type */
export type Param3<Fn extends Func<any[], any>> = Param<3, Fn>
/** Returns the fifth parameter of a function type */
export type Param4<Fn extends Func<any[], any>> = Param<4, Fn>
/** Returns the sixth parameter of a function type */
export type Param5<Fn extends Func<any[], any>> = Param<5, Fn>
/** Returns the seventh parameter of a function type */
export type Param6<Fn extends Func<any[], any>> = Param<6, Fn>
/** Returns the eighth parameter of a function type */
export type Param7<Fn extends Func<any[], any>> = Param<7, Fn>
/** Returns the ninth parameter of a function type */
export type Param8<Fn extends Func<any[], any>> = Param<8, Fn>
/** Returns the tenth parameter of a function type */
export type Param9<Fn extends Func<any[], any>> = Param<9, Fn>
/** Returns the eleventh parameter of a function type */
export type Param10<Fn extends Func<any[], any>> = Param<10, Fn>
