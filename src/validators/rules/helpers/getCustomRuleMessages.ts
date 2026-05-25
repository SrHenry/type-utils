import type { Custom } from '../types/index.ts'

export const getCustomRuleMessages = (rules: Custom[]): string[] =>
    rules.map(([, args, , formator]) => formator(...args))
