#!/bin/sh
# test-dry-run.sh — Dry-run mode tests
# Tests: --dry-run prevents mutations, shows planned steps, output format

_TEST_DIR="${_TEST_DIR:-$(cd "$(dirname "$0")" && pwd)}"
. "$_TEST_DIR/test-helper.sh"

describe "Dry-run: no mutations"

it "does not create a git tag"
    _FAKE_REPO_DIR="$_TMP_DIR/dry-notag"
    create_fake_repo "$_FAKE_REPO_DIR"
    cd "$_FAKE_REPO_DIR"
    _tags_before=$(git tag -l | sort)
    sh workflows/release/release.sh --dry-run 0.9.0 > /dev/null 2>&1 || true
    _tags_after=$(git tag -l | sort)
    cd "$_ORIG_DIR"
    assert_equal "$_tags_before" "$_tags_after" "tags should not change in dry-run"
    test_pass
    cleanup_fake_repo "$_FAKE_REPO_DIR"

it "does not modify package.json"
    _FAKE_REPO_DIR="$_TMP_DIR/dry-nopkg"
    create_fake_repo "$_FAKE_REPO_DIR"
    cd "$_FAKE_REPO_DIR"
    _ver_before=$(node -e "console.log(require('./package.json').version)")
    sh workflows/release/release.sh --dry-run 0.9.0 > /dev/null 2>&1 || true
    _ver_after=$(node -e "console.log(require('./package.json').version)")
    cd "$_ORIG_DIR"
    assert_equal "$_ver_before" "$_ver_after" "package.json should not change in dry-run"
    test_pass
    cleanup_fake_repo "$_FAKE_REPO_DIR"

it "does not create commits"
    _FAKE_REPO_DIR="$_TMP_DIR/dry-nocommit"
    create_fake_repo "$_FAKE_REPO_DIR"
    cd "$_FAKE_REPO_DIR"
    _commits_before=$(git rev-list --count HEAD)
    sh workflows/release/release.sh --dry-run 0.9.0 > /dev/null 2>&1 || true
    _commits_after=$(git rev-list --count HEAD)
    cd "$_ORIG_DIR"
    assert_equal "$_commits_before" "$_commits_after" "no commits should be created in dry-run"
    test_pass
    cleanup_fake_repo "$_FAKE_REPO_DIR"

it "does not create tarball"
    _FAKE_REPO_DIR="$_TMP_DIR/dry-notarball"
    create_fake_repo "$_FAKE_REPO_DIR"
    cd "$_FAKE_REPO_DIR"
    rm -f type-utils-*.tgz
    sh workflows/release/release.sh --dry-run 0.9.0 > /dev/null 2>&1 || true
    _tarballs=$(ls type-utils-*.tgz 2>/dev/null) || _tarballs=""
    cd "$_ORIG_DIR"
    assert_equal "" "$_tarballs" "no tarball should be created in dry-run"
    test_pass
    cleanup_fake_repo "$_FAKE_REPO_DIR"

describe "Dry-run: output content"

it "shows DRY RUN banner"
    _FAKE_REPO_DIR="$_TMP_DIR/dry-banner"
    create_fake_repo "$_FAKE_REPO_DIR"
    run_release_dry 0.9.0
    assert_contains "$_RUN_OUTPUT" "DRY RUN"
    test_pass
    cleanup_fake_repo "$_FAKE_REPO_DIR"

it "shows planned version bump"
    _FAKE_REPO_DIR="$_TMP_DIR/dry-show-bump"
    create_fake_repo "$_FAKE_REPO_DIR"
    run_release_dry 0.9.0
    assert_contains "$_RUN_OUTPUT" "Would bump"
    assert_contains "$_RUN_OUTPUT" "0.8.0"
    assert_contains "$_RUN_OUTPUT" "0.9.0"
    test_pass
    cleanup_fake_repo "$_FAKE_REPO_DIR"

it "shows planned tag"
    _FAKE_REPO_DIR="$_TMP_DIR/dry-show-tag"
    create_fake_repo "$_FAKE_REPO_DIR"
    run_release_dry 0.9.0
    assert_contains "$_RUN_OUTPUT" "Would create"
    assert_contains "$_RUN_OUTPUT" "v0.9.0"
    test_pass
    cleanup_fake_repo "$_FAKE_REPO_DIR"

it "shows release notes preview"
    _FAKE_REPO_DIR="$_TMP_DIR/dry-notes"
    create_fake_repo "$_FAKE_REPO_DIR"
    run_release_dry 0.9.0
    assert_contains "$_RUN_OUTPUT" "What's Changed"
    assert_contains "$_RUN_OUTPUT" "Full Changelog"
    test_pass
    cleanup_fake_repo "$_FAKE_REPO_DIR"

