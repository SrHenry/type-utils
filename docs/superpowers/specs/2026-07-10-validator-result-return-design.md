# Design: `validator-result-return`

**Task ID**: `validator-result-return` (new — to be filed in TASKS.md after spec approval)
**Date**: 2026-07-10
**Status**: Approved (design sections reviewed sequentially)
**Author**: AI harness session
**Target release**: 0.9.0 (breaking change)

## Summary

The validator interfaces' no-throw branch (``.validator(false)``, `SchemaValidator.validate(arg, schema, false)``, and the instance `validate(arg, false)` method on the returned validator) currently return `ValidateReturn<T> = T | ValidationErrors<...>` — a bare union conflating the success payload and the error payload in a single type, forcing consumers to disambiguate at runtime via `instanceof ValidationErrors`. The 0.9.0 release replaces this with a tuple-shaped `Result<T, ValidationErrors>` return (`[null, T] | [ValidationErrors, null]`), reusing the existing `Result` type already exported from `src/types/Result.ts`.

The throwing branches (`.validator()`, `.validator(true)`, static `SchemaValidator.validate(arg, schema)`, and instance `.validate(arg)` with default `shouldThrow=true`) keep their current runtime semantics — they throw `ValidationErrors` on failure and return the bare `T` on success.

Accompanying the API change, four new helper functions (`ok`, `err`, `isOk`, `isErr`) are exported from a new `src/validators/helpers/result.ts`. `isOk`/`isErr` are type-narrowing type guards that also enforce the Result tuple shape at runtime (length, error slot type, and mutual exclusivity between the two slots).

The private internal `validate()` function in `src/validators/SchemaValidator.ts` is refactored to natively return `Result` and the metadata-based `setThrows`/`mustNotThrow`/`shouldThrow` symbol machinery is removed. This produces one coherent code path instead of two branches toggled through `Symbol.for('...__throws__')` metadata.

**Acceptance criteria**:

- `.validator(false).validate(arg)` and `SchemaValidator.validate(arg, schema, false)` return `[null, T] | [ValidationErrors, null]` at both type and runtime.
- `.validator().validate(arg)` / `.validator(true).validate(arg)` / `SchemaValidator.validate(arg, schema)` / `.validate(arg, true)` continue to throw `ValidationErrors` on failure and return bare `T` on success.
- Optional schemas' no-throw validators return `Result<undefined | T, ValidationErrors>`.
- `ok`, `err`, `isOk`, `isErr` are exported from `@srhenry/type-utils`, with `isOk`/`isErr` narrowing the success/error tuple branches respectively and strictly enforcing Result-shape invariants at runtime.
- `ValidateReturn<T>` remains exported as a `@deprecated` alias for `Result<T, ValidationErrors>` (slated for removal in 0.10.0).
- `yarn tsc -p tsconfig.json --noEmit`, `yarn test`, `yarn check:fix`, `yarn build:clean`, `yarn circular-dependencies` all pass on the feature branch.

## Scope

### In scope

- Internal `validate()` refactor in `src/validators/SchemaValidator.ts`: drop `throws` symbol / `setThrows` / `mustNotThrow` / `shouldThrow` / `defaults.throws`; signature natively returns `Result<T, ValidationErrors>`.
- All recursive call sites in `src/validators/schema/helpers/validate/*.ts` (validateObject, validateRecord, validateDefault, validateUnion, validateIntersection, validateWithoutMetadata) drop the `mustNotThrowCtx: unknown` third parameter and unwrap `Result` tuples instead of `instanceof ValidationErrors` filters.
- Public method type signatures on `SchemaValidator` (static `validate`) and `__SchemaValidator` (instance `validate`).
- `FluentSchema` and `FluentOptionalSchema` `validator()` method type signatures: replace non-throwing `ValidateReturn<T>` return with `Result<T, ValidationErrors>` / `Result<undefined | T, ValidationErrors>`.
- `ValidateReturn<T>` in `src/validators/types/ValidateReturn.ts` becomes a `@deprecated` alias for `Result<T, ValidationErrors>`.
- New file `src/validators/helpers/result.ts` exports `ok`, `err`, `isOk`, `isErr`.
- New test file `src/validators/__tests__/result-helpers.spec.ts`.
- Existing test updates in `src/validators/__tests__/SchemaValidator.spec.ts` and `src/validators/__tests__/[...schemas].validator.spec.ts` (tuple-unwrap migration).
- `src/validators/standard-schema/registerValidateCallback.ts` switches from `instanceof ValidationErrors` check to `Result` tuple destructuring.
- Courtesy swap in `src/helpers/Experimental/run.ts`: inline `[null, value] as SucessfulResult` → `ok(value)`; `[e, null] as ErrorResult` → `err(e)`.
- `README.md` updates under "Schema.validator" and "Util types — Result" sections.
- `src/validators/index.ts` export of `ok`/`err`/`isOk`/`isErr`.

### Out of scope

