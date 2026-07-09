# AGENTS.md — AI Harness Guidelines

Auto-discovered by: OpenCode, Claude Code, Codex, Cursor, Windsurf, Copilot, Gemini CLI, Augment, Devin, Jules, Goose, and others.

## Session Behavior

### Classify every request before acting

| Category | Examples | Workflow |
|----------|----------|----------|
| **CODE-PRODUCING** | Features, fixes, refactors, deprecations, breaking changes | Strict — follow PR Workflow below |
| **EXPLORATORY** | Questions, debugging, codebase navigation, code review | Loose — respond conversationally, use search/read tools freely |

### CODE-PRODUCING: scope gate

Do **NOT** create branches, worktrees, or write code until all of the following are confirmed:

1. **Worktree required** — all code-producing work must happen in a local worktree at `.worktree/<topic>` (kept out of git via the `.gitignore`'s `.worktree/` entry), **never** directly in the main repo checkout's working tree. The user may explicitly opt out (e.g. "work in the main checkout" or "no worktree") — but you must never assume this; always use a worktree unless told otherwise
2. **Base branch** — which branch to target:
- `developer` for features, refactors, and non-urgent changes (default)
- `master` for hotfixes and urgent production fixes
- If the user requests a different base, analyze the case against industry standard practices (e.g., main/master for hotfixes, integration branch for features) and question the user before proceeding
3. **Related issues** — GitHub issue numbers, URLs, or external references (or explicitly "none")
4. **Scope delimited** — what's included, what's excluded, expected behavior for edge cases
5. **User confirms** — restate understanding and get explicit go-ahead before proceeding

If the request is vague or ambiguous: ask targeted questions. Better to over-clarify than to assume. Never start implementation on unclear intent.

### EXPLORATORY: conversational mode

- No branches, worktrees, or PRs
- Use search, read, and analysis tools freely
- If exploration leads to a code change, re-classify as CODE-PRODUCING and start the scope gate from the top

## Project Overview

- **Package**: `@srhenry/type-utils` (TypeScript type guards, validators, schema builders)
- **Module system**: Dual ESM + CJS (`"type": "module"`)
- **Package manager**: Yarn 1.x (classic) — **never use `npm install`**, always `yarn install`
- **Test runner**: Vitest
- **Linter**: Biome (lint only, no formatting)
- **Formatter**: Prettier
- **TypeScript**: v6, strict mode

## Build & Development Commands

| Command | Purpose |
|---------|---------|
| `yarn install` | Install dependencies (required after checkout) |
| `yarn build` | Build ESM + CJS outputs |
| `yarn build:clean` | Clean + build (`yarn run clear` then `yarn build`) |
| `yarn test` | Run all tests (Vitest, single run) |
| `yarn test:coverage` | Run tests with coverage |
| `yarn check` | Biome lint + Prettier check (no writes) |
| `yarn check:fix` | Biome lint + Prettier fix (writes in-place) |
| `yarn lint` | Biome lint only |
| `yarn lint:fix` | Biome lint fix only |
| `yarn format` | Prettier check only |
| `yarn format:fix` | Prettier write only |
| `yarn circular-dependencies` | Check for circular imports (madge) |
| `yarn docs` | Generate TypeDoc documentation |
| `yarn vitest run <path>` | Run tests matching a file path |
| `yarn vitest run -t <pattern>` | Run tests matching a test name |

### Pre-commit Hook

The `precommit` script runs: `build:clean → check:fix → test → circular-dependencies`

This is slow but validates everything. Pre-commit hooks auto-format code — if a hook reformats files during a commit, stage and recommit the formatting changes.

### Typecheck

```sh
yarn tsc -p tsconfig.json --noEmit
```

NEVER skip `tsc --noEmit` after code changes — typecheck is mandatory, not optional, regardless of whether `yarn test` passes.

## Code Conventions

### Formatting (Prettier)

- No semicolons
- Single quotes
- 4-space indent
- Trailing commas (es5)
- Print width: 100
- Arrow parens: avoid

### Lint (Biome)

- No enums
- `noExplicitAny: warn` — flags new `any` usage as warnings without blocking the build. Overridden to `off` in `*.spec.ts`, `__tests__/**`, `Experimental/**`, and setup files (`vitest.setup.ts`, `jest.setup.ts`). Note: Biome 2.x doesn't honor suppression comments for `warn`-level rules, so inline `biome-ignore` comments for `noExplicitAny` are not effective at this level
- `useImportType: warn` — prefer `import type` for type-only imports
- `noNonNullAssertion: warn` — avoid `!` operator
- Cognitive complexity cap: 20 (relaxed to 25–30 in specific files via overrides)

### Commit Style

Conventional Commits format:

```
type(scope): description
```

Types: `feat`, `fix`, `chore`, `docs`, `refactor`, `style`, `deprecate`, `merge`

Scopes: `schema`, `validator`, `build`, `README`, `pipeline`, `types`, etc.

### Commit Authoring

Before making any commit, the AI harness **must** clarify the commit author identity:

- **Default author**: The local then global git config of the root worktree (i.e., `git config user.name` / `git config user.email` resolved from the main repo checkout, not the ephemeral worktree) — the AI harness must ask the user to confirm the author identity before the first commit in a session, unless already specified earlier in the conversation
- **Verification step**: Before the first commit, check the resolved `user.name` and `user.email` — if they look like placeholder values (e.g., `Test`, `test@test.com`), stop and ask the user for the correct identity before committing
- **Override**: If the user explicitly requests a different author (e.g., a co-author, bot identity, or different email), use that instead — but never assume an alternate identity without explicit direction
- **GPG signing**: When the author identity is confirmed, commits should be GPG-signed (`-S` / `--gpg-sign`) with the key matching the author's email

### Branch Naming

| Pattern | Use |
|---------|-----|
| `feat/<topic>` | New features |
| `refactor/<topic>` | Refactors |
| `hotfix/<topic>` | Urgent fixes |
| `release/<version>` | Release prep |

### Branch Roles

- `master` — Default/release branch. Published to npm from here.
- `developer` — Long-running integration branch. Feature branches base off this.

## PR Workflow with Git Worktrees

This is the standard workflow for AI harness sessions producing pull requests.

### 1. Gather Context

This is a **blocking gate** — do not proceed to step 2 until all items below are resolved.

- **Base branch**: Default to `developer` for features/refactors, `master` for hotfixes/urgent fixes. If the user requests otherwise, analyze against industry standard practices and question before proceeding.
- **Related issues**: Ask the user for GitHub issue numbers, URLs, or any external references. Fetch issue details with `gh issue view <number>` or `gh issue view <url>`.
- **Scope clarification**: Confirm what the PR should accomplish. If the user provides a vague request, ask targeted questions before starting.

### 2. Create Local Worktree + Branch

Create both together — the worktree stays alive for the entire PR lifecycle:

```sh
git worktree add .worktree/<topic> -b feat/<topic> origin/<base-branch>
```

Work in the worktree (`.worktree/` prefix — local to the main repo checkout but gitignored, so it never pollutes the tracked tree or trips the pre-commit hook on unrelated paths). **The first step after creating the worktree must be `yarn install`** to set up dependencies and trigger the `prepare` script (which configures git hooks). Do not write code, run builds, or execute tests until `yarn install` completes.

### 3. Implement

- Make changes in the worktree directory
- Run `yarn check:fix` and `yarn test` after each logical change step — not just "frequently"
- Run typecheck (`yarn tsc -p tsconfig.json --noEmit`) after each structural change — not just "after structural changes"
- Commit using Conventional Commits format
- If pre-commit hooks auto-format code, commit the formatting changes separately

### 4. Push & Create PR

Push to all remotes (warn on per-remote failure but continue to others):

```sh
for remote in $(git remote); do git push -u "$remote" feat/<topic> || echo "WARNING: push to $remote failed"; done
gh pr create --base <base-branch> --title "type(scope): description" --body "..."
```

### 5. Iterate

- Keep the worktree alive for follow-up commits (rebase, conflict resolution, review feedback)
- After force-pushing a rebase, push to all remotes:

```sh
for remote in $(git remote); do git push --force-with-lease "$remote" feat/<topic> || echo "WARNING: force-push to $remote failed"; done
```

- After resolving rebase conflicts: `git add <resolved-files> && GIT_EDITOR=true git rebase --continue`
- After any push, always push to all remotes using the `for remote` loop above

### 6. Post-Merge Cleanup

Once the PR is merged, clean up everything:

```sh
# From the main repo checkout (NOT the worktree):
git worktree remove .worktree/<topic>
git fetch --prune
git branch -d feat/<topic>
for remote in $(git remote); do git push "$remote" --delete feat/<topic> || echo "WARNING: delete from $remote failed"; done
```

Restore the main repo to its original branch if needed.

## Release Pipeline

When performing a release (running `release.sh`, creating tags, drafting GitHub releases, or any release-related task), **always** follow the README update guidelines in [`workflows/release/release-readme-prompt.md`](workflows/release/release-readme-prompt.md). This file defines what belongs in `README.md` (user-facing APIs only) vs. what belongs in `CHANGELOG.md` or GitHub Release Notes (bug fixes, changelog entries, internal changes). Never add bug fix notes, per-version callouts, or internal tooling docs to the README.

## Release Assets

- **Tarball naming**: `type-utils-<tag>.tgz` or `type-utils-<tag>.tar.gz` — `<tag>` is the version without `v` prefix (e.g. `type-utils-0.8.1.tgz`). Never use the scoped package name (e.g. ~~`srhenry-type-utils-0.8.1.tgz`~~)
- **Tarball cleanup**: Remove local tarball(s) immediately after uploading to the GitHub release (`rm -f type-utils-*.tgz srhenry-type-utils-*.tgz`). Do not leave release artifacts in the working tree

## Release Automation (`workflows/`)

All scripts under `workflows/` (including `release/release.sh`, test helpers, and future additions) must follow these constraints:

- **POSIX sh only**: Shebang `#!/bin/sh`, no Bashisms, no ZSHisms, no shell-specific extensions
- **Forbidden constructs**: `[[ ]]`, `$BASH_SOURCE`, `mapfile`, `declare`, `source` (use `.`), `(( ))`, `${var//pattern/replacement}`, `${var:offset:length}`, arrays beyond positional params, `local` (use naming convention `_var` instead), `function` keyword
- **Allowed POSIX**: `[ ]` tests, `case/esac`, parameter expansion (`${var#pattern}`, `${var%pattern}`, `${var%%pattern}`, `${var:-default}`), `$(command)`, `read`, `printf`, `set -eu`, `trap`, `while/for/until`
- **Directory structure**: Each workflow tool lives in its own subdirectory (e.g. `workflows/release/`). Tests go in `workflows/<tool>/__test__/`. The global orchestrator `workflows/__test__/run-tests.sh` discovers all `workflows/**/__test__/test-*.sh` files (excluding `test-helper.sh`)
- **Testing**: All scripts must have corresponding test suites in their `__test__/` subdirectory, runnable via `workflows/__test__/run-tests.sh`
- **Test scripts themselves**: Also POSIX sh — the test framework (`test-helper.sh`) and every `test-*.sh` file must be `/bin/sh` compatible
- **External tools**: `tr`, `sed`, `sort`, `tail`, `head`, `cut`, `git`, `node` (for JSON manipulation) — assume these are available; do not depend on `jq`, `yq`, or other non-standard CLI tools

## Self-Updating Knowledge

This file is a living document. The AI harness **must** keep it current as new knowledge is discovered during sessions.

### Auto-persist criteria

Automatically write new knowledge to `AGENTS.md` only when **all three** criteria are met:

1. **Verifiable from source** — the fact can be confirmed by reading code, config, or dependency behavior (not subjective opinion)
2. **Fills a gap** — no existing rule, gotcha, or entry already covers it
3. **No behavior change** — the fact doesn't alter how the agent should act (that's propose-first territory)

