import { TypeGuardError } from '../../../TypeGuards/TypeErrors'
import { isCustom } from '../../rules/helpers/isCustomRule'
import { findInvalidCustomRulesIndexes } from './findAllInvalidCustomRulesIndexes'
import { parseListToString } from './parseListToString'

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
