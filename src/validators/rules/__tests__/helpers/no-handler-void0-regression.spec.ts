import { CUSTOM_RULE_BRAND } from '../../types/index.ts'
import { createInlineRule } from '../../helpers/createInlineRule.ts'
import { createRule } from '../../helpers/createRule.ts'
import { isCustom } from '../../helpers/isCustomRule.ts'
import { number } from '../../../schema/number.ts'
import { tuple } from '../../../schema/tuple.ts'
import { object } from '../../../schema/object.ts'

const NOT_CALLED = Symbol('not-called')

describe('regression: handler must never be called with undefined/null/void 0', () => {
    it('should not call handler with undefined at schema.use() registration time', () => {
        let handlerCalledWith: unknown = NOT_CALLED
        const rule = createRule({
            name: 'trackCalls',
            handler: (n: number) => {
                handlerCalledWith = n
                return () => n > 0
            },
        })

        number().use(rule())

        expect(handlerCalledWith).toBe(NOT_CALLED)
    })

    it('should not call handler with undefined at schema.use() for inline rules', () => {
        let handlerCalledWith: unknown = NOT_CALLED
        const rule = createInlineRule('trackInline', (n: number) => {
            handlerCalledWith = n
            return n > 0
        })

        number().use(rule)

        expect(handlerCalledWith).toBe(NOT_CALLED)
    })

    it('should only call handler with the actual value during validation', () => {
        const calls: unknown[] = []
        const rule = createRule({
            name: 'trackValidation',
            handler: (n: number) => {
                calls.push(n)
                return () => n > 0
            },
        })

        const schema = number().use(rule())
        schema(3)

        expect(calls).toEqual([3])
    })

    it('should support handlers that destructure their subject without guarding against undefined', () => {
        const greaterThan = createRule({
            name: 'Custom.Tuple.GreaterThan',
            handler:
                ([arg1, arg2]: [number, number]) =>
                () =>
                    arg1 <= arg2,
        })

        const schema = tuple(number().min(1), number().min(2)).use(greaterThan())

        expect(schema([1, 5])).toBe(true)
        expect(schema([5, 1])).toBe(false)
    })

    it('should support createInlineRule with handlers that destructure their subject', () => {
        const rule = createInlineRule(
            'Custom.Tuple.GreaterThan',
            ([arg1, arg2]: [number, number]) => arg1 <= arg2
        )

        const schema = tuple(number().min(1), number().min(2)).use(rule)

        expect(schema([1, 5])).toBe(true)
        expect(schema([5, 1])).toBe(false)
    })

    it('should support createInlineRule with property-accessing handlers', () => {
        const hasLength = createInlineRule(
            'Custom.Object.HasLength',
            (s: { length: number }) => s.length > 0
        )

        expect(() => object({ length: number().min(1) }).use(hasLength)).not.toThrow()
    })
})

describe('regression: brand-based validation replaces handler(void 0) spec check', () => {
    it('should reject manually constructed rule tuples without brand', () => {
        const fakeRule = ['fake', [], () => (): boolean => true]

        expect(isCustom(fakeRule)).toBe(false)
    })

    it('should accept rules created via createRule (with brand)', () => {
        const rule = createRule({
            name: 'valid',
            handler: (n: number) => () => n > 0,
        })

        expect(isCustom(rule())).toBe(true)
    })

    it('should accept rules created via createInlineRule (with brand)', () => {
        const rule = createInlineRule('valid', (n: number) => n > 0)

        expect(isCustom(rule)).toBe(true)
    })

    it('should validate handler arity is at most 1 param', () => {
        const rule = createRule({
            name: 'valid',
            handler: (n: number) => () => n > 0,
        })
        // biome-ignore lint/nursery/noShadow: callback destructuring — name matches outer scope intentionally
        const tuple = rule()

        const handler = tuple[2]
        expect(typeof handler).toBe('function')
        expect(handler.length).toBeLessThanOrEqual(1)
    })

    it('should reject rules missing the brand symbol even if structurally valid', () => {
        const rule = createRule({
            name: 'branded',
            handler: (n: number) => () => n > 0,
        })
        const [name, args, handler, formator] = rule()
        const unbranded = [name, args, handler, formator]

        expect(isCustom(unbranded)).toBe(false)
    })

    it('should have CUSTOM_RULE_BRAND symbol on rules from createRule', () => {
        const rule = createRule({
            name: 'check',
            handler: (n: number) => () => n > 0,
        })
        const result = rule()

        expect((result as any)[CUSTOM_RULE_BRAND]).toBe(true)
    })
})

describe('regression: isCustomHandler is removed from exports', () => {
    it('should not export isCustomHandler from helpers index', () => {
        const helpers = import('../../helpers/index.ts')
        return helpers.then(mod => {
            expect(mod).not.toHaveProperty('isCustomHandler')
        })
    })
})
