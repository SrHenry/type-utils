import { CUSTOM_RULE_BRAND } from '../../types/index.ts'
import { createRule } from '../../helpers/createRule.ts'

describe('createRule', () => {
    const mockHandler =
        (value: number) =>
        (min: number): boolean =>
            value >= min
    const mockName = 'min'
    const mockMessage = 'Valor inválido'
    const mockMessageFormator = (v: any): string => `Valor ${v} inválido`

    it('should return a CustomFactory that includes name, args, wrapper and formator', () => {
        const factory = createRule({
            name: mockName,
            handler: mockHandler as any,
            message: mockMessage,
        })

        const [name, args, wrapper, formator] = factory(5)
        expect(name).toBe(mockName)
        expect(args).toEqual([5])
        expect(typeof wrapper).toBe('function')
        expect(typeof formator).toBe('function')
    })

    it('should attach the CUSTOM_RULE_BRAND symbol to the tuple', () => {
        const factory = createRule({
            name: mockName,
            handler: mockHandler as any,
        })

        const result = factory(5)
        expect((result as any)[CUSTOM_RULE_BRAND]).toBe(true)
    })

    it('wrapper should use messageFormator if provided', () => {
        const factory = createRule({
            name: mockName,
            handler: mockHandler as any,
            messageFormator: mockMessageFormator,
        })

        const [, , wrapper] = factory(10)

        expect(wrapper(10)).toBeDefined()
    })

    it('wrapper should use message if provided and no messageFormator', () => {
        const factory = createRule({
            name: mockName,
            handler: mockHandler as any,
            message: mockMessage,
        })

        const [, , wrapper] = factory(3)
        expect(wrapper(3)).toBeDefined()
    })

    it('wrapper should return handler(subject) if neither message nor messageFormator is provided', () => {
        const factory = createRule({
            name: mockName,
            handler: mockHandler as any,
        })

        const [, args, wrapper] = factory(2)
        expect(wrapper(5)(...args)).toBe(true)
        expect(wrapper(1)(...args)).toBe(false)
    })

    it('should allow messageFormator to return dynamic messages', () => {
        const dynamicFormator = (v: any): string => `Custom error for value: ${v}`
        const factory = createRule({
            name: 'dynamic',
            handler: mockHandler as any,
            messageFormator: dynamicFormator,
        })
        const [, , wrapper] = factory(8)
        const result = wrapper(5)
        expect(result).toBeDefined()
    })

    it('should handle undefined message and messageFormator gracefully', () => {
        const factory = createRule({
            name: 'noMsg',
            handler: mockHandler as any,
            message: undefined,
            messageFormator: undefined,
        })
        const [, args, wrapper] = factory(2)
        expect(wrapper(3)(...args)).toBe(true)
        expect(wrapper(1)(...args)).toBe(false)
    })

    it('should use default formator based on name when no message/formator provided', () => {
        const factory = createRule({
            name: 'min',
            handler: mockHandler as any,
        })
        const [, , , formator] = factory(5)
        expect(formator(5)).toBe('min(5)')
    })

    it('should use message as formator when message is provided', () => {
        const factory = createRule({
            name: 'min',
            handler: mockHandler as any,
            message: 'too small',
        })
        const [, , , formator] = factory(5)
        expect(formator(5)).toBe('too small')
    })

    it('should use messageFormator when messageFormator is provided', () => {
        const factory = createRule({
            name: 'min',
            handler: mockHandler as any,
            messageFormator: (v: any) => `Value ${v} is too small`,
        })
        const [, , , formator] = factory(5)
        expect(formator(5)).toBe('Value 5 is too small')
    })
})
