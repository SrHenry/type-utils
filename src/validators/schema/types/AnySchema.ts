import type { FluentSchema } from './FluentSchema.ts'

export type AnySchema = CallableFunction & (() => FluentSchema<any>)
