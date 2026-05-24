import { PipelineBox, AsyncPipelineBox } from './PipelineBox.ts'

export function depipe<T>(arg: PipelineBox<T>): T
export function depipe<T>(arg: AsyncPipelineBox<T>): Promise<T>
export function depipe<T>(arg: T): T
export function depipe(arg: unknown): unknown {
    return PipelineBox.isBox(arg) ? arg.depipe() : arg
}
