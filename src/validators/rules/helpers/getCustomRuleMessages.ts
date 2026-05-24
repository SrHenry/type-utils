import type { Custom } from '../types/index.ts'

export const getCustomRuleMessages = (rules: Custom[]) =>
    rules.map(([, args, , formator]) => formator(...args))
