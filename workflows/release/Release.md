# Release Pipeline

## Overview

Releases follow the flow: **merge developer → master → update README → run `release.sh` → push to all remotes → publish draft release → CI/CD publishes to npm**. The `workflows/release.sh` script automates the mechanical steps; an optional AI harness can automate the README update; and GitHub Actions handles the npm publish.

The script is POSIX sh compatible (`#!/bin/sh`) and tested via `workflows/__test__/run-tests.sh`.

## Release flow

```
developer branch
│
▼
merge to master (manual, --no-ff recommended, or --auto-merge)
│
▼
update README.md ─────────────────────┐
│                                     │
│ (manual)                            │ (--auto [--strict])
│                                     │ AI harness reads
│                                     │ release-readme-prompt.md
│                                     │ + git log context
│ ◄───────────────────────────────────┘
▼
workflows/release.sh <version> [flags]
│
├── (optional) git merge developer (--auto-merge)
├── yarn precommit (build + lint + test + circular-deps)
│   (skippable with --skip-precommit)
├── (optional) AI README update via harness
├── bump version in package.json + commit
├── git tag -a v<version> (or -s with --gpg)
├── yarn build:clean
│   (optionally --clean-tarballs before packing)
├── npm pack → rename tarball
├── generate release notes (minimal)
│   (optionally persist to CHANGELOG.md with --changelog)
├── gh release create --draft (with tarball)
└── git push <each remote> master v<version>
    (skippable with --skip-push)
│
▼
review draft release on GitHub
│
▼
click "Publish" on draft
│
▼
.github/workflows/publish-npm.yml triggers
on release: [published]
│
├── yarn install --frozen-lockfile
├── yarn build:clean
├── yarn test
├── yarn circular-dependencies
└── npm publish --provenance (OIDC, no NPM_TOKEN needed)
│
▼
package live on npm
```

## Manual steps

These are performed by a human before running `release.sh` (or automated via flags):

1. **Merge `developer` into `master`** — `git checkout master && git merge --no-ff developer` (or use `--auto-merge`)
2. **Update README.md** — add new features, API reference entries, code examples, deprecation notices (skip this if using `--auto`)
3. **Review the draft release** on GitHub — polish release notes, add feature sections and code examples for major releases
4. **Publish the draft release** — clicking "Publish" triggers the CI/CD pipeline

## Automated steps (`release.sh`)

The script handles:

- Pre-flight validation (semver, clean tree, master branch, gh auth, remotes)
- Auto-merge `developer` into `master` (with `--auto-merge`, `--no-ff` by default)
- Precommit checks (`yarn precommit`, skippable with `--skip-precommit`)
- AI-assisted README update (when `--auto` is passed, optionally with `--strict`)
- Version bump in `package.json` + git commit
- Annotated tag creation (GPG-signed with `--gpg`)
- Build + pack + rename tarball (clean old tarballs with `--clean-tarballs`)
- Minimal release notes generation (flat commit list with full 40-char hashes)
- Changelog persistence to `CHANGELOG.md` (with `--changelog`)
- Draft GitHub release creation (with tarball attached)
- Push to all configured remotes (skippable with `--skip-push`)

## AI-assisted README update

The `--auto` and `--auto --strict` flags delegate README updates to an AI harness (e.g. `opencode`):

```bash
# Warn and continue if harness fails
./workflows/release.sh 0.9.0 --auto

# Abort release if harness fails
./workflows/release.sh 0.9.0 --auto --strict

# Override harness executable
./workflows/release.sh 0.9.0 --auto --harness aider

# Use custom prompt template
./workflows/release.sh 0.9.0 --auto --notes-template my-prompt.md
```

### How it works

1. The script reads `workflows/release-readme-prompt.md` (or custom template via `--notes-template`) and substitutes placeholders (`${PREV_VERSION}`, `${NEW_VERSION}`, `${COMMITS}`) with the git log since the last tag
2. It invokes the harness with the resolved prompt — the harness has full repo access and commits changes itself
3. On success: script validates the working tree is clean (harness committed its changes)
4. On failure with `--auto`: warns and continues (README can be updated manually later)
5. On failure with `--auto --strict`: aborts the release

### Harness configuration

Set in `.env` (gitignored, template in `.env.example`):

| Variable | Description | Default |
|---|---|---|
| `RELEASE_HARNESS` | Harness executable name | `opencode` |
| `RELEASE_HARNESS_MODEL` | Model identifier | `nvidia/z-ai/glm-5.1` |
| `RELEASE_HARNESS_ARGS` | Extra CLI arguments | `--dangerously-skip-permissions` |

