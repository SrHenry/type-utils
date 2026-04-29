import type { Container, Factory, Lifetime, Registration, ServiceToken } from './types.ts'
import { Lifetime as LT } from './types.ts'

class CircularDependencyError extends Error {
  constructor(tokenName: string, chain: string[]) {
    super(
      `Circular dependency detected while resolving "${tokenName}". Chain: ${chain.join(' -> ')} -> ${tokenName}`
    )
    this.name = 'CircularDependencyError'
  }
}

class TokenNotRegisteredError extends Error {
  constructor(tokenName: string) {
    super(`No registration found for service token "${tokenName}"`)
    this.name = 'TokenNotRegisteredError'
  }
}

type InternalRegistration = Registration<unknown> & {
  instance: unknown
  resolved: boolean
  resolving: boolean
}

class ContainerImpl implements Container {
  private readonly _registrations = new Map<ServiceToken<unknown>, InternalRegistration>()
  public readonly parent: Container | null
  private _version = 0

  public get version(): number {
    return this._version
  }

  constructor(parent: Container | null = null) {
    this.parent = parent
  }

  register<T>(token: ServiceToken<T>, factory: Factory<T>, lifetime: Lifetime = LT.Singleton): void {
    this._registrations.set(token, {
      token,
      factory: factory as Factory<unknown>,
      lifetime,
      instance: undefined,
      resolved: false,
      resolving: false,
    })
  }

  resolve<T>(token: ServiceToken<T>): T {
    const reg = this._registrations.get(token)

    if (reg) {
      if (reg.resolving) throw new CircularDependencyError(token.name, this._resolutionChain(token))

      switch (reg.lifetime) {
        case LT.Singleton:
          if (reg.resolved) return reg.instance as T
          reg.resolving = true
          reg.instance = reg.factory(this)
          reg.resolved = true
          reg.resolving = false
          return reg.instance as T

        case LT.Transient:
          return reg.factory(this) as T

        case LT.Scoped:
          if (reg.resolved) return reg.instance as T
          reg.resolving = true
          reg.instance = reg.factory(this)
          reg.resolved = true
          reg.resolving = false
          return reg.instance as T
      }
    }

    if (this.parent) {
      const parentReg = this._findParentRegistration(token)
      if (parentReg && parentReg.lifetime === LT.Scoped) {
        this._registrations.set(token, {
          token,
          factory: parentReg.factory,
          lifetime: LT.Scoped,
          instance: undefined,
          resolved: false,
          resolving: false,
        })
        return this.resolve(token)
      }
      return this.parent.resolve(token)
    }

    throw new TokenNotRegisteredError(token.name)
  }

  override<T>(token: ServiceToken<T>, factory: Factory<T>): Disposable {
    const existing = this._registrations.get(token)

    const overrideReg: InternalRegistration = {
      token,
      factory: factory as Factory<unknown>,
      lifetime: existing?.lifetime ?? LT.Singleton,
      instance: undefined,
      resolved: false,
      resolving: false,
    }

    this._registrations.set(token, overrideReg)
    this._version++

    const self = this
    const saved = existing

    return {
      [Symbol.dispose]() {
        if (saved) {
          self._registrations.set(token, saved)
        } else {
          self._registrations.delete(token)
        }
        self._version++
      },
    }
  }

  createScope(): Container {
    return new ContainerImpl(this)
  }

  private _resolutionChain(_token: ServiceToken<unknown>): string[] {
    const chain: string[] = []

    for (const [, reg] of this._registrations) {
      if (reg.resolving) chain.push(reg.token.name)
    }

    return chain
  }

  private _findParentRegistration(token: ServiceToken<unknown>): InternalRegistration | null {
    let current: ContainerImpl | null = this.parent as ContainerImpl | null
    while (current) {
      const reg = current._registrations.get(token)
      if (reg) return reg
      current = current.parent as ContainerImpl | null
    }
    return null
  }
}

export function createContainer(parent?: Container): Container {
  return new ContainerImpl(parent ?? null)
}

export { CircularDependencyError, TokenNotRegisteredError }
