import type { TypeGuard } from '../TypeGuards/types'
import type { keys } from './rules/constants'
import type { All as AllRules, Rule, RuleStruct } from './rules/types'

import { getMessageFormator } from '../TypeGuards/helpers/getMessageFormator'
import { isCustomRuleStruct } from './helpers/isCustomRuleStruct'
import { getRule } from './rules/helpers/getRule'
import { ValidationError } from './ValidationError'
import { ValidationErrors } from './ValidationErrors'

type RuleContext = {
    rule: RuleStruct<AllRules>
}

/**
 * Creates a generator that iterates over a set of rules and validates a value against it.
 *
 * @param value Value to check
 * @param rules Rules to validate value
 * @param schema Schema related to the rules for the sake of Schema Validation
 * @param path Path description to reach the current value in a nested validation
 * @param parent Parent of the current value
 *
 * @returns Generator that iterates over rules and yields each validation error from the rules.
 */
export function* createRulesValidationGenerator<Value, Schema, Parent = unknown>(
    value: Value,
    rules: RuleStruct<AllRules>[] | undefined,
    schema: TypeGuard<Schema>,
    path?: string,
    parent?: Parent
) {
    if (!Array.isArray(rules) || rules.length === 0) return

    for (const ruleStruct of rules) {
        if (ruleStruct.type === 'default') {
            const ruleFunction = getRule<keyof keys, Rule>(ruleStruct.rule)

            const passed = ruleFunction(value, ...ruleStruct.args)
            if (passed) continue

            const messageFormator = getMessageFormator(ruleFunction)
            const message = messageFormator(...ruleStruct.args)

            yield new ValidationError<Value, Schema, string, Parent, RuleContext>({
                schema,
                value,
                message,
                name: path,
                parent,
                context: { rule: ruleStruct },
            })
        } else if (isCustomRuleStruct(ruleStruct)) {
            const ruleFunction = ruleStruct.handler(value)

            const passed = ruleFunction(...ruleStruct.args)
            if (passed) continue

            const messageFormator = getMessageFormator(ruleFunction)
            const message = messageFormator(...ruleStruct.args)

            yield new ValidationError<Value, Schema, string, Parent, RuleContext>({
                schema,
                value,
                message,
                name: path,
                parent,
                context: { rule: ruleStruct },
            })
        }
    }
}
// export function validateRules<Value, Schema, Parent = unknown>(
//     value: Value,
//     rules: RuleStruct<AllRules>[] | undefined,
//     schema: TypeGuard<Schema>,
//     name?: string,
//     parent?: Parent
// ): ValidationError<Value, Schema, string, Parent, RuleContext>[] {
//     if (!Array.isArray(rules) || rules.length === 0) return []

//     const errors: ValidationError<Value, Schema, string, Parent, RuleContext>[] = []

//     for (const ruleStruct of rules) {
//         if (ruleStruct.type === 'default') {
//             const ruleFunction = getRule<keyof keys, Rule>(ruleStruct.rule)

//             const passed = ruleFunction(value, ...ruleStruct.args)
//             if (passed) continue

//             const messageFormator = getMessageFormator(ruleFunction)
//             const message = messageFormator(...ruleStruct.args)

//             errors.push(
//                 new ValidationError<Value, Schema, string, Parent, RuleContext>({
//                     schema,
//                     value,
//                     message,
//                     name,
//                     parent,
//                     context: { rule: ruleStruct },
//                 })
//             )
//         } else if (isCustomRuleStruct(ruleStruct)) {
//             const ruleFunction = ruleStruct.handler(value)

//             const passed = ruleFunction(...ruleStruct.args)
//             if (passed) continue

//             const messageFormator = getMessageFormator(ruleFunction)
//             const message = messageFormator(...ruleStruct.args)

//             errors.push(
//                 new ValidationError<Value, Schema, string, Parent, RuleContext>({
//                     schema,
//                     value,
//                     message,
//                     name,
//                     parent,
//                     context: { rule: ruleStruct },
//                 })
//             )
//         }
//     }

//     return errors
// }

/**
 * Verify if a value does not match the rules and returns false at the first rule that fails.
 *
 * @param value Value to check
 * @param rules Rules to check against the value
 * @param schema Schema related to the rules
 * @param path Path description to reach the current value in a nested validation
 * @param parent Parent of the current value
 *
 * @returns `false` if any rule fails, `true` otherwise
 */
export function doesNotMatchRules<Value, Schema, Parent = unknown>(
    value: Value,
    rules: RuleStruct<AllRules>[] | undefined,
    schema: TypeGuard<Schema>,
    path?: string,
    parent?: Parent
): boolean {
    for (const _ of createRulesValidationGenerator(value, rules, schema, path, parent)) return true

    return false
}

/**
 * Validates a value against a set of rules.
 *
 * @param value Value to check
 * @param rules Rules to validate value
 * @param schema Schema related to the rules for the sake of Schema Validation
 * @param path Path description to reach the current value in a nested validation
 * @param parent Parent of the current value
 *
 * @returns A ValidationErrors object containing all validation errors from the rules
 */
export function validateRules<Value, Schema, Parent = unknown>(
    value: Value,
    rules: RuleStruct<AllRules>[] | undefined,
    schema: TypeGuard<Schema>,
    path?: string,
    parent?: Parent
) {
    return new ValidationErrors(createRulesValidationGenerator(value, rules, schema, path, parent))
}
