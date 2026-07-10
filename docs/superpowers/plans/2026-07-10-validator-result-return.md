# Validator Result-Return Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make validator no-throw branches return `Result<T, ValidationErrors>` (tuple `[null, T] | [ValidationErrors, null]`) instead of the bare `T | ValidationErrors` union, ship `ok`/`err`/`isOk`/`isErr` helpers, and refactor the internal `validate()` function to natively return `Result` (dropping the `Symbol.for('__throws__')` metadata-toggling machinery).

**Architecture:** Approach A (straight internal refactor). The private `validate()` in `src/validators/SchemaValidator.ts` switches to return `Result<T, ValidationErrors>`; the throwing branches become thin wrappers that destructure the Result and throw on the error slot. All recursive helpers in `src/validators/schema/helpers/validate/*.ts` drop their `mustNotThrowCtx` parameter and unwrap `Result` tuples directly. `ValidateReturn<T>` becomes a `@deprecated` alias for `Result<T, ValidationErrors>`, slated for 0.10.0 removal.

**Tech Stack:** TypeScript 7.0.2 (strict mode), Vitest, Biome (lint only), Prettier (formatting), Yarn 1.x (classic), ESM + CJS dual build.

**Spec:** [`docs/superpowers/specs/2026-07-10-validator-result-return-design.md`](../specs/2026-07-10-validator-result-return-design.md)

**Branch / PR:**

- Worktree: `.worktree/validator-result` branched off `release/0.9.0` (which itself branches from `origin/master`).
- Feature branch: `feat/validator-result`.
- PR base: `release/0.9.0`.
- PR title: `feat(validator)!: no-throw branch returns Result<T, ValidationErrors>`.

**Pre-implementation setup (do once, before Task 1):**

```sh
# 1. From the main repo checkout (NOT a worktree), fetch master
git fetch origin master

# 2. Create the release branch on origin (branches from origin/master)
git push origin origin/master:refs/heads/release/0.9.0

# 3. Create the worktree + feature branch from release/0.9.0
git worktree add .worktree/validator-result -b feat/validator-result origin/release/0.9.0

# 4. Enter the worktree and install dependencies
cd .worktree/validator-result
yarn install  # triggers prepare → sets up git hooks. Do nothing else until this finishes.
```

All subsequent commands in this plan assume the working directory is `.worktree/validator-result` (the worktree root), unless explicitly noted.

**File map (overview):**

| File | Action | Responsibility |
|---|---|---|
| `src/validators/helpers/result.ts` | **Create** | `ok`/`err` constructors, `isOk`/`isErr` type guards with runtime shape enforcement via `assertResultShape`. Leaf module importing only `Result` type. |
| `src/validators/__tests__/result-helpers.spec.ts` | **Create** | Vitest unit tests for the four helpers (constructors, narrowing, shape-violation throws). |
| `src/validators/SchemaValidator.ts` | **Modify** | Drop `throws` symbol + `setThrows`/`mustNotThrow`/`shouldThrow`/`defaults`/`DefaultThrowsParam`; rewrite private `validate()` to return `Result`; update static & instance `validate()` overloads + bodies; update `ISchemaValidator`/`ISchemaValidatorConstructor` types. |
| `src/validators/schema/helpers/validate/validateObject.ts` | **Modify** | Drop `mustNotThrowCtx` param; unwrap `Result` tuples instead of `instanceof ValidationErrors` filters in `validateObjectTree`/`validateObjectEntries`; wrap missing-key `ValidationErrors` as `Result` for array homogeneity. |
| `src/validators/schema/helpers/validate/validateRecord.ts` | **Modify** | Drop `mustNotThrowCtx`; tuple-unwrap in `validateRecordEnumKeys` flatMap and `validateRecordKeyEntry`. |
| `src/validators/schema/helpers/validate/validateDefault.ts` | **Modify** | Drop `mustNotThrowCtx`; tuple-unwrap in `validateDefaultTuple`/`validateDefaultEnum` (including multi-match counting). |
| `src/validators/schema/helpers/validate/validateUnion.ts` | **Modify** | Drop `mustNotThrowCtx`; tuple-unwrap. Drop `e !== ctx.arg` identity filter. |
| `src/validators/schema/helpers/validate/validateIntersection.ts` | **Modify** | Drop `mustNotThrowCtx`; tuple-unwrap. Drop `e !== ctx.arg` identity filter. |
| `src/validators/schema/helpers/validate/validateWithoutMetadata.ts` | **Unchanged** | Body unchanged; no recursive calls; takes only `ctx`. |
| `src/validators/schema/helpers/validate/ValidationContext.ts` | **Unchanged** | The `mustNotThrowCtx` was never on this type. |
| `src/validators/schema/helpers/validate/index.ts` | **Unchanged** | Re-exports. |
| `src/validators/types/ValidateReturn.ts` | **Modify** | Replace body with `@deprecated` alias `export type ValidateReturn<T> = Result<T, ValidationErrors>`. |
| `src/validators/schema/types/FluentSchema.ts` | **Modify** | Replace 2 `validator()` overloads with 3; no-throw branch typed as `Result<T, ValidationErrors>`. Add `Result` import, drop `ValidateReturn` import. |
| `src/validators/schema/types/FluentOptionalSchema.ts` | **Modify** | Same shape with `T` → `undefined \| T` on success; also fixes existing `.validate`-type inconsistency on the `false` overload. |
| `src/validators/standard-schema/attachStandardSchema.ts` | **Modify** | Drop `shouldThrow` from `SchemaValidateCallback` type (callers always pass `false`); update `attachStandardSchema`'s `validate` invocation to call the callback with no third arg. |
| `src/validators/standard-schema/registerValidateCallback.ts` | **Modify** | Switch callback body from `instanceof ValidationErrors` check to `Result` tuple destructor. Drop `shouldThrow` param. |
| `src/validators/index.ts` | **Modify** | Add `export { ok, err, isOk, isErr } from './helpers/result.ts'`. |
| `src/helpers/Experimental/run.ts` | **Modify** | Swap inline `[null, value] as SucessfulResult` → `ok(value)` and `[error, null] as ErrorResult` → `err(error as Error)`. Drop now-unused `SucessfulResult`/`ErrorResult` imports. |
| `src/helpers/__tests__/run.spec.ts` | **Unchanged** | Test uses tuple-destructure externally; courtesy swap is internal-only. |
| `src/validators/__tests__/SchemaValidator.spec.ts` | **Modify** | Migrate `instanceof ValidationErrors` checks / `as ValidationErrors` chains to tuple destructors at lines 76-81, 131-141, 143-152, 192-197, 385-389. |
| `src/validators/__tests__/[...schemas].validator.spec.ts` | **Modify** | Migrate 2 `expect(...).toBeInstanceOf(ValidationErrors)` against `.validator(false)` to tuple-destructure + slot[0] check (lines 82, 103). |
| `src/validators/schema/types/__tests__/GetSchema.spec.ts` | **Unchanged** | Imports `ValidateReturn`; the alias still compiles. Zero changes. |
| `README.md` | **Modify** | Update `Schema.validator` example (lines 509-528); add `ok`/`err`/`isOk`/`isErr` subsection under "Util types — Result" (lines 776-787). |

**Task decomposition rationale:**

- Tasks 1-2 set up the new `result.ts` helpers + unit tests **first**, in isolation, so the rest of the refactor can lean on `ok`/`err`/`isErr` instead of ad-hoc tuple checks.
- Task 3 flips `ValidateReturn<T>` to the deprecation alias — purely a type change, low blast radius.
- Task 4-5 update the per-helper `validate*.ts` files (object first because it has the missing-key branch wrinkle; then record/default/union/intersection).
- Task 6 is the main `SchemaValidator.ts` refactor — depends on the helpers being ready (Tasks 4-5) and on the deprecation alias (Task 3).
- Task 7 updates the `FluentSchema`/`FluentOptionalSchema` type signatures to match what Task 6 produces.
- Task 8 migrates the Standard Schema callback (depends on Task 6 producing `Result`-shaped static `validate`).
- Task 9 is the courtesy `run.ts` swap.
- Tasks 10-11 update existing tests to destructure `Result` tuples.
- Task 12 updates the README.
- Task 13 is the final verification gate: lint, typecheck, build, circular-deps, full test suite.

**Commit cadence:** each Task ends with a commit. Tasks are sequential; do not parallelize. Commit messages use Conventional Commits. Author identity must be confirmed with the user before the first commit (per AGENTS.md). All commits GPG-signed (`-S`).

---

### Task 1: Add `ok`/`err`/`isOk`/`isErr` helpers in `src/validators/helpers/result.ts`

This task creates the new helpers module and its unit tests in one commit. The helpers don't depend on any of the validator internals — they're pure functions operating on the generic `Result<TValue, TError>` tuple type from `src/types/Result.ts`. This means we can write them and their tests in isolation before touching the validator core.

**Files:**

- Create: `src/validators/helpers/result.ts`
- Create: `src/validators/__tests__/result-helpers.spec.ts`

- [ ] **Step 1.1: Write the failing test file**

Create `src/validators/__tests__/result-helpers.spec.ts` with:

```typescript
import { describe, expect, it } from 'vitest'

import { string } from '../schema/string.ts'
import type { Result } from '../../types/Result.ts'
import { ValidationError } from '../ValidationError.ts'
import { ValidationErrors } from '../ValidationErrors.ts'
import { err, isErr, isOk, ok } from '../helpers/result.ts'

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

    describe('composition with validators', () => {
        it('isOk narrows successful no-throw validator result', () => {
            const validate = string().min(3).validator(false)
            const pass = validate('foo')
            if (isOk(pass)) expect(pass[1]).toBe('foo')
            else throw new Error('expected success')
        })
        it('isErr narrows failed no-throw validator result', () => {
            const validate = string().min(3).validator(false)
            const fail = validate('ab')
            if (isErr(fail)) {
                expect(fail[0]).toBeInstanceOf(ValidationErrors)
            } else {
                throw new Error('expected failure')
            }
        })
    })
})
```

Note: the "composition with validators" describe block at the bottom will initially fail because the public validator interface still returns the bare union — the helpers expect a `Result` tuple. Once the validator refactor lands (Task 6), these tests will pass. For now, write them in but expect them to fail until Task 6 lands. (Alternative: comment them out until Task 6, then re-enable as part of Task 11. Decision: keep them written and failing here, so the design intent is captured in code from Day 1, and the validator-composition assertions live alongside the helper spec rather than scattered.)

Wait — this will block the green-build at the end of Task 1. Reconsider: write the composition tests only in Task 11 (after Task 6 lands). For now, omit them. The describe block above can include a TODO-commented stub:

```typescript
// TODO(Task 11): composition-with-validators tests will land after Task 6
// (validator refactor) produces Result-returning no-throw branches.
```

Replace the `composition with validators` describe block in the spec file with that TODO comment for Task 1.

- [ ] **Step 1.2: Run the test to verify it fails (helpers not yet implemented)**

