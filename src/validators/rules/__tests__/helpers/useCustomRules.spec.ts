import type { Custom } from '../../types'

import { number } from '../../../schema/number'
import { createRule } from '../../helpers/createRule'
import { useCustomRules } from '../../helpers/useCustomRules'

describe('useCustomRules', () => {
    it('should apply a simple custom rule', () => {
        const ruleTuple = ['isEven', [], (n: number) => () => n % 2 === 0] as const as Custom<
            [],
            'isEven',
            number
        >
        const validator = useCustomRules(number(), ruleTuple)
        expect(validator(2)).toBe(true)
        expect(validator(3)).toBe(false)
    })

    it('should work with multiple custom rules', () => {
        const isEven = ['isEven', [], (n: number) => () => n % 2 === 0] as const as Custom<
            [],
            'isEven',
            number
        >
        const isPositive = ['isPositive', [], (n: number) => () => n > 0] as const as Custom<
            [],
            'isPositive',
            number
        >
        const validator = useCustomRules(number(), isEven, isPositive)
        expect(validator(4)).toBe(true)
        expect(validator(-2)).toBe(false)
        expect(validator(3)).toBe(false)
    })

    it('should work with a rule created by createRule', () => {
        const minRule = createRule({
            name: 'min',
            handler: (value: number) => (min: number) => value >= min,
            message: 'Valor abaixo do mínimo',
        })
        const ruleTuple = minRule(5)
        const validator = useCustomRules(number(), ruleTuple)
        expect(validator(6)).toBe(true)
        expect(validator(4)).toBe(false)
    })

    it('should work with multiple rules created by createRule', () => {
        const minRule = createRule({
            name: 'min',
            handler: (value: number) => (min: number) => value >= min,
            message: 'Value is below the minimum',
        })
        const maxRule = createRule({
            name: 'max',
            handler: (value: number) => (max: number) => value <= max,
            message: 'Value is above the maximum',
        })
        const minTuple = minRule(2)
        const maxTuple = maxRule(5)
        const validator = useCustomRules(number(), minTuple, maxTuple)
        expect(validator(1)).toBe(false) // below min
        expect(validator(2)).toBe(true) // at min
        expect(validator(4)).toBe(true) // between min and max
        expect(validator(5)).toBe(true) // at max
        expect(validator(6)).toBe(false) // above max
    })

    it('should work with no custom rules (only base schema)', () => {
        const validator = useCustomRules(number())
        expect(validator(123)).toBe(true)
        expect(validator('abc' as any)).toBe(false)
    })

    it('should work with a custom rule that always returns false', () => {
        const alwaysFalse = ['never', [], () => () => false] as const as Custom<[], 'never', number>
        const validator = useCustomRules(number(), alwaysFalse)
        expect(validator(1)).toBe(false)
        expect(validator(0)).toBe(false)
    })

    it('should work with a custom rule that uses arguments', () => {
        const greaterThan = [
            'greaterThan',
            [10],
            (n: number) => (min: number) => n > min,
        ] as const as Custom<[number], 'greaterThan', number>
        const validator = useCustomRules(number(), greaterThan)
        expect(validator(11)).toBe(true)
        expect(validator(10)).toBe(false)
        expect(validator(9)).toBe(false)
    })

    it('should work with a rule created by createRule with messageFormator', () => {
        const minRule = createRule({
            name: 'min',
            handler: (value: number) => (min: number) => value >= min,
            messageFormator: (v: any) => `Value ${v} is too small`,
        })
        const ruleTuple = minRule(5)
        const validator = useCustomRules(number(), ruleTuple)
        expect(validator(6)).toBe(true)
        expect(validator(4)).toBe(false)
    })

    it('should work with a custom rule that returns true for all values', () => {
        const alwaysTrue = ['always', [], () => () => true] as const as Custom<[], 'always', number>
        const validator = useCustomRules(number(), alwaysTrue)
        expect(validator(1)).toBe(true)
        expect(validator(0)).toBe(true)
        expect(validator(-1)).toBe(true)
    })

    it('should work with a complex set of rules', () => {
        const isEven = ['isEven', [], (n: number) => () => n % 2 === 0] as const as Custom<
            [],
            'isEven',
            number
        >
        const isPositive = ['isPositive', [], (n: number) => () => n > 0] as const as Custom<
            [],
            'isPositive',
            number
        >
        const minRule = createRule({
            name: 'min',
            handler: (value: number) => (min: number) => value >= min,
            message: 'Value is below the minimum',
        })
        const maxRule = createRule({
            name: 'max',
            handler: (value: number) => (max: number) => value <= max,
            message: 'Value is above the maximum',
        })
        const ruleTuple = [isEven, isPositive, minRule(2), maxRule(5)]
        const validator = useCustomRules(number(), ...ruleTuple)
        expect(validator(4)).toBe(true) // even, positive, min <= 2, max >= 5
        expect(validator(3)).toBe(false) // odd
        expect(validator(1)).toBe(false) // below min
        expect(validator(6)).toBe(false) // above max
    })
})