- Backward-compat shim that returns the old `T | ValidationErrors` shape behind a flag (rejected: clean break in 0.9.0).
- Removing the `result`-shaped compat alias `ValidateReturn<T>` in 0.9.0 (deferred to 0.10.0).
- Migration of the throwing branches to return `Result` (rejected: keep throwing branches as `T`-or-throw per user's explicit confirmation).
- Splitting the `.validator()` boolean arg into two named methods like `.safeValidate()` (rejected: keep `boolean` arg).
- Changes to `BaseValidator`, `RuleValidator`, or the standard-schema compliant shapes (`toStandardSchema`, `fromStandardSchema`).
- Renaming the typo'd `SucessfulResult` type — kept as-is; documented as future cleanup.
- `match` facility changes (not affected).
- Experimental pipeline / lambda changes (only `run.ts` gets the courtesy `ok`/`err` swap).

## Architecture

### Approach selection

Three approaches were considered:

| Approach | Description | Recommendation |
|---|---|---|
| **A. Straight internal refactor** | `validate()` natively returns `Result`; metadata-toggling dropped; recursive handlers unwrap tuples directly | **Chosen** |
| B. Signature-only change | Internal `validate()` keeps the metadata-toggling as-is; only public-facing type signatures change | Rejected — preserves symbol-toggling complexity indefinitely; two behaviors to maintain |
| C. Add new methods alongside | Add `.safeValidate()` returning `Result`; keep `.validator(false)` as deprecated legacy; two parallel code paths | Rejected — duplicates validation logic; defeats "clean break" intent of a major-version BPI |

**Rationale for A**: the metadata-toggling complexity (`Symbol.for('[@srhenry/type-utils]:/validators/SchemaValidator/__throws__')` + `setThrows(false, subject)` + `mustNotThrow()`) has lived in `SchemaValidator.ts` for at least 7 versions and would otherwise persist indefinitely. Approach A creates one coherent code path for both throw / no-throw branches. The internal `validate()` function returning `Result` naturally mirrors the public API surface.

### Internal `validate()` function (post-refactor)

```typescript
// Before (SchemaValidator.ts:107-179):
function validate<T, Name extends string, Parent>(
    this: unknown,
    arg: unknown,
    schema: TypeGuard<T>,
    name_or_options?: Name | ValidateOptionalArgs<Name, Parent>,
    parent: Parent | NO_PARENT = NO_PARENT
): ValidateReturn<T> {
    const throws = shouldThrow(this)  // ← reads Symbol metadata
    // ... dispatch with validate.bind(mustNotThrow())(value, schema, ...) recursive calls
    if (errors.length > 0) {
        if (throws) throw new ValidationErrors(errors)
        return new ValidationErrors(errors)
    }
    return arg as T
}

// After:
function validate<T, Name extends string = string, Parent = any>(
    arg: unknown,
    schema: TypeGuard<T>,
    name_or_options?: Name | ValidateOptionalArgs<Name, Parent>,
    parent: Parent | typeof NO_PARENT = NO_PARENT
): Result<T, ValidationErrors> {
    const metadata = getStructMetadata(schema) as V3.StructType
    const errors: ValidationError[] = []
    let name: Name | undefined
    ;({ name, parent = NO_PARENT } =
        typeof name_or_options === 'string' ? { name: name_or_options } : (name_or_options ?? {}))

    if (parent === NO_PARENT) name ??= '$' as Name

    const pushNewError = pushNewErrorFactory(errors, { schema, value: arg, name, parent })

    // Dispatch — no mustNotThrowCtx param; recursive calls return Result directly
    if (!hasStructMetadata(schema)) {
        validateWithoutMetadata({ ...baseCtx, metadata })
    } else {
        switch (metadata.type) {
            case 'object':   validateObject({ ...baseCtx, metadata: metadata as V3.ObjectStruct<any> }, validate); break
            case 'record':   validateRecord({ ...baseCtx, metadata: metadata as V3.RecordStruct<string, any> }, validate); break
            case 'intersection': validateIntersection({ ...baseCtx, metadata: metadata as V3.IntersectionStruct<any[]> }, validate); break
            case 'union':    validateUnion({ ...baseCtx, metadata: metadata as V3.UnionStruct<any[]> }, validate); break
            default:         validateDefault({ ...baseCtx, metadata }, validate)
        }
    }

    if (errors.length > 0) return [new ValidationErrors(errors), null]
    return [null, arg as T]
}
```

### Public wrappers

```typescript
// Static method on __SchemaValidator:
public static validate<T>(
    arg: unknown,
    schema: TypeGuard<T>,
    shouldThrow: boolean = true
): T | Result<T, ValidationErrors> {
    const result = validate(arg, schema)  // always returns Result
    if (shouldThrow) {
        const [err, val] = result
        if (err) throw err
        return val as T
    }
    return result
}

// Instance method (wrapped in @AutoBind() as today):
@AutoBind()
public validate<V>(
    value: V,
    shouldThrow: boolean = this.throws
): T | Result<T, ValidationErrors> {
    const result = validate(value, this.schema)
    if (shouldThrow) {
        const [err, val] = result
        if (err) throw err
        return val as T
    }
    return result
}
```

The `ValidateFn` type alias used by recursive handlers narrows:

```typescript
// Before:
type ValidateFn = (this: unknown, arg: unknown, schema: TypeGuard<any>, ...args: any[]) => unknown

// After:
type ValidateFn = (arg: unknown, schema: TypeGuard<any>, ...args: any[]) => Result<unknown, ValidationErrors>
```

No `this` binding needed anymore — `.bind(mustNotThrowCtx)` is gone; recursive calls are plain function calls.

### What gets removed

| Symbol/field | Location | Reason |
|---|---|---|
| `throws` symbol | `SchemaValidator.ts:40` | Flags internal throw-toggle via metadata |
| `shouldThrow(subject)` | `SchemaValidator.ts:42-47` | Reads the symbol metadata |
| `mustNotThrow<T>(subject)` | `SchemaValidator.ts:49` | Sets the symbol metadata to `false` |
| `setThrows<T>(value, subject)` | `SchemaValidator.ts:51` | Writes the symbol metadata |
| `defaults.throws` / `DefaultThrowsParam` | `SchemaValidator.ts:33-38` | The boolean default for the metadata flag |
| `mustNotThrowCtx` param | Each `validate*.ts` helper | Was threaded to all recursive call sites |

### What stays

- `NO_PARENT` symbol (still used to distinguish default-vs-explicit `undefined` parent)
- `pushNewErrorFactory` helper (pushes `ValidationError` instances into the errors array)
- `ValidationContext` type (helpers receive the context object unchanged)
- `ValidateOptionalArgs<Name, Parent>` type
- All genuine programming-error throws (invalid metadata shapes, non-TypeGuardError catches, tuple metadata missing the struct): these remain as `throw new TypeError(...)` / `throw new TypeGuardError(...)` — they signal API misuse, not validation failure

### Components

#### `src/validators/SchemaValidator.ts`

Remove:
- `throws` symbol declaration (line 40)
- `shouldThrow(subject)` function (lines 42-47)
- `mustNotThrow<T>(subject)` function (line 49)
- `setThrows<T>(value, subject)` function (line 51)
- `defaults` object and `DefaultThrowsParam` type (lines 33-38)
- `import { setMetadata } from '../TypeGuards/helpers/setMetadata.ts'` (only used by `setThrows`)
- `import { getMetadata } from '../TypeGuards/helpers/getMetadata.ts'` (only used by `shouldThrow`)
- `import { asTypeGuard } from '../TypeGuards/helpers/asTypeGuard.ts'` (only used by `shouldThrow`)

Update:
- `validate<T>()` function (lines 107-179): drop the `this: unknown` parameter, drop the `const throws = shouldThrow(this)` line, switch return type to `Result<T, ValidationErrors>`, change bottom of function: `if (errors.length > 0) return [new ValidationErrors(errors), null]; return [null, arg as T]`
- All `validate.bind(setThrows(shouldThrow))(arg, schema)` call sites in static `validate()` and instance `validate()` (lines 224, 295) become bare `validate(arg, schema)`
- `ValidateOptionalArgs` type default for `Parent` widens from `any` (current) to staying `any` (unchanged)
- `ISchemaValidator<T, Throws extends boolean = true>` (lines 181-191): default `Throws` becomes literal `true`; no-throw branch returns `Result<T, ValidationErrors>` instead of `T | ValidationErrors`
- `ISchemaValidatorConstructor` (lines 193-201): collapses from 4 overloads to 2 (the explicit `true`/`false` overloads were a workaround for the `DefaultThrowsParam` indirection; with literal default `true`, only the default + the `boolean` generic overload are needed)
- `__SchemaValidator<T, Throws>` class: constructor signature unchanged; static `validate()` and instance `validate()` updated per "Public wrappers" pseudocode above; `throws` field kept on the class (still used as the per-instance default for the boolean arg)
- The exported `SchemaValidator` object type (lines 299-307): overloads updated so `validate(false)` / `validate(boolean)` return `Result<T, ValidationErrors>`
- Add `import type { Result } from '../types/Result.ts'`

Files `setMetadata.ts`, `getMetadata.ts`, `asTypeGuard.ts` are not removed (they have other consumers); only the `SchemaValidator.ts` imports are dropped.

#### `src/validators/schema/helpers/validate/validateObject.ts`

Drop `mustNotThrowCtx: unknown` from `validateObject`, `validateObjectTree`, `validateObjectEntries` signatures.

`validateObjectTree` (lines 90-131): the `.map` that builds `results` now calls `validate(item, schema, name, parent)` directly (no `.bind(mustNotThrowCtx)`). Results are `Result<unknown, ValidationErrors>` tuples. The downstream `.filter` at lines 133-145 that pulls `ValidationErrors` instances out transitions to:

```typescript
results
    .map(([, r]) => r as Result<unknown, ValidationErrors>)
    .filter((r): r is [ValidationErrors, null] => r[0] !== null)
    .forEach(([, r0]) => ctx.errors.push(...r0.errors))
```

Alternative ergonomic form (prefer):

```typescript
for (const [, r] of results) {
    const [err] = r as Result<unknown, ValidationErrors>
    if (err) ctx.errors.push(...err.errors)
}
```

Same treatment for `validateObjectEntries` (lines 167-176): `ctx.arg.map((item, i) => validate(item, entries.schema, { ... }))` now returns `Result[]`; the filter `isInstanceOf(ValidationErrors)` becomes `r => r[0] !== null` and iterates `r[0].errors`.

Missing-key branch (lines 115-130): unchanged — still constructs a `ValidationErrors([new ValidationError(...)])` in-memory and stores it in `results`. The downstream filter at 133-145 handles it via the same `r[0] !== null` path: but note this is a **bare `ValidationErrors` value**, not a `Result` tuple. This needs reconciliation — two options:

1. Wrap missing-key results as `Result` too: `return [schema, [new ValidationErrors([...]), null] as Result<...]]` — keeps the array homogeneous.
2. Continue returning bare `ValidationErrors` and update the downstream filter to handle both shapes.

Option 1 is cleaner — chosen. The missing-key branch becomes:

```typescript
return [schema, [new ValidationErrors([new ValidationError({ ... })]), null] as Result<unknown, ValidationErrors>]
```

So `results` is uniformly `Array<[TypeGuard<any>, Result<unknown, ValidationErrors>]>` and the downstream filter is straightforward tuple unwrap.

`validateDefaultTuple` and `validateDefaultEnum` (lines 134-222): same treatment — `validate.bind(mustNotThrowCtx)(arg[i], ...)` becomes `validate(arg[i], ...)`; the `.filter(isInstanceOf(ValidationErrors))` becomes `.map(r => r[0]).filter(isErr)` or equivalent tuple-unwrap.

#### `src/validators/schema/helpers/validate/validateRecord.ts`

Drop `mustNotThrowCtx` from `validateRecord`, `validateRecordEnumKeys`, `validateRecordPropertyKeys`, `validateRecordKeyEntry` (all four signatures share the pattern).

`validateRecordEnumKeys` (lines 88-130): the `ownKeys.flatMap(k => [...])` building `recordValidationResult` returns a mix of `Result<unknown, ValidationErrors>` tuples. Currently `.filter(isInstanceOf(ValidationErrors))` at line 128 filters only error branches. After refactor, becomes:

```typescript
.flatMap((r): ValidationError[] => {
    const [err] = r as Result<unknown, ValidationErrors>
    return err ? Array.from(err.errors) : []
})
```

`validateRecordKeyEntry` (lines 244-271): `const recordKeyValidationResult = validate(...)` now returns `Result`. The current `instanceof ValidationErrors` checks at lines 253-255 and 267-270 transition to `[err, val] = validate(...); if (err) ctx.errors.push(...err.errors)`. Note that the existing `recordKeyValidationResult !== keyForValidation && instanceof ValidationErrors` comparison drops the first half — the new pattern is simply `if (err) ...`.

#### `src/validators/schema/helpers/validate/validateDefault.ts`

Drop `mustNotThrowCtx`. `NO_PARENT` symbol at line 15 is local to this file (separate from the one in `SchemaValidator.ts`) and stays.

`validateDefaultInner`, `validateDefaultTuple`, `validateDefaultEnum`: switch `.bind(mustNotThrowCtx)` calls to plain `validate(...)`, and `.filter(isInstanceOf(ValidationErrors))` becomes tuple-unwrap.

`validateDefaultEnum` (lines 200-221): the count of `enumErrors` becomes `enumResults.filter(r => (r as Result<...>)[0] !== null).length`; the multiple-matches check keeps its semantics — though note: in the new shape, "multiple matches" means "multiple results where `[0] === null`", not "multiple `=== ctx.arg`" (the value identity check from the existing code drops away because the `Result` tuple is never `=== ctx.arg`). Implementation:

```typescript
const enumResults = metadata.types.map(enumElementStruct =>
    validate(ctx.arg, enumElementStruct.schema, { name: ctx.name, parent: ... })
)
const enumErrors = enumResults.filter(r => (r as Result<...>)[0] !== null)
const enumErrorCount = enumErrors.length

if (enumResults.length - enumErrorCount > 1)
    throw new TypeError('Invalid Enum State! Multiple matches found!')

if (enumErrorCount === enumResults.length)
    ctx.pushNewError({ ... })
```

#### `src/validators/schema/helpers/validate/validateUnion.ts`

Drop `mustNotThrowCtx`. `unionResults = metadata.types.map(...) validate.bind(...)(...)` becomes plain `validate(...)`; `.filter(isInstanceOf(ValidationErrors))` becomes `.filter(r => r[0] !== null)`. The `.filter(e => e !== ctx.arg)` check at line 47 (filtering out identity-equal results — no longer applicable since results are tuples not bare values) drops.

The error case logic (lines 49-60): builds a `unionErrorList` flatMap of errors; unchanged otherwise.

#### `src/validators/schema/helpers/validate/validateIntersection.ts`

Drop `mustNotThrowCtx`. Same pattern as `validateUnion`. The `.filter(e => e !== ctx.arg)` at line 49 drops; `.filter(isInstanceOf(ValidationErrors))` becomes `.filter(r => r[0] !== null)`.

The `metadata.types.filter((_, i) => intersectionResults.map(r => ...).filter(([, r]) => r[0] !== null).map(([idx]) => idx).includes(i))` line is rewritten to operate on tuples directly.

#### `src/validators/schema/helpers/validate/validateWithoutMetadata.ts`

`mustNotThrowCtx` was never passed (function only takes `ctx`). Body unchanged. The internal `ensureInterface(ctx.arg, ctx.schema)` call still throws `TypeGuardError` on failure, caught at line 11 and pushed as a `ValidationError`. No Result involvement here.

#### `src/validators/schema/helpers/validate/ValidationContext.ts`

Unchanged. The `ValidationContext` type doesn't include the `mustNotThrowCtx` field (it was threaded separately through the helpers).

#### `src/validators/schema/helpers/validate/index.ts`

Unchanged — re-exports of the six helper functions.

#### `src/validators/types/ValidateReturn.ts`

Becomes a deprecation alias:

```typescript
import type { Result } from '../../types/Result.ts'
import type { ValidationErrors } from '../ValidationErrors.ts'

/**
 * @deprecated since 0.9.0 — use `Result<T, ValidationErrors>` instead.
 * `ValidateReturn<T>` is aliased to `Result<T, ValidationErrors>` and will be
 * removed in 0.10.0. The no-throw branches of `schema.validator(false)` and
 * `SchemaValidator.validate(arg, schema, false)` now return `Result`, not the
 * bare `T | ValidationErrors` union this type previously modeled.
 */
export type ValidateReturn<T> = Result<T, ValidationErrors>
```

The complex `ValidationError<unknown, T, ...>` generic projection in the old definition collapses — validation error enrichment is preserved at runtime (callers iterate the `ValidationErrors` instance), but the *type* no longer exposes a convoluted generic projection of the payload type's keys onto error categories.

#### `src/validators/schema/types/FluentSchema.ts`

`validator()` method type signatures (lines 27-32):

```typescript
// Before:
validator(throwOnError?: true): ThrowFn<ValidationErrors, [arg: unknown], T> & {
    validate: ThrowFn<ValidationErrors, [arg: unknown], T>
}
validator(throwOnError: boolean | false): Fn<[arg: unknown], ValidateReturn<T>> & {
    validate: Fn<[arg: unknown], ValidateReturn<T>>
}

// After (three overloads):
validator(throwOnError?: true): ThrowFn<ValidationErrors, [arg: unknown], T> & {
    validate: ThrowFn<ValidationErrors, [arg: unknown], T>
}
validator(throwOnError: false): Fn<[arg: unknown], Result<T, ValidationErrors>> & {
    validate: Fn<[arg: unknown], Result<T, ValidationErrors>>
}
validator(throwOnError: boolean): Fn<[arg: unknown], T | Result<T, ValidationErrors>> & {
    validate: Fn<[arg: unknown], T | Result<T, ValidationErrors>>
}
```

Imports: drop `ValidateReturn`; add `Result` from `../../../types/Result.ts`.

#### `src/validators/schema/types/FluentOptionalSchema.ts`

Same shape, with `T` → `undefined | T` on success:

```typescript
validator(throwOnError?: true): ThrowFn<ValidationErrors, [arg: unknown], undefined | T> & {
    validate: ThrowFn<ValidationErrors, [arg: unknown], undefined | T>
}
validator(throwOnError: false): Fn<[arg: unknown], Result<undefined | T, ValidationErrors>> & {
    validate: Fn<[arg: unknown], Result<undefined | T, ValidationErrors>>
}
validator(throwOnError: boolean): Fn<[arg: unknown], (undefined | T) | Result<undefined | T, ValidationErrors>> & {
    validate: Fn<[arg: unknown], (undefined | T) | Result<undefined | T, ValidationErrors>>
}
```

Also fixes an existing type bug: the current line 30 has `validate: ThrowFn<...>` on the no-throw overload but the outer returns `Fn<...>`. After this refactor, `.validate` types consistently with the outer callable across all overloads.

#### `src/validators/types/index.ts`

Nothing changed (the `ValidateReturn` export that happens through `src/validators/schema/types/index.ts:61` continues to re-export the updated alias).

#### `src/validators/standard-schema/registerValidateCallback.ts`

The callback at lines 10-33:

```typescript
// Before:
registerSchemaValidateCallback(
    (value: unknown, guard, shouldThrow): StandardSchemaV1.Result<any> => {
        const result = SchemaValidator.validate(value, guard, shouldThrow)
        if (result instanceof ValidationErrors) { ...compose issues... }
        return { success: true, value: result }
    }
)

// After:
registerSchemaValidateCallback(
    (value: unknown, guard): StandardSchemaV1.Result<any> => {
        const [err, val] = SchemaValidator.validate(value, guard, false) as Result<unknown, ValidationErrors>
        if (err) {
            const issues: StandardSchemaV1.Issue[] = []
            for (const e of err.errors) {
                if (e instanceof ValidationError) issues.push({ message: e.message, path: parsePathString(e.path) })
                else issues.push({ message: String(e) })
            }
            return { success: false, issues }
        }
        return { success: true, value: val }
    }
)
```

The Standard Schema spec never wants thrown errors — the callback is always invoked with `shouldThrow=false`. The new implementation drops the `shouldThrow` parameter from the callback signature (callers always get the no-throw path) and the `instanceof ValidationErrors` branch (the previous union-shape filter). `SchemaValidator.validate(value, guard, false)` now returns a `Result<unknown, ValidationErrors>` tuple directly; the callback destructures and maps to the Standard Schema `{success, value, issues}` shape.

The `registerSchemaValidateCallback` signature (defined in `attachStandardSchema.ts`) needs updating to drop the `shouldThrow` parameter. This is an internal type — the Standard Schema integration is a private callback dispatcher, no public consumers.

The `as Result<unknown, ValidationErrors>` cast at the destructure site is needed because `SchemaValidator.validate(value, guard, false)` is typed as `Result<T, ValidationErrors> | T` via the `boolean` overload; passing `false` as a literal narrows to the `Result` branch — but the static overload signature uses the `boolean` parameter type rather than literal `false`. Verify the overload resolution; if `false`-as-literal correctly narrows to the `Result` overload, the cast is unnecessary (preferred).


#### `src/validators/helpers/result.ts` (new file)

```typescript
import type { Result } from '../../types/Result.ts'

export function ok<TValue>(value: TValue): [null, TValue] {
    return [null, value]
}

export function err<TError extends Error>(error: TError): [TError, null] {
    return [error, null]
}

export function isOk<TValue, TError extends Error>(
    result: Result<TValue, TError>
): result is [null, TValue] {
    assertResultShape(result)
    const [errSlot] = result as [unknown, unknown]
    return errSlot === null
}

export function isErr<TValue, TError extends Error>(
    result: Result<TValue, TError>
): result is [TError, null]
{
    assertResultShape(result)
    const [errSlot] = result as [unknown, unknown]
    return errSlot !== null
}

function assertResultShape(result: unknown): asserts result is [unknown, unknown] {
    if (!Array.isArray(result) || result.length !== 2) {
        throw new TypeError(
            `Expected a Result tuple of length 2, got ${result === null ? 'null' : typeof result}`
        )
    }
    const [errSlot, valSlot] = result as [unknown, unknown]

    // Error slot must be null or an Error instance — nothing else is ever valid.
    if (!(errSlot === null || errSlot instanceof Error)) {
        throw new TypeError(
            `Invalid Result shape: error slot must be null or an Error instance, got ${typeof errSlot}`
        )
    }

    // Mutual exclusivity: when errSlot is an Error, valSlot must be null.
    // (When errSlot is null, valSlot is the payload — anything, including null.)
    if (errSlot instanceof Error && valSlot !== null) {
        throw new TypeError(
            'Invalid Result shape: error slot is an Error but value slot is not null — expected [Error, null]'
        )
    }
}
```

#### `src/validators/index.ts`

Add to the existing exports:

```typescript
export { ok, err, isOk, isErr } from './helpers/result.ts'
```

Goes through `src/index.ts`'s existing `export * from './validators/index.ts'`.

#### `src/helpers/Experimental/run.ts`

Lines 35, 36, 37, 39 — inline tuple construction:

```typescript
// Before:
.then(value => [null, value] as SucessfulResult)
.catch(error => [error, null] as ErrorResult)
return [null, result]
// ...
return [error as Error, null]

// After:
.then(value => ok(value))
.catch(error => err(error as Error))
return ok(result)
// ...
return err(error as Error)
```

Imports: add `import { err, ok } from '../../validators/helpers/result.ts'`. Note: this creates a cross-package dependency from `src/helpers/` into `src/validators/`. Verify with `yarn circular-dependencies` — the helpers are leaf-level (no further imports), so no circular edges introduced.

## Testing strategy

### New test file: `src/validators/__tests__/result-helpers.spec.ts`

Unit tests for the `ok`/`err`/`isOk`/`isErr` helpers, covering:

1. **Constructors** — happy path assertions for `ok(value)`, `ok(undefined)`, `ok(null)` (a valid `Result<null, Error>`), `err(error)`, `err(ValidationErrors instance)`.
2. **`isOk` happy path** — returns `true` for `[null, value]` and `[null, null]`; returns `false` for `[Error, null]`; narrows to `[null, TValue]` at the type level (validate `r[1]` accessible, `r[0]` is `null`).
3. **`isErr` happy path** — returns `true` for `[Error, null]`; returns `false` for `[null, value]`; returns `false` for `[null, null]`; narrows to `[TError, null]` at the type level.
4. **Structural violations** — `isOk` and `isErr` throw `TypeError` for non-array input (string, plain object, `null`, `undefined`), wrong-length arrays (`[]`, `[null]`, `[null, 1, 2]`).
5. **Error-slot violations** — `isOk` and `isErr` throw `TypeError` when error slot is non-null non-Error (`'string-error'`, `42`, `{}`).
6. **Mutual-exclusivity violations** — `isOk` and `isErr` throw `TypeError` when both error and value slots are populated (`[new Error('x'), 7]`).
7. **Composition with validators** — `isOk`/`isErr` narrow the no-throw validator output correctly: `string().min(3).validator(false).validate('foo')` narrows to success tuple with value `'foo'`; `string().min(3).validator(false).validate('ab')` narrows to error tuple with `ValidationErrors` instance in slot 0.

The spec file imports `Result` type from `../../types/Result.ts` to parameterize test subjects, and imports the helpers via the new transit path `('../helpers/result.ts')` to verify the file location matches the export.

### Migration of existing test files

#### `src/validators/__tests__/SchemaValidator.spec.ts`

Sites requiring tuple unwrap migration:

- **Lines 76-81**: `SchemaValidator.validate(value3, schema2, false) as ValidationErrors` becomes `const [err] = SchemaValidator.validate(value3, schema2, false); expect(err).toBeInstanceOf(ValidationErrors); const errors = err!.errors`.
- **Lines 127-130**: `expect(() => SchemaValidator.validate([value3], schema2, false)).not.toThrow(ValidationErrors)` — the `.not.toThrow` is preserved (the no-throw branch doesn't throw by definition); the lie here is that `.not.toThrow` against a function that doesn't throw is a no-op assertion, unchanged.
- **Lines 131-141**: Chained no-throw validation pipeline — restructured:
    ```typescript
    const [innerErr] = SchemaValidator.validate(value3, schema1, false)
    expect(innerErr).toBeInstanceOf(ValidationErrors)
    expect(() => SchemaValidator.validate(
        innerErr,
        and(isInstanceOf(ValidationErrors), asTypeGuard(({ errors }: ValidationErrors) =>
            errors.length === 1 && errors[0]!.path === '$.a'))
    )).not.toThrow(ValidationErrors)
    ```
- **Lines 143-152**: Similar chained pattern, restructured to destruct the inner `Result` first.
- **Lines 192-197**: `validatedValue3(SchemaValidator.validate(value3, schema1, false))` — restructured: `const [err] = SchemaValidator.validate(value3, schema1, false); expect(validatedValue3(err as ValidationErrors)).toBe(true)` (the `as ValidationErrors` cast is preserved because the schema-test helper `validatedValue3` takes bare `ValidationErrors` input; alternative is to extend that helper to take a `Result` and destructure internally — keep the cast to minimize diff).
- **Lines 193-197**: Same migration.
- **Lines 385-389**: Same migration (same pattern, different values).

The throwing-path assertions (e.g. `expect(() => SchemaValidator.validate(value3, schema1)).toThrow(ValidationErrors)`) are unchanged — those calls have no third arg and continue to throw.

#### `src/validators/__tests__/[...schemas].validator.spec.ts`

- **Line 82**: `expect(schema.validator(false).validate(void 0)).toBeInstanceOf(ValidationErrors)` — restructured to `const [err] = schema.validator(false).validate(void 0) as Result<unknown, ValidationErrors>; expect(err).toBeInstanceOf(ValidationErrors)`.
- **Line 103**: Same with `schema2` instead of `schema`.

The throwing-path assertions on lines 18-19, 24-25, 30-31, etc. (`expect(validator(arg)).toBe(arg)` and `expect(validator().validate(arg)).toBe(arg)`) remain unchanged — they use the default branch which returns bare `T`.

#### `src/validators/__tests__/record.spec.ts`

Line 205 uses `.validator(true)` — the throwing branch, not affected. No changes required.

#### `src/validators/schema/types/__tests__/GetSchema.spec.ts`

Lines 17 and 189 import `ValidateReturn` and reference `ValidateReturn<unknown>` as the expected type after calling `FluentSchema().validator(false)`. Under the new alias `ValidateReturn<T> = Result<T, ValidationErrors>`, the assertion still compiles. The test verifies type-level projection through `FluentSchema`. Decision: leave the import as `ValidateReturn` — verifies the deprecation alias resolves correctly through the FluentSchema-of-`validator(false)` projection. Zero changes.

#### `src/helpers/__tests__/run.spec.ts`

Uses the standard tuple-destructure pattern `const [error, value] = run(...)`. The run() function internally uses `ok()`/`err()` after the courtesy swap — externally the test sees the same `[null, value] | [Error, null]` shape. Zero changes.

#### `src/validators/standard-schema/__tests__/*.spec.ts`

Standard Schema tests assert the `{success, value, issues}` shape coming out of `~standard.validate()`. That shape is the output of `registerValidateCallback`, which internally translates `Result` → `{success, value, issues}`. The translation logic now uses tuple-destructuring internally, but the external shape is unchanged. Zero changes.

### Final test verification

After implementation, the following must all pass on the feature branch:

- `yarn tsc -p tsconfig.json --noEmit` (all TypeError-clean — both ESM and CJS tsconfigs)
- `yarn test` (Vitest single run — all existing spec files + new `result-helpers.spec.ts`)
- `yarn check:fix` (Biome lint + Prettier check/fix)
- `yarn build:clean` (clean + ESM build + CJS build + `build:fix-declarations`)
- `yarn circular-dependencies` (madge — the new `helpers/result.ts` imports `types/Result.ts` only, no new cycles)
- `yarn vitest run src/validators/__tests__/result-helpers.spec.ts` (smoke test for new file)

## Documentation

### `README.md` — Schema.validator section (lines 509-528)

Update the replacement for the existing block:

````markdown
It allows you to get a validator instance to validate a value against the schema. By default, the validator throws on failure. Pass `false` to get a `Result<T, ValidationErrors>` tuple instead.

```typescript
import { string, object } from '@srhenry/type-utils'
import type { Result } from '@srhenry/type-utils'

const validator = object({ name: string().min(1) }).validator()
validator({ name: 'Alice' }) // { name: 'Alice' } — passes, returns the value
validator({ name: '' })      // throws ValidationErrors

const softValidator = object({ name: string().min(1) }).validator(false)
const [err, value] = softValidator({ name: 'Alice' }) // [null, { name: 'Alice' }]
const [err2, value2] = softValidator({ name: '' })    // [ValidationErrors(...), null]

// Also available as .validate on the validator:
const [err3, value3] = validator.validate({ name: 'Bob' }, false)
```

> Since [`v0.9.0`](https://github.com/SrHenry/type-utils/releases/tag/v0.9.0), the no-throw branch returns a tuple `Result<T, ValidationErrors>` instead of `T | ValidationErrors`. Use the `isOk`/`isErr` helpers from `@srhenry/type-utils` to narrow the result ergonomically:

```typescript
import { string, isOk, isErr } from '@srhenry/type-utils'

const validate = string().min(3).validator(false)
const result = validate('ab')
if (isErr(result)) {
    console.error(result[0])  // ValidationErrors
} else {
    console.log(result[1])    // string
}
```
````

### `README.md` — Util types Result section (lines 776-787)

Add the helper subsection at the end of the `Result` type documentation:

````markdown
##### `ok(value)` / `err(error)` / `isOk(result)` / `isErr(result)`

> Since [`v0.9.0`](https://github.com/SrHenry/type-utils/releases/tag/v0.9.0)

Result helpers shipped alongside the tuple type. `ok`/`err` construct results; `isOk`/`isErr` narrow them at runtime (with strict shape validation — `isOk`/`isErr` throw `TypeError` for malformed tuples, non-Error error slots, or violation of mutual exclusivity).

```typescript
import { ok, err, isOk, isErr, string } from '@srhenry/type-utils'

const r = ok(42)        // [null, 42]
const e = err(new Error('boom'))  // [Error('boom'), null]

const validate = string().min(3).validator(false)
const result = validate('ab')
if (isErr(result)) {
    // result[0] is ValidationErrors
    console.error(result[0].message)
}
```
````

### Release Notes (0.9.0 GitHub release body)

```markdown
### Breaking changes

- **`Schema.validator(false)` / `SchemaValidator.validate(arg, schema, false)` now return `Result<T, ValidationErrors>`**.

  The no-throw branch of the validator interfaces previously returned `T | ValidationErrors` — a union conflating the success payload and the error payload in a single type. As of 0.9.0, it returns a tuple `[null, T] | [ValidationErrors, null]`, discriminated by the error slot.

  Throwing branches (`.validator()`, `.validator(true)`, `SchemaValidator.validate(arg, schema)`) are unchanged — they still throw `ValidationErrors` on failure and return the bare `T` on success.

  - **Migration**: callers using `.validator(false).validate(...)` should switch from `instanceof ValidationErrors` checks to tuple destructuring or the new `isOk`/`isErr` helpers.
  - **`ValidateReturn<T>` type alias**: kept as a `@deprecated` alias for `Result<T, ValidationErrors>` in 0.9.0. Slated for removal in 0.10.0.
  - **New helpers**: `ok`, `err`, `isOk`, `isErr` exported from `@srhenry/type-utils`.
```

No CHANGELOG file is created (the project has none; release notes live in GitHub release bodies, per the Release Pipeline section of AGENTS.md).

## Branch strategy

### Branch creation order

1. From the main repo checkout (NOT a worktree), fetch `master`:
   ```sh
   git fetch origin master
   ```
2. Create `release/0.9.0` on origin, branching from `origin/master`:
   ```sh
   git push origin origin/master:refs/heads/release/0.9.0
   ```
3. Create the worktree + feature branch from `release/0.9.0`:
   ```sh
   git worktree add .worktree/validator-result -b feat/validator-result origin/release/0.9.0
   ```
4. First step inside the worktree: `yarn install` (triggers the `prepare` script which sets up git hooks). Do not write code or run builds until `yarn install` completes.

### PR scope

- **Base branch**: `release/0.9.0`
- **Head branch**: `feat/validator-result`
- **Title**: `feat(validator)!: no-throw branch returns Result<T, ValidationErrors>`
- **Body**: BREAKING CHANGES section listing the type/behavior swaps; migration guide; reference to this spec doc.
- **Push to all remotes** (origin, mirror-gitlab) per AGENTS.md push loop:
   ```sh
   for remote in $(git remote); do
     git push -u "$remote" feat/validator-result || echo "WARNING: push to $remote failed"
   done
   gh pr create --base release/0.9.0 --title "feat(validator)!: no-throw branch returns Result<T, ValidationErrors>" --body "..."
   ```

### Post-merge cleanup (deferred to PR merge time)

From the main repo after PR merges into `release/0.9.0`:

```sh
git worktree remove .worktree/validator-result
git fetch --prune
git branch -d feat/validator-result
for remote in $(git remote); do
  git push "$remote" --delete feat/validator-result || echo "WARNING: delete from $remote failed"
done
```

### Pre-commit hook expectations

Per AGENTS.md, the pre-commit hook runs full `build:clean → check:fix → test → circular-dependencies` (30-60 seconds per commit). Since this PR touches many `.ts` files, the hook will run on every commit. Commit chunks should be granular (Section A → Section B → ...) so partial reverts remain possible. If the hook reformats files during a commit, stage and recommit the formatting changes as a separate commit.

### Commit authoring

Per AGENTS.md, before the first commit in the implementation session:
1. Resolve `git config user.name` and `git config user.email` from the main repo checkout's local then global config.
2. If they look like placeholder values (`Test`, `test@test.com`), stop and ask the user for the correct identity before committing.
3. All commits are GPG-signed with the key matching the author's email (`-S` / `--gpg-sign`).
4. Conventional Commits format with the `feat(validator)!` type for breaking changes; secondary commits during the PR (fixes, adjustments) use appropriate non-breaking types (`test(validator):`, `refactor(validator):`, etc.).

## Risk notes

### Behavioral risk

- **Identity-equality filters dropped**: union/intersection/enum sites currently filter results with `.filter(e => e !== ctx.arg)` to exclude "passing" branches (where `validate.bind(mustNotThrow)(arg, schema)` returned `arg` itself as a success marker). After reframing results as `Result` tuples, the identity comparison `e !== ctx.arg` becomes meaningless (a `Result` tuple is never `=== ctx.arg`). The new pattern is `.filter(r => r[0] !== null)` (filter error tuples). Functionally equivalent: error tuples were previously `ValidationErrors` instances, success tuples were previously `arg` itself.
- **Enum multi-match check**: the existing `enumResults.length - enumErrorCount > 1` semantics assume error results are `ValidationErrors` and non-error results are the bare `arg` value. After refactor: error results are `[ValidationErrors, null]`, success results are `[null, arg]`. The "multiple matches" check still works — `enumErrorCount === enumResults.length` (all-fail) triggers the unified-enum error; exactly one success passes. Semantically same.
- **`validate.bind(mustNotThrow)` → `validate(...)`**: the dropped `.bind(mustNotThrowCtx)` calls were the only synchronization mechanism preventing inner recursion from throwing. After refactor, the inner `validate()` function never throws on validation failure (it returns `Result`); genuine programming-error throws (TypeGuardError for invalid metadata) remain. No behavioral difference for valid inputs; for malformed metadata, the inner throws now propagate to the caller instead of being swallowed by the metadata-toggling mask. This is arguably safer — malformed metadata is a bug worth surfacing.

### Type risk

- **`GetSchema.spec.ts` type projection**: the existing `ValidateReturn<unknown>` test assertions must still compile against the deprecation alias. Verify via `yarn tsc -p tsconfig.json --noEmit`. If they fail, either:
  - Adjust the test to use `Result<unknown, ValidationErrors>` directly (loses alias-coverage test), or
  - Adjust the test's expectation to match the new resolved shape (preferred — keeps the alias import path exercised).
- **`FluentSchema` overload ordering**: the three overloads on `validator()` must be ordered so literal `true`/`false` resolve before the generic `boolean` overload. TypeScript picks the first matching overload, so the order `(throwOnError?: true) → (throwOnError: false) → (throwOnError: boolean)` matches the existing pattern in the current code.
- **`run.ts` cross-package import**: adding `import { err, ok } from '../../validators/helpers/result.ts'` introduces a new cross-directory import from `src/helpers/` into `src/validators/`. Verify with `yarn circular-dependencies` — `helpers/result.ts` is a leaf module importing only the type `Result` from `types/Result.ts`, so no transitive cycle is introduced.

### Regression-risk classes to watch during implementation

1. Multi-error aggregation in `validateObject` for object tree (deeply nested objects) — already covered by `SchemaValidator.spec.ts` tests 200-389; ensure those pass unchanged in their migrated form.
2. Enum "multiple matches found" `TypeError` — exercised by existing enum tests; ensure no false-positive throws after the filter shape change.
3. Optional-check branch in `isOptionalCheck` — short-circuits before the recursive validate call; not affected by the refactor.
4. `setValidatorMessage` static — has its own metadata-validation throws; verify they still surface as `Error`/`TypeError` programming errors, not as `ValidationErrors` validation failures.

## Out-of-scope but noted

- **Typo fix for `SucessfulResult`**: `src/types/Result.ts:1` defines `SucessfulResult` (single 'c' instead of 'uccessful' double-'c'). The misspelled name is also re-exported and used in `src/helpers/Experimental/run.ts:4`. Renaming to `SuccessfulResult` would be a breaking change for type importers; out-of-scope for this PR but worth tracking for the 0.10.0 cycle when `ValidateReturn` is removed.
- **Dropping `DefaultThrowsParam` indirection**: the current indirection (`const defaults = { get throws() { return true } } as const; type DefaultThrowsParam = (typeof defaults)['throws']`) was a workaround for avoiding magic-numbered literal types in the constructor. After refactor, the literal `true` is used directly — dropping the indirection is part of this PR's scope.
- **Internal `ErrorResult`/`SucessfulResult` imports in `run.ts`**: lines 4 currently imports both type aliases. After the courtesy swap, `ErrorResult`/`SucessfulResult` imports can be dropped (replaced by the runtime `ok`/`err` calls which infer the types). This is a minor cleanup in scope.

