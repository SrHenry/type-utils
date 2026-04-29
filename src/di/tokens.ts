import { createToken } from './ServiceToken.ts'
import type { ServiceToken } from './types.ts'
import type {
  MetadataStoreService,
  MetadataService$Service,
  TypeGuardTagService$,
  MessageService$,
  ValidatorMessageService$,
  EnsureInterfaceService$,
  EnsureInstanceOfService$,
  IsInstanceOfService$,
  IsService$,
  TypeGuardErrorService$,
  ThrowHelper$,
  AutoBindDecorator$,
  PipelineHelpers$,
  StructMetadataService$,
  StandardSchemaAdapter$,
  SchemaFactory$,
} from './service-types.ts'

export const MetadataStore: ServiceToken<MetadataStoreService> = createToken('MetadataStore')
export const MetadataService$: ServiceToken<MetadataService$Service> = createToken('MetadataService')
export const TypeGuardTagService: ServiceToken<TypeGuardTagService$> = createToken('TypeGuardTagService')
export const MessageService: ServiceToken<MessageService$> = createToken('MessageService')
export const ValidatorMessageService: ServiceToken<ValidatorMessageService$> = createToken('ValidatorMessageService')
export const AutoBindDecorator: ServiceToken<AutoBindDecorator$> = createToken('AutoBindDecorator')
export const PipelineHelpers: ServiceToken<PipelineHelpers$> = createToken('PipelineHelpers')
export const StandardSchemaAdapter: ServiceToken<StandardSchemaAdapter$> = createToken('StandardSchemaAdapter')
export const StructMetadataService: ServiceToken<StructMetadataService$> = createToken('StructMetadataService')
export const SchemaFactory: ServiceToken<SchemaFactory$> = createToken('SchemaFactory')
export const EnsureInterfaceService: ServiceToken<EnsureInterfaceService$> = createToken('EnsureInterfaceService')
export const EnsureInstanceOfService: ServiceToken<EnsureInstanceOfService$> = createToken('EnsureInstanceOfService')
export const IsInstanceOfService: ServiceToken<IsInstanceOfService$> = createToken('IsInstanceOfService')
export const IsService: ServiceToken<IsService$> = createToken('IsService')
export const IsStructService: ServiceToken<unknown> = createToken('IsStructService')
export const ThrowHelper: ServiceToken<ThrowHelper$> = createToken('ThrowHelper')
export const TypeGuardErrorService: ServiceToken<TypeGuardErrorService$> = createToken('TypeGuardErrorService')
