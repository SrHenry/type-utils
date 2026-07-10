import type { Result } from '../../types/Result.ts'
import { ValidationError } from '../ValidationError.ts'
import { ValidationErrors } from '../ValidationErrors.ts'
import { err, isErr, isOk, ok } from '../helpers/result.ts'

// TODO(Task 11): re-enable for composition-with-validators tests.
// import { string } from '../schema/string.ts'

describe('Result helpers', () => {
    describe('constructors', () => {
        it('ok(value) returns [null, value]', () => {
            expect(ok(42)).toEqual([null, 42])
        })
        it('ok(undefined) returns [null, undefined]', () => {
            expect(ok(undefined)).toEqual([null, undefined])
        })
        it('ok(null) returns [null, null] (valid Result<null>)', () => {
            expect(ok(null)).toEqual([null, null])
        })
        it('err(error) returns [error, null]', () => {
            const e = new Error('boom')
            expect(err(e)).toEqual([e, null])
        })
        it('err(ValidationErrors) returns [ValidationErrors, null]', () => {
            const e = new ValidationErrors([
                new ValidationError({
                    message: 'm',
                    schema: (v: unknown): v is string => typeof v === 'string',
                    value: 'x',
                    name: undefined,
                    parent: undefined,
                    context: undefined as unknown as undefined,
                }),
            ])
            expect(err(e)).toEqual([e, null])
        })
    })

    describe('isOk — happy path', () => {
        it('returns true for [null, value]', () => {
            expect(isOk([null, 7] as Result<number>)).toBe(true)
        })
        it('returns true for [null, null] (TValue = null)', () => {
            expect(isOk([null, null] as Result<null>)).toBe(true)
        })
        it('returns false for [Error, null]', () => {
            expect(isOk([new Error('x'), null] as Result<number>)).toBe(false)
        })
        it('narrows to [null, TValue]', () => {
            const r: Result<number, Error> = ok(7)
            if (isOk(r)) {
                expect(r[1]).toBe(7)
                expect(r[0]).toBeNull()
            } else {
                throw new Error('expected isOk to narrow to success branch')
            }
        })
    })

    describe('isErr — happy path', () => {
        it('returns true for [Error, null]', () => {
            expect(isErr([new Error('x'), null] as Result<number>)).toBe(true)
        })
        it('returns false for [null, value]', () => {
            expect(isErr([null, 7] as Result<number>)).toBe(false)
        })
        it('returns false for [null, null]', () => {
            expect(isErr([null, null] as Result<null>)).toBe(false)
        })
        it('narrows to [TError, null]', () => {
            const e = new TypeError('bad')
            const r: Result<string, TypeError> = err(e)
            if (isErr(r)) {
                expect(r[0]).toBe(e)
                expect(r[1]).toBeNull()
            } else {
                throw new Error('expected isErr to narrow to error branch')
            }
        })
    })

    describe('shape enforcement — structural violations', () => {
        it('isOk throws TypeError for non-array input', () => {
            expect(() => isOk('nope' as unknown as Result<number>)).toThrow(TypeError)
            expect(() => isOk({} as unknown as Result<number>)).toThrow(TypeError)
            expect(() => isOk(null as unknown as Result<number>)).toThrow(TypeError)
            expect(() => isOk(undefined as unknown as Result<number>)).toThrow(TypeError)
        })
        it('isOk throws TypeError for wrong-length arrays', () => {
            expect(() => isOk([] as unknown as Result<number>)).toThrow(TypeError)
            expect(() => isOk([null] as unknown as Result<number>)).toThrow(TypeError)
            expect(() => isOk([null, 1, 2] as unknown as Result<number>)).toThrow(TypeError)
        })
        it('isErr throws TypeError for non-array input', () => {
            expect(() => isErr('nope' as unknown as Result<number>)).toThrow(TypeError)
            expect(() => isErr({} as unknown as Result<number>)).toThrow(TypeError)
            expect(() => isErr(null as unknown as Result<number>)).toThrow(TypeError)
        })
        it('isErr throws TypeError for wrong-length arrays', () => {
            expect(() => isErr([] as unknown as Result<number>)).toThrow(TypeError)
            expect(() => isErr([null] as unknown as Result<number>)).toThrow(TypeError)
            expect(() => isErr([null, 1, 2] as unknown as Result<number>)).toThrow(TypeError)
        })
    })

    describe('shape enforcement — error slot violations', () => {
        it('isOk throws TypeError when error slot is non-null non-Error', () => {
            expect(() => isOk(['string-error' as unknown, 7] as unknown as Result<number>)).toThrow(
                TypeError
            )
            expect(() => isOk([42 as unknown, 7] as unknown as Result<number>)).toThrow(TypeError)
            expect(() => isOk([{} as unknown, 7] as unknown as Result<number>)).toThrow(TypeError)
        })
        it('isErr throws TypeError when error slot is non-null non-Error', () => {
            expect(() =>
                isErr(['string-error' as unknown, null] as unknown as Result<number>)
            ).toThrow(TypeError)
            expect(() => isErr([42 as unknown, null] as unknown as Result<number>)).toThrow(
                TypeError
            )
            expect(() => isErr([{} as unknown, null] as unknown as Result<number>)).toThrow(
                TypeError
            )
        })
    })

    describe('shape enforcement — mutual exclusivity violations', () => {
        it('isOk throws TypeError when both error and value slots are populated', () => {
            expect(() => isOk([new Error('x'), 7] as unknown as Result<number>)).toThrow(TypeError)
        })
        it('isErr throws TypeError when both error and value slots are populated', () => {
            expect(() => isErr([new Error('x'), 7] as unknown as Result<number>)).toThrow(TypeError)
        })
    })
})

// TODO(Task 11): composition-with-validators tests will land after Task 6
// (validator refactor) produces Result-returning no-throw branches.