it "shows dry run complete message"
    _FAKE_REPO_DIR="$_TMP_DIR/dry-complete"
    create_fake_repo "$_FAKE_REPO_DIR"
    run_release_dry 0.9.0
    assert_contains "$_RUN_OUTPUT" "Dry run complete"
    test_pass
    cleanup_fake_repo "$_FAKE_REPO_DIR"

it "shows dry-run true in checklist"
    _FAKE_REPO_DIR="$_TMP_DIR/dry-checklist"
    create_fake_repo "$_FAKE_REPO_DIR"
    run_release_dry 0.9.0
    assert_contains "$_RUN_OUTPUT" "Dry run: true"
    test_pass
    cleanup_fake_repo "$_FAKE_REPO_DIR"

describe "Dry-run: with flags"

it "shows skip-push in dry-run output"
    _FAKE_REPO_DIR="$_TMP_DIR/dry-skippush"
    create_fake_repo "$_FAKE_REPO_DIR"
    run_release_dry 0.9.0 --skip-push
    assert_contains "$_RUN_OUTPUT" "Skip push: true"
    test_pass
    cleanup_fake_repo "$_FAKE_REPO_DIR"

it "shows skip-precommit in dry-run output"
    _FAKE_REPO_DIR="$_TMP_DIR/dry-skippre"
    create_fake_repo "$_FAKE_REPO_DIR"
    run_release_dry 0.9.0 --skip-precommit
    assert_contains "$_RUN_OUTPUT" "Skip precommit: true"
    test_pass
    cleanup_fake_repo "$_FAKE_REPO_DIR"

it "shows GPG sign in dry-run output"
    _FAKE_REPO_DIR="$_TMP_DIR/dry-gpg"
    create_fake_repo "$_FAKE_REPO_DIR"
    run_release_dry 0.9.0 --gpg
    assert_contains "$_RUN_OUTPUT" "GPG sign: true"
    test_pass
    cleanup_fake_repo "$_FAKE_REPO_DIR"

it "shows GPG-signed tag in dry-run plan"
    _FAKE_REPO_DIR="$_TMP_DIR/dry-gpg-tag"
    create_fake_repo "$_FAKE_REPO_DIR"
    run_release_dry 0.9.0 --gpg
    assert_contains "$_RUN_OUTPUT" "GPG-signed"
    test_pass
    cleanup_fake_repo "$_FAKE_REPO_DIR"

it "shows clean tarballs in dry-run output"
    _FAKE_REPO_DIR="$_TMP_DIR/dry-clean"
    create_fake_repo "$_FAKE_REPO_DIR"
    run_release_dry 0.9.0 --clean-tarballs
    assert_contains "$_RUN_OUTPUT" "Clean tarballs: true"
    test_pass
    cleanup_fake_repo "$_FAKE_REPO_DIR"

it "shows Would clean with --clean-tarballs"
    _FAKE_REPO_DIR="$_TMP_DIR/dry-clean-msg"
    create_fake_repo "$_FAKE_REPO_DIR"
    run_release_dry 0.9.0 --clean-tarballs
    assert_contains "$_RUN_OUTPUT" "Would clean"
    test_pass
    cleanup_fake_repo "$_FAKE_REPO_DIR"

it "shows auto-merge in dry-run output"
    _FAKE_REPO_DIR="$_TMP_DIR/dry-automerge"
    create_fake_repo_with_developer "$_FAKE_REPO_DIR"
    run_release_dry 0.9.0 --auto-merge
    assert_contains "$_RUN_OUTPUT" "Auto-merge: true"
    test_pass
    cleanup_fake_repo "$_FAKE_REPO_DIR"

it "shows changelog in dry-run output"
    _FAKE_REPO_DIR="$_TMP_DIR/dry-changelog"
    create_fake_repo "$_FAKE_REPO_DIR"
    run_release_dry 0.9.0 --changelog
    assert_contains "$_RUN_OUTPUT" "Changelog: true"
    test_pass
    cleanup_fake_repo "$_FAKE_REPO_DIR"

it "shows Would append to CHANGELOG.md with --changelog"
    _FAKE_REPO_DIR="$_TMP_DIR/dry-changelog-msg"
    create_fake_repo "$_FAKE_REPO_DIR"
    run_release_dry 0.9.0 --changelog
    assert_contains "$_RUN_OUTPUT" "Would append to CHANGELOG.md"
    test_pass
    cleanup_fake_repo "$_FAKE_REPO_DIR"

it "shows notes-template in dry-run output"
    _FAKE_REPO_DIR="$_TMP_DIR/dry-template"
    create_fake_repo "$_FAKE_REPO_DIR"
    run_release_dry 0.9.0 --notes-template custom.md
    assert_contains "$_RUN_OUTPUT" "Notes template: custom.md"
    test_pass
    cleanup_fake_repo "$_FAKE_REPO_DIR"
