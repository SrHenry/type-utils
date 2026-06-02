import type { FluentSchema } from './FluentSchema.ts'

export type NullSchema = CallableFunction & (() => FluentSchema<null>)
