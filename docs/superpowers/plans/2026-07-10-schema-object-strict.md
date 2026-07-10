# schema-object-strict Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a fluent `.strict()` method to `object(...)` schemas that rejects unknown keys at runtime, mirroring the existing fluent-rule pattern used by `array().unique()` and `record().nonEmpty()`.

**Architecture:** `Object.strict` becomes a first-class rule registered in the existing `keys`/`bindings` registry (mirroring `Array.unique` and `Record.nonEmpty`). The rule tuple carries the allowed-key `string[]` as args; the handler compares `Object.keys(arg)` against that list. Both the boolean guard path (`isFollowingRules`) and the throwing-validator path (`validateRules` → `validateObject`) pick it up automatically. The throwing path aggregates strict errors with per-key shape errors (multi-error collection); the boolean path short-circuits on the first failing rule.

**Spec:** [`docs/superpowers/specs/2026-07-10-schema-object-strict-design.md`](../specs/2026-07-10-schema-object-strict-design.md)

**Tech Stack:** TypeScript 7 strict mode, Vitest, Biome (lint), Prettier (format), Yarn 1.x, dual ESM+CJS build. Conventions: 4-space indent, no semicolons, single quotes, trailing commas (es5), print width 100, arrow parens avoid.

**Branch / worktree:** Per AGENTS.md PR workflow — feature work happens in a worktree at `.worktree/feat/schema-object-strict` branched off `origin/developer`. **The first step after creating the worktree MUST be `yarn install`** (triggers the `prepare` git-hooks script). Never work directly in the main checkout for code-producing tasks.

**Commit author verification:** Before the first commit in the worktree, run `git config user.name && git config user.email` and verify the identity is non-placeholder. The session-discovered identity is `SrHenry <lucapvh949@gmail.com>` — confirm at commit time; abort if it looks like `Test test@test.com`.

**Prohibitions (from AGENTS.md):**
- NEVER use `npm install` — `yarn install` only
- NEVER skip `tsc -p tsconfig.json --noEmit` after code changes
- NEVER commit with placeholder author identity
- NEVER disable GPG commit signing (`-S` is required; if pinentry fails, stop and wait for user input)
- NEVER use `any` in production code (test files are allowed)

---

## File Structure

**New files (6):**
- `src/validators/rules/Object/index.ts` — aggregator exporting `ObjectRules = { strict } as const` and the `ObjectRule` type
- `src/validators/rules/Object/factories/strict.ts` — factory returning the rule tuple `['__Object.strict__', [allowedKeys]]`
- `src/validators/rules/Object/handlers/strict.ts` — binding-side handler `(arg, allowedKeys) => boolean`
- `src/validators/rules/Object/formators/strict.ts` — message formator returning `'strict'`
- `src/validators/__tests__/object.strict.spec.ts` — runtime test suite (~20 `it()` blocks)
- `docs/superpowers/plans/2026-07-10-schema-object-strict.md` (this file)

**Modified files (7):**
- `src/validators/rules/constants.ts` — register `Object.strict` key + binding (4 lines)
- `src/validators/rules/types/index.ts` — extend `Default` union to include `ObjectRule` (2 lines)
- `src/validators/schema/types/ObjectSchema.ts` — widen `TRules` slot to `typeof ObjectRules`
- `src/validators/schema/types/GetSchema.ts` — widen specific-object branch to include `ObjectSchemaRules`
- `src/validators/schema/object.ts` — refactor `_fn` to accept `rules`; add `schema.strict` fluent method
- `src/validators/schema/types/__tests__/GetSchema.spec.ts` — add compile-time assertions for `.strict()` on `GetSchema<{foo:string}>`
- `README.md` — one-line API list + small example block under `Schema.object`

**Explicitly untouched (verified — no changes needed):**
- `src/validators/SchemaValidator.ts`, `src/validators/schema/helpers/validate/validateObject.ts`, `src/validators/RuleValidator.ts`, `src/validators/BaseValidator.ts`, `src/validators/schema/helpers/isFollowingRules.ts`, `src/validators/rules/helpers/getRule.ts`, `src/validators/schema/types/FluentSchema.ts`

---


## Task 1: Create the Object rule subtree (factory, handler, formator, index)

**Files:**
- Create: `src/validators/rules/Object/index.ts`
- Create: `src/validators/rules/Object/factories/strict.ts`
- Create: `src/validators/rules/Object/handlers/strict.ts`
- Create: `src/validators/rules/Object/formators/strict.ts`

This task creates all four leaf files of the `rules/Object/` subtree in one step. They are tightly coupled (the index re-exports the other three) and individually trivial; splitting into sub-tasks would add review overhead without isolable test surfaces. The registry wiring that makes them observable lives in Task 2.

- [ ] **Step 1: Create the formator**

`src/validators/rules/Object/formators/strict.ts`:

```ts
import type { MessageFormator } from '../../../TypeGuards/types/index.ts'

const formator: MessageFormator = () => 'strict'

export { formator as strictFormator }
```

