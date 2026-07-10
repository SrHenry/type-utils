# TASKS

## P0 — Critical

## P1 — High

- [ ] Implement `claude` adapter (Claude Code CLI) for release.sh
    - **ID**: release-claude-adapter
    - **Files**: `workflows/release/release.sh`
    - **Acceptance**: `claude` harness adapter name recognized, release.sh can use it end-to-end
- [ ] Implement `codex` adapter (OpenAI Codex CLI) for release.sh
    - **ID**: release-codex-adapter
    - **Files**: `workflows/release/release.sh`
    - **Acceptance**: `codex` harness adapter name recognized, release.sh can use it end-to-end
- [ ] Implement `hermes` adapter for release.sh
    - **ID**: release-hermes-adapter
    - **Files**: `workflows/release/release.sh`
    - **Acceptance**: `hermes` harness adapter name recognized, release.sh can use it end-to-end
- [ ] Implement `openclaw` adapter for release.sh
    - **ID**: release-openclaw-adapter
    - **Files**: `workflows/release/release.sh`
    - **Acceptance**: `openclaw` harness adapter name recognized, release.sh can use it end-to-end
- [ ] Implement `antigravity` adapter for release.sh
    - **ID**: release-antigravity-adapter
    - **Files**: `workflows/release/release.sh`
    - **Acceptance**: `antigravity` harness adapter name recognized, release.sh can use it end-to-end

## P2 — Medium

- [ ] Register new adapter names in `_HARNESS_ADAPTERS` and `_harness_adapter_name()`
    - **ID**: release-register-adapters
    - **Blocked by**: release-claude-adapter, release-codex-adapter, release-hermes-adapter, release-openclaw-adapter, release-antigravity-adapter
    - **Files**: `workflows/release/release.sh`
- [ ] Add adapter-specific env vars to `.env.example` (e.g. CLAUDE_CODE_MODEL)
    - **ID**: release-adapter-env
    - **Blocked by**: release-register-adapters
    - **Files**: `.env.example`
- [ ] `--auto-merge` with conflict detection and resolution hints
    - **ID**: release-auto-merge
    - **Files**: `workflows/release/release.sh`
- [ ] Changelog deduplication (merge commits vs. squash)
    - **ID**: release-changelog-dedup
    - **Files**: `workflows/release/release.sh`
- [ ] Dry-run diff: show what package.json would look like after bump
    - **ID**: release-dry-run-diff
    - **Files**: `workflows/release/release.sh`
- [ ] `--skip-tag` flag: skip tag creation (for CI/CD that manages tags separately)
    - **ID**: release-skip-tag
    - **Files**: `workflows/release/release.sh`
- [ ] `--remote <name>` flag: push to specific remote only (instead of all)
    - **ID**: release-remote-flag
    - **Files**: `workflows/release/release.sh`
- [ ] `--sign-commit` flag: GPG-sign the version bump commit
    - **ID**: release-sign-commit
    - **Files**: `workflows/release/release.sh`
- [ ] Interactive mode: prompt for confirmation at each step
    - **ID**: release-interactive
    - **Files**: `workflows/release/release.sh`
- [ ] Strict mode: `object<T>().strict()` or `FluentSchema.strict()` that rejects unknown properties at runtime (no extra keys beyond the validator tree)
    - **ID**: schema-object-strict
    - **Files**: `src/schema/`
    - **Acceptance**: Strict-mode object validator rejects unknown keys at runtime, tests pass
- [ ] Drop orphan devDependencies `ts-node` and `tsx`
    - **ID**: drop-orphan-devdeps
    - **Details**: `ts-node@^10.9.2` and `tsx@^4.21.0` are listed in `devDependencies` but referenced by no script, config, or workflow in `package.json`, `vitest.config.ts`, `tsconfig*.json`, or `.github/workflows/*.yml` (verified during the TS7 upgrade planning session). Removing them shrinks the install graph and avoids one of the `yarn install` peer-warning lines. Discovered before the TS7 PR.
    - **Files**: `package.json`, `yarn.lock`
    - **Acceptance**: `yarn install` succeeds without `ts-node` or `tsx` in `devDependencies`; `yarn test`, `yarn build:clean`, `yarn circular-dependencies` all pass; full CI pipeline green.
