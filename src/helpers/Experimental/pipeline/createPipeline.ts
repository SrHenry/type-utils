import type { Func1 } from '../../../types/Func.ts'
import type { PipelineBox } from './core/PipelineBox.ts'
import { PipelineBox as PipelineBoxC } from './core/PipelineBox.ts'

export function createPipeline(): PipelineBox<void>
export function createPipeline<T extends Func1<any, any>>(cb: T): PipelineBox<T>
export function createPipeline(...args: [Func1<any, any>?, ...any]) {
    // biome-ignore lint/suspicious/noConfusingVoidType: void return type for no-arg overload
    if (args.length === 0) return PipelineBoxC.wrap(undefined as void)
    return PipelineBoxC.wrap(args[0])
}
