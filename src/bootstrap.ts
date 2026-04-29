import { createContainer } from './di/index.ts'
import { typeGuardsModule } from './TypeGuards/register.ts'
import { helpersModule } from './helpers/register.ts'
import { validatorsModule } from './validators/register.ts'
import { matchModule } from './match/register.ts'
import { setContainer, resetContainer } from './container.ts'

export function bootstrap(): void {
  resetContainer()

  const container = createContainer()

  typeGuardsModule.register(container)
  helpersModule.register(container)
  validatorsModule.register(container)
  matchModule.register(container)

  setContainer(container)
}

export { getContainer, resetContainer } from './container.ts'
