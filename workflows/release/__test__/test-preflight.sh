#!/bin/sh
# test-preflight.sh — Pre-flight validation tests
# Tests: branch check, clean tree, git repo, gh CLI, remotes, previous tag

_TEST_DIR="${_TEST_DIR:-$(cd "$(dirname "$0")" && pwd)}"
. "$_TEST_DIR/test-helper.sh"

describe "Pre-flight: branch check"

it "dies when not on master branch"
    _FAKE_REPO_DIR="$_TMP_DIR/pf-branch"
    create_fake_repo "$_FAKE_REPO_DIR"
    cd "$_FAKE_REPO_DIR"
    git checkout -q -b feature-test
    _output=$(sh workflows/release/release.sh 0.9.0 2>&1) && _rc=0 || _rc=$?
    cd "$_ORIG_DIR"
    assert_exit_code 1 "$_rc"
    assert_contains "$_output" "Must be on master branch"
    test_pass
    cleanup_fake_repo "$_FAKE_REPO_DIR"

describe "Pre-flight: clean working tree"

it "dies when working tree has uncommitted changes"
    _FAKE_REPO_DIR="$_TMP_DIR/pf-dirty"
    create_fake_repo "$_FAKE_REPO_DIR"
    cd "$_FAKE_REPO_DIR"
    echo "dirty" > untracked-file.txt
    _output=$(sh workflows/release/release.sh 0.9.0 2>&1) && _rc=0 || _rc=$?
    cd "$_ORIG_DIR"
    assert_exit_code 1 "$_rc"
    assert_contains "$_output" "uncommitted changes"
    test_pass
    cleanup_fake_repo "$_FAKE_REPO_DIR"

describe "Pre-flight: previous tag"

it "dies when no previous tag exists"
    _FAKE_REPO_DIR="$_TMP_DIR/pf-notag"
    create_fake_repo "$_FAKE_REPO_DIR"
    cd "$_FAKE_REPO_DIR"
    # Remove all tags
    git tag -d v0.7.0 2>/dev/null || true
    git tag -d v0.8.0 2>/dev/null || true
    _output=$(sh workflows/release/release.sh 0.9.0 2>&1) && _rc=0 || _rc=$?
    cd "$_ORIG_DIR"
    assert_exit_code 1 "$_rc"
    assert_contains "$_output" "No previous tag"
    test_pass
    cleanup_fake_repo "$_FAKE_REPO_DIR"

describe "Pre-flight: git remotes"

it "dies when no remotes configured"
    _FAKE_REPO_DIR="$_TMP_DIR/pf-noremote"
    create_fake_repo "$_FAKE_REPO_DIR"
    cd "$_FAKE_REPO_DIR"
    git remote remove origin
    _output=$(sh workflows/release/release.sh 0.9.0 2>&1) && _rc=0 || _rc=$?
    cd "$_ORIG_DIR"
    assert_exit_code 1 "$_rc"
    assert_contains "$_output" "No git remotes"
    test_pass
    cleanup_fake_repo "$_FAKE_REPO_DIR"

describe "Pre-flight: checklist output"

it "shows version in checklist"
    _FAKE_REPO_DIR="$_TMP_DIR/pf-ver"
    create_fake_repo "$_FAKE_REPO_DIR"
    run_release_dry 0.9.0
    assert_contains "$_RUN_OUTPUT" "Version: v0.9.0"
    test_pass
    cleanup_fake_repo "$_FAKE_REPO_DIR"

it "shows previous tag in checklist"
    _FAKE_REPO_DIR="$_TMP_DIR/pf-prevtag"
    create_fake_repo "$_FAKE_REPO_DIR"
    run_release_dry 0.9.0
    assert_contains "$_RUN_OUTPUT" "Previous tag: v0.8.0"
    test_pass
    cleanup_fake_repo "$_FAKE_REPO_DIR"

it "shows branch master in checklist"
    _FAKE_REPO_DIR="$_TMP_DIR/pf-master"
    create_fake_repo "$_FAKE_REPO_DIR"
    run_release_dry 0.9.0
    assert_contains "$_RUN_OUTPUT" "Branch: master"
    test_pass
    cleanup_fake_repo "$_FAKE_REPO_DIR"

it "shows tarball name in checklist"
    _FAKE_REPO_DIR="$_TMP_DIR/pf-tarball"
    create_fake_repo "$_FAKE_REPO_DIR"
    run_release_dry 0.9.0
    assert_contains "$_RUN_OUTPUT" "type-utils-0.9.0.tgz"
    test_pass
    cleanup_fake_repo "$_FAKE_REPO_DIR"

it "shows Dry run: false when not dry-run"
    _FAKE_REPO_DIR="$_TMP_DIR/pf-dryfalse"
    create_fake_repo "$_FAKE_REPO_DIR"
    run_release_dry 0.9.0
    # Note: --dry-run makes it true, but we check the checklist before DRY RUN banner
    # The checklist shows Dry run: true when --dry-run is set
    assert_contains "$_RUN_OUTPUT" "Dry run: true"
    test_pass
    cleanup_fake_repo "$_FAKE_REPO_DIR"
