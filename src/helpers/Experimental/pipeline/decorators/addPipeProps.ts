import type { WithPipe } from '../types/WithPipe.ts'
import type { WithPipeAsync } from '../types/WithPipeAsync.ts'
import type { internal } from '../types/Pipable.ts'

function addProperty<RValue>(
  rvalue: RValue | Promise<RValue>,
  name: 'pipe' | 'pipeAsync',
  getPipeFn: (rvalue: RValue) => internal.Pipe<RValue>
): WithPipe<typeof rvalue> | WithPipeAsync<typeof rvalue> {
  if (rvalue === null || rvalue === undefined) return rvalue as WithPipe<typeof rvalue>

  return Object.defineProperty(Object(rvalue), name, {
    configurable: true,
    enumerable: false,
    get: () => getPipeFn(rvalue as RValue),
  })
}

export function addPipe<RValue>(
  rvalue: RValue | Promise<RValue>,
  getPipeFn: (rvalue: RValue) => internal.Pipe<RValue>
): WithPipe<typeof rvalue> {
  return addProperty(rvalue, 'pipe', getPipeFn) as WithPipe<typeof rvalue>
}

export function addPipeAsync<RValue>(
  rvalue: RValue | Promise<RValue>,
  getPipeFn: (rvalue: RValue) => internal.Pipe<RValue>
): WithPipeAsync<typeof rvalue> {
  return addProperty(rvalue, 'pipeAsync', getPipeFn) as WithPipeAsync<typeof rvalue>
}
