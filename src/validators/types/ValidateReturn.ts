import type { Result } from '../../types/Result.ts'
import type { ValidationErrors } from '../ValidationErrors.ts'

/**
 * @deprecated since 0.9.0 — use `Result<T, ValidationErrors>` instead.
 * `ValidateReturn<T>` is aliased to `Result<T, ValidationErrors>` and will be
 * removed in 0.10.0. The no-throw branches of `schema.validator(false)` and
 * `SchemaValidator.validate(arg, schema, false)` now return `Result`, not the
 * bare `T | ValidationErrors` union this type previously modeled.
 */
export type ValidateReturn<T> = Result<T, ValidationErrors>
