import { createContainer, createToken, Lifetime, CircularDependencyError, TokenNotRegisteredError } from '../index.ts'

describe('ServiceToken', () => {
  test('createToken produces unique tokens', () => {
    const t1 = createToken<number>('num')
    const t2 = createToken<number>('num')
    expect(t1).not.toBe(t2)
    expect(t1.name).not.toBe(t2.name)
  })

  test('createToken includes name in token name', () => {
    const t = createToken<string>('MyService')
    expect(t.name).toContain('MyService')
  })
})

describe('Container - singleton', () => {
  test('resolve returns instance from factory', () => {
    const c = createContainer()
    const token = createToken<number>('val')
    c.register(token, () => 42)
    expect(c.resolve(token)).toBe(42)
  })

  test('singleton factory is called only once', () => {
    const c = createContainer()
    const token = createToken<object>('obj')
    let calls = 0
    c.register(token, () => { calls++; return {} }, Lifetime.Singleton)
    const a = c.resolve(token)
    const b = c.resolve(token)
    expect(a).toBe(b)
    expect(calls).toBe(1)
  })
})

describe('Container - transient', () => {
  test('transient factory is called every time', () => {
    const c = createContainer()
    const token = createToken<object>('obj')
    let calls = 0
    c.register(token, () => { calls++; return { n: calls } }, Lifetime.Transient)
    const a = c.resolve(token)
    const b = c.resolve(token)
    expect(a).not.toBe(b)
    expect(calls).toBe(2)
  })
})

describe('Container - scoped', () => {
  test('scoped creates one instance per scope', () => {
    const root = createContainer()
    const token = createToken<object>('obj')
    let calls = 0
    root.register(token, () => { calls++; return { id: calls } }, Lifetime.Scoped)

    const scope1 = root.createScope()
    const scope2 = root.createScope()

    const a1 = scope1.resolve(token)
    const a2 = scope1.resolve(token)
    expect(a1).toBe(a2)

    const b1 = scope2.resolve(token)
    expect(b1).not.toBe(a1)

    expect(calls).toBe(2)
  })

  test('scoped inherits from parent when not overridden in scope', () => {
    const root = createContainer()
    const token = createToken<number>('num')
    root.register(token, () => 100, Lifetime.Scoped)

    const scope = root.createScope()
    expect(scope.resolve(token)).toBe(100)
  })
})

describe('Container - dependencies', () => {
  test('factory receives container and can resolve dependencies', () => {
    const c = createContainer()
    const numToken = createToken<number>('num')
    const strToken = createToken<string>('str')

    c.register(numToken, () => 10)
    c.register(strToken, (ctr) => `value:${ctr.resolve(numToken)}`)

    expect(c.resolve(strToken)).toBe('value:10')
  })
})

describe('Container - errors', () => {
  test('resolve throws TokenNotRegisteredError for unknown token', () => {
    const c = createContainer()
    const token = createToken<number>('unknown')
    expect(() => c.resolve(token)).toThrow(TokenNotRegisteredError)
  })

  test('resolve throws CircularDependencyError on cycle', () => {
    const c = createContainer()
    const a = createToken<number>('A')
    const b = createToken<number>('B')

    c.register(a, (ctr) => ctr.resolve(b))
    c.register(b, (ctr) => ctr.resolve(a))

    expect(() => c.resolve(a)).toThrow(CircularDependencyError)
  })
})

describe('Container - override', () => {
  test('override replaces registration and restores on dispose', () => {
    const c = createContainer()
    const token = createToken<number>('num')

    c.register(token, () => 1)
    expect(c.resolve(token)).toBe(1)

    {
      using _disp = c.override(token, () => 2)
      expect(c.resolve(token)).toBe(2)
    }

    expect(c.resolve(token)).toBe(1)
  })

  test('override of unregistered token removes on dispose', () => {
    const c = createContainer()
    const token = createToken<number>('num')

    {
      using _disp = c.override(token, () => 99)
      expect(c.resolve(token)).toBe(99)
    }

    expect(() => c.resolve(token)).toThrow(TokenNotRegisteredError)
  })
})

describe('Container - scopes', () => {
  test('child scope resolves parent registrations', () => {
    const parent = createContainer()
    const token = createToken<number>('num')
    parent.register(token, () => 42)

    const child = parent.createScope()
    expect(child.resolve(token)).toBe(42)
  })

  test('child scope can override parent registration', () => {
    const parent = createContainer()
    const token = createToken<number>('num')
    parent.register(token, () => 42)

    const child = parent.createScope()
    using _disp = child.override(token, () => 99)
    expect(child.resolve(token)).toBe(99)
    expect(parent.resolve(token)).toBe(42)
  })

  test('parent is null on root container', () => {
    const c = createContainer()
    expect(c.parent).toBeNull()
  })

  test('parent is set on child scope', () => {
    const parent = createContainer()
    const child = parent.createScope()
    expect(child.parent).toBe(parent)
  })
})

describe('Container - lifetime mixing', () => {
  test('singleton in parent is shared across child scopes', () => {
    const parent = createContainer()
    const token = createToken<object>('shared')
    let calls = 0
    parent.register(token, () => { calls++; return {} }, Lifetime.Singleton)

    const child1 = parent.createScope()
    const child2 = parent.createScope()

    const a = child1.resolve(token)
    const b = child2.resolve(token)
    expect(a).toBe(b)
    expect(calls).toBe(1)
  })
})
