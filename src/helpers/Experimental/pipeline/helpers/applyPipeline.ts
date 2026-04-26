import { Func1 } from '../../../../types/Func.ts'
import { pipeline } from './pipeline.ts'

export function applyPipeline<Callback extends Func1<any, any>, RValue>(
    cb: Callback,
    rvalue: RValue,
    thisObject: unknown
) {
    return pipeline<ReturnType<Callback>, RValue>(cb).apply(thisObject, [rvalue])
}
