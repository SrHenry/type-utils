import type { FluentSchema } from './FluentSchema.ts'

export type SymbolSchema = CallableFunction & (() => FluentSchema<symbol>)
