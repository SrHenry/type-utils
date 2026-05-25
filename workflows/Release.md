# Release Pipeline

## Overview

Releases follow the flow: **merge developer → master → update README → run `release.sh` → push to all remotes → publish draft release → CI/CD publishes to npm**. The `workflows/release.sh` script automates the mechanical steps; an optional AI harness can automate the README update; and GitHub Actions handles the npm publish.

## Release flow

```
developer branch
       │
       ▼
  merge to master (manual, --no-ff recommended)
       │
       ▼
  update README.md ─────────────────────┐
       │                                │
       │  (manual)                      │  (--auto [--strict])
       │                                │  AI harness reads
       │                                │  release-readme-prompt.md
       │                                │  + git log context
       │  ◄─────────────────────────────┘
       ▼
  workflows/release.sh <version> [flags]
       │
       ├── yarn precommit (build + lint + test + circular-deps)
       ├── (optional) AI README update via harness
       ├── bump version in package.json + commit
       ├── git tag -a v<version>
       ├── yarn build:clean
       ├── npm pack → rename tarball
       ├── generate release notes (minimal)
       ├── gh release create --draft (with tarball)
       └── git push <each remote> master v<version>
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

These are performed by a human before running `release.sh`:

1. **Merge `developer` into `master`** — `git checkout master && git merge --no-ff developer`
2. **Update README.md** — add new features, API reference entries, code examples, deprecation notices (skip this if using `--auto`)
3. **Review the draft release** on GitHub — polish release notes, add feature sections and code examples for major releases
4. **Publish the draft release** — clicking "Publish" triggers the CI/CD pipeline

## Automated steps (`release.sh`)

The script handles:

- Pre-flight validation (semver, clean tree, master branch, gh auth, remotes)
- Precommit checks (`yarn precommit`)
- AI-assisted README update (when `--auto` or `--strict-auto` is passed)
- Version bump in `package.json` + git commit
- Annotated tag creation
- Build + pack + rename tarball
- Minimal release notes generation (flat commit list with full 40-char hashes)
- Draft GitHub release creation (with tarball attached)
- Push to all configured remotes

## AI-assisted README update

The `--auto` and `--strict-auto` flags delegate README updates to an AI harness (e.g. `opencode`):

```bash
# Warn and continue if harness fails
./workflows/release.sh 0.9.0 --auto

# Abort release if harness fails
./workflows/release.sh 0.9.0 --auto --strict

# Override harness binary
./workflows/release.sh 0.9.0 --auto --harness aider
```

### How it works

1. The script reads `workflows/release-readme-prompt.md` and substitutes placeholders (`${PREV_VERSION}`, `${NEW_VERSION}`, `${COMMITS}`) with the git log since the last tag
2. It invokes the harness with the resolved prompt — the harness has full repo access and commits changes itself
3. On success: script validates the working tree is clean (harness committed its changes)
4. On failure with `--auto`: warns and continues (README can be updated manually later)
5. On failure with `--auto --strict`: aborts the release

### Harness configuration

Set in `.env` (gitignored, template in `.env.example`):

| Variable | Description | Default |
|---|---|---|
| `RELEASE_HARNESS` | Harness binary name | `opencode` |
| `RELEASE_HARNESS_MODEL` | Model identifier | `nvidia/z-ai/glm-5.1` |
| `RELEASE_HARNESS_ARGS` | Extra CLI arguments | `--dangerously-skip-permissions` |

### Prompt template

`workflows/release-readme-prompt.md` is committed to the repo and fully customizable. It contains placeholders the script resolves at runtime:

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

`type-utils-<version>.tgz` — no `v` prefix. Produced by `npm pack` + rename from `srhenry-type-utils-<version>.tgz`.

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

## Script reference

```
workflows/release.sh [<version> | --bump [major|minor|patch]] [--dry-run] [--auto] [--strict] [--harness <binary>] [-h|--help]
```

| Flag | Description |
|---|---|
| `<version>` | Semver version to release (e.g. `0.9.0`). Required unless `--bump` is used |
| `--bump [level]` | Auto-calculate version bump from current `package.json` version. Level: `major`, `minor`, or `patch` (default). Mutually exclusive with `<version>` |
| `--dry-run` | Validate and generate changelog only, no mutations |
| `--auto` | Enable AI README update; warn and continue on harness failure |
| `--strict` | Compose with `--auto` to abort release on harness failure |
| `--harness <binary>` | Override the harness binary (default: `$RELEASE_HARNESS` from `.env`) |
| `-h`, `--help` | Show usage information |
