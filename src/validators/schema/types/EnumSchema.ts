import type Generics from '../../../Generics/index.ts'
import type { FluentSchema } from './FluentSchema.ts'

export type EnumSchema = CallableFunction &
    (<const T extends [...Generics.PrimitiveType[]]>(values: T) => FluentSchema<T[number]>)