- [ ] Migrate `src/helpers/decorators/stage-2/*` usage to TC39 stage-3 decorators; drop `experimentalDecorators`
    - **ID**: migrate-stage2-to-stage3-decorators
    - **Details**: Three src files (`src/TypeGuards/TypeErrors.ts:6,8`, `src/validators/SchemaValidator.ts:292`, `src/validators/ValidationError.ts:32,35`) import legacy stage-2 decorators (`@AutoBind()`, `@NonEnumerableProperty()`) from `src/helpers/decorators/stage-2/`. A parallel `src/helpers/decorators/stage-3/` implementation already exists alongside but is unused by these three files. TS 7.0 still supports `experimentalDecorators: true` so the status quo works, but TC39-stage decorators are the future and the flag will eventually be removed. Discovered during the TS7 upgrade when the planned `experimentalDecorators` removal broke `tsc --noEmit` with TS1240/TS1241 errors (verified empirically: restored flag → tsc passes under TS 7.0.2).
    - **Files**: `src/TypeGuards/TypeErrors.ts`, `src/validators/SchemaValidator.ts`, `src/validators/ValidationError.ts`, `tsconfig.json` (remove the `experimentalDecorators: true` line once all usage migrated), `src/helpers/decorators/stage-2/` (delete if migration is complete; otherwise leave for any thrashy edge cases)
    - **Plan**:
        1. Audit each stage-2 decorator file (`AutoBind.ts`, `NonEnumerableProperty.ts`) against its stage-3 counterpart to verify behavioral parity (return-type signatures, target types).
        2. Update the three src importers to pull from `../helpers/decorators/stage-3/`.
        3. Run `yarn build:clean && yarn test && yarn tsc -p tsconfig.json --noEmit`.
        4. Remove `"experimentalDecorators": true` from `tsconfig.json`.
        5. Re-run all gates; commit only after full green.
    - **Acceptance**: All three src files compile under TS 7.0.2 without `experimentalDecorators: true`; `yarn tsc -p tsconfig.json --noEmit` exits 0 after the flag is removed; `yarn test` passes (no behavioral regression in the auto-binding / non-enumerable-property semantics); `yarn build:clean` succeeds; `tsconfig.json` no longer contains `experimentalDecorators`.
- [ ] Restore `yarn docs` (typedoc) under TypeScript 7
    - **ID**: typedoc-ts7-gap
    - **Details**: `typedoc@0.28.19` (and the latest stable `0.28.20`) declares `peerDependencies.typescript: 5.0.x || 5.1.x ... || 6.0.x` — TS 7 is not supported. typedoc uses `import ts from "typescript"` to invoke the programmatic Compiler API (`ts.readConfigFile`, `ts.sys.readFile`, `ts.createProgram`), which TS 7.0 deliberately omits (full programmatic API deferred to TS 7.1 per Microsoft's 7.0 release notes). Empirical failure: `yarn docs` errors with `TS6046: Argument for '--module' option must be: 'none','commonjs',...'node16','node18','nodenext','preserve'` and `TS5023: Unknown compiler option 'stableTypeOrdering'` when TS 7.0.2's empty API stub is used. Yarn 1.x `resolutions` cannot force a nested install of `typescript` for typedoc because typedoc declares it as a peer (not a regular dep); pinning `typedoc/typescript: 5.8.x` or `6.0.x` was attempted and didn't work. The TypeScript team published `@typescript/typescript6` (re-exports TS 6.0 API, ships `tsc6` binary) as the official side-by-side shim for tooling that needs the programmatic API.
    - **Files**: `package.json`, `yarn.lock`, (optionally) `typedoc.json`
    - **Plan**:
        1. Watch for `typedoc@1.x` stable release (prerelease `1.0.0-dev.4` has open-ended `peerDependencies: >=4.0.0` accepting TS 7).
        2. If `typedoc@1.x` stabilizes and supports TS 7: bump `devDependencies.typedoc` to that version, regenerate lockfile, verify `yarn docs` passes.
        3. If only dev-pre-releases are available: stay on TS 6 for typedoc via `@typescript/typescript6` (alias `typescript` to `npm:@typescript/typescript6` in a `typedoc-only` lockfile subtree using Yarn 1's `resolutions` `npm:` aliasing, or invoke typedoc with `node --require` shim that monkey-patches `require('typescript')` to return TS 6 inside the typedoc subprocess).
        4. Re-add `yarn docs` to CI (`yarn docs` is currently NOT in `.github/workflows/ci.yml` — only `tsc`, `check`, `test`, `circular-dependencies`, `build:clean` are).
    - **Acceptance**: `yarn docs` runs to completion under TS 7.0.2 (exit 0, HTML generated in `./docs`); the CI `.github/workflows/ci.yml` optionally re-runs `yarn docs` (or skip if API-doc regeneration is a release-only concern); the worktree does not regress when TS 7.1 launches with a stable programmatic API.

## P3 — Low

- [ ] Configure GPG signing key for AI harness commit author
    - **ID**: gpg-signing-key
    - **Details**: Key must match the author email configured in the repo's local/global git config
    - **Acceptance**: `git commit -S` succeeds without prompt for the configured author
