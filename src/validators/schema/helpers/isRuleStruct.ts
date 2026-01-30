import { isRuleName } from '../../rules/helpers/isRuleName'
import type { All as AllRules, RuleStruct } from '../../rules/types'
import {} from '../types'

export function isRuleStruct(struct: unknown): struct is RuleStruct<AllRules> {
    if (!struct || typeof struct !== 'object') return false
    if (
        !('type' in struct) ||
        typeof struct.type !== 'string' ||
        !['default', 'custom'].includes(struct.type)
    )
        return false

    switch (struct.type) {
        case 'default':
            if (!('rule' in struct) || !isRuleName(struct.rule)) return false
            if (!('args' in struct) || !Array.isArray(struct.args)) return false

            break
        case 'custom':
            if (!('rule' in struct) || typeof struct.rule !== 'string') return false
            if (!('args' in struct) || !Array.isArray(struct.args)) return false
            if (!('handler' in struct) || typeof struct.handler !== 'function') return false

            break
    }

    return true
}
