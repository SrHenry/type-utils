import type { Container, Module } from '../di/index.ts'
import { StructMetadataService, StandardSchemaAdapter, SchemaFactory } from '../di/tokens.ts'
import { Lifetime } from '../di/index.ts'

import { setStructMetadata } from './schema/helpers/setStructMetadata.ts'
import { getStructMetadata } from './schema/helpers/getStructMetadata.ts'
import { hasStructMetadata } from './schema/helpers/hasStructMetadata.ts'
import { setCustomStructMetadata } from './schema/helpers/setCustomStructMetadata.ts'
import { updateStructMetadata } from './schema/helpers/updateStructMetadata.ts'
import { copyStructMetadata } from './schema/helpers/copyStructMetadata.ts'
import { getRuleStructMetadata } from './schema/helpers/getRuleStructMetadata.ts'
import { isRuleStruct } from './schema/helpers/isRuleStruct.ts'

import { isStandardSchema } from './standard-schema/isStandardSchema.ts'
import { fromStandardSchema } from './standard-schema/fromStandardSchema.ts'
import { normalizeSchema } from './standard-schema/normalizeSchema.ts'
import { attachStandardSchema } from './standard-schema/attachStandardSchema.ts'
import { toStandardSchema } from './standard-schema/toStandardSchema.ts'

import { and } from './schema/and.ts'
import { or } from './schema/or.ts'
import { array } from './schema/array.ts'
import { object } from './schema/object.ts'
import { number } from './schema/number.ts'
import { string } from './schema/string.ts'
import { symbol } from './schema/symbol.ts'
import { tuple } from './schema/tuple.ts'
import { record } from './schema/record.ts'

export const validatorsModule: Module = {
  register(container: Container): void {
    container.register(StructMetadataService, () => ({
      setStructMetadata,
      getStructMetadata,
      hasStructMetadata,
      setCustomStructMetadata,
      updateStructMetadata,
      copyStructMetadata,
      getRuleStructMetadata,
      isRuleStruct,
    }), Lifetime.Singleton)

    container.register(StandardSchemaAdapter, () => ({
      isStandardSchema,
      fromStandardSchema,
      normalizeSchema,
      attachStandardSchema,
      toStandardSchema,
    }), Lifetime.Singleton)

    container.register(SchemaFactory, () => ({
      and,
      or,
      array,
      object,
      number,
      string,
      symbol,
      tuple,
      record,
    }), Lifetime.Singleton)
  },
}
