import type { FluentSchema } from './FluentSchema.ts'

export type BooleanSchema = CallableFunction & (() => FluentSchema<any>)