### Prompt template

`workflows/release-readme-prompt.md` is committed to the repo and fully customizable. Override with `--notes-template <file>`. It contains placeholders the script resolves at runtime:

- `${PREV_VERSION}` — previous tag (e.g. `v0.8.0`)
- `${NEW_VERSION}` — new version (e.g. `v0.9.0`)
- `${COMMITS}` — flat list of commit subjects + hashes since previous tag

## CI/CD flow

`.github/workflows/publish-npm.yml` triggers on `release: [published]`:

1. Checkout + Node.js 24 + Yarn 1.x
2. `yarn install --frozen-lockfile`
3. `yarn build:clean`
4. `yarn test`
5. `yarn circular-dependencies`
6. `npm publish --provenance` — uses OIDC, no `NPM_TOKEN` secret required

The draft release must be manually published on GitHub to trigger this pipeline.

## Version policy

- Semver: `MAJOR.MINOR.PATCH`
- Pre-1.0 (`0.x.x`): minor = new features (possibly breaking), patch = bug fixes
- Post-1.0: standard semver semantics (MAJOR = breaking, MINOR = feature, PATCH = fix)

## Tarball naming

`type-utils-<tag>.tgz` or `type-utils-<tag>.tar.gz` — `<tag>` is the version without `v` prefix (e.g. `type-utils-0.8.1.tgz`). Never use the scoped package name (e.g. ~~`srhenry-type-utils-0.8.1.tgz`~~). Produced by `npm pack` + rename from `srhenry-type-utils-<version>.tgz`. Local tarball(s) must be removed immediately after uploading to the GitHub release (`rm -f type-utils-*.tgz srhenry-type-utils-*.tgz`).

## Release notes format

The script generates **minimal** release notes — a flat list of non-merge commits with full 40-character commit hashes:

```markdown
## What's Changed

- feat(schema): add Schema.bigint a1b2c3d4e5f6...
- fix(rules): handle edge case in Number.max g7h8i9j0k1l2...
- docs: update README for v0.9.0 m3n4o5p6q7r8...

**Full Changelog**: https://github.com/SrHenry/type-utils/compare/v0.8.0...v0.9.0
```

Full 40-char hashes are used because GitHub renders them as auto-links in plain text. For **major releases**, manually enrich the draft with feature sections, code examples, and migration notes before publishing.

### Changelog persistence

With `--changelog`, release notes are also appended to `CHANGELOG.md` in the project root:

```bash
./workflows/release.sh 0.9.0 --changelog
```

This is useful for repos that maintain a persistent changelog file alongside GitHub releases.

## Troubleshooting

### Tag already exists

Delete the tag locally and on all remotes, then re-run:

```bash
git tag -d v<version>
for remote in $(git remote); do git push "$remote" :refs/tags/v<version>; done
```

### Draft release needs editing

```bash
gh release edit v<version> --notes-file updated-notes.md
```

### CI/CD publish failed

Check the Actions tab on GitHub. Fix the issue, delete the draft release, delete the tag, and re-run `release.sh`.

### Need to rollback a published release

```bash
# Within 72 hours of publish
npm unpublish @srhenry/type-utils@<version>

# Delete the GitHub release and tag
gh release delete v<version> --yes
git tag -d v<version>
for remote in $(git remote); do git push "$remote" :refs/tags/v<version>; done
```

### Harness failures

- `--auto`: script warns and continues. Update README manually, commit, and re-run
- `--strict`: script aborts. Fix the harness issue (check `.env` config, model availability, API keys) and re-run
- Harness left uncommitted changes: script auto-resets (`git checkout -- .` + `git clean -fd`)

### Working tree not clean

Commit or stash your changes before running `release.sh`. The script requires a clean tree for reproducibility.

### Auto-merge conflicts

If `--auto-merge` fails due to merge conflicts:

1. Resolve conflicts manually on `master`
2. Commit the merge
3. Re-run `release.sh` (without `--auto-merge` since the merge is done)

## Script reference

```
workflows/release.sh [<version> | --bump [major|minor|patch]] [options]
```