If any criterion is uncertain → propose first instead.

### Section routing table

| Discovery type | Target section |
|----------------|---------------|
| Build/runtime gotcha not covered | Important Notes |
| Directory purpose not documented | Project Overview or Architecture table |
| Missing Prohibition (behavior that must never happen) | Prohibitions |
| New command or script not in table | Build & Development Commands |
| Dependency behavioral quirk | Important Notes or External References |
| Test convention or matcher | Code Conventions → Tests |
| Import/resolution pattern | Code Conventions → Import style |
| Release pipeline quirk | Release Pipeline, Release Assets, or Release Automation |

### Dedup rule

Before adding, scan existing content. Amend existing entries rather than adding parallel ones. Keeps the file tight and avoids contradiction.

### Pending proposals protocol

Unconfirmed proposals that the session ends before confirming must be persisted to `TASKS.md` as:

```markdown
- [ ] AGENTS.md: <proposed change summary>
    - **Blocked**: needs-user-confirmation
    - **Details**: <what to add/change and where>
    - **Files**: AGENTS.md
```

### Contradiction protocol

If the new knowledge **contradicts** something already in this file:

1. **Do not silently overwrite** — present the contradiction to the user
2. Explain what the current guidance says vs. what was just discovered
3. Ask the user which version is correct before updating
4. If the contradiction reveals a deeper misunderstanding, flag it explicitly

