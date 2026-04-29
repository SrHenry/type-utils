import type { TypeGuard, ConstructorSignature, MessageFormator } from '../TypeGuards/types/index.ts'
import type { V3 } from '../validators/schema/types/index.ts'
import type { Sanitize, ValidatorMap } from '../validators/types/index.ts'
import type { StandardSchemaV1 } from '../validators/standard-schema/types.ts'
import type { All as AllRules, Custom as CustomRule, RuleStruct } from '../validators/rules/types/index.ts'
import type { GetPipeline } from '../helpers/Experimental/pipeline/types/GetPipeline.ts'

type FluentSchemaLike<T> = TypeGuard<T> & {
  optional(): TypeGuard<undefined | T> & Record<string, any>
  validator(...args: any[]): any
  use(...rules: any[]): any
  toStandardSchema(): StandardSchemaV1<T, T>
} & Record<string, any>

export type MetadataStoreService = {
  define(key: string | symbol, value: unknown, target: object): void
  get(key: string | symbol, target: object): unknown
  has(key: string | symbol, target: object): boolean
}

export type MetadataService$Service = {
  set<U>(key: string | symbol, metadata: unknown, into: U): U
  set(key: string | symbol, metadata: unknown): <U>(into: U) => U
  set(key: string | symbol): { <U>(metadata: unknown, into: U): U; <U>(metadata: unknown): (into: U) => U }
  get<T extends string | symbol, U>(key: T, from: U): any | undefined
  get<T extends string | symbol, U, V extends TypeGuard>(key: T, from: U, schema: V): GetTypeGuard<V> | undefined
  get<T extends string | symbol>(key: T): { <U>(from: U): any | undefined; <U, V extends TypeGuard>(from: U, schema: V): any | undefined }
  has<K extends string | symbol, T>(key: K, from: T): boolean
  has<K extends string | symbol>(key: K): <T>(from: T) => boolean
}

export type GetTypeGuard<V> = V extends TypeGuard<infer U> ? U : never

export type TypeGuardTagService$ = {
  asTypeGuard<T>(predicate: (value: any) => boolean): TypeGuard<T>
  asTypeGuard<T>(predicate: (value: any) => boolean, metadata: Omit<V3.CustomStruct<T>, 'type' | 'schema' | 'optional' | 'rules'> & Partial<Pick<V3.CustomStruct<T>, 'rules'>>): TypeGuard<T>
  setAsTypeGuard<T>(value: TypeGuard<T> | ((value: T) => boolean)): TypeGuard<T>
  isTypeGuard<T = any>(value: unknown): value is TypeGuard<T>
  hasTypeGuardMetadata(value: unknown): boolean
}

export type MessageService$ = {
  getMessage<T>(arg: T): string
  hasMessage(value: unknown): boolean
  setMessage(message: string): <T extends Object>(into: T) => T
  setMessage<T extends Object>(message: string, into: T): T
  getMessageFormator<T>(arg: T): (...args: any[]) => string
  setMessageFormator<T>(formator: (...args: any[]) => string, arg: T): T
}

export type ValidatorMessageService$ = {
  getValidatorMessage(from: unknown): string | undefined
  getValidatorMessage<T>(from: unknown, defaultValue: T): string | T
  setValidatorMessage<T>(message: string, arg: T): T
  hasValidatorMessage(value: unknown): boolean
  setValidatorMessageFormator<T, MF extends MessageFormator>(messageFormator: MF, arg: T): T
  setValidatorMessageFormator<T>(messageFormator: MessageFormator, arg: T): T
  hasValidatorMessageFormator(value: unknown): boolean
}

export type EnsureInterfaceService$ = {
  <Interface, Instance = unknown>(value: Instance, validator: TypeGuard<Interface>): Interface
  <Interface>(validator: TypeGuard<Interface>): <Instance = unknown>(value: Instance) => Interface
  <Interface, Instance = unknown>(value: Instance, validator: StandardSchemaV1<Interface>): Interface
  <Interface>(validator: StandardSchemaV1<Interface>): <Instance = unknown>(value: Instance) => Interface
}

export type EnsureInstanceOfService$ = {
  <Instance, Constructor extends ConstructorSignature>(value: Instance, type: Constructor): InstanceType<Constructor>
  <Constructor extends ConstructorSignature>(type: Constructor): <Instance>(value: Instance) => InstanceType<Constructor>
}

export type IsInstanceOfService$ = {
  <Instance, Constructor extends ConstructorSignature>(value: Instance, type: Constructor): value is InstanceType<Constructor>
  <Constructor extends ConstructorSignature>(type: Constructor): <Instance>(value: Instance) => value is InstanceType<Constructor>
}