| Flag | Description |
|---|---|
| `<version>` | Semver version to release (e.g. `0.9.0`). Required unless `--bump` is used |
| `--bump [level]` | Auto-calculate version bump from current `package.json` version. Level: `major`, `minor`, or `patch` (default). Mutually exclusive with `<version>` |
| `--rc [<number>]` | Append `-rc.<number>` to `<version>` (e.g. `0.9.0-rc.2`). Requires `<version>`. Number omitted: auto-calculate from existing tags (next rc number, or 1 if none) |
| `--beta [<number>]` | Append `-beta[.<number>]` to `<version>` (e.g. `0.9.0-beta`, `0.9.0-beta.2`). Requires `<version>`. Number omitted: auto-calculate from existing tags (next beta number, or bare `-beta` if none) |
| `--alpha [<number>]` | Append `-alpha[.<number>]` to `<version>` (e.g. `0.9.0-alpha`, `0.9.0-alpha.2`). Requires `<version>`. Number omitted: auto-calculate from existing tags (next alpha number, or bare `-alpha` if none) |
| `--auto-merge` | Merge `developer` into `master` before release (`--no-ff` by default, `--ff` to opt-in to fast-forward) |
| `--ff` | Compose with `--auto-merge` to use fast-forward merge instead of `--no-ff` |
| `--skip-push` | Perform all local steps but skip pushing to remotes |
| `--skip-precommit` | Skip precommit hook (for emergency hotfixes where tests are known-passing) |
| `--clean-tarballs` | Remove old `type-utils-*.tgz` files before packing |
| `--gpg` | Create GPG-signed annotated tags (`git tag -s`) instead of default (`git tag -a`) |
| `--changelog` | Persist release notes to `CHANGELOG.md` alongside GitHub release |
| `--notes-template <f>` | Override default prompt template (`workflows/release-readme-prompt.md`) for custom prompts |
| `--dry-run` | Validate and generate changelog only, no mutations |
| `--auto` | Enable AI README update; warn and continue on harness failure |
| `--strict` | Compose with `--auto` to abort release on harness failure |
| `--harness <exec>` | Override the harness executable (default: `$RELEASE_HARNESS` from `.env`) |
| `-h`, `--help` | Show usage information |

### Prerelease flag behavior

- `--rc`, `--beta`, and `--alpha` are mutually exclusive with each other and with `--bump`
- All three require an explicit `<version>` argument (the base semver core, e.g. `0.9.0`)
- When `<number>` is omitted, the script scans existing git tags to find the highest prerelease number for that version+type and increments it
- `--rc` always starts at `1` when no prior tags exist (e.g. `0.9.0-rc.1`)
- `--beta` and `--alpha` use a bare suffix when no prior tags exist (e.g. `0.9.0-beta`, `0.9.0-alpha`), then number sequentially on subsequent runs (e.g. `0.9.0-beta.2`)
- If a bare prerelease tag exists (e.g. `v0.9.0-beta`), the next run auto-increments to `.2` (e.g. `0.9.0-beta.2`)
- Examples:
```bash
# First alpha for 0.9.0 → 0.9.0-alpha
./workflows/release.sh 0.9.0 --alpha

# Second alpha (auto-detected) → 0.9.0-alpha.2
./workflows/release.sh 0.9.0 --alpha

# Explicit beta number → 0.9.0-beta.5
./workflows/release.sh 0.9.0 --beta 5

# First rc for 0.9.0 → 0.9.0-rc.1
./workflows/release.sh 0.9.0 --rc

# Second rc (auto-detected) → 0.9.0-rc.2
./workflows/release.sh 0.9.0 --rc
```

### Flag composition examples

```bash
# Full automation: merge, auto README, strict harness
./workflows/release.sh 0.9.0 --auto-merge --auto --strict

# Emergency hotfix: skip precommit, skip push
./workflows/release.sh 0.8.1 --skip-precommit --skip-push

# GPG-signed release with changelog and clean tarballs
./workflows/release.sh 1.0.0 --gpg --changelog --clean-tarballs

# Prerelease with auto-merge and custom prompt
./workflows/release.sh 0.9.0 --rc --auto-merge --auto --notes-template rc-prompt.md

# Dry-run with all flags to preview
./workflows/release.sh 0.9.0 --dry-run --auto-merge --auto --gpg --changelog
```

## Test suite

All `workflows/` scripts are tested in `workflows/__test__/`:

```bash
# Run all tests
./workflows/__test__/run-tests.sh

# Run specific test file
./workflows/__test__/run-tests.sh test-args.sh
```

Test files are POSIX sh compatible (`#!/bin/sh`) and use a custom test framework (`test-helper.sh`) with assertions for equality, containment, exit codes, and file existence.
