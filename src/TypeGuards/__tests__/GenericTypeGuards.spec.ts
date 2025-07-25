import { ensureInstanceOf } from '../helpers/ensureInstanceOf'
import { ensureInterface } from '../helpers/ensureInterface'
import { getMessage } from '../helpers/getMessage'
import { getMetadata } from '../helpers/getMetadata'
import { hasMessage } from '../helpers/hasMessage'
import { hasMetadata } from '../helpers/hasMetadata'
import { is } from '../helpers/is'
import { isInstanceOf } from '../helpers/isInstanceOf'
import { isTypeGuard } from '../helpers/isTypeGuard'
import { setMessage } from '../helpers/setMessage'
import { setMetadata } from '../helpers/setMetadata'

import { TypeGuardError } from '../TypeErrors'

describe('isInstanceOf', () => {
    class A {
        public foo = 1
    }
    class B extends A {
        public bar = 2
    }
    class C extends B {
        public baz = 3
    }

    it('should return true for instances of the given class', () => {
        expect(isInstanceOf(new A(), A)).toBe(true)
        expect(isInstanceOf(new B(), B)).toBe(true)
        expect(isInstanceOf(new C(), C)).toBe(true)
        expect(isInstanceOf(new B(), A)).toBe(true)
        expect(isInstanceOf(new C(), A)).toBe(true)
        expect(isInstanceOf(new C(), B)).toBe(true)
    })

    it('should return false for instances of the given class', () => {
        expect(isInstanceOf(new A(), B)).toBe(false)
        expect(isInstanceOf(new A(), C)).toBe(false)
        expect(isInstanceOf(new B(), C)).toBe(false)
    })

    it('should return a "inverse curried" function with the last argument bound', () => {
        const isA = isInstanceOf(A)
        const isB = isInstanceOf(B)
        const isC = isInstanceOf(C)

        expect(typeof isA).toBe('function')
        expect(typeof isB).toBe('function')
        expect(typeof isC).toBe('function')

        expect(isA(new A())).toBe(true)
        expect(isB(new B())).toBe(true)
        expect(isC(new C())).toBe(true)
        expect(isA(new B())).toBe(true)
        expect(isA(new C())).toBe(true)
        expect(isB(new C())).toBe(true)

        expect(isB(new A())).toBe(false)
        expect(isC(new A())).toBe(false)
        expect(isC(new B())).toBe(false)
    })
})

describe('ensureInterface', () => {
    const isString = (value: unknown): value is string => typeof value === 'string'
    const isArray = (value: unknown): value is unknown[] => Array.isArray(value)
    const isBar = (value: unknown): value is { foo: 'bar' } =>
        typeof value === 'object' && value !== null && 'foo' in value && value.foo === 'bar'
    const alwaysFalse = (_: unknown): _ is any => false

    it('should throw a `TypeGuardError` for the given tests', () => {
        expect(() => ensureInterface(1, isString)).toThrow(TypeGuardError)
        expect(() => ensureInterface({ foo: 'bar' }, alwaysFalse)).toThrow(TypeGuardError)
    })

    it('should return the given value for the given tests', () => {
        const foo = 'foo'
        const bar = { foo: 'bar' }
        const baz = [1, 2, 3]

        expect(() => ensureInterface(foo, isString)).not.toThrow()
        expect(ensureInterface(foo, isString)).toBe(foo)
        expect(() => ensureInterface(bar, isBar)).not.toThrow()
        expect(ensureInterface(bar, isBar)).toBe(bar)
        expect(() => ensureInterface(baz, isArray)).not.toThrow()
        expect(ensureInterface(baz, isArray)).toBe(baz)
    })

    it('should return a "inverse curried" function with the last argument bound', () => {
        const ensureString = ensureInterface(isString)
        const ensureArray = ensureInterface(isArray)
        const ensureBar = ensureInterface(isBar)

        expect(typeof ensureString).toBe('function')
        expect(typeof ensureArray).toBe('function')
        expect(typeof ensureBar).toBe('function')

        expect(() => ensureString('foo')).not.toThrow()
        expect(ensureString('foo')).toBe('foo')
        expect(() => ensureBar({ foo: 'bar' })).not.toThrow()
        expect(ensureBar({ foo: 'bar' })).toEqual({ foo: 'bar' })
        expect(() => ensureArray([1, 2, 3])).not.toThrow()
        expect(ensureArray([1, 2, 3])).toEqual([1, 2, 3])

        expect(() => ensureString(1)).toThrow(TypeGuardError)
        expect(() => ensureBar({ foo: 'baz' })).toThrow(TypeGuardError)
        expect(() => ensureArray('foo')).toThrow(TypeGuardError)
    })
})

describe('is', () => {
    it('should run the callback given (type guard/predicate) and return the result', () => {
        expect(is<string>('foo', v => typeof v === 'string')).toBe(true)
        expect(is<string>(1, v => typeof v === 'string')).toBe(false)
    })
})

