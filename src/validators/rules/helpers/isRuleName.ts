import { keys } from '../constants'

export const isRuleName = (str: unknown): str is keyof keys =>
    typeof str === 'string' && str in keys
