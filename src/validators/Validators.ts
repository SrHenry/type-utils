import { Generics } from '../Generics'
import { TypeGuard } from '../TypeGuards/GenericTypeGuards'
import { BaseValidator } from './BaseValidator'
import { MessageFormator } from './rules/types'

export type OptionalKeys<T> = keyof Generics.OmitNever<{
    [K in keyof T]-?: T[K] extends NonNullable<T[K]> ? never : K
}>
export type RequiredKeys<T> = keyof Omit<T, OptionalKeys<T>>

/** @internal */
export type __neverifyOptional<T> = {
    [K in keyof T]: undefined extends T[K] ? K : never
}

export type RequiredProps<T> = Omit<T, OptionalKeys<T>>
export type OptionalProps<T> = Pick<T, OptionalKeys<T>>

export type ValidatorMap<T> = {
    [K in keyof T]: TypeGuard<T[K]>
}

export type ValidatorArgs<T> = {
    validators: ValidatorMap<T>
    required?: Array<keyof T>
    optional?: Array<keyof T>
}

export type ValidatorMessageMap<T> = T extends (infer U)[]
    ? ValidatorMessageMap<U>
    : T extends Generics.PrimitiveType
    ? string | MessageFormator
    : Partial<{
          [K in keyof T]: ValidatorMessageMap<T[K]>
      }>

export type UnpackSchema<T extends ValidatorMap<any>> = T extends ValidatorMap<infer U>
    ? Sanitize<U>
    : never

export type Unpack<T extends ValidatorMap<any>> = T extends ValidatorMap<infer U>
    ? Sanitize<U>
    : never

export type Sanitize<T> = {
    [K in RequiredKeys<T>]-?: T[K]
} & {
    [P in OptionalKeys<T>]+?: Exclude<T[P], undefined>
}

export const validator = BaseValidator
