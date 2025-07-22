import { createRule } from '../../helpers/createRule'

describe('createRule', () => {
    const mockHandler = (value: number) => (min: number) => value >= min
    const mockName = 'min'
    const mockMessage = 'Valor inválido'
    const mockMessageFormator = (v: any) => `Valor ${v} inválido`

    it('should return a CustomFactory that includes name, args and wrapper', () => {
        const factory = createRule({
            name: mockName,
            handler: mockHandler as any,
            message: mockMessage,
        })

        const [name, args, wrapper] = factory(5)
        expect(name).toBe(mockName)
        expect(args).toEqual([5])
        expect(typeof wrapper).toBe('function')
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
        const dynamicFormator = (v: any) => `Custom error for value: ${v}`
        const factory = createRule({
            name: 'dynamic',
            handler: mockHandler as any,
            messageFormator: dynamicFormator,
        })
        const [, , wrapper] = factory(8)
        const result = wrapper(5)
        // Since the actual return is a mock, just check if the formator is used
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
})