describe('ensureInstanceOf', () => {
    class A {}
    class B extends A {}
    class C extends B {}
    class Foo {}
    class Bar extends C {}

    const a = new A()
    const b = new B()
    const c = new C()
    const foo = new Foo()
    const bar = new Bar()

    it('should throw a `TypeGuardError` for the given tests', () => {
        expect(() => ensureInstanceOf(1, String)).toThrow(TypeGuardError)
        expect(() => ensureInstanceOf(1, Number)).toThrow(TypeGuardError)
        expect(() => ensureInstanceOf('foo', Number)).toThrow(TypeGuardError)
        expect(() => ensureInstanceOf('foo', String)).toThrow(TypeGuardError)

        expect(() => ensureInstanceOf(a, B)).toThrow(TypeGuardError)
        expect(() => ensureInstanceOf(b, C)).toThrow(TypeGuardError)
        expect(() => ensureInstanceOf(a, C)).toThrow(TypeGuardError)

        expect(() => ensureInstanceOf(foo, Bar)).toThrow(TypeGuardError)
        expect(() => ensureInstanceOf(bar, Foo)).toThrow(TypeGuardError)
        expect(() => ensureInstanceOf(c, Bar)).toThrow(TypeGuardError)
    })
    it('should return the given value for the given tests', () => {
        expect(() => ensureInstanceOf(a, A)).not.toThrow()
        expect(() => ensureInstanceOf(b, B)).not.toThrow()
        expect(() => ensureInstanceOf(c, C)).not.toThrow()
        expect(() => ensureInstanceOf(foo, Foo)).not.toThrow()
        expect(() => ensureInstanceOf(bar, Bar)).not.toThrow()

        expect(ensureInstanceOf(a, A)).toBe(a)
        expect(ensureInstanceOf(b, B)).toBe(b)
        expect(ensureInstanceOf(c, C)).toBe(c)
        expect(ensureInstanceOf(foo, Foo)).toBe(foo)
        expect(ensureInstanceOf(bar, Bar)).toBe(bar)

        expect(() => ensureInstanceOf(c, B)).not.toThrow()
        expect(() => ensureInstanceOf(b, A)).not.toThrow()
        expect(() => ensureInstanceOf(c, A)).not.toThrow()
        expect(() => ensureInstanceOf(bar, C)).not.toThrow()

        expect(ensureInstanceOf(b, A)).toBe(b)
        expect(ensureInstanceOf(c, B)).toBe(c)
        expect(ensureInstanceOf(c, A)).toBe(c)
        expect(ensureInstanceOf(bar, C)).toBe(bar)
    })
    it('should return a "inverse curried" function with the last argument bound', () => {
        const ensureA = ensureInstanceOf(A)
        const ensureB = ensureInstanceOf(B)
        const ensureC = ensureInstanceOf(C)
        const ensureFoo = ensureInstanceOf(Foo)
        const ensureBar = ensureInstanceOf(Bar)

        expect(typeof ensureA).toBe('function')
        expect(typeof ensureB).toBe('function')
        expect(typeof ensureC).toBe('function')
        expect(typeof ensureFoo).toBe('function')
        expect(typeof ensureBar).toBe('function')

        expect(() => ensureA(a)).not.toThrow()
        expect(() => ensureB(b)).not.toThrow()
        expect(() => ensureC(c)).not.toThrow()
        expect(() => ensureFoo(foo)).not.toThrow()
        expect(() => ensureBar(bar)).not.toThrow()

        expect(ensureA(a)).toBe(a)
        expect(ensureB(b)).toBe(b)
        expect(ensureC(c)).toBe(c)
        expect(ensureFoo(foo)).toBe(foo)
        expect(ensureBar(bar)).toBe(bar)
    })
})

describe('metadata manipulation functions', () => {
    const key = Symbol('design:metadata')
    const key2 = Symbol('design:other-metadata')
    const foo = { bar: 'baz' }
    const bar = { baz: 'foo' }
    const metadata = { hidden: true }
    const otherMetadata = { foo: 'bar' }

    it('should set metadata', () => {
        // const set = () => expect(setMetadata(key, metadata, foo)).toBe(foo)

        // expect(set).not.toThrow()
        // expect(() => setMetadata(key, metadata, foo)).not.toThrow()
        expect(() => expect(setMetadata(key, metadata, foo)).toBe(foo)).not.toThrow()
    })

    it('should check if metadata exists', () => {
        expect(() => expect(hasMetadata(key, foo)).toBe(true)).not.toThrow()
        expect(() => expect(hasMetadata(key, {})).toBe(false)).not.toThrow()
    })

    it('should get metadata', () => {
        expect(() => expect(getMetadata(key, foo)).toEqual(metadata)).not.toThrow()
        expect(() => expect(getMetadata(key, {})).toBeUndefined()).not.toThrow()
    })

    it('should set, check and get metadata by curried function', () => {
        const set = setMetadata(key)
        const has = hasMetadata(key)
        const get = getMetadata(key)

        expect(typeof set).toBe('function')
        expect(typeof has).toBe('function')
        expect(typeof get).toBe('function')

        const setCustom = setMetadata(key2)(otherMetadata)
        const hasCustom = hasMetadata(key2)
        const getCustom = getMetadata(key2)

        expect(typeof setCustom).toBe('function')
        expect(typeof hasCustom).toBe('function')
        expect(typeof getCustom).toBe('function')

        expect(() => expect(set(metadata, foo)).toBe(foo)).not.toThrow()
        expect(() => expect(has(foo)).toBe(true)).not.toThrow()
        expect(() => expect(hasCustom(foo)).toBe(false)).not.toThrow()
        expect(() => expect(get(foo)).toEqual(metadata)).not.toThrow()
        expect(() => expect(getCustom(foo)).toBeUndefined()).not.toThrow()

        expect(() => expect(setCustom(bar)).toBe(bar)).not.toThrow()
        expect(() => expect(hasCustom(bar)).toBe(true)).not.toThrow()
        expect(() => expect(has(bar)).toBe(false)).not.toThrow()
        expect(() => expect(getCustom(bar)).toEqual(otherMetadata)).not.toThrow()
        expect(() => expect(get(bar)).toBeUndefined()).not.toThrow()
    })
})

