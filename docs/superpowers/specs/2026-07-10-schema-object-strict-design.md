# Design: `schema-object-strict`

**Task ID**: `schema-object-strict` (TASKS.md:59, P2)
**Date**: 2026-07-10
**Status**: Approved (design sections reviewed sequentially)
**Author**: AI harness session

## Summary

Add a strict-mode rule to `object(...)` that rejects objects containing keys not declared in the validator tree. Surfaced as a fluent `.strict()` method on the `ObjectSchema` fluent chain, structurally identical to `.nonEmpty()` on `record()` and `.unique()` on `array()`.

**Acceptance**: `object<T>({...}).strict()` rejects input with extra keys at runtime for both the boolean guard path and the throwing validator path; existing tests still pass; new `object.strict.spec.ts` passes; `yarn build:clean`, `yarn check:fix`, `yarn test`, `yarn circular-dependencies`, and `yarn tsc -p tsconfig.json --noEmit` all green.

## Scope

### In scope
- New rule subtree `src/validators/rules/Object/` (factory, handler, formator, index)
- Registration of `Object.strict` in `src/validators/rules/constants.ts` (`keys` + `bindings`)
- Extension of `Default` union in `src/validators/rules/types/index.ts` to include `ObjectRule`
- Refactor of `src/validators/schema/object.ts` `_fn` to accept a `rules: ObjectRule[]` parameter and thread `isFollowingRules(arg, rules)` into the guard (mirroring `array.ts:81-83`)
- New `.strict()` fluent method on the `object(tree)` factory (mirroring `record.ts:258`)
- Widening of `ObjectSchema.ts`'s `TRules` slot from `{}` to `typeof ObjectRules` so `.strict()` surfaces in the fluent type
- New test file `src/validators/__tests__/object.strict.spec.ts`
- README update under `#### Schema.object` documenting `.strict()`