Run: `yarn vitest run src/validators/__tests__/result-helpers.spec.ts`
Expected: FAIL. Error along the lines of "Failed to resolve import '../helpers/result.ts'" (the module doesn't exist yet).

- [ ] **Step 1.3: Write the implementation**

Create `src/validators/helpers/result.ts` with:

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
): result is [TError, null] {
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

    if (!(errSlot === null || errSlot instanceof Error)) {
        throw new TypeError(
            `Invalid Result shape: error slot must be null or an Error instance, got ${typeof errSlot}`
        )
    }

    if (errSlot instanceof Error && valSlot !== null) {
        throw new TypeError(
            'Invalid Result shape: error slot is an Error but value slot is not null — expected [Error, null]'
        )
    }
}
```

- [ ] **Step 1.4: Run the test to verify it passes**

Run: `yarn vitest run src/validators/__tests__/result-helpers.spec.ts`
Expected: PASS — all `describe` blocks except the TODO stub are green.

- [ ] **Step 1.5: Verify typecheck, lint, format**

Run: `yarn tsc -p tsconfig.json --noEmit`
Expected: PASS (no type errors; the new file imports a type-only `Result`, has no consumers yet).

Run: `yarn check:fix`
Expected: PASS (Biome + Prettier may rewrite the file; if they do, the changes are auto-applied).

- [ ] **Step 1.6: Commit**

Confirm git author identity with user before the first commit (per AGENTS.md: `git config user.name` and `git config user.email`; ensure not placeholder values like `Test`/`test@test.com`).

```sh
git add src/validators/helpers/result.ts src/validators/__tests__/result-helpers.spec.ts
git commit -S -m "feat(validator): add ok/err/isOk/isErr Result helpers

Add src/validators/helpers/result.ts with tuple-Result constructors
(ok/err) and type-narrowing type guards (isOk/isErr) that strictly
enforce Result-shape invariants at runtime: tuple length 2, error slot
must be null|Error, mutual exclusivity between error and value slots.
[null, null] is a valid success (Result<null, Error>).

Tests in src/validators/__tests__/result-helpers.spec.ts cover
constructors, happy-path narrowing for both branches, structural
violations (non-array, wrong length), error-slot violations (non-null
non-Error), mutual-exclusivity violations, and a TODO stub for
validator-composition tests that will land after Task 6.

No validator-refactor changes yet — the helpers operate on the generic
Result<TValue, TError> tuple type from src/types/Result.ts and are
independent of the validator internals.

Refs spec: docs/superpowers/specs/2026-07-10-validator-result-return-design.md"
```

If the pre-commit hook reformats the files (likely — it runs Prettier), **re-stage and re-commit the formatting in a follow-up commit** (per AGENTS.md):

```sh
git add -u  # stage the hook's formatting changes
git commit -S -m "style(validator): apply precommit formatting to result helpers"
```

---

### Task 4: Refactor `validate()` to return `Result` — atomic big-bang across `SchemaValidator.ts` + all schema helpers

**Why this task is intentionally large (atomic):** The private `validate()` function declares its return type. All recursive call sites in `validateObject.ts`/`validateRecord.ts`/`validateDefault.ts`/`validateUnion.ts`/`validateIntersection.ts` then destructure that return. If we change the return type without simultaneously updating all the unwrap sites, the helpers silently stop matching errors — `instanceof ValidationErrors` checks against the *second slot* of a `Result` tuple always return `false` because the second slot of an error tuple is `null`. Silent test failure is worse than a broken build, so this task flips the entire dependency closure at once. Steps 4.1 through 4.7 mutate the files; step 4.8 verifies the whole thing typechecks and runs.

**Files:**

- Modify: `src/validators/SchemaValidator.ts`
- Modify: `src/validators/schema/helpers/validate/validateObject.ts`
- Modify: `src/validators/schema/helpers/validate/validateRecord.ts`
- Modify: `src/validators/schema/helpers/validate/validateDefault.ts`
- Modify: `src/validators/schema/helpers/validate/validateUnion.ts`
- Modify: `src/validators/schema/helpers/validate/validateIntersection.ts`
- Modify: `src/validators/standard-schema/registerValidateCallback.ts`
- Modify: `src/validators/standard-schema/attachStandardSchema.ts`

- [ ] **Step 4.1: Rewrite `validate()` in `SchemaValidator.ts`**

Current `src/validators/SchemaValidator.ts` opens (lines 28-51) with the throws machinery:

```typescript
type ValidateOptionalArgs<Name extends string = string, Parent = any> = {
    name?: Name
    parent?: Parent
}

const defaults = {
    get throws() {
        return true
    },
} as const
type DefaultThrowsParam = (typeof defaults)['throws']

const throws = Symbol.for('[@srhenry/type-utils]:/validators/SchemaValidator/__throws__')

const shouldThrow = (subject: unknown): boolean =>
    getMetadata(
        throws,
        subject,
        asTypeGuard<boolean>(e => typeof e === 'boolean')
    ) ?? defaults.throws

const mustNotThrow = <T>(subject: T = {} as T) => setThrows(false, subject)

const setThrows = <T>(value: boolean, subject: T = {} as T) => setMetadata(throws, value, subject)
```

Delete lines 33-51 (the `defaults`/`DefaultThrowsParam`/`throws` symbol/`shouldThrow`/`mustNotThrow`/`setThrows` block). Keep `ValidateOptionalArgs` (lines 28-31) unchanged.

Also remove the now-unused imports: `getMetadata`, `asTypeGuard`, `setMetadata`. Locate the value-imports block (lines 9-15):

```typescript
import { asTypeGuard } from '../TypeGuards/helpers/asTypeGuard.ts'
import { getMetadata } from '../TypeGuards/helpers/getMetadata.ts'
import { getStructMetadata } from '../TypeGuards/helpers/getStructMetadata.ts'
import { hasStructMetadata } from './schema/helpers/hasStructMetadata.ts'
import { setMetadata } from '../TypeGuards/helpers/setMetadata.ts'
import { setValidatorMessage } from '../TypeGuards/helpers/setValidatorMessage.ts'
import { setValidatorMessageFormator } from '../TypeGuards/helpers/setValidatorMessageFormator.ts'
```

Remove lines 9 (`asTypeGuard`), 10 (`getMetadata`), and 13 (`setMetadata`). Keep `getStructMetadata`, `hasStructMetadata`, `setValidatorMessage`, `setValidatorMessageFormator`. Final imports (lines 9-13 in the new numbering):

```typescript
import { getStructMetadata } from '../TypeGuards/helpers/getStructMetadata.ts'
import { hasStructMetadata } from './schema/helpers/hasStructMetadata.ts'
import { setValidatorMessage } from '../TypeGuards/helpers/setValidatorMessage.ts'
import { setValidatorMessageFormator } from '../TypeGuards/helpers/setValidatorMessageFormator.ts'
```

Now rewrite the `validate` function (current lines 94-179). Locate the existing overloads + impl. Replace the entire block from line 94 (`function validate<T>(arg: unknown, schema: TypeGuard<T>): ValidateReturn<T>`) through line 179 (closing `}` of the impl function).

New `validate` function (replace the whole block):

```typescript
function validate<T>(arg: unknown, schema: TypeGuard<T>): Result<T, ValidationErrors>
function validate<T, Name extends string = string, Parent = any>(
    arg: unknown,
    schema: TypeGuard<T>,
    options: ValidateOptionalArgs<Name, Parent>
): Result<T, ValidationErrors>
function validate<T, Name extends string, Parent>(
    arg: unknown,
    schema: TypeGuard<T>,
    name: Name,
    parent: Parent
): Result<T, ValidationErrors>