describe('internal manipulation functions for building error messages as metadata', () => {
    const foo = { bar: 'baz' }
    const marco = { polo: 'foo' }
    const message = 'Luke! I am your father!'

    it('should set the error message as metadata', () => {
        expect(() => expect(setMessage(message, foo)).toBe(foo)).not.toThrow()
        expect(() => expect(setMessage(message, marco)).toBe(marco)).not.toThrow()
    })
    it('should check if error message exists as metadata', () => {
        expect(() => expect(hasMessage(foo)).toBe(true)).not.toThrow()
        expect(() => expect(hasMessage(marco)).toBe(true)).not.toThrow()
        expect(() => expect(hasMessage({})).toBe(false)).not.toThrow()
    })
    it('should get the error message as metadata', () => {
        expect(() => expect(getMessage(foo)).toBe(message)).not.toThrow()
        expect(() => expect(getMessage(marco)).toBe(message)).not.toThrow()
    })
    it('should set, check and get the error message as metadata by curried function', () => {
        const set = setMessage(message)

        expect(typeof set).toBe('function')

        expect(() => expect(set(foo)).toBe(foo)).not.toThrow()
        expect(() => expect(hasMessage(foo)).toBe(true)).not.toThrow()
        expect(() => expect(hasMessage({})).toBe(false)).not.toThrow()
        expect(() => expect(getMessage(foo)).toBe(message)).not.toThrow()
        expect(() => expect(getMessage({})).toBe('')).not.toThrow()
    })
})

describe('isTypeGuard', () => {
    class A {}
    class B extends A {}
    class C extends B {}

    class Foo {}

    class Bar extends Foo {}

    const isA = (value: any): value is A => value instanceof A
    const isB = (value: any): value is B => value instanceof B
    const isC = (value: any): value is C => value instanceof C
    const isFoo = (value: any): value is Foo => value instanceof Foo
    const isBar = (value: any): value is Bar => value instanceof Bar

    it('should return true if the given function is a type guard', () => {
        expect(isTypeGuard(isA)).toBe(true)
        expect(isTypeGuard(isB)).toBe(true)
        expect(isTypeGuard(isC)).toBe(true)
        expect(isTypeGuard(isFoo)).toBe(true)
        expect(isTypeGuard(isBar)).toBe(true)
    })
    it('should return false if the given function is not a type guard', () => {
        expect(isTypeGuard(() => {})).toBe(false)
        expect(isTypeGuard(() => null)).toBe(false)
        expect(isTypeGuard(() => undefined)).toBe(false)
        expect(isTypeGuard(() => 1)).toBe(false)
        expect(isTypeGuard(() => 'foo')).toBe(false)
        expect(isTypeGuard(() => Symbol('foo'))).toBe(false)
        expect(isTypeGuard(() => [])).toBe(false)
        expect(isTypeGuard(() => {})).toBe(false)
        expect(isTypeGuard(() => new Date())).toBe(false)
        expect(isTypeGuard(() => new Error())).toBe(false)
        expect(isTypeGuard(() => new RegExp('foo'))).toBe(false)
        expect(isTypeGuard(() => new Set())).toBe(false)
        expect(isTypeGuard(() => new Map())).toBe(false)
        expect(isTypeGuard(() => new WeakSet())).toBe(false)
        expect(isTypeGuard(() => new WeakMap())).toBe(false)
        expect(isTypeGuard(() => new ArrayBuffer(1))).toBe(false)
        expect(isTypeGuard(() => new SharedArrayBuffer(1))).toBe(false)
        expect(isTypeGuard(() => new Int8Array(1))).toBe(false)
        expect(isTypeGuard(() => new Uint8Array(1))).toBe(false)
        expect(isTypeGuard(() => new Uint8ClampedArray(1))).toBe(false)
        expect(isTypeGuard(() => new Int16Array(1))).toBe(false)
        expect(isTypeGuard(() => new Uint16Array(1))).toBe(false)
        expect(isTypeGuard(() => new Int32Array(1))).toBe(false)
        expect(isTypeGuard(() => new Uint32Array(1))).toBe(false)
        expect(isTypeGuard(() => new Float32Array(1))).toBe(false)
    })
})
