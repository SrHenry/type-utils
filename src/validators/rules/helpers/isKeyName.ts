import { bindings } from '../constants'

export const isKeyName = (str: unknown): str is keyof bindings =>
    typeof str === 'string' && str in bindings
