import type { PipelineBox } from '../core/PipelineBox.ts'

export interface PipeTransform<T> {
    (incoming: unknown): T
    depipe(): T
    pipe: PipelineBox<T>['pipe']
}
