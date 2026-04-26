import type { TypeGuard } from '../../../../TypeGuards/types/index.ts'
import { number } from '../../../schema/number.ts'
import { object } from '../../../schema/object.ts'
import { string } from '../../../schema/string.ts'
import { optionalize, optionalizeOverloadFactory } from '../optional/index.ts'

describe('optionalize', () => {
    it('should generate an optional schema embeded in the original schema', () => {
        interface Something {
            foo: string
            bar: number
        }
        function isSomething() {
            return object({
                foo: string(),
                bar: number(),
            }) as TypeGuard<Something>
        }
        const optionalized = optionalize(isSomething)

        expect(optionalized()(undefined)).toBe(false)
        expect(optionalized()({})).toBe(false)
        expect(
            optionalized()({
                foo: '',
                bar: 0,
            })
        ).toBe(true)
        expect(optionalized.optional()(undefined)).toBe(true)
        expect(optionalized.optional()({})).toBe(false)

        expect(
            optionalized.optional()({
                bar: 0,
            })
        ).toBe(false)
        expect(
            optionalized.optional()({
                foo: '',
                bar: 0,
            })
        ).toBe(true)
    })
})

describe('optionalizeOverloadFactory', () => {
    it('should behave like optionalize, as it is just a wrapper for type convenience', () => {
        interface Something {
            foo: string
            bar: number
        }
        function isSomething() {
            return object({
                foo: string(),
                bar: number(),
            }) as TypeGuard<Something>
        }
        const optionalized = optionalizeOverloadFactory(isSomething).optionalize<{
            (): TypeGuard<undefined | Something>
        }>()

        expect(optionalized()(undefined)).toBe(false)
        expect(optionalized()({})).toBe(false)
        expect(
            optionalized()({
                foo: '',
                bar: 0,
            })
        ).toBe(true)
        expect(optionalized.optional()(undefined)).toBe(true)
        expect(optionalized.optional()({})).toBe(false)

        expect(
            optionalized.optional()({
                bar: 0,
            })
        ).toBe(false)
        expect(
            optionalized.optional()({
                foo: '',
                bar: 0,
            })
        ).toBe(true)
    })
})