function validate<T, Name extends string, Parent>(
    arg: unknown,
    schema: TypeGuard<T>,
    name_or_options?: Name | ValidateOptionalArgs<Name, Parent>,
    parent: Parent | NO_PARENT = NO_PARENT
): Result<T, ValidationErrors> {
    const metadata = getStructMetadata(schema) as V3.StructType
    const errors: ValidationError[] = []
    let name: Name | undefined
    ;({ name, parent = NO_PARENT } =
        typeof name_or_options === 'string' ? { name: name_or_options } : (name_or_options ?? {}))

    if (parent === NO_PARENT) name ??= '$' as Name

    const pushNewError = pushNewErrorFactory(errors, { schema, value: arg, name, parent })

    const baseCtx = {
        arg,
        schema,
        name,
        parent,
        errors,
        pushNewError,
    }

    if (!hasStructMetadata(schema)) {
        validateWithoutMetadata({ ...baseCtx, metadata })
    } else {
        switch (metadata.type) {
            case 'object':
                validateObject(
                    { ...baseCtx, metadata: metadata as V3.ObjectStruct<any> },
                    validate
                )
                break
            case 'record':
                validateRecord(
                    { ...baseCtx, metadata: metadata as V3.RecordStruct<string, any> },
                    validate
                )
                break
            case 'intersection':
                validateIntersection(
                    { ...baseCtx, metadata: metadata as V3.IntersectionStruct<any[]> },
                    validate
                )
                break
            case 'union':
                validateUnion(
                    { ...baseCtx, metadata: metadata as V3.UnionStruct<any[]> },
                    validate
                )
                break
            default:
                validateDefault({ ...baseCtx, metadata }, validate)
        }
    }

    if (errors.length > 0) return [new ValidationErrors(errors), null]

    return [null, arg as T]
}
```

Key differences from the old impl:

- No `this: unknown` parameter
- No `const throws = shouldThrow(this)` line
- Return type is `Result<T, ValidationErrors>`, not `ValidateReturn<T>`
- Dispatch calls no longer pass `mustNotThrow()` as the third argument — only `validate` is passed (the recursion function)
- Bottom returns `[new ValidationErrors(errors), null]` for failure and `[null, arg as T]` for success

- [ ] **Step 4.2: Update `ValidateFn` type and `ValidateOptionalArgs` in `SchemaValidator.ts`**

Wait — `ValidateFn` is defined inside each helper file (it's not centralized in `SchemaValidator.ts`). The `ValidateOptionalArgs` type stays. Skip this step.

But: smuggling the `validate` function through to the helpers as `ValidateFn` requires updating each helper's `ValidateFn` signature. Let's do that as part of Step 4.3-4.7 below.

- [ ] **Step 4.3: Refactor `validateObject.ts`**

Open `src/validators/schema/helpers/validate/validateObject.ts`. Locate the `ValidateFn` type alias (line 14):

```typescript
type ValidateFn = (this: unknown, arg: unknown, schema: TypeGuard<any>, ...args: any[]) => unknown
```

Replace with:

```typescript
type ValidateFn = (
    arg: unknown,
    schema: TypeGuard<any>,
    ...args: any[]
) => Result<unknown, ValidationErrors>
```

Add the necessary imports. The file currently imports `TypeGuard`, `V3`, `ValidationContext` (type), plus runtime imports. Add `Result`:

```typescript
import type { Result } from '../../../../types/Result.ts'
```

Update `validateObject`'s signature (lines 16-20). Drop `mustNotThrowCtx`:

```typescript
// Before:
export function validateObject(
    ctx: ValidationContext,
    validate: ValidateFn,
    mustNotThrowCtx: unknown
): void {

// After:
export function validateObject(ctx: ValidationContext, validate: ValidateFn): void {
```

Inside `validateObject`, the dispatch lines (lines 41-58) currently call `validateObjectTree(ctx, metadata, validate, mustNotThrowCtx)` and `validateObjectEntries(ctx, metadata, validate, mustNotThrowCtx)`. Drop the third arg:

```typescript
if ('tree' in metadata) {
    validateObjectTree(ctx, metadata as V3.ObjectStruct<any>, validate)
} else if ('entries' in metadata) {
    validateObjectEntries(ctx, metadata as V3.ArrayStruct<any>, validate)
} else {
    ctx.pushNewError({ ... })
}
```

Update `validateObjectTree` (lines 65-146). Drop `mustNotThrowCtx` from the signature (line 68-70). Inside the `Object.entries(tree).map` building `results` (lines 90-131), change every `validate.bind(mustNotThrowCtx)(...)` call to plain `validate(...)`. Two sites at lines 100-110 and similar.

The missing-key branch (lines 115-130) currently returns:

```typescript
return [
    schema,
    new ValidationErrors([
        new ValidationError({ ... }),
    ]),
]
```

Change it to wrap in a `Result`:

```typescript
return [
    schema,
    [new ValidationErrors([new ValidationError({ ... })]), null] as Result<unknown, ValidationErrors>,
]
```

The successful-key branch (lines 100-110) currently returns:

```typescript
return [
    schema,
    validate.bind(mustNotThrowCtx)(
        (ctx.arg as Record<string, unknown>)[k],
        schema,
        [ctx.name, k].filter(Boolean).join('.'),
        ctx.arg
    ),
]
```

Change to:

```typescript
return [
    schema,
    validate(
        (ctx.arg as Record<string, unknown>)[k],
        schema,
        [ctx.name, k].filter(Boolean).join('.'),
        ctx.arg
    ),
]
```

The optional-key branch returns `[schema, void 0]` (line 113) — change to `[schema, [null, void 0] as Result<unknown, ValidationErrors>]` for homogeneity. (Or, leave as `[schema, void 0]` and widen the downstream filter to handle both — but the homogeneous version is cleaner.)

The downstream filter at lines 133-145 currently:

```typescript
results
    .filter((result): result is [any, ValidationErrors] => {
        const [, item] = result
        return (
            item instanceof ValidationErrors ||
            (Array.isArray(item) &&
                item.every(predicate => predicate instanceof ValidationError))
        )
    })
    .forEach(result => {
        const e = result[1]
        ctx.errors.push(...e.errors)
    })
```

Replace with the uniform tuple-unwrap:

```typescript
for (const [, r] of results) {
    const [err] = r as Result<unknown, ValidationErrors>
    if (err) ctx.errors.push(...err.errors)
}
```

This works because `r` is now always a `Result<unknown, ValidationErrors>` — the optional, value, and missing-key branches all wrap into the tuple shape. The successful branch's `r` is `[null, value]`, so `err === null` and the `if (err)` short-circuits.

Update `validateObjectEntries` (lines 148-176). Drop `mustNotThrowCtx` from signature. The `.map` building `results` at lines 167-172 currently:

```typescript
const results = ctx.arg.map((item, i) =>
    validate.bind(mustNotThrowCtx)(item, entries.schema, {
        name: buildPath(ctx.name, `[${i}]`),
        parent: ctx.arg,
    })
)

results.filter(isInstanceOf(ValidationErrors)).forEach(item => {
    ctx.errors.push(...item)
})
```

Replace with:

```typescript
const results = ctx arg.map((item, i) =>
    validate(item, entries.schema, {
        name: buildPath(ctx.name, `[${i}]`),
        parent: ctx.arg,
    })
)

for (const r of results) {
    const [err] = r as Result<unknown, ValidationErrors>
    if (err) ctx.errors.push(...err.errors)
}
```

The `isInstanceOf` import becomes unused; remove it from imports if no other use remains in the file. Search and confirm: `isInstanceOf` appears once in `validateObject.ts` at line 6 import and only once at line 174 in usage. Remove from both.

- [ ] **Step 4.4: Refactor `validateRecord.ts`**

Open `src/validators/schema/helpers/validate/validateRecord.ts`. Update the `ValidateFn` type (line 16) and add the `Result` import, same pattern as step 4.3.

Update four function signatures — `validateRecord`, `validateRecordEnumKeys`, `validateRecordPropertyKeys`, `validateRecordKeyEntry` — drop the `mustNotThrowCtx: unknown` parameter from each.

`validateRecordEnumKeys` (lines 88-130): the `ownKeys.flatMap(k => [validate.bind(mustNotThrowCtx)(...key call...), validate.bind(mustNotThrowCtx)(...value call...)])` becomes `ownKeys.flatMap(k => [validate(...key call...), validate(...value call...)])` (drop `.bind(mustNotThrowCtx)`).

The post-flatMap filter (line 128):

```typescript
.filter(isInstanceOf(ValidationErrors))
.flatMap(validationErrors => validationErrors.errors)
```

Replace with:

```typescript
.flatMap((r): ValidationError[] => {
    const [err] = r as Result<unknown, ValidationErrors>
    return err ? Array.from(err.errors) : []
})
```

Note: `Array.from(err.errors)` because `ValidationErrors.errors` is a getter that itself drains an internal generator. Need to confirm that draining it via `Array.from` is safe (currently in the old code: `validationErrors.errors` returns the array, then `flatMap` spreads it). `Array.from(err.errors)` should match that semantics — it drains the getter once.

`validateRecordKeyEntry` (lines 219-271): two `validate.bind(mustNotThrowCtx)(...)` calls at lines 244-251 and 259-265 become plain `validate(...)`. The `instanceof ValidationErrors` checks at lines 253-255 and 267-270 transition to destructure-and-check:

```typescript
const keyResult = validate(keyForValidation, keyMetadata.schema, {
    name: buildPath(ctx.name, config.formatKeyName(k)),
    parent: ctx.arg,
})
const [keyErr] = keyResult as Result<unknown, ValidationErrors>
if (keyErr) ctx.errors.push(...(keyErr.errors as ValidationError<any, any>[]))

const valueResult = validate(
    (ctx.arg as Record<PropertyKey, unknown>)[k],
    valueMetadata.schema,
    {
        name: buildPath(ctx.name, config.formatValueName(k)),
        parent: ctx.arg,
    }
)
const [valueErr] = valueResult as Result<unknown, ValidationErrors>
if (valueErr) ctx.errors.push(...(valueErr.errors as ValidationError<any, any>[]))
```

The existing `recordKeyValidationResult !== keyForValidation && instanceof ValidationErrors` identity check drops — `Result` tuples are never identity-equal to the input value.

Confirm `ValidationError` is imported (currently it's `import type { ValidationError }` at line 11). It is — keep that import.

The `isInstanceOf` import becomes unused if no other uses in this file remain. Search: `isInstanceOf` appears at line 7 import, line 128 usage (already replaced), line 254 and 268-269 usages (also replaced). Remove the import if grep confirms no remaining calls.

- [ ] **Step 4.5: Refactor `validateDefault.ts`**

Open `src/validators/schema/helpers/validate/validateDefault.ts`. Update `ValidateFn` type (line 17). Add `Result` import (Note: the path is `../../../../types/Result.ts`).

Drop `mustNotThrowCtx` from `validateDefault` (line 19-23), `validateDefaultInner` (line 41-45), `validateDefaultTuple` (line 134-138), `validateDefaultEnum` (line 182-186).

Inside `validateDefault` (lines 26-38), the recursive call `validateDefaultInner(ctx, validate, mustNotThrowCtx)` becomes `validateDefaultInner(ctx, validate)`.

Inside `validateDefaultInner`, the recursive branches `validateDefaultTuple(ctx, validate, mustNotThrowCtx)` and `validateDefaultEnum(ctx, validate, mustNotThrowCtx)` drop the third arg.

Inside `validateDefaultTuple` (lines 134-180), the `validate.bind(mustNotThrowCtx)(arg[i], innerStruct.schema, \`${ctx.name}[<tuple>.at{${i}}>]\`, ctx.parent)` becomes `validate(arg[i], innerStruct.schema, \`${ctx.name}[<tuple>.at{${i}}>]\`, ctx.parent)`. The downstream `.filter(isInstanceOf(ValidationErrors)).forEach((innerErrors: ValidationErrors) => { ctx.errors.push(...innerErrors) })` becomes:

```typescript
.forEach((r: Result<unknown, ValidationErrors>) => {
    const [err] = r
    if (err) ctx.errors.push(...err)
})
```

Inside `validateDefaultEnum` (lines 182-222), the recursive `.map` building `enumResults` (lines 202-208) drops `.bind(mustNotThrowCtx)`. The `enumResults.filter(isInstanceOf(ValidationErrors)).length` computation (line 209) becomes:

```typescript
const enumErrors = enumResults.filter(
    (r): r is [ValidationErrors, null] => (r as Result<unknown, ValidationErrors>)[0] !== null
)
const enumErrorCount = enumErrors.length
```

The existing `if (enumResults.length - enumErrorCount > 1) throw new TypeError('Invalid Enum State! Multiple matches found!')` keeps its semantics: `enumResults.length - enumErrorCount` is the count of success branches (>1 = multiple matches, programming error). Keep that check verbatim.

The all-fail branch (lines 214-221) `if (enumErrorCount === enumResults.length) ctx.pushNewError({...})` stays.

`isInstanceOf` import: search for remaining uses — line 8 import, line 176 and 209 usages (both replaced). Remove the import.

- [ ] **Step 4.6: Refactor `validateUnion.ts` and `validateIntersection.ts`**

Both files follow the same pattern. Update `ValidateFn`, add `Result` import, drop `mustNotThrowCtx`.

**`validateUnion.ts`** (lines 11-61):

The `.map` building `unionResults` at lines 22-33: drop `.bind(mustNotThrowCtx)`. The downstream `.filter(isInstanceOf(ValidationErrors)).filter(e => e !== ctx.arg)` at lines 45-47 becomes:

```typescript
const unionErrors = unionResults.filter(
    (r): r is [ValidationErrors, null] => (r as Result<unknown, ValidationErrors>)[0] !== null
)
```

The `.filter(e => e !== ctx.arg)` is dropped entirely (the tuple is never identity-equal to `ctx.arg`). The `unionErrorList = unionErrors.flatMap(e => Array.from(e))` at line 50 becomes:

```typescript
const unionErrorList = unionErrors.flatMap(([, r0]) => Array.from(r0 ? [] : []))
```

Wait — `Array.from(e)` where `e` was a `ValidationErrors` iterates the errors. The new shape has `[err, null]` so we want `Array.from(err)` — let me reword:

```typescript
const unionErrorList = unionErrors.flatMap(([err]) => Array.from(err))
```

The current `Array.from(e)` iterates `ValidationErrors[Symbol.iterator]()` (defined in `ValidationErrors.ts:38-40` to return `errors[Symbol.iterator]()`). The new `Array.from(err)` (where `err: ValidationErrors`) does the same thing — works.

The all-fail branch (lines 49-60) stays.

`isInstanceOf` import removal: search — line 5 import, line 46 usage. Remove if no other uses.

**`validateIntersection.ts`** (lines 11-70):

Drop `.bind(mustNotThrowCtx)` at line 31. The filter at lines 47-49 is the same pattern:

```typescript
const intersectionErrors = intersectionResults.filter(
    (r): r is [ValidationErrors, null] => (r as Result<unknown, ValidationErrors>)[0] !== null
)
```

The `.filter(e => e !== ctx.arg)` drops.

`metadata.types.filter((_, i) => intersectionResults.map(r => ...).filter(([, r]) => r[0] !== null).map(([idx]) => idx).includes(i))` at lines 58-64 is rewritten cleanly:

```typescript
const failingIndexes = intersectionResults
    .map((r, idx) => [idx, r] as const)
    .filter(([, r]) => (r as Result<unknown, ValidationErrors>)[0] !== null)
    .map(([idx]) => idx)

const contextTypes = metadata.types.filter((_, i) => failingIndexes.includes(i))
```

Then the `pushNewError` and `ctx.errors.push` statements use `contextTypes` and `intersectionErrorList` as today.

`isInstanceOf` import removal: search — line 5 import, line 48 usage. Remove.

- [ ] **Step 4.7: Update public wrappers in `SchemaValidator.ts`**

In `src/validators/SchemaValidator.ts`, update the `__SchemaValidator` class's static `validate()` method (lines 217-225):

```typescript
// Before:
public static validate<T>(
    arg: unknown,
    schema: TypeGuard<T>,
    shouldThrow: boolean = defaults['throws']
): ValidateReturn<T> {
    return validate.bind(setThrows(shouldThrow))(arg, schema)
}

// After:
public static validate<T>(
    arg: unknown,
    schema: TypeGuard<T>,
    shouldThrow: boolean = true
): T | Result<T, ValidationErrors> {
    const result = validate(arg, schema)
    if (shouldThrow) {
        const [err, val] = result
        if (err) throw err
        return val as T
    }
    return result
}
```

The `NO_PARENT` symbol and `pushNewErrorFactory` stay; everything else in the class is unchanged except the instance `validate()` method (lines 287-296):

```typescript
// Before:
@AutoBind()
public validate<V>(value: V, shouldThrow: boolean = this.throws): T | ValidationErrors {
    return validate.bind(setThrows(shouldThrow))(value, this.schema)
}

// After:
@AutoBind()
public validate<V>(value: V, shouldThrow: boolean = this.throws): T | Result<T, ValidationErrors> {
    const result = validate(value, this.schema)
    if (shouldThrow) {
        const [err, val] = result
        if (err) throw err
        return val as T
    }
    return result
}
```

The `throws` field on the class (line 214) stays — still used to track the per-instance default.

The overload type declarations on the class (lines 287-291):

```typescript
public validate<V>(value: V): T | Throws extends true ? never : ValidationErrors
public validate<V>(value: V, shouldThrow: true): T
public validate<V>(value: V, shouldThrow: false): T | ValidationErrors
public validate<V>(value: V, shouldThrow: boolean): T | ValidationErrors
```

Replace with:

```typescript
public validate<V>(value: V): T
public validate<V>(value: V, shouldThrow: true): T
public validate<V>(value: V, shouldThrow: false): Result<T, ValidationErrors>
public validate<V>(value: V, shouldThrow: boolean): T | Result<T, ValidationErrors>
```

Wait — the existing `T | Throws extends true ? never : ValidationErrors` shape uses `Throws extends true ? never : ValidationErrors` to model "if this instance's `throws` is true (default), passing no-arg throws and returns never; otherwise returns ValidationErrors." After this refactor, the impl no-arg returns either `T` (if `this.throws=true`) or `Result` (if `this.throws=false`) — but TypeScript can't track `this.throws` at the type level accurately here. The simpler modeling is one overload per arg combination:

```typescript
public validate<V>(value: V): T | Result<T, ValidationErrors>  // ambiguous until boolean is passed
public validate<V>(value: V, shouldThrow: true): T
public validate<V>(value: V, shouldThrow: false): Result<T, ValidationErrors>
public validate<V>(value: V, shouldThrow: boolean): T | Result<T, ValidationErrors>
```

The first overload is the broadest. The middle two narrow based on literal `true`/`false`. The fourth matches `boolean` parameter type. Type resolution: the literal overloads win first.

Update the `ISchemaValidator<T, Throws>` type (lines 181-191):

```typescript
// Before:
type ISchemaValidator<T, Throws extends boolean = DefaultThrowsParam> = Merge<
    {},
    Throws extends true
        ? {
              validate<V>(value: V): T
          }
        : {
              validate<V>(value: V): T | ValidationErrors
          }
>

// After:
type ISchemaValidator<T, Throws extends boolean = true> = Merge<
    {},
    Throws extends true
        ? {
              validate<V>(value: V): T
          }
        : {
              validate<V>(value: V): Result<T, ValidationErrors>
          }
>
```

Default `Throws` becomes the literal `true` (no more `DefaultThrowsParam` indirection).

Update `ISchemaValidatorConstructor` (lines 193-201):

```typescript
// Before:
type ISchemaValidatorConstructor = {
    new <T>(schema: TypeGuard<T>): SchemaValidator<T, DefaultThrowsParam>
    new <T, Throws extends true>(schema: TypeGuard<T>, throws: Throws): SchemaValidator<T, true>
    new <T, Throws extends false>(schema: TypeGuard<T>, throws: Throws): SchemaValidator<T, false>
    new <T, Throws extends boolean>(
        schema: TypeGuard<T>,
        throws: Throws
    ): SchemaValidator<T, typeof throws>
}

// After:
type ISchemaValidatorConstructor = {
    new <T>(schema: TypeGuard<T>): SchemaValidator<T, true>
    new <T, Throws extends boolean>(
        schema: TypeGuard<T>,
        throws: Throws
    ): SchemaValidator<T, Throws>
}
```

Update the bottom const export type cast (lines 299-307):

```typescript
// Before:
export const SchemaValidator = __SchemaValidator as unknown as ISchemaValidatorConstructor & {
    validate<T>(arg: unknown, schema: TypeGuard<T>): T
    validate<T>(arg: unknown, schema: TypeGuard<T>, shouldThrow: true): T
    validate<T>(arg: unknown, schema: TypeGuard<T>, shouldThrow: false): ValidateReturn<T>
    validate<T>(arg: unknown, schema: TypeGuard<T>, shouldThrow: boolean): ValidateReturn<T>

    setValidatorMessage<T>(message: ValidatorMessageMap<T>, schema: TypeGuard<T>): TypeGuard<T>
    setValidatorMessage<T>(message: ValidatorMessageMap<T>): (schema: TypeGuard<T>) => TypeGuard<T>
}

// After:
export const SchemaValidator = __SchemaValidator as unknown as ISchemaValidatorConstructor & {
    validate<T>(arg: unknown, schema: TypeGuard<T>): T
    validate<T>(arg: unknown, schema: TypeGuard<T>, shouldThrow: true): T
    validate<T>(arg: unknown, schema: TypeGuard<T>, shouldThrow: false): Result<T, ValidationErrors>
    validate<T>(arg: unknown, schema: TypeGuard<T>, shouldThrow: boolean): T | Result<T, ValidationErrors>

    setValidatorMessage<T>(message: ValidatorMessageMap<T>, schema: TypeGuard<T>): TypeGuard<T>
    setValidatorMessage<T>(message: ValidatorMessageMap<T>): (schema: TypeGuard<T>) => TypeGuard<T>
}
```

`ValidateReturn` is no longer used in `SchemaValidator.ts`. Search for any remaining `ValidateReturn` references in `SchemaValidator.ts` and remove them. Specifically:

- Line 4 import: `import type { ValidateReturn } from './types/ValidateReturn.ts'`
- Line 7 re-export: `export type { ValidateReturn } from './types/ValidateReturn.ts'`

Decision: keep the re-export (`export type { ValidateReturn }`) so that anyone importing `ValidateReturn` from the old path keeps working — the alias itself lives in `src/validators/types/ValidateReturn.ts` and Task 7 will flip it. Drop the *type* import (line 4) only if no remaining usage in the file. Search confirms `ValidateReturn` is used only in the file's import (line 4), re-export (line 7), and the static `validate` overloads at lines 302-303 (which now use `Result` after Step 4.7). Drop the line 4 import; keep the line 7 re-export (still useful as a public-facing alias; Task 7 will flip the underlying type).

Final imports/exports header:

```typescript
import type { MessageFormator, TypeGuard } from '../TypeGuards/types/index.ts'
import type { Merge, Result } from '../types/index.ts'
import type { GenericStruct, V3 } from './schema/types/index.ts'
import type { ValidatorMessageMap } from './types/index.ts'

export type { ValidateReturn } from './types/ValidateReturn.ts'
```

- [ ] **Step 4.8: Update `registerValidateCallback.ts` and `attachStandardSchema.ts`**

`src/validators/standard-schema/registerValidateCallback.ts` — rewrite the callback to destructure `Result` directly. Current body (lines 9-34):

```typescript
registerSchemaValidateCallback(
    (value: unknown, guard, shouldThrow): StandardSchemaV1.Result<any> => {
        const result = SchemaValidator.validate(value, guard, shouldThrow)

        if (result instanceof ValidationErrors) {
            const issues: StandardSchemaV1.Issue[] = []

            for (const error of result.errors) {
                if (error instanceof ValidationError) {
                    issues.push({
                        message: error.message,
                        path: parsePathString(error.path),
                    })
                } else {
                    issues.push({
                        message: String(error),
                    })
                }
            }

            return { success: false, issues }
        }

        return { success: true, value: result }
    }
)
```

Replace with:

```typescript
registerSchemaValidateCallback(
    (value: unknown, guard): StandardSchemaV1.Result<any> => {
        const [err, val] = SchemaValidator.validate(value, guard, false)

        if (err) {
            const issues: StandardSchemaV1.Issue[] = []

            for (const error of err.errors) {
                if (error instanceof ValidationError) {
                    issues.push({
                        message: error.message,
                        path: parsePathString(error.path),
                    })
                } else {
                    issues.push({
                        message: String(error),
                    })
                }
            }

            return { success: false, issues }
        }

        return { success: true, value: val }
    }
)
```

The `shouldThrow` parameter drops from the callback signature; the call to `SchemaValidator.validate` passes `false` as a literal, so TypeScript narrows to the `Result` overload and the destructure `[err, val]` works without a cast.

In `src/validators/standard-schema/attachStandardSchema.ts`, update the `SchemaValidateCallback` type (lines 4-8) to drop `shouldThrow`:

```typescript
// Before:
type SchemaValidateCallback = (
    value: unknown,
    guard: TypeGuard<any>,
    shouldThrow: boolean
) => StandardSchemaV1.Result<any>

// After:
type SchemaValidateCallback = (value: unknown, guard: TypeGuard<any>) => StandardSchemaV1.Result<any>
```

And update the `validate` inner function (line 25) to drop the third arg:

```typescript
// Before:
return _schemaValidateCallback(value, guard, false) as StandardSchemaV1.Result<T>

// After:
return _schemaValidateCallback(value, guard) as StandardSchemaV1.Result<T>
```

The `as StandardSchemaV1.Result<T>` cast stays — the callback returns `StandardSchemaV1.Result<any>`, and the `validate` function's contract is `StandardSchemaV1.Result<T>`.

- [ ] **Step 4.9: Run typecheck**

Run: `yarn tsc -p tsconfig.json --noEmit`
Expected: PASS — all listed mutations should produce a clean compile. If errors appear, work through them one by one; expected failure cases:

- An unused `isInstanceOf` import that wasn't removed (Biome's `useImportType` will warn but not fail the build). Run `yarn check:fix` to clean these up.
- A missing `Result` import in one of the helper files. Add the import.
- An existing test (e.g. `SchemaValidator.spec.ts`) that references bare `ValidationErrors` returns — those still need migration (Tasks 9-10). Those should fail at typecheck only if they cast or destructure the return; if they use `instanceof ValidationErrors` checks against the return *without an explicit type annotation*, TS may not complain (the test code is untyped enough to survive). Verify by running the tests themselves.

- [ ] **Step 4.10: Run tests (expect failures in the migration sites)**

Run: `yarn test`
Expected: Some existing tests fail — specifically `SchemaValidator.spec.ts` (lines 76-81, 127-141, 192-197, 385-389) and `[...schemas].validator.spec.ts` (lines 82, 103). The new `result-helpers.spec.ts` should pass (helpers are independent of validator internals). The `standardSchema.spec.ts` and `standardSchemaCompleteness.spec.ts` should pass — the Standard Schema shape from `~standard.validate` is unchanged, only the internal mapping changes.

If `standardSchema*.spec.ts` tests fail, debug — the callback's tuple-destructure may have an issue (e.g. the cast came back as `T | null` where `T` is `unknown`, and `val` is `unknown` which is fine). Test failures here should pinpoint the issue.

- [ ] **Step 4.11: Run check:fix to clean up imports**

Run: `yarn check:fix`
Expected: PASS — removes unused `isInstanceOf` imports, applies prettier formatting.

- [ ] **Step 4.12: Commit**

This is one big commit — atomic by design.

```sh
git add src/validators/SchemaValidator.ts \
        src/validators/schema/helpers/validate/validateObject.ts \
        src/validators/schema/helpers/validate/validateRecord.ts \
        src/validators/schema/helpers/validate/validateDefault.ts \
        src/validators/schema/helpers/validate/validateUnion.ts \
        src/validators/schema/helpers/validate/validateIntersection.ts \
        src/validators/standard-schema/registerValidateCallback.ts \
        src/validators/standard-schema/attachStandardSchema.ts
git commit -S -m "refactor(validator)!: rewrite validate() to return Result<T, ValidationErrors>

BREAKING CHANGE: the private validate() in SchemaValidator.ts now
natively returns Result<T, ValidationErrors> tuples, removing the
Symbol.for('__throws__') metadata-toggling machinery (setThrows,
mustNotThrow, shouldThrow, defaults.throws, DefaultThrowsParam).

Throwing branches (SchemaValidator.validate(arg, schema),
schema.validator().validate(arg), default arg = true) keep their
current runtime semantics: throw ValidationErrors on failure, return
bare T on success. No-throw branches (shouldThrow=false) now return
Result<T, ValidationErrors> tuples instead of T | ValidationErrors
union — the success payload and error payload are no longer conflated
in a single type.

Internal helpers in src/validators/schema/helpers/validate/*.ts
(validateObject, validateRecord, validateDefault, validateUnion,
validateIntersection) drop their third 'mustNotThrowCtx' parameter
and unwrap Result tuples recursively instead of filtering via
'instanceof ValidationErrors'. Identity-equality filters ('e !== ctx.arg')
in union/intersection dispatchers drop because Result tuples are never
identity-equal to the input value.

registerValidateCallback drops its 'shouldThrow' parameter (Standard
Schema never wants thrown errors) and rewrites its body to destructure
the Result tuple instead of using 'instanceof ValidationErrors' against
the bare union.

Existing test failures in SchemaValidator.spec.ts and
[...schemas].validator.spec.ts are expected; migration is covered in
Tasks 9-10. ValidateReturn<T> deprecation alias flips in Task 7.

Refs spec: docs/superpowers/specs/2026-07-10-validator-result-return-design.md"
```

If pre-commit hook reformats, stage and commit formatting in a follow-up commit.

---

### Task 5: Flip `ValidateReturn<T>` to `@deprecated` alias for `Result<T, ValidationErrors>`

Now that the runtime produces `Result<T, ValidationErrors>` tuples (Task 4), update the public-facing type alias to match. Callers who imported `ValidateReturn<T>` to type-annotate their variables see the new tuple shape immediately.

**Files:**

- Modify: `src/validators/types/ValidateReturn.ts`

- [ ] **Step 5.1: Replace the file body**

Current `src/validators/types/ValidateReturn.ts` (lines 1-10):

```typescript
import type ValidationError from '../ValidationError.ts'
import type { ValidationErrors } from '../ValidationErrors.ts'

export type ValidateReturn<T> =
    | T
    | ValidationErrors<
          | ValidationError<unknown, T>
          | ValidationError<unknown, T[Extract<keyof T, string>], Extract<keyof T, string>, T>
          | ValidationError
      >
```

Replace the entire file contents with:

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

- [ ] **Step 5.2: Verify typecheck**

Run: `yarn tsc -p tsconfig.json --noEmit`
Expected: PASS. The `ValidationError` default import (formerly `import type ValidationError from '../ValidationError.ts'`) is removed from the alias file; the `ValidationErrors` import stays. Existing test files that import `ValidateReturn` (only `GetSchema.spec.ts` per spec audit) should still compile because the alias resolves to `Result<T, ValidationErrors>`.

- [ ] **Step 5.3: Run tests to catch any test-level breakage**

Run: `yarn vitest run src/validators/schema/types/__tests__/GetSchema.spec.ts`
Expected: PASS — the type projection test compiles against the alias, and the assertion at line 189 (`ValidateReturn<unknown>`) now resolves to `Result<unknown, ValidationErrors>` (functionally equivalent for the assertion).

- [ ] **Step 5.4: Commit**

```sh
git add src/validators/types/ValidateReturn.ts
git commit -S -m "refactor(types)!: ValidateReturn<T> is now a deprecated Result alias

BREAKING CHANGE: ValidateReturn<T> (previously the bare union
T | ValidationErrors<...>) is aliased to Result<T, ValidationErrors>.
Slated for removal in 0.10.0; callers should migrate to
Result<T, ValidationErrors> directly.

This aligns the public-facing type with the new runtime shape produced
by SchemaValidator.validate(arg, schema, false) and
schema.validator(false).validate(arg) since Task 4."
```

---

### Task 6: Update `FluentSchema` and `FluentOptionalSchema` type signatures

The `FluentSchema` and `FluentOptionalSchema` types declare the `validator()` overload signatures — these haven't been updated yet, so TypeScript currently sees the old `ValidateReturn<T>` shape (which after Task 5 *is* `Result<T, ValidationErrors>` via the alias — so things compile). This task replaces the alias usages with direct `Result` references for clarity, fixes the existing `FluentOptionalSchema` `.validate`-type inconsistency on the `false` overload, and reorders the overloads for correct overload-resolution behavior.

**Files:**

- Modify: `src/validators/schema/types/FluentSchema.ts`
- Modify: `src/validators/schema/types/FluentOptionalSchema.ts`

- [ ] **Step 6.1: Update `FluentSchema.ts`**

Open `src/validators/schema/types/FluentSchema.ts`. Current imports (lines 1-7):

```typescript
import type { TypeGuard } from '../../../TypeGuards/index.ts'
import type { Fn, ThrowFn } from '../../../types/Func.ts'
import type { Custom } from '../../rules/types/index.ts'
import type { ValidateReturn } from '../../types/ValidateReturn.ts'
import type { ValidationErrors } from '../../ValidationErrors.ts'
import type { StandardSchemaV1 } from '../../standard-schema/types.ts'
import type { FluentOptionalSchema } from './FluentOptionalSchema.ts'
```

Drop the `ValidateReturn` import (line 4). Add a `Result` import:

```typescript
import type { TypeGuard } from '../../../TypeGuards/index.ts'
import type { Fn, ThrowFn } from '../../../types/Func.ts'
import type { Result } from '../../../types/Result.ts'
import type { Custom } from '../../rules/types/index.ts'
import type { ValidationErrors } from '../../ValidationErrors.ts'
import type { StandardSchemaV1 } from '../../standard-schema/types.ts'
import type { FluentOptionalSchema } from './FluentOptionalSchema.ts'
```

Update the `validator()` overloads (lines 27-32):

```typescript
// Before:
validator(throwOnError?: true): ThrowFn<ValidationErrors, [arg: unknown], T> & {
    validate: ThrowFn<ValidationErrors, [arg: unknown], T>
}
validator(throwOnError: boolean | false): Fn<[arg: unknown], ValidateReturn<T>> & {
    validate: Fn<[arg: unknown], ValidateReturn<T>>
}

// After (three overloads, ordered true → false → boolean):
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

- [ ] **Step 6.2: Update `FluentOptionalSchema.ts`**

Open `src/validators/schema/types/FluentOptionalSchema.ts`. Same import swap — drop `ValidateReturn` (line 4), add `Result`:

```typescript
import type { TypeGuard } from '../../../TypeGuards/index.ts'
import type { Fn, ThrowFn } from '../../../types/Func.ts'
import type { Result } from '../../../types/Result.ts'
import type { Custom } from '../../rules/types/index.ts'
import type { ValidationErrors } from '../../ValidationErrors.ts'
import type { StandardSchemaV1 } from '../../standard-schema/types.ts'
```

Update the `validator()` overloads (lines 26-34):

```typescript
// Before:
validator(throwOnError?: true): ThrowFn<ValidationErrors, [arg: unknown], undefined | T> & {
    validate: ThrowFn<ValidationErrors, [arg: unknown], undefined | T>
}
validator(throwOnError: false): Fn<[arg: unknown], ValidateReturn<undefined | T>> & {
    validate: ThrowFn<ValidationErrors, [arg: unknown], undefined | T>  // ← existing type bug
}
validator(throwOnError: boolean): Fn<[arg: unknown], ValidateReturn<undefined | T>> & {
    validate: Fn<[arg: unknown], ValidateReturn<undefined | T>>
}

// After (fixes the existing type bug on the false overload's .validate):
validator(throwOnError?: true): ThrowFn<ValidationErrors, [arg: unknown], undefined | T> & {
    validate: ThrowFn<ValidationErrors, [arg: unknown], undefined | T>
}
validator(throwOnError: false): Fn<[arg: unknown], Result<undefined | T, ValidationErrors>> & {
    validate: Fn<[arg: unknown], Result<undefined | T, ValidationErrors>>
}
validator(throwOnError: boolean): Fn<
    [arg: unknown],
    (undefined | T) | Result<undefined | T, ValidationErrors>
> & {
    validate: Fn<
        [arg: unknown],
        (undefined | T) | Result<undefined | T, ValidationErrors>
    >
}
```

- [ ] **Step 6.3: Verify typecheck and lint**

Run: `yarn tsc -p tsconfig.json --noEmit`
Expected: PASS. The dropping of `ValidateReturn` import resolves cleanly because the alias is still re-exported by `schema/types/index.ts:61`; the new direct `Result` import is what we use in the overload bodies.

Run: `yarn check:fix`
Expected: PASS — apply any Prettier reformatting.

- [ ] **Step 6.4: Verify tests still pass**

Run: `yarn test`
Expected: PASS — same set of failing tests as before (the migration sites in Tasks 9-10 still pending). The type-only changes in this task don't affect runtime behavior of the validators themselves.

- [ ] **Step 6.5: Commit**

```sh
git add src/validators/schema/types/FluentSchema.ts src/validators/schema/types/FluentOptionalSchema.ts
git commit -S -m "refactor(schema): FluentSchema/FluentOptionalSchema validator() overloads return Result

Replace the two validator() overloads on FluentSchema and
FluentOptionalSchema with three overloads each (true / false / boolean).
The no-throw branch returns Result<T, ValidationErrors> directly instead
of via the deprecated ValidateReturn alias.

Fixes an existing type inconsistency in FluentOptionalSchema where the
'false' overload's outer return was Fn<...> but the inner .validate
method was typed as ThrowFn<...> — both are now Fn<...>, consistent
with the no-throw contract."
```

---

### Task 7: Courtesy swap in `src/helpers/Experimental/run.ts`

Replace inline tuple construction with `ok`/`err` calls for internal consistency. This is a low-stakes cleanup that depends on Task 1's `result.ts`.

**Files:**

- Modify: `src/helpers/Experimental/run.ts`

- [ ] **Step 7.1: Update imports and body**

Open `src/helpers/Experimental/run.ts`. Current imports (lines 1-6):

```typescript
import { isPromise } from '../../helpers/isPromise.ts'
import type { AsyncFunc, Func } from '../../types/Func.ts'
import type { AsyncLambda, Lambda } from '../../types/Lambda.ts'
import type { AsyncResult, ErrorResult, Result, SucessfulResult } from '../../types/Result.ts'
import { lambda } from './lambda/index.ts'
```

Replace line 4 to drop the now-unused `ErrorResult` and `SucessfulResult` type imports — only `AsyncResult` and `Result` are still used in the function's return types:

```typescript
import { isPromise } from '../../helpers/isPromise.ts'
import type { AsyncFunc, Func } from '../../types/Func.ts'
import type { AsyncLambda, Lambda } from '../../types/Lambda.ts'
import type { AsyncResult, Result } from '../../types/Result.ts'
import { lambda } from './lambda/index.ts'
import { err, ok } from '../../validators/helpers/result.ts'
```

In the `resolver` body (lines 30-41), update the four given-result construction sites:

```typescript
// Before (lines 30-41):
const resolver = (...params: any[]): Result<any> | AsyncResult<any> => {
    try {
        const result = callback(...params)
        if (isPromise(result))
            return result
                .then(value => [null, value] as SucessfulResult)
                .catch(error => [error, null] as ErrorResult)
        return [null, result]
    } catch (error) {
        return [error as Error, null]
    }
}

// After:
const resolver = (...params: any[]): Result<any> | AsyncResult<any> => {
    try {
        const result = callback(...params)
        if (isPromise(result)) return result.then(value => ok(value)).catch(error => err(error as Error))
        return ok(result)
    } catch (error) {
        return err(error as Error)
    }
}
```

- [ ] **Step 7.2: Verify the run.spec.ts test passes**

Run: `yarn vitest run src/helpers/__tests__/run.spec.ts`
Expected: PASS — the test uses `const [error, value] = run(...)` destructuring, which is unchanged in shape since `ok(value)` returns `[null, value]` and `err(error)` returns `[error, null]`.

- [ ] **Step 7.3: Verify typecheck, lint, and circular dependencies**

Run: `yarn tsc -p tsconfig.json --noEmit`
Expected: PASS.

Run: `yarn check:fix`
Expected: PASS — Biome may flag `ok`/`err` as unused if the swap isn't complete; verify all four sites use the helpers and the inline `[null, ...]` / `[error, null]` patterns are fully removed.

Run: `yarn circular-dependencies`
Expected: PASS — `helpers/result.ts` imports only types from `types/Result.ts` (a leaf module); no new cycle introduced by the `helpers/Experimental/run.ts → validators/helpers/result.ts` cross-package import.

- [ ] **Step 7.4: Commit**

```sh
git add src/helpers/Experimental/run.ts
git commit -S -m "refactor(helpers): use ok/err from helpers/result.ts in run()

Swap the inline '[null, value] as SucessfulResult' and '[error, null]
as ErrorResult' constructions for the new ok() and err() helpers in
src/helpers/Experimental/run.ts. Drop the now-unused SucessfulResult
and ErrorResult type imports from src/types/Result.ts.

Externally observable behavior is unchanged (ok/err return the same
tuple shapes), but the refactor improves internal consistency and
exercises the cross-package import path guarded by
yarn circular-dependencies."
```

---

### Task 8: Migrate `src/validators/__tests__/SchemaValidator.spec.ts`

Update the existing tests that pattern-match against the bare `T | ValidationErrors` union to destructure `Result` tuples instead. These tests were failing since Task 4.

**Files:**

- Modify: `src/validators/__tests__/SchemaValidator.spec.ts`

- [ ] **Step 8.1: Add the `Result` type import at the top of the file**

Current imports (lines 1-21) start with:

```typescript
import type { TypeGuard } from '../../TypeGuards/types/index.ts'

import { asTypeGuard } from '../../TypeGuards/helpers/asTypeGuard.ts'
```

Add a `Result` type import after the `TypeGuard` import:

```typescript
import type { TypeGuard } from '../../TypeGuards/types/index.ts'
import type { Result } from '../../types/Result.ts'
```

- [ ] **Step 8.2: Migrate lines 76-81 (the `'should validate using a branchable schema'` test → `expect(SchemaValidator.validate(value3, schema2, false)).toHaveProperty('errors')` block)**

Find the block at lines 76-81 inside the `'should validate using a branchable schema'` test:

```typescript
expect(() => SchemaValidator.validate(value3, schema2)).toThrow(ValidationErrors)
expect(SchemaValidator.validate(value3, schema2, false)).toHaveProperty('errors')
expect(
    (SchemaValidator.validate(value3, schema2, false) as ValidationErrors).errors.some(
        e => e.message === 'Value does not match any of the union types' //&& e.path === '$'
    )
).toBe(true)
```

Replace the last two lines (77-81) with tuple destructure:

```typescript
expect(() => SchemaValidator.validate(value3, schema2)).toThrow(ValidationErrors)
const [err3] = SchemaValidator.validate(value3, schema2, false)
expect(err3).toBeInstanceOf(ValidationErrors)
expect(
    (err3 as ValidationErrors).errors.some(
        e => e.message === 'Value does not match any of the union types' //&& e.path === '$'
    )
).toBe(true)
```

The cast `(err3 as ValidationErrors)` is needed because the destructure gives `err3: ValidationErrors | null` (TS narrows `err3` to `ValidationErrors` after the `expect(err3).toBeInstanceOf(ValidationErrors)` assertion, but Vitest's `expect().toBeInstanceOf` doesn't propagate the type narrowing — only `if (err3 instanceof ValidationErrors)` blocks do). Keep the explicit cast.

- [ ] **Step 8.3: Migrate lines 127-141 (chained no-throw validation pipeline in `'should validate using a recursible schema'`)**

Find the block around lines 127-141:

```typescript
expect(() => SchemaValidator.validate([value3], schema2, false)).not.toThrow(ValidationErrors)
expect(() => SchemaValidator.validate(value3, schema1, false)).not.toThrow(ValidationErrors)
expect(() =>
    SchemaValidator.validate(
        SchemaValidator.validate(value3, schema1, false),
        and(
            isInstanceOf(ValidationErrors),
            asTypeGuard(
                ({ errors }: ValidationErrors) =>
                    errors.length === 1 && errors[0]!.path === '$.a'
            )
        )
    )
).not.toThrow(ValidationErrors)
```

Replace with:

```typescript
expect(() => SchemaValidator.validate([value3], schema2, false)).not.toThrow(ValidationErrors)
expect(() => SchemaValidator.validate(value3, schema1, false)).not.toThrow(ValidationErrors)
const [innerErr] = SchemaValidator.validate(value3, schema1, false)
expect(innerErr).toBeInstanceOf(ValidationErrors)
expect(() =>
    SchemaValidator.validate(
        innerErr,
        and(
            isInstanceOf(ValidationErrors),
            asTypeGuard(
                ({ errors }: ValidationErrors) =>
                    errors.length === 1 && errors[0]!.path === '$.a'
            )
        )
    )
).not.toThrow(ValidationErrors)
```

Notes:

- The `.not.toThrow(ValidationErrors)` against no-throw calls stays — these are no-op assertions (the function never throws), preserved as documentation of intent.
- `innerErr` is passed to the second `SchemaValidator.validate(innerErr, ...)` call. Without `shouldThrow=false`, that second call is on the *throwing* branch, so `expect(() => ...).not.toThrow()` validates the schema passes against the inner `ValidationErrors` error object.

- [ ] **Step 8.4: Migrate lines 143-152 (the second chained pipeline using `useSchema`)**

Find the block around lines 143-152:

```typescript
expect(() =>
    SchemaValidator.validate(
        SchemaValidator.validate(value3, schema1, false),
        useSchema(isInstanceOf(ValidationErrors)).use(
            createInlineRule<ValidationErrors>(
                ({ errors }) => errors.length === 1 && errors[0]!.path === '$.a'
            )
        )
    )
).not.toThrow(ValidationErrors)
```

Replace with:

```typescript
expect(() =>
    SchemaValidator.validate(
        innerErr,
        useSchema(isInstanceOf(ValidationErrors)).use(
            createInlineRule<ValidationErrors>(
                ({ errors }) => errors.length === 1 && errors[0]!.path === '$.a'
            )
        )
    )
).not.toThrow(ValidationErrors)
```

`innerErr` is in scope from Step 8.3's declaration — reuse the same variable. (If TypeScript complains about shadowing or "unused innerErr" elsewhere, keep the same name.)

- [ ] **Step 8.5: Migrate lines 192-197 (`'should validate using a schema with a custom message'` test → uses `validatedValue3(SchemaValidator.validate(value3, schema1, false))`)**

Find the block around lines 188-197:

```typescript
expect(() => SchemaValidator.validate(value3, schema1)).toThrow(ValidationErrors)
expect(() => SchemaValidator.validate([value1, value3, value2], schema2)).toThrow(ValidationErrors)
expect(validatedValue3(SchemaValidator.validate(value3, schema1, false))).toBe(true)
expect(
    validatedValues1324(
        SchemaValidator.validate([value1, value3, value2, value4], schema2, false)
    )
).toBe(true)
```

Replace the bottom two lines with tuple destructure:

```typescript
const [value3Err] = SchemaValidator.validate(value3, schema1, false)
expect(validatedValue3(value3Err as ValidationErrors)).toBe(true)

const [values1324Err] = SchemaValidator.validate(
    [value1, value3, value2, value4],
    schema2,
    false
)
expect(validatedValues1324(values1324Err as ValidationErrors)).toBe(true)
```

The `as ValidationErrors` cast is necessary because `validatedValue3`/`validatedValues1324` are typed as `TypeGuard<ValidationErrors>` (they take a `ValidationErrors` and return `boolean`). Without the cast, TS sees `value3Err: ValidationErrors | null` which doesn't match.

- [ ] **Step 8.6: Migrate lines 385-389 (`'should validate using a schema with optional branches'` test → final test's batch of `validatedValueNN(SchemaValidator.validate(valueNN, schema, false))` assertions)**

Find the block around lines 385-389 (the end of the test):

```typescript
expect(validatedValue9(SchemaValidator.validate(value9, schema, false))).toBe(true)
expect(validatedValue10(SchemaValidator.validate(value10, schema, false))).toBe(true)
expect(validatedValue11(SchemaValidator.validate(value11, schema, false))).toBe(true)
expect(validatedValue12(SchemaValidator.validate(value12, schema, false))).toBe(true)
expect(validatedValue13(SchemaValidator.validate(value13, schema, false))).toBe(true)
```

Replace with destructure + cast:

```typescript
{
    const [err] = SchemaValidator.validate(value9, schema, false)
    expect(validatedValue9(err as ValidationErrors)).toBe(true)
}
{
    const [err] = SchemaValidator.validate(value10, schema, false)
    expect(validatedValue10(err as ValidationErrors)).toBe(true)
}
{
    const [err] = SchemaValidator.validate(value11, schema, false)
    expect(validatedValue11(err as ValidationErrors)).toBe(true)
}
{
    const [err] = SchemaValidator.validate(value12, schema, false)
    expect(validatedValue12(err as ValidationErrors)).toBe(true)
}
{
    const [err] = SchemaValidator.validate(value13, schema, false)
    expect(validatedValue13(err as ValidationErrors)).toBe(true)
}
```

Block-scoped `{ ... }` braces to avoid `err` shadowing between declarations.

- [ ] **Step 8.7: Run typecheck and tests**

Run: `yarn tsc -p tsconfig.json --noEmit`
Expected: PASS.

Run: `yarn vitest run src/validators/__tests__/SchemaValidator.spec.ts`
Expected: PASS — all 4 `it()` blocks in the file now compile and the assertions pass.

Run: `yarn check:fix`
Expected: PASS — apply any Prettier formatting.

- [ ] **Step 8.8: Commit**

```sh
git add src/validators/__tests__/SchemaValidator.spec.ts
git commit -S -m "test(validator): migrate SchemaValidator.spec.ts to Result tuple unwrap

Replace instanceof ValidationErrors filters and bare 'as ValidationErrors'
casts against SchemaValidator.validate(arg, schema, false) return values
with tuple destructure + slot[0] instanceof checks. Five sites migrated:
lines 76-81, 127-141, 143-152, 192-197, 385-389.

Casts retained where downstream TypeGuard-typed helpers (validatedValue3,
validatedValues1324, validatedValue9-13) take bare ValidationErrors input
and TS can't propagate instanceof narrowing past vitest assertions."
```

---

### Task 9: Migrate `src/validators/__tests__/[...schemas].validator.spec.ts`

Two sites in this spec assert against `.validator(false).validate(...)` returning bare `ValidationErrors`. Migrate both.

**Files:**

- Modify: `src/validators/__tests__/[...schemas].validator.spec.ts`

- [ ] **Step 9.1: Add `Result` type import**

Current imports (lines 1-11):

```typescript
import { and } from '../schema/and.ts'
import { any } from '../schema/any.ts'
import { array } from '../schema/array.ts'
import { boolean } from '../schema/boolean.ts'
import { number } from '../schema/number.ts'
import { object } from '../schema/object.ts'
import { or } from '../schema/or.ts'
import { string } from '../schema/string.ts'
import { symbol } from '../schema/symbol.ts'
import { useSchema } from '../schema/useSchema.ts'
import { ValidationErrors } from '../ValidationErrors.ts'
```

Add a `Result` type import after the `ValidationErrors` value import:

```typescript
import { ValidationErrors } from '../ValidationErrors.ts'
import type { Result } from '../../types/Result.ts'
```

- [ ] **Step 9.2: Migrate line 82 (the `schema.validator(false).validate(void 0)` expectation)**

Find the assertion at line 82 inside the `'should validate according to schema'` test:

```typescript
expect(schema.validator(false).validate(void 0)).toBeInstanceOf(ValidationErrors)
```

Replace with:

```typescript
{
    const [err] = schema.validator(false).validate(void 0) as Result<unknown, ValidationErrors>
    expect(err).toBeInstanceOf(ValidationErrors)
}
```

The `as Result<unknown, ValidationErrors>` cast is needed as a fallback if the FluentSchema `false` overload (Task 6) doesn't propagate the literal type narrowing. Test without the cast first:

```typescript
{
    const [err] = schema.validator(false).validate(void 0)
    expect(err).toBeInstanceOf(ValidationErrors)
}
```

If TS typecheck passes without the cast, omit it. If TS complains about the destructured `err` not being typed, add the cast.

- [ ] **Step 9.3: Migrate line 103 (the `schema2.validator(false).validate(void 0)` expectation)**

Find the assertion at line 103 inside the same test:

```typescript
expect(schema2.validator(false).validate(void 0)).toBeInstanceOf(ValidationErrors)
```

Replace with the same pattern:

```typescript
{
    const [err] = schema2.validator(false).validate(void 0)
    expect(err).toBeInstanceOf(ValidationErrors)
}
```

(Cast rule same as Step 9.2.)

- [ ] **Step 9.4: Verify typecheck and tests**

Run: `yarn tsc -p tsconfig.json --noEmit`
Expected: PASS. If the destructured `err` is typed as `ValidationErrors | null` correctly from the overload, no cast is needed.

Run: `yarn vitest run src/validators/__tests__/[...schemas].validator.spec.ts`
Expected: PASS.

Run: `yarn check:fix`
Expected: PASS.

- [ ] **Step 9.5: Commit**

```sh
git add src/validators/__tests__/[...schemas].validator.spec.ts
git commit -S -m "test(validator): migrate [...schemas].validator.spec.ts to Result unwrap

Two assertions that called schema.validator(false).validate(void 0)
and expected the bare union to be an instanceof ValidationErrors now
destructure the Result tuple and assert against slot[0]. The throwing
branch assertions (lines 83-117) stay unchanged."
```

---

### Task 10: Add the composition-with-validators test block in `result-helpers.spec.ts`

In Task 1, the validator-composition tests were stubbed out as a TODO because the validator interface hadn't changed yet. Now that Task 4 produced `Result`-returning no-throw branches, restore the composition tests.

**Files:**

- Modify: `src/validators/__tests__/result-helpers.spec.ts`

- [ ] **Step 10.1: Replace the TODO stub with the composition tests**

Find the TODO comment at the bottom of `src/validators/__tests__/result-helpers.spec.ts` (added in Task 1 Step 1.1):

```typescript
// TODO(Task 11): composition-with-validators tests will land after Task 6
// (validator refactor) produces Result-returning no-throw branches.
```

Replace with:

```typescript
describe('composition with validators', () => {
    it('isOk narrows successful no-throw validator result', () => {
        const validate = string().min(3).validator(false)
        const pass = validate('foo')
        if (isOk(pass)) expect(pass[1]).toBe('foo')
        else throw new Error('expected success')
    })
    it('isErr narrows failed no-throw validator result', () => {
        const validate = string().min(3).validator(false)
        const fail = validate('ab')
        if (isErr(fail)) {
            expect(fail[0]).toBeInstanceOf(ValidationErrors)
        } else {
            throw new Error('expected failure')
        }
    })
})
```

- [ ] **Step 10.2: Verify the composition tests pass**

Run: `yarn vitest run src/validators/__tests__/result-helpers.spec.ts`
Expected: PASS — both composition tests pass because the validator now returns `Result` tuples and `isOk`/`isErr` narrow them correctly.

Run: `yarn tsc -p tsconfig.json --noEmit`
Expected: PASS.

- [ ] **Step 10.3: Commit**

```sh
git add src/validators/__tests__/result-helpers.spec.ts
git commit -S -m "test(validator): add composition-with-validators tests for ok/err/isOk/isErr

Replace the Task 1 TODO stub with two tests that exercise isOk/isErr
against a live schema's no-throw validator output (string().min(3).
validator(false)). Confirms the new Result-returning branch narrows
correctly via the helpers."
```

---

### Task 11: Update README.md

Update the `Schema.validator` section example to show the new `Result`-returning no-throw branch, and add an `ok`/`err`/`isOk`/`isErr` subsection under the `Result` type documentation.

**Files:**

- Modify: `README.md`

- [ ] **Step 11.1: Update the `Schema.validator` section (lines 509-528)**

Open `README.md`. Find the section starting around line 509 with the `Schema.validator` documentation. The current block (lines 511-528):

````markdown
It allows you to get a validator instance to validate a value against the schema. By default, the validator throws on failure. Pass `false` to get a `ValidateReturn<T>` instead.

```typescript
import { string, object } from '@srhenry/type-utils'

const validator = object({ name: string().min(1) }).validator()
validator({ name: 'Alice' }) // { name: 'Alice' } — passes, returns the value
validator({ name: '' })      // throws ValidationErrors

const softValidator = object({ name: string().min(1) }).validator(false)
softValidator({ name: 'Alice' }) // { name: 'Alice' }
softValidator({ name: '' })      // ValidationErrors (no throw)

// Also available as .validate on the validator:
validator.validate({ name: 'Bob' }) // { name: 'Bob' }
```
````

Replace with:

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

- [ ] **Step 11.2: Update the `Util types → Result` section (lines 776-787)**

Find the `Result` type documentation around lines 777-787. The current block ends with:

```typescript
import type { Result } from '@srhenry/type-utils'

declare const res1: Result<number> // res1: [null, number] | [Error, null]
declare const res2: Result<string, TypeError> // res2: [null, string] | [TypeError, null]
```

Add a new subsection immediately after this code block (still inside the `Result` heading's documentation, before the next `####` heading):

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

- [ ] **Step 11.3: Verify the README formatting**

Run: `npx prettier --check README.md`
Expected: PASS. Per AGENTS.md, YAML/JSON/Markdown formatting is Prettier-validated; the file must pass before commit.

If prettier rewrites the file, run `npx prettier --write README.md` and re-stage.

- [ ] **Step 11.4: Commit**

```sh
git add README.md
git commit -S -m "docs(README): document Result-returning no-throw validators and ok/err/isOk/isErr

Replace the Schema.validator section's 'soft validator returns ValidateReturn'
example with a tuple-destructure example showing [null, value] and
[ValidationErrors, null] paths. Add a 'Since v0.9.0' callout documenting
the isOk/isErr-based ergonomic narrowing pattern.

Under 'Util types — Result', add a 'ok/err/isOk/isErr' subsection with
constructor usage and composition with .validator(false).validate(), with
a 'Since v0.9.0' callout. Notes the strict Result-shape enforcement
(TypeError throws on malformed tuples)."
```

---

### Task 12 (Final verification gate): Run all CI-equivalent checks

This task is the final verification before opening the PR. Run every command from the project's pre-commit hook plus the optional CI gates.

**Files:** None (verification only).

- [ ] **Step 12.1: Full clean build**

Run: `yarn build:clean`
Expected: PASS — clean dist + types directories, ESM build, CJS build, and `build:fix-declarations` all succeed. Failures here indicate TypeScript couldn't produce a build (likely a declaration file issue from the deprecation alias or the new `Result` import paths).

- [ ] **Step 12.2: Full test suite**

Run: `yarn test`
Expected: PASS — all 14+ existing spec files plus the new `result-helpers.spec.ts` pass. No skipped or pending tests.

- [ ] **Step 12.3: Typecheck under main tsconfig**

Run: `yarn tsc -p tsconfig.json --noEmit`
Expected: PASS.

- [ ] **Step 12.4: Lint + format check**

Run: `yarn check:fix`
Expected: PASS — Biome lint + Prettier formatting all green. Apply any in-place fixes the script makes; if it makes any, re-stage and amend the last commit (or add a style-only follow-up).

- [ ] **Step 12.5: Circular dependencies**

Run: `yarn circular-dependencies`
Expected: PASS — madge finds no new cycle. The new `src/validators/helpers/result.ts` is a leaf module (imports only `types/Result.ts`), and the `src/helpers/Experimental/run.ts` cross-package import is a one-way edge.

- [ ] **Step 12.6: Smoke-test the new helpers spec in isolation**

Run: `yarn vitest run src/validators/__tests__/result-helpers.spec.ts`
Expected: PASS — verifies the new file standalone.

- [ ] **Step 12.7: (No commit)**

This task produces no commit — it's the pre-PR verification gate.

---

### Task 13: Push the feature branch and open the PR

**Files:** None (git operations only).

- [ ] **Step 13.1: Push to all remotes**

Per AGENTS.md PR workflow, push the feature branch to all configured remotes (warn on per-remote failure but continue to others):

```sh
for remote in $(git remote); do
  git push -u "$remote" feat/validator-result || echo "WARNING: push to $remote failed"
done
```

- [ ] **Step 13.2: Open the PR**

PR title: `feat(validator)!: no-throw branch returns Result<T, ValidationErrors>`
PR base: `release/0.9.0`

PR body:

```markdown
## Summary

The validator interfaces' no-throw branch (`.validator(false)`, `SchemaValidator.validate(arg, schema, false)`) now returns a tuple `Result<T, ValidationErrors>` instead of the bare `T | ValidationErrors` union. Throwing branches keep their existing semantics — they throw `ValidationErrors` on failure and return the bare `T` on success.

Internal refactor: the `validate()` helper function in `SchemaValidator.ts` now natively returns `Result`, and the metadata-based `setThrows`/`mustNotThrow`/`shouldThrow` symbol machinery is removed.

New public helpers: `ok`/`err`/`isOk`/`isErr` exported from `@srhenry/type-utils`. Construct and narrow `Result` tuples with runtime shape enforcement.

## Breaking changes

- `SchemaValidator.validate(arg, schema, false)` returns `Result<T, ValidationErrors>` (was `T | ValidationErrors`).
- `schema.validator(false).validate(arg)` returns `Result<T, ValidationErrors>` (was `ValidateReturn<T>`).
- `ValidateReturn<T>` is a `@deprecated` alias for `Result<T, ValidationErrors>` (slated for removal in 0.10.0).

## Migration guide

Callers using `.validator(false)` / `SchemaValidator.validate(arg, schema, false)` should switch from `instanceof ValidationErrors` checks to tuple destructuring or the `isOk`/`isErr` helpers. Example:

```typescript
// Before 0.9.0
const result = validator(value)
if (result instanceof ValidationErrors) { /* handle */ }

// 0.9.0+
const [err, val] = validator(value)
if (err) { /* handle */ }
// or
import { isErr } from '@srhenry/type-utils'
const result = validator(value)
if (isErr(result)) { /* result[0] is ValidationErrors */ }
```

## Spec

Design document: [`docs/superpowers/specs/2026-07-10-validator-result-return-design.md`](../blob/release/0.9.0/docs/superpowers/specs/2026-07-10-validator-result-return-design.md)

## Test plan

- [x] New `src/validators/__tests__/result-helpers.spec.ts` covers helper constructors, narrowing, shape violations
- [x] All existing tests migrated to tuple-destructure pattern (`SchemaValidator.spec.ts`, `[...schemas].validator.spec.ts`)
- [x] `yarn build:clean` green
- [x] `yarn test` green (full suite)
- [x] `yarn tsc -p tsconfig.json --noEmit` green
- [x] `yarn check:fix` green
- [x] `yarn circular-dependencies` green
```

Run:

```sh
gh pr create --base release/0.9.0 \
  --title "feat(validator)!: no-throw branch returns Result<T, ValidationErrors>" \
  --body "$(cat <<'PR_BODY'
## Summary

The validator interfaces' no-throw branch (`.validator(false)`, `SchemaValidator.validate(arg, schema, false)`) now returns a tuple `Result<T, ValidationErrors>` instead of the bare `T | ValidationErrors` union. Throwing branches keep their existing semantics — they throw `ValidationErrors` on failure and return the bare `T` on success.

Internal refactor: the `validate()` helper function in `SchemaValidator.ts` now natively returns `Result`, and the metadata-based `setThrows`/`mustNotThrow`/`shouldThrow` symbol machinery is removed.

New public helpers: `ok`/`err`/`isOk`/`isErr` exported from `@srhenry/type-utils`. Construct and narrow `Result` tuples with runtime shape enforcement.

## Breaking changes

- `SchemaValidator.validate(arg, schema, false)` returns `Result<T, ValidationErrors>` (was `T | ValidationErrors`).
- `schema.validator(false).validate(arg)` returns `Result<T, ValidationErrors>` (was `ValidateReturn<T>`).
- `ValidateReturn<T>` is a `@deprecated` alias for `Result<T, ValidationErrors>` (slated for removal in 0.10.0).

## Migration guide

Callers using `.validator(false)` / `SchemaValidator.validate(arg, schema, false)` should switch from `instanceof ValidationErrors` checks to tuple destructuring or the `isOk`/`isErr` helpers.

## Spec

Design document: `docs/superpowers/specs/2026-07-10-validator-result-return-design.md`

## Test plan

- [x] New `src/validators/__tests__/result-helpers.spec.ts` covers helper constructors, narrowing, shape violations
- [x] All existing tests migrated to tuple-destructure pattern (`SchemaValidator.spec.ts`, `[...schemas].validator.spec.ts`)
- [x] `yarn build:clean` green
- [x] `yarn test` green (full suite)
- [x] `yarn tsc -p tsconfig.json --noEmit` green
- [x] `yarn check:fix` green
- [x] `yarn circular-dependencies` green
PR_BODY
)"
```

- [ ] **Step 13.3: Verify the PR opened and return the PR URL to the user**

Run: `gh pr view --json url -q .url` (or parse the URL from `gh pr create`'s output).
Expected: a PR URL on `github.com`. Hand the URL to the user.

- [ ] **Step 13.4: Task list cleanup**

The TASKS.md entry for `validator-result-return` should be added to TASKS.md if it wasn't already in pre-implementation. Per AGENTS.md Task Management protocol: claim-to-complete lifecycle — the task is removed after the PR merges. For now (PR opened but not merged), no TASKS.md edit is required (the file is synced at merge time per the post-merge cleanup protocol in the spec).

Stop here. PR is open; the implementation session is complete pending review/merge.

---

## Closing summary

### Implementation order recap

| Task | Files touched | Key deliverable |
|------|---------------|-----------------|
| 1 | `src/validators/helpers/result.ts` (new), `src/validators/__tests__/result-helpers.spec.ts` (new) | `ok`/`err`/`isOk`/`isErr`/`assertResultShape` + full spec (constructors, narrowing, shape violations) |
| 2 | `src/validators/index.ts` | Public re-exports of the four helpers |
| 3 | `src/validators/SchemaValidator.ts` | Add `import type { Result } from '../types/Result.ts'` (pre-stage the import) |
| 4 | `src/validators/SchemaValidator.ts`, `src/validators/schema/helpers/validate/*.ts`, `src/validators/standard-schema/registerValidateCallback.ts`, `src/validators/standard-schema/attachStandardSchema.ts` | Big-bang refactor: `validate()` returns `Result`, drop `Symbol.for('__throws__')` machinery (`setThrows`/`mustNotThrow`/`shouldThrow`/`defaults`/`DefaultThrowsParam`), recursive helpers unwrap tuples instead of `instanceof ValidationErrors` filters |
| 5 | `src/validators/types/ValidateReturn.ts` | Convert to `@deprecated` alias for `Result<T, ValidationErrors>` |
| 6 | `src/validators/schema/types/FluentSchema.ts`, `src/validators/schema/types/FluentOptionalSchema.ts` | Replace 2 overloads with 3 (throwing default, no-throw returns `Result`); fix the existing `false`-overload `.validate` type bug in `FluentOptionalSchema` |
| 7 | `src/helpers/Experimental/run.ts` | Courtesy swap: use `ok()`/`err()` instead of raw tuple literals |
| 8 | `src/validators/__tests__/SchemaValidator.spec.ts` | Migrate 5 sites (lines 76-81, 127-141, 143-152, 192-197, 385-389) to tuple destructure + `as ValidationErrors` casts where downstream TypeGuard-typed helpers need bare `ValidationErrors` |
| 9 | `src/validators/__tests__/[...schemas].validator.spec.ts` | Migrate 2 sites (lines 82, 103) to tuple destructure |
| 10 | `src/validators/__tests__/result-helpers.spec.ts` | Replace the Task 1 TODO stub with composition-with-validators test block |
| 11 | `README.md` | Update `Schema.validator` section (tuple-destructure example + `Since v0.9.0` callout + `isOk`/`isErr` narrowing) and add `ok`/`err`/`isOk`/`isErr` subsection under `Result` type |
| 12 | _(none — verification only)_ | Final gate: `yarn build:clean`, `yarn test`, `yarn tsc --noEmit`, `yarn check:fix`, `yarn circular-dependencies` all green |
| 13 | _(none — git ops only)_ | Push to all remotes, open PR against `release/0.9.0` |

### Total commit count

12 commits (Tasks 1-11 produce one commit each; Task 12 produces no commit; Task 13 produces no commit — it's the push + PR open step). Each commit is GPG-signed (`-S`) per AGENTS.md, authored with the user-confirmed identity, formatted as Conventional Commits with `feat(validator)!:` for the breaking change (Task 4) and scoped types (`test(validator)`, `refactor(validator)`, `docs(README)`, `chore(validator)`) for the rest.

### Verification gate at a glance

Before opening the PR, all five of these must pass:

```sh
yarn build:clean
yarn test
yarn tsc -p tsconfig.json --noEmit
yarn check:fix
yarn circular-dependencies
```

If any fails, stop and fix before pushing. Do not skip the gate, do not "fix it in a follow-up PR."

### Key invariants preserved

- Throwing branch (`shouldThrow=true` or default) keeps bare `T` return + `ValidationErrors` throw — zero breaking change for callers on the throwing path.
- `ValidateReturn<T>` continues to compile (now as `@deprecated` alias for `Result<T, ValidationErrors>`) — existing type-level consumers don't break at 0.9.0, only at 0.10.0 when the alias is removed.
- `isOk`/`isErr` strictness: throw `TypeError` for non-2-tuples, non-Error error slots, or mutual-exclusivity violations. `[null, null]` is valid. Error slot is `null | Error` only.
- Optional schemas return `Result<undefined | T, ValidationErrors>` — the `undefined |` in the value slot preserves the existing "absent key" semantics for optional fields.

### Post-merge cleanup (deferred — not part of this PR session)

After the PR merges into `release/0.9.0`, follow the AGENTS.md post-merge cleanup protocol from the main repo checkout (NOT the worktree):

```sh
git worktree remove .worktree/validator-result
git fetch --prune
git branch -d feat/validator-result
for remote in $(git remote); do
  git push "$remote" --delete feat/validator-result || echo "WARNING: delete from $remote failed"
done
```

And remove the `validator-result-return` entry from `TASKS.md` (per the Task Management protocol — remove entirely after merge, no strikethrough marker).

When `release/0.9.0` is itself merged to `master` and published, the `ValidateReturn<T>` deprecation alias remains in place. It's slated for removal in 0.10.0 — that's a separate task, separate PR, separate session.

---

**Plan complete.** 13 tasks, 12 commits, 1 PR. Ready for execution via the executing-plans skill in a separate session.

