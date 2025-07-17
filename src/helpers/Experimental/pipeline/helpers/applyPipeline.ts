import { Func1 } from '../../../../types/Func'
import { pipeline } from './pipeline'

export function applyPipeline<Callback extends Func1<any, any>, RValue>(
    cb: Callback,
    rvalue: RValue,
    thisObject: unknown
) {
    return pipeline<ReturnType<Callback>, RValue>(cb).apply(thisObject, [rvalue])
}
