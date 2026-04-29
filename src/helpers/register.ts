import type { Container, Module } from '../di/index.ts'
import { AutoBindDecorator, PipelineHelpers, ThrowHelper } from '../di/tokens.ts'
import { Lifetime } from '../di/index.ts'
import { AutoBind } from './decorators/stage-2/AutoBind.ts'
import { pipe } from './Experimental/pipeline/pipe.ts'
import { join } from './Experimental/join.ts'
import { map } from './Experimental/map.ts'
import { $throw } from './throw.ts'

export const helpersModule: Module = {
  register(container: Container): void {
    container.register(AutoBindDecorator, () => AutoBind, Lifetime.Singleton)

    container.register(PipelineHelpers, () => ({
      pipe,
      join,
      map,
    }), Lifetime.Singleton)

    container.register(ThrowHelper, () => $throw, Lifetime.Singleton)
  },
}
