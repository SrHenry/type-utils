import { isFunction } from '../../helpers/isFunction'

export const isUnaryFunction = <TFuncShape = (arg: unknown) => unknown>(
    arg: unknown
): arg is TFuncShape => isFunction(arg) && arg.length === 1
