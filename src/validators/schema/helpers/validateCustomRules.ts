import { TypeGuardError } from '../../../TypeGuards/TypeErrors.ts'
import { isCustom } from '../../rules/helpers/isCustomRule.ts'
import { findInvalidCustomRulesIndexes } from './findAllInvalidCustomRulesIndexes.ts'
import { parseListToString } from './parseListToString.ts'

export function validateCustomRules(rules: unknown[]) {
    const invalidArgsIndexes = findInvalidCustomRulesIndexes(rules)

    if (invalidArgsIndexes.length > 0) {
        throw new TypeGuardError(
            `Invalid rule argument(s) at indexes '${parseListToString(invalidArgsIndexes)}'.`,
            rules,
            isCustom
        )
    }

    return rules
}
