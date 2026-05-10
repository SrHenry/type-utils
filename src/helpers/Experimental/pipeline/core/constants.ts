export const PIPELINE_PROP_KEYS = ['pipe', 'pipeAsync', 'depipe', 'tap', 'tapAsync'] as const

export type PipelinePropKey = typeof PIPELINE_PROP_KEYS[number]
