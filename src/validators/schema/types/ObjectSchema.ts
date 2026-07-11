import type { ObjectRules } from '../../rules/Object/index.ts'
import type { FluentSchema } from './FluentSchema.ts'
import type { Sanitize, ValidatorMap } from '../../types/index.ts'

export type ObjectSchema = CallableFunction & {
    <T extends {}>(tree: ValidatorMap<T>): FluentSchema<Sanitize<T>, typeof ObjectRules>
    (): FluentSchema<Record<any, any>, typeof ObjectRules>
    // biome-ignore lint/complexity/noBannedTypes: {} used as wildcard object type for overload
    (tree: {}): FluentSchema<{}, typeof ObjectRules>
}