Matches `Record/formators/nonEmpty.ts` in shape. The `MessageFormator` type alias is imported from `TypeGuards/types/index.ts` (same import path used by `Record/formators/nonEmpty.ts`'s sibling `Array/formators/unique.ts`). The exported name is `strictFormator` to avoid colliding with the handler's `strict` export name when both are imported into `constants.ts`.

- [ ] **Step 2: Create the handler**

`src/validators/rules/Object/handlers/strict.ts`:

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

The signature `(arg, ...args) => boolean` matches the positional-args convention used by every other default rule — e.g. `numberMinHandler(arg, n)`, `arrayUniqueHandler(arg, deepObject)`. Both `isFollowingRules` (boolean guard path) and `createRulesValidationGenerator` (throwing path) call the binding via `ruleFunction(value, ...ruleStruct.args)`, so the `allowedKeys: string[]` arrives as the second positional arg.

The `arg === null || typeof arg !== 'object'` short-circuit is defensive: by the time the handler runs, `branchIfOptional` has already returned `false` for `undefined` inputs and `isFollowingRules` is called only for defined subjects. The short-circuit lets the shape check (`hasValidProperties`) reject non-objects rather than strict spuriously failing first — matches `Record/handlers/nonEmpty.ts`'s pattern of operating on valid record shapes only.

- [ ] **Step 3: Create the factory**

`src/validators/rules/Object/factories/strict.ts`:

```ts
import type { RuleFactory } from '../../types/RuleFactory.ts'

import { keys } from '../../constants.ts'

type StrictArgs = [allowedKeys: string[]]

export const strict: RuleFactory<'Object.strict', StrictArgs> = allowedKeys => [
    keys['Object.strict'],
    [allowedKeys],
]
```

Follows `Array/factories/min.ts:5` exactly — only differences are the key name and the args tuple shape. `StrictArgs = [allowedKeys: string[]]` is picked up as the second type param of `RuleFactory` (same mechanism `Array/factories/unique.ts:5` uses for `[deepObject: boolean] | []`).

Note: `keys` is imported from `../../constants.ts` but `Object.strict` is NOT yet registered there — that wiring happens in Task 2. TypeScript will resolve `keys['Object.strict']` only after Task 2 lands. **Do not attempt to `tsc --noEmit` between Task 1 and Task 2** — the type error is expected and will be resolved by Task 2.

- [ ] **Step 4: Create the index aggregator**

`src/validators/rules/Object/index.ts`:

```ts
import { strict } from './factories/strict.ts'

export const ObjectRules = { strict } as const
export { strict }
export type ObjectRule = ReturnType<(typeof ObjectRules)[keyof typeof ObjectRules]>
```

Deliberately omits the `optional` rule (unlike `RecordRules`/`ArrayRules` which both include it). `optional` is plumbed via `optionalizeOverloadFactory(_fn).optionalize<...>()` in `object.ts:97`, NOT via the rules array — adding it to `ObjectRules` would be misleading. The `TRules` slot on `ObjectSchema` will be `typeof ObjectRules` (no `Omit` of `optional` needed, whereas `GetSchema.ts` uses `Omit<typeof RecordRules, 'optional'>` for records — see Task 4).

- [ ] **Step 5: Confirm lint is clean on the new files (optional pre-registry sanity check)**

Run: `yarn lint src/validators/rules/Object/`

Expected: PASS (lint has no type-level knowledge of the unregistered `keys['Object.strict']` reference — that's a typecheck concern, not a lint concern). If Biome flags anything, fix the lint issue but do NOT attempt `tsc --noEmit` yet — the missing `Object.strict` key is expected until Task 2.

- [ ] **Step 6: Commit**

```bash
git add src/validators/rules/Object/
git commit -S -m "feat(schema): add Object.strict rule subtree (factory, handler, formator, index)

Leaf files for the new first-class Object.strict rule. Registry
wiring (keys/bindings) lands in the next commit."
```

Note: the pre-commit hook runs full `build:clean → check:fix → test → circular-dependencies`. Because Task 1's `strict.ts` factory imports `keys['Object.strict']` which doesn't exist yet, the build step (`tsc`) WILL fail. **The commit will be blocked by the hook.** Two options:
- (A) Stage Task 1 + Task 2 together as one commit (recommended — both pieces are needed for the build to pass)
- (B) Commit Task 1 with `--no-verify` (NOT RECOMMENDED — AGENTS.md prohibits skipping hooks without user direction)

**If you hit the hook failure, abandon the per-task commit and instead bundle Task 1 + Task 2 into a single combined commit at the end of Task 2.** The plan still walks through Task 1 and Task 2 as separate edits for clarity, but the commit boundary is "after Task 2."

---

## Task 2: Register Object.strict in the rules registry

**Files:**
- Modify: `src/validators/rules/constants.ts` (add 1 import block, 1 key entry, 1 binding entry)
- Modify: `src/validators/rules/types/index.ts` (extend `Default` union, 2 lines)

- [ ] **Step 1: Add the Object imports to constants.ts**

In `src/validators/rules/constants.ts`, find the existing `<RecordRules> import section:` block (around line 36) and add a new Object block immediately after it (before the `<OptionalRules> import section:` block at line 41):

```ts
// <ObjectRules> import section:
import { strictFormator as objectStrictFormator } from './Object/formators/strict.ts'

import { strict as objectStrictHandler } from './Object/handlers/strict.ts'
```

Note the import aliases `objectStrictFormator` and `objectStrictHandler` — they avoid colliding with the existing `Record/handlers/nonEmpty.ts`-style names (`recordNonEmptyHandler`, `recordNonEmptyFormator`). The alias pattern matches how the Record block aliases the `nonEmpty` function to `recordNonEmptyHandler`.

- [ ] **Step 2: Add the Object.strict key entry**

In the same file, find the `export const keys = { ... } as const` block (lines 44-63) and add a new entry after `'Record.nonEmpty': '__Record.nonEmpty__',` (line 60):

```ts
    'Record.nonEmpty': '__Record.nonEmpty__',

    'Object.strict': '__Object.strict__',
```

 placement: immediately after the Record block, before the `'optional': '__optional__',` entry. The key string `'__Object.strict__'` is the dispatcher token used by `getRule()` (see `rules/helpers/getRule.ts:17-18`).

- [ ] **Step 3: Add the Object.strict binding**

In the same file, find the `export const bindings = { ... } as const` block (lines 66-85) and add a new entry after the Record binding (line 82):

```ts
    [keys['Record.nonEmpty']]: setMessageFormator(recordNonEmptyFormator, recordNonEmptyHandler),

    [keys['Object.strict']]: setMessageFormator(objectStrictFormator, objectStrictHandler),
```

Placement: immediately after the Record binding, before the `[keys.optional]: optionalHandler,` entry. `setMessageFormator` wraps the handler with the formator for message generation (see `TypeGuards/helpers/setMessageFormator.ts`) — same wrapper used by every other default rule.

- [ ] **Step 4: Extend the Default union in rules/types/index.ts**

In `src/validators/rules/types/index.ts`, add the `ObjectRule` import and extend the `Default` type alias.

First, add the import alongside the existing rule-type imports at the top (lines 1-6):

```ts
import type { ArrayRule } from './../Array/index.ts'
import type { NumberRule } from './../Number/index.ts'
import type { ObjectRule } from './../Object/index.ts'
import type { RecordRule } from './../Record/index.ts'
import type { StringRule } from './../String/index.ts'
import type { RuleTuple } from './RuleTuple.ts'
```

The import path `'./../Object/index.ts'` matches the sibling imports (`'./../Array/index.ts'`, `'./../Record/index.ts'`) — the existing file uses `'./../'` (two-dot) prefix rather than `'../../'` for these. Verify the existing line 3 reads `'./../Array/index.ts'` before mirroring it.

Then extend the `Default` type alias at line 48:

```ts
export type Default = StringRule | NumberRule | ArrayRule | RecordRule | ObjectRule
```

Without this extension, `isFollowingRules`'s `DefaultRules[]` overload (at `schema/helpers/isFollowingRules.ts:26`) refuses to accept an `ObjectRule[]`, and `object.ts`'s Task 6 refactor will not compile.

- [ ] **Step 5: Verify typecheck passes (Task 1 + Task 2 wired together)**

Run: `yarn tsc -p tsconfig.json --noEmit`

Expected: PASS (exit 0). The `keys['Object.strict']` reference in Task 1's `factories/strict.ts` now resolves.

- [ ] **Step 6: Verify lint is clean**

Run: `yarn check`

Expected: PASS. If Biome flags the import ordering or any formatting, run `yarn check:fix` and re-stage the auto-fixed files.

- [ ] **Step 7: Verify the existing test suite still passes**

Run: `yarn test`

Expected: PASS (all existing tests green — Tasks 1+2 only added wiring, nothing consumes `Object.strict` yet, so there should be zero behavioral change).

- [ ] **Step 8: Commit (bundling Task 1 + Task 2 per the Task 1 note)**

```bash
git add src/validators/rules/Object/ src/validators/rules/constants.ts src/validators/rules/types/index.ts
git commit -S -m "feat(schema): register Object.strict rule in keys/bindings registry

Adds rules/Object/ subtree (factory, handler, formator, index) and
wires it into constants.ts (keys, bindings) and types/index.ts (Default
union). isFollowingRules and validateRules now dispatch the strict rule
via the shared registry, mirroring Array.unique and Record.nonEmpty."
```

The pre-commit hook runs `build:clean → check:fix → test → circular-dependencies`. All four should pass. If the hook reformats files, stage and recommit the formatting changes.

---


## Task 3: Refactor object.ts to thread rules and add schema.strict

**Files:**
- Modify: `src/validators/schema/object.ts` (refactor `_fn` signature + guard; add `rules` accumulator and `schema.strict` in the IIFE factory)

This is the largest behavioral change in the plan. The refactor mirrors `array.ts` (lines 41-95) exactly — only the shape-check call differs (`BaseValidator.hasValidProperties` vs `arg.every(...)`).

### Reference: current object.ts structure

Before editing, re-read the current `src/validators/schema/object.ts` (160 lines). Key landmarks:
- Lines 1-25: imports
- Lines 26-33: `_fn` overloads (4 of them)
- Lines 33-87: `_fn` implementation body (the no-tree branch at lines 34-45 is currently unaffected by rules)
- Lines 89-97: `OptionalizedObject` type + `optionalizeOverloadFactory` decorator
- Lines 99-160: IIFE factory returning `object: ObjectSchema`

### Step 1: Add the ObjectRule and isFollowingRules imports

- [ ] In the import block at the top of `src/validators/schema/object.ts`, add:

```ts
import type { ObjectRule } from '../rules/Object/index.ts'
```

(type-only import, alongside the other `import type` lines at the top — lines 1-5).

```ts
import { isFollowingRules } from './helpers/isFollowingRules.ts'
```

(value import, alongside the other `import { ... }` lines at lines 7-24 — place it near `branchIfOptional` at line 15 for grouping).

```ts
import { ObjectRules } from '../rules/Object/index.ts'
```

(value import — `ObjectRules` is the `{ strict } as const` aggregator from Task 1, used by `schema.strict = () => addCall('strict', [ObjectRules.strict(...)])`).

### Step 2: Refactor the _fn overloads to accept rules

- [ ] Replace the four existing `_fn` overloads (lines 26-33) with versions that accept a trailing `rules: ObjectRule[]` parameter:

Current:
```ts
function _fn<T extends {}>(tree: ValidatorMap<T>): TypeGuard<Sanitize<T>>
// function _fn<T extends ValidatorMap<any>>(tree: T): TypeGuard<GetTypeFromValidatorMap<T>>

function _fn(): TypeGuard<Record<any, any>>
// biome-ignore lint/complexity/noBannedTypes: {} used as wildcard object type for overload
function _fn(tree: {}): TypeGuard<{}>
// biome-ignore lint/complexity/noBannedTypes: {} used as generic constraint for any non-nullish value
function _fn<T extends {}>(tree?: ValidatorMap<T>): TypeGuard<T | Record<any, any> | {}> {
```

New:
```ts
function _fn<T extends {}>(
    tree: ValidatorMap<T>,
    rules: ObjectRule[]
): TypeGuard<Sanitize<T>>
// function _fn<T extends ValidatorMap<any>>(tree: T): TypeGuard<GetTypeFromValidatorMap<T>>

function _fn(rules: ObjectRule[]): TypeGuard<Record<any, any>>
// biome-ignore lint/complexity/noBannedTypes: {} used as wildcard object type for overload
function _fn(tree: {}, rules: ObjectRule[]): TypeGuard<{}>
// biome-ignore lint/complexity/noBannedTypes: {} used as generic constraint for any non-nullish value
function _fn<T extends {}>(
    tree?: ValidatorMap<T>,
    rules: ObjectRule[] = []
): TypeGuard<T | Record<any, any> | {}> {
```

Note: the no-tree overload signature changes from `_fn()` to `_fn(rules: ObjectRule[])`. This is required because `_object(rules)` and `_object.optional(rules)` are called from the IIFE's `getGuard()` — and `getGuard()` always passes `rules` (the IIFE-level accumulator) as the first arg when `tree` is absent. Compare `array.ts:29` (`function _fn(): TypeGuard<any[]>`) vs `array.ts:30` (`function _fn(rules: ArrayRule[]): TypeGuard<any[]>`) — array has BOTH a zero-arg and a rules-only overload because `array`'s IIFE sometimes calls `_array(rules)` with rules as the first positional. object will use the same shape.

### Step 3: Refactor the _fn body to thread rules into the guard

- [ ] Inside the `_fn` implementation body, two changes:

(a) The no-tree branch (lines 34-45) currently ignores any rules. After the refactor, it should respect `branchIfOptional` + `isFollowingRules` even for blank objects — though in practice `object()` with `.strict()` and no tree will have `allowedKeys = []` and only match `{}` (per spec edge case). Update the no-tree branch:

Current (lines 34-45):
```ts
    const isBlankObject = (arg: unknown) =>
        typeof arg === 'object' && !!arg && Object.keys(arg).length === 0
    if (!tree || isBlankObject(tree)) {
        // biome-ignore lint/complexity/noBannedTypes: {} used as type for empty object guard
        const guard = (arg: unknown): arg is Record<any, any> | {} =>
            tree !== null && typeof arg === 'object'

        return setStructMetadata(
            { type: 'object', schema: guard, optional: false, tree: {}, rules: [] },
            setRuleMessage('object', guard)
        )
    }
```

New:
```ts
    const isBlankObject = (arg: unknown) =>
        typeof arg === 'object' && !!arg && Object.keys(arg).length === 0
    if (!tree || isBlankObject(tree)) {
        // biome-ignore lint/complexity/noBannedTypes: {} used as type for empty object guard
        const guard = (arg: unknown): arg is Record<any, any> | {} =>
            branchIfOptional(arg, rules) ||
            (isFollowingRules(arg, rules) && tree !== null && typeof arg === 'object')

        return setStructMetadata(
            { type: 'object', schema: guard, optional: false, tree: {}, rules },
            setRuleMessage('object', guard)
        )
    }
```

Two changes: (1) the guard now calls `branchIfOptional(arg, rules) || (isFollowingRules(arg, rules) && shapeCheck)`, (2) the metadata `rules` field becomes the incoming `rules` parameter (was hard-coded `[]`).

(b) The with-tree branch (lines 47-86): the guard at line 58-59 currently reads:
```ts
    const guard = (arg: unknown): arg is T =>
        branchIfOptional(arg, []) || BaseValidator.hasValidProperties(arg, config)
```

Note `branchIfOptional(arg, [])` passes an empty array — this is the current behavior (no rules). Replace with:
```ts
    const guard = (arg: unknown): arg is T =>
        branchIfOptional(arg, rules) ||
        (isFollowingRules(arg, rules) && BaseValidator.hasValidProperties(arg, config))
```

Also update the metadata `rules` field at line 83 from `rules: [],` to `rules,`.

### Step 4: Add the rules accumulator + schema.strict in the IIFE factory

- [ ] Inside the IIFE factory at lines 99-160, three additions:

(a) Add a `rules` accumulator alongside `customRules` (currently at line 100). After:
```ts
export const object: ObjectSchema = ((tree?: ValidatorMap<any>) => {
    const customRules: Custom<any[], string, object>[] = []
    const callStack: { [key: string]: boolean } = {}
```

Add:
```ts
export const object: ObjectSchema = ((tree?: ValidatorMap<any>) => {
    const customRules: Custom<any[], string, object>[] = []
    const rules: ObjectRule[] = []
    const callStack: { [key: string]: boolean } = {}
```

(b) Update `getGuard()` (lines 103-107) to pass `rules`. Current:
```ts
    const getGuard = () => {
        const resolver = callStack['optional'] ? _object.optional : _object
        return tree ? resolver(tree) : resolver()
    }
```

New:
```ts
    const getGuard = () => {
        const resolver = callStack['optional'] ? _object.optional : _object
        return tree ? resolver(tree, rules) : resolver(rules)
    }
```

(c) In `addCall` (lines 119-149), add the `rules.push` line that mirrors `array.ts:168`. Find the existing `if (fnName === 'use') { ... } else { callStack[fnName] = true }` block (lines 139-144) and replace with:

Current:
```ts
        if (fnName === 'use') {
            validateCustomRules(_rules)
            customRules.push(...(_rules as Custom<any[], string, object>[]))
        } else {
            callStack[fnName] = true
        }
```

New:
```ts
        if (fnName === 'use') {
            validateCustomRules(_rules)
            customRules.push(...(_rules as Custom<any[], string, object>[]))
        } else {
            callStack[fnName] = true

            if (fnName !== 'optional') rules.push(...(_rules as ObjectRule[]))
        }
```

The `if (fnName !== 'optional')` guard matches `array.ts:168` exactly — `optional` only flips `callStack['optional']`, never pushes to `rules[]` (optional is plumbed via `optionalizeOverloadFactory`, not the rules array).

(d) Add `schema.strict` alongside the other fluent methods (after `schema.optional` at line 151, before `schema.validator` at line 152):

```ts
    schema.optional = () => addCall('optional')
    schema.strict = () =>
        addCall('strict', [ObjectRules.strict(Object.keys(tree ?? {}))])
    schema.validator = (throwOnError = true) => addCall('validator', [], { throwOnError })
```

`Object.keys(tree ?? {})` captures the allowed-key list from the closure at factory-construction time. The `?? {}` defends against `tree === undefined` (the `object()` wildcard-object case — `Object.keys({}) === []`, which makes `.strict()` reject any non-empty object per the spec's degenerate edge case).

### Step 5: Verify typecheck passes

- [ ] Run: `yarn tsc -p tsconfig.json --noEmit`

Expected: PASS. This is the critical typecheck gate — if the `_fn` overload refactor or the `isFollowingRules(arg, rules)` call signature is wrong, this is where it surfaces. The `isFollowingRules` overload at `schema/helpers/isFollowingRules.ts:26` (`export function isFollowingRules(arg: unknown, rules: DefaultRules[]): boolean`) needs `ObjectRule` to be part of `Default` — which Task 2 already did.

### Step 6: Verify lint is clean

- [ ] Run: `yarn check`

Expected: PASS. Run `yarn check:fix` if Biome/Prettier flags anything, then re-stage auto-fixed files.

### Step 7: Verify the existing test suite still passes (refactor regression check)

- [ ] Run: `yarn test`

Expected: PASS. The existing `object.spec.ts` (30 lines) must remain green — the refactor preserves the no-args default (`rules: ObjectRule[] = []`) so `object({ id: string() })` without `.strict()` behaves identically. If any test fails, the refactor introduced a behavioral regression and must be fixed before proceeding.

### Step 8: Commit

- [ ] Commit:

```bash
git add src/validators/schema/object.ts
git commit -S -m "feat(schema): refactor object _fn to thread rules and add .strict()

_fn now accepts a trailing rules: ObjectRule[] parameter and threads
isFollowingRules(arg, rules) into the guard, mirroring array.ts:81-83.
The IIFE factory accumulates rules and exposes schema.strict(), which
pushes the Object.strict rule with closure-captured allowedKeys."
```

Pre-commit hook runs full `build:clean → check:fix → test → circular-dependencies` — all must pass.

---

## Task 4: Widen ObjectSchema.ts and GetSchema.ts fluent types

**Files:**
- Modify: `src/validators/schema/types/ObjectSchema.ts` (widen `TRules` slot from `{}` to `typeof ObjectRules`)
- Modify: `src/validators/schema/types/GetSchema.ts` (widen specific-object branch to include `ObjectSchemaRules`)

Without this task, `.strict()` works at runtime (Task 3 wired it into the IIFE) but is invisible at compile time — TypeScript won't show `.strict()` as an available method on `object({...})`'s return type. Generic consumers using `GetSchema<T>` to derive schema types from a `T extends {}` would also miss `.strict()`.

### Step 1: Widen TRules in ObjectSchema.ts

- [ ] Replace the entire contents of `src/validators/schema/types/ObjectSchema.ts` with:

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

The `import type { ObjectRules } from '../../rules/Object/index.ts'` is a type-only import (the `typeof ObjectRules` expression extracts just the type, no runtime dependency). This means `ObjectSchema.ts` does NOT add a circular runtime import — verified by `yarn circular-dependencies` in Step 4.

The `TRules` type param on `FluentSchema` (see `FluentSchema.ts:11`) is constrained to `extends { [x: string]: Fn<any[], any> }`. `typeof ObjectRules` is `{ readonly strict: (...) => [...] }` — the `strict` factory returns a tuple, and tuples are callable as functions in the TS type system. This matches how `ArrayRules` and `RecordRules` (which similarly have function-returning factories) satisfy the same constraint today.

### Step 2: Widen GetSchema.ts specific-object branch

- [ ] In `src/validators/schema/types/GetSchema.ts`, add the `ObjectRules` import after the existing rule-imports block (lines 2-5):

```ts
import type { FluentSchema } from './FluentSchema.ts'
import type { StringRules } from '../../rules/String/index.ts'
import type { NumberRules } from '../../rules/Number/index.ts'
import type { ObjectRules } from '../../rules/Object/index.ts'
import type { ArrayRules } from '../../rules/Array/index.ts'
import type { RecordRules } from '../../rules/Record/index.ts'
import type { Sanitize } from '../../types/index.ts'
```

- [ ] Add the `ObjectSchemaRules` alias alongside the existing `*SchemaRules` aliases (lines 8-11):

```ts
type StringSchemaRules = Omit<typeof StringRules, 'optional'>
type NumberSchemaRules = Omit<typeof NumberRules, 'optional'>
type ArraySchemaRules = Omit<typeof ArrayRules, 'optional'>
type RecordSchemaRules = Omit<typeof RecordRules, 'optional'>
type ObjectSchemaRules = typeof ObjectRules
```

Note: `ObjectSchemaRules = typeof ObjectRules` (NO `Omit<...>`) because `ObjectRules` from Task 1 already excludes `optional` — unlike `ArrayRules`/`RecordRules`/etc. which all include `optional` in their `*Rules` const and require `Omit` to strip it for the `TRules` slot.

- [ ] Update the specific-object branch (line 104). Current:
```ts
                                                : // Specific object: use Sanitize for optional prop normalization
                                                  FluentSchema<Sanitize<T>>
```

New:
```ts
                                                : // Specific object: use Sanitize for optional prop normalization;
                                                  // ObjectSchemaRules exposes .strict() to generic consumers
                                                  FluentSchema<Sanitize<T>, ObjectSchemaRules>
```

### Step 3: Verify the existing GetSchema.spec.ts still passes (no regression)

- [ ] Run: `yarn vitest run src/validators/schema/types/__tests__/GetSchema.spec.ts`

Expected: PASS. The existing `GSObject` assertion at line 121 is `Assert<FluentSchema<Sanitize<{ foo: string }>>, GetSchema<{ foo: string }>>` — where `Assert<T, U extends T>` checks that `U` is assignable to `T`. Since `FluentSchema<Sanitize<T>, ObjectSchemaRules, []>` is a more-specific subtype of `FluentSchema<Sanitize<T>>` (extra generic params with defaults), it's still assignable to the base `FluentSchema<Sanitize<T>>`, so `GSObject` passes unchanged.

### Step 4: Verify typecheck, lint, circular dependencies

- [ ] Run: `yarn tsc -p tsconfig.json --noEmit && yarn check && yarn circular-dependencies`

Expected: All three PASS. The `yarn circular-dependencies` check (madge) is important here — adding the `ObjectRules` type import to `ObjectSchema.ts`/`GetSchema.ts` could in principle create a cycle if the import were a value import. Since both are `import type`, madge's runtime graph sees no new edge, but running the gate confirms this.

### Step 5: Commit

- [ ] Commit:

```bash
git add src/validators/schema/types/ObjectSchema.ts src/validators/schema/types/GetSchema.ts
git commit -S -m "feat(schema): expose .strict() in ObjectSchema and GetSchema fluent types

Widens TRules slot from {} to typeof ObjectRules so .strict() surfaces
as a typed method on object({...}) return values and on GetSchema<T>
for generic consumers. ObjectSchemaRules skips the Omit<...> since
ObjectRules already excludes optional."
```

---


## Task 5: Write the strict-mode test suite (TDD)

**Files:**
- Create: `src/validators/__tests__/object.strict.spec.ts`
- Modify: `src/validators/schema/types/__tests__/GetSchema.spec.ts` (add compile-time assertions)

This task follows TDD: write the runtime test file, watch it pass (Tasks 1-3 already implemented the runtime behavior — the tests verify rather than drive), then add the compile-time assertions and run the typecheck. Note the inverted TDD flavor: the production code already lands in Tasks 1-3 because the registry-wiring nature of the change made per-task TDD impractical (the build couldn't compile without Tasks 1+2 together). The tests now serve as the regression gate for the runtime contract and the API surface.

### Test file scaffolding

- [ ] **Step 1: Create the test file with imports and describe wrapper**

Create `src/validators/__tests__/object.strict.spec.ts`:

```ts
import { object } from '../schema/object.ts'
import { string } from '../schema/string.ts'
import { number } from '../schema/number.ts'
import { boolean } from '../schema/boolean.ts'
import { ValidationErrors } from '../ValidationErrors.ts'
import { getStructMetadata } from '../schema/helpers/getStructMetadata.ts'

describe('object - strict mode', () => {
    describe('boolean guard', () => {
        // Tests added in subsequent steps
    })

    describe('throwing validator', () => {
        // Tests added in subsequent steps
    })

    describe('wildcard object (no tree)', () => {
        // Tests added in subsequent steps
    })

    describe('nested', () => {
        // Tests added in subsequent steps
    })

    describe('metadata introspection', () => {
        // Tests added in subsequent steps
    })
})
```

### Boolean guard tests

- [ ] **Step 2: Add boolean guard tests**

Inside the `describe('boolean guard', ...)` block, add:

```ts
        it('rejects unknown keys when strict() is chained', () => {
            const schema = object({ id: string() }).strict()

            expect(schema({ id: 'abc' })).toBe(true)
            expect(schema({ id: 'abc', extra: 'oops' })).toBe(false)
        })

        it('accepts objects whose keys exactly match the tree', () => {
            const schema = object({ id: string(), name: string() }).strict()

            expect(schema({ id: 'abc', name: 'Alice' })).toBe(true)
        })

        it('accepts objects missing optional keys when strict() is chained', () => {
            const schema = object({
                id: string(),
                name: string().optional(),
            }).strict()

            expect(schema({ id: 'abc' })).toBe(true)
            expect(schema({ id: 'abc', name: 'Alice' })).toBe(true)
            expect(schema({ id: 'abc', extra: 'oops' })).toBe(false)
        })

        it('rejects unknown keys alongside missing required keys (short-circuits to false)', () => {
            const schema = object({ id: string(), name: string() }).strict()

            expect(schema({ id: 'abc', extra: 'oops' })).toBe(false)
        })

        it('passes through undefined when strict + optional are both chained', () => {
            const schema = object({ id: string() }).strict().optional()

            expect(schema(undefined)).toBe(true)
            expect(schema({ id: 'abc' })).toBe(true)
            expect(schema({ id: 'abc', extra: 'oops' })).toBe(false)
        })

        it('order independence: strict().optional() behaves same as optional().strict()', () => {
            const schemaOrdered = object({ id: string() }).strict().optional()
            const schemaReversed = object({ id: string() }).optional().strict()

            expect(schemaOrdered(undefined)).toBe(schemaReversed(undefined))
            expect(schemaOrdered({ id: 'abc' })).toBe(schemaReversed({ id: 'abc' }))
            expect(schemaOrdered({ id: 'abc', extra: 'x' })).toBe(
                schemaReversed({ id: 'abc', extra: 'x' })
            )
        })

        it('throws when .strict() is called twice', () => {
            const schema = object({ id: string() })

            expect(() => (schema as any).strict().strict()).toThrow(
                /Cannot call strict more than once/
            )
        })

        it('preserves strict behavior under toStandardSchema() interop', () => {
            const schema = object({ id: string() }).strict()
            const standard = schema.toStandardSchema()
            const result = standard['~standard'].validate({ id: 'abc', extra: 'x' })

            expect(result.success).toBe(false)
        })
```

### Throwing validator tests

- [ ] **Step 3: Add throwing validator tests**

Inside the `describe('throwing validator', ...)` block, add:

```ts
        it('throws ValidationErrors with a strict error for unknown keys', () => {
            const schema = object({ id: string() }).strict()

            expect(() => schema.validator().validate({ id: 'abc', extra: 'x' })).toThrow(
                ValidationErrors
            )
        })

        it('aggregates strict + per-key errors when both fail', () => {
            const schema = object({ id: string() }).strict()

            let caught: ValidationErrors | null = null
            try {
                schema.validator().validate({ id: 123, extra: 'x' })
            } catch (e) {
                caught = e as ValidationErrors
            }

            expect(caught).toBeInstanceOf(ValidationErrors)
            expect(caught!.errors.length).toBeGreaterThanOrEqual(2)

            const messages = caught!.errors.map(e => e.message)
            expect(messages).toContain('strict')
            expect(messages.some(m => /Invalid value for key id/.test(m))).toBe(true)
        })

        it('returns the value (no throw) when strict passes', () => {
            const schema = object({ id: string() }).strict()

            const value = { id: 'abc' }
            expect(() => schema.validator().validate(value)).not.toThrow()
            expect(schema.validator().validate(value)).toEqual(value)
        })
```

Note: the `messages.some(m => /Invalid value for key id/.test(m))` regex mirrors the existing per-key error message shape at `BaseValidator.ts:27` (`Invalid value for key ${String(key)}`). The `toBeGreaterThanOrEqual(2)` rather than exact `=== 2` is intentional — the throwing validator's error aggregation order isn't guaranteed stable across refactors, and other sub-errors (e.g. nested messages from the `string()` validator) might appear; the test asserts that BOTH kinds are present, not exactly two errors.

### Wildcard object tests

- [ ] **Step 4: Add wildcard-object tests**

Inside the `describe('wildcard object (no tree)', ...)` block, add:

```ts
        it('rejects any non-empty object when object().strict() is called', () => {
            const schema = object().strict()

            expect(schema({})).toBe(true)
            expect(schema({ anyKey: 'anyValue' })).toBe(false)
        })

        it('accepts {} when object().strict() is called', () => {
            const schema = object().strict()

            expect(schema({})).toBe(true)
        })
```

### Nested tests

- [ ] **Step 5: Add nested tests**

Inside the `describe('nested', ...)` block, add:

```ts
        it('strict on outer object does not affect nested object schemas', () => {
            const schema = object({
                inner: object({ id: string() }),
            }).strict()

            expect(schema({ inner: { id: 'abc' } })).toBe(true)
            expect(schema({ inner: { id: 'abc', extra: 'x' }, unknownKey: true })).toBe(false)
            expect(schema({ inner: { id: 'abc', extra: 'x' } })).toBe(
                false
            )
        })

        it('strict on nested object rejects unknown keys in the nested value', () => {
            const schema = object({
                inner: object({ id: string() }).strict(),
            })

            expect(schema({ inner: { id: 'abc' } })).toBe(true)
            expect(schema({ inner: { id: 'abc', extra: 'x' } })).toBe(false)
        })
```

The first nested test asserts that the *outer* `.strict()` rejects unknown outer keys (`unknownKey: true` → false) AND that the outer strict does NOT cascade to the inner (the inner has no `.strict()`, so `{id:'abc', extra:'x'}` inside inner is allowed unless inner also has strict). The `inner: {id:'abc', extra:'x'}` case returns `false` because of the `unknownKey: true` — not because of the inner's `extra`. Verify this intent by reading the test carefully before running.

The second test pins down that strict is per-`object()`-instance — strict on the inner means the inner rejects extra keys, regardless of whether the outer is strict.

### Metadata introspection tests

- [ ] **Step 6: Add metadata introspection tests**

Inside the `describe('metadata introspection', ...)` block, add:

```ts
        it('records Object.strict rule in struct metadata.rules', () => {
            const schema = object({ id: string() }).strict()
            const metadata = getStructMetadata(schema) as any

            expect(Array.isArray(metadata.rules)).toBe(true)
            expect(metadata.rules.length).toBeGreaterThan(0)
        })

        it('getStructMetadata(schema).rules contains the strict rule struct', () => {
            const schema = object({ id: string(), name: string() }).strict()
            const metadata = getStructMetadata(schema) as any
            const strictRuleStruct = metadata.rules.find(
                (r: any) => r.rule === '__Object.strict__'
            )

            expect(strictRuleStruct).toBeDefined()
            expect(strictRuleStruct.type).toBe('default')
            expect(strictRuleStruct.args).toEqual([['id', 'name']])
        })
```

The `strictRuleStruct.args` being `[['id', 'name']]` (a single-element array containing the allowedKeys array) matches the rule structural shape at `RuleValidator.ts:36-39`. This test guards the structural contract for any external tooling that introspects `V3.ObjectStruct.rules`.

### Run the runtime test suite

- [ ] **Step 7: Run the new spec file**

Run: `yarn vitest run src/validators/__tests__/object.strict.spec.ts`

Expected: All `it()` blocks PASS. If any fail, debug before proceeding — the production code (Tasks 1-3) should already make all assertions pass because the spec design was driven by tracing the existing code paths.

Common failure modes and fixes:
- `'Cannot call strict more than once' regex doesn't match` — the actual error message is `Cannot call ${fnName} more than once` where `fnName` is `'strict'` (see `object.ts:124`). Adjust the regex to `/Cannot call strict more than once/` or `/Cannot call strict/`.
- `schema.validator().validate(value)` returns `ValidateReturn` not `T` when `throwOnError=false` — note all the throwing-validator tests use `.validator()` (default `true`) which returns `T` directly on success.
- `messages.toContain('strict')` — the formator returns `'strict'`. If you see `[rule: strict]` instead, you forgot the formator returns just `strict` and the `template()` wrapper applies to Record.nonEmpty (not to our Object.strict). Re-verify by reading `rules/Object/formators/strict.ts` from Task 1.

### Compile-time assertions in GetSchema.spec.ts

- [ ] **Step 8: Add the GSObjectWithRules assertion**

In `src/validators/schema/types/__tests__/GetSchema.spec.ts`, add the `ObjectRules` import alongside the existing `RecordRules` import (line 26):

```ts
import type { RecordRules } from '../../../rules/Record/index.ts'
import type { ObjectRules } from '../../../rules/Object/index.ts'
```

Then add the `ObjectSchemaRules` alias and the two compile-time assertions, alongside the existing `RecordSchemaRules` alias (line 100) and `_recordHasNonEmpty` (line 139). Place them right after the `RecordSchemaRules` block:

```ts
type ObjectSchemaRules = typeof ObjectRules

// GetSchema<{ foo: string }> → FluentSchema<Sanitize<{ foo: string }>, ObjectSchemaRules>
// Strict: verify ObjectSchemaRules is present (not {}), ensuring .strict() is available
type GSObjectWithRules = Assert<
    FluentSchema<Sanitize<{ foo: string }>, ObjectSchemaRules, []>,
    GetSchema<{ foo: string }>
>

// Verify object types have .strict() method available (parallels _recordHasNonEmpty)
type _objectHasStrict = 'strict' extends keyof GetSchema<{ foo: string }> ? true : false
type _assertObjectStrict = Assert<true, _objectHasStrict>
```

- [ ] **Step 9: Extend the _type_checks tuple to suppress noUnusedLocals**

In the same file, find the `_type_checks` tuple at lines 143-170 and append the two new type aliases before the closing `]`:

```ts
const _type_checks: [
    GSAny,
    GSUnknown,
    GSVoid,
    GSNever,
    GSString,
    GSStringLiteral,
    GSNumber,
    GSNumberLiteral,
    GSBigint,
    GSBoolean,
    GSNull,
    GSUndefined,
    GSSymbol,
    GSStringArray,
    GSReadonlyStringArray,
    GSTuple,
    GSRecord,
    GSRecordNumberKey,
    GSRecordSymbolKey,
    GSObject,
    GSObjectWithRules,
    GSOptionalObject,
    GSUnion,
    GSFunction,
    GSDate,
    _recordHasNonEmpty,
    _assertNonEmpty,
    _objectHasStrict,
    _assertObjectStrict,
] = null as any
void _type_checks
```

- [ ] **Step 10: Run the GetSchema.spec.ts to confirm no runtime regression**

Run: `yarn vitest run src/validators/schema/types/__tests__/GetSchema.spec.ts`

Expected: PASS. The two `it()` blocks at lines 29-31 and 35-37 just do `expect(true).toBe(true)` to keep the file executable — the real assertion is compile-time (Step 11).

- [ ] **Step 11: Run typecheck to verify the compile-time assertions hold**

Run: `yarn tsc -p tsconfig.json --noEmit`

Expected: PASS. If `GSObjectWithRules` fails, it means `GetSchema<{ foo: string }>`'s second type param doesn't match `ObjectSchemaRules` — reexamine Task 4's GetSchema.ts edit. If `_objectHasStrict` fails (resolves to `false`), `.strict()` isn't surfacing through the `FluentSchema`'s `Exclude<keyof TRules, TCalledRules[number]>` machinery — reexamine Task 4's ObjectSchema.ts edit and Task 1's `ObjectRules` shape.

### Combined verification

- [ ] **Step 12: Run lint + full test suite + circular dependencies + build**

Run: `yarn check && yarn test && yarn circular-dependencies && yarn build:clean`

Expected: All four PASS. The `yarn check` covers Biome lint + Prettier format on the new test file. `yarn build:clean` validates the dual ESM + CJS build still produces clean declaration files.

- [ ] **Step 13: Commit**

- [ ] Commit:

```bash
git add src/validators/__tests__/object.strict.spec.ts src/validators/schema/types/__tests__/GetSchema.spec.ts
git commit -S -m "test(schema): add strict-mode test suite for object()

Runtime tests covering boolean guard, throwing validator (with
multi-error aggregation), wildcard object edge case, nested strict
isolation, and metadata introspection. Compile-time assertions in
GetSchema.spec.ts verify .strict() surfaces on GetSchema<T> for
generic consumers."
```

---


## Task 6: Update README.md to document .strict()

**Files:**
- Modify: `README.md` (lines 89-102 — `Schema.object` section)

Per AGENTS.md's release-readme-prompt convention: README lists user-facing APIs only. `.strict()` is user-facing → documented in README. The underlying `__Object.strict__` key string and `ObjectRules` internal name are NOT in README (they belong in CHANGELOG / GitHub release notes).

- [ ] **Step 1: Update the fluent API list line (line 102)**

In `README.md`, find line 102 (inside the `Schema.object` section):

Current:
```
Supports the fluent `.optional()`, `.validator()`, `.use()`, and `.toStandardSchema()` APIs.
```

New:
```
Supports the fluent `.strict()`, `.optional()`, `.validator()`, `.use()`, and `.toStandardSchema()` APIs.
```

Alphabetical-ish ordering: `.strict()` first because it's the newest addition and conceptually foundational (it constrains the whole object's shape). The existing lists in this file don't follow strict alphabetical order — they follow a "type-shaping rules first, then validator/runtime utilities" pattern (see `Schema.string` at line 63: `.max()`, `.min()`, `.regex()`, `.nonEmpty()`, `.url()`, `.email()`, `.optional()`, `.validator()`, `.use()`, and `.toStandardSchema()`). `.strict()` fits the "type-shaping" prefix group.

- [ ] **Step 2: Add a strict-mode example block after the existing Schema.object example**

After the existing code block (lines 93-100), insert a new paragraph + example:

Current (lines 100-102):
```
})
```

Supports the fluent `.optional()`, `.validator()`, `.use()`, and `.toStandardSchema()` APIs.
```

New:
```
})
```

Use `.strict()` to reject objects containing keys not declared in the tree:

```typescript
import { object, string, number } from '@srhenry/type-utils'

const isUser = object({
    id: number(),
    name: string(),
}).strict()

isUser({ id: 1, name: 'Alice' })               // true
isUser({ id: 1, name: 'Alice', age: 30 })      // false — 'age' is not declared
```

Supports the fluent `.strict()`, `.optional()`, `.validator()`, `.use()`, and `.toStandardSchema()` APIs.
```

The two-line comments on the example (`// true` and `// false — 'age' is not declared`) match the style of the existing `isItem({ id: 'item-1' }) // true` example further down at line 283.

- [ ] **Step 3: Verify markdown renders cleanly**

Run: `npx prettier --check README.md`

Expected: PASS. If prettier flags anything (most likely an indentation issue in the example block), run `npx prettier --write README.md` and re-stage.

- [ ] **Step 4: Commit**

- [ ] Commit:

```bash
git add README.md
git commit -S -m "docs(README): document object().strict() API

Add .strict() to the fluent API list for Schema.object and a short
example showing rejection of unknown keys. Per AGENTS.md
release-readme-prompt: user-facing API → README; internal rule name
(__Object.strict__) → CHANGELOG/release notes."
```

---

## Task 7: Full pre-commit verification + PR handoff

**Files:**
- No new files — this task runs the full validation pipeline and prepares the PR

This task is the final gate before opening the PR. All earlier task commits ran the pre-commit hook (which already does `build:clean → check:fix → test → circular-dependencies`), but this task explicitly re-runs every gate in sequence to catch any cross-task regressions and to produce clean evidence for the PR description.

- [ ] **Step 1: Run the mandatory typecheck**

Run: `yarn tsc -p tsconfig.json --noEmit`

Expected: exit 0. This is the AGENTS.md-mandatory typecheck — never skipped regardless of test status.

- [ ] **Step 2: Run lint + format check**

Run: `yarn check`

Expected: PASS. If anything fails, run `yarn check:fix`, then `git diff` to inspect the auto-fixes, stage, and commit them as a separate `style:` commit.

- [ ] **Step 3: Run the full test suite**

Run: `yarn test`

Expected: All tests PASS. Confirm specifically that:
- `src/validators/__tests__/object.spec.ts` — original object tests unchanged, all green
- `src/validators/__tests__/object.strict.spec.ts` — new strict tests, all green
- `src/validators/__tests__/record.spec.ts` — unaffected, all green
- `src/validators/__tests__/[...schemas].validator.spec.ts` — unaffected, all green
- `src/validators/schema/types/__tests__/GetSchema.spec.ts` — new compile-time assertions resolve, all green

- [ ] **Step 4: Run circular-dependency check**

Run: `yarn circular-dependencies`

Expected: PASS (no cycles detected). The new `rules/Object/` subtree imports `rules/constants.ts` and `rules/types/RuleFactory.ts`; `rules/types/index.ts` imports `rules/Object/index.ts` as a type-only import. Type-only imports don't appear in madge's runtime graph, so the cycle shouldn't exist, but this gate confirms it.

- [ ] **Step 5: Run the dual-build clean**

Run: `yarn build:clean`

Expected: PASS (ESM + CJS both build, `.d.ts` declarations generated cleanly via `scripts/fix-declarations.mjs`). If the build fails on a declaration-file issue, inspect `dist/` or `types/` for the offending `.d.ts` — the `build:fix-declarations` step rewrites `.ts` extensions to `.js` in `.d.ts` files; a new module with the wrong extension pattern would surface here.

- [ ] **Step 6: Confirm TASKS.md task removal**

Open `TASKS.md` and plan to remove the `schema-object-strict` block (lines 59-62 in the current main checkout, may have shifted) once the PR merges. Do NOT remove it yet — per AGENTS.md task management protocol, tasks are removed after implementation is verified (post-merge), not during the PR. Just confirm the line is still there for the post-merge cleanup step.

- [ ] **Step 7: Inspect the final git log**

Run: `git log --oneline origin/developer..HEAD`

Expected: a clean linear sequence of commits, each with Conventional Commits format:
- `feat(schema): add Object.strict rule subtree (...)` (Task 1+2 bundled, or separate if hook permitted)
- `feat(schema): refactor object _fn to thread rules and add .strict()` (Task 3)
- `feat(schema): expose .strict() in ObjectSchema and GetSchema fluent types` (Task 4)
- `test(schema): add strict-mode test suite for object()` (Task 5)
- `docs(README): document object().strict() API` (Task 6)

If any commit lacks a `feat`/`test`/`docs`/`refactor`/`fix` prefix, or if the author identity on any commit is placeholder, fix before pushing.

- [ ] **Step 8: Push to all remotes**

Run (substitute the actual branch name — default is `feat/schema-object-strict`):

```bash
for remote in $(git remote); do git push -u "$remote" feat/schema-object-strict || echo "WARNING: push to $remote failed"; done
```

Per AGENTS.md PR workflow — push to all remotes, warn on per-remote failure but continue. If ALL remotes fail, stop and ask the user for guidance.

- [ ] **Step 9: Open the PR**

Run:

```bash
gh pr create --base developer \
    --title "feat(schema): add object().strict() to reject unknown keys" \
    --body "..."
```

For the `--body`, use the PR template if one exists in `.github/PULL_REQUEST_TEMPLATE.md` (check first with `ls .github/`). The body should summarize:
- **What**: New `.strict()` fluent method on `object(...)` schemas
- **Why**: Allows validation that rejects unknown keys at runtime (e.g. for config validation, API payloads)
- **How**: New `Object.strict` rule registered in `keys`/`bindings`, threaded through `object.ts` `_fn` like `array.ts` does for `Array.unique`. Boolean guard short-circuits; throwing validator aggregates strict + per-key errors.
- **Testing**: New `object.strict.spec.ts` (~15 it blocks) + compile-time assertions in `GetSchema.spec.ts`
- **Docs**: README updated under `Schema.object`
- **Task**: closes the `schema-object-strict` entry from `TASKS.md` (P2)
- **Spec**: link to `docs/superpowers/specs/2026-07-10-schema-object-strict-design.md`

After `gh pr create` returns the PR URL, share it with the user.

- [ ] **Step 10: Wait for CI**

PR CI runs `.github/workflows/ci.yml` (typecheck, lint, test, circular dependencies, build). If any check fails:
- Read the failure output carefully
- Fix the issue locally in the worktree
- Commit the fix as a follow-up with Conventional Commits format (e.g. `fix(schema): <what was wrong>`)
- Push to all remotes via the same `for remote in ...` loop
- Repeat until CI is green

Do NOT mark the TODOs as complete or close the worktree until CI is green AND the user has approved the PR.

---

## Self-Review Checklist (run before handoff)

After all tasks are written, run this checklist mentally:

**Spec coverage** — for each section of the design spec, point to the implementing task:
- Architecture (first-class rule, two dispatch paths) → Tasks 1, 2, 3
- Components (rules/Object subtree, constants.ts, types/index.ts, ObjectSchema.ts, GetSchema.ts, object.ts) → Tasks 1, 2, 4, 3 (in that order)
- Data Flow (construction, fluent call, boolean guard, throwing validator, optional chaining, std-schema interop) → Task 3 (construction + fluent call), Task 5 (test coverage of every flow)
- Error Handling (TypeGuardError reuse, multi-error aggregation) → Task 5 (multi-error test)
- Edge Cases (no-tree degenerate, optional+strict order-independence, double-strict throw, nested isolation) → Task 5 (wildcard tests, order-independence test, double-strict test, nested tests)
- Testing (test matrix) → Task 5
- Documentation Update (README) → Task 6
- File Inventory → matches Tasks 1-7
- Risks and Mitigations → Task 7 runs the explicit gates (circular-dep, typecheck, build, test)
- Acceptance Criteria → Task 7 Step 1-5 covers all the `yarn ...` gates; Task 5 covers the behavioral criteria

**Placeholder scan** — search the plan for `TBD`, `TODO`, `FIXME`, `XXX`, `...` (ellipsis outside code blocks), `implement later`. Fix any found.

**Type consistency** — `ObjectRules`, `ObjectRule`, `ObjectSchemaRules`, `strictFormator`, `objectStrictFormator`, `objectStrictHandler` — verify each name is used consistently across tasks. The alias `objectStrictFormator` in `constants.ts` (Task 2) vs `strictFormator` in `formators/strict.ts` (Task 1) is intentional — verify the import reads `import { strictFormator as objectStrictFormator }`.

**Commit signature presence** — every `git commit -S` must include `-S` for GPG signing per AGENTS.md.

---

