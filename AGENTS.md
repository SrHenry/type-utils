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

1. **Base branch** — which branch to target:
   - `developer` for features, refactors, and non-urgent changes (default)
   - `master` for hotfixes and urgent production fixes
   - If the user requests a different base, analyze the case against industry standard practices (e.g., main/master for hotfixes, integration branch for features) and question the user before proceeding
2. **Related issues** — GitHub issue numbers, URLs, or external references (or explicitly "none")
3. **Scope delimited** — what's included, what's excluded, expected behavior for edge cases
4. **User confirms** — restate understanding and get explicit go-ahead before proceeding

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
| `yarn build:clean` | Clean + build (`npm run clear` then `yarn build`) |
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

### Pre-commit Hook

The `precommit` script runs: `build:clean → check:fix → test → circular-dependencies`

This is slow but validates everything. Pre-commit hooks auto-format code — if a hook reformats files during a commit, stage and recommit the formatting changes.

### Typecheck

```sh
yarn tsc -p tsconfig.json --noEmit
```

Always run this after code changes to verify type correctness.

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
- No `any` in production code (allowed in `*.spec.ts` and `__tests__/`)
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

### 2. Create Ephemeral Worktree + Branch

Create both together — the worktree stays alive for the entire PR lifecycle:

```sh
git worktree add /tmp/<repo-name>-<topic> -b feat/<topic> origin/<base-branch>
```

Work in the worktree (`/tmp/` prefix — ephemeral, not inside the main repo checkout). Run `yarn install` inside the worktree after creation.

### 3. Implement

- Make changes in the worktree directory
- Run `yarn check:fix` and `yarn test` frequently to stay green
- Run typecheck (`yarn tsc -p tsconfig.json --noEmit`) after structural changes
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
git worktree remove /tmp/<repo-name>-<topic>
git fetch --prune
git branch -d feat/<topic>
for remote in $(git remote); do git push "$remote" --delete feat/<topic> || echo "WARNING: delete from $remote failed"; done
```

Restore the main repo to its original branch if needed.

## Release Automation (`workflows/`)

All scripts under `workflows/` (including `release/release.sh`, test helpers, and future additions) must follow these constraints:

- **POSIX sh only**: Shebang `#!/bin/sh`, no Bashisms, no ZSHisms, no shell-specific extensions
- **Forbidden constructs**: `[[ ]]`, `$BASH_SOURCE`, `mapfile`, `declare`, `source` (use `.`), `(( ))`, `${var//pattern/replacement}`, `${var:offset:length}`, arrays beyond positional params, `local` (use naming convention `_var` instead), `function` keyword
- **Allowed POSIX**: `[ ]` tests, `case/esac`, parameter expansion (`${var#pattern}`, `${var%pattern}`, `${var%%pattern}`, `${var:-default}`), `$(command)`, `read`, `printf`, `set -eu`, `trap`, `while/for/until`
- **Directory structure**: Each workflow tool lives in its own subdirectory (e.g. `workflows/release/`). Tests go in `workflows/<tool>/__test__/`. The global orchestrator `workflows/__test__/run-tests.sh` discovers all `workflows/**/__test__/test-*.sh` files (excluding `test-helper.sh`)
- **Testing**: All scripts must have corresponding test suites in their `__test__/` subdirectory, runnable via `workflows/__test__/run-tests.sh`
- **Test scripts themselves**: Also POSIX sh — the test framework (`test-helper.sh`) and every `test-*.sh` file must be `/bin/sh` compatible
- **External tools**: `tr`, `sed`, `sort`, `tail`, `head`, `cut`, `git`, `node` (for JSON manipulation) — assume these are available; do not depend on `jq`, `yq`, or other non-standard CLI tools

## TODO.md Handling

`TODO.md` is the single source of truth for planned work. All AI harness sessions must follow these rules:

1. **Read first**: At session start, read `TODO.md` to understand outstanding work
2. **No done items**: Never keep completed items in `TODO.md`. Remove them immediately after implementation is verified. Strikethrough + "Done" markers are forbidden — just delete the line
3. **Scope-structured**: Organize items by scope (e.g. component, module, subsystem), not by status. Use `###` subheadings to group related items
4. **Update as you go**: When new work is discovered during implementation, add it to `TODO.md` under the appropriate scope before starting on it
5. **No duplication**: Each planned item appears exactly once. If an item spans multiple scopes, file it under the primary scope and reference it from others
6. **Concise entries**: One line per item. Include enough context to be actionable (flag names, file paths, expected behavior) but avoid prose

## Important Notes

- **`yarn` not `npm`**: `npm install` fails with eresolve errors in this repo. Always use `yarn install`.
- **Pre-commit hooks are expensive**: They run full build + lint + test + circular dependency checks. Expect 30–60 seconds per commit.
- **`developer` vs `master`**: Most PRs target `developer`. If `developer` is behind `master`, merge `master` into `developer` first, then rebase the feature branch.
- **No `any` in production**: Biome allows `any` in test files only. Use proper types in `src/` (non-test) code.
- **Dual builds**: Changes must compile under both ESM and CJS tsconfigs. Run `yarn build` to verify.
