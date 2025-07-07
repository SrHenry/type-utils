import { optional } from './factories/optional'

/**
 * A wrapper for the `optional` rule.
 * It is used to provide a consistent interface for all rules and is not necessary to use this wrapper, as it is only a flag utility for library internals.
 *
 * @deprecated It is intended for internal use only.
 * @internal
 * @see {@link optional}
 * */
export const OptionalRules = {
    optional,
}

export { optional }

/** @deprecated */
export type OptionalRule = ReturnType<(typeof OptionalRules)[keyof typeof OptionalRules]>
