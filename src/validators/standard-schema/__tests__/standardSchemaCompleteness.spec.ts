import { asUndefined } from '../../schema/asUndefined.ts'
import { asNull } from '../../schema/asNull.ts'
import { boolean } from '../../schema/boolean.ts'
import { any } from '../../schema/any.ts'
import { symbol } from '../../schema/symbol.ts'
import { primitive } from '../../schema/primitive.ts'
import { isStandardSchema } from '../isStandardSchema.ts'
import type { StandardSchemaV1 as SS } from '../types.ts'

describe('producer: .toStandardSchema() completeness', () => {
    describe('asUndefined', () => {
        it('should return a clean StandardSchemaV1 object', () => {
            const std = asUndefined().toStandardSchema()
            expect(std['~standard']).toBeDefined()
            expect(std['~standard'].version).toBe(1)
            expect(std['~standard'].vendor).toBe('@srhenry/type-utils')
        })

        it('should validate correctly', () => {
            const std = asUndefined().toStandardSchema()
            const valid = std['~standard'].validate(undefined) as SS.Result<undefined>
            const invalid = std['~standard'].validate(null) as SS.Result<undefined>
            expect(valid.success).toBe(true)
            expect(invalid.success).toBe(false)
        })

        it('should be detected as isStandardSchema', () => {
            expect(isStandardSchema(asUndefined())).toBe(true)
        })

        it('should return a pure Standard Schema object without TypeGuard methods', () => {
            const std = asUndefined().toStandardSchema()
            expect(typeof std).toBe('object')
            expect(typeof (std as any).__call).toBe('undefined')
        })
    })

    describe('asNull', () => {
        it('should return a clean StandardSchemaV1 object', () => {
            const std = asNull().toStandardSchema()
            expect(std['~standard']).toBeDefined()
            expect(std['~standard'].version).toBe(1)
            expect(std['~standard'].vendor).toBe('@srhenry/type-utils')
        })

        it('should validate correctly', () => {
            const std = asNull().toStandardSchema()
            const valid = std['~standard'].validate(null) as SS.Result<null>
            const invalid = std['~standard'].validate(undefined) as SS.Result<null>
            expect(valid.success).toBe(true)
            expect(invalid.success).toBe(false)
        })

        it('should be detected as isStandardSchema', () => {
            expect(isStandardSchema(asNull())).toBe(true)
        })

        it('should return a pure Standard Schema object without TypeGuard methods', () => {
            const std = asNull().toStandardSchema()
            expect(typeof std).toBe('object')
            expect(typeof (std as any).__call).toBe('undefined')
        })
    })

    describe('boolean', () => {
        it('should return a clean StandardSchemaV1 object', () => {
            const std = boolean().toStandardSchema()
            expect(std['~standard']).toBeDefined()
            expect(std['~standard'].version).toBe(1)
            expect(std['~standard'].vendor).toBe('@srhenry/type-utils')
        })

        it('should validate correctly', () => {
            const std = boolean().toStandardSchema()
            const valid = std['~standard'].validate(true) as SS.Result<boolean>
            const invalid = std['~standard'].validate('true') as SS.Result<boolean>
            expect(valid.success).toBe(true)
            expect(invalid.success).toBe(false)
        })

        it('should be detected as isStandardSchema', () => {
            expect(isStandardSchema(boolean())).toBe(true)
        })

        it('should return a pure Standard Schema object without TypeGuard methods', () => {
            const std = boolean().toStandardSchema()
            expect(typeof std).toBe('object')
            expect(typeof (std as any).__call).toBe('undefined')
        })
    })

    describe('any', () => {
        it('should return a clean StandardSchemaV1 object', () => {
            const std = any().toStandardSchema()
            expect(std['~standard']).toBeDefined()
            expect(std['~standard'].version).toBe(1)
            expect(std['~standard'].vendor).toBe('@srhenry/type-utils')
        })

        it('should validate correctly (always succeeds)', () => {
            const std = any().toStandardSchema()
            const result1 = std['~standard'].validate('hello') as SS.Result<any>
            const result2 = std['~standard'].validate(42) as SS.Result<any>
            const result3 = std['~standard'].validate(null) as SS.Result<any>
            expect(result1.success).toBe(true)
            expect(result2.success).toBe(true)
            expect(result3.success).toBe(true)
        })

        it('should be detected as isStandardSchema', () => {
            expect(isStandardSchema(any())).toBe(true)
        })

        it('should return a pure Standard Schema object without TypeGuard methods', () => {
            const std = any().toStandardSchema()
            expect(typeof std).toBe('object')
            expect(typeof (std as any).__call).toBe('undefined')
        })
    })

    describe('symbol', () => {
        it('should return a clean StandardSchemaV1 object', () => {
            const std = symbol().toStandardSchema()
            expect(std['~standard']).toBeDefined()
            expect(std['~standard'].version).toBe(1)
            expect(std['~standard'].vendor).toBe('@srhenry/type-utils')
        })

        it('should validate correctly', () => {
            const std = symbol().toStandardSchema()
            const valid = std['~standard'].validate(Symbol('test')) as SS.Result<symbol>
            const invalid = std['~standard'].validate('symbol') as SS.Result<symbol>
            expect(valid.success).toBe(true)
            expect(invalid.success).toBe(false)
        })

        it('should be detected as isStandardSchema', () => {
            expect(isStandardSchema(symbol())).toBe(true)
        })

        it('should return a pure Standard Schema object without TypeGuard methods', () => {
            const std = symbol().toStandardSchema()
            expect(typeof std).toBe('object')
            expect(typeof (std as any).__call).toBe('undefined')
        })
    })

    describe('primitive', () => {
        it('should return a clean StandardSchemaV1 object', () => {
            const std = primitive().toStandardSchema()
            expect(std['~standard']).toBeDefined()
            expect(std['~standard'].version).toBe(1)
            expect(std['~standard'].vendor).toBe('@srhenry/type-utils')
        })

        it('should validate correctly', () => {
            const std = primitive().toStandardSchema()
            const validString = std['~standard'].validate('hello') as SS.Result<any>
            const validNumber = std['~standard'].validate(42) as SS.Result<any>
            const validBool = std['~standard'].validate(true) as SS.Result<any>
            const validUndefined = std['~standard'].validate(undefined) as SS.Result<any>
            const validSymbol = std['~standard'].validate(Symbol('test')) as SS.Result<any>
            const invalid = std['~standard'].validate({}) as SS.Result<any>
            expect(validString.success).toBe(true)
            expect(validNumber.success).toBe(true)
            expect(validBool.success).toBe(true)
            expect(validUndefined.success).toBe(true)
            expect(validSymbol.success).toBe(true)
            expect(invalid.success).toBe(false)
        })

        it('should be detected as isStandardSchema', () => {
            expect(isStandardSchema(primitive())).toBe(true)
        })

        it('should return a pure Standard Schema object without TypeGuard methods', () => {
            const std = primitive().toStandardSchema()
            expect(typeof std).toBe('object')
            expect(typeof (std as any).__call).toBe('undefined')
        })
    })
})
