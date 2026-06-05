import type { FluentSchema } from './FluentSchema.ts'
import type { Sanitize, ValidatorMap } from '../../types/index.ts'

export type ObjectSchema = CallableFunction & {
    <T extends {}>(tree: ValidatorMap<T>): FluentSchema<Sanitize<T>>
    (): FluentSchema<Record<any, any>>
    // biome-ignore lint/complexity/noBannedTypes: {} used as wildcard object type for overload
    (tree: {}): FluentSchema<{}>
}
