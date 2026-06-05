import type ValidationError from '../ValidationError.ts'
import type { ValidationErrors } from '../ValidationErrors.ts'

export type ValidateReturn<T> =
    | T
    | ValidationErrors<
          | ValidationError<unknown, T>
          | ValidationError<unknown, T[Extract<keyof T, string>], Extract<keyof T, string>, T>
          | ValidationError
      >