### Retract mechanism

If an auto-persisted fact is later discovered to be wrong:

```markdown
- ~~ALWAYS use X for Y — reason given~~ — retracted: <why it was wrong>
- ALWAYS use Z for Y — <correct reason>
```

### Placement

Add new knowledge to the most relevant existing section per the routing table above. If no section fits, add it to **Important Notes**. Do not create new top-level sections without user approval.

## Task Management

`TASKS.md` is the single source of truth for planned work. All AI harness sessions must follow this protocol.

### Core protocol

1. **Read first** — on session start, read `TASKS.md` to understand outstanding work
2. **Claim** — append `(@agent-name)` to the task checkbox when starting work
3. **Complete** — remove the task entirely after implementation is verified. History lives in git log — no strikethrough or "Done" markers
4. **Update as you go** — when new work is discovered during implementation, add it to `TASKS.md` before starting on it
5. **No duplication** — each planned item appears exactly once. If an item spans multiple scopes, file it under the primary scope and reference it from others

### Priority levels

| Priority | Label | Meaning |
|----------|-------|---------|
| P0 | Critical | Blocks releases or causes data loss — fix immediately |
| P1 | High | Important, should be in next release |
| P2 | Medium | Valuable, scheduled when capacity allows |
| P3 | Low | Nice-to-have, no firm timeline |