### Out of scope
- Class-instance strict refinement (`ClassInstanceStruct`)
- Strict semantics for `record()`, `array()`, primitive schemas (no untyped keys; doesn't apply)
- `UnknownKeyError` subclass (decided: reuse `TypeGuardError` shape via existing `ValidationError`)
- Changes to `SchemaValidator.ts`, `validateObject.ts`, `RuleValidator.ts`, `BaseValidator.ts`

## Architecture

`strict` becomes a first-class object rule, structurally identical to how `unique` lives on `array` or `nonEmpty` on `record`. The allowed-key list (`Object.keys(tree ?? {})`) rides as the rule's args — same pattern that `Array.min(n)` uses to carry `n` through `isFollowingRules` and `validateRules`.

The codebase has two parallel rule-dispatch paths, both routed through the single `keys`/`bindings` registry in `rules/constants.ts`:

| Surface | Dispatcher | Used by | Result on failure |
|---|---|---|---|
| Boolean guard (`schema(arg) === false`) | `isFollowingRules` | primitive schemas, `record.ts`, `array.ts`, (new) `object.ts` | returns `false`, short-circuits inline |
| Throwing validator (`.validator().validate(arg)` throws) | `validateRules` → `createRulesValidationGenerator` (`RuleValidator.ts:36-69`) | `validateObject.ts:31-39`, `validateDefault`, `validateUnion`, `validateIntersection` | pushes a `ValidationError` into the aggregated `ValidationErrors` |

Because `Object.strict` is registered in `keys`/`bindings`, both paths route through the same handler automatically. No changes to `validateObject.ts`, `validateObjectTree`, `RuleValidator.ts`, or `SchemaValidator.ts` are required.

**Multi-error aggregation in throwing path** (confirmed): When an input fails strict AND a per-key value check (e.g. `{ id: 123, extra: 'x' }` against `object({ id: string() }).strict()`), the throwing validator surfaces both errors. `validateObject.ts:30-39` runs `validateRules` to completion, then `validateObjectTree` (lines 90-131) runs the per-key checks; both push to `ctx.errors`. Only the boolean guard path short-circuits on the first failing rule.

## Components

### New: `src/validators/rules/Object/` subtree

Mirrors `rules/Record/` exactly (4 entries: `index.ts`, `factories/`, `formators/`, `handlers/`).

#### `rules/Object/factories/strict.ts`

Follows `Array/factories/min.ts:5` shape:

```ts
import type { RuleFactory } from '../../types/RuleFactory.ts'
import { keys } from '../../constants.ts'

type StrictArgs = [allowedKeys: string[]]

export const strict: RuleFactory<'Object.strict', StrictArgs> = allowedKeys => [
    keys['Object.strict'],
    [allowedKeys],
]
```

`StrictArgs` is the args tuple, picked up via the second type param of `RuleFactory` (same as `Array/factories/unique.ts:5` with `[deepObject: boolean] | []`).

#### `rules/Object/handlers/strict.ts`

The binding-side handler signature is `(arg, ...args) => boolean` — matching the positional-args convention used by every other default rule (e.g. `numberMinHandler(arg, n)`, `arrayUniqueHandler(arg, deepObject)`):

```ts
const handler = (
    arg: Record<keyof any, unknown>,
    allowedKeys: string[]
): boolean =>
    arg === null ||
    typeof arg !== 'object' ||
    Object.keys(arg).every(k => allowedKeys.includes(k))

export { handler as strict }
```

The `arg === null || typeof arg !== 'object'` short-circuit is defensive: by the time the handler runs, `branchIfOptional` has already returned `false` for undefined inputs and the strict rule only fires for defined objects. Non-object subjects let the strict rule return `true` so the shape check (`hasValidProperties`) rejects them rather than strict spuriously failing first — matches `Record/handlers/nonEmpty.ts`'s contract of operating on records only.

#### `rules/Object/formators/strict.ts`

Mirrors `Record/formators/nonEmpty.ts`:

```ts
import type { MessageFormator } from '../../../TypeGuards/types/index.ts'

const formator: MessageFormator = () => 'strict'

export { formator as strictFormator }
```

The thrown error message for a strict failure is `'strict'` (passed to the `ValidationError.message` field). Kept short for consistency with `'Record.nonEmpty'` and `'Array.unique'` defaults.

#### `rules/Object/index.ts`

Aggregator. Unlike `RecordRules`/`ArrayRules`, deliberately omits the `optional` rule — it is plumbed via `optionalizeOverloadFactory(_fn).optionalize<...>()` in `object.ts:97`, NOT via the rules array:

```ts
import { strict } from './factories/strict.ts'

export const ObjectRules = { strict } as const
export { strict }
export type ObjectRule = ReturnType<(typeof ObjectRules)[keyof typeof ObjectRules]>
```

### Modified: `src/validators/rules/constants.ts`

Four additions mirrored on the Record block (lines 36-39, 60, 82):

```ts
// <ObjectRules> import section:
import { strictFormator as objectStrictFormator } from './Object/formators/strict.ts'
import { strict as objectStrictHandler } from './Object/handlers/strict.ts'

// in keys:
'Object.strict': '__Object.strict__',

// in bindings:
[keys['Object.strict']]: setMessageFormator(objectStrictFormator, objectStrictHandler),
```

### Modified: `src/validators/rules/types/index.ts`

Extend `Default` union (line 48) so `isFollowingRules`'s `DefaultRules[]` overload accepts `ObjectRule[]`:

```ts
import type { ObjectRule } from './../Object/index.ts'

export type Default = StringRule | NumberRule | ArrayRule | RecordRule | ObjectRule
```

Without this, `object.ts`'s new `_fn(rules: ObjectRule[], ...)` call fails to compile under TS strict mode.

### Modified: `src/validators/schema/types/GetSchema.ts`

Line 104 currently maps regular specific objects (as opposed to broadly-keyed `Record<K, V>`) to `FluentSchema<Sanitize<T>>` with no `TRules` slot — meaning `.strict()` would NOT be available via `GetSchema<{ id: string }>`. Add an `ObjectSchemaRules` (~= `typeof ObjectRules`, no `Omit` needed since `ObjectRules` doesn't include `optional`) and use it in the specific-object branch:

```ts
import type { ObjectRules } from '../../rules/Object/index.ts'
// ...
type ObjectSchemaRules = typeof ObjectRules   // ObjectRules doesn't include `optional`

// in the GetSchema body, line 104:
                                                  : // Specific object: use Sanitize for
                                                    // optional prop normalization; ObjectSchemaRules
                                                    // exposes .strict() to generic consumers
                                                    FluentSchema<Sanitize<T>, ObjectSchemaRules>
```

Without this, a generic `function check<T extends {}>(v: unknown, schema: GetSchema<T>)` would not see `.strict()` on the returned schema, even though direct `object({id: string()}).strict()` works.

### Modified: `src/validators/schema/types/ObjectSchema.ts`

Widen the `TRules` slot from `{}` (default) to `typeof ObjectRules` so `.strict()` surfaces as a typed fluent method:

```ts
import type { ObjectRules } from '../../rules/Object/index.ts'
import type { FluentSchema } from './FluentSchema.ts'
import type { Sanitize, ValidatorMap } from '../../types/index.ts'

export type ObjectSchema = CallableFunction & {
    <T extends {}>(tree: ValidatorMap<T>): FluentSchema<Sanitize<T>, typeof ObjectRules>
    (): FluentSchema<Record<any, any>, typeof ObjectRules>
    // biome-ignore lint/complexity/noBannedTypes: {} used as wildcard object type for overload
    (tree: {}): FluentSchema<{}, typeof ObjectRules>
}
```

Existing `FluentSchema.ts:16-19`'s `Exclude<keyof TRules, TCalledRules[number]>` machinery removes `.strict()` from the chain once called — same mechanism that removes `.unique()` after `array(...).unique()`. The `TRules` shape must therefore stay compatible with `Record<string, Fn<any[], any>>` (the constraint on `FluentSchema`'s second type param): `ObjectRules = { strict: (...) => [...] }` is fine because the factory return type is an array-like tuple (a function-like callable).

### Modified: `src/validators/schema/object.ts`

Refactor `_fn` to accept a `rules: ObjectRule[]` parameter and thread `isFollowingRules(arg, rules)` into the guard (mirroring `array.ts:81-83`):

```ts
function _fn<T extends {}>(tree: ValidatorMap<T>, rules: ObjectRule[] = []): TypeGuard<Sanitize<T>>
// ... existing overloads get a trailing `rules?: ObjectRule[]` parameter
function _fn<T extends {}>(
    tree?: ValidatorMap<T>,
    rules: ObjectRule[] = []
): TypeGuard<T | Record<any, any> | {}> {
    // ... existing isBlankObject branch unchanged, plus:
    const config = { validators: normalizedTree, required, optional }

    const guard = (arg: unknown): arg is T =>
        branchIfOptional(arg, rules) ||
        (isFollowingRules(arg, rules) && BaseValidator.hasValidProperties(arg, config))

    // ... metadata is unchanged except `rules` field now reflects incoming rules
    //     (instead of always being `[]`)
}
```

Note: the `metadata.rules` field at line 83 currently hard-codes `[]`. It should stay `rules` (the incoming parameter) so `getStructMetadata` reflects any strict rule when it's been applied. The existing overloads need to grow the trailing `rules?: ObjectRule[]` parameter — including the no-tree overloads — so `_object(rules)` / `_object.optional(rules)` calls in `getGuard()` work.

In the IIFE factory at line 99, add a `rules: ObjectRule[]` accumulator and a `schema.strict` callable:

```ts
export const object: ObjectSchema = ((tree?: ValidatorMap<any>) => {
    const customRules: Custom<any[], string, object>[] = []
    const rules: ObjectRule[] = []                                    // NEW
    const callStack: { [key: string]: boolean } = {}

    const getGuard = () => {
        const resolver = callStack['optional'] ? _object.optional : _object
        return tree ? resolver(tree, rules) : resolver(rules)         // passes rules
    }

    // ... schema(arg), addCall — same shape, plus:
    if (fnName !== 'optional') rules.push(...(_rules as ObjectRule[]))  // NEW, mirrors array.ts:168

    schema.optional = () => addCall('optional')                        // existing
    schema.strict = () =>                                              // NEW
        addCall('strict', [ObjectRules.strict(Object.keys(tree ?? {}))])
    schema.validator = (throwOnError = true) => addCall('validator', [], { throwOnError })
    schema.use = (...customRules: Custom<any[], string, object>) => addCall('use', [...customRules])
    schema.toStandardSchema = () => toStandardSchema(schema as unknown as TypeGuard<object>)
    // ...
}) as unknown as ObjectSchema
```

`addCall` gains the `if (fnName !== 'optional') rules.push(...)` line from `array.ts:168`. The boolean `_rules` parameter is already in `addCall`'s signature (line 119: `_rules: unknown[] = []`) — we just need to flow the strict rule tuple through it.

## Data Flow

### Construction

```
user: object({ id: string(), name: string().optional() })
  └─ IIFE in object.ts runs:
       ├─ rules: ObjectRule[] = []                  ← NEW accumulator
       ├─ customRules: Custom[...] = []
       ├─ callStack = {}
       └─ returns copyStructMetadata(getGuard(), schema, {rules: []})
                          ↑ getGuard() returns _object(tree, []) — rules empty
```

### `.strict()` fluent call

```
user: object({ id: string(), ... }).strict()
  └─ schema.strict = () =>
       addCall('strict', [ObjectRules.strict(Object.keys(tree ?? {}))])
       ├─ allowedKeys = Object.keys(tree ?? {})        ← e.g. ['id', 'name']
       ├─ ObjectRules.strict(['id', 'name']) returns:
       │   ['__Object.strict__', [['id', 'name']], handler, formator]
       │   (strict is a *default* rule; no CUSTOM_RULE_BRAND symbol is attached.)
       └─ addCall('strict', [rule]):
            ├─ callStack['strict'] = true               ← guards double .strict()
            ├─ rules.push(rule)                          ← NEW (skipped only for 'optional')
            └─ returns copyStructMetadata(getGuard(), schema, {
                   rules: customRules.map(getRuleStructMetadata<...>),
               })
       Note: getGuard() now re-runs with rules = [strictRule]
       → _object(tree, [strictRule])
       → guard closure captures both config (tree-derived) and rules (strict)
```

### Validation: boolean guard

```
schema({ id: 'abc', extra: 'oops' })
  └─ guard(arg):
       ├─ branchIfOptional(arg, rules) → false         (no 'optional' rule)
       ├─ isFollowingRules(arg, rules):
       │     strictHandler({id:'abc', extra:'oops'}, ['id', 'name'])
       │       └─ Object.keys(arg) = ['id', 'extra']
       │          ['id', 'extra'].every(k => ['id','name'].includes(k))
       │          = true && false = false
       │     → false
       └─ short-circuits; hasValidProperties NOT evaluated
  returns false  ← unknown key rejected
```

```
schema({ id: 'abc' })
  ├─ branchIfOptional → false
  ├─ isFollowingRules → strictHandler({id:'abc'}, ['id','name']) → true
  ├─ hasValidProperties(arg, config)
  │     ├─ required ['id']: string()('abc') → true
  │     └─ optional ['name']: absent → skipped
  └─ returns true
```

### Validation: throwing `.validator().validate(arg)`

```
object({...}).strict().validator().validate({id:'abc', extra:'x', wrong: 1})
  └─ SchemaValidator.validate(arg, schema, true)
       └─ validateObject(ctx, validate, mustNotThrowCtx)  [SchemaValidator.ts:140]
            ├─ isOptionalCheck(metadata, arg) → false
            ├─ isValidObject(arg) → true
            ├─ validateRules(arg, metadata.rules, schema, name, parent)  [line 31]
            │     └─ createRulesValidationGenerator iterates rules[]:
            │         ruleStruct = { type:'default', rule:'__Object.strict__', args:[['id','name']] }
            │         ruleFunction = getRule('__Object.strict__') → bindings entry → strictHandler
            │         passed = strictHandler(arg, ['id','name']) → false
            │         message = strictFormator(['id','name']) → 'strict'
            │         yield ValidationError { message:'strict', value:arg, context:{ rule: ruleStruct } }
            │     → ctx.errors gets one 'strict' error
            └─ validateObjectTree(ctx, metadata, validate, mustNotThrowCtx)  [line 42]
                  ├─ iterates Object.entries(tree) keys (id, name):
                  │   ├─ 'id' present: validate pure string() check
                  │   │   if {id:123}, schema(123) → false → push per-key error
                  │   └─ 'name' absent + optional → skipped
                  └─ unknown keys ('extra', 'wrong') are NOT iterated here
                     (validateObjectTree only walks tree keys; strict detection
                      happens exclusively via the rules[] path in validateRules)
       └─ errors.length > 0 → throw new ValidationErrors(errors)  [line 173]
```

Both strict error AND per-key shape errors show up in the aggregated `ValidationErrors` (no short-circuit in the throwing path).

### Chaining with `.optional()`

```
object({...}).strict().optional()
  ├─ .strict() pushes strict rule into rules[]
  ├─ .optional() sets callStack['optional'] = true
  └─ getGuard() returns _object.optional(rules, tree)
       └─ optionalizeOverloadFactory prepends optional rule to rules
            rules becomes [optionalRule, strictRule]
       └─ branchIfOptional(arg, rules):
            ├─ arg === undefined → returns true → short-circuits → schema returns true
            └─ arg is object → false → continues to isFollowingRules(strict on object)
```

```
object({...}).optional().strict()
  ├─ .optional() sets callStack (no rules mutation)
  ├─ .strict() pushes strict rule
  └─ same getGuard() = _object.optional(rules, tree)
```

Order-independent because `addCall('optional')` only touches `callStack`, never `rules[]` (same trick as `array.ts:166-169`). ✓

### Standard Schema interop

`toStandardSchema(schema)` (line 155) wraps `schema` itself — strict behavior is part of the guard's runtime semantics and is transparent to standard-schema consumers. No change needed. ✓

## Error Handling

### Thrown error shape (strict alone)

```
ValidationErrors {
  errors: [
    ValidationError {
      message: 'strict',
      value: { id:'abc', extra:'oops' },
      schema: <object guard>,
      name: '$',
      parent: <NO_PARENT>,
      context: {
        rule: {
          type: 'default',
          rule: '__Object.strict__',
          args: [['id', 'name']]
        }
      }
    }
  ]
}
```

Identical shape to `Record.nonEmpty`'s thrown error (which yields `message: 'Record.nonEmpty'`). No dedicated `UnknownKeyError` subclass — confirmed decision to reuse `TypeGuardError` plumbing via existing `ValidationError`.

### Multi-error aggregation (confirmed)

Per user direction: **multi-error aggregation is preserved in the throwing validator path; short-circuit applies to the boolean/predicate/guard path only.**

Concretely: `object({ id: string() }).strict().validator().validate({ id: 123, extra: 'x' })` throws a `ValidationErrors` containing two `ValidationError` entries:
1. `{ message: 'strict', context: { rule: <strictRuleStruct> } }` from `validateRules` (rule check)
2. `{ message: 'Invalid value for key id', schema: <string()>, value: 123, context: { ... } }` from `validateObjectTree` (per-key check)

## Edge Cases

| Case | Behavior | Rationale |
|---|---|---|
| Unknown key on strict schema, boolean guard | `false` | Core feature |
| Unknown key on strict schema, throwing validator | `ValidationErrors` with strict error | Core feature |
| Unknown key + invalid value for declared key, throwing validator | Two errors aggregated (strict first, per-key second) | Multi-error confirmed; matches existing throwing-path behavior |
| Same scenario, boolean guard | `false` (short-circuit) | Boolean path stays short-circuit; matches `array.ts:83` ordering |
| Optional key present with wrong type, strict schema | False/throw (per-key validation catches it; strict by itself passes since the key IS allowed) | Optional = key may be absent, value still typed |
| `.strict().optional()` vs `.optional().strict()` | Equivalent | Order-independence per `array.ts:166-169` precedent |
| `undefined` input on strict+optional schema | Passes (boolean `true`, validator returns value) | `branchIfOptional` early return |
| Double `.strict()` | Throws plain `Error('Cannot call strict more than once')` | `callStack` guard at `object.ts:124` — matches `array.ts:142`/`record.ts:226` |
| `object().strict()` (no tree) | Rejects any object with any keys; matches only `{}` | `allowedKeys = []`; `Array.prototype.every` on an empty array returns `true` (vacuous truth), so `Object.keys(arg).every(k => [].includes(k))` is `false` iff `Object.keys(arg)` is non-empty |
| Class-instance input passed to strict object schema | Strict runs against enumerable own keys | Out of scope; documented as not specifically handled |
| Strict on outer object does NOT cascade to nested object schemas | Each `object()` factory call has its own closure-captured `tree`; strict rule is per-instance | Confirmed by design; covered in nested tests |

## Testing

**New file**: `src/validators/__tests__/object.strict.spec.ts` (~20 `it()` blocks, ~250 lines) plus a small compile-time assertion in the existing `src/validators/schema/types/__tests__/GetSchema.spec.ts`.

Test matrix:

```ts
describe('object - strict mode', () => {
  describe('boolean guard', () => {
    it('rejects unknown keys when strict() is chained')
    it('accepts objects whose keys exactly match the tree')
    it('accepts objects missing optional keys when strict() is chained')
    it('rejects unknown keys alongside missing required keys (short-circuits to false)')
    it('passes through undefined when strict + optional are both chained')
    it('order independence: strict().optional() behaves same as optional().strict()')
    it('throws when .strict() is called twice')
    it('preserves strict behavior under toStandardSchema() interop')
  })

  describe('throwing validator', () => {
    it('throws ValidationErrors with a strict error for unknown keys')
    it('aggregates strict + per-key errors when both fail')   // multi-error case
    it('returns the value (no throw) when strict passes')
  })

  describe('wildcard object (no tree)', () => {
    it('rejects any non-empty object when object().strict() is called')  // degenerate
    it('accepts {} when object().strict() is called')
  })

  describe('nested', () => {
    it('strict on outer object does not affect nested object schemas')
    it('strict on nested object rejects unknown keys in the nested value')
  })

  describe('metadata introspection', () => {
    it('records Object.strict rule in struct metadata.rules')
    it('getStructMetadata(schema).rules contains the strict rule struct')
  })
})
```

Style: matches `record.spec.ts` — direct boolean assertions, no test helpers/fixtures. Errors asserted via `expect(() => schema.validator().validate(x)).toThrow(ValidationErrors)` and `toThrowError(/strict/)`.

Plus a compile-time assertion added to `src/validators/schema/types/__tests__/GetSchema.spec.ts` (extending the existing `RecordSchemaRules` assertion pattern at lines 99-104, and the `_recordHasNonEmpty` runtime-style check at line 139):

```ts
import type { ObjectRules } from '../../../rules/Object/index.ts'
// ...

// GetSchema<{ foo: string }> → FluentSchema<Sanitize<{ foo: string }>, ObjectSchemaRules>
// Strict: verify ObjectSchemaRules is present (not {}), ensuring .strict() is available.
// Uses one-directional `Assert<...>` like the existing GSObject at line 121 (not AssertExact —
// FluentSchema's multi-param generic makes exact equality brittle to unrelated changes):
type ObjectSchemaRules = typeof ObjectRules   // (ObjectRules omits `optional`, so no Omit needed)
type GSObjectWithRules = Assert<
    FluentSchema<Sanitize<{ foo: string }>, ObjectSchemaRules, []>,
    GetSchema<{ foo: string }>
>

// Runtime-style presence check (parallels _recordHasNonEmpty at line 139):
type _objectHasStrict = 'strict' extends keyof GetSchema<{ foo: string }> ? true : false
type _assertStrict = Assert<true, _objectHasStrict>
```

Both new type aliases must be added to the `_type_checks` tuple at line 143 to suppress `noUnusedLocals`.

The existing `object.spec.ts` (30 lines) is untouched — no regressions expected because the refactor of `_fn` to accept `rules` preserves the no-args default (`rules: ObjectRule[] = []`).

### Required pre-commit gates

All must pass before commit:

- `yarn vitest run object.strict.spec.ts` (dev iteration)
- `yarn build:clean` (ESM + CJS dual build)
- `yarn check:fix` (Biome lint + Prettier)
- `yarn test` (full suite)
- `yarn circular-dependencies` (madge)
- `yarn tsc -p tsconfig.json --noEmit` (mandatory typecheck)

## Documentation Update

Under `#### Schema.object` in `README.md`, extend the existing "Supports the fluent ..." line to include `.strict()`:

```diff
-Supports the fluent `.optional()`, `.validator()`, `.use()`, and `.toStandardSchema()` APIs.
+Supports the fluent `.strict()`, `.optional()`, `.validator()`, `.use()`, and `.toStandardSchema()` APIs.
```

Add a brief example block under the existing `Schema.object` example:

```ts
import { object, string, number } from '@srhenry/type-utils'

const isUser = object({
    id: number(),
    name: string(),
}).strict()

isUser({ id: 1, name: 'Alice' })           // true
isUser({ id: 1, name: 'Alice', age: 30 }) // false — 'age' is not declared
```

Per AGENTS.md release-readme-prompt: README lists user-facing APIs only. `.strict()` is a user-facing API → documented in README. The underlying `Object.strict` rule name and `__Object.strict__` key string are internal — not in README (those belong in CHANGELOG / release notes).

## File Inventory

**New files (6)**:
- `src/validators/rules/Object/index.ts`
- `src/validators/rules/Object/factories/strict.ts`
- `src/validators/rules/Object/handlers/strict.ts`
- `src/validators/rules/Object/formators/strict.ts`
- `src/validators/__tests__/object.strict.spec.ts`
- `docs/superpowers/specs/2026-07-10-schema-object-strict-design.md` (this file)

**Modified files (7)**:
- `src/validators/rules/constants.ts` (4 lines: import, key, binding)
- `src/validators/rules/types/index.ts` (2 lines: import, `Default` extension)
- `src/validators/schema/types/ObjectSchema.ts` (widen `TRules` slot)
- `src/validators/schema/types/GetSchema.ts` (widen specific-object branch to include `ObjectSchemaRules`)
- `src/validators/schema/object.ts` (refactor `_fn` to accept `rules`; add `schema.strict`)
- `README.md` (one-line API list + small example block)
- `src/validators/schema/types/__tests__/GetSchema.spec.ts` (add `GSObjectWithRules` + `_objectHasStrict` compile-time assertions; extend `_type_checks` tuple)

**Files explicitly untouched** (verified — confirmed not requiring changes):
- `src/validators/SchemaValidator.ts`
- `src/validators/schema/helpers/validate/validateObject.ts`
- `src/validators/RuleValidator.ts`
- `src/validators/BaseValidator.ts`
- `src/validators/schema/helpers/isFollowingRules.ts`
- `src/validators/rules/helpers/getRule.ts`
- `src/validators/schema/types/FluentSchema.ts` (the generic slot already handles TRules)
- `src/validators/object.spec.ts` (no regressions expected from refactored default)

## Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Refactor of `_fn` breaks existing `object(tree)` calls (without `.strict()`) | Default `rules: ObjectRule[] = []` preserves no-args calls; existing `object.spec.ts` must remain green as a regression gate |
| Circular import: `rules/Object/index.ts` ↔ `rules/types/index.ts` | `rules/types/index.ts` imports only the `type ObjectRule` (type-only import); runtime graph unchanged. Verified via `yarn circular-dependencies` |
| `V3.ObjectStruct.rules` introspection regressions | New `metadata introspection` tests cover the rule struct shape; if existing introspection code depends on `rules[]` being empty for objects, those tests will fail loudly |
| Fluent type breaks for `object(...)` callers | `TRules = typeof ObjectRules` is compatible with `FluentSchema`'s `TRules extends { [x: string]: Fn<any[], any> }` constraint — verified structurally; TS7 strict mode will catch mismatch in `yarn tsc --noEmit` |
| Strict semantics surprise for `object({}).strict()` users | Documented in README example block; degenerate case covered in tests |

## Acceptance Criteria

- [ ] `object({id: string()}).strict()` returns `false` for `{id: 'a', extra: 'x'}` and `true` for `{id: 'a'}`
- [ ] `object({id: string()}).strict().validator().validate({id:'a', extra:'x'})` throws `ValidationErrors`
- [ ] Multi-error aggregation confirmed via test: `validate({id: 123, extra:'x'})` throws with both `strict` and `Invalid value for key id` errors
- [ ] `object({a:string(), b:string().optional()}).strict()` accepts `{a:'1'}` and rejects `{a:'1', c:'2'}`
- [ ] `.strict()` is removed from the fluent chain after being called (TS compile-time check)
- [ ] Double `.strict()` throws plain `Error` with `Cannot call strict more than once`
- [ ] `object().strict()` (no tree) accepts `{}` and rejects `{a:1}`
- [ ] `GetSchema<{ foo: string }>` exposes `.strict()` (compile-time assertion in `GetSchema.spec.ts`: `_objectHasStrict === true`)
- [ ] All existing tests in `yarn test` green
- [ ] `yarn build:clean` succeeds (ESM + CJS)
- [ ] `yarn check:fix` clean (no Biome warnings, no Prettier diffs)
- [ ] `yarn circular-dependencies` clean
- [ ] `yarn tsc -p tsconfig.json --noEmit` exits 0
- [ ] README's `Schema.object` section updated with `.strict()` in the API list + example block
- [ ] Pushed as PR to `developer` branch per AGENTS.md PR workflow (worktree at `.worktree/feat/schema-object-strict`)
