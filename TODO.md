# TODO

## Release automation

- `--auto-merge` flag: automate developer → master merge (with `--no-ff` by default, `--ff` opt-in)
- `--skip-push` flag: perform all local steps but skip pushing to remotes
- Changelog file generation: persist `CHANGELOG.md` alongside GitHub release notes
- `--notes-template <file>` flag: override default `workflows/release-readme-prompt.md` for custom prompts
- `--skip-precommit` flag: skip precommit hook (for emergency hotfixes where tests are known-passing)
- Tarball cleanup: `--clean-tarballs` flag to remove old `type-utils-*.tgz` before packing
- Signed tags: `--gpg` flag to create GPG-signed annotated tags instead of default
