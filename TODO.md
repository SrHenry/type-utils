# TODO

## Release pipeline (`workflows/release/release.sh`)

### Merge & conflict handling

- `--auto-merge` with conflict detection and resolution hints

### Output & changelog

- Changelog deduplication (merge commits vs. squash)
- Dry-run diff: show what package.json would look like after bump

### Tag & push control

- `--skip-tag` flag: skip tag creation (for CI/CD that manages tags separately)
- `--remote <name>` flag: push to specific remote only (instead of all)
- `--sign-commit` flag: GPG-sign the version bump commit

### UX & interactivity

- Interactive mode: prompt for confirmation at each step
