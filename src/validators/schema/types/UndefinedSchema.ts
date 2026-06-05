import type { FluentSchema } from './FluentSchema.ts'

export type UndefinedSchema = CallableFunction & (() => FluentSchema<undefined>)
