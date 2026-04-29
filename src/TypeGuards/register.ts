import type { Container, Module } from '../di/index.ts'
import { MetadataStore, MetadataService$, TypeGuardTagService, MessageService, ValidatorMessageService, EnsureInterfaceService, EnsureInstanceOfService, IsInstanceOfService, IsService, TypeGuardErrorService } from '../di/tokens.ts'
import { Lifetime } from '../di/index.ts'

import { defineMetadata, getOwnMetadata, hasOwnMetadata } from './helpers/metadataStore.ts'
import { setMetadata } from './helpers/setMetadata.ts'
import { getMetadata } from './helpers/getMetadata.ts'
import { hasMetadata } from './helpers/hasMetadata.ts'
import { asTypeGuard } from './helpers/asTypeGuard.ts'
import { setAsTypeGuard } from './helpers/setAsTypeGuard.ts'
import { isTypeGuard } from './helpers/isTypeGuard.ts'
import { hasTypeGuardMetadata } from './helpers/hasTypeGuardMetadata.ts'
import { getMessage } from './helpers/getMessage.ts'
import { hasMessage } from './helpers/hasMessage.ts'
import { setMessage } from './helpers/setMessage.ts'
import { getMessageFormator } from './helpers/getMessageFormator.ts'
import { setMessageFormator } from './helpers/setMessageFormator.ts'
import { getValidatorMessage } from './helpers/getValidatorMessage.ts'
import { setValidatorMessage } from './helpers/setValidatorMessage.ts'
import { hasValidatorMessage } from './helpers/hasValidatorMessage.ts'
import { setValidatorMessageFormator } from './helpers/setValidatorMessageFormator.ts'
import { hasValidatorMessageFormator } from './helpers/hasValidatorMessageFormator.ts'
import { ensureInterface } from './helpers/ensureInterface.ts'
import { ensureInstanceOf } from './helpers/ensureInstanceOf.ts'
import { isInstanceOf } from './helpers/isInstanceOf.ts'
import { is } from './helpers/is.ts'
import { TypeGuardError } from './TypeErrors.ts'

export const typeGuardsModule: Module = {
  register(container: Container): void {
    container.register(MetadataStore, () => ({
      define: defineMetadata,
      get: getOwnMetadata,
      has: hasOwnMetadata,
    }), Lifetime.Singleton)

    container.register(MetadataService$, () => ({
      set: setMetadata,
      get: getMetadata,
      has: hasMetadata,
    }), Lifetime.Singleton)

    container.register(TypeGuardTagService, () => ({
      asTypeGuard,
      setAsTypeGuard,
      isTypeGuard,
      hasTypeGuardMetadata,
    }), Lifetime.Singleton)

    container.register(MessageService, () => ({
      getMessage,
      hasMessage,
      setMessage,
      getMessageFormator,
      setMessageFormator,
    }), Lifetime.Singleton)

    container.register(ValidatorMessageService, () => ({
      getValidatorMessage,
      setValidatorMessage,
      hasValidatorMessage,
      setValidatorMessageFormator,
      hasValidatorMessageFormator,
    }), Lifetime.Singleton)

    container.register(EnsureInterfaceService, () => ensureInterface, Lifetime.Singleton)
    container.register(EnsureInstanceOfService, () => ensureInstanceOf, Lifetime.Singleton)
    container.register(IsInstanceOfService, () => isInstanceOf, Lifetime.Singleton)
    container.register(IsService, () => is, Lifetime.Singleton)
    container.register(TypeGuardErrorService, () => TypeGuardError, Lifetime.Singleton)
  },
}
