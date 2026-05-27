import { string } from '../../../schema/string.ts'
import { copyStructMetadata } from '../copyStructMetadata.ts'
import { hasOptionalFlag } from '../optionalFlag.ts'
import { setOptionalFlag } from '../optionalFlag.ts'
import { hasStructMetadata } from '../hasStructMetadata.ts'

describe('copyStructMetadata', () => {
    it('preserves the optional flag from the source guard', () => {
        const source = string().optional()
        const target = (arg: unknown): arg is string => typeof arg === 'string'

        expect(hasOptionalFlag(source)).toBe(true)
        expect(hasOptionalFlag(target)).toBe(false)

        const result = copyStructMetadata(source as any, target, {})

        expect(hasOptionalFlag(result)).toBe(true)
        expect(hasStructMetadata(result)).toBe(true)
    })

    it('does not set the optional flag when source is not optional', () => {
        const source = string()
        const target = (arg: unknown): arg is string => typeof arg === 'string'

        expect(hasOptionalFlag(source)).toBe(false)

        const result = copyStructMetadata(source as any, target, {})

        expect(hasOptionalFlag(result)).toBe(false)
        expect(hasStructMetadata(result)).toBe(true)
    })

    it('throws when source has no struct metadata', () => {
        const source = (arg: unknown): arg is string => typeof arg === 'string'
        const target = (arg: unknown): arg is string => typeof arg === 'string'

        expect(() => copyStructMetadata(source as any, target, {})).toThrow(TypeError)
    })

    it('preserves the optional flag even when an optional guard is manually tagged', () => {
        const source = string()
        setOptionalFlag(source)

        const target = (arg: unknown): arg is string => typeof arg === 'string'

        const result = copyStructMetadata(source as any, target, {})

        expect(hasOptionalFlag(result)).toBe(true)
    })
})
