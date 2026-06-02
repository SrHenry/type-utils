import type { Generics } from '../../../Generics/index.ts'
import type { FluentSchema } from './FluentSchema.ts'

export type PrimitiveSchema = CallableFunction & (() => FluentSchema<Generics.PrimitiveType>)
