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

## P3 — Low