### Core metadata fields

These are always available and should be used whenever they add clarity:

- `**ID**` — stable identifier for `**Blocked by**:` references (kebab-case)
- `**Details**` — context the agent can't discover on its own
- `**Files**` — starting points for the agent to read
- `**Acceptance**` — testable criterion for "done"
- `**Blocked by**` — comma-separated task IDs; unblocked when all referenced IDs no longer exist in file
- `**Blocked**` — free-form reason for external blocks; any non-empty value marks task as blocked

### Opt-in metadata fields

The agent must evaluate whether each opt-in field fits the task. **If a task fits even one criterion, the corresponding field(s) must be populated.** A task with zero opt-in fields is fine; a task that should have had them is a violation.

| Field | Add when |
|-------|----------|
| `**Plan**` | Task touches 3+ files or involves non-obvious implementation order |
| `**Parent**` | Task was decomposed from another task that still exists in the file |
| `**Research**` + `**Last-enriched**` | Task is blocked and agent has gathered context that would otherwise be lost between sessions |
| `**Estimate**` | Task is non-trivial enough that context-budget planning matters |
| `**Verification**` | "Done" can't be verified by a single test run — e.g. manual steps, specific command sequences |
| `**Risk**` + `**Mitigation**` | Task involves migration, breaking changes, dependency swaps, or touching stable/production-critical code |
| `**Hypothesis**` + `**Success**` + `**Pivot**` + `**Measurement**` + `**Anchor**` | Performance change, architectural refactor, or any change where "did it help?" is genuinely ambiguous |
| `**Touches**` | Multiple tasks or agents may work in parallel on overlapping files |
| `**Surfaced-by**` | Task originates from an automated sweep or audit loop rather than a human request |
| `**Milestone**` | Project has phased roadmap and tasks should be filterable by milestone |

