export const enum Lifetime {
  Singleton = 0,
  Transient = 1,
  Scoped = 2,
}

export interface ServiceToken<T> {
  readonly __service: unique symbol
  readonly __type: T
  readonly name: string
}

export interface Registration<T> {
  readonly token: ServiceToken<T>
  readonly factory: Factory<T>
  readonly lifetime: Lifetime
}

export type Factory<T> = (container: Container) => T

export interface Container {
  register<T>(token: ServiceToken<T>, factory: Factory<T>, lifetime?: Lifetime): void
  resolve<T>(token: ServiceToken<T>): T
  override<T>(token: ServiceToken<T>, factory: Factory<T>): Disposable
  createScope(): Container
  readonly parent: Container | null
  readonly version: number
}

export interface Module {
  register(container: Container): void
}
