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

1. **Base branch** — which branch to target (default: `developer`)
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

- **Base branch**: Ask the user which branch to target (usually `developer`). If unspecified, default to `developer`.
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

## Important Notes

- **`yarn` not `npm`**: `npm install` fails with eresolve errors in this repo. Always use `yarn install`.
- **Pre-commit hooks are expensive**: They run full build + lint + test + circular dependency checks. Expect 30–60 seconds per commit.
- **`developer` vs `master`**: Most PRs target `developer`. If `developer` is behind `master`, merge `master` into `developer` first, then rebase the feature branch.
- **No `any` in production**: Biome allows `any` in test files only. Use proper types in `src/` (non-test) code.
- **Dual builds**: Changes must compile under both ESM and CJS tsconfigs. Run `yarn build` to verify.