### Sub-tasks

Use nested checkboxes for decomposition within a single task. If a sub-task grows complex enough to need its own metadata, promote it to a top-level task with `**Parent**` referencing the original.

### Writing good tasks

- One line per item for the checkbox, metadata as indented sub-entries
- Include enough context to be actionable (file paths, flag names, expected behavior) but avoid prose
- `**Acceptance**` must be testable — "works" is not acceptable, "test X passes" is

## Prohibitions

- **NEVER use `npm install`** — `npm install` fails with eresolve errors in this repo. Always use `yarn install`.
- **NEVER skip `tsc --noEmit` after code changes** — typecheck is mandatory, not optional, regardless of whether `yarn test` passes.
- **NEVER commit with placeholder author identity** — stop and ask the user for correct identity before proceeding.
- **NEVER silently overwrite established AGENTS.md guidelines** — always propose first and get confirmation, even when not in doubt.
- **NEVER use `any` in production code** — Biome allows `any` in test files (`*.spec.ts`, `__tests__/`) only. Use proper types in `src/` code.
- **NEVER push YAML/JSON without validating** — after editing any `.yml`, `.yaml`, or `.json` file, run `npx prettier --check <file>` before committing. YAML is indentation-sensitive; even one-space drift silently breaks CI.
- **NEVER disable GPG commit signing** — do not use `-c commit.gpgsign=false`, `--no-gpg-sign`, or any other mechanism to bypass GPG signing. If GPG signing fails (e.g. pinentry timeout in headless sessions), stop work and wait for user input — do not work around it.
- **NEVER continue past GPG pinentry failures** — if `git commit` hangs or errors due to GPG pinentry, stop all work immediately and wait for the user to resolve or provide direction. Do not retry with signing disabled.

## Important Notes

- **`yarn` not `npm`**: `npm install` fails with eresolve errors in this repo. Always use `yarn install`. This applies to all script commands too — use `yarn run <script>` instead of `npm run <script>`.
- **Pre-commit hooks are expensive**: They run full build + lint + test + circular dependency checks. Expect 30–60 seconds per commit. The hook only runs when relevant files (`.ts`, `tsconfig*.json`, `package.json`, `yarn.lock`, `biome.json`, `.prettierrc*`, `vitest.config.*`) are staged. `git add -u` is conditional — only runs if there are staged files that may have been modified by the hook.
- **`developer` vs `master`**: Most PRs target `developer`. If `developer` is behind `master`, merge `master` into `developer` first, then rebase the feature branch.
- **Dual builds**: Changes must compile under both ESM and CJS tsconfigs. Run `yarn build` to verify. The `build:fix-declarations` step uses `scripts/fix-declarations.mjs` (Node.js ESM) to rewrite `.ts` extensions to `.js` in `.d.ts` files — this replaces the previous `sed` approach for portability.
- **No wildcard exports**: `package.json` `exports` does not include a `./*` catch-all. All subpath exports must be listed explicitly. The `"default"` condition is omitted from all export entries — `import` and `require` cover all modern consumers.
- **`.env` files are untrusted**: The release script loads `.env` via validated `export` statements (not `eval`). Variable names must match `[A-Za-z0-9_]` — invalid keys are skipped with a warning. Never store secrets in `.env` without encrypting them.
- **CI workflow**: PRs targeting `developer` and `master` run a full validation pipeline (typecheck, lint, test, circular dependencies, build) via `.github/workflows/ci.yml`. The typedoc concurrency group intentionally uses `cancel-in-progress: true` so newer deployments supersede older ones.
- **YAML is indentation-sensitive**: Prettier validates YAML structure (not just style). Always run `npx prettier --check <path>` after editing `.yml`/`.yaml` files — it catches indentation errors that visual inspection misses. `yarn run check` only covers `src/**/*.ts`, not workflow files.
