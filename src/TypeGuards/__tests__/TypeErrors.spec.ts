import { TypeGuardError } from '../TypeErrors.ts'

test.skip('TypeGuardError', () => {
    it('should throw a TypeGuardError', () => {
        expect(() => {
            throw new TypeGuardError('', undefined)
        }).toThrow(TypeGuardError)
    })
})
