# TODO

## Refactor `SchemaValidator.validate()` — Cognitive Complexity 150

**File:** `src/validators/SchemaValidator.ts:118`
**Current complexity:** 150 (threshold: 20)
**Override:** `maxAllowedComplexity: 160` in `biome.json` overrides (temporary)

The `validate()` function is a 760+ line monolith handling every schema type in a single switch-case. It should be refactored by extracting each case into its own named function:

- `validateObject()` — object/tree/entries/class validation
- `validateRecord()` — record with enum/string/number/symbol/custom key subtypes
- `validateIntersection()` — intersection type validation
- `validateUnion()` — union type validation
- `validateTuple()` — tuple validation
- `validateEnum()` — enum validation
- `validatePrimitive()` — primitive type validation
- `validateNull()` / `validateUndefined()` — null/undefined validation
- `validateCustom()` — custom schema validation

The main `validate()` function should become a clean dispatcher that delegates to type-specific handlers. This makes each case independently readable and testable.

**Suggested approach:** Incremental — extract one case per commit, verify tests pass after each extraction.