export type IsService$ = {
  <Interface>(value: unknown, validator: TypeGuard<Interface>): value is Interface
  <Interface>(value: unknown, validator: (value: unknown) => boolean): value is Interface
  <Interface>(value: unknown, validator: StandardSchemaV1<Interface>): value is Interface
}

export type TypeGuardErrorService$ = new <T = unknown, U = unknown>(
  message: string, checked: T, against?: U, cause?: Error['cause']
) => Error & { checked: T; against: U | undefined; toJSON(): Record<string, unknown> }

export type ThrowHelper$ = <T>(e: T) => never

export type AutoBindDecorator$ = () => (_: any, _2: string | symbol, descriptor: PropertyDescriptor) => PropertyDescriptor

export type PipelineHelpers$ = {
  pipe<RValue>(arg: RValue): GetPipeline<RValue>
  join(separator: string): (array: any[]) => string
  join(separator: string, array: any[]): string
  map<T, U>(fn: (...args: [T] | [T, number] | [T, number, T[]]) => U): (array: T[]) => U[]
  map<T, U>(fn: (...args: [T] | [T, number] | [T, number, T[]]) => U, array: T[]): U[]
}

export type StructMetadataService$ = {
  setStructMetadata<T>(struct: V3.GenericStruct<T, false>, guard: TypeGuard<T>): TypeGuard<T>
  setStructMetadata<T>(struct: V3.CustomStruct<T>, guard: TypeGuard<T>): TypeGuard<T>
  setStructMetadata<TStruct extends V3.ClassInstanceStruct<any>, T = V3.FromClassInstanceStruct<TStruct>>(struct: TStruct, guard: TypeGuard<T>): TypeGuard<T>
  setStructMetadata<T>(struct: any, guard: TypeGuard<T>): TypeGuard<T>
  getStructMetadata<T>(guard: TypeGuard<T>): V3.GenericStruct<T> | V3.AnyStruct | V3.CustomStruct<T>
  getStructMetadata(guard: unknown): V3.AnyStruct
  hasStructMetadata(guard: TypeGuard): boolean
  setCustomStructMetadata<T>(struct: V3.CustomStruct<T>, guard: TypeGuard<T>): TypeGuard<T>
  updateStructMetadata<T>(target: TypeGuard<T>, update: Partial<V3.GenericStruct<T>>): any
  copyStructMetadata<T, Target>(source: TypeGuard<T>, target: Target): Target
  copyStructMetadata<Target>(source: TypeGuard<any>, target: Target, update: Partial<V3.AnyStruct>): Target
  getRuleStructMetadata<Rule extends AllRules<any[], string, any>>(rule: Rule): RuleStruct<Rule>
  getRuleStructMetadata(rule: CustomRule): RuleStruct<CustomRule>
  isRuleStruct(struct: unknown): struct is RuleStruct<AllRules>
}

export type StandardSchemaAdapter$ = {
  isStandardSchema(value: unknown): value is StandardSchemaV1
  fromStandardSchema<Input, Output = Input>(schema: StandardSchemaV1<Input, Output>): TypeGuard<Input>
  normalizeSchema<T>(schema: TypeGuard<T> | StandardSchemaV1<T, T>): TypeGuard<T>
  attachStandardSchema<T>(guard: TypeGuard<T>): void
  toStandardSchema<T>(guard: TypeGuard<T>): StandardSchemaV1<T, T>
}

export type SchemaFactory$ = {
  and<T1, T2>(guard1: TypeGuard<T1> | StandardSchemaV1<T1, T1>, guard2: TypeGuard<T2> | StandardSchemaV1<T2, T2>): FluentSchemaLike<T1 & T2>
  or<T1, T2>(guard1: TypeGuard<T1> | StandardSchemaV1<T1, T1>, guard2: TypeGuard<T2> | StandardSchemaV1<T2, T2>): FluentSchemaLike<T1 | T2>
  array(): FluentSchemaLike<any[]>
  array<T>(schema: TypeGuard<T> | StandardSchemaV1<T, T>): FluentSchemaLike<T[]>
  object<T extends {}>(tree: ValidatorMap<T>): FluentSchemaLike<Sanitize<T>>
  object(): FluentSchemaLike<Record<any, any>>
  number(): FluentSchemaLike<number>
  string(): FluentSchemaLike<string>
  string(matches: RegExp): FluentSchemaLike<string>
  symbol(): FluentSchemaLike<symbol>
  tuple<T extends readonly (TypeGuard<any> | StandardSchemaV1<any, any>)[]>(schemas: T): FluentSchemaLike<V3.TypeGuardTupleUnwrap<T>>
  record(): FluentSchemaLike<Record<string, any>>
  record<K extends string | number | symbol, V>(keySchema: TypeGuard<K> | StandardSchemaV1<K, K>, valueSchema: TypeGuard<V> | StandardSchemaV1<V, V>): FluentSchemaLike<Record<K, V>>
}
