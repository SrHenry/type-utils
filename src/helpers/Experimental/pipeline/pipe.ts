import { PipelineBox, AsyncPipelineBox } from './core/PipelineBox.ts'

export function pipe<T>(value: Exclude<T, Promise<any>>): PipelineBox<T>
export function pipe<T>(value: Promise<T>): AsyncPipelineBox<T>
export function pipe(value: unknown): PipelineBox<unknown> | AsyncPipelineBox<unknown> {
 return PipelineBox.wrap(value)
}
